"use strict";

// Warn only when the last visible MO/TG key on the base layer disappears.
// Other firmware-specific paths may exist, so this is not a reachability proof.
function removedDirectLayerAccess(board, keys, before, after) {
  const modern = board.protocol === 6 || board.kind === "via";
  const bases = modern ? [0x5220, 0x5260] : [0x5100, 0x5300];
  const offsets = [...new Set(keys.map(key => key.row * board.cols + key.col))];
  const hasAccess = (map, target) => offsets.some(index =>
    bases.some(base => map[index] === base + target));
  return Array.from({length: Math.max(0, board.layers - 1)}, (_, i) => i + 1)
    .filter(target => hasAccess(before, target) && !hasAccess(after, target));
}
if (typeof module !== "undefined") module.exports = { removedDirectLayerAccess };
