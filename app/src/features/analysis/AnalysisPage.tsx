import { useEffect, useMemo, useState } from "react";
import { FlaskConical, Search } from "lucide-react";
import { TextInput } from "@/components/forms/TextInput";
import { SelectInput } from "@/components/forms/SelectInput";
import { analysisRepository } from "@/services/analysisRepository";
import type { AnalysisPendingSampleRecord, AnalysisStatusFilter } from "@/types/analysis";

const statusFilterOptions: AnalysisStatusFilter[] = [
  "All",
  "Pending",
  "In Progress",
  "Completed",
  "Approved",
  "Rejected"
];

interface AnalysisPageProps {
  onOpenDetails: (sampleId: number) => void;
}

export function AnalysisPage({ onOpenDetails }: AnalysisPageProps) {
  const [samples, setSamples] = useState<AnalysisPendingSampleRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [certificateQuery, setCertificateQuery] = useState("");
  const [companyQuery, setCompanyQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<AnalysisStatusFilter>("All");

  useEffect(() => {
    let isMounted = true;
    async function loadSamples() {
      setIsLoading(true);
      setStatusMessage(null);
      try {
        const records = await analysisRepository.listPendingSamples();
        if (!isMounted) return;
        setSamples(records);
      } catch {
        if (isMounted) {
          setStatusMessage("Analysis requires the Eurolab Pro desktop database service.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    void loadSamples();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredSamples = useMemo(() => {
    const certificateTerm = certificateQuery.trim().toLowerCase();
    const companyTerm = companyQuery.trim().toLowerCase();

    return samples.filter((sample) => {
      const matchesCertificate =
        certificateTerm === "" ||
        sample.certificateNumber.toLowerCase().includes(certificateTerm);
      const matchesCompany =
        companyTerm === "" || sample.companyName.toLowerCase().includes(companyTerm);
      const matchesStatus = statusFilter === "All" || sample.status === statusFilter;

      return matchesCertificate && matchesCompany && matchesStatus;
    });
  }, [samples, certificateQuery, companyQuery, statusFilter]);

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-panel">
        <div className="flex items-start gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-md bg-lab-50 text-lab-600">
            <FlaskConical className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-lab-600">Analysis</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Pending sample analysis queue</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
              Review received samples awaiting analysis and open a record to begin the test workflow.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Search by Certificate Number</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <TextInput
                className="pl-9"
                placeholder="LAB.XX.YYYY.NNNN"
                value={certificateQuery}
                onChange={(event) => setCertificateQuery(event.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Search by Company</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <TextInput
                className="pl-9"
                placeholder="Company name"
                value={companyQuery}
                onChange={(event) => setCompanyQuery(event.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Status Filter</label>
            <SelectInput
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as AnalysisStatusFilter)}
            >
              {statusFilterOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </SelectInput>
          </div>
        </div>
      </section>

      {statusMessage ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {statusMessage}
        </div>
      ) : null}

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-[0.08em] text-slate-500">
            <tr>
              <th className="px-5 py-3 font-semibold">Certificate Number</th>
              <th className="px-5 py-3 font-semibold">Company</th>
              <th className="px-5 py-3 font-semibold">Bath</th>
              <th className="px-5 py-3 font-semibold">Received Date</th>
              <th className="px-5 py-3 font-semibold">Testing Type</th>
              <th className="px-5 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-slate-400">
                  Loading pending samples…
                </td>
              </tr>
            ) : filteredSamples.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-slate-400">
                  No pending samples match the current filters.
                </td>
              </tr>
            ) : (
              filteredSamples.map((sample) => (
                <tr
                  key={sample.id}
                  onClick={() => onOpenDetails(sample.id)}
                  className="cursor-pointer transition hover:bg-lab-50"
                >
                  <td className="px-5 py-3 font-medium text-slate-900">{sample.certificateNumber}</td>
                  <td className="px-5 py-3 text-slate-700">{sample.companyName}</td>
                  <td className="px-5 py-3 text-slate-700">{sample.bathName}</td>
                  <td className="px-5 py-3 text-slate-700">{sample.receivedDate}</td>
                  <td className="px-5 py-3 text-slate-700">{sample.testingType}</td>
                  <td className="px-5 py-3">
                    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                      {sample.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}