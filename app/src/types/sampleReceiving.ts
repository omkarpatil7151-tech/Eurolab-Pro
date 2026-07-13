export type TestingType = "AMC" | "Free" | "Chargeable";

export interface SelectOption {
  id: number;
  name: string;
}

export interface SampleReceivingFormValues {
  id?: number; // Optional ID for editing
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
  id?: number; // Optional ID for updating
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

export interface SampleReceivingRecord {
  id: number;
  certificateNumber: string;
  companyId: number;
  companyName: string;
  bathId: number;
  bathName: string;
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
  createdAt: string;
  updatedAt: string;
}
