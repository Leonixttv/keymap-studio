"use strict";

// QMK consumer keycodes, including the values visible in the MK75 report.
const mediaKeycodes = [[168,"Muto"],[169,"Volume +"],[170,"Volume −"],
  [171,"Traccia dopo"],[172,"Traccia prima"],[173,"Media Stop"],[174,"Play/Pausa"],
  [175,"Media Player"],[177,"Mail"],[178,"Calculator"],[179,"My Computer"],
  [180,"Browser Search"],[181,"Browser Home"],[182,"Browser Back"],
  [183,"Browser Forward"],[184,"Browser Stop"],[185,"Browser Refresh"],
  [186,"Browser Favorites"],[187,"Media Fast Forward"],[188,"Media Rewind"],
  [189,"Brightness +"],[190,"Brightness −"]];

// Decode only documented QMK ranges. Unknown or firmware-specific values remain hex.
function describeExtendedKeycode(code, modern, basicLabel) {
  if (!Number.isInteger(code) || code < 0 || code > 0xffff) return null;
  if (code === (modern ? 0x7c77 : 0x5f10)) return "Fn1 (Fn3)";
  if (code === (modern ? 0x7c78 : 0x5f11)) return "Fn2 (Fn3)";
  // QMK's modern lighting range. Keep legacy codes as hex: their values differ.
  if (modern) {
    const matrix = ["RGBM On", "RGBM Off", "RGBM Toggle", "RGBM Next", "RGBM Prev",
      "RGBM Hue+", "RGBM Hue−", "RGBM Sat+", "RGBM Sat−", "RGBM Bright+",
      "RGBM Bright−", "RGBM Speed+", "RGBM Speed−", "RGBM Flag+", "RGBM Flag−"];
    if (code >= 0x7840 && code < 0x7840 + matrix.length) return matrix[code - 0x7840];
  }
  const inner = basicLabel(code & 0xff);
  const mods = bits => {
    const side = bits & 0x10 ? "R" : "L";
    return [[1,"Ctrl"],[2,"Shift"],[4,"Alt"],[8,"Gui"]]
      .filter(([bit]) => bits & bit).map(([,name]) => side + name).join("+");
  };
  if (code >= 0x0100 && code <= 0x1fff && inner) {
    const name = mods((code >> 8) & 0x1f);
    if (name) return `${name}(${inner})`;
  }
  const modTap = modern ? code >= 0x2000 && code <= 0x3fff : code >= 0x6000 && code <= 0x7fff;
  if (modTap && inner) {
    const name = mods((code >> 8) & 0x1f);
    if (name) return `${name}_T(${inner})`;
  }
  if (code >= 0x4000 && code <= 0x4fff && inner) return `LT(${(code >> 8) & 0xf}, ${inner})`;
  const ranges = modern
    ? [[0x5200,"TO"],[0x5220,"MO"],[0x5240,"DF"],[0x5260,"TG"],[0x5280,"OSL"],[0x52c0,"TT"]]
    : [[0x5000,"TO"],[0x5100,"MO"],[0x5200,"DF"],[0x5300,"TG"],[0x5400,"OSL"],[0x5800,"TT"]];
  const width = modern ? 0x20 : 0x100;
  for (const [base, name] of ranges) if (code >= base && code < base + width) return `${name}(${code-base})`;
  const osm = modern ? 0x52a0 : 0x5500;
  if (code >= osm && code < osm + 0x20) {
    const name = mods(code-osm);
    if (name) return `OSM(${name})`;
  }
  return null;
}
function layerTapKeycode(layer, key) {
  if (!Number.isInteger(layer) || layer < 0 || layer > 15 || !Number.isInteger(key) || key < 4 || key > 255) throw Error("Invalid Layer Tap parameters");
  return 0x4000 | (layer << 8) | key;
}
function compactKeyLabel(code, label, width) {
  if (code === 1) return "▽";
  if (code === 42 && width <= 1.25) return "Bksp";
  return label;
}
if (typeof module !== "undefined") module.exports = { describeExtendedKeycode, compactKeyLabel, mediaKeycodes, layerTapKeycode };
