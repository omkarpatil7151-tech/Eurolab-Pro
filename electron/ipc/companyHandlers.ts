import { ipcMain } from "electron";
import { companyRepository, type CompanyInput, type CompanyListQuery } from "../repositories/companyRepository";

export function registerCompanyHandlers(): void {
  ipcMain.handle("companies:list", (_event, query: CompanyListQuery) => companyRepository.list(query));
  ipcMain.handle("companies:create", (_event, input: CompanyInput) => companyRepository.create(input));
  ipcMain.handle("companies:update", (_event, id: number, input: CompanyInput) => companyRepository.update(id, input));
  ipcMain.handle("companies:delete", (_event, id: number) => companyRepository.softDelete(id));
}
