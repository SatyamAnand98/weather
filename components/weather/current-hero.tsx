"use client";

import {
  CalendarClock,
  Cloud,
  Droplets,
  Eye,
  Gauge,
  MapPin,
  Navigation2,
  Sunrise,
  Sunset,
  Thermometer,
  Umbrella,
  Wind
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/weather/metric-card";
import { WeatherIcon } from "@/components/weather/weather-icon";
import { formatDateLabel, formatDateTimeLabel, formatHour } from "@/lib/date";
import { formatDurationFromSeconds, formatMetric, formatVisibility, windCompass } from "@/lib/format";
import { getWeatherCondition } from "@/lib/weather-code";
import type { WeatherBundle, WeatherRecord } from "@/types/weather";

export function CurrentHero({ data }: { data: WeatherBundle }) {
  const current = data.current;
  const today = data.forecast.daily[0];
  const condition = getWeatherCondition(current.weather_code, current.is_day === 1 || current.is_day === true);
  const currentUnits = data.units.current;
  const dailyUnits = data.units.forecastDaily;

  return (
    <section className="grid gap-4 lg:grid-cols-[1.05fr_1.2fr]">
      <Card className="overflow-hidden bg-gradient-to-br from-weather-sky/[0.32] via-white/80 to-weather-sun/[0.24] dark:from-weather-teal/[0.28] dark:via-white/[0.08] dark:to-weather-coral/[0.16]">
        <div className="p-5 sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <Badge tone={condition.severity === "rain" ? "rain" : condition.severity === "clear" ? "sun" : "cloud"}>
                <WeatherIcon className="h-3.5 w-3.5" icon={condition.icon} />
                {condition.label}
              </Badge>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink-900 dark:text-ink-50 sm:text-6xl">
                {formatMetric(current.temperature_2m, currentUnits.temperature_2m, 0)}
              </h1>
              <p className="mt-3 text-lg text-ink-700 dark:text-ink-100">
                Feels like {formatMetric(current.apparent_temperature, currentUnits.apparent_temperature, 0)}
              </p>
            </div>
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[8px] bg-white/[0.65] text-weather-coral shadow-soft dark:bg-white/10">
              <WeatherIcon className="h-14 w-14" icon={condition.icon} />
            </div>
          </div>

          <div className="mt-7 grid gap-3 text-sm text-ink-700 dark:text-ink-100">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-weather-coral" />
              <span className="font-semibold">{data.location.name}</span>
              <span className="text-ink-500 dark:text-ink-200">
                {data.location.latitude.toFixed(4)}, {data.location.longitude.toFixed(4)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-weather-teal" />
              <span>{formatDateTimeLabel(String(current.time))}</span>
              <span className="text-ink-500 dark:text-ink-200">
                {data.location.timezone} ({data.location.timezoneAbbreviation})
              </span>
            </div>
          </div>

          {today ? <SunWindow today={today} units={dailyUnits} /> : null}
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          detail={`Dew point ${formatMetric(current.dew_point_2m, currentUnits.dew_point_2m, 1)}`}
          icon={<Droplets className="h-5 w-5" />}
          label="Humidity"
          tone="leaf"
          value={formatMetric(current.relative_humidity_2m, currentUnits.relative_humidity_2m, 0)}
        />
        <MetricCard
          detail={`Surface ${formatMetric(current.surface_pressure, currentUnits.surface_pressure, 0)}`}
          icon={<Gauge className="h-5 w-5" />}
          label="Pressure"
          tone="neutral"
          value={formatMetric(current.pressure_msl, currentUnits.pressure_msl, 0)}
        />
        <MetricCard
          detail={`Gusts ${formatMetric(current.wind_gusts_10m, currentUnits.wind_gusts_10m, 0)}`}
          icon={<Wind className="h-5 w-5" />}
          label="Wind"
          tone="wind"
          value={formatMetric(current.wind_speed_10m, currentUnits.wind_speed_10m, 0)}
        />
        <MetricCard
          detail={windCompass(current.wind_direction_10m)}
          icon={<Navigation2 className="h-5 w-5" />}
          label="Direction"
          tone="wind"
          value={formatMetric(current.wind_direction_10m, currentUnits.wind_direction_10m, 0)}
        />
        <MetricCard
          detail={`Low ${formatMetric(current.cloud_cover_low, currentUnits.cloud_cover_low, 0)} · High ${formatMetric(current.cloud_cover_high, currentUnits.cloud_cover_high, 0)}`}
          icon={<Cloud className="h-5 w-5" />}
          label="Cloud cover"
          tone="cloud"
          value={formatMetric(current.cloud_cover, currentUnits.cloud_cover, 0)}
        />
        <MetricCard
          detail={`UV clear sky ${formatMetric(current.uv_index_clear_sky, currentUnits.uv_index_clear_sky, 1)}`}
          icon={<Thermometer className="h-5 w-5" />}
          label="UV index"
          tone="sun"
          value={formatMetric(current.uv_index, currentUnits.uv_index, 1)}
        />
        <MetricCard
          detail={`Rain ${formatMetric(current.rain, currentUnits.rain, 1)} · Showers ${formatMetric(current.showers, currentUnits.showers, 1)}`}
          icon={<Umbrella className="h-5 w-5" />}
          label="Precipitation"
          tone="rain"
          value={formatMetric(current.precipitation, currentUnits.precipitation, 1)}
        />
        <MetricCard
          detail={`Snowfall ${formatMetric(current.snowfall, currentUnits.snowfall, 1)}`}
          icon={<Eye className="h-5 w-5" />}
          label="Visibility"
          tone="cloud"
          value={formatVisibility(current.visibility, currentUnits.visibility)}
        />
        <MetricCard
          detail={`Sunshine ${formatDurationFromSeconds(current.sunshine_duration)}`}
          icon={current.is_day ? <Sunrise className="h-5 w-5" /> : <Sunset className="h-5 w-5" />}
          label="Day / night"
          tone={current.is_day ? "sun" : "cloud"}
          value={current.is_day ? "Daylight" : "Night"}
        />
      </div>
    </section>
  );
}

function SunWindow({ today, units }: { today: WeatherRecord; units: Record<string, string> }) {
  return (
    <div className="mt-7 grid gap-3 rounded-[8px] border border-white/50 bg-white/[0.55] p-4 dark:border-white/10 dark:bg-white/[0.07] sm:grid-cols-3">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-500 dark:text-ink-200">Sunrise</p>
        <p className="mt-1 text-lg font-semibold">{formatHour(String(today.sunrise ?? ""))}</p>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-500 dark:text-ink-200">Sunset</p>
        <p className="mt-1 text-lg font-semibold">{formatHour(String(today.sunset ?? ""))}</p>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-500 dark:text-ink-200">Today</p>
        <p className="mt-1 text-lg font-semibold">{formatDateLabel(today.time)}</p>
        <p className="text-xs text-ink-500 dark:text-ink-200">
          Daylight {formatDurationFromSeconds(today.daylight_duration)} · UV {formatMetric(today.uv_index_max, units.uv_index_max, 1)}
        </p>
      </div>
    </div>
  );
}
