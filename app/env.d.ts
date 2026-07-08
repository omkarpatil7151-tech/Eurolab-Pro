/// <reference types="vite/client" />

interface EurolabDesktopApi {
  appName: string;
  platform: NodeJS.Platform;
  companies: {
    list(query: import("@/types/company").CompanyListQuery): Promise<import("@/types/company").CompanyListResult>;
    create(input: import("@/types/company").CompanyInput): Promise<import("@/types/company").CompanyRecord>;
    update(id: number, input: import("@/types/company").CompanyInput): Promise<import("@/types/company").CompanyRecord>;
    delete(id: number): Promise<void>;
  };
  baths: {
    list(query: import("@/types/bath").BathListQuery): Promise<import("@/types/bath").BathListResult>;
    create(input: import("@/types/bath").BathInput): Promise<import("@/types/bath").BathRecord>;
    update(id: number, input: import("@/types/bath").BathInput): Promise<import("@/types/bath").BathRecord>;
    delete(id: number): Promise<void>;
  };
  standards: {
    list(query: import("@/types/standard").StandardListQuery): Promise<import("@/types/standard").StandardListResult>;
    create(input: import("@/types/standard").StandardInput): Promise<import("@/types/standard").StandardRecord>;
    update(id: number, input: import("@/types/standard").StandardInput): Promise<import("@/types/standard").StandardRecord>;
    delete(id: number): Promise<void>;
  };
  sampleReceiving: {
    getNextCertificateNumber(): Promise<string>;
    listCompanies(): Promise<Array<{ id: number; name: string }>>;
    listBaths(companyId: number): Promise<Array<{ id: number; name: string }>>;
    save(input: import("@/types/sampleReceiving").SampleReceivingInput): Promise<import("@/types/sampleReceiving").SampleReceivingSaveResult>;
  };
}

interface Window {
  eurolab?: EurolabDesktopApi;
}
