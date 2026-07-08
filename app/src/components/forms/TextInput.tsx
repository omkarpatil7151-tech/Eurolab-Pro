import { clsx } from "clsx";
import type { InputHTMLAttributes } from "react";

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export function TextInput({ className, hasError, ...props }: TextInputProps) {
  return (
    <input
      {...props}
      className={clsx(
        "h-11 w-full rounded-md border bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4",
        hasError
          ? "border-red-300 focus:border-red-500 focus:ring-red-50"
          : "border-slate-200 focus:border-lab-500 focus:ring-lab-50",
        props.readOnly ? "bg-slate-50 font-semibold text-slate-600" : null,
        className
      )}
    />
  );
}
