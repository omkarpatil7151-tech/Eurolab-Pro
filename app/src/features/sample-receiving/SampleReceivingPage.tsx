import { FormEvent, useEffect, useMemo, useState } from "react";
import { ClipboardList, RotateCcw, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/forms/FormField";
import { SelectInput } from "@/components/forms/SelectInput";
import { TextAreaInput } from "@/components/forms/TextAreaInput";
import { TextInput } from "@/components/forms/TextInput";
import { sampleReceivingRepository } from "@/services/sampleReceivingRepository";
import type { SampleReceivingFormValues, SelectOption, TestingType } from "@/types/sampleReceiving";
import {
  hasValidationErrors,
  toSampleReceivingInput,
  validateSampleReceiving,
  type SampleReceivingErrors
} from "./sampleReceivingValidation";

const emptyForm: SampleReceivingFormValues = {
  certificateNumber: "",
  companyId: "",
  bathId: "",
  receivedDate: "",
  analysisDate: "",
  submissionDate: "",
  receivedBy: "",
  testingType: "",
  billedTo: "",
  email: "",
  mobile: "",
  sampleDescription: "",
  remarks: ""
};

const testingTypeOptions: TestingType[] = ["AMC", "Free", "Chargeable"];

export function SampleReceivingPage() {
  const [values, setValues] = useState<SampleReceivingFormValues>(emptyForm);
  const [errors, setErrors] = useState<SampleReceivingErrors>({});
  const [companies, setCompanies] = useState<SelectOption[]>([]);
  const [baths, setBaths] = useState<SelectOption[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const hasReferenceData = useMemo(() => companies.length > 0 && baths.length > 0, [companies.length, baths.length]);

  useEffect(() => {
    let isMounted = true;

    async function loadFormData() {
      try {
        const [certificateNumber, companyOptions, bathOptions] = await Promise.all([
          sampleReceivingRepository.getNextCertificateNumber(),
          sampleReceivingRepository.listCompanies(),
          sampleReceivingRepository.listBaths()
        ]);

        if (!isMounted) {
          return;
        }

        setValues((currentValues) => ({ ...currentValues, certificateNumber }));
        setCompanies(companyOptions);
        setBaths(bathOptions);
      } catch {
        if (isMounted) {
          setStatusMessage("Sample Receiving requires the Eurolab Pro desktop database service.");
        }
      }
    }

    void loadFormData();

    return () => {
      isMounted = false;
    };
  }, []);

  function updateField(field: keyof SampleReceivingFormValues, value: string) {
    setValues((currentValues) => ({ ...currentValues, [field]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [field]: undefined }));
    setStatusMessage(null);
  }

  async function resetForm() {
    try {
      const certificateNumber = await sampleReceivingRepository.getNextCertificateNumber();
      setValues({ ...emptyForm, certificateNumber });
      setErrors({});
      setStatusMessage(null);
    } catch {
      setStatusMessage("Unable to refresh the certificate number.");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors = validateSampleReceiving(values);
    setErrors(validationErrors);

    if (hasValidationErrors(validationErrors)) {
      setStatusMessage("Please complete the required fields.");
      return;
    }

    setIsSaving(true);
    setStatusMessage(null);

    try {
      const result = await sampleReceivingRepository.save(toSampleReceivingInput(values));
      const nextCertificateNumber = await sampleReceivingRepository.getNextCertificateNumber();
      setValues({ ...emptyForm, certificateNumber: nextCertificateNumber });
      setStatusMessage(`Saved sample receiving record ${result.certificateNumber}.`);
    } catch {
      setStatusMessage("Unable to save the sample receiving record.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-panel">
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-md bg-lab-50 text-lab-600">
              <ClipboardList className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-lab-600">Sample Receiving</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">Register received laboratory sample</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                Capture intake details and assign an auto-generated certificate number before analysis begins.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="secondary" icon={<RotateCcw className="h-4 w-4" />} onClick={resetForm}>
              Clear
            </Button>
            <Button type="submit" icon={<Save className="h-4 w-4" />} disabled={isSaving || !hasReferenceData}>
              {isSaving ? "Saving" : "Save"}
            </Button>
          </div>
        </div>

        {!hasReferenceData ? (
          <div className="mt-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Add company and bath records in their modules before saving a sample receiving entry.
          </div>
        ) : null}

        {statusMessage ? (
          <div className="mt-6 rounded-md border border-lab-100 bg-lab-50 px-4 py-3 text-sm text-lab-700">
            {statusMessage}
          </div>
        ) : null}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="grid grid-cols-3 gap-x-5 gap-y-2">
          <FormField label="Certificate Number" required error={errors.certificateNumber}>
            <TextInput value={values.certificateNumber} readOnly hasError={Boolean(errors.certificateNumber)} />
          </FormField>

          <FormField label="Company" required error={errors.companyId}>
            <SelectInput
              value={values.companyId}
              onChange={(event) => updateField("companyId", event.target.value)}
              hasError={Boolean(errors.companyId)}
            >
              <option value="">Select company</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </SelectInput>
          </FormField>

          <FormField label="Bath" required error={errors.bathId}>
            <SelectInput
              value={values.bathId}
              onChange={(event) => updateField("bathId", event.target.value)}
              hasError={Boolean(errors.bathId)}
            >
              <option value="">Select bath</option>
              {baths.map((bath) => (
                <option key={bath.id} value={bath.id}>
                  {bath.name}
                </option>
              ))}
            </SelectInput>
          </FormField>

          <FormField label="Received Date" required error={errors.receivedDate}>
            <TextInput
              type="date"
              value={values.receivedDate}
              onChange={(event) => updateField("receivedDate", event.target.value)}
              hasError={Boolean(errors.receivedDate)}
            />
          </FormField>

          <FormField label="Analysis Date" required error={errors.analysisDate}>
            <TextInput
              type="date"
              value={values.analysisDate}
              onChange={(event) => updateField("analysisDate", event.target.value)}
              hasError={Boolean(errors.analysisDate)}
            />
          </FormField>

          <FormField label="Submission Date" required error={errors.submissionDate}>
            <TextInput
              type="date"
              value={values.submissionDate}
              onChange={(event) => updateField("submissionDate", event.target.value)}
              hasError={Boolean(errors.submissionDate)}
            />
          </FormField>

          <FormField label="Received By" required error={errors.receivedBy}>
            <TextInput
              value={values.receivedBy}
              onChange={(event) => updateField("receivedBy", event.target.value)}
              placeholder="Staff name"
              hasError={Boolean(errors.receivedBy)}
            />
          </FormField>

          <FormField label="Testing Type" required error={errors.testingType}>
            <SelectInput
              value={values.testingType}
              onChange={(event) => updateField("testingType", event.target.value)}
              hasError={Boolean(errors.testingType)}
            >
              <option value="">Select testing type</option>
              {testingTypeOptions.map((testingType) => (
                <option key={testingType} value={testingType}>
                  {testingType}
                </option>
              ))}
            </SelectInput>
          </FormField>

          <FormField label="Billed To" required error={errors.billedTo}>
            <TextInput
              value={values.billedTo}
              onChange={(event) => updateField("billedTo", event.target.value)}
              placeholder="Billing contact"
              hasError={Boolean(errors.billedTo)}
            />
          </FormField>

          <FormField label="Email" required error={errors.email}>
            <TextInput
              type="email"
              value={values.email}
              onChange={(event) => updateField("email", event.target.value)}
              placeholder="contact@company.com"
              hasError={Boolean(errors.email)}
            />
          </FormField>

          <FormField label="Mobile" required error={errors.mobile}>
            <TextInput
              value={values.mobile}
              onChange={(event) => updateField("mobile", event.target.value)}
              placeholder="+91 00000 00000"
              hasError={Boolean(errors.mobile)}
            />
          </FormField>
        </div>

        <div className="mt-2 grid grid-cols-2 gap-x-5 gap-y-2">
          <FormField label="Sample Description" required error={errors.sampleDescription}>
            <TextAreaInput
              value={values.sampleDescription}
              onChange={(event) => updateField("sampleDescription", event.target.value)}
              placeholder="Describe the received sample"
              hasError={Boolean(errors.sampleDescription)}
            />
          </FormField>

          <FormField label="Remarks" error={errors.remarks}>
            <TextAreaInput
              value={values.remarks}
              onChange={(event) => updateField("remarks", event.target.value)}
              placeholder="Internal remarks"
              hasError={Boolean(errors.remarks)}
            />
          </FormField>
        </div>
      </section>
    </form>
  );
}
