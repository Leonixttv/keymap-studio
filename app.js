"use strict";

const $ = (id) => document.getElementById(id);
const sequence = (length, fn) => Array.from({ length }, (_, i) => fn(i));
const basic = [
  ...sequence(26, (i) => [4+i, String.fromCharCode(65+i)]),
  ...sequence(10, (i) => [30+i, String((i+1)%10)]),
  [40,"Invio"],[41,"Esc"],[42,"Backspace"],[43,"Tab"],[44,"Spazio"],
  [45,"-"],[46,"="],[47,"["],[48,"]"],[49,"\\"],[50,"# (ISO)"],[51,";"],[52,"'"],
  [53,"Grave"],[54,","],[55,"."],[56,"/"],[57,"Caps Lock"],[100,"ISO < >"],
  ...sequence(12, (i) => [58+i, "F"+(i+1)]),
  [70,"Stamp"],[71,"Bloc Scorr"],[72,"Pausa"],[73,"Ins"],[74,"Home"],[75,"Pg↑"],
  [76,"Canc"],[77,"End"],[78,"Pg↓"],[79,"→"],[80,"←"],[81,"↓"],[82,"↑"],
  [101,"Menu"],[224,"Ctrl Sx"],[225,"Shift Sx"],[226,"Alt Sx"],[227,"Win Sx"],
  [228,"Ctrl Dx"],[229,"Shift Dx"],[230,"Alt Gr"],[231,"Win Dx"],
];
function modernKeycodes(board) {
  return board.protocol === 6 || board.kind === "via";
}

function fnKeycode(board, layer) {
  return (modernKeycodes(board) ? 0x5220 : 0x5100)+layer;
}

function catalog(board) {
  const modern = modernKeycodes(board);
  const media = [[168,"Muto"],[169,"Volume +"],[170,"Volume −"],[171,"Traccia dopo"],[172,"Traccia prima"],[174,"Play/Pausa"]];
  return {
    "Tasti standard": basic.map(([code,label]) => [code,localizedLegend(code)?.main ?? label]),
    "Multimedia": media,
    "Layer": [
      ...sequence(board.layers, (i) => [fnKeycode(board,i), "Fn → L"+i+" · Tieni premuto (MO)"]),
      ...sequence(board.layers, (i) => [(modern ? 0x5260 : 0x5300)+i, "TG("+i+") · Attiva / disattiva"]),
    ],
    "Speciali": [[0,"Disabilitato"],[1,"Trasparente"],
      ...sequence(board.tap ?? 0, (i) => [0x5700+i, "Tap dance "+(i+1)]),
      ...(modern && board.repeat ? [[0x7c79,"Ripeti tasto"],[0x7c7a,"Ripetizione alternativa"]] : []),
      ...sequence(board.macroCount, (i) => [(modern ? 0x7700 : 0x5f12)+i, "Macro "+(i+1)]),
      ...board.custom.map((item, i) => [(modern ? 0x7e00 : 0x5f80)+i, item.title ?? item.name ?? "Personalizzato "+(i+1)])],
  };
}

function demoBoard() {
  const rows = 5, cols = 15, layers = 4;
  const lines = [
    [41,30,31,32,33,34,35,36,37,38,39,45,46,[42,2]],
    [[43,1.5],20,26,8,21,23,28,24,12,18,19,47,48,[49,1.5]],
    [[57,1.75],4,22,7,9,10,11,13,14,15,51,52,[40,2.25]],
    [[225,2.25],29,27,6,25,5,17,16,54,55,56,[229,2.75]],
    [[224,1.25],[227,1.25],[226,1.25],[44,6.25],[230,1.25],[231,1.25],[0x5221,1.25],[228,1.25]],
  ];
  const map = new Array(rows*cols*layers).fill(1);
  const keys = lines.flatMap((line, row) => {
    let x = 0;
    return line.map((entry, col) => {
      const [code, width] = Array.isArray(entry) ? entry : [entry,1];
      map[row*cols+col] = code;
      const key = { row, col, x, y: row, width, height:1, angle:0, rx:0, ry:0,
        x2:0, y2:0, w2:width, h2:1, option:null };
      x += width;
      return key;
    });
  });
  return { rows, cols, layers, keys, options:0, labels:[], custom:[], protocol:6, macroCount:0,
    uid:"demo-ansi60", name:"Demo 60% ANSI", map };
}

