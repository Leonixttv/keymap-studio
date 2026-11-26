"use strict";
const {test} = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const context = vm.createContext({Uint8Array, DataView, Set, Map, Math, Number, Array, Error});
vm.runInContext(fs.readFileSync(require.resolve("../usb.js"), "utf8") +
  "\nglobalThis.parse = parseDefinition; globalThis.active = activeKeys;", context);

test("YMD75-style VIA ISO alternatives show only the selected Enter", () => {
  const board = context.parse({name:"YMD 75 VIA",matrix:{rows:12,cols:9},layouts:{
    labels:["ISO Enter"], keymap:[[
      {w:1.5},"9,3\n\n\n0,0","9,6",
      {x:1.5,w:1.25,h:2,w2:1.5,h2:1,x2:-0.25},"9,3\n\n\n0,1"
    ],[{w:2.25},"8,4\n\n\n0,0","8,6",{x:0.5},"8,4\n\n\n0,1"]]
  }}, "via");
  const positions = option => Array.from(context.active(board, option), k => `${k.row},${k.col}:${k.option ? k.option.join(",") : "always"}`);
  assert.deepEqual(positions(0), ["9,3:0,0", "9,6:always", "8,4:0,0", "8,6:always"]);
  assert.deepEqual(positions(1), ["9,6:always", "9,3:0,1", "8,6:always", "8,4:0,1"]);
});

test("Vial encoder rotation legends are not mistaken for matrix keys", () => {
  const board = context.parse({name:"Encoder",matrix:{rows:1,cols:2},layouts:{keymap:[
    ["0,0\n\n\n\n\n\n\n\n\ne", "0,1\n\n\n\n\n\n\n\n\ne"], ["0,1"]
  ]}});
  assert.deepEqual(Array.from(board.encoderIds), [0]);
  assert.equal(board.keys.length, 1);
  assert.equal(board.keys[0].col, 1);
});

test("K2 HE ANSI definition keeps Enter and the key beside it at their distinct matrix addresses", () => {
  // The geometry and addresses match the manufacturer's K2 HE ANSI VIA JSON.
  const board = context.parse({name:"Keychron K2 HE ANSI RGB",matrix:{rows:6,cols:16},layouts:{keymap:[
    ["3,11", {w:2.25,c:"#777777"}, "3,12", {c:"#cccccc"}, "3,13"]
  ]}}, "via");
  const enter = board.keys.find(k => k.row === 3 && k.col === 12);
  const next = board.keys.find(k => k.row === 3 && k.col === 13);
  assert.equal(enter.width, 2.25);
  assert.equal(next.width, 1);
  assert.equal(next.x, enter.x + enter.width);
  assert.equal(board.keys.length, 3);
});
