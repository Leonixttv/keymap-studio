"use strict";

const { app, BrowserWindow, dialog, ipcMain, Menu } = require("electron");
const fs = require("node:fs/promises");
const path = require("node:path");

let preferenceWrites = Promise.resolve();

function registerPreferences() {
  const file = path.join(app.getPath("userData"), "appearance.json");
  const previousFile = path.join(app.getPath("appData"), "SAM60 Studio", "appearance.json");
  function validSender(event) {
    return event.senderFrame === event.sender.mainFrame && event.senderFrame?.url.startsWith("file://");
  }
  ipcMain.handle("appearance:load", async (event) => {
    if (!validSender(event)) throw Error("Accesso non valido.");
    await preferenceWrites.catch(() => {});
    try {
      return JSON.parse(await fs.readFile(file, "utf8"));
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
      try { return JSON.parse(await fs.readFile(previousFile,"utf8")); }
      catch (previousError) {
        if (previousError.code === "ENOENT") return null;
        throw previousError;
      }
    }
  });
  ipcMain.handle("appearance:save", (event, data) => {
    if (!validSender(event) || !data ||
        !/^(us|it|uk|de|fr|es|pt|sv|dvorak|colemak)$/.test(data.language) || typeof data.shift !== "boolean" ||
        !/^(it|en|es|fr|de)$/.test(data.uiLanguage) ||
        !/^(forest|ocean|violet|slate)$/.test(data.uiTheme) ||
        !/^(graphite|ocean|cream|violet|arcade|custom)$/.test(data.palette) ||
        !["caseColor","keyColor","accentColor"].every((key) => /^#[0-9a-f]{6}$/i.test(data[key]))) {
      throw Error("Preferenze grafiche non valide.");
    }
    const { language, uiLanguage, uiTheme, shift, palette, caseColor, keyColor, accentColor } = data;
    const safe = { language, uiLanguage, uiTheme, shift, palette, caseColor, keyColor, accentColor };
    preferenceWrites = preferenceWrites.catch(() => {}).then(async () => {
      await fs.mkdir(path.dirname(file), { recursive:true });
      const temporary = file+"."+process.pid+".tmp";
      await fs.writeFile(temporary, JSON.stringify(safe), "utf8");
      await fs.rename(temporary, file);
    });
    return preferenceWrites;
  });
}

function selectHidDevice(window, event, details, callback) {
  event.preventDefault();
  if (details.frame !== window.webContents.mainFrame) return callback();
  const devices = details.deviceList;
  if (devices.length === 0) return callback();
  if (devices.length === 1) return callback(devices[0].deviceId);

  const choice = dialog.showMessageBox(window, {
    title: "Connessione USB",
    message: "Quale tastiera vuoi collegare?",
    buttons: [
      ...devices.map((device) => device.name || device.productName ||
        [device.vendorId, device.productId].map((id) => id.toString(16).padStart(4, "0")).join(":")),
      "Annulla",
    ],
    cancelId: devices.length,
    noLink: true,
  });
  choice.then(({ response }) => callback(devices[response]?.deviceId ?? ""), () => callback(""));
}

function createWindow() {
  if(process.platform==="darwin"){
    Menu.setApplicationMenu(Menu.buildFromTemplate([
      {role:"appMenu"},{role:"editMenu"},{role:"windowMenu"},
    ]));
  } else Menu.setApplicationMenu(null);
  const window = new BrowserWindow({
    width: 1200,
    height: 910,
    minWidth: 440,
    minHeight: 570,
    backgroundColor: "#141616",
    icon: path.join(__dirname, process.platform==="win32" ? "icon.ico" : "icon.png"),
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, "preload.cjs"),
      partition: "keymap-studio",
    },
  });
  const contents = window.webContents;
  const session = contents.session;
  contents.setWindowOpenHandler(() => ({ action: "deny" }));
  contents.on("will-navigate", (event) => event.preventDefault());
  session.setPermissionCheckHandler((requester, permission, origin, details) =>
    requester === contents && permission === "hid" && details.securityOrigin === "file:///");
  session.setPermissionRequestHandler((_requester, _permission, callback) => callback(false));
  const chooser=(event,details,callback)=>selectHidDevice(window,event,details,callback);
  session.on("select-hid-device",chooser);
  window.once("closed",()=>session.removeListener("select-hid-device",chooser));

  window.once("ready-to-show", () => window.show());
  window.loadFile(path.join(__dirname, "index.html")).catch((error) => {
    dialog.showErrorBox("Keymap Studio", error.message);
    app.exit(1);
  });
}

app.whenReady().then(() => {
  registerPreferences();
  createWindow();
});
app.on("window-all-closed", () => {if(process.platform!=="darwin") app.quit();});
app.on("activate", () => {if(BrowserWindow.getAllWindows().length===0) createWindow();});