const demo = { ...demoBoard(), encoderIds:[0], macroCount:4, combo:4, tap:4, override:4, repeat:4 };
const demoBackspace = demo.keys.find(key => key.row === 0 && key.col === 13);
demoBackspace.option = [0,0];
demo.keys.push({ ...demoBackspace, width:1, w2:1, option:[0,1] },
  { ...demoBackspace, col:14, x:demoBackspace.x+1, width:1, w2:1, option:[0,1] });
const demoAnsi = demo.keys.filter(key => (key.row===1 && key.col===13) ||
  (key.row===2 && key.col===12) || (key.row===3 && key.col===0));
for (const key of demoAnsi) key.option=[1,0];
const [ansiSlash, ansiEnter, ansiShift] = demoAnsi;
demo.keys.push(
  { ...ansiEnter, x:ansiSlash.x, y:1, width:1.5, w2:1.25, x2:0.25, y2:1, option:[1,1] },
  { ...ansiSlash, row:2, col:13, x:ansiEnter.x, y:2, width:1, w2:1, option:[1,1] },
  { ...ansiShift, width:1.25, w2:1.25, option:[1,1] },
  { ...ansiShift, col:12, x:1.25, width:1, w2:1, option:[1,1] });
demo.map[2*demo.cols+13]=50;
demo.map[3*demo.cols+12]=100;
const demoSpace = demo.keys.find(key=>key.row===4 && key.col===3);
demoSpace.option=[2,0];
demo.keys.push(
  { ...demoSpace, width:2.25, w2:2.25, option:[2,1] },
  { ...demoSpace, col:8, x:demoSpace.x+2.25, width:1, w2:1, option:[2,1] },
  { ...demoSpace, col:9, x:demoSpace.x+3.25, width:3, w2:3, option:[2,1] });
demo.map[4*demo.cols+8]=0x5221;
demo.map[4*demo.cols+9]=44;
demo.labels = [["Backspace","Intero","Diviso"],["Invio e Shift sinistro","ANSI","ISO"],["Barra spaziatrice","Intera","Divisa"]];
demo.map[14] = 76;
const state = { board:demo, link:null, saved:[...demo.map], draft:[...demo.map], layer:0,
  selected:null, working:false, tab:"map", light:null, fnLayer:1 };
let viaDefinition=null;
const changed = () => state.draft.reduce((list, code, i) => {
  if (code !== state.saved[i]) list.push(i);
  return list;
}, []);
const indexOf = (key) => state.board.cols * (state.layer * state.board.rows + key.row) + key.col;
const make = (tag, text, className) => {
  const el = document.createElement(tag);
  if (text !== undefined) el.textContent = text;
  if (className) el.className = className;
  return el;
};
const setStatus = (text, error = false) => {
  $("status").textContent = text;
  $("status").dataset.error = String(error);
};

function labelOf(code) {
  const named = Object.values(catalog(state.board)).flat().find(([n]) => n === code);
  return named ? named[1].split(" · ")[0] : hex(code);
}

