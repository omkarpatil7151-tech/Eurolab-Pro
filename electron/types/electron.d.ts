declare module "electron" {
  export interface BrowserWindowConstructorOptions {
    width?: number;
    height?: number;
    minWidth?: number;
    minHeight?: number;
    title?: string;
    backgroundColor?: string;
    show?: boolean;
    webPreferences?: {
      preload?: string;
      contextIsolation?: boolean;
      nodeIntegration?: boolean;
      sandbox?: boolean;
    };
  }

  export class BrowserWindow {
    constructor(options?: BrowserWindowConstructorOptions);
    static getAllWindows(): BrowserWindow[];
    once(event: "ready-to-show", listener: () => void): this;
    show(): void;
    loadURL(url: string): Promise<void>;
    loadFile(filePath: string): Promise<void>;
  }

  export const app: {
    whenReady(): Promise<void>;
    getPath(name: "userData"): string;
    on(event: "activate" | "window-all-closed", listener: () => void): void;
    quit(): void;
  };

  export const nativeTheme: {
    themeSource: "system" | "light" | "dark";
  };

  export const contextBridge: {
    exposeInMainWorld(apiKey: string, api: unknown): void;
  };

  export const ipcMain: {
    handle(channel: string, listener: (event: unknown, ...args: any[]) => unknown): void;
  };

  export const ipcRenderer: {
    invoke(channel: string, ...args: unknown[]): Promise<unknown>;
  };
}
