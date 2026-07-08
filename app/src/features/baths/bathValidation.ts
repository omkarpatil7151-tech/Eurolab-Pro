import type { BathFormValues, BathInput } from "@/types/bath";

export type BathErrors = Partial<Record<keyof BathFormValues, string>>;

const requiredFields: Array<keyof BathFormValues> = [
  "name",
  "companyId",
  "bathType",
  "capacityLitres",
  "operatingTemperature",
  "currentDensity"
];

export function validateBath(values: BathFormValues): BathErrors {
  const errors: BathErrors = {};

  requiredFields.forEach((field) => {
    if (!String(values[field]).trim()) {
      errors[field] = "Required";
    }
  });

  const capacity = Number(values.capacityLitres);
  if (values.capacityLitres && (!Number.isFinite(capacity) || capacity <= 0)) {
    errors.capacityLitres = "Enter a capacity greater than 0";
  }

  return errors;
}

export function hasBathErrors(errors: BathErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function toBathInput(values: BathFormValues): BathInput {
  return {
    name: values.name.trim(),
    companyId: Number(values.companyId),
    bathType: values.bathType.trim(),
    capacityLitres: Number(values.capacityLitres),
    operatingTemperature: values.operatingTemperature.trim(),
    currentDensity: values.currentDensity.trim(),
    remarks: values.remarks.trim(),
    isActive: values.isActive
  };
}
