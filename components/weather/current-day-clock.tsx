"use client";

import { Cloud, Droplets, Moon, Sun, Thermometer, Wind } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { WeatherFieldGrid } from "@/components/weather/weather-field-grid";
import { WeatherIcon } from "@/components/weather/weather-icon";
import { formatDateLabel, formatHour, sameLocalDate } from "@/lib/date";
import { formatMetric } from "@/lib/format";
import { cn } from "@/lib/utils";
import { getWeatherCondition } from "@/lib/weather-code";
import type { UnitsMap, WeatherBundle, WeatherRecord } from "@/types/weather";

export function CurrentDayClock({ data }: { data: WeatherBundle }) {
  const today = data.current.time?.slice(0, 10) || data.forecast.daily[0]?.time || "";
  const hourly = useMemo(() => data.forecast.hourly.filter((row) => sameLocalDate(row.time, today)).slice(0, 24), [data.forecast.hourly, today]);
  const defaultTime = useMemo(() => findNearestHour(hourly, data.current.time)?.time ?? hourly[0]?.time ?? "", [data.current.time, hourly]);
  const [selectedTime, setSelectedTime] = useState(defaultTime);

  useEffect(() => {
    setSelectedTime(defaultTime);
  }, [defaultTime]);

  const selected = hourly.find((row) => row.time === selectedTime) ?? hourly[0];

  if (!hourly.length || !selected) {
    return null;
  }

  return (
    <Card id="today-clock">
      <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-weather-coral">Today by hour</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">Weather clock for {formatDateLabel(today)}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-ink-500 dark:text-ink-200">
            Pick an hour on the clock to inspect the sky mix and every Open-Meteo hourly field for that time.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone="sun">
            <Sun className="h-3.5 w-3.5" />
            Daylight
          </Badge>
          <Badge tone="cloud">
            <Moon className="h-3.5 w-3.5" />
            Night
          </Badge>
          <Badge tone="rain">
            <Cloud className="h-3.5 w-3.5" />
            Cloud intensity
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
          <WeatherClockFace hourly={hourly} selectedTime={selected.time} units={data.units.forecastHourly} onSelect={setSelectedTime} />
          <SelectedHourPanel record={selected} units={data.units.forecastHourly} />
        </div>
        <WeatherFieldGrid record={selected} units={data.units.forecastHourly} />
      </CardContent>
    </Card>
  );
}

function WeatherClockFace({
  hourly,
  selectedTime,
  onSelect,
  units
}: {
  hourly: WeatherRecord[];
  selectedTime: string;
  onSelect: (time: string) => void;
  units: UnitsMap;
}) {
  const selected = hourly.find((row) => row.time === selectedTime) ?? hourly[0];
  const condition = getWeatherCondition(selected.weather_code, isDaylight(selected));

  return (
    <div className="rounded-[8px] border border-black/10 bg-white/[0.72] p-4 dark:border-white/10 dark:bg-white/[0.05]">
      <div className="relative mx-auto aspect-square w-full max-w-[520px] rounded-full border border-black/10 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.82),rgba(117,199,211,0.14)_54%,rgba(23,33,30,0.06)_100%)] shadow-inner dark:border-white/10 dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),rgba(28,154,155,0.12)_54%,rgba(0,0,0,0.12)_100%)]">
        <div className="absolute inset-[20%] rounded-full border border-black/10 bg-white/[0.78] p-4 text-center shadow-soft dark:border-white/10 dark:bg-ink-900/[0.72]">
          <div className="flex h-full flex-col items-center justify-center px-3">
            <WeatherIcon className="h-12 w-12 text-weather-coral" icon={condition.icon} />
            <p className="mt-2 text-sm font-bold uppercase tracking-[0.14em] text-ink-500 dark:text-ink-200">{formatHour(selected.time)}</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight">{formatMetric(selected.temperature_2m, units.temperature_2m, 0)}</p>
            <p className="mt-1 text-sm text-ink-500 dark:text-ink-200">{condition.label}</p>
          </div>
        </div>

        {hourly.map((row) => (
          <HourButton key={row.time} row={row} selected={row.time === selectedTime} onSelect={onSelect} />
        ))}

        {hourly.map((row) => (
          <HourNumber key={`${row.time}-label`} row={row} selected={row.time === selectedTime} />
        ))}
      </div>
    </div>
  );
}

function HourButton({ row, selected, onSelect }: { row: WeatherRecord; selected: boolean; onSelect: (time: string) => void }) {
  const hour = Number(formatHour(row.time).slice(0, 2));
  const { x, y } = getClockPoint(hour, 37);
  const intensity = getHourIntensity(row);
  const daylight = isDaylight(row);
  const style = {
    left: `${x}%`,
    top: `${y}%`,
    backgroundColor: getHourBackground(row, intensity),
    borderColor: selected ? "#ef7d64" : daylight ? "rgba(243,184,75,0.44)" : "rgba(117,199,211,0.36)",
    boxShadow: selected
      ? "0 0 0 4px rgba(239,125,100,0.22), 0 12px 26px rgba(23,33,30,0.22)"
      : `0 0 0 ${Math.round(2 + intensity * 5)}px rgba(255,255,255,${0.04 + intensity * 0.08})`
  } satisfies CSSProperties;
  const condition = getWeatherCondition(row.weather_code, daylight);

  return (
    <button
      aria-label={`${formatHour(row.time)} ${condition.label}, intensity ${Math.round(intensity * 100)} percent`}
      className={cn(
        "absolute flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border text-ink-900 transition hover:scale-110 focus:outline-none focus:ring-4 focus:ring-weather-teal/[0.2] dark:text-ink-50 sm:h-11 sm:w-11",
        selected ? "z-20 scale-110" : "z-10 hover:z-20"
      )}
      onClick={() => onSelect(row.time)}
      style={style}
      type="button"
    >
      <HourGlyph row={row} />
    </button>
  );
}

function HourNumber({ row, selected }: { row: WeatherRecord; selected: boolean }) {
  const hour = Number(formatHour(row.time).slice(0, 2));
  const { x, y } = getClockPoint(hour, 46);

  return (
    <span
      className={cn(
        "pointer-events-none absolute z-30 flex h-5 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-[11px] font-bold leading-none",
        selected
          ? "bg-weather-coral text-white shadow-soft"
          : isDaylight(row)
            ? "text-[#8a610d] dark:text-[#ffd985]"
            : "text-weather-sky"
      )}
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      {String(hour).padStart(2, "0")}
    </span>
  );
}

function HourGlyph({ row }: { row: WeatherRecord }) {
  const daylight = isDaylight(row);
  const condition = getWeatherCondition(row.weather_code, daylight);
  const cloudCover = getNumber(row.cloud_cover);
  const cloudOpacity = Math.max(0.25, Math.min(0.92, (cloudCover ?? 0) / 100));

  if (condition.severity === "rain" || condition.severity === "snow" || condition.severity === "storm" || condition.severity === "fog") {
    return <WeatherIcon className="h-5 w-5" icon={condition.icon} />;
  }

  return (
    <span className="relative flex h-7 w-7 items-center justify-center">
      {daylight ? <Sun className="h-4 w-4 text-weather-sun sm:h-5 sm:w-5" /> : <Moon className="h-4 w-4 text-weather-sky sm:h-5 sm:w-5" />}
      {cloudCover !== null && cloudCover > 12 ? (
        <Cloud
          className="absolute -bottom-0.5 -right-1 h-4 w-4 text-ink-500 dark:text-ink-100 sm:h-5 sm:w-5"
          style={{ opacity: cloudOpacity }}
          strokeWidth={2}
        />
      ) : null}
    </span>
  );
}

