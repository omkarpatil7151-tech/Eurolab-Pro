import { ipcMain } from "electron";
import { analysisRepository } from "../repositories/analysisRepository";

export function registerAnalysisHandlers(): void {
  ipcMain.handle("analysis:list-pending-samples", () =>
    analysisRepository.listPendingSamples()
  );
}