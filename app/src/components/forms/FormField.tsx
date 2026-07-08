import { clsx } from "clsx";
import type { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}

export function FormField({ label, error, required, children }: FormFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-1 text-sm font-medium text-slate-700">
        {label}
        {required ? <span className="text-lab-600">*</span> : null}
      </span>
      {children}
      <span className={clsx("mt-1 block min-h-5 text-xs", error ? "text-red-600" : "text-transparent")}>
        {error ?? "No error"}
      </span>
    </label>
  );
}
