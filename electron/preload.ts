import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("eurolab", {
  appName: "Eurolab Pro",
  platform: process.platform,
  sampleReceiving: {
    getNextCertificateNumber: () => ipcRenderer.invoke("sample-receiving:get-next-certificate-number"),
    listCompanies: () => ipcRenderer.invoke("sample-receiving:list-companies"),
    listBaths: () => ipcRenderer.invoke("sample-receiving:list-baths"),
    save: (input: unknown) => ipcRenderer.invoke("sample-receiving:save", input)
  }
});
