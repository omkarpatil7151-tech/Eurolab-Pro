import type { CompanyInput, CompanyListQuery, CompanyListResult, CompanyRecord } from "@/types/company";

export interface CompanyRepository {
  list(query: CompanyListQuery): Promise<CompanyListResult>;
  create(input: CompanyInput): Promise<CompanyRecord>;
  update(id: number, input: CompanyInput): Promise<CompanyRecord>;
  delete(id: number): Promise<void>;
}

function getDesktopApi() {
  if (!window.eurolab) {
    throw new Error("Eurolab desktop API is unavailable.");
  }

  return window.eurolab;
}

export const companyRepository: CompanyRepository = {
  list(query) {
    return getDesktopApi().companies.list(query);
  },
  create(input) {
    return getDesktopApi().companies.create(input);
  },
  update(id, input) {
    return getDesktopApi().companies.update(id, input);
  },
  delete(id) {
    return getDesktopApi().companies.delete(id);
  }
};
