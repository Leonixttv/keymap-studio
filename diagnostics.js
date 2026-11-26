"use strict";

// Read-only VIA/Vial requests for one selected key. Keep raw maps and unrelated
// keys out of the report, and keep the two reads independent on failure.
async function diagnoseKey(link, board, layer, key) {
  const offset = 2 * ((layer * board.rows + key.row) * board.cols + key.col);
  const result = {};
  for (const [name, cmd, valueOffset] of [
    ["bulk", [0x12, ...word(offset), 2], 4],
    ["single", [0x04, layer, key.row, key.col], 4],
  ]) {
    try {
      const reply = await link.request(cmd, cmd);
      result[name] = {code: hex(view(reply).getUint16(valueOffset))};
    } catch (error) {
      result[name] = {error: String(error?.message || "Read failed").slice(0, 300)};
    }
  }
  return result;
}

function matchingViaDefinition(definitions, device) {
  const key = device.vendorId.toString(16).padStart(4, "0") + ":" + device.productId.toString(16).padStart(4, "0");
  return definitions[key] ?? null;
}
