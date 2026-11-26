"use strict";

const featureSpecs = {
  macro: { title:"Macro", help:"Crea una sequenza di testo, tasti e attese. Poi assegna lo slot dalla mappa." },
  combo: { title:"Combinazione", help:"Premi insieme almeno due tasti per ottenere una sola azione.",
    cmd:3, keys:["Primo tasto","Secondo tasto","Terzo tasto (facoltativo)","Quarto tasto (facoltativo)","Azione"] },
  tap: { title:"Tap dance", help:"Scegli azioni diverse per pressione, pressione prolungata e doppia pressione. Poi assegna lo slot dalla mappa.",
    cmd:1, keys:["Pressione singola","Tieni premuto","Doppia pressione","Premi e tieni premuto","Tempo massimo (ms)"] },
  settings: { title:"Impostazioni QMK", help:"Regola i tempi e il comportamento dei tasti. Vengono mostrate le impostazioni riconosciute dal firmware." },
  encoder: { title:"Manopola", help:"Assegna un’azione per ogni direzione della manopola, su ciascun layer.", keys:["Senso orario","Senso antiorario"] },
  override: { title:"Sostituzione", help:"Produci un tasto diverso quando premi il tasto di partenza con i modificatori scelti.",
    cmd:5, keys:["Tasto di partenza","Tasto risultante","Layer (maschera)","Modificatori richiesti","Modificatori esclusi","Modificatori da sopprimere","Attiva"] },
  repeat: { title:"Ripetizione alternativa", help:"Personalizza il tasto prodotto quando usi la ripetizione alternativa.",
    cmd:7, keys:["Tasto precedente","Tasto risultante","Modificatori","Opzioni"] },
};
const memoryDemo = { combo:new Map(), tap:new Map(), override:new Map(), repeat:new Map(), macro:new Map(), encoder:new Map() };
let featureBoard, featureKey, featureSlot = 0, featureValue = null, originalValue = null, cancelUnlock = false;

const qmkSettings = [
  [7,2,"Tempo per distinguere pressione e tenuta (ms)",10000],
  [25,2,"Tempo per la ripetizione rapida (ms)",10000],
  [2,2,"Finestra per le combinazioni (ms)",10000],
  [4,2,"Attesa per la maiuscola automatica (ms)",1000],
  [5,1,"Pressioni per bloccare un modificatore one-shot",50],
  [6,2,"Durata del modificatore one-shot (ms)",60000],
  [18,2,"Durata della pressione inviata (ms)",1000],
  [19,2,"Durata della pressione di Bloc Maiusc (ms)",1000],
  [20,1,"Pressioni per attivare un layer",100],
  [22,1,"Considera tenuto il tasto quando ne premi e rilasci un altro"],
  [23,1,"Considera tenuto il tasto alla pressione di un altro"],
  [24,1,"Usa la pressione breve se nessun altro tasto è stato premuto"],
  [26,1,"Distingui le combinazioni in base alla mano"],
  [27,2,"Finestra per digitazione rapida (Flow Tap, ms)",10000],
  [3,1,"Maiuscola automatica",["Attiva","Anche per i modificatori","Escludi tasti speciali","Escludi numeri",
    "Escludi lettere","Consenti ripetizione","Ferma ripetizione oltre il limite"]],
  [1,1,"Invia Esc quando è premuto",["Alt","Ctrl","Win","Shift"]],
  [8,1,"Comportamento di pressione e tenuta",["Tenuta permissiva","Ignora interruzioni mod-tap",
    "Forza tenuta","Retro tapping"]],
  [21,4,"Modifiche globali ai tasti",["Scambia Bloc Maiusc e Ctrl Sx","Usa Bloc Maiusc come Ctrl","Scambia Alt e Win Sx",
    "Scambia Alt e Win Dx","Disattiva i tasti Win","Scambia accento grave ed Esc","Scambia backslash e Backspace",
    "Rileva pressioni simultanee (NKRO)","Scambia Ctrl e Win Sx","Scambia Ctrl e Win Dx"]],
  [9,2,"Attesa iniziale per il movimento del mouse (ms)",10000],
  [10,2,"Intervallo tra movimenti del mouse (ms)",10000],
  [11,2,"Dimensione del passo del mouse",1000],
  [12,2,"Velocità massima del mouse",1000],
  [13,2,"Tempo prima della velocità massima del mouse",1000],
  [14,2,"Attesa iniziale per lo scorrimento (ms)",10000],
  [15,2,"Intervallo tra eventi di scorrimento",10000],
  [16,2,"Numero massimo di passi di scorrimento",1000],
  [17,2,"Tempo prima della velocità massima di scorrimento",1000],
];
let demoSettings = {7:200,25:175,2:50,21:128,22:0};

