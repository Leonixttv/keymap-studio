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

test("read a six by sixteen matrix across layers and chunk boundaries", async () => {
  const board = {rows:6, cols:16, layers:4, keys:[{row:2,col:14},{row:3,col:12},{row:3,col:13}]};
  const length = board.rows * board.cols * board.layers * 2;
  const data = new Uint8Array(length);
  const dataView = new DataView(data.buffer);
  const offset = (layer, row, col) => 2 * ((layer * board.rows + row) * board.cols + col);
  dataView.setUint16(offset(2, 2, 14), 0x004b);
  dataView.setUint16(offset(2, 3, 12), 0x0028);
  dataView.setUint16(offset(2, 3, 13), 0x004e);
  const link = {async request(cmd) {
    const reply = new Uint8Array(32);
    reply.set(cmd);
    if (cmd[0] === 0x12) {
      const start = cmd[1] * 256 + cmd[2];
      reply.set(data.subarray(start, start + cmd[3]), 4);
    } else if (cmd[0] === 0x04) {
      reply.set(data.subarray(offset(cmd[1], cmd[2], cmd[3]), offset(cmd[1], cmd[2], cmd[3]) + 2), 4);
    } else throw Error("unexpected command");
    return reply;
  }};
  const map = await context.readMapForTest(link, board);
  const at = (layer, row, col) => map[offset(layer, row, col) / 2];
  assert.equal(at(2, 2, 14), 0x004b);
  assert.equal(at(2, 3, 12), 0x0028);
  assert.equal(at(2, 3, 13), 0x004e);
  assert.equal(at(1, 3, 13), 0);
});
