"use strict";

const VIAL = 0xfe;
const hex = (value) => "0x" + value.toString(16).toUpperCase().padStart(4, "0");
const pair = (value) => /^\d+,\d+$/.test(value ?? "") ? value.split(",").map(Number) : null;
const view = (bytes) => new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
const word = (value) => [value >> 8, value & 255];

// KLE label positions, as used by the Vial keyboard definition format.
const positionMaps = [
  [0,6,2,8,9,11,3,5,1,4,7,10], [1,7,-1,-1,9,11,4,-1,-1,-1,-1,10],
  [3,-1,5,-1,9,11,-1,-1,4,-1,-1,10], [4,-1,-1,-1,9,11,-1,-1,-1,-1,-1,10],
  [0,6,2,8,10,-1,3,5,1,4,7,-1], [1,7,-1,-1,10,-1,4,-1,-1,-1,-1,-1],
  [3,-1,5,-1,10,-1,-1,-1,4,-1,-1,-1], [4,-1,-1,-1,10,-1,-1,-1,-1,-1,-1,-1],
];

function parseDefinition(definition, format="vial") {
  const { rows, cols } = definition.matrix ?? {};
  if (![rows, cols].every((n) => Number.isInteger(n) && n > 0 && n <= 255)) {
    throw Error("Matrice Vial non valida.");
  }
  const raw = definition.layouts?.keymap;
  if (!Array.isArray(raw)) throw Error("Il firmware non contiene una definizione di layout.");
  const keys = [];
  const optionAnchors=new Map();
  const encoderIds = new Set();
  let y = 0, rx = 0, ry = 0, angle = 0, alignment = 4;
  for (const line of raw) {
    if (!Array.isArray(line)) continue;
    let x = rx, shape = {};
    for (const item of line) {
      if (typeof item !== "string") {
        if (!item || typeof item !== "object") continue;
        if (item.rx !== undefined || item.ry !== undefined) {
          rx = item.rx ?? rx;
          ry = item.ry ?? ry;
          x = rx;
          y = ry;
        }
        angle = item.r ?? angle;
        alignment = item.a ?? alignment;
        x += item.x ?? 0;
        y += item.y ?? 0;
        shape = { ...shape, ...item };
        continue;
      }
      const width = shape.w ?? 1, height = shape.h ?? 1;
      const labels = [];
      const rawLabels=item.split("\n");
      rawLabels.forEach((label, index) => {
        labels[positionMaps[alignment]?.[index]] = label;
      });
      const address = pair(labels[0]) ?? (format==="via" ? pair(rawLabels[0]) : null);
      const option=pair(labels[8]);
      if (!shape.d && labels[4] === "e" && address && address[0] < 255) encoderIds.add(address[0]);
      const viaEncoder=format==="via" ? /^e(\d{1,3})$/.exec(labels[4] ?? "") : null;
      if(viaEncoder && Number(viaEncoder[1])<255) encoderIds.add(Number(viaEncoder[1]));
      if(option && (address || shape.d || viaEncoder)) {
        const name=option.join(",");
        const previous=optionAnchors.get(name) ?? [Infinity,Infinity];
        optionAnchors.set(name,[Math.min(previous[0],x+Math.min(0,shape.x2 ?? 0)),
          Math.min(previous[1],y+Math.min(0,shape.y2 ?? 0))]);
      }
      if (!shape.d && labels[4] !== "e" && address) {
        const [row, col] = address;
        const geometry = [x, y, width, height, rx, ry, angle, shape.x2 ?? 0, shape.y2 ?? 0,
          shape.w2 ?? width, shape.h2 ?? height];
        if (row >= rows || col >= cols || geometry.some((v) => !Number.isFinite(v) || Math.abs(v) > 1000)
          || width <= 0 || height <= 0) throw Error("Geometria o coordinate Vial non valide.");
        keys.push({ row, col, x, y, width, height, angle, rx, ry, option,
          x2: shape.x2 ?? 0, y2: shape.y2 ?? 0, w2: shape.w2 ?? width, h2: shape.h2 ?? height });
      }
      x += width;
      shape = {};
    }
    y++;
  }
  for(const key of keys) {
    if(!key.option || !key.option[1] || key.angle) continue;
    const current=optionAnchors.get(key.option.join(","));
    const base=optionAnchors.get(key.option[0]+",0");
    if(current && base) { key.x+=base[0]-current[0];key.y+=base[1]-current[1]; }
  }
  if (!keys.length || keys.length > 1000) throw Error("Il layout Vial non contiene tasti utilizzabili.");
  return { rows, cols, keys, encoderIds:[...encoderIds].sort((a,b)=>a-b), name: definition.name, labels: definition.layouts.labels ?? [],
    lighting: definition.lighting, custom: definition.customKeycodes ?? [] };
}

