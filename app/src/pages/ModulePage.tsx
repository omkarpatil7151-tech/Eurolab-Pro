import type { LucideIcon } from "lucide-react";

interface ModulePageProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function ModulePage({ icon: Icon, title, description }: ModulePageProps) {
  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-8 shadow-panel">
        <div className="flex items-start gap-5">
          <div className="grid h-14 w-14 place-items-center rounded-md bg-lab-50 text-lab-600">
            <Icon className="h-7 w-7" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-lab-600">Module</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950">{title}</h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-500">{description}</p>
          </div>
        </div>
      </section>

      <section className="grid min-h-[420px] place-items-center rounded-lg border border-dashed border-slate-300 bg-white">
        <div className="max-w-md text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-md bg-slate-50 text-slate-400">
            <Icon className="h-8 w-8" />
          </div>
          <h3 className="mt-5 text-xl font-semibold text-slate-900">{title} workspace</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            UI structure is in place. Add real database schema, validation, permissions, and workflow behavior when the laboratory process is finalized.
          </p>
        </div>
      </section>
    </div>
  );
}
