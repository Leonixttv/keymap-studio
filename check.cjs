"use strict";
const {spawnSync}=require("node:child_process");
const fs=require("node:fs");
for(const name of [...fs.readdirSync(".").filter(name=>/\.(js|cjs)$/.test(name)),...fs.readdirSync("docs").filter(name=>name.endsWith(".js")).map(name=>"docs/"+name)]){
 const result=spawnSync(process.execPath,["--check",name],{stdio:"inherit"});
 if(result.status!==0) process.exit(result.status??1);
}
