import { app, BrowserWindow } from "electron";
import { join } from "path";
import { registerIpcHandlers } from "./ipcHandlers";

function createWindow(preloadPath: string) {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: preloadPath,
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
  // Register IPC handlers before creating any renderer windows so handlers
  // are ready when the renderer's preload tries to invoke them.
  registerIpcHandlers();

  const preloadPath = join(__dirname, "preload.js");
  createWindow(preloadPath);
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    const preloadPath = join(__dirname, "preload.js");
    createWindow(preloadPath);
  }
});
