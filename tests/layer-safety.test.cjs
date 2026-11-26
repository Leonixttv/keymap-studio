"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { removedDirectLayerAccess } = require("../layer-safety");

for (const [name, board, mo, tg] of [
  ["Vial 5", {cols:3, layers:3, protocol:5}, 0x5100, 0x5300],
  ["Vial 6", {cols:3, layers:3, protocol:6}, 0x5220, 0x5260],
  ["VIA 13", {cols:3, layers:3, protocol:13, kind:"via"}, 0x5220, 0x5260],
]) {
  test(`${name}: warn only when the last visible direct access is removed`, () => {
    const keys = [{row:0,col:0}, {row:0,col:1}, {row:0,col:2}];
    assert.deepEqual(removedDirectLayerAccess(board, keys, [mo+1,4,4], [4,4,4]), [1]);
    assert.deepEqual(removedDirectLayerAccess(board, keys, [mo+1,4,4], [4,tg+1,4]), []);
    assert.deepEqual(removedDirectLayerAccess(board, keys, [mo+1,4,4], [4,4,mo+2]), [1]);
    assert.deepEqual(removedDirectLayerAccess(board, keys, [4,4,4], [4,4,4]), []);
    assert.deepEqual(removedDirectLayerAccess(board, keys.slice(0,2), [mo+1,4,4], [4,4,mo+1]), [1]);
  });
}
