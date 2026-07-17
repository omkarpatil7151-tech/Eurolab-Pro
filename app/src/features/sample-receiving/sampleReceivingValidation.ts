import type { SampleReceivingFormValues, SampleReceivingInput, TestingType } from "@/types/sampleReceiving";

export type SampleReceivingErrors = Partial<Record<keyof SampleReceivingFormValues, string>>;

const requiredFields: Array<keyof SampleReceivingFormValues> = [
  "certificateNumber",
  "companyId",
  "bathId",
  "receivedDate",
  "receivedBy",
  "testingType",
  "billedTo",
  "email",
  "mobile",
  "sampleDescription"
];

const testingTypes: TestingType[] = ["AMC", "Free", "Chargeable"];

export function validateSampleReceiving(values: SampleReceivingFormValues): SampleReceivingErrors {
  const errors: SampleReceivingErrors = {};

  requiredFields.forEach((field) => {
    if (!String(values[field]).trim()) {
      errors[field] = "Required";
    }
  });

  if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Enter a valid email";
  }

  if (values.mobile && !/^[0-9+\-\s()]{7,20}$/.test(values.mobile)) {
    errors.mobile = "Enter a valid mobile number";
  }

  if (values.testingType && !testingTypes.includes(values.testingType)) {
    errors.testingType = "Select a valid testing type";
  }

  return errors;
}

export function hasValidationErrors(errors: SampleReceivingErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function toSampleReceivingInput(values: SampleReceivingFormValues): SampleReceivingInput {
  return {
    ...(values.id && { id: values.id }),
    certificateNumber: values.certificateNumber.trim(),
    companyId: Number(values.companyId),
    bathId: Number(values.bathId),
    receivedDate: values.receivedDate,
    analysisDate: values.analysisDate,
    submissionDate: values.submissionDate,
    receivedBy: values.receivedBy.trim(),
    testingType: values.testingType as TestingType,
    billedTo: values.billedTo.trim(),
    email: values.email.trim(),
    mobile: values.mobile.trim(),
    sampleDescription: values.sampleDescription.trim(),
    remarks: values.remarks.trim()
  };
}
