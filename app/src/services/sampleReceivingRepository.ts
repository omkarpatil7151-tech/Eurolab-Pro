import type { SampleReceivingInput, SampleReceivingRecord, SampleReceivingSaveResult, SelectOption } from "@/types/sampleReceiving";

export interface SampleReceivingRepository {
  getNextCertificateNumber(): Promise<string>;
  listCompanies(): Promise<SelectOption[]>;
  listBaths(companyId: number): Promise<SelectOption[]>;
  save(input: SampleReceivingInput): Promise<SampleReceivingSaveResult>;
  listSamples(): Promise<SampleReceivingRecord[]>;
  getSampleById(id: number): Promise<SampleReceivingRecord | undefined>;
  update(input: SampleReceivingInput): Promise<SampleReceivingSaveResult>;
}

function getDesktopApi() {
  if (!window.eurolab) {
    throw new Error("Eurolab desktop API is unavailable.");
  }

  return window.eurolab;
}

export const sampleReceivingRepository: SampleReceivingRepository = {
  getNextCertificateNumber() {
    return getDesktopApi().sampleReceiving.getNextCertificateNumber();
  },
  listCompanies() {
    return getDesktopApi().sampleReceiving.listCompanies();
  },
  listBaths(companyId) {
    return getDesktopApi().sampleReceiving.listBaths(companyId);
  },
  save(input) {
    return getDesktopApi().sampleReceiving.save(input);
  },
  listSamples() {
    return getDesktopApi().sampleReceiving.listSamples();
  },
  getSampleById(id) {
    return getDesktopApi().sampleReceiving.getSampleById(id);
  },
  update(input) {
    return getDesktopApi().sampleReceiving.update(input);
  }
};
