import { FormEvent, useEffect, useMemo, useState } from "react";
import { Beaker, Edit3, RotateCcw, Save, Search, Trash2 } from "lucide-react";
import { FormField } from "@/components/forms/FormField";
import { SelectInput } from "@/components/forms/SelectInput";
import { TextAreaInput } from "@/components/forms/TextAreaInput";
import { TextInput } from "@/components/forms/TextInput";
import { Button } from "@/components/ui/Button";
import { bathRepository } from "@/services/bathRepository";
import { sampleReceivingRepository } from "@/services/sampleReceivingRepository";
import type { BathFormValues, BathRecord } from "@/types/bath";
import type { SelectOption } from "@/types/sampleReceiving";
import { hasBathErrors, toBathInput, validateBath, type BathErrors } from "./bathValidation";

const emptyForm: BathFormValues = {
  name: "",
  companyId: "",
  bathType: "",
  capacityLitres: "",
  operatingTemperature: "",
  currentDensity: "",
  remarks: "",
  isActive: true
};

const bathTypeOptions = ["Process", "Rinse", "Cleaning", "Treatment", "Storage", "Other"];
const pageSize = 8;

export function BathMasterPage() {
  const [values, setValues] = useState<BathFormValues>(emptyForm);
  const [errors, setErrors] = useState<BathErrors>({});
  const [companies, setCompanies] = useState<SelectOption[]>([]);
  const [baths, setBaths] = useState<BathRecord[]>([]);
  const [editingBathId, setEditingBathId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total]);
  const isEditing = editingBathId !== null;

  async function loadBaths(nextPage = page, nextSearch = search) {
    try {
      const result = await bathRepository.list({ search: nextSearch, page: nextPage, pageSize });
      setBaths(result.records);
      setTotal(result.total);
      setPage(result.page);
    } catch {
      setStatusMessage("Bath Master requires the Eurolab Pro desktop database service.");
    }
  }

  useEffect(() => {
    async function loadInitialData() {
      try {
        const activeCompanies = await sampleReceivingRepository.listCompanies();
        setCompanies(activeCompanies);
        await loadBaths(1, "");
      } catch {
        setStatusMessage("Bath Master requires the Eurolab Pro desktop database service.");
      }
    }

    void loadInitialData();
  }, []);

  function updateField(field: keyof BathFormValues, value: string | boolean) {
    setValues((currentValues) => ({ ...currentValues, [field]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [field]: undefined }));
    setStatusMessage(null);
  }

  function clearForm() {
    setValues(emptyForm);
    setErrors({});
    setEditingBathId(null);
    setStatusMessage(null);
  }

  function editBath(bath: BathRecord) {
    setEditingBathId(bath.id);
    setValues({
      name: bath.name,
      companyId: String(bath.companyId),
      bathType: bath.bathType,
      capacityLitres: String(bath.capacityLitres),
      operatingTemperature: bath.operatingTemperature,
      currentDensity: bath.currentDensity,
      remarks: bath.remarks,
      isActive: bath.isActive
    });
    setErrors({});
    setStatusMessage(null);
  }

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors = validateBath(values);
    setErrors(validationErrors);

    if (hasBathErrors(validationErrors)) {
      setStatusMessage("Please complete the required bath fields.");
      return;
    }

    setIsSaving(true);
    setStatusMessage(null);

    try {
      if (editingBathId) {
        await bathRepository.update(editingBathId, toBathInput(values));
        setStatusMessage("Bath updated successfully.");
      } else {
        await bathRepository.create(toBathInput(values));
        setStatusMessage("Bath added successfully.");
      }

      clearForm();
      await loadBaths(1, search);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Unable to save bath.");
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteBath(bath: BathRecord) {
    const shouldDelete = window.confirm(`Delete ${bath.name}? This will soft delete the bath.`);

    if (!shouldDelete) {
      return;
    }

    try {
      await bathRepository.delete(bath.id);
      setStatusMessage("Bath deleted successfully.");
      if (editingBathId === bath.id) {
        clearForm();
      }
      await loadBaths(page, search);
    } catch {
      setStatusMessage("Unable to delete bath.");
    }
  }

  async function searchBaths(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await loadBaths(1, search);
  }

  async function goToPage(nextPage: number) {
    await loadBaths(Math.min(Math.max(1, nextPage), totalPages), search);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-panel">
        <div className="flex items-start gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-md bg-lab-50 text-lab-600">
            <Beaker className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-lab-600">Bath Master</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Manage company bath records</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
              Maintain bath setup, operating parameters, and company ownership for sample receiving workflows.
            </p>
          </div>
        </div>

        {companies.length === 0 ? (
          <div className="mt-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Add an active company before creating bath records.
          </div>
        ) : null}

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
              <h3 className="text-lg font-semibold text-slate-950">{isEditing ? "Edit Bath" : "Add Bath"}</h3>
              <p className="mt-1 text-sm text-slate-500">Bath names must be unique under the selected company.</p>
            </div>
            <span className="rounded-md bg-lab-50 px-3 py-1 text-xs font-semibold text-lab-700">
              {isEditing ? "Editing" : "New"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <FormField label="Bath Name" required error={errors.name}>
              <TextInput
                value={values.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="Bath name"
                hasError={Boolean(errors.name)}
              />
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

            <FormField label="Bath Type" required error={errors.bathType}>
              <SelectInput
                value={values.bathType}
                onChange={(event) => updateField("bathType", event.target.value)}
                hasError={Boolean(errors.bathType)}
              >
                <option value="">Select bath type</option>
                {bathTypeOptions.map((bathType) => (
                  <option key={bathType} value={bathType}>
                    {bathType}
                  </option>
                ))}
              </SelectInput>
            </FormField>

            <FormField label="Bath Capacity (Litres)" required error={errors.capacityLitres}>
              <TextInput
                type="number"
                min="0"
                step="0.01"
                value={values.capacityLitres}
                onChange={(event) => updateField("capacityLitres", event.target.value)}
                placeholder="0.00"
                hasError={Boolean(errors.capacityLitres)}
              />
            </FormField>

            <FormField label="Operating Temperature" required error={errors.operatingTemperature}>
              <TextInput
                value={values.operatingTemperature}
                onChange={(event) => updateField("operatingTemperature", event.target.value)}
                placeholder="Example: 45 C"
                hasError={Boolean(errors.operatingTemperature)}
              />
            </FormField>

            <FormField label="Current Density" required error={errors.currentDensity}>
              <TextInput
                value={values.currentDensity}
                onChange={(event) => updateField("currentDensity", event.target.value)}
                placeholder="Example: 2.5 A/dm2"
                hasError={Boolean(errors.currentDensity)}
              />
            </FormField>

            <div className="col-span-2">
              <FormField label="Remarks" error={errors.remarks}>
                <TextAreaInput
                  value={values.remarks}
                  onChange={(event) => updateField("remarks", event.target.value)}
                  placeholder="Bath notes or operating remarks"
                  hasError={Boolean(errors.remarks)}
                />
              </FormField>
            </div>

            <div className="col-span-2 flex items-center">
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
            <Button type="submit" icon={isEditing ? <Edit3 className="h-4 w-4" /> : <Save className="h-4 w-4" />} disabled={isSaving || companies.length === 0}>
              {isSaving ? "Saving" : isEditing ? "Update Bath" : "Add Bath"}
            </Button>
          </div>
        </form>

        <section className="rounded-lg border border-slate-200 bg-white p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-950">Bath List</h3>
              <p className="mt-1 text-sm text-slate-500">{total} active bath records</p>
            </div>
            <form className="flex w-80 items-center gap-2" onSubmit={searchBaths}>
              <TextInput value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search bath" />
              <Button className="px-4" icon={<Search className="h-4 w-4" />}>
                Search
              </Button>
            </form>
          </div>

          <div className="overflow-hidden rounded-md border border-slate-200">
            <table className="w-full table-fixed border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500">
                <tr>
                  <th className="w-[24%] px-4 py-3 font-semibold">Bath</th>
                  <th className="w-[24%] px-4 py-3 font-semibold">Company</th>
                  <th className="w-[18%] px-4 py-3 font-semibold">Type</th>
                  <th className="w-[14%] px-4 py-3 font-semibold">Status</th>
                  <th className="w-[20%] px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {baths.map((bath) => (
                  <tr key={bath.id} className="hover:bg-slate-50">
                    <td className="px-4 py-4 align-top">
                      <p className="truncate font-semibold text-slate-900">{bath.name}</p>
                      <p className="mt-1 truncate text-xs text-slate-500">{bath.capacityLitres} L</p>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <p className="truncate text-slate-700">{bath.companyName}</p>
                      <p className="mt-1 truncate text-xs text-slate-500">{bath.operatingTemperature}</p>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <p className="truncate text-slate-700">{bath.bathType}</p>
                      <p className="mt-1 truncate text-xs text-slate-500">{bath.currentDensity}</p>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <span
                        className={
                          bath.isActive
                            ? "rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700"
                            : "rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600"
                        }
                      >
                        {bath.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right align-top">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => editBath(bath)}
                          className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 text-slate-600 transition hover:border-lab-200 hover:text-lab-700"
                          title="Edit bath"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => void deleteBath(bath)}
                          className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 text-slate-600 transition hover:border-red-200 hover:text-red-600"
                          title="Delete bath"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {baths.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-sm text-slate-500">
                      No bath records found.
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
