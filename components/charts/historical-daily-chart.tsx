"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import { ChartShell } from "@/components/charts/chart-shell";
import { formatCompactDate } from "@/lib/date";
import type { WeatherRecord } from "@/types/weather";

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

  return (
    <div className="rounded-[8px] border border-black/10 bg-white p-3 text-sm shadow-lift dark:border-white/10 dark:bg-ink-900">
      <p className="font-semibold">{label}</p>
      <div className="mt-2 space-y-1">
        {payload.map((item) => (
          <p className="flex items-center gap-2" key={item.name}>
            <span className="h-2 w-2 rounded-full" style={{ background: item.color }} />
            <span className="text-ink-500 dark:text-ink-200">{item.name}</span>
            <span className="font-semibold">
              {item.value}
              {item.unit ?? ""}
            </span>
          </p>
        ))}
      </div>
    </div>
  );
}

export function HistoricalDailyChart({ data }: { data: WeatherRecord[] }) {
  const chartData = data.map((row) => ({
    label: formatCompactDate(row.time),
    mean: row.temperature_2m_mean,
    high: row.temperature_2m_max,
    low: row.temperature_2m_min,
    precipitation: row.precipitation_sum,
    humidity: row.relative_humidity_2m_mean,
    pressure: row.pressure_msl_mean
  }));

  return (
    <ChartShell description="Daily aggregates across the selected historical range." title="Historical daily trends">
      <div className="h-[360px]">
        <ResponsiveContainer height="100%" width="100%">
          <ComposedChart data={chartData} margin={{ bottom: 8, left: 0, right: 8, top: 10 }}>
            <CartesianGrid stroke="currentColor" strokeOpacity={0.12} vertical={false} />
            <XAxis dataKey="label" minTickGap={28} tick={{ fontSize: 12 }} tickLine={false} />
            <YAxis tick={{ fontSize: 12 }} tickLine={false} yAxisId="temp" />
            <YAxis orientation="right" tick={{ fontSize: 12 }} tickLine={false} yAxisId="rain" />
            <Tooltip content={<TooltipContent />} />
            <Legend />
            <Bar dataKey="precipitation" fill="#4f8fc0" name="Rain" opacity={0.35} radius={[6, 6, 0, 0]} unit=" mm" yAxisId="rain" />
            <Line dataKey="high" dot={false} name="High" stroke="#ef7d64" strokeWidth={2.1} type="monotone" unit="degC" yAxisId="temp" />
            <Line dataKey="mean" dot={false} name="Mean" stroke="#f3b84b" strokeWidth={2.4} type="monotone" unit="degC" yAxisId="temp" />
            <Line dataKey="low" dot={false} name="Low" stroke="#1c9a9b" strokeWidth={2.1} type="monotone" unit="degC" yAxisId="temp" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </ChartShell>
  );
}
