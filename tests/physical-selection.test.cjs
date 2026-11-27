"use strict";
const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs"),vm=require("node:vm");
const nodes={physicalSelect:{checked:true,addEventListener(){}},physicalHint:{textContent:""}};
const c=vm.createContext({Map,Set,Array,Number,Math,Element:class{},$:id=>nodes[id],window:{addEventListener(){}},document:{addEventListener(){}},activeKeys:b=>b.keys});
vm.runInContext(fs.readFileSync(require.resolve("../physical-selection.js"),"utf8")+"\nglobalThis.find=findPressedKey;",c);
test("physical selection uses the selected layer rather than guessing layer zero",()=>{
  c.state={board:{rows:1,cols:3,kind:"via",protocol:12,keys:[{row:0,col:0},{row:0,col:1},{row:0,col:2}]},layer:2,saved:[75,74,78,0,0,0,74,75,78]};
  assert.equal(c.find([75])[0].col,1);
  c.state.layer=0;assert.equal(c.find([75])[0].col,0);
});
test("transparent keys fall through to layer zero and duplicate outputs stay ambiguous",()=>{
  c.state={board:{rows:1,cols:3,kind:"via",protocol:12,keys:[{row:0,col:0},{row:0,col:1},{row:0,col:2}]},layer:1,saved:[75,75,78,1,1,0]};
  assert.equal(c.find([75]).length,2);
});

test("USB matrix selects the physical position independently of the assigned keycode", () => {
  const matrix = vm.createContext({
    $: () => ({}),
    document: {addEventListener() {}},
    state: {board: {}}
  });
  vm.runInContext(fs.readFileSync(require.resolve("../matrix.js"), "utf8") +
    "\nglobalThis.presses = newlyPressedMatrixKeys;", matrix);
  const before = new Uint8Array(32);
  before[4] = 1; // Keep an unrelated switch held.
  const after = before.slice();
  after[7] = 1 << 6; // Row 2, col 14 in a 16-column matrix.
  assert.deepEqual(Array.from(matrix.presses(before, after, 6, 16), ({row, col}) => [row, col]), [[2, 14]]);
  after[9] = 1 << 5; // Row 3, col 13 is a distinct physical position.
  assert.deepEqual(Array.from(matrix.presses(before, after, 6, 16), ({row, col}) => [row, col]), [[2, 14], [3, 13]]);
});

test("VIA matrix response skips the row-offset header and decodes K2 HE right-hand keys", () => {
  const matrix = vm.createContext({$: () => ({}), document: {addEventListener() {}}, state: {board: {}}});
  vm.runInContext(fs.readFileSync(require.resolve("../matrix.js"), "utf8") +
    "\nglobalThis.presses = newlyPressedMatrixKeys;", matrix);
  const before = new Uint8Array(32);
  before.set([2, 3, 0]); // get_keyboard_value, switch_matrix_state, starting row
  for (const [row, col] of [[0,14], [0,15], [1,14], [2,14], [3,14]]) {
    const after = before.slice();
    // VIA sends each 16-bit matrix row high byte first.
    after[3 + row * 2] = 1 << (col - 8);
    assert.deepEqual(Array.from(matrix.presses(before, after, 6, 16), ({row, col}) => [row, col]), [[row, col]]);
  }
});
