import { ipcMain } from "electron";
import { standardRepository, type StandardInput, type StandardListQuery } from "../repositories/standardRepository";

export function registerStandardHandlers(): void {
  ipcMain.handle("standards:list", (_event, query: StandardListQuery) => standardRepository.list(query));
  ipcMain.handle("standards:create", (_event, input: StandardInput) => standardRepository.create(input));
  ipcMain.handle("standards:update", (_event, id: number, input: StandardInput) => standardRepository.update(id, input));
  ipcMain.handle("standards:delete", (_event, id: number) => standardRepository.softDelete(id));
}
