"use strict";
const {test} = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const code = fs.readFileSync(require.resolve("../usb.js"), "utf8");
const context = vm.createContext({Uint8Array, DataView, Set, Math, Number, Array, Error});
vm.runInContext(code + "\nglobalThis.readMapForTest = readMap;", context);

test("verify zero keycodes using single-key reads without reading unused matrix positions", async () => {
  const board = {rows:1,cols:3,layers:1,keys:[{row:0,col:0},{row:0,col:1},{row:0,col:1}]};
  const requests = [];
  const link = {async request(cmd) {
    requests.push([...cmd]);
    const reply = new Uint8Array(32);
    reply.set(cmd);
    if (cmd[0] === 0x12) reply.set([0,0,0,0,0,0],4);
    else if (cmd[0] === 0x04) new DataView(reply.buffer).setUint16(4,cmd[3] === 0 ? 0x4e : 0);
    else throw Error("unexpected command");
    return reply;
  }};
  assert.deepEqual(Array.from(await context.readMapForTest(link,board)),[0x4e,0,0]);
  assert.deepEqual(requests,[[0x12,0,0,6],[4,0,0,0],[4,0,0,1]]);
});
