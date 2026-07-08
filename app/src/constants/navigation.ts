import {
  BarChart3,
  Beaker,
  Building2,
  ClipboardList,
  Download,
  FileClock,
  FileText,
  FlaskConical,
  Home,
  Settings,
  Sigma
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NavigationKey =
  | "dashboard"
  | "companies"
  | "baths"
  | "sample-receiving"
  | "analysis"
  | "formula-manager"
  | "reports"
  | "excel-export"
  | "history"
  | "settings";

export interface NavigationItem {
  key: NavigationKey;
  label: string;
  icon: LucideIcon;
}

export const navigationItems: NavigationItem[] = [
  { key: "dashboard", label: "Dashboard", icon: Home },
  { key: "companies", label: "Companies", icon: Building2 },
  { key: "baths", label: "Baths", icon: Beaker },
  { key: "sample-receiving", label: "Sample Receiving", icon: ClipboardList },
  { key: "analysis", label: "Analysis", icon: FlaskConical },
  { key: "formula-manager", label: "Formula Manager", icon: Sigma },
  { key: "reports", label: "Reports", icon: FileText },
  { key: "excel-export", label: "Excel Export", icon: Download },
  { key: "history", label: "History", icon: FileClock },
  { key: "settings", label: "Settings", icon: Settings }
];

export const moduleDescriptions: Record<NavigationKey, string> = {
  dashboard: "Laboratory activity overview and operational workspace.",
  companies: "Company records, contacts, and client information.",
  baths: "Bath registrations and process monitoring workspace.",
  "sample-receiving": "Sample intake, labeling, and handover workspace.",
  analysis: "Test execution and result entry workspace.",
  "formula-manager": "Formula setup and controlled calculation workspace.",
  reports: "Report preparation and review workspace.",
  "excel-export": "Structured export workspace for spreadsheet output.",
  history: "Audit history and activity review workspace.",
  settings: "Application preferences and administrative configuration."
};
