import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

type BadgeTone = "sun" | "rain" | "wind" | "leaf" | "cloud" | "neutral" | "coral";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
  tone?: BadgeTone;
};

const tones: Record<BadgeTone, string> = {
  sun: "bg-weather-sun/[0.18] text-[#6b4a07] dark:text-[#ffe0a1]",
  rain: "bg-weather-rain/[0.15] text-[#225d83] dark:text-[#afd9f4]",
  wind: "bg-weather-sky/20 text-[#1d6c75] dark:text-[#a7edf5]",
  leaf: "bg-weather-leaf/[0.18] text-[#3d6535] dark:text-[#d6efcd]",
  cloud: "bg-ink-200 text-ink-700 dark:bg-white/[0.12] dark:text-ink-100",
  neutral: "bg-black/5 text-ink-700 dark:bg-white/10 dark:text-ink-100",
  coral: "bg-weather-coral/[0.16] text-[#8d3728] dark:text-[#ffc7ba]"
};

export function Badge({ children, className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-[8px] px-2.5 py-1 text-xs font-semibold", tones[tone], className)} {...props}>
      {children}
    </span>
  );
}