function SelectedHourPanel({ record, units }: { record: WeatherRecord; units: UnitsMap }) {
  const condition = getWeatherCondition(record.weather_code, isDaylight(record));

  return (
    <div className="rounded-[8px] border border-black/10 bg-white/[0.72] p-5 dark:border-white/10 dark:bg-white/[0.05]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Badge tone={isDaylight(record) ? "sun" : "cloud"}>{isDaylight(record) ? "Daylight hour" : "Night hour"}</Badge>
          <h3 className="mt-3 text-3xl font-semibold tracking-tight">{formatHour(record.time)}</h3>
          <p className="mt-1 text-sm text-ink-500 dark:text-ink-200">{condition.label}</p>
        </div>
        <div className="flex h-20 w-20 items-center justify-center rounded-[8px] bg-white/[0.65] text-weather-coral shadow-soft dark:bg-white/[0.08]">
          <WeatherIcon className="h-11 w-11" icon={condition.icon} />
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <ClockMetric icon={<Thermometer className="h-4 w-4" />} label="Temperature" value={formatMetric(record.temperature_2m, units.temperature_2m, 0)} />
        <ClockMetric icon={<Thermometer className="h-4 w-4" />} label="Feels like" value={formatMetric(record.apparent_temperature, units.apparent_temperature, 0)} />
        <ClockMetric icon={<Droplets className="h-4 w-4" />} label="Humidity" value={formatMetric(record.relative_humidity_2m, units.relative_humidity_2m, 0)} />
        <ClockMetric icon={<Cloud className="h-4 w-4" />} label="Cloud cover" value={formatMetric(record.cloud_cover, units.cloud_cover, 0)} />
        <ClockMetric icon={<Droplets className="h-4 w-4" />} label="Precip chance" value={formatMetric(record.precipitation_probability, units.precipitation_probability, 0)} />
        <ClockMetric icon={<Wind className="h-4 w-4" />} label="Wind" value={formatMetric(record.wind_speed_10m, units.wind_speed_10m, 0)} />
      </div>
    </div>
  );
}

function ClockMetric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-[8px] border border-black/10 bg-white/[0.64] p-3 dark:border-white/10 dark:bg-white/[0.04]">
      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-ink-500 dark:text-ink-200">
        {icon}
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold">{value}</p>
    </div>
  );
}

function findNearestHour(rows: WeatherRecord[], currentTime: string) {
  const target = new Date(currentTime).getTime();
  if (!Number.isFinite(target)) {
    return rows[0] ?? null;
  }

  return rows.reduce<WeatherRecord | null>((best, row) => {
    if (!best) {
      return row;
    }

    return Math.abs(new Date(row.time).getTime() - target) < Math.abs(new Date(best.time).getTime() - target) ? row : best;
  }, null);
}

function getHourIntensity(row: WeatherRecord) {
  const cloud = (getNumber(row.cloud_cover) ?? 0) / 100;
  const rainChance = (getNumber(row.precipitation_probability) ?? 0) / 100;
  const precipitation = Math.min(1, (getNumber(row.precipitation) ?? 0) / 10);
  const uv = Math.min(1, (getNumber(row.uv_index) ?? 0) / 11);
  const wind = Math.min(1, (getNumber(row.wind_gusts_10m) ?? getNumber(row.wind_speed_10m) ?? 0) / 80);

  return Math.max(cloud, rainChance, precipitation, uv, wind);
}

function getHourBackground(row: WeatherRecord, intensity: number) {
  const condition = getWeatherCondition(row.weather_code, isDaylight(row));

  if (condition.severity === "rain") {
    return `rgba(79,143,192,${0.22 + intensity * 0.46})`;
  }

  if (condition.severity === "storm") {
    return `rgba(239,125,100,${0.22 + intensity * 0.5})`;
  }

  if (condition.severity === "snow" || condition.severity === "fog") {
    return `rgba(215,227,223,${0.5 + intensity * 0.32})`;
  }

  if (isDaylight(row)) {
    return `rgba(243,184,75,${0.18 + intensity * 0.38})`;
  }

  return `rgba(79,143,192,${0.2 + intensity * 0.34})`;
}

function isDaylight(row: WeatherRecord) {
  return row.is_day === 1 || row.is_day === true;
}

function getNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function getClockPoint(hour: number, radius: number) {
  const angle = (hour / 24) * Math.PI * 2 - Math.PI / 2;

  return {
    x: 50 + radius * Math.cos(angle),
    y: 50 + radius * Math.sin(angle)
  };
}