function renderKeys(host = $("keyboard"), keys = activeKeys(state.board), highlighting = null) {
  const preview = highlighting !== null;
  if (!keys.length) {
    host.replaceChildren(make("p","Questa variante non mostra tasti nella definizione del firmware."));
    return;
  }
  const corners = keys.flatMap((k) => {
    const a = k.angle * Math.PI / 180;
    return [[0,0,k.width,k.height],[k.x2,k.y2,k.w2,k.h2]].flatMap(([x,y,w,h]) =>
      [[x,y],[x+w,y],[x,y+h],[x+w,y+h]].map(([dx,dy]) => {
        const xx = k.x + dx - k.rx, yy = k.y + dy - k.ry;
        return [k.rx + xx*Math.cos(a)-yy*Math.sin(a), k.ry + xx*Math.sin(a)+yy*Math.cos(a)];
      }));
  });
  const left = Math.min(...corners.map(([x]) => x));
  const top = Math.min(...corners.map(([,y]) => y));
  const width = Math.max(...corners.map(([x]) => x))-left;
  const height = Math.max(...corners.map(([,y]) => y))-top;
  const deck = make("div", undefined, "deck");
  deck.style.aspectRatio = width + "/" + height;
  const xp = (v) => (v/width*100)+"%";
  const yp = (v) => (v/height*100)+"%";
  for (const key of keys) {
    const i = preview ? key.row*state.board.cols+key.col : indexOf(key), code = state.draft[i];
    const name = labelOf(code);
    const button = make(preview ? "div" : "button", undefined, "key");
    const a = key.angle*Math.PI/180, x = key.x-key.rx, y = key.y-key.ry;
    Object.assign(button.style, {
      left:"calc("+xp(key.rx+x*Math.cos(a)-y*Math.sin(a)-left)+" + 3px)",
      top:"calc("+yp(key.ry+x*Math.sin(a)+y*Math.cos(a)-top)+" + 3px)",
      width:"calc("+xp(key.width)+" - 6px)", height:"calc("+yp(key.height)+" - 6px)",
      transform:"rotate("+key.angle+"deg)",
    });
    if (key.x2 || key.y2 || key.w2 !== key.width || key.h2 !== key.height) {
      const subcap = make("span", undefined, "subcap");
      Object.assign(subcap.style, { left:key.x2/key.width*100+"%", top:key.y2/key.height*100+"%",
        width:key.w2/key.width*100+"%", height:key.h2/key.height*100+"%" });
      button.append(subcap);
    }
    const legend = make("span", undefined, "legend");
    legend.append(make("span", name, "legend-main"));
    const shifted = localizedLegend(code)?.shift;
    if (shifted && shifted !== name) {
      legend.append(make("span", shifted, "legend-shift"));
      button.dataset.shift = "";
    }
    button.append(make("span", undefined, "cap"), legend);
    button.setAttribute("aria-label", name+" · "+key.row+","+key.col);
    button.title = name+(shifted && shifted !== name ? " · Shift "+shifted : "")+" · "+hex(code);
    if (key.width > 1 || code > 255) button.dataset.special = "";
    if (preview) {
      button.setAttribute("role","img");
      if (highlighting.has(key)) button.dataset.layoutChanged="";
    } else {
      button.setAttribute("aria-pressed", String(state.selected === key));
      if (code !== state.saved[i]) button.dataset.changed = "";
      button.disabled = state.working;
      button.addEventListener("click", (event) => {
        state.selected = key;
        render();
        if (event.detail === 0) $("keycode").focus();
        else $("keyboard").querySelector('[aria-pressed="true"]')?.focus({preventScroll:true});
      });
    }
    deck.append(button);
  }
  host.replaceChildren(deck);
}