function activeKeys(board, options = board.options) {
  let packed = options;
  const choices = board.labels.map((label) => Array.isArray(label) ? Math.ceil(Math.log2(label.length - 1)) : 1);
  const selected = choices.map(() => 0);
  for (let i = choices.length - 1; i >= 0; i--) {
    const radix = 2 ** choices[i];
    selected[i] = packed % radix;
    packed = Math.floor(packed / radix);
  }
  return board.keys.filter((key) => !key.option || (selected[key.option[0]] ?? 0) === key.option[1]);
}

async function unpackDefinition(data) {
  const stream = new window["xz-decompress"].XzReadableStream(new Blob([data]).stream());
  const reader = stream.getReader();
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let size = 0, json = "";
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 1024 * 1024) throw Error("Definizione Vial troppo grande.");
      json += decoder.decode(value, { stream: true });
    }
    return JSON.parse(json + decoder.decode());
  } finally {
    await reader.cancel().catch(() => {});
  }
}

class HidTransport {
  constructor(device) {
    this.device = device;
    const collection = device.collections.find((c) => c.usagePage === 0xff60 && c.usage === 0x61);
    const report = (reports) => reports?.find((r) =>
      r.items.reduce((bits, item) => bits + item.reportSize * item.reportCount, 0) === 256);
    this.input = report(collection?.inputReports);
    this.output = report(collection?.outputReports);
    if (!this.input || !this.output) throw Error("Interfaccia USB Raw HID Vial non trovata.");
  }

  request(bytes, prefix = []) {
    if (this.busy || !this.device.opened) throw Error("Ricollega la tastiera USB.");
    if (this.readOnly && ![0x01,0x02,0x04,0x0c,0x0d,0x0e,0x11,0x12].includes(bytes[0]))
      throw Error(translateUi("Questa versione del protocollo è disponibile solo in lettura."));
    this.busy = true;
    const payload = new Uint8Array(32);
    payload.set(bytes);
    return new Promise((resolve, reject) => {
      const cleanup = () => {
        clearTimeout(timer);
        this.device.removeEventListener("inputreport", receive);
      };
      const fail = (error) => {
        cleanup();
        void this.device.close().catch(() => {});
        reject(error);
      };
      const receive = (event) => {
        if (event.reportId !== this.input.reportId || event.data.byteLength !== 32) return;
        const reply = new Uint8Array(event.data.buffer, event.data.byteOffset, 32).slice();
        cleanup();
        if (prefix.some((byte, index) => byte !== reply[index])) {
          reject(Error("Risposta inattesa dal firmware."));
        } else {
          resolve(reply);
        }
      };
      const timer = setTimeout(() => fail(Error("La tastiera non risponde. Ricollegala via USB.")), 1800);
      this.device.addEventListener("inputreport", receive);
      Promise.resolve().then(() => this.device.sendReport(this.output.reportId, payload)).catch(fail);
    }).finally(() => { this.busy = false; });
  }
}

async function loadBoard(link) {
  const identity = await link.request([VIAL, 0]);
  const protocol = view(identity).getUint32(0, true);
  if (protocol < 5 || protocol > 6) throw Error("Firmware Vial non riconosciuto. Per VIA carica prima la definizione JSON.");
  const uid = Array.from(identity.slice(4, 12), (b) => b.toString(16).padStart(2, "0")).join("");
  const length = view(await link.request([VIAL, 1])).getUint32(0, true);
  if (!length || length > 65536) throw Error("Dimensione della definizione Vial non valida.");
  const data = new Uint8Array(length);
  for (let offset = 0; offset < length; offset += 32) {
    const page = offset / 32;
    const response = await link.request([VIAL, 2, page & 255, page >> 8]);
    data.set(response.subarray(0, Math.min(32, length - offset)), offset);
  }
  const board = parseDefinition(await unpackDefinition(data));
  const layers = (await link.request([0x11], [0x11]))[1];
  if (!layers || layers > 32 || layers * board.rows * board.cols * 2 > 65536) {
    throw Error("Dimensione della mappa tasti non supportata.");
  }
  const options = board.labels.length
    ? view(await link.request([2, 2], [2, 2])).getUint32(2) : 0;
  const macroCount = (await link.request([0x0c], [0x0c]))[1];
  const counts = await link.request([VIAL, 0x0d, 0]);
  const [tap, combo, override, repeat] = counts[0] === VIAL ? [0, 0, 0, 0] : counts;
  const lighting = identity[12] === 1 || board.lighting === "vialrgb" ? "vialrgb"
    : ["qmk_rgblight", "qmk_backlight_rgblight"].includes(board.lighting) ? "qmk" : null;
  return { ...board, kind:"vial", uid, protocol, layers, options, macroCount, lighting, tap, combo, override, repeat };
}

