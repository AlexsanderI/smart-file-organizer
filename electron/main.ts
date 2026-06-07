import { app, BrowserWindow } from "electron";
import { join } from "path";
import { registerIpcHandlers } from "./ipcHandlers";

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const devURL = "http://localhost:5173";
  const prodURL = `file://${join(__dirname, "../dist/index.html")}`;

  if (app.isPackaged) {
    mainWindow.loadURL(prodURL);
  } else {
    mainWindow.loadURL(devURL);
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(() => {
  registerIpcHandlers();
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
