import { useMemo, useState } from "react";
import { Bell, LogOut, Search } from "lucide-react";
import { Sidebar } from "@/layouts/Sidebar";
import { Dashboard } from "@/pages/Dashboard";
import { ModulePage } from "@/pages/ModulePage";
import { SampleReceivingPage } from "@/features/sample-receiving/SampleReceivingPage";
import { moduleDescriptions, navigationItems, type NavigationKey } from "@/constants/navigation";

interface AppShellProps {
  onSignOut: () => void;
}

export function AppShell({ onSignOut }: AppShellProps) {
  const [activeItem, setActiveItem] = useState<NavigationKey>("dashboard");

  const activeNavigationItem = useMemo(
    () => navigationItems.find((item) => item.key === activeItem) ?? navigationItems[0],
    [activeItem]
  );

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-950">
      <Sidebar activeItem={activeItem} onSelect={setActiveItem} />

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-8">
          <div>
            <p className="text-sm font-medium text-lab-600">Eurolab Pro</p>
            <h1 className="text-2xl font-semibold text-slate-950">{activeNavigationItem.label}</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden h-11 w-80 items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-4 lg:flex">
              <Search className="h-4 w-4 text-slate-400" />
              <span className="text-sm text-slate-500">Search laboratory records</span>
            </div>
            <button className="grid h-11 w-11 place-items-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:border-lab-200 hover:text-lab-700">
              <Bell className="h-5 w-5" />
            </button>
            <button
              onClick={onSignOut}
              className="grid h-11 w-11 place-items-center rounded-md bg-lab-600 text-white transition hover:bg-lab-700"
              title="Sign out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>

        <section className="flex-1 overflow-auto p-8">
          {activeItem === "dashboard" && <Dashboard onNavigate={setActiveItem} />}
          {activeItem === "sample-receiving" && <SampleReceivingPage />}
          {activeItem !== "dashboard" && activeItem !== "sample-receiving" && (
            <ModulePage icon={activeNavigationItem.icon} title={activeNavigationItem.label} description={moduleDescriptions[activeItem]} />
          )}
        </section>
      </main>
    </div>
  );
}
