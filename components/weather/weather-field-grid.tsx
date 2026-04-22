import { formatDateLabel, formatDateTimeLabel } from "@/lib/date";
import { formatDurationFromSeconds, formatMetric, formatVisibility, labelForField, windCompass } from "@/lib/format";
import { getWeatherCondition } from "@/lib/weather-code";
import type { UnitsMap, WeatherPrimitive, WeatherRecord } from "@/types/weather";

export function WeatherFieldGrid({ record, units }: { record: WeatherRecord; units: UnitsMap }) {
  const entries = Object.entries(record).filter(([key]) => key !== "time" && key !== "interval");

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <div className="rounded-[8px] border border-black/10 bg-white/[0.72] p-4 dark:border-white/10 dark:bg-white/[0.05]">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-500 dark:text-ink-200">Time</p>
        <p className="mt-2 text-sm font-semibold">{record.time.includes("T") ? formatDateTimeLabel(record.time) : formatDateLabel(record.time)}</p>
        <p className="mt-1 break-all font-mono text-xs text-ink-500 dark:text-ink-200">{record.time}</p>
      </div>
      {entries.map(([key, value]) => (
        <div className="rounded-[8px] border border-black/10 bg-white/[0.72] p-4 dark:border-white/10 dark:bg-white/[0.05]" key={key}>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-500 dark:text-ink-200">{labelForField(key)}</p>
          <p className="mt-2 break-words text-lg font-semibold text-ink-900 dark:text-ink-50">{displayWeatherValue(key, value, units)}</p>
          <p className="mt-1 break-all font-mono text-xs text-ink-500 dark:text-ink-200">{key}</p>
        </div>
      ))}
    </div>
  );
}

export function displayWeatherValue(key: string, value: WeatherPrimitive, units: UnitsMap) {
  if (value === null || value === undefined || value === "") {
    return "Unavailable";
  }

  if (key === "weather_code") {
    const condition = getWeatherCondition(value);
    return `${condition.label} (${String(value)})`;
  }

  if (key === "is_day") {
    return value ? "Daylight" : "Night";
  }

  if (key.includes("wind_direction")) {
    return windCompass(value);
  }

  if (key === "visibility") {
    return formatVisibility(value, units[key]);
  }

  if (key.includes("duration") || key === "sunshine_duration") {
    return formatDurationFromSeconds(value);
  }

  if (typeof value === "number") {
    const unit = units[key];
    const digits = unit === "%" || key.includes("weather_code") ? 0 : 1;
    return formatMetric(value, unit, digits);
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return value.includes("T") ? formatDateTimeLabel(value) : value;
}
