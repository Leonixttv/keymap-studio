"use strict";

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("studioPreferences", {
  load: () => ipcRenderer.invoke("appearance:load"),
  save: (value) => ipcRenderer.invoke("appearance:save", value),
});