async function readSettings(link) {
  if(state.board.kind==="via") return {};
  const data = {};
  let cursor=0;
  const ids=new Set();
  for(let page=0;page<64;page++) {
    const reply=await link.request([VIAL,9,cursor&255,cursor>>8]);
    let next=cursor;
    for(let i=0;i<32;i+=2) {
      const id=view(reply).getUint16(i,true);
      if(id===65535) break;
      if(id>cursor) ids.add(id);
      next=Math.max(next,id);
    }
    if(next===cursor) break;
    cursor=next;
  }
  for(const [id,width] of qmkSettings) {
    if(!ids.has(id)) continue;
    const reply=view(await link.request([VIAL,10,id&255,id>>8],[0]));
    data[id]=width===4 ? reply.getUint32(1,true) : width===2 ? reply.getUint16(1,true) : reply.getUint8(1);
  }
  return data;
}

function featureStatus(message, error = false) {
  $("featureStatus").textContent = message;
  $("featureStatus").dataset.error = String(error);
}

function featureCount(key) {
  if (key === "settings") return 1;
  if (key === "encoder") return state.board.layers*state.board.encoderIds.length;
  if (key === "macro") return state.board.macroCount;
  return state.board[key] || 0;
}

function featureDefault(key) {
  if (key === "macro") return [];
  if (key === "encoder") return [169,170];
  return key === "tap" ? [0,0,0,0,200] : key === "override" ? [0,0,65535,0,0,0,0]
    : key === "repeat" ? [0,0,0,0] : [0,0,0,0,0];
}

function dynamicShape(key) {
  if (key === "encoder") return [2,2];
  if (key === "override") return [2,2,2,1,1,1,1];
  if (key === "repeat") return [2,2,1,1];
  return [2,2,2,2,2];
}

async function readDynamic(link,key,slot) {
  if (key === "encoder") {
    const {layer,id}=encoderAddress(slot);
    if(state.board.kind==="via") {
      const read=async clockwise=>{
        const cmd=[0x14,layer,id,clockwise];
        return view(await link.request(cmd,cmd)).getUint16(4);
      };
      return [await read(1),await read(0)];
    }
    const reply=view(await link.request([VIAL,3,layer,id]));
    if (reply.getUint16(0)===0xfe03 && reply.getUint16(2)===(layer<<8|id)) {
      throw Error("Il firmware non ha risposto per questa manopola.");
    }
    return [reply.getUint16(0),reply.getUint16(2)];
  }
  const packet = await link.request([VIAL,0x0d,featureSpecs[key].cmd,slot],[0]);
  let offset=1;
  return dynamicShape(key).map(size => {
    const value = size === 1 ? packet[offset] : view(packet).getUint16(offset,true);
    offset += size;
    return value;
  });
}