async function loadViaBoard(link,definition) {
  const { vendorId,productId }=link.device;
  if (vendorId!==Number(definition.vendorId) || productId!==Number(definition.productId)) {
    throw Error("La definizione VIA non corrisponde agli ID USB del dispositivo selezionato.");
  }
  const board=parseDefinition(definition,"via");
  const protocol=view(await link.request([1],[1])).getUint16(1);
  if (![9,12,13].includes(protocol)) throw Error(translateUi("Versione protocollo VIA non supportata:")+" "+protocol+".");
  // Legacy protocol 9 is experimental: read the map but never write until
  // keycode ABI and the physical keyboard have been verified.
  const readOnly=protocol===9;
  link.readOnly=readOnly;
  const layers=(await link.request([0x11],[0x11]))[1];
  if (!layers || layers>32 || layers*board.rows*board.cols*2>65536) throw Error("Dimensione della mappa VIA non supportata.");
  const options=board.labels.length ? view(await link.request([2,2],[2,2])).getUint32(2) : 0;
  const macroCount=readOnly ? 0 : (await link.request([0x0c],[0x0c]))[1];
  const uid="via-"+vendorId.toString(16).padStart(4,"0")+"-"+productId.toString(16).padStart(4,"0");
  const lighting=readOnly ? null : definition.menus?.includes("qmk_rgblight") ? "via-rgblight"
    : definition.menus?.includes("qmk_rgb_matrix") ? "via-matrix" : null;
  return {...board,kind:"via",uid,protocol,layers,options,macroCount,lighting,readOnly,
    encoderIds:readOnly ? [] : board.encoderIds,
    tap:0,combo:0,override:0,repeat:0};
}

async function readMap(link, board) {
  const size = board.layers * board.rows * board.cols * 2;
  const map = new Uint8Array(size);
  for (let offset = 0; offset < size; offset += 28) {
    const count = Math.min(28, size - offset);
    const cmd = [0x12, ...word(offset), count];
    const reply = await link.request(cmd, cmd);
    map.set(reply.subarray(4, 4 + count), offset);
  }
  const codes = Array.from({ length: size / 2 }, (_, i) => view(map).getUint16(i * 2));
  // A zero from the bulk response can be a genuine KC_NO or a read mismatch.
  // Verify populated physical positions through the standard single-key command.
  const positions = new Set(board.keys.map(key => key.row * board.cols + key.col));
  const area = board.rows * board.cols;
  for (let layer = 0; layer < board.layers; layer++) {
    for (const position of positions) {
      const index = layer * area + position;
      if (codes[index] !== 0) continue;
      const cmd = [0x04, layer, Math.floor(position / board.cols), position % board.cols];
      const reply = await link.request(cmd, cmd);
      codes[index] = view(reply).getUint16(4);
    }
  }
  return codes;
}

async function writeKey(link, board, index, code, previous) {
  const area = board.rows * board.cols;
  const address = [Math.floor(index / area), Math.floor(index % area / board.cols), index % board.cols];
  const reply = await link.request([0x04, ...address], [0x04, ...address]);
  if (view(reply).getUint16(4) === code) return;
  if (view(reply).getUint16(4) !== previous) {
    throw Error("La mappa è cambiata da un altro configuratore. Rileggi la tastiera.");
  }
  const cmd = [0x05, ...address, ...word(code)];
  await link.request(cmd, cmd);
  const check = await link.request([0x04, ...address], [0x04, ...address]);
  if (view(check).getUint16(4) !== code) throw Error("Il firmware ha rifiutato il codice " + hex(code) + ".");
}
