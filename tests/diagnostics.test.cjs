"use strict";
const {test} = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const context=vm.createContext({Uint8Array,DataView,Set,Map,Math,Number,Array,Error});
context.translateUi=value=>value;
vm.runInContext(fs.readFileSync(require.resolve("../usb.js"),"utf8")+"\n"+
  fs.readFileSync(require.resolve("../diagnostics.js"),"utf8")+
  "\nglobalThis.diagnose=diagnoseKey;globalThis.match=matchingViaDefinition;globalThis.loadVia=loadViaBoard;globalThis.Transport=HidTransport;",context);

test("read only the selected key in the selected layer with both commands",async()=>{
  const requests=[];
  const link={async request(command) {
    requests.push([...command]);
    const response=new Uint8Array(32);response.set(command);
    response[5]=command[0]===0x12 ? 0x4e : 0;
    return response;
  }};
  const result=await context.diagnose(link,{rows:6,cols:16},2,{row:3,col:13});
  assert.deepEqual(requests,[[0x12,1,250,2],[0x04,2,3,13]]);
  assert.equal(result.bulk.code,"0x004E");
  assert.equal(result.single.code,"0x0000");
});

test("report a failed read while still attempting the other read",async()=>{
  let count=0;
  const result=await context.diagnose({async request(command){
    count++;if(command[0]===0x12) throw Error("timeout");
    const reply=new Uint8Array(32);reply.set(command);reply[5]=0x4e;return reply;
  }},{rows:1,cols:1},0,{row:0,col:0});
  assert.equal(count,2); assert.equal(result.bulk.error,"timeout");assert.equal(result.single.code,"0x004E");
});

test("a stored VIA definition applies only to its USB identifiers",()=>{
  const definition={name:"YMD75"};const definitions={"1234:000a":definition};
  assert.equal(context.match(definitions,{vendorId:0x1234,productId:10}),definition);
  assert.equal(context.match(definitions,{vendorId:0x1234,productId:11}),null);
  assert.equal(context.match(definitions,{vendorId:0x5678,productId:10}),null);
});

test("VIA protocol 9 loads as experimental read-only and skips optional write-capable features",async()=>{
  const requests=[];
  const link={device:{vendorId:0x1234,productId:1}, async request(cmd){
    requests.push([...cmd]);const reply=new Uint8Array(32);reply.set(cmd);
    if(cmd[0]===1) reply[2]=9;
    else if(cmd[0]===0x11) reply[1]=4;
    else throw Error("unexpected command");
    return reply;
  }};
  const def={name:"Legacy",vendorId:"0x1234",productId:"0x0001",matrix:{rows:1,cols:1},layouts:{keymap:[["0,0"]]}};
  const board=await context.loadVia(link,def);
  assert.equal(board.protocol,9);assert.equal(board.readOnly,true);assert.equal(link.readOnly,true);
  assert.equal(board.macroCount,0);assert.equal(board.lighting,null);
  assert.deepEqual(requests,[[1],[0x11]]);
});

test("read-only transport rejects keymap and other firmware writes",()=>{
  const device={opened:true,collections:[{usagePage:0xff60,usage:0x61,
    inputReports:[{items:[{reportSize:8,reportCount:32}]}],outputReports:[{items:[{reportSize:8,reportCount:32}]}]}]};
  const link=new context.Transport(device);link.readOnly=true;
  assert.throws(()=>link.request([0x05,0,0,0,0,4]),/solo in lettura/);
  assert.throws(()=>link.request([0x03,2,0,0,0,0]),/solo in lettura/);
});