function render() {
  const online = !!state.link?.device.opened;
  $("boardTitle").textContent = state.link ? state.board.name || state.link.device.productName || "Tastiera USB" : "Tastiere custom";
  $("device").textContent = online ? state.board.name || state.link.device.productName
    : state.link ? "USB scollegato" : "Modalità demo";
  $("device").classList.toggle("online", online);
  $("connect").textContent = online ? "Scollega" : state.link ? "Torna alla demo" : "Collega via USB";
  $("subtitle").textContent = state.link ? "Firmware "+(state.board.kind==="via"?"VIA":"Vial")+" · protocollo "+state.board.protocol
    : viaDefinition ? "Definizione VIA pronta · "+viaDefinition.name : "Esplora la mappa demo o collega la tua tastiera.";
  $("layers").replaceChildren(...sequence(state.board.layers, (i) => {
    const button = make("button", "L"+i);
    button.setAttribute("aria-label", "Layer "+i);
    button.setAttribute("aria-pressed", String(state.layer === i));
    button.disabled = state.working;
    button.addEventListener("click", () => { state.layer = i; render(); $("layers").children[i].focus(); });
    return button;
  }));
  renderKeys();
  const code = state.selected ? state.draft[indexOf(state.selected)] : null;
  $("selection").textContent = code === null ? "Nessun tasto selezionato" : labelOf(code)+" · "+hex(code);
  const select = $("keycode");
  const placeholder = make("option", "Scegli una funzione");
  placeholder.value = "";
  select.replaceChildren(placeholder);
  for (const [name, codes] of Object.entries(catalog(state.board))) {
    const group = make("optgroup");
    group.label = name;
    for (const [value, label] of codes) {
      const option = make("option", label);
      option.value = value;
      group.append(option);
    }
    select.append(group);
  }
  select.value = [...select.options].some((o) => o.value === String(code)) ? String(code) : "";
  $("raw").value = code === null ? "" : hex(code);
  for (const id of ["keycode","assign","assignRaw","raw"]) $(id).disabled = state.working || code === null;
  const fnLayer = $("fnLayer");
  fnLayer.replaceChildren(...sequence(state.board.layers,(i)=>{
    const option=make("option","Layer "+i);
    option.value=i;
    return option;
  }));
  const existingFn = code === null ? -1 : code-fnKeycode(state.board,0);
  fnLayer.value=existingFn>=0 && existingFn<state.board.layers
    ? existingFn : Math.min(state.fnLayer,state.board.layers-1);
  fnLayer.disabled=$("assignFn").disabled=state.working || code===null || state.board.layers<2;
  $("fnHelp").textContent=state.board.layers<2
    ? "Il firmware espone un solo layer."
    : "Tieni premuto per usare il layer scelto. Rilascia per tornare al layer precedente.";
  const count = changed().length;
  $("dirty").textContent = count ? count+(count === 1 ? " modifica da applicare" : " modifiche da applicare")
    : "Nessuna modifica in sospeso";
  $("apply").textContent = state.link ? "Scrivi sulla tastiera" : "Applica alla demo";
  $("discard").disabled = !count || state.working;
  $("apply").disabled = !count || state.working || (!!state.link && !online);
  for (const id of ["connect","export","import"]) $(id).disabled = state.working;
  $("viaDefinition").disabled=state.working || !!state.link;
  const lightAvailable = state.board === demo || (online && !!state.light);
  for (const id of ["effect","color","colorHex","brightness","speed","applyRgb"]) $(id).disabled = !lightAvailable || state.working;
  document.querySelectorAll("#swatches button").forEach(button => { button.disabled = !lightAvailable || state.working; });
  document.dispatchEvent(new Event("studio-state"));
}

function resetMap(board, map, link) {
  Object.assign(state, { board, link, saved:[...map], draft:[...map], layer:0, selected:null, light:null, fnLayer:1 });
}

function assign(code) {
  if (!state.selected || state.working) return;
  state.draft[indexOf(state.selected)] = code;
  render();
  setStatus("Assegnato "+labelOf(code)+".");
}
$("assign").onclick = () => {
  if ($("keycode").value !== "") assign(Number($("keycode").value));
};
$("assignFn").onclick = () => {
  const target=Number($("fnLayer").value);
  if (state.board.layers<2 || !Number.isInteger(target) || target<0 || target>=state.board.layers) return;
  state.fnLayer=target;
  assign(fnKeycode(state.board,target));
};
$("assignRaw").onclick = () => {
  const input = $("raw").value.trim();
  if (!/^0x[0-9a-f]{1,4}$/i.test(input)) return setStatus("Inserisci un codice da 0x0000 a 0xFFFF.", true);
  assign(Number(input));
};
$("discard").onclick = () => {
  state.draft = [...state.saved];
  render();
  setStatus("Modifiche in sospeso annullate.");
};
$("apply").onclick = async () => {
  const pending = changed(), link = state.link;
  if (!pending.length) return;
  state.working = true;
  render();
  let count = 0;
  try {
    for (const i of pending) {
      if (link) await writeKey(link, state.board, i, state.draft[i], state.saved[i]);
      state.saved[i] = state.draft[i];
      count++;
    }
    setStatus(link ? "Mappa scritta e verificata via USB." : "Mappa demo aggiornata.");
  } catch (error) {
    setStatus(count+" modifiche verificate. "+error.message, true);
  } finally {
    state.working = false;
    render();
  }
};

