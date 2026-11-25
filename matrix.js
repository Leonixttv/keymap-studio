"use strict";

let matrixRunning=false;
let cancelMatrix=false;

function matrixAvailable() {
  const {board,link}=state;
  return link?.device.opened && board.cols<=32 && (Math.floor(board.cols/8)+1)*board.rows<=28;
}
function syncMatrix() { $("startMatrix").disabled=!matrixAvailable() || state.working; }
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
  const bytesPerRow=Math.ceil(board.cols/8);
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
          const offset=2+key.row*bytesPerRow+bytesPerRow-1-(key.col>>3);
          const pressed=Boolean(data[offset]&(1<<(key.col%8)));
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
