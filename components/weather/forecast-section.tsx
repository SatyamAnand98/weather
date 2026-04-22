"use client";

import { ChevronDown, ChevronUp, CloudRain, Droplets, Snowflake, Sun, Wind } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";

import { HourlyForecastChart } from "@/components/charts/hourly-forecast-chart";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { WeatherIcon } from "@/components/weather/weather-icon";
import { formatDateLabel, formatHour, sameLocalDate } from "@/lib/date";
import { formatDurationFromSeconds, formatMetric, windCompass } from "@/lib/format";
import { getWeatherCondition } from "@/lib/weather-code";
import type { UnitsMap, WeatherRecord } from "@/types/weather";

export function ForecastSection({
  daily,
  hourly,
  dailyUnits,
  hourlyUnits
}: {
  daily: WeatherRecord[];
  hourly: WeatherRecord[];
  dailyUnits: UnitsMap;
  hourlyUnits: UnitsMap;
}) {
  const [expandedDate, setExpandedDate] = useState(daily[0]?.time ?? "");
  const expandedHours = useMemo(() => hourly.filter((row) => sameLocalDate(row.time, expandedDate)), [expandedDate, hourly]);
  const nextHours = useMemo(() => hourly.slice(0, 96), [hourly]);

  return (
    <section className="space-y-5" id="forecast">
      <SectionHeader
        description="A full 16-day outlook with daily cards, precipitation risk, wind, solar, UV, and expandable hourly details."
        eyebrow="Forecast"
        title="Next 16 days"
      />

      <HourlyForecastChart data={nextHours} title="Next 96 hours" />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {daily.map((day) => (
          <DailyForecastCard
            day={day}
            expanded={expandedDate === day.time}
            key={day.time}
            onToggle={() => setExpandedDate((current) => (current === day.time ? "" : day.time))}
            units={dailyUnits}
          />
        ))}
      </div>

      {expandedDate ? (
        <Card>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-weather-coral">Hourly detail</p>
                <h3 className="mt-1 text-xl font-semibold">{formatDateLabel(expandedDate)}</h3>
              </div>
              <Badge tone="wind">{expandedHours.length} hourly readings</Badge>
            </div>
            <HourlyForecastChart data={expandedHours} title={`${formatDateLabel(expandedDate)} by hour`} />
            <HourlyForecastTable hourly={expandedHours} units={hourlyUnits} />
          </CardContent>
        </Card>
      ) : null}
    </section>
  );
}

function DailyForecastCard({
  day,
  units,
  expanded,
  onToggle
}: {
  day: WeatherRecord;
  units: UnitsMap;
  expanded: boolean;
  onToggle: () => void;
}) {
  const condition = getWeatherCondition(day.weather_code, true);

  return (
    <button
      className="rounded-[8px] border border-black/10 bg-white/[0.78] p-4 text-left shadow-soft transition hover:-translate-y-0.5 hover:border-weather-teal/[0.45] hover:shadow-lift dark:border-white/10 dark:bg-white/[0.07]"
      onClick={onToggle}
      type="button"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">{formatDateLabel(day.time)}</p>
          <Badge className="mt-2" tone={condition.severity === "rain" ? "rain" : condition.severity === "clear" ? "sun" : "cloud"}>
            {condition.label}
          </Badge>
        </div>
        <WeatherIcon className="h-8 w-8 text-weather-coral" icon={condition.icon} />
      </div>
      <div className="mt-4 flex items-end gap-2">
        <p className="text-3xl font-semibold tracking-tight">{formatMetric(day.temperature_2m_max, units.temperature_2m_max, 0)}</p>
        <p className="pb-1 text-sm text-ink-500 dark:text-ink-200">/ {formatMetric(day.temperature_2m_min, units.temperature_2m_min, 0)}</p>
      </div>
      <div className="mt-4 grid gap-2 text-sm text-ink-600 dark:text-ink-100">
        <CardLine icon={<CloudRain className="h-4 w-4" />} label="Precip" value={formatMetric(day.precipitation_probability_max, units.precipitation_probability_max, 0)} />
        <CardLine icon={<Droplets className="h-4 w-4" />} label="Rain" value={formatMetric(day.precipitation_sum, units.precipitation_sum, 1)} />
        <CardLine icon={<Snowflake className="h-4 w-4" />} label="Snow" value={formatMetric(day.snowfall_sum, units.snowfall_sum, 1)} />
        <CardLine icon={<Wind className="h-4 w-4" />} label="Wind" value={formatMetric(day.wind_speed_10m_max, units.wind_speed_10m_max, 0)} />
        <CardLine icon={<Sun className="h-4 w-4" />} label="UV" value={formatMetric(day.uv_index_max, units.uv_index_max, 1)} />
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-black/10 pt-3 text-xs font-semibold uppercase tracking-[0.14em] text-ink-500 dark:border-white/10 dark:text-ink-200">
        Details
        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </div>
    </button>
  );
}

