import { ArrowLeft, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface AnalysisDetailsPageProps {
  sampleId: number;
  onBack: () => void;
}

export function AnalysisDetailsPage({ sampleId, onBack }: AnalysisDetailsPageProps) {
  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-panel">
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-md bg-lab-50 text-lab-600">
              <FlaskConical className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-lab-600">Analysis Details</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">Sample #{sampleId}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                Result entry, formula engine, and report generation are planned for later sprints.
              </p>
            </div>
          </div>

          <Button type="button" variant="secondary" icon={<ArrowLeft className="h-4 w-4" />} onClick={onBack}>
            Back to queue
          </Button>
        </div>
      </section>

      <section className="grid min-h-[420px] place-items-center rounded-lg border border-dashed border-slate-300 bg-white">
        <div className="max-w-md text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-md bg-slate-50 text-slate-400">
            <FlaskConical className="h-8 w-8" />
          </div>
          <h3 className="mt-5 text-xl font-semibold text-slate-900">Analysis details workspace</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Navigation to this record is wired up. Result entry and the formula engine will be implemented in a later phase.
          </p>
        </div>
      </section>
    </div>
  );
}