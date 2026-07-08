import { ipcMain } from "electron";
import {
  sampleReceivingRepository,
  type SampleReceivingInput
} from "../repositories/sampleReceivingRepository";

export function registerSampleReceivingHandlers(): void {
  ipcMain.handle("sample-receiving:get-next-certificate-number", () =>
    sampleReceivingRepository.getNextCertificateNumber()
  );
  ipcMain.handle("sample-receiving:list-companies", () => sampleReceivingRepository.listCompanies());
  ipcMain.handle("sample-receiving:list-baths", (_event, companyId: number) => sampleReceivingRepository.listBaths(companyId));
  ipcMain.handle("sample-receiving:save", (_event, input: SampleReceivingInput) =>
    sampleReceivingRepository.save(input)
  );
}
