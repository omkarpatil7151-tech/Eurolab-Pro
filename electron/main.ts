import { app, BrowserWindow, nativeTheme } from "electron";
import path from "node:path";
import { initializeDatabase } from "./services/database";
import { registerBathHandlers } from "./ipc/bathHandlers";
import { registerCompanyHandlers } from "./ipc/companyHandlers";
import { registerSampleReceivingHandlers } from "./ipc/sampleReceivingHandlers";
import { registerStandardHandlers } from "./ipc/standardHandlers";

const isDevelopment = Boolean(process.env.VITE_DEV_SERVER_URL);

function createMainWindow(): BrowserWindow {
  const mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1180,
    minHeight: 760,
    title: "Eurolab Pro",
    backgroundColor: "#f8fafc",
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  if (isDevelopment && process.env.VITE_DEV_SERVER_URL) {
    void mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    void mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }

  return mainWindow;
}

app.whenReady().then(async () => {
  nativeTheme.themeSource = "light";
  await initializeDatabase(app.getPath("userData"));
  registerBathHandlers();
  registerCompanyHandlers();
  registerSampleReceivingHandlers();
  registerStandardHandlers();
  createMainWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
