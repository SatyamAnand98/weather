"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "icon";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-ink-900 text-white shadow-lift hover:bg-ink-700 dark:bg-weather-sun dark:text-ink-900 dark:hover:bg-[#f7c86d]",
  secondary:
    "border border-black/10 bg-[var(--button-bg)] text-[var(--button-fg)] [--button-bg:#ffffff] [--button-fg:#17211e] hover:border-weather-teal/[0.45] hover:[--button-bg:#e9f6f5] dark:border-white/20 dark:[--button-bg:#26332f] dark:[--button-fg:#f7faf8] dark:hover:border-weather-sky/[0.45] dark:hover:[--button-bg:#33433e]",
  ghost:
    "bg-transparent text-ink-700 hover:bg-black/5 dark:text-ink-50 dark:hover:bg-white/[0.08]",
  danger: "bg-weather-coral text-white hover:bg-[#d86b54]"
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 gap-2 px-3 text-sm",
  md: "h-11 gap-2 px-4 text-sm",
  icon: "h-10 w-10 justify-center p-0"
};

export function Button({ children, className, variant = "primary", size = "md", type = "button", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-[8px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}