$("connect").onclick = async () => {
  if (changed().length && !confirm("Scartare le modifiche in sospeso?")) return;
  if (!navigator.hid) return setStatus("Interfaccia USB non disponibile. Riavvia Keymap Studio.", true);
  state.working = true;
  render();
  let device;
  try {
    if (state.link) {
      if (state.link.device.opened) await state.link.device.close();
      resetMap(demo, demo.map, null);
      await loadLight();
      setStatus("Tastiera scollegata.");
      return;
    }
    [device] = await navigator.hid.requestDevice({ filters:[{ usagePage:0xff60, usage:0x61 }] });
    if (!device) return setStatus("Nessuna tastiera selezionata. Verifica il cavo USB e il firmware Vial.", true);
    await device.open();
    setStatus("Lettura della tastiera…");
    const link = new HidTransport(device);
    const hasDefinition=viaDefinition && device.vendorId===Number(viaDefinition.vendorId) && device.productId===Number(viaDefinition.productId);
    const board = hasDefinition ? await loadViaBoard(link,viaDefinition) : await loadBoard(link);
    const map = await readMap(link, board);
    if (!activeKeys(board).length) throw Error("La configurazione del layout non contiene tasti attivi.");
    resetMap(board, map, link);
    await loadLight();
    setStatus("Mappa letta dalla tastiera.");
  } catch (error) {
    if (device?.opened) await device.close().catch(() => {});
    setStatus(error.message, true);
  } finally {
    state.working = false;
    render();
  }
};

$("viaDefinition").onclick=()=>$("viaFile").click();
$("viaFile").onchange=async()=>{
  const [file]=$("viaFile").files;
  $("viaFile").value="";
  if (!file || state.working || state.link) return;
  try {
    if(file.size>1024*1024) throw Error("La definizione VIA è troppo grande.");
    const definition=JSON.parse(await file.text());
    if(state.working || state.link) throw Error("Scollega la tastiera prima di caricare una definizione.");
    if(typeof definition?.name!=="string" ||
      !["vendorId","productId"].every(id=>/^0x[0-9a-f]{1,4}$/i.test(definition[id]))) {
      throw Error("Usa il JSON VIA del produttore, con nome e ID USB.");
    }
    parseDefinition(definition,"via");
    viaDefinition=definition;
    render();
    setStatus("Definizione VIA caricata. Collega la tastiera corrispondente.");
  } catch(error) {setStatus(error.message,true);}
};

navigator.hid?.addEventListener("disconnect", (event) => {
  if (event.device === state.link?.device) {
    setStatus("USB scollegato. Esporta la bozza se vuoi conservarla prima di ricollegare.", true);
    render();
  }
});

$("export").onclick = () => {
  const { uid, rows, cols, layers, protocol, name, options } = state.board;
  const data = { format:"keymap-studio", version:1, uid, rows, cols, layers, protocol, name, options, map:state.draft };
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type:"application/json" }));
  const download = make("a");
  download.href = url;
  download.download = "keymap-"+uid+".json";
  download.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  setStatus("Profilo esportato.");
};
$("import").onclick = () => $("file").click();
$("file").onchange = async () => {
  const [file] = $("file").files;
  $("file").value = "";
  if (!file || state.working) return;
  const target = state.board;
  try {
    if (file.size > 1024*1024) throw Error("Il profilo è troppo grande.");
    const data = JSON.parse(await file.text());
    if (target !== state.board || state.working) throw Error("La connessione è cambiata durante l’importazione.");
    if (!["sam60-studio","keymap-studio"].includes(data?.format) || data.version !== 1 ||
      !["uid","rows","cols","layers","protocol","options"].every((id) => data[id] === target[id]) ||
      !Array.isArray(data.map) || data.map.length !== state.saved.length ||
      !data.map.every((code) => Number.isInteger(code) && code >= 0 && code <= 65535)) {
      throw Error("Profilo non compatibile con il modello, il firmware o il layout attuale.");
    }
    if (changed().length && !confirm("Sostituire le modifiche in sospeso con questo profilo?")) return;
    state.draft = data.map;
    render();
    setStatus("Profilo caricato. Applica per salvare le modifiche.");
  } catch (error) {
    setStatus(error.message, true);
  }
};

