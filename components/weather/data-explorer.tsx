"use client";

import { Database } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { WeatherFieldGrid } from "@/components/weather/weather-field-grid";
import { formatDateLabel, formatDateTimeLabel } from "@/lib/date";
import { selectClassName } from "@/lib/styles";
import type { WeatherBundle, WeatherRecord } from "@/types/weather";

type ExplorerTab = "current" | "forecastDaily" | "forecastHourly" | "historyDaily" | "historyHourly";

export function DataExplorer({ data }: { data: WeatherBundle }) {
  const [tab, setTab] = useState<ExplorerTab>("current");
  const [forecastDay, setForecastDay] = useState(data.forecast.daily[0]?.time ?? "");
  const [forecastHour, setForecastHour] = useState(data.forecast.hourly[0]?.time ?? "");
  const [historyDay, setHistoryDay] = useState(data.history.daily.at(-1)?.time ?? "");
  const [historyHour, setHistoryHour] = useState(data.history.hourly.at(-1)?.time ?? "");

  const source = useMemo(() => {
    if (tab === "current") {
      return {
        title: "Current conditions",
        record: data.current,
        units: data.units.current,
        selector: null
      };
    }

    if (tab === "forecastDaily") {
      return {
        title: "Forecast daily fields",
        record: data.forecast.daily.find((row) => row.time === forecastDay) ?? data.forecast.daily[0],
        units: data.units.forecastDaily,
        selector: (
          <RecordSelect
            getLabel={formatDateLabel}
            onChange={setForecastDay}
            records={data.forecast.daily}
            value={forecastDay}
          />
        )
      };
    }

    if (tab === "forecastHourly") {
      return {
        title: "Forecast hourly fields",
        record: data.forecast.hourly.find((row) => row.time === forecastHour) ?? data.forecast.hourly[0],
        units: data.units.forecastHourly,
        selector: (
          <RecordSelect
            getLabel={formatDateTimeLabel}
            onChange={setForecastHour}
            records={data.forecast.hourly.slice(0, 120)}
            value={forecastHour}
          />
        )
      };
    }

    if (tab === "historyDaily") {
      return {
        title: "Historical daily fields",
        record: data.history.daily.find((row) => row.time === historyDay) ?? data.history.daily.at(-1),
        units: data.units.historicalDaily,
        selector: (
          <RecordSelect
            getLabel={formatDateLabel}
            onChange={setHistoryDay}
            records={data.history.daily}
            value={historyDay}
          />
        )
      };
    }

    return {
      title: "Historical hourly fields",
      record: data.history.hourly.find((row) => row.time === historyHour) ?? data.history.hourly.at(-1),
      units: data.units.historicalHourly,
      selector: (
        <RecordSelect
          getLabel={formatDateTimeLabel}
          onChange={setHistoryHour}
          records={data.history.hourly.slice(-336)}
          value={historyHour}
        />
      )
    };
  }, [data, forecastDay, forecastHour, historyDay, historyHour, tab]);

  return (
    <Card id="data-explorer">
      <CardHeader className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <Badge tone="neutral">
            <Database className="h-3.5 w-3.5" />
            Open-Meteo fields
          </Badge>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight">{source.title}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-ink-500 dark:text-ink-200">
            Every requested current, forecast, and archive variable is kept available here for inspection.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <SegmentedControl
            onChange={setTab}
            options={[
              { value: "current", label: "Current" },
              { value: "forecastDaily", label: "Daily" },
              { value: "forecastHourly", label: "Hourly" },
              { value: "historyDaily", label: "History day" },
              { value: "historyHourly", label: "History hour" }
            ]}
            value={tab}
          />
          {source.selector}
        </div>
      </CardHeader>
      <CardContent>
        {source.record ? <WeatherFieldGrid record={source.record} units={source.units} /> : <p className="text-sm text-ink-500 dark:text-ink-200">No fields available.</p>}
      </CardContent>
    </Card>
  );
}

function RecordSelect({
  records,
  value,
  onChange,
  getLabel
}: {
  records: WeatherRecord[];
  value: string;
  onChange: (value: string) => void;
  getLabel: (value: string) => string;
}) {
  return (
    <select
      className={selectClassName}
      onChange={(event) => onChange(event.target.value)}
      value={value}
    >
      {records.map((record) => (
        <option key={record.time} value={record.time}>
          {getLabel(record.time)}
        </option>
      ))}
    </select>
  );
}
