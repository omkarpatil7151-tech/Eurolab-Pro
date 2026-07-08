export interface CompanyFormValues {
  name: string;
  address: string;
  contactPerson: string;
  mobileNumber: string;
  email: string;
  gstNumber: string;
  city: string;
  state: string;
  pinCode: string;
  isActive: boolean;
}

export interface CompanyInput extends CompanyFormValues {}

export interface CompanyRecord extends CompanyFormValues {
  id: number;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyListQuery {
  search: string;
  page: number;
  pageSize: number;
}

export interface CompanyListResult {
  records: CompanyRecord[];
  total: number;
  page: number;
  pageSize: number;
}
