"use strict";

function colorFromHsv(hue, saturation, brightness) {
  const c = saturation / 255, h = hue / 255 * 6;
  const x = c * (1-Math.abs(h%2-1)), m = 1-c;
  const sectors = [[c,x,0],[x,c,0],[0,c,x],[0,x,c],[x,0,c],[c,0,x]];
  return "#"+sectors[Math.floor(h)%6].map(v => Math.round((v+m)*brightness*255).toString(16).padStart(2,"0")).join("");
}

function updatePicker() {
  const brightness = Number($("brightness").value)/Math.max(1,Number($("brightness").max));
  const color = colorFromHsv(Number($("hue").value), Number($("sat").value),brightness);
  $("color").value = color;
  $("colorHex").value = color.toUpperCase();
  $("colorHex").removeAttribute("aria-invalid");
  drawRgb();
}

function selectColor(value) {
  const normalized = value.trim().replace(/^#/, "");
  if (!/^[0-9a-f]{6}$/i.test(normalized)) {
    $("colorHex").setAttribute("aria-invalid","true");
    setStatus("Inserisci sei cifre esadecimali, per esempio #35A7FF.", true);
    return;
  }
  const [r,g,b] = normalized.match(/../g).map(v => parseInt(v,16)/255);
  const max = Math.max(r,g,b), delta = max-Math.min(r,g,b);
  let hue = 0;
  if (delta) {
    hue = max === r ? (g-b)/delta : max === g ? (b-r)/delta+2 : (r-g)/delta+4;
  }
  $("hue").value = Math.round((hue+6)%6/6*255);
  $("sat").value = max ? Math.round(delta/max*255) : 0;
  $("brightness").value = Math.round(max*Number($("brightness").max));
  $("colorHex").removeAttribute("aria-invalid");
  // Preserve the exact choice until a device readback quantizes it to HSV.
  $("color").value = "#"+normalized.toLowerCase();
  $("colorHex").value = "#"+normalized.toUpperCase();
  drawRgb();
}

const reducedRgb = matchMedia("(prefers-reduced-motion: reduce)");
let rgbPaused = reducedRgb.matches, rgbFrame = 0, rgbTime = 0, rgbLast = null;
const rgbPulse = [];

function patternFor(effect, mode) {
  if (mode === "vialrgb") {
    if (effect === 2 || effect === 3) return "solid";
    if (effect === 4 || effect === 5) return "gradient";
    if ([6,26,27].includes(effect)) return "breath";
    if (effect >= 29 || [24,25].includes(effect)) return "spark";
    return effect === 13 ? "cycle" : "wave";
  }
  if (effect === 1) return "solid";
  if (effect <= 5) return "breath";
  if (effect <= 8) return "cycle";
  if (effect <= 14) return "wave";
  if (effect <= 23) return "scan";
  if (effect === 24 || effect === 36) return "alternate";
  return effect === 35 ? "cycle" : "gradient";
}

function drawRgb(timestamp) {
  if (rgbFrame && timestamp === undefined) cancelAnimationFrame(rgbFrame);
  rgbFrame = 0;
  if ($("rgb").hidden) { rgbLast = null; return; }
  const effect = Number($("effect").value);
  const speed = Number($("speed").value) / Number($("speed").max);
  if (timestamp !== undefined && rgbLast !== null && !rgbPaused) {
    rgbTime += Math.min(60,timestamp-rgbLast)*(0.00025 + speed*0.0017);
  }
  rgbLast = timestamp ?? null;
  const hue = Number($("hue").value)/255*360;
  const sat = Number($("sat").value)/255*100;
  const strength = Number($("brightness").value)/255;
  const pattern = patternFor(effect,state.board.lighting);
  const ctx = $("glow").getContext("2d");
  const colorAt = (position, intensity) => {
    const t = rgbTime;
    let h = hue, s = sat, amount = +!!effect;
    if (effect) {
      switch(pattern) {
        case "breath": amount *= 0.22+0.78*(0.5+0.5*Math.sin(t*4)); break;
        case "cycle": h = t*110; s = 95; break;
        case "wave": h = t*90+position*295; s = 95; break;
        case "gradient": h += position*110; break;
        case "scan": amount *= 0.12+0.88*Math.pow(0.5+0.5*Math.cos(position*6.28-t*5),9); break;
        case "alternate": h = (Math.floor(position*6+t*2)%2)*119; s = 95; break;
        case "spark": {
          const wave = rgbPulse.reduce((max,p) => Math.max(max, Math.max(0,1-(t-p.time)*3)*Math.max(0,1-Math.abs(position-p.position)*7)),0);
          amount *= Math.max(wave,0.12+0.8*Math.pow(0.5+0.5*Math.cos(position*67-t*7),12));
          break;
        }
      }
    }
    return "hsla("+h+" "+s+"% 58% / "+Math.min(1, amount*strength*intensity)+")";
  };

  ctx.clearRect(0,0,720,290);
  ctx.fillStyle = "#161a17";
  ctx.fillRect(0,0,720,290);
  for (let i=0; i<=16; i++) {
    const x = 46+i*39, y = 237;
    const glow = ctx.createRadialGradient(x,y,0,x,y,54);
    glow.addColorStop(0,colorAt(i/16,0.9));
    glow.addColorStop(1,colorAt(i/16,0));
    ctx.fillStyle = glow;
    ctx.fillRect(x-54,y-54,108,108);
  }
  const rect = (x,y,w,h,r) => { ctx.beginPath(); ctx.roundRect(x,y,w,h,r); ctx.fill(); };
  ctx.fillStyle = appearance.caseColor;
  rect(38,35,644,202,16);
  const keys=activeKeys(state.board);
  if (keys.length) {
    const x0=Math.min(...keys.map(k=>k.x+Math.min(0,k.x2)));
    const y0=Math.min(...keys.map(k=>k.y+Math.min(0,k.y2)));
    const width=Math.max(...keys.map(k=>k.x+Math.max(k.width,k.x2+k.w2)))-x0;
    const height=Math.max(...keys.map(k=>k.y+Math.max(k.height,k.y2+k.h2)))-y0;
    const sx=622/width, sy=178/height;
    for (const key of keys) {
      const x=49+(key.x-x0)*sx, y=47+(key.y-y0)*sy, position=(key.x-x0)/width;
      const cap=(left,top,w,h)=>{
        const actualWidth=Math.max(1,w*sx-4), actualHeight=Math.max(1,h*sy-4);
        ctx.fillStyle=appearance.keyColor;
        rect(left,top,actualWidth,actualHeight,5);
        ctx.fillStyle=colorAt(position,0.29);
        rect(left,top,actualWidth,actualHeight,5);
      };
      ctx.save();
      ctx.translate(49+(key.rx-x0)*sx,47+(key.ry-y0)*sy);
      ctx.rotate(key.angle*Math.PI/180);
      ctx.translate(-49-(key.rx-x0)*sx,-47-(key.ry-y0)*sy);
      if(key.x2 || key.y2 || key.w2!==key.width || key.h2!==key.height) {
        cap(x+key.x2*sx,y+key.y2*sy,key.w2,key.h2);
      }
      cap(x,y,key.width,key.height);
      ctx.restore();
    }
  }
  if (!rgbPaused && effect && !["solid","gradient"].includes(pattern)) {
    rgbFrame = requestAnimationFrame(drawRgb);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  $("color").oninput = () => selectColor($("color").value);
  $("colorHex").onchange = () => selectColor($("colorHex").value);
  $("brightness").oninput = updatePicker;
  $("lightControls").addEventListener("input", () => drawRgb());
  const presets = [["Rosso","#FF4444"],["Arancio","#FF9A38"],["Giallo","#F6F36A"],
    ["Verde","#72FF80"],["Azzurro","#35A7FF"],["Viola","#B67BFF"],["Bianco","#FFFFFF"]];
  for (const [name,color] of presets) {
    const button = make("button");
    button.type = "button";
    button.setAttribute("aria-label",name);
    button.title = name;
    button.style.setProperty("--swatch",color);
    button.onclick = () => selectColor(color);
    $("swatches").append(button);
  }
  const pauseLabel = () => {
    $("pauseRgb").textContent = rgbPaused ? "Riprendi anteprima" : "Pausa anteprima";
    $("pauseRgb").setAttribute("aria-pressed",String(rgbPaused));
  };
  $("pauseRgb").onclick = () => { rgbPaused = !rgbPaused; pauseLabel(); drawRgb(); };
  $("glow").addEventListener("pointerdown", event => {
    rgbPulse.push({position:event.offsetX/$("glow").clientWidth,time:rgbTime});
    if (rgbPulse.length > 12) rgbPulse.shift();
    drawRgb();
  });
  pauseLabel();
  document.addEventListener("studio-tab", () => drawRgb());
});
