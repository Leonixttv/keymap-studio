"use strict";

const physicalCodes = {
  Enter:[40], Escape:[41], Backspace:[42], Tab:[43], Space:[44],
  Minus:[45], Equal:[46], BracketLeft:[47], BracketRight:[48], Backslash:[49,50],
  Semicolon:[51], Quote:[52], Backquote:[53], Comma:[54], Period:[55], Slash:[56],
  CapsLock:[57], PrintScreen:[70], ScrollLock:[71], Pause:[72], Insert:[73],
  Home:[74], PageUp:[75], Delete:[76], End:[77], PageDown:[78],
  ArrowRight:[79], ArrowLeft:[80], ArrowDown:[81], ArrowUp:[82], NumLock:[83],
  NumpadDivide:[84], NumpadMultiply:[85], NumpadSubtract:[86], NumpadAdd:[87],
  NumpadEnter:[88], NumpadDecimal:[99], IntlBackslash:[100], ContextMenu:[101], NumpadEqual:[103],
  IntlRo:[135], KanaMode:[136], IntlYen:[137], Convert:[138], NonConvert:[139],
  ControlLeft:[224], ShiftLeft:[225], AltLeft:[226], MetaLeft:[227],
  ControlRight:[228], ShiftRight:[229], AltRight:[230], MetaRight:[231],
  AudioVolumeMute:[168], AudioVolumeUp:[169], AudioVolumeDown:[170], MediaTrackNext:[171],
  MediaTrackPrevious:[172], MediaStop:[173], MediaPlayPause:[174],
};

function usagesForPhysicalEvent(code) {
  if (/^Key[A-Z]$/.test(code)) return [code.charCodeAt(3)-65+4];
  if (/^Digit[0-9]$/.test(code)) return [30+(Number(code.slice(5))+9)%10];
  if (/^Numpad[0-9]$/.test(code)) return [89+(Number(code.slice(6))+9)%10];
  if (/^F(?:[1-9]|1[0-9]|2[0-4])$/.test(code)) {
    const n=Number(code.slice(1));
    return [n<=12 ? 57+n : 91+n];
  }
  return physicalCodes[code] ?? [];
}

function usagesForKeyValue(key) {
  const known = { Escape:[41],Enter:[40],Backspace:[42],Tab:[43]," ":[44],Delete:[76],
    Insert:[73],Home:[74],End:[77],PageUp:[75],PageDown:[78],ArrowRight:[79],ArrowLeft:[80],
    ArrowDown:[81],ArrowUp:[82] };
  if (Object.hasOwn(known,key)) return known[key];
  if (typeof key !== "string" || Array.from(key).length !== 1) return [];
  const comparable = key.toLocaleLowerCase();
  return [...sequence(36,i=>i+4),...symbols].filter(code=>{
    const legend=localizedLegend(code);
    return [legend?.main,legend?.shift].some(value=>value?.toLocaleLowerCase()===comparable);
  });
}

function tappedUsage(code,board) {
  const legacy=board.kind==="vial" && board.protocol===5;
  if ((code>=0x0100 && code<=0x1fff) || (code>=0x4000 && code<=0x4fff) ||
    (legacy ? code>=0x6000 && code<=0x7fff : code>=0x2000 && code<=0x3fff)) {
    return code&255;
  }
  return -1;
}

function findPressedKey(codes) {
  const {board,layer,saved}=state;
  if (!codes.length) return [];
  const stride=board.rows*board.cols;
  const byLayer=(keys,index,decode)=>{
    return keys.filter(key=>{
      const position=key.row*board.cols+key.col;
      const assigned=saved[index*stride+position];
      const code=index && assigned===1 ? saved[position] : assigned;
      return codes.includes(decode ? tappedUsage(code,board) : code);
    });
  };
  const keys=activeKeys(board);
  const unique=results=>[...new Map(results.map(key=>[key.row+","+key.col,key])).values()];
  // The hardware usually remains on its base layer while another layer is selected for editing.
  const exact=unique(byLayer(keys,0,false));
  if (exact.length) return exact;
  const tapped=unique(byLayer(keys,0,true));
  if (tapped.length) return tapped;
  if (!layer) return [];
  const layerMatches=unique(byLayer(keys,layer,false));
  return layerMatches.length ? layerMatches : unique(byLayer(keys,layer,true));
}

const inputToggle=$("physicalSelect");
inputToggle.addEventListener("change",()=>{
  $("physicalHint").textContent=inputToggle.checked ? "Premi un tasto per selezionarlo." : "";
});

window.addEventListener("keydown",event=>{
  const modifier=/^(Alt|Control|Meta|Shift)(Left|Right)$/.test(event.code);
  if (state.tab!=="map" || state.working || !inputToggle.checked || event.defaultPrevented ||
    event.repeat || event.isComposing || (event.ctrlKey || event.metaKey) && !modifier) return;
  const target=event.target;
  if (target instanceof Element && target.closest('input:not([type="checkbox"]),select,textarea,[contenteditable],a,summary')) return;
  if (target === inputToggle && ["Enter","Space","Tab"].includes(event.code)) return;
  if (["Enter","Space","Tab"].includes(event.code) && target instanceof Element &&
    target.closest("button") && !target.matches(".key")) {
    // Preserve activation and focus navigation on other controls.
    return;
  }

  const mapped=usagesForPhysicalEvent(event.code);
  const codes=mapped.length ? mapped : (!event.code || event.code==="Unidentified") ? usagesForKeyValue(event.key) : [];
  if (!codes.length) return;
  const candidates=findPressedKey(codes);
  if (candidates.length!==1) {
    $("physicalHint").textContent=candidates.length
      ? "Più posizioni producono questo tasto. Seleziona quella giusta sulla mappa."
      : "Questo tasto non è stato trovato nella mappa attiva.";
    return;
  }
  if (event.code!=="Tab") event.preventDefault();
  state.selected=candidates[0];
  render();
  $("physicalHint").textContent="Tasto selezionato · "+labelOf(state.draft[indexOf(state.selected)]);
});

document.addEventListener("studio-tab",()=>{
  if (state.tab==="map") $("physicalHint").textContent=inputToggle.checked ? "Premi un tasto per selezionarlo." : "";
});
$("physicalHint").textContent="Premi un tasto per selezionarlo.";
