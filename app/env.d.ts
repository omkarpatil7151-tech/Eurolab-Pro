/// <reference types="vite/client" />

interface EurolabDesktopApi {
  appName: string;
  platform: NodeJS.Platform;
  sampleReceiving: {
    getNextCertificateNumber(): Promise<string>;
    listCompanies(): Promise<Array<{ id: number; name: string }>>;
    listBaths(): Promise<Array<{ id: number; name: string }>>;
    save(input: import("@/types/sampleReceiving").SampleReceivingInput): Promise<import("@/types/sampleReceiving").SampleReceivingSaveResult>;
  };
}

interface Window {
  eurolab?: EurolabDesktopApi;
}
