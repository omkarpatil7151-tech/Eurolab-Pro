export interface BathFormValues {
  name: string;
  companyId: string;
  bathType: string;
  capacityLitres: string;
  operatingTemperature: string;
  currentDensity: string;
  remarks: string;
  isActive: boolean;
}

export interface BathInput {
  name: string;
  companyId: number;
  bathType: string;
  capacityLitres: number;
  operatingTemperature: string;
  currentDensity: string;
  remarks: string;
  isActive: boolean;
}

export interface BathRecord {
  id: number;
  name: string;
  companyId: number;
  companyName: string;
  bathType: string;
  capacityLitres: number;
  operatingTemperature: string;
  currentDensity: string;
  remarks: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BathListQuery {
  search: string;
  page: number;
  pageSize: number;
}

export interface BathListResult {
  records: BathRecord[];
  total: number;
  page: number;
  pageSize: number;
}
