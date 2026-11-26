"use strict";

const legendLanguages = {
  us: "Inglese (Stati Uniti) · QWERTY",
  it: "Italiano · QWERTY",
  uk: "Inglese (Regno Unito) · QWERTY",
  de: "Tedesco · QWERTZ",
  fr: "Francese tradizionale · AZERTY",
  es: "Spagnolo (Spagna) · QWERTY",
  pt: "Português (Portugal) · QWERTY",
  sv: "Svenska / Suomi · QWERTY",
  dvorak: "English (US) · Dvorak",
  colemak: "English (US) · Colemak",
};
const symbols = [45,46,47,48,49,50,51,52,53,54,55,56,100];
const legends = {
  us:{numbers:["1!","2@","3#","4$","5%","6^","7&","8*","9(","0)"],
    punctuation:["-_","=+","[{","]}","\\|","\\|",";:", "'\"","`~",",<",".>","/?","\\|"]},
  it:{numbers:["1!","2\"","3£","4$","5%","6&","7/","8(","9)","0="],
    punctuation:["'?","ì^","èé","+*","ù§","ù§","òç","à°","\\|",",;",".:","-_","<>"]},
  uk:{numbers:["1!","2\"","3£","4$","5%","6^","7&","8*","9(","0)"],
    punctuation:["-_","=+","[{","]}","#~","#~",";:","'@","`¬",",<",".>","/?","\\|"]},
  de:{numbers:["1!","2\"","3§","4$","5%","6&","7/","8(","9)","0="],
    letters:{Y:"Z",Z:"Y"},punctuation:["ß?","´`","üÜ","+*","#'","#'","öÖ","äÄ","^°",",;",".:","-_","<>"]},
  fr:{numbers:["&1","é2","\"3","'4","(5","-6","è7","_8","ç9","à0"],
    letters:{A:"Q",Q:"A",W:"Z",Z:"W",M:",?"},punctuation:[")°","=+","^¨","$£","*µ","*µ","M","ù%","²",";.",":/","!§","<>"]},
  es:{numbers:["1!","2\"","3·","4$","5%","6&","7/","8(","9)","0="],
    punctuation:["'?","¡¿","`^","+*","çÇ","çÇ","ñÑ","´¨","ºª",",;",".:","-_","<>"]},
  pt:{numbers:["1!","2\"","3#","4$","5%","6&","7/","8(","9)","0="],
    punctuation:["'?","«»","+*","´`","~^","~^","çÇ","ºª","\\|",",;",".:","-_","<>"]},
  sv:{numbers:["1!","2\"","3#","4¤","5%","6&","7/","8(","9)","0="],
    punctuation:["+?","´`","åÅ","¨^","'*","'*","öÖ","äÄ","§½",",;",".:","-_","<>"]},
};
legends.dvorak={...legends.us,
  letters:{B:"X",C:"J",D:"E",E:".>",F:"U",G:"I",H:"D",I:"C",J:"H",K:"T",L:"N",
    N:"B",O:"R",P:"L",Q:"'\"",R:"P",S:"O",T:"Y",U:"G",V:"K",W:",<",X:"Q",Y:"F",Z:";:"},
  punctuation:["[{","]}","/?","=+","\\|","\\|","S","-_","`~","W","V","Z","\\|"]};
legends.colemak={...legends.us,
  letters:{E:"F",F:"T",G:"D",I:"U",J:"N",K:"E",L:"I",N:"K",O:"Y",P:";:",R:"P",
    S:"R",T:"G",U:"L",Y:"J"},punctuation:legends.us.punctuation.map((value,i)=>i===6?"O":value)};
const palettes = {
  graphite:["Grafite","#303b36","#39433c","#d7fa77"],
  ocean:["Oceano","#183f54","#315871","#8debff"],
  cream:["Crema e terracotta","#493832","#e0c3a4","#ff916d"],
  violet:["Viola","#362e52","#55446c","#e6b4ff"],
  arcade:["Arcade","#412739","#4a405a","#ff79bd"],
};
const uiThemes = ["forest","ocean","violet","slate"];
const defaultAppearance = {language:"us",shift:true,palette:"graphite",uiTheme:"forest",
  caseColor:palettes.graphite[1],keyColor:palettes.graphite[2],accentColor:palettes.graphite[3]};
const colorFields = ["caseColor","keyColor","accentColor"];
let appearance = {...defaultAppearance};
let appearanceSave;
let layoutBoard;
let pendingLayout;
let showCurrentLayout=false;

function localizedLegend(code) {
  const chosen = legends[appearance.language];
  let value;
  if (code>=30 && code<=39) value=chosen.numbers[code-30];
  else if (symbols.includes(code)) value=chosen.punctuation[symbols.indexOf(code)];
  else if (code>=4 && code<=29) {
    const letter=String.fromCharCode(65+code-4);
    value=chosen.letters?.[letter] ?? letter;
  }
  return value ? {main:value[0],shift:appearance.shift ? value[1] : ""} : null;
}

