import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function MetricCard({
  icon,
  label,
  value,
  detail,
  tone = "neutral",
  className
}: {
  icon: ReactNode;
  label: string;
  value: string;
  detail?: string;
  tone?: "sun" | "rain" | "wind" | "cloud" | "leaf" | "neutral" | "coral";
  className?: string;
}) {
  const toneClass = {
    sun: "bg-weather-sun/[0.16] text-[#8a610d]",
    rain: "bg-weather-rain/[0.14] text-[#276990]",
    wind: "bg-weather-sky/[0.18] text-[#237783]",
    cloud: "bg-ink-100 text-ink-700 dark:bg-white/10 dark:text-ink-100",
    leaf: "bg-weather-leaf/[0.16] text-[#426c38]",
    neutral: "bg-black/5 text-ink-700 dark:bg-white/10 dark:text-ink-100",
    coral: "bg-weather-coral/[0.16] text-[#9b3c2d]"
  }[tone];

  return (
    <div className={cn("rounded-[8px] border border-black/10 bg-white/[0.75] p-4 dark:border-white/10 dark:bg-white/[0.06]", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-500 dark:text-ink-200">{label}</p>
          <p className="mt-2 break-words text-2xl font-semibold tracking-tight text-ink-900 dark:text-ink-50">{value}</p>
          {detail ? <p className="mt-1 text-sm text-ink-500 dark:text-ink-200">{detail}</p> : null}
        </div>
        <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px]", toneClass)}>{icon}</span>
      </div>
    </div>
  );
}
