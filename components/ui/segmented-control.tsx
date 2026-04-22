"use client";

import { cn } from "@/lib/utils";

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  className
}: {
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex rounded-[8px] border border-black/10 bg-[var(--segment-bg)] p-1 [--segment-bg:#ffffff] dark:border-white/20 dark:[--segment-bg:#26332f]",
        className
      )}
    >
      {options.map((option) => (
        <button
          className={cn(
            "h-9 rounded-[6px] px-3 text-sm font-semibold transition",
            value === option.value
              ? "bg-ink-900 text-white dark:bg-weather-sun dark:text-ink-900"
              : "text-ink-600 hover:bg-black/5 dark:text-ink-100 dark:hover:bg-white/[0.08]"
          )}
          key={option.value}
          onClick={() => onChange(option.value)}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
