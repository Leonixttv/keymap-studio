"use strict";

let matrixRunning=false;
let cancelMatrix=false;

function matrixAvailable() {
  const {board,link}=state;
  return link?.device.opened && board.cols<=32 && Math.ceil(board.cols/8)*board.rows<=28;
}
function syncMatrix() {
  $("startMatrix").disabled = !matrixAvailable() || state.working;
  const picker = $("pickMatrixKey");
  picker.hidden = state.board.kind !== "via";
  picker.disabled = !matrixAvailable() || state.working;
}

function matrixKeyPressed(data, cols, row, col) {
  const bytesPerRow = Math.ceil(cols / 8);
  const offset = 2 + row * bytesPerRow + bytesPerRow - 1 - (col >> 3);
  return Boolean(data[offset] & (1 << (col % 8)));
}

function newlyPressedMatrixKeys(before, after, rows, cols) {
  const pressed = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (matrixKeyPressed(after, cols, row, col) && !matrixKeyPressed(before, cols, row, col)) {
        pressed.push({row, col});
      }
    }
  }
  return pressed;
}

$("pickMatrixKey").onclick = async () => {
  if (!matrixAvailable() || state.working || state.board.kind !== "via") return;
  const {board, link} = state;
  const keys = activeKeys(board);
  const hint = $("physicalHint");
  state.working = true;
  state.lastMatrixPosition = null;
  render();
  hint.textContent = "Rilascia i tasti, poi premi il tasto da selezionare.";
  try {
    const read = () => link.request([2, 3], [2, 3]);
    let before = await read();
    const deadline = Date.now() + 8000;
    while (Date.now() < deadline && state.tab === "map" && link.device.opened) {
      const after = await read();
      const pressed = newlyPressedMatrixKeys(before, after, board.rows, board.cols);
      before = after;
      if (pressed.length === 1) {
        const {row, col} = pressed[0];
        const matches = keys.filter(key => key.row === row && key.col === col);
        state.lastMatrixPosition = {row, col, inLayout:matches.length === 1};
        state.selected = matches.length === 1 ? matches[0] : null;
        hint.textContent = translateUi(matches.length === 1 ? "Posizione selezionata dalla matrice." : "Posizione non univoca nella definizione del layout.") + " (" + row + ", " + col + ")";
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 40));
    }
    hint.textContent = "Nessuna pressione rilevata dalla matrice USB.";
  } catch (error) {
    hint.textContent = translateUi("Lettura della matrice USB non riuscita.") + " " + error.message;
  } finally {
    state.working = false;
    render();
  }
};
function matrixStatus(message) { $("matrixStatus").textContent=message; }

$("cancelMatrixUnlock").onclick=()=>{cancelUnlock=true;};
$("stopMatrix").onclick=()=>{cancelMatrix=true;};
document.addEventListener("studio-state",syncMatrix);
document.addEventListener("studio-tab",()=>{
  if(state.tab!=="test" && matrixRunning) { cancelMatrix=true;cancelUnlock=true; }
});

$("startMatrix").onclick=async()=>{
  if(!matrixAvailable() || state.working) return;
  const {board,link}=state;
  const keys=activeKeys(board);
  const tested=new Set();
  matrixRunning=true;
  cancelMatrix=false;
  state.working=true;
  $("stopMatrix").hidden=false;
  $("matrixKeyboard").hidden=false;
  renderKeys($("matrixKeyboard"),keys,new Set());
  const elements=[...$("matrixKeyboard").querySelectorAll(".key")];
  render();
  try {
    const read=async()=>{
      const limit=Date.now()+60000;
      while(!cancelMatrix && Date.now()<limit) {
        const data=await link.request([2,3],[2,3]);
        keys.forEach((key,i)=>{
          const pressed=matrixKeyPressed(data,board.cols,key.row,key.col);
          if(pressed) tested.add(i);
          elements[i].toggleAttribute("data-layout-changed",pressed);
          elements[i].toggleAttribute("data-matrix-tested",tested.has(i));
        });
        matrixStatus("Premi i tasti · "+tested.size+" su "+keys.length+" rilevati.");
        await new Promise(resolve=>setTimeout(resolve,85));
      }
    };
    if(board.kind==="via") await read();
    else await withUnlock(link,read,matrixStatus,$("cancelMatrixUnlock"));
    matrixStatus("Test terminato · "+tested.size+" su "+keys.length+" tasti rilevati.");
  } catch(error) { matrixStatus(error.message); }
  finally {
    state.working=false;
    matrixRunning=false;
    $("stopMatrix").hidden=true;
    render();
  }
};
syncMatrix();
