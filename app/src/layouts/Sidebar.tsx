import { FlaskConical } from "lucide-react";
import { clsx } from "clsx";
import { navigationItems, type NavigationKey } from "@/constants/navigation";

interface SidebarProps {
  activeItem: NavigationKey;
  onSelect: (item: NavigationKey) => void;
}

export function Sidebar({ activeItem, onSelect }: SidebarProps) {
  return (
    <aside className="flex h-screen w-72 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-20 items-center gap-3 border-b border-slate-200 px-6">
        <div className="grid h-11 w-11 place-items-center rounded-md bg-lab-600 text-white shadow-sm">
          <FlaskConical className="h-6 w-6" />
        </div>
        <div>
          <p className="text-lg font-semibold text-slate-950">Eurolab Pro</p>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">LIMS Desktop</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.key === activeItem;

          return (
            <button
              key={item.key}
              onClick={() => onSelect(item.key)}
              className={clsx(
                "flex h-11 w-full items-center gap-3 rounded-md px-3 text-left text-sm font-medium transition",
                isActive
                  ? "bg-lab-50 text-lab-700 ring-1 ring-lab-100"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
              )}
            >
              <Icon className={clsx("h-5 w-5", isActive ? "text-lab-600" : "text-slate-400")} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-4">
        <div className="rounded-md bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-800">Laboratory workspace</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">SQLite-backed desktop foundation ready for business modules.</p>
        </div>
      </div>
    </aside>
  );
}
