import clsx from "clsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

type ButtonProps = {
  children: ReactNode;
  variant?: Variant;
  fullWidth?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const baseClasses =
  "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-slate-950 disabled:opacity-60 disabled:cursor-default";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-400 text-white shadow-lg shadow-indigo-500/40 hover:from-indigo-400 hover:via-violet-400 hover:to-emerald-300",
  secondary:
    "border border-slate-600 bg-slate-900/70 text-slate-100 hover:bg-slate-800/80",
  ghost:
    "bg-transparent text-slate-200 hover:bg-slate-800/60 border border-transparent",
  danger:
    "bg-gradient-to-r from-rose-500 to-red-500 text-white hover:from-rose-400 hover:to-red-400",
};

export function Button({
  children,
  variant = "primary",
  fullWidth,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        baseClasses,
        variantClasses[variant],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
