import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("eurolab", {
  appName: "Eurolab Pro",
  platform: process.platform,
  companies: {
    list: (query: unknown) => ipcRenderer.invoke("companies:list", query),
    create: (input: unknown) => ipcRenderer.invoke("companies:create", input),
    update: (id: number, input: unknown) => ipcRenderer.invoke("companies:update", id, input),
    delete: (id: number) => ipcRenderer.invoke("companies:delete", id)
  },
  baths: {
    list: (query: unknown) => ipcRenderer.invoke("baths:list", query),
    create: (input: unknown) => ipcRenderer.invoke("baths:create", input),
    update: (id: number, input: unknown) => ipcRenderer.invoke("baths:update", id, input),
    delete: (id: number) => ipcRenderer.invoke("baths:delete", id)
  },
  sampleReceiving: {
    getNextCertificateNumber: () => ipcRenderer.invoke("sample-receiving:get-next-certificate-number"),
    listCompanies: () => ipcRenderer.invoke("sample-receiving:list-companies"),
    listBaths: (companyId: number) => ipcRenderer.invoke("sample-receiving:list-baths", companyId),
    save: (input: unknown) => ipcRenderer.invoke("sample-receiving:save", input)
  }
});
