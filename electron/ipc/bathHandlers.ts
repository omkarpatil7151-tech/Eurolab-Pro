import { ipcMain } from "electron";
import { bathRepository, type BathInput, type BathListQuery } from "../repositories/bathRepository";

export function registerBathHandlers(): void {
  ipcMain.handle("baths:list", (_event, query: BathListQuery) => bathRepository.list(query));
  ipcMain.handle("baths:create", (_event, input: BathInput) => bathRepository.create(input));
  ipcMain.handle("baths:update", (_event, id: number, input: BathInput) => bathRepository.update(id, input));
  ipcMain.handle("baths:delete", (_event, id: number) => bathRepository.softDelete(id));
}
