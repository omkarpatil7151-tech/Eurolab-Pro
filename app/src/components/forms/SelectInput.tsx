import { clsx } from "clsx";
import type { SelectHTMLAttributes } from "react";

interface SelectInputProps extends SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean;
}

export function SelectInput({ className, hasError, children, ...props }: SelectInputProps) {
  return (
    <select
      {...props}
      className={clsx(
        "h-11 w-full rounded-md border bg-white px-3 text-sm text-slate-900 outline-none transition focus:ring-4",
        hasError
          ? "border-red-300 focus:border-red-500 focus:ring-red-50"
          : "border-slate-200 focus:border-lab-500 focus:ring-lab-50",
        className
      )}
    >
      {children}
    </select>
  );
}