function layoutChoices(board) {
  return board.labels.map(label=>typeof label==="string" ? [label,["No","Sì"]] : [label[0],label.slice(1)]);
}

function unpackLayout(board) {
  let packed=board.options;
  return layoutChoices(board).reverse().map(([,options])=>{
    const radix=2**Math.ceil(Math.log2(options.length));
    const choice=packed%radix;
    packed=Math.floor(packed/radix);
    return choice<options.length ? choice : 0;
  }).reverse();
}

function packLayout(board,selected) {
  let span=1, value=0;
  layoutChoices(board).forEach(([,options],i)=>{
    const radix=2**Math.ceil(Math.log2(options.length));
    span*=radix;
    value=value*radix+selected[i];
  });
  return Math.floor(board.options/span)*span+value;
}

function layoutKeyFingerprint(key) {
  return JSON.stringify([key.row,key.col,key.x,key.y,key.width,key.height,key.angle,key.x2,key.y2,key.w2,key.h2]);
}

function syncAppearance() {
  const css=document.documentElement.style;
  document.documentElement.dataset.theme=appearance.uiTheme;
  $("uiTheme").value=appearance.uiTheme;
  for (const [field,variable] of [["caseColor","--case"],["keyColor","--key-color"],["accentColor","--deck-accent"]]) {
    css.setProperty(variable,appearance[field]);
    $(field).value=appearance[field];
  }
  const digits=appearance.keyColor.slice(1).match(/../g).map(s=>parseInt(s,16));
  css.setProperty("--key-ink",digits[0]*0.299+digits[1]*0.587+digits[2]*0.114>152 ? "#161a17" : "#f5f6ef");
  const accent=appearance.accentColor.slice(1).match(/../g).map(s=>parseInt(s,16));
  css.setProperty("--accent-ink",accent[0]*0.299+accent[1]*0.587+accent[2]*0.114>150 ? "#171e12" : "#ffffff");
  $("legendLanguage").value=appearance.language;
  $("shiftLegends").checked=appearance.shift;
  $("layoutTheme").value=appearance.palette;
}

function updateAppearance() {
  syncAppearance();
  render();
  clearTimeout(appearanceSave);
  appearanceSave=setTimeout(()=>{
    window.studioPreferences?.save({...appearance,uiLanguage}).catch(()=>{
      $("layoutStatus").textContent="Impossibile salvare le preferenze grafiche.";
    });
  },180);
}

function updateLayoutPreview() {
  if ($("layout").hidden) return;
  const board=state.board;
  if (layoutBoard!==board) {
    layoutBoard=board;
    pendingLayout=unpackLayout(board);
    showCurrentLayout=false;
    $("layoutStatus").textContent="";
    renderLayoutOptions();
  }
  const packed=packLayout(board,pendingLayout);
  const isChanged=packed!==board.options;
  const before=activeKeys(board), after=activeKeys(board,packed);
  const shown=showCurrentLayout ? before : after;
  const comparison=new Set((showCurrentLayout ? after : before).map(layoutKeyFingerprint));
  const changedKeys=new Set(shown.filter(key=>!comparison.has(layoutKeyFingerprint(key))));
  const oldPositions=new Set(before.map(layoutKeyFingerprint));
  const newPositions=new Set(after.map(layoutKeyFingerprint));
  const modifiedCount=after.filter(key=>!oldPositions.has(layoutKeyFingerprint(key))).length;
  const removedCount=before.filter(key=>!newPositions.has(layoutKeyFingerprint(key))).length;
  $("layoutCount").textContent=shown.length+" tasti";
  $("layoutPreviewTitle").textContent=showCurrentLayout ? "Layout attuale" : "Anteprima del layout";
  $("layoutSummary").textContent=isChanged
    ? (showCurrentLayout ? "Evidenziati i tasti che cambieranno." : "Evidenziati i tasti nuovi o riposizionati.")+
      " "+modifiedCount+" in anteprima · "+removedCount+" nella disposizione attuale."
    : "Layer base · "+legendLanguages[appearance.language].split(" · ")[0];
  $("compareLayout").disabled=!isChanged;
  $("compareLayout").textContent=showCurrentLayout ? "Mostra anteprima" : "Mostra attuale";
  $("compareLayout").setAttribute("aria-pressed",String(showCurrentLayout));
  $("discardLayout").disabled=!isChanged || state.working;
  $("applyLayout").disabled=!isChanged || state.working || (!!state.link && !state.link.device.opened) || !after.length;
  $("applyLayout").textContent=state.link ? "Salva sulla tastiera" : "Salva layout demo";
  setPhysicalDisabled(state.working);
  renderKeys($("layoutKeyboard"),shown,changedKeys);
}