function sameFeature(a,b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function encoderAddress(slot) {
  const ids=state.board.encoderIds;
  return {layer:Math.floor(slot/ids.length),id:ids[slot%ids.length]};
}

async function saveDynamic(link,key,slot,values,expected=originalValue) {
  const baseline = await readDynamic(link,key,slot);
  if (!sameFeature(baseline,expected)) throw Error("Lo slot è cambiato. Riaprilo prima di salvare.");
  if (sameFeature(baseline,values)) return;
  if (key==="encoder") {
    const {layer,id}=encoderAddress(slot);
    for (const [direction,code] of values.entries()) {
      if (code!==baseline[direction]) {
        if(state.board.kind==="via") {
          const cmd=[0x15,layer,id,1-direction,...word(code)];
          await link.request(cmd,cmd);
        } else await link.request([VIAL,4,layer,id,direction,...word(code)]);
      }
    }
  } else {
    const bytes = dynamicShape(key).flatMap((size,i) => size === 1 ? [values[i]] : [values[i]&255,values[i]>>8]);
    await link.request([VIAL,0x0d,featureSpecs[key].cmd+1,slot,...bytes],[0]);
  }
  if (!sameFeature(await readDynamic(link,key,slot),values)) throw Error("Il firmware non ha confermato le modifiche.");
}

function decodeMacro(bytes) {
  const list = [];
  for (let i=0; i<bytes.length;) {
    if (bytes[i] !== 1) {
      let end = i+1;
      while (end<bytes.length && bytes[end]!==1) end++;
      list.push({kind:"text",value:new TextDecoder("utf-8",{fatal:true}).decode(bytes.slice(i,end))});
      i = end;
      continue;
    }
    const op=bytes[i+1];
    if (op>=1 && op<=3 && i+2<bytes.length) {
      list.push({kind:["","tap","down","up"][op],value:bytes[i+2]}); i+=3;
    } else if (op===4 && i+3<bytes.length) {
      list.push({kind:"wait",value:bytes[i+2]-1+(bytes[i+3]-1)*255}); i+=4;
    } else if (op>=5 && op<=7 && i+3<bytes.length) {
      let code=bytes[i+2]+bytes[i+3]*256;
      if (code>0xff00) code=(code&255)<<8;
      list.push({kind:["tap","down","up"][op-5],value:code}); i+=4;
    } else {
      throw Error("Questa macro contiene un formato che Keymap Studio non può modificare.");
    }
  }
  return list;
}

function encodeMacro(steps) {
  return steps.flatMap(({kind,value}) => {
    if (kind==="text") {
      if (/[^\x20-\x7e\n\t]/.test(value) || value.includes("\n") || value.includes("\t")) {
        throw Error("Per il testo usa caratteri ASCII stampabili. Per Invio e Tab aggiungi un tasto.");
      }
      return [...new TextEncoder().encode(value)];
    }
    if (kind==="wait") {
      if (!Number.isInteger(value) || value<1 || value>65024) throw Error("L’attesa deve essere da 1 a 65024 ms.");
      return [1,4,value%255+1,Math.floor(value/255)+1];
    }
    const op = {tap:1,down:2,up:3}[kind];
    if (!Number.isInteger(value) || value<2 || value>=0xff00) throw Error("Scegli un tasto valido per ogni passaggio.");
    if (value<256) return [1,op,value];
    if (state.board.kind==="via") throw Error("Per questa macro VIA scegli un tasto standard con codice fino a 0x00FF.");
    const word = value&255 ? value : 0xff00|(value>>8);
    return [1,op+4,word&255,word>>8];
  });
}

async function readMacroBuffer(link) {
  const size = view(await link.request([13],[13])).getUint16(1);
  if (!size || size<state.board.macroCount) throw Error("Memoria macro non disponibile.");
  const data = new Uint8Array(size);
  let end=0, terminators=0;
  for (let offset=0; offset<size && terminators<state.board.macroCount; offset+=28) {
    const count = Math.min(28,size-offset), cmd=[14,...word(offset),count];
    const chunk=(await link.request(cmd,cmd)).subarray(4,4+count);
    data.set(chunk,offset);
    for (const value of chunk) {
      end++;
      if (value===0 && ++terminators===state.board.macroCount) break;
    }
  }
  if (terminators<state.board.macroCount) throw Error("La memoria macro non contiene tutti gli slot.");
  const macros=[];
  let start=0;
  for(let i=0;i<end;i++) {
    if(data[i]===0) { macros.push(data.slice(start,i)); start=i+1; }
  }
  return {size,macros};
}

async function withUnlock(link, action, statusMessage=featureStatus, cancelButton=$("cancelUnlock")) {
  if (state.board.kind==="via") return action();
  const status=await link.request([VIAL,5]);
  if (status[0]===1) return action();
  if (status[0]!==0) throw Error("Risposta inattesa durante lo sblocco Vial.");
  const keys=[];
  for(let i=2;i<32 && status[i]!==255 && status[i+1]!==255;i+=2) {
    const key=state.board.keys.find(k => k.row===status[i] && k.col===status[i+1]);
    keys.push(key ? labelOf(state.saved[key.row*state.board.cols+key.col])+" ("+key.row+","+key.col+")"
      : "matrice "+status[i]+","+status[i+1]);
  }
  if(!keys.length) throw Error("Il firmware non ha indicato i tasti di sblocco.");
  let done=false;
  cancelUnlock=false;
  cancelButton.hidden=false;
  try {
    await link.request([VIAL,6]);
    const limit=Date.now()+30000;
    while(!cancelUnlock && Date.now()<limit) {
      const reply=await link.request([VIAL,7]);
      if(reply[0]===1) { done=true; break; }
      statusMessage("Tieni premuti "+keys.join(" e ")+" per sbloccare la tastiera.");
      await new Promise(resolve => setTimeout(resolve,125));
    }
    if (!done) throw Error((cancelUnlock ? "Sblocco annullato." : "Tempo scaduto.") +
      " Scollega e ricollega il cavo USB prima di riprovare.");
    return await action();
  } finally {
    cancelButton.hidden=true;
    await link.request([VIAL,8]).catch(() => {});
  }
}

async function saveMacro(link,slot,steps) {
  const encoded=encodeMacro(steps);
  const {size,macros}=await readMacroBuffer(link);
  if (!sameFeature(decodeMacro(macros[slot]),originalValue)) throw Error("Lo slot è cambiato. Riaprilo prima di salvare.");
  const before=macros.slice();
  macros[slot]=encoded;
  await writeMacroBank(link,size,before,macros);
}

async function writeMacroBank(link,size,oldMacros,newMacros,notify=featureStatus, cancelButton=$("cancelUnlock")) {
  const before=oldMacros.flatMap(bytes=>[...bytes,0]);
  const after=newMacros.flatMap(bytes=>[...bytes,0]);
  if(after.length>size) throw Error("Memoria insufficiente. Servono "+after.length+" byte; disponibili "+size+".");
  if(sameFeature(before,after)) return;
  await withUnlock(link,async () => {
    const write=(offset,bytes) => {
      const header=[15,...word(offset),bytes.length];
      return link.request([...header,...bytes],header);
    };
    const verify=async expected => sameFeature((await readMacroBuffer(link)).macros.flatMap(bytes=>[...bytes,0]),expected);
    const writeBody=async bytes => {
      for(let offset=0;offset<Math.min(size-1,bytes.length);offset+=28) {
        await write(offset,bytes.slice(offset,Math.min(offset+28,size-1)));
      }
    };
    const guard=[14,...word(size-1),1];
    await write(size-1,[255]);
    if((await link.request(guard,guard))[4]!==255) throw Error("Il firmware non consente di scrivere le macro.");
    try {
      await writeBody(after);
      await write(size-1,[0]);
      if(!await verify(after)) throw Error("Verifica della macro fallita.");
    } catch(error) {
      try {
        await write(size-1,[255]);
        await writeBody(before);
        await write(size-1,[0]);
        if(!await verify(before)) throw Error("Verifica del ripristino fallita.");
      } catch {
        throw Error("Scrittura interrotta. Ricollega la tastiera e verifica le macro prima di usarle.");
      }
      throw error;
    }
  },notify,cancelButton);
}

function dropdown(options, selected, change) {
  const select=make("select");
  for(const [value,label] of options) {
    const option=make("option",label);
    option.value=value;
    select.append(option);
  }
  select.value=selected;
  select.onchange=() => change(select.value);
  return select;
}

function keyPicker(value,change) {
  const choices=Object.values(catalog(state.board)).flat();
  if (!choices.some(([code])=>code===value)) choices.unshift([value,hex(value)+" · Tasto attuale"]);
  choices.push(["custom","Inserisci codice QMK…"]);
  const group=make("div");
  const manual=make("input");
  manual.placeholder="0x0004";
  manual.maxLength=6;
  manual.setAttribute("aria-label","Codice QMK");
  manual.hidden=true;
  const choose=dropdown(choices,value,selected=>{
    manual.hidden=selected!=="custom";
    if(manual.hidden) change(Number(selected));
    else { change(NaN); manual.focus(); }
  });
  manual.oninput=() => {
    const valid=/^0x[0-9a-f]{1,4}$/i.test(manual.value);
    manual.setAttribute("aria-invalid",String(!valid));
    change(valid ? Number(manual.value) : NaN);
  };
  group.append(choose,manual);
  return group;
}

function numberField(value,min,max,change) {
  const input=make("input");
  input.type="number";
  input.min=min;
  input.max=max;
  input.value=value;
  input.oninput=()=>change(input.valueAsNumber);
  return input;
}

function pairField(label, control) {
  const row=make("div",undefined,"feature-field");
  row.append(make("span",label),control);
  const focus=control.matches("select,input") ? control : control.querySelector("select,input");
  if(focus) focus.setAttribute("aria-label",label);
  return row;
}

function checkMask(names,mask,change) {
  const list=make("div",undefined,"mask-options");
  names.forEach((name,i)=>{
    const label=make("label"), input=make("input");
    input.type="checkbox";
    input.checked=!!(mask&(1<<i));
    input.onchange=()=>{
      mask=input.checked ? mask|(1<<i) : mask&~(1<<i);
      change(mask);
    };
    label.append(input,document.createTextNode(name));
    list.append(label);
  });
  return list;
}

function renderFeatureEditor() {
  const controls=$("featureControls"), count=featureCount(featureKey);
  controls.replaceChildren();
  $("featureHelp").textContent=featureSpecs[featureKey].help;
  $("saveFeature").disabled=state.working || !featureValue;
  $("saveFeature").textContent=state.link ? "Salva sulla tastiera" : "Salva nella demo";
  if (!count) {
    controls.append(make("p","Questa funzione non è disponibile sul firmware collegato."));
    return;
  }
  if (featureKey!=="settings") {
    controls.append(pairField(featureKey==="encoder" ? "Manopola e layer" : "Slot",dropdown(sequence(count,i=>{
      if(featureKey==="encoder") {
        const {layer,id}=encoderAddress(i);
        return [i,"Manopola "+(id+1)+" · Layer "+layer];
      }
      return [i,featureSpecs[featureKey].title+" "+(i+1)];
    }),
      featureSlot,slot=>void openFeature(Number(slot)))));
  }
  if (!featureValue) return;
  const update=(i,value)=>{ featureValue[i]=value; };
  const modifiers=["Ctrl Sx","Shift Sx","Alt Sx","Win Sx","Ctrl Dx","Shift Dx","Alt Dx","Win Dx"];
  if (featureKey==="settings") {
    if(!Object.keys(featureValue).length) controls.append(make("p","Il firmware non espone impostazioni QMK compatibili."));
    $("saveFeature").disabled=state.working || !Object.keys(featureValue).length;
    for(const [id,,label,limits] of qmkSettings) {
      if(!Object.hasOwn(featureValue,id)) continue;
      const value=featureValue[id];
      const control=Array.isArray(limits) ? checkMask(limits,value,v=>update(id,v))
        : typeof limits==="number" ? numberField(value,0,limits,v=>update(id,v))
        : dropdown([[0,"Disattivo"],[1,"Attivo"]],value,v=>update(id,Number(v)));
      controls.append(pairField(label,control));
    }
  } else if (featureKey==="macro") {
    const types=[["text","Testo"],["tap","Premi tasto"],["down","Tieni premuto"],["up","Rilascia"],["wait","Attendi (ms)"]];
    featureValue.forEach((step,i)=>{
      const row=make("div",undefined,"macro-step");
      const kind=dropdown(types,step.kind, selected=>{
        featureValue[i]={kind:selected,value:selected==="text"?"":selected==="wait"?200:4};
        renderFeatureEditor();
        controls.querySelectorAll(".macro-step")[i]?.querySelector("select")?.focus();
      });
      kind.setAttribute("aria-label","Tipo del passaggio "+(i+1));
      let input;
      if(step.kind==="text") {
        input=make("input");
        input.value=step.value;
        input.placeholder="Testo da digitare";
        input.oninput=()=>{ step.value=input.value; };
      } else if(step.kind==="wait") {
        input=numberField(step.value,1,65024,value=>{step.value=value;});
      } else {
        input=keyPicker(step.value,value=>{step.value=value;});
      }
      (input.matches("input") ? input : input.querySelector("select")).setAttribute("aria-label","Valore del passaggio "+(i+1));
      const remove=make("button","Rimuovi");
      remove.setAttribute("aria-label","Rimuovi passaggio "+(i+1));
      remove.onclick=()=>{featureValue.splice(i,1);renderFeatureEditor();};
      row.append(kind,input,remove);
      controls.append(row);
    });
    const add=make("button","Aggiungi passaggio");
    add.onclick=()=>{
      featureValue.push({kind:"text",value:""});
      renderFeatureEditor();
      Array.from(controls.querySelectorAll(".macro-step")).at(-1)?.querySelector("input")?.focus();
    };
    controls.append(add);
  } else {
    featureSpecs[featureKey].keys.forEach((label,i)=>{
      let input;
      if(featureKey==="tap" && i===4) input=numberField(featureValue[i],0,65535,v=>update(i,v));
      else if(featureKey==="override" && i===2) {
        label="Layer attivi";
        input=checkMask(sequence(Math.min(16,state.board.layers),n=>"L"+n),featureValue[i],v=>update(i,v));
      } else if(featureKey==="override" && i>=3 && i<=5 || featureKey==="repeat" && i===2) {
        input=checkMask(modifiers,featureValue[i],v=>update(i,v));
      } else if(featureKey==="override" && i===6) {
        label="Attivazione e comportamento";
        input=checkMask(["Alla pressione","Con modificatore","Al rilascio del modificatore escluso","Basta un modificatore",
          "Non ripetere il tasto iniziale","Mantieni su altri tasti","Riservato","Regola attiva"],
          featureValue[i],v=>update(i,v));
        input.children[6].hidden=true;
      } else if(featureKey==="repeat" && i===3) {
        input=checkMask(["Predefinito","In entrambe le direzioni","Ignora destra/sinistra","Regola attiva"],
          featureValue[i],v=>update(i,v));
      } else input=keyPicker(featureValue[i],v=>update(i,v));
      controls.append(pairField(label,input));
    });
  }
  controls.querySelectorAll("button,select,input").forEach(element=>{element.disabled=state.working;});
}

function changeWorking(working) {
  state.working=working;
  if ($("advanced").hidden) render();
  else {
    render();
    $("feature").disabled=working;
    $("featureControls").querySelectorAll("button,select,input").forEach(e=>{e.disabled=working;});
    $("saveFeature").disabled=working || !featureValue;
  }
}

async function openFeature(slot=0) {
  if (state.working) return;
  if (featureValue && !sameFeature(featureValue,originalValue) &&
    !confirm("Scartare le modifiche non salvate di questa funzione?")) {
    $("feature").value=featureKey;
    renderFeatureEditor();
    return;
  }
  featureKey=$("feature").value;
  featureSlot=slot;
  featureBoard=state.board;
  featureValue=originalValue=null;
  featureStatus("");
  renderFeatureEditor();
  if(!featureCount(featureKey)) return;
  const link=state.link;
  changeWorking(true);
  try {
    if(featureKey==="settings") {
      featureValue=link ? await readSettings(link) : structuredClone(demoSettings);
    } else if(!link) {
      featureValue=structuredClone(memoryDemo[featureKey]?.get(slot) ?? featureDefault(featureKey));
    } else if(featureKey==="macro") {
      featureValue=decodeMacro((await readMacroBuffer(link)).macros[slot]);
    } else featureValue=await readDynamic(link,featureKey,slot);
    originalValue=structuredClone(featureValue);
  } catch(error) {
    featureStatus(error.message,true);
  } finally {
    changeWorking(false);
    renderFeatureEditor();
  }
}

$("feature").onchange=()=>void openFeature();
$("openEncoder").onclick=()=>{
  if (state.working || !state.board.encoderIds.length) return;
  $("feature").value="encoder";
  void openFeature(state.layer * state.board.encoderIds.length);
  document.querySelector('[data-tab="advanced"]').click();
};
$("cancelUnlock").onclick=()=>{cancelUnlock=true;};
$("saveFeature").onclick=async()=>{
  if(!featureValue || state.working) return;
  const key=featureKey, slot=featureSlot, copy=structuredClone(featureValue), link=state.link;
  changeWorking(true);
  try {
    if(key==="settings") {
      const changes=qmkSettings.filter(([id])=>Object.hasOwn(copy,id) && copy[id]!==originalValue[id]);
      for(const [id,,label,limit] of changes) {
        if(!Number.isInteger(copy[id]) || copy[id]<0 || (typeof limit==="number" && copy[id]>limit)) {
          throw Error("Controlla il valore di «"+label+"».");
        }
      }
      if(link && changes.length) {
        const current=await readSettings(link);
        if(changes.some(([id])=>current[id]!==originalValue[id])) throw Error("Le impostazioni sono cambiate. Riapri la scheda.");
        for(const [id,width] of changes) {
          const bytes=sequence(width,i=>(copy[id]>>>(8*i))&255);
          await link.request([VIAL,11,id&255,id>>8,...bytes],[0]);
          const result=await link.request([VIAL,10,id&255,id>>8],[0]);
          if(bytes.some((byte,i)=>result[i+1]!==byte)) throw Error("Impostazione "+id+" non confermata dal firmware.");
          originalValue[id]=copy[id];
        }
      } else if(!link) demoSettings=copy;
    }
    else if(key==="macro") {
      encodeMacro(copy);
      if(link) await saveMacro(link,slot,copy);
      else memoryDemo.macro.set(slot,copy);
    } else {
      if(copy.some((v,i)=>!Number.isInteger(v)||v<0||v>2**(8*dynamicShape(key)[i])-1)) {
        throw Error("Controlla i valori e i codici tasto prima di salvare.");
      }
      if(key==="combo" && copy[4] && (copy.slice(0,4).filter(n=>n>1).length<2 ||
        new Set(copy.slice(0,4).filter(n=>n>1)).size !== copy.slice(0,4).filter(n=>n>1).length)) {
        throw Error("Una combinazione richiede almeno due tasti diversi.");
      }
      if(link) await saveDynamic(link,key,slot,copy);
      else memoryDemo[key].set(slot,copy);
    }
    originalValue=structuredClone(copy);
    featureStatus(link ? "Salvato e verificato sulla tastiera." : "Salvato nella demo.");
  } catch(error) {
    featureStatus(error.message,true);
  } finally {
    changeWorking(false);
    renderFeatureEditor();
  }
};

document.addEventListener("studio-state",()=>{
  if (featureBoard === state.board) return;
  featureValue=originalValue=null;
  featureBoard=null;
  if (!$("advanced").hidden && !state.working) void openFeature();
});
document.addEventListener("studio-tab",()=>{
  if (!$("advanced").hidden && featureBoard!==state.board) void openFeature();
});