document.querySelectorAll("[data-tab]").forEach((button) => {
  button.onclick = () => {
    state.tab = button.dataset.tab;
    document.body.dataset.studioTab = state.tab;
    document.querySelectorAll("[data-tab]").forEach((tab) => {
      const active = state.tab === tab.dataset.tab;
      tab.setAttribute("aria-pressed", String(active));
      $(tab.dataset.tab).hidden = !active;
    });
    document.dispatchEvent(new Event("studio-tab"));
  };
});
$("clearTest").onclick = () => $("testBody").replaceChildren(make("p","Premi un tasto per iniziare."));
window.addEventListener("keydown", (event) => {
  if (state.tab !== "test" || event.repeat) return;
  const region = $("testBody");
  region.querySelector("p")?.remove();
  region.prepend(make("span", (event.key === " " ? "Spazio" : event.key)+" · "+event.code));
  if (region.childElementCount > 30) region.lastElementChild.remove();
});


const qmkEffects = ["Spento","Colore fisso",
  ...sequence(4, (i) => "Respiro "+(i+1)), ...sequence(3, (i) => "Arcobaleno "+(i+1)),
  ...sequence(6, (i) => "Vortice "+(i+1)), ...sequence(6, (i) => "Serpente "+(i+1)),
  ...sequence(3, (i) => "Scansione "+(i+1)), "Natale", ...sequence(10, (i) => "Gradiente "+(i+1)),
  "Test RGB", "Alternato"];
const vialNames = {0:"Spento",2:"Colore fisso",3:"Alfanumerici e modificatori",4:"Gradiente verticale",
  5:"Gradiente orizzontale",6:"Respiro",13:"Ciclo uniforme",14:"Ciclo orizzontale",15:"Ciclo verticale",
  20:"Spirale",24:"Pioggia",28:"Onda cromatica",29:"Mappa di digitazione",30:"Pioggia digitale"};
const channels = ["effect","speed","hue","sat","brightness"];

async function readLight(link) {
  const reply = await link.request([8,0x41],[8,0x41]);
  return [view(reply).getUint16(2,true), ...reply.slice(4,8)];
}
async function readQmkLight(link) {
  const get = async (id) => (await link.request([8,id],[8,id])).slice(2);
  const [brightness] = await get(0x80);
  const [effect] = await get(0x81);
  const [speed] = await get(0x82);
  const [hue,sat] = await get(0x83);
  return [effect,speed,hue,sat,brightness];
}

function viaLightingChannel(board) {
  return board.lighting==="via-rgblight" ? 2 : 3;
}

async function readDeviceLight(link,board) {
  if(board.lighting==="qmk") return readQmkLight(link);
  if(board.lighting==="vialrgb") return readLight(link);
  const channel=viaLightingChannel(board);
  const get=async (field)=>(await link.request([8,channel,field],[8,channel,field])).slice(3);
  const [brightness]=await get(1), [effect]=await get(2), [speed]=await get(3), [hue,sat]=await get(4);
  return [effect,speed,hue,sat,brightness];
}

