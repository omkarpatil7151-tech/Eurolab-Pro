import type { CompanyFormValues, CompanyInput } from "@/types/company";

export type CompanyErrors = Partial<Record<keyof CompanyFormValues, string>>;

const requiredFields: Array<keyof CompanyFormValues> = [
  "name",
  "address",
  "contactPerson",
  "mobileNumber",
  "email",
  "city",
  "state",
  "pinCode"
];

export function validateCompany(values: CompanyFormValues): CompanyErrors {
  const errors: CompanyErrors = {};

  requiredFields.forEach((field) => {
    if (!String(values[field]).trim()) {
      errors[field] = "Required";
    }
  });

  if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Enter a valid email";
  }

  if (values.mobileNumber && !/^[0-9+\-\s()]{7,20}$/.test(values.mobileNumber)) {
    errors.mobileNumber = "Enter a valid mobile number";
  }

  if (values.pinCode && !/^[0-9]{4,10}$/.test(values.pinCode)) {
    errors.pinCode = "Enter a valid PIN code";
  }

  if (values.gstNumber && !/^[0-9A-Z]{15}$/.test(values.gstNumber.toUpperCase())) {
    errors.gstNumber = "Enter a valid 15-character GST number";
  }

  return errors;
}

export function hasCompanyErrors(errors: CompanyErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function toCompanyInput(values: CompanyFormValues): CompanyInput {
  return {
    name: values.name.trim(),
    address: values.address.trim(),
    contactPerson: values.contactPerson.trim(),
    mobileNumber: values.mobileNumber.trim(),
    email: values.email.trim(),
    gstNumber: values.gstNumber.trim().toUpperCase(),
    city: values.city.trim(),
    state: values.state.trim(),
    pinCode: values.pinCode.trim(),
    isActive: values.isActive
  };
}
