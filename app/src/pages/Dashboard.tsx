import { ArrowRight, ClipboardCheck, FlaskConical, TestTube2 } from "lucide-react";
import { navigationItems, type NavigationKey } from "@/constants/navigation";

interface DashboardProps {
  onNavigate: (item: NavigationKey) => void;
}

const workflowCards = [
  {
    title: "Sample Receiving",
    description: "Register samples and prepare them for laboratory processing.",
    key: "sample-receiving" as NavigationKey,
    icon: ClipboardCheck
  },
  {
    title: "Analysis",
    description: "Open the workspace for test execution and result entry.",
    key: "analysis" as NavigationKey,
    icon: TestTube2
  },
  {
    title: "Reports",
    description: "Prepare reviewed laboratory reports for customers.",
    key: "reports" as NavigationKey,
    icon: FlaskConical
  }
];

export function Dashboard({ onNavigate }: DashboardProps) {
  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-slate-200 bg-white p-8 shadow-panel">
        <div className="flex items-start justify-between gap-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-lab-600">Laboratory Command Center</p>
            <h2 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight text-slate-950">
              A clean foundation for managing sample flow, analysis, reports, exports, and history.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-500">
              This UI shell is ready for real laboratory business rules, database tables, and integrations when those workflows are defined.
            </p>
          </div>
          <div className="hidden rounded-md border border-lab-100 bg-lab-50 p-5 text-lab-700 xl:block">
            <FlaskConical className="h-12 w-12" />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-5">
        {workflowCards.map((card) => {
          const Icon = card.icon;

          return (
            <button
              key={card.key}
              onClick={() => onNavigate(card.key)}
              className="rounded-lg border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-lab-200 hover:shadow-panel"
            >
              <div className="flex items-center justify-between">
                <div className="grid h-12 w-12 place-items-center rounded-md bg-lab-50 text-lab-600">
                  <Icon className="h-6 w-6" />
                </div>
                <ArrowRight className="h-5 w-5 text-slate-300" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-slate-950">{card.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{card.description}</p>
            </button>
          );
        })}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-950">System Modules</h3>
            <p className="mt-1 text-sm text-slate-500">Navigation structure for the complete LIMS workspace.</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-5 gap-3">
          {navigationItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.key}
                onClick={() => onNavigate(item.key)}
                className="flex min-h-24 flex-col items-start justify-between rounded-md border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-lab-200 hover:bg-white"
              >
                <Icon className="h-5 w-5 text-lab-600" />
                <span className="text-sm font-medium text-slate-700">{item.label}</span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
