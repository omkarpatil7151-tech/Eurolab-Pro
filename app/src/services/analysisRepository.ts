import type { AnalysisPendingSampleRecord } from "@/types/analysis";

export interface AnalysisRepository {
  listPendingSamples(): Promise<AnalysisPendingSampleRecord[]>;
}

function getDesktopApi() {
  if (!window.eurolab) {
    throw new Error("Eurolab desktop API is unavailable.");
  }

  return window.eurolab;
}

export const analysisRepository: AnalysisRepository = {
  listPendingSamples() {
    return getDesktopApi().analysis.listPendingSamples();
  }
};