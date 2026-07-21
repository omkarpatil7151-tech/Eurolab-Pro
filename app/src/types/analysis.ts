export type AnalysisStatus = "Pending" | "In Progress" | "Completed" | "Approved" | "Rejected";

export interface AnalysisPendingSampleRecord {
  id: number;
  certificateNumber: string;
  companyName: string;
  bathName: string;
  receivedDate: string;
  testingType: string;
  status: AnalysisStatus;
}

export type AnalysisStatusFilter = "All" | AnalysisStatus;