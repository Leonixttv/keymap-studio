"use strict";

const backedFeatures=["encoder","combo","tap","override","repeat"];

function backupStatus(message,error=false) {
  $("backupStatus").textContent=message;
  $("backupStatus").dataset.error=String(error);
}

function backupIdentity(board) {
  return { uid:board.uid, protocol:board.protocol, rows:board.rows, cols:board.cols, layers:board.layers,
    lighting:board.lighting, encoderIds:board.encoderIds };
}

function downloadBackup(snapshot, suffix="") {
  const blob=new Blob([JSON.stringify(snapshot,null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob);
  const anchor=make("a");
  anchor.download="keymap-"+snapshot.device.uid+suffix+"-backup.json";
  anchor.href=url;
  anchor.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}

async function captureBackup(link,board) {
  const map=await readMap(link,board);
  const layout=board.labels.length ? view(await link.request([2,2],[2,2])).getUint32(2) : null;
  const macros=board.macroCount ? await readMacroBuffer(link) : null;
  const settings=await readSettings(link);
  const light=board.lighting ? await readDeviceLight(link,board) : null;
  const features={};
  for (const key of backedFeatures) {
    features[key]=[];
    for(let slot=0;slot<featureCount(key);slot++) features[key].push(await readDynamic(link,key,slot));
  }
  return {format:"keymap-studio-backup",version:1,device:backupIdentity(board),name:board.name,map,layout,
    macros:macros?.macros.map(value=>Array.from(value)) ?? null, settings,light,features};
}

function validateBackup(file,current,board) {
  const number=(value,max,min=0)=>Number.isInteger(value) && value>=min && value<=max;
  const array=(value,reference,max=65535,min=0)=>Array.isArray(value) && value.length===reference.length &&
    value.every(entry=>number(entry,max,min));
  const fail=()=>{throw Error("Backup incompatibile con la tastiera collegata oppure file non valido.");};
  if(!file || file.format!=="keymap-studio-backup" || file.version!==1 ||
    !file.device || Object.entries(current.device).some(([key,value])=>!sameFeature(value,file.device[key])) ||
    !array(file.map,current.map)) fail();
  if(current.layout===null ? file.layout!==null : !number(file.layout,0xffffffff) || !activeKeys(board,file.layout).length) fail();
  if(current.macros===null ? file.macros!==null : !Array.isArray(file.macros) || file.macros.length!==current.macros.length ||
    file.macros.some(part=>!Array.isArray(part) || !part.every(byte=>number(byte,255,1)))) fail();
  if(current.light===null ? file.light!==null : !array(file.light,current.light) ||
    file.light[0]>(board.lighting==="vialrgb" ? 65535:255) || file.light.slice(1).some(value=>value>255)) fail();
  if(!file.settings || Object.keys(file.settings).length!==Object.keys(current.settings).length ||
    Object.keys(current.settings).some(id=>{
      const spec=qmkSettings.find(([candidate])=>candidate===Number(id));
      return !Object.hasOwn(file.settings,id) || !number(file.settings[id],2**(8*spec[1])-1);
    })) fail();
  if(!file.features) fail();
  for(const key of backedFeatures) {
    const entries=file.features[key];
    if(!Array.isArray(entries) || entries.length!==current.features[key].length ||
      entries.some(entry=>!array(entry,dynamicShape(key)) || entry.some((value,i)=>value>=2**(8*dynamicShape(key)[i])))) fail();
  }
}

async function applyBackup(link,board,file,current) {
  let phase="mappa tasti";
  try {
    backupStatus("Scrittura "+phase+"…");
    for (let i=0;i<file.map.length;i++) {
      if(file.map[i]!==current.map[i]) {
        await writeKey(link,board,i,file.map[i],current.map[i]);
      }
    }
    phase="layout fisico";
    if(file.layout!==null && file.layout!==current.layout) await writeLayoutOptions(link,file.layout);
    for (const key of backedFeatures) {
      phase=featureSpecs[key].title;
      backupStatus("Scrittura "+phase+"…");
      for(let slot=0;slot<file.features[key].length;slot++) {
        if(!sameFeature(file.features[key][slot],current.features[key][slot])) {
          await saveDynamic(link,key,slot,file.features[key][slot],current.features[key][slot]);
        }
      }
    }
    phase="impostazioni QMK";
    backupStatus("Scrittura "+phase+"…");
    for(const [id,width] of qmkSettings) {
      if(!Object.hasOwn(file.settings,id) || file.settings[id]===current.settings[id]) continue;
      const bytes=sequence(width,i=>(file.settings[id]>>>(8*i))&255);
      await link.request([VIAL,11,id&255,id>>8,...bytes],[0]);
      const verify=await link.request([VIAL,10,id&255,id>>8],[0]);
      if(bytes.some((byte,i)=>verify[i+1]!==byte)) throw Error("Il valore "+id+" non è stato confermato.");
    }
    phase="illuminazione";
    if(file.light && !sameFeature(file.light,current.light)) await writeLight(link,board,file.light);
    phase="macro";
    if(file.macros && !sameFeature(file.macros,current.macros)) {
      const {size,macros}=await readMacroBuffer(link);
      if(!sameFeature(macros.map(value=>Array.from(value)),current.macros)) throw Error("Le macro sono cambiate nel frattempo.");
      await writeMacroBank(link,size,macros,file.macros,backupStatus,$("cancelBackupUnlock"));
    }
  } catch (error) {
    throw Error("Ripristino interrotto durante "+phase+". "+error.message+
      " Le sezioni già scritte possono essere cambiate. Conserva il backup precedente.");
  }
}

function syncBackup() {
  const online=!!state.link?.device.opened;
  $("saveBackup").disabled=!online || state.working;
  $("restoreBackup").disabled=!online || state.working || !!state.board.readOnly;
  $("backupSummary").textContent=online
    ? "Include mappa salvata, layout, macro, illuminazione, manopole e impostazioni supportate. Il ripristino richiede un firmware compatibile."
    : "Collega una tastiera compatibile per usare il backup.";
}

$("saveBackup").onclick=async ()=>{
  if(!state.link || state.working) return;
  state.working=true;
  render();
  try {
    backupStatus("Lettura della tastiera…");
    downloadBackup(await captureBackup(state.link,state.board));
    backupStatus("Backup completo esportato.");
  } catch(error) {
    backupStatus(error.message,true);
  } finally { state.working=false; render(); }
};

$("restoreBackup").onclick=()=>$("backupFile").click();
$("cancelBackupUnlock").onclick=()=>{cancelUnlock=true;};
$("backupFile").onchange=async ()=>{
  const [selected]=$("backupFile").files;
  $("backupFile").value="";
  const {link,board}=state;
  if(!selected || !link?.device.opened || state.working) return;
  state.working=true;
  render();
  try {
    if(selected.size>2*1024*1024) throw Error("Il file di backup è troppo grande.");
    const file=JSON.parse(await selected.text());
    backupStatus("Verifica della tastiera e del file…");
    const current=await captureBackup(link,board);
    validateBackup(file,current,board);
    if(file.macros) {
      const capacity=view(await link.request([13],[13])).getUint16(1);
      if(file.macros.reduce((size,bytes)=>size+bytes.length+1,0)>capacity) throw Error("Spazio insufficiente per le macro del backup.");
    }
    if(!confirm("Ripristinare il backup salvato in «"+selected.name+"»? Verrà scaricata una copia della configurazione attuale."+
      (changed().length ? " Le modifiche alla mappa in sospeso verranno sostituite." : ""))) {
      return backupStatus("Ripristino annullato.");
    }
    downloadBackup(current,"-prima-del-ripristino");
    try {
      await applyBackup(link,board,file,current);
      backupStatus("Backup ripristinato e verificato.");
    } finally {
      if(link.device.opened) {
        try {
          const options=board.labels.length ? view(await link.request([2,2],[2,2])).getUint32(2) : board.options;
          const map=await readMap(link,board);
          resetMap({...board,options},map,link);
          await loadLight();
        } catch {}
      }
    }
  } catch(error) {
    backupStatus(error.message,true);
  } finally {state.working=false;render();}
};

document.addEventListener("studio-state",syncBackup);
syncBackup();