function renderLayoutOptions() {
  const host=$("physicalOptions");
  host.replaceChildren();
  const choices=layoutChoices(state.board);
  if (!choices.length) {
    host.append(make("p","Il firmware collegato espone una sola disposizione fisica."));
    return;
  }
  choices.forEach(([name,items],i)=>{
    const field=make("label");
    const select=make("select");
    select.setAttribute("aria-label",name);
    for (const [index,choice] of items.entries()) {
      const option=make("option",choice);
      option.value=index;
      select.append(option);
    }
    select.value=pendingLayout[i];
    select.onchange=()=>{
      pendingLayout[i]=Number(select.value);
      showCurrentLayout=false;
      $("layoutStatus").textContent="Modifiche in anteprima. Salva per applicarle.";
      updateLayoutPreview();
    };
    field.append(make("span",name),select);
    host.append(field);
  });
}

async function writeLayoutOptions(link,packed) {
  const cmd=[3,2,(packed>>>24)&255,(packed>>>16)&255,(packed>>>8)&255,packed&255];
  await link.request(cmd,cmd);
  const verified=view(await link.request([2,2],[2,2])).getUint32(2);
  if(verified!==packed) throw Error("Il firmware non ha confermato il layout.");
}

document.addEventListener("DOMContentLoaded",async ()=>{
  const language=$("legendLanguage"), theme=$("layoutTheme");
  const add=(select,value,text)=>{
    const option=make("option",text);
    option.value=value;
    select.append(option);
  };
  for (const [code,name] of Object.entries(legendLanguages)) add(language,code,name);
  for (const [code,[name]] of Object.entries(palettes)) add(theme,code,name);
  add(theme,"custom","Personalizzata");
  syncAppearance();
  let touched=false;
  language.onchange=()=>{touched=true;appearance.language=language.value;updateAppearance();};
  $("shiftLegends").onchange=()=>{touched=true;appearance.shift=$("shiftLegends").checked;updateAppearance();};
  $("uiTheme").onchange=()=>{touched=true;appearance.uiTheme=$("uiTheme").value;updateAppearance();};
  theme.onchange=()=>{
    touched=true;
    appearance.palette=theme.value;
    if (palettes[theme.value]) colorFields.forEach((field,i)=>{appearance[field]=palettes[theme.value][i+1];});
    updateAppearance();
  };
  for (const field of colorFields) {
    $(field).oninput=()=>{
      touched=true;
      appearance.palette="custom";
      appearance[field]=$(field).value;
      updateAppearance();
    };
  }
  $("compareLayout").onclick=()=>{showCurrentLayout=!showCurrentLayout;updateLayoutPreview();};
  $("discardLayout").onclick=()=>{
    pendingLayout=unpackLayout(state.board);
    showCurrentLayout=false;
    $("layoutStatus").textContent="Modifiche al layout annullate.";
    renderLayoutOptions();
    updateLayoutPreview();
  };
  $("applyLayout").onclick=async ()=>{
    if (state.working) return;
    const board=state.board, link=state.link, packed=packLayout(board,pendingLayout);
    if (packed===board.options || !activeKeys(board,packed).length) return;
    state.working=true;
    setPhysicalDisabled(true);
    render();
    try {
      if (link) {
        const current=view(await link.request([2,2],[2,2])).getUint32(2);
        if(current!==board.options) {
          board.options=current;
          state.selected=null;
          throw Error("Il layout è cambiato altrove. Controlla il confronto prima di risalvare.");
        }
        await writeLayoutOptions(link,packed);
      }
      board.options=packed;
      state.selected=null;
      showCurrentLayout=false;
      $("layoutStatus").textContent=link ? "Layout salvato e verificato sulla tastiera." : "Layout salvato nella demo.";
    } catch (error) {
      $("layoutStatus").textContent=error.message;
    } finally {
      state.working=false;
      setPhysicalDisabled(false);
      render();
    }
  };
  document.addEventListener("studio-state",updateLayoutPreview);
  document.addEventListener("studio-tab",updateLayoutPreview);
  try {
    const saved=await window.studioPreferences?.load();
    if (saved && !touched) {
      if (saved.uiLanguage) setUiLanguage(saved.uiLanguage);
      if (uiThemes.includes(saved.uiTheme)) appearance.uiTheme=saved.uiTheme;
      if (Object.hasOwn(legendLanguages,saved.language)) appearance.language=saved.language;
      if (typeof saved.shift==="boolean") appearance.shift=saved.shift;
      if (saved.palette==="custom" || Object.hasOwn(palettes,saved.palette)) appearance.palette=saved.palette;
      for (const field of colorFields) if (/^#[a-f0-9]{6}$/i.test(saved[field])) appearance[field]=saved[field];
      syncAppearance();
      render();
    }
  } catch {}
});

function setPhysicalDisabled(disabled) {
  $("physicalOptions").querySelectorAll("select").forEach(select=>{select.disabled=disabled;});
}