async function loadLight() {
  let values = [1,80,108,175,180], effects = sequence(qmkEffects.length, (i) => i), maximum = 255;
  $("rgbInfo").textContent = "Prova l’anteprima del colore in modalità demo.";
  if (state.link) {
    const { link, board } = state;
    $("rgbInfo").textContent = "Il firmware non espone un’interfaccia RGB supportata.";
    if (!board.lighting) return;
    try {
      values = await readDeviceLight(link,board);
      if (board.lighting !== "vialrgb") {
        effects = sequence(board.lighting==="via-matrix" ? 45 : qmkEffects.length, (i) => i);
        $("rgbInfo").textContent = "Gli effetti disponibili dipendono da quelli compilati nel firmware QMK.";
      } else {
        const info = await link.request([8,0x40],[8,0x40]);
        if (view(info).getUint16(2,true) !== 1) throw Error("Versione VialRGB non supportata.");
        maximum = info[4];
        const supported = new Set([0]);
        let cursor = 0;
        for (let page = 0; page < 64; page++) {
          const result = await link.request([8,0x42,cursor&255,cursor>>8],[8,0x42]);
          let next = cursor, end = false;
          for (let i = 2; i < 32; i += 2) {
            const effect = view(result).getUint16(i,true);
            if (effect === 65535) { end = true; break; }
            supported.add(effect);
            next = Math.max(next,effect);
          }
          if (end || next <= cursor) break;
          cursor = next;
        }
        effects = [...supported].filter((effect) => effect !== 1);
        $("rgbInfo").textContent = "Controlli VialRGB disponibili per il firmware collegato.";
      }
      state.light = values;
    } catch (error) {
      $("rgbInfo").textContent = "Impossibile leggere l’illuminazione. "+error.message;
      return;
    }
  }
  const choices = [...new Set([...effects,values[0]])].map((n) => {
    const label = state.board.lighting === "vialrgb" ? vialNames[n]
      : state.board.lighting === "via-matrix" ? (n===0 ? "Spento" : null) : qmkEffects[n];
    const option = make("option",label ?? "Effetto "+n);
    option.value = n;
    return option;
  });
  $("effect").replaceChildren(...choices);
  $("brightness").max = maximum;
  $("speed").max = state.board.lighting?.startsWith("via-") ? Math.max(3,values[1]) : 255;
  channels.forEach((id,i) => { $(id).value = values[i]; });
  updatePicker();
}

async function writeLight(link,board,values) {
  const [effect,speed,hue,sat,brightness] = values;
    const set = (...bytes) => link.request([7,...bytes],[7,...bytes]);
    if (board.lighting === "vialrgb") {
      await set(0x41,effect&255,effect>>8,speed,hue,sat,brightness);
    } else if(board.lighting==="qmk") {
      if (effect) await set(0x81,effect);
      await set(0x82,speed);
      await set(0x80,brightness);
      await set(0x83,hue,sat);
      if (!effect) await set(0x81,0);
    } else {
      const channel=viaLightingChannel(board);
      if(effect) await set(channel,2,effect);
      await set(channel,3,speed);
      await set(channel,1,brightness);
      await set(channel,4,hue,sat);
      if(!effect) await set(channel,2,0);
    }
    const verified = await readDeviceLight(link,board);
    if (verified[0] !== effect) {
      throw Error("L’effetto non è disponibile. La modifica corrente potrebbe essere visibile fino al riavvio.");
    }
    if(board.lighting?.startsWith("via-")) {
      const cmd=[9,viaLightingChannel(board)];
      await link.request(cmd,cmd);
    } else await link.request([9],[9]);
    return verified;
}

$("lightControls").onsubmit = async (event) => {
  event.preventDefault();
  if (state.working) return;
  const values = channels.map((id) => Number($(id).value));
  if (!state.link) return setStatus("Illuminazione aggiornata nella demo.");
  if (!state.light) return;
  const { link, board } = state;
  state.working = true;
  render();
  try {
    await writeLight(link,board,values);
    await loadLight();
    setStatus("Illuminazione salvata sulla tastiera.");
  } catch (error) {
    setStatus(error.message,true);
  } finally {
    state.working = false;
    render();
  }
};

void loadLight();
render();
