import { clsx } from "clsx";
import type { TextareaHTMLAttributes } from "react";

interface TextAreaInputProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

export function TextAreaInput({ className, hasError, ...props }: TextAreaInputProps) {
  return (
    <textarea
      {...props}
      className={clsx(
        "min-h-28 w-full resize-none rounded-md border bg-white px-3 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4",
        hasError
          ? "border-red-300 focus:border-red-500 focus:ring-red-50"
          : "border-slate-200 focus:border-lab-500 focus:ring-lab-50",
        className
      )}
    />
  );
}
