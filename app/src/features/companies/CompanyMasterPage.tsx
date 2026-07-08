import { FormEvent, useEffect, useMemo, useState } from "react";
import { Building2, Edit3, RotateCcw, Save, Search, Trash2 } from "lucide-react";
import { FormField } from "@/components/forms/FormField";
import { TextAreaInput } from "@/components/forms/TextAreaInput";
import { TextInput } from "@/components/forms/TextInput";
import { Button } from "@/components/ui/Button";
import { companyRepository } from "@/services/companyRepository";
import type { CompanyFormValues, CompanyRecord } from "@/types/company";
import { hasCompanyErrors, toCompanyInput, validateCompany, type CompanyErrors } from "./companyValidation";

const emptyForm: CompanyFormValues = {
  name: "",
  address: "",
  contactPerson: "",
  mobileNumber: "",
  email: "",
  gstNumber: "",
  city: "",
  state: "",
  pinCode: "",
  isActive: true
};

const pageSize = 8;

export function CompanyMasterPage() {
  const [values, setValues] = useState<CompanyFormValues>(emptyForm);
  const [errors, setErrors] = useState<CompanyErrors>({});
  const [companies, setCompanies] = useState<CompanyRecord[]>([]);
  const [editingCompanyId, setEditingCompanyId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total]);
  const isEditing = editingCompanyId !== null;

  async function loadCompanies(nextPage = page, nextSearch = search) {
    try {
      const result = await companyRepository.list({ search: nextSearch, page: nextPage, pageSize });
      setCompanies(result.records);
      setTotal(result.total);
      setPage(result.page);
    } catch {
      setStatusMessage("Company Master requires the Eurolab Pro desktop database service.");
    }
  }

  useEffect(() => {
    void loadCompanies(1, "");
  }, []);

  function updateField(field: keyof CompanyFormValues, value: string | boolean) {
    setValues((currentValues) => ({ ...currentValues, [field]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [field]: undefined }));
    setStatusMessage(null);
  }

  function clearForm() {
    setValues(emptyForm);
    setErrors({});
    setEditingCompanyId(null);
    setStatusMessage(null);
  }

  function editCompany(company: CompanyRecord) {
    setEditingCompanyId(company.id);
    setValues({
      name: company.name,
      address: company.address,
      contactPerson: company.contactPerson,
      mobileNumber: company.mobileNumber,
      email: company.email,
      gstNumber: company.gstNumber,
      city: company.city,
      state: company.state,
      pinCode: company.pinCode,
      isActive: company.isActive
    });
    setErrors({});
    setStatusMessage(null);
  }

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors = validateCompany(values);
    setErrors(validationErrors);

    if (hasCompanyErrors(validationErrors)) {
      setStatusMessage("Please complete the required company fields.");
      return;
    }

    setIsSaving(true);
    setStatusMessage(null);

    try {
      if (editingCompanyId) {
        await companyRepository.update(editingCompanyId, toCompanyInput(values));
        setStatusMessage("Company updated successfully.");
      } else {
        await companyRepository.create(toCompanyInput(values));
        setStatusMessage("Company added successfully.");
      }

      clearForm();
      await loadCompanies(1, search);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Unable to save company.");
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteCompany(company: CompanyRecord) {
    const shouldDelete = window.confirm(`Delete ${company.name}? This will soft delete the company.`);

    if (!shouldDelete) {
      return;
    }

    try {
      await companyRepository.delete(company.id);
      setStatusMessage("Company deleted successfully.");
      if (editingCompanyId === company.id) {
        clearForm();
      }
      await loadCompanies(page, search);
    } catch {
      setStatusMessage("Unable to delete company.");
    }
  }

  async function searchCompanies(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await loadCompanies(1, search);
  }

  async function goToPage(nextPage: number) {
    await loadCompanies(Math.min(Math.max(1, nextPage), totalPages), search);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-panel">
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-md bg-lab-50 text-lab-600">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-lab-600">Company Master</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">Manage laboratory client companies</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                Maintain company identity, billing contact details, GST information, and active status for downstream workflows.
              </p>
            </div>
          </div>
        </div>

        {statusMessage ? (
          <div className="mt-6 rounded-md border border-lab-100 bg-lab-50 px-4 py-3 text-sm text-lab-700">
            {statusMessage}
          </div>
        ) : null}
      </section>

      <section className="grid grid-cols-[0.95fr_1.05fr] gap-6">
        <form className="rounded-lg border border-slate-200 bg-white p-6" onSubmit={submitForm}>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-950">{isEditing ? "Edit Company" : "Add Company"}</h3>
              <p className="mt-1 text-sm text-slate-500">Company name must be unique among active records.</p>
            </div>
            <span className="rounded-md bg-lab-50 px-3 py-1 text-xs font-semibold text-lab-700">
              {isEditing ? "Editing" : "New"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <div className="col-span-2">
              <FormField label="Company Name" required error={errors.name}>
                <TextInput
                  value={values.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  placeholder="Company name"
                  hasError={Boolean(errors.name)}
                />
              </FormField>
            </div>

            <div className="col-span-2">
              <FormField label="Company Address" required error={errors.address}>
                <TextAreaInput
                  value={values.address}
                  onChange={(event) => updateField("address", event.target.value)}
                  placeholder="Registered address"
                  hasError={Boolean(errors.address)}
                />
              </FormField>
            </div>

            <FormField label="Contact Person" required error={errors.contactPerson}>
              <TextInput
                value={values.contactPerson}
                onChange={(event) => updateField("contactPerson", event.target.value)}
                placeholder="Contact person"
                hasError={Boolean(errors.contactPerson)}
              />
            </FormField>

            <FormField label="Mobile Number" required error={errors.mobileNumber}>
              <TextInput
                value={values.mobileNumber}
                onChange={(event) => updateField("mobileNumber", event.target.value)}
                placeholder="+91 00000 00000"
                hasError={Boolean(errors.mobileNumber)}
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

            <FormField label="GST Number" error={errors.gstNumber}>
              <TextInput
                value={values.gstNumber}
                onChange={(event) => updateField("gstNumber", event.target.value.toUpperCase())}
                placeholder="15-character GST"
                hasError={Boolean(errors.gstNumber)}
              />
            </FormField>

            <FormField label="City" required error={errors.city}>
              <TextInput
                value={values.city}
                onChange={(event) => updateField("city", event.target.value)}
                placeholder="City"
                hasError={Boolean(errors.city)}
              />
            </FormField>

            <FormField label="State" required error={errors.state}>
              <TextInput
                value={values.state}
                onChange={(event) => updateField("state", event.target.value)}
                placeholder="State"
                hasError={Boolean(errors.state)}
              />
            </FormField>

            <FormField label="PIN Code" required error={errors.pinCode}>
              <TextInput
                value={values.pinCode}
                onChange={(event) => updateField("pinCode", event.target.value)}
                placeholder="PIN code"
                hasError={Boolean(errors.pinCode)}
              />
            </FormField>

            <div className="flex items-center pt-7">
              <label className="flex h-11 w-full items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3">
                <span className="text-sm font-medium text-slate-700">Active Status</span>
                <input
                  type="checkbox"
                  checked={values.isActive}
                  onChange={(event) => updateField("isActive", event.target.checked)}
                  className="h-5 w-5 accent-lab-600"
                />
              </label>
            </div>
          </div>

          <div className="mt-5 flex justify-end gap-3">
            <Button type="button" variant="secondary" icon={<RotateCcw className="h-4 w-4" />} onClick={clearForm}>
              Clear
            </Button>
            <Button type="submit" icon={isEditing ? <Edit3 className="h-4 w-4" /> : <Save className="h-4 w-4" />} disabled={isSaving}>
              {isSaving ? "Saving" : isEditing ? "Update Company" : "Add Company"}
            </Button>
          </div>
        </form>

        <section className="rounded-lg border border-slate-200 bg-white p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-950">Company List</h3>
              <p className="mt-1 text-sm text-slate-500">{total} active company records</p>
            </div>
            <form className="flex w-80 items-center gap-2" onSubmit={searchCompanies}>
              <TextInput
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search company"
              />
              <Button className="px-4" icon={<Search className="h-4 w-4" />}>
                Search
              </Button>
            </form>
          </div>

          <div className="overflow-hidden rounded-md border border-slate-200">
            <table className="w-full table-fixed border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500">
                <tr>
                  <th className="w-[28%] px-4 py-3 font-semibold">Company</th>
                  <th className="w-[22%] px-4 py-3 font-semibold">Contact</th>
                  <th className="w-[18%] px-4 py-3 font-semibold">Location</th>
                  <th className="w-[12%] px-4 py-3 font-semibold">Status</th>
                  <th className="w-[20%] px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {companies.map((company) => (
                  <tr key={company.id} className="hover:bg-slate-50">
                    <td className="px-4 py-4 align-top">
                      <p className="truncate font-semibold text-slate-900">{company.name}</p>
                      <p className="mt-1 truncate text-xs text-slate-500">{company.email}</p>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <p className="truncate text-slate-700">{company.contactPerson}</p>
                      <p className="mt-1 truncate text-xs text-slate-500">{company.mobileNumber}</p>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <p className="truncate text-slate-700">{company.city}</p>
                      <p className="mt-1 truncate text-xs text-slate-500">{company.state}</p>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <span
                        className={
                          company.isActive
                            ? "rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700"
                            : "rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600"
                        }
                      >
                        {company.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right align-top">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => editCompany(company)}
                          className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 text-slate-600 transition hover:border-lab-200 hover:text-lab-700"
                          title="Edit company"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => void deleteCompany(company)}
                          className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 text-slate-600 transition hover:border-red-200 hover:text-red-600"
                          title="Delete company"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {companies.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-sm text-slate-500">
                      No company records found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <div className="mt-5 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button type="button" variant="secondary" disabled={page <= 1} onClick={() => void goToPage(page - 1)}>
                Previous
              </Button>
              <Button type="button" variant="secondary" disabled={page >= totalPages} onClick={() => void goToPage(page + 1)}>
                Next
              </Button>
            </div>
          </div>
        </section>
      </section>
    </div>
  );
}
