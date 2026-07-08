export type TestingType = "AMC" | "Free" | "Chargeable";

export interface SelectOption {
  id: number;
  name: string;
}

export interface SampleReceivingFormValues {
  certificateNumber: string;
  companyId: string;
  bathId: string;
  receivedDate: string;
  analysisDate: string;
  submissionDate: string;
  receivedBy: string;
  testingType: TestingType | "";
  billedTo: string;
  email: string;
  mobile: string;
  sampleDescription: string;
  remarks: string;
}

export interface SampleReceivingInput {
  certificateNumber: string;
  companyId: number;
  bathId: number;
  receivedDate: string;
  analysisDate: string;
  submissionDate: string;
  receivedBy: string;
  testingType: TestingType;
  billedTo: string;
  email: string;
  mobile: string;
  sampleDescription: string;
  remarks: string;
}

export interface SampleReceivingSaveResult {
  id: number;
  certificateNumber: string;
}
