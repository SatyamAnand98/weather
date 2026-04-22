"use client";

import { AlertTriangle, CloudSun, ExternalLink, MapPin, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { LocationPanel } from "@/components/location/location-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { CurrentDayClock } from "@/components/weather/current-day-clock";
import { CurrentHero } from "@/components/weather/current-hero";
import { DataExplorer } from "@/components/weather/data-explorer";
import { ForecastSection } from "@/components/weather/forecast-section";
import { HistoricalSection } from "@/components/weather/historical-section";
import { WeatherNotifications } from "@/components/weather/weather-notifications";
import type { LocationChoice, WeatherBundle } from "@/types/weather";

const STORAGE_KEY = "family-weather-location";

type LoadStatus = "idle" | "loading" | "success" | "error";

export function WeatherDashboard() {
  const [hydrated, setHydrated] = useState(false);
  const [location, setLocation] = useState<LocationChoice | null>(null);
  const [weather, setWeather] = useState<WeatherBundle | null>(null);
  const [status, setStatus] = useState<LoadStatus>("idle");
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);

    if (saved) {
      try {
        const parsed = JSON.parse(saved) as LocationChoice;
        if (Number.isFinite(parsed.latitude) && Number.isFinite(parsed.longitude)) {
          setLocation({ ...parsed, source: "stored" });
        }
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }

    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!location) {
      return;
    }

    const controller = new AbortController();
    const params = new URLSearchParams({
      latitude: String(location.latitude),
      longitude: String(location.longitude),
      name: location.name
    });

    setStatus("loading");
    setError("");

    fetch(`/api/weather?${params.toString()}`, { signal: controller.signal })
      .then(async (response) => {
        const data = (await response.json()) as WeatherBundle | { error?: string };
        if (!response.ok) {
          throw new Error("error" in data && data.error ? data.error : "Unable to load weather data.");
        }

        setWeather(data as WeatherBundle);
        setStatus("success");
      })
      .catch((fetchError) => {
        if (controller.signal.aborted) {
          return;
        }

        setError(fetchError instanceof Error ? fetchError.message : "Unable to load weather data.");
        setStatus("error");
      });

    return () => controller.abort();
  }, [location, refreshKey]);

  const activeLocation = useMemo(() => {
    if (weather) {
      return {
        name: weather.location.name,
        latitude: weather.location.latitude,
        longitude: weather.location.longitude,
        timezone: weather.location.timezone
      };
    }

    return location;
  }, [location, weather]);

  function handleLocationChange(nextLocation: LocationChoice) {
    setLocation(nextLocation);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextLocation));
  }

  function scrollToLocationTools() {
    document.getElementById("location-tools")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <main className="min-h-screen">
      <DashboardHeader activeLocation={activeLocation} onChangeLocation={scrollToLocationTools} />

      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 pb-12 pt-4 sm:px-6 lg:px-8">
        {!hydrated ? <DashboardSkeleton /> : null}

        {hydrated && !location ? (
          <section className="rounded-[8px] border border-black/10 bg-white/[0.72] p-5 shadow-soft dark:border-white/10 dark:bg-white/[0.07] sm:p-7">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-weather-coral">Start here</p>
            <h1 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight text-ink-900 dark:text-ink-50 sm:text-5xl">
              Pick a location to load current weather, 16-day forecasts, and 3 months of history.
            </h1>
          </section>
        ) : null}

        {hydrated ? <LocationPanel location={location} onLocationChange={handleLocationChange} /> : null}

        {status === "loading" ? <DashboardSkeleton /> : null}

        {status === "error" ? (
          <Card>
            <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[8px] bg-weather-coral/[0.16] text-weather-coral">
                  <AlertTriangle className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-semibold">Weather data failed to load</h2>
                  <p className="mt-1 text-sm text-ink-500 dark:text-ink-200">{error}</p>
                </div>
              </div>
              <Button onClick={() => setRefreshKey((key) => key + 1)} variant="secondary">
                <RefreshCw className="h-4 w-4" />
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {weather && status === "success" ? (
          <>
            <CurrentHero data={weather} />
            <CurrentDayClock data={weather} />
            <WeatherNotifications onWeatherUpdate={setWeather} weather={weather} />
            <ForecastSection
              daily={weather.forecast.daily}
              dailyUnits={weather.units.forecastDaily}
              hourly={weather.forecast.hourly}
              hourlyUnits={weather.units.forecastHourly}
            />
            <HistoricalSection
              daily={weather.history.daily}
              dailyUnits={weather.units.historicalDaily}
              endDate={weather.history.endDate}
              hourly={weather.history.hourly}
              hourlyUnits={weather.units.historicalHourly}
              startDate={weather.history.startDate}
              summaries={weather.history.summaries}
            />
            <DataExplorer data={weather} />
          </>
        ) : null}

        <Footer />
      </div>
    </main>
  );
}

function DashboardHeader({
  activeLocation,
  onChangeLocation
}: {
  activeLocation: Pick<LocationChoice, "name" | "latitude" | "longitude" | "timezone"> | null;
  onChangeLocation: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-black/10 bg-[#f7faf8]/[0.86] backdrop-blur-xl dark:border-white/10 dark:bg-ink-900/[0.86]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[8px] bg-weather-sun/[0.22] text-[#8a610d] dark:text-[#ffd985]">
            <CloudSun className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold tracking-tight sm:text-lg">Family Weather Intelligence</p>
            <p className="truncate text-xs text-ink-500 dark:text-ink-200">
              {activeLocation
                ? `${activeLocation.name} · ${activeLocation.latitude.toFixed(4)}, ${activeLocation.longitude.toFixed(4)}${activeLocation.timezone ? ` · ${activeLocation.timezone}` : ""}`
                : "Choose a location to begin"}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button className="hidden sm:inline-flex" onClick={onChangeLocation} variant="secondary">
            <MapPin className="h-4 w-4" />
            Location
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-[320px] w-full" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-36" />
        <Skeleton className="h-36" />
        <Skeleton className="h-36" />
        <Skeleton className="h-36" />
      </div>
      <Skeleton className="h-[360px] w-full" />
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-black/10 py-8 text-sm text-ink-500 dark:border-white/10 dark:text-ink-200">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p>Weather data from Open-Meteo. Map tiles from OpenStreetMap contributors.</p>
        <div className="flex flex-wrap gap-3">
          <a className="inline-flex items-center gap-1 font-semibold hover:text-weather-teal" href="https://open-meteo.com/" rel="noreferrer" target="_blank">
            Open-Meteo <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <a className="inline-flex items-center gap-1 font-semibold hover:text-weather-teal" href="https://www.openstreetmap.org/" rel="noreferrer" target="_blank">
            OpenStreetMap <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
