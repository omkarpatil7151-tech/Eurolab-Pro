import { clsx } from "clsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode;
  variant?: "primary" | "secondary";
}

export function Button({ children, className, icon, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={clsx(
        "inline-flex h-11 items-center justify-center gap-2 rounded-md px-5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary"
          ? "bg-lab-600 text-white hover:bg-lab-700"
          : "border border-slate-200 bg-white text-slate-700 hover:border-lab-200 hover:text-lab-700",
        className
      )}
    >
      {icon}
      {children}
    </button>
  );
}