function CardLine({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-2">
        {icon}
        {label}
      </span>
      <span className="font-semibold text-ink-900 dark:text-ink-50">{value}</span>
    </div>
  );
}

function HourlyForecastTable({ hourly, units }: { hourly: WeatherRecord[]; units: UnitsMap }) {
  return (
    <div className="overflow-hidden rounded-[8px] border border-black/10 dark:border-white/10">
      <div className="max-h-[520px] overflow-auto">
        <table className="w-full min-w-[920px] border-collapse text-sm">
          <thead className="sticky top-0 bg-ink-50 text-left text-xs uppercase tracking-[0.14em] text-ink-500 dark:bg-ink-900 dark:text-ink-200">
            <tr>
              <th className="px-3 py-3">Time</th>
              <th className="px-3 py-3">Condition</th>
              <th className="px-3 py-3">Temp</th>
              <th className="px-3 py-3">Feels</th>
              <th className="px-3 py-3">Humidity</th>
              <th className="px-3 py-3">Precip</th>
              <th className="px-3 py-3">Rain</th>
              <th className="px-3 py-3">Snow</th>
              <th className="px-3 py-3">Wind</th>
              <th className="px-3 py-3">Pressure</th>
              <th className="px-3 py-3">Clouds</th>
              <th className="px-3 py-3">Sunshine</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/10 dark:divide-white/10">
            {hourly.map((row) => {
              const condition = getWeatherCondition(row.weather_code, row.is_day === 1 || row.is_day === true);
              return (
                <tr className="bg-white/70 dark:bg-white/[0.04]" key={row.time}>
                  <td className="px-3 py-3 font-semibold">{formatHour(row.time)}</td>
                  <td className="px-3 py-3">
                    <span className="inline-flex items-center gap-2">
                      <WeatherIcon className="h-4 w-4 text-weather-coral" icon={condition.icon} />
                      {condition.label}
                    </span>
                  </td>
                  <td className="px-3 py-3">{formatMetric(row.temperature_2m, units.temperature_2m, 0)}</td>
                  <td className="px-3 py-3">{formatMetric(row.apparent_temperature, units.apparent_temperature, 0)}</td>
                  <td className="px-3 py-3">{formatMetric(row.relative_humidity_2m, units.relative_humidity_2m, 0)}</td>
                  <td className="px-3 py-3">{formatMetric(row.precipitation_probability, units.precipitation_probability, 0)}</td>
                  <td className="px-3 py-3">{formatMetric(row.rain, units.rain, 1)}</td>
                  <td className="px-3 py-3">{formatMetric(row.snowfall, units.snowfall, 1)}</td>
                  <td className="px-3 py-3">
                    {formatMetric(row.wind_speed_10m, units.wind_speed_10m, 0)}
                    <span className="block text-xs text-ink-500 dark:text-ink-200">{windCompass(row.wind_direction_10m)}</span>
                  </td>
                  <td className="px-3 py-3">{formatMetric(row.pressure_msl, units.pressure_msl, 0)}</td>
                  <td className="px-3 py-3">{formatMetric(row.cloud_cover, units.cloud_cover, 0)}</td>
                  <td className="px-3 py-3">{formatDurationFromSeconds(row.sunshine_duration)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
