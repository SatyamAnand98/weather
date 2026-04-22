"use client";

import { Cloud, Droplets, Gauge, Leaf, Sun, Wind } from "lucide-react";
import { useMemo, useState } from "react";

import { HistoricalDailyChart } from "@/components/charts/historical-daily-chart";
import { HistoricalHourlyChart } from "@/components/charts/historical-hourly-chart";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { MetricCard } from "@/components/weather/metric-card";
import { formatDateLabel } from "@/lib/date";
import { formatMetric, labelForField } from "@/lib/format";
import { selectClassName } from "@/lib/styles";
import type { HistoricalSummary, UnitsMap, WeatherRecord } from "@/types/weather";

type DayRange = "30" | "60" | "90";
type HourRange = "7" | "14" | "30" | "90";

export function HistoricalSection({
  startDate,
  endDate,
  summaries,
  daily,
  hourly,
  dailyUnits,
  hourlyUnits
}: {
  startDate: string;
  endDate: string;
  summaries: HistoricalSummary[];
  daily: WeatherRecord[];
  hourly: WeatherRecord[];
  dailyUnits: UnitsMap;
  hourlyUnits: UnitsMap;
}) {
  const [dayRange, setDayRange] = useState<DayRange>("90");
  const [hourRange, setHourRange] = useState<HourRange>("14");
  const [hourlyVariable, setHourlyVariable] = useState("temperature_2m");

  const filteredDaily = useMemo(() => daily.slice(-Number(dayRange)), [daily, dayRange]);
  const filteredHourly = useMemo(() => hourly.slice(-Number(hourRange) * 24), [hourly, hourRange]);
  const variableOptions = useMemo(
    () => Object.keys(hourlyUnits).filter((key) => key !== "time").filter((key) => hourly.some((row) => typeof row[key] === "number")),
    [hourly, hourlyUnits]
  );

  return (
    <section className="space-y-5" id="history">
      <SectionHeader
        action={<Badge tone="leaf">{formatDateLabel(startDate)} to {formatDateLabel(endDate)}</Badge>}
        description="Open-Meteo archive data for the previous 3 months with daily summaries and hourly variable charts."
        eyebrow="History"
        title="Previous 3 months"
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {summaries.map((summary) => (
          <MetricCard
            detail={summary.date ? formatDateLabel(summary.date) : "Previous 90 days"}
            icon={summaryIcon(summary.tone)}
            key={summary.id}
            label={summary.label}
            tone={summary.tone}
            value={typeof summary.value === "number" ? formatMetric(summary.value, summary.unit, summary.unit === "%" ? 0 : 1) : String(summary.value ?? "Unavailable")}
          />
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SegmentedControl
          onChange={setDayRange}
          options={[
            { value: "30", label: "30 days" },
            { value: "60", label: "60 days" },
            { value: "90", label: "90 days" }
          ]}
          value={dayRange}
        />
        <Badge tone="cloud">{filteredDaily.length} daily records</Badge>
      </div>

      <HistoricalDailyChart data={filteredDaily} />

      <Card>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-weather-coral">Hourly archive</p>
              <h3 className="mt-1 text-xl font-semibold">Explore detailed historical variables</h3>
              <p className="mt-1 text-sm text-ink-500 dark:text-ink-200">
                Choose any available hourly archive field, including temperature, humidity, pressure, clouds, wind, soil, solar, and atmospheric signals.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <SegmentedControl
                onChange={setHourRange}
                options={[
                  { value: "7", label: "7 days" },
                  { value: "14", label: "14 days" },
                  { value: "30", label: "30 days" },
                  { value: "90", label: "90 days" }
                ]}
                value={hourRange}
              />
              <select
                className={selectClassName}
                onChange={(event) => setHourlyVariable(event.target.value)}
                value={hourlyVariable}
              >
                {variableOptions.map((variable) => (
                  <option key={variable} value={variable}>
                    {labelForField(variable)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <HistoricalHourlyChart data={filteredHourly} units={hourlyUnits} variable={hourlyVariable} />
        </CardContent>
      </Card>
    </section>
  );
}

function summaryIcon(tone: HistoricalSummary["tone"]) {
  const className = "h-5 w-5";
  switch (tone) {
    case "sun":
      return <Sun className={className} />;
    case "rain":
      return <Droplets className={className} />;
    case "wind":
      return <Wind className={className} />;
    case "cloud":
      return <Cloud className={className} />;
    case "leaf":
      return <Leaf className={className} />;
    default:
      return <Gauge className={className} />;
  }
}
