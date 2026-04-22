"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { ChartShell } from "@/components/charts/chart-shell";
import { formatCompactDate, formatHour } from "@/lib/date";
import { labelForField } from "@/lib/format";
import type { UnitsMap, WeatherRecord } from "@/types/weather";

type TooltipPayload = {
  name?: string;
  value?: number | string;
  unit?: string;
  color?: string;
};

function TooltipContent({ active, payload, label }: { active?: boolean; payload?: TooltipPayload[]; label?: string }) {
  if (!active || !payload?.length) {
    return null;
  }

  const item = payload[0];

  return (
    <div className="rounded-[8px] border border-black/10 bg-white p-3 text-sm shadow-lift dark:border-white/10 dark:bg-ink-900">
      <p className="font-semibold">{label}</p>
      <p className="mt-2">
        <span className="text-ink-500 dark:text-ink-200">{item.name}: </span>
        <span className="font-semibold">
          {item.value}
          {item.unit ?? ""}
        </span>
      </p>
    </div>
  );
}

export function HistoricalHourlyChart({ data, variable, units }: { data: WeatherRecord[]; variable: string; units: UnitsMap }) {
  const chartData = data.map((row) => ({
    label: `${formatCompactDate(row.time)} ${formatHour(row.time)}`,
    value: row[variable]
  }));

  return (
    <ChartShell description="Hourly archive values for the selected variable." title={`${labelForField(variable)} history`}>
      <div className="h-[330px]">
        <ResponsiveContainer height="100%" width="100%">
          <LineChart data={chartData} margin={{ bottom: 8, left: 0, right: 8, top: 10 }}>
            <CartesianGrid stroke="currentColor" strokeOpacity={0.12} vertical={false} />
            <XAxis dataKey="label" minTickGap={36} tick={{ fontSize: 12 }} tickLine={false} />
            <YAxis tick={{ fontSize: 12 }} tickLine={false} />
            <Tooltip content={<TooltipContent />} />
            <Line dataKey="value" dot={false} name={labelForField(variable)} stroke="#1c9a9b" strokeWidth={2.2} type="monotone" unit={units[variable] ? ` ${units[variable]}` : ""} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartShell>
  );
}
