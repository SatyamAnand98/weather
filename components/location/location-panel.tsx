"use client";

import { Crosshair, LocateFixed, MapPin, Navigation, Search, Send } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { MapPicker } from "@/components/location/map-picker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fieldClassName, searchResultButtonClassName } from "@/lib/styles";
import { clampCoordinate, cn } from "@/lib/utils";
import type { GeocodingResult, LocationChoice } from "@/types/weather";

type Props = {
  location: LocationChoice | null;
  onLocationChange: (location: LocationChoice) => void;
};

export function LocationPanel({ location, onLocationChange }: Props) {
  const [manualLatitude, setManualLatitude] = useState(location?.latitude.toFixed(5) ?? "");
  const [manualLongitude, setManualLongitude] = useState(location?.longitude.toFixed(5) ?? "");
  const [manualError, setManualError] = useState("");
  const [geoStatus, setGeoStatus] = useState<"idle" | "loading" | "error">("idle");
  const [geoError, setGeoError] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [searchStatus, setSearchStatus] = useState<"idle" | "loading" | "error">("idle");
  const [searchError, setSearchError] = useState("");
  const [mapPoint, setMapPoint] = useState(
    location ? { latitude: location.latitude, longitude: location.longitude } : { latitude: 20, longitude: 0 }
  );

  useEffect(() => {
    if (!location) {
      return;
    }

    setManualLatitude(location.latitude.toFixed(5));
    setManualLongitude(location.longitude.toFixed(5));
    setMapPoint({ latitude: location.latitude, longitude: location.longitude });
  }, [location]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setSearchStatus("idle");
      setSearchError("");
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setSearchStatus("loading");
      setSearchError("");

      try {
        const response = await fetch(`/api/geocode?q=${encodeURIComponent(query.trim())}`, {
          signal: controller.signal
        });
        const data = (await response.json()) as { results?: GeocodingResult[]; error?: string };

        if (!response.ok) {
          throw new Error(data.error || "Search failed.");
        }

        setResults(data.results ?? []);
        setSearchStatus("idle");
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setSearchError(error instanceof Error ? error.message : "Search failed.");
        setSearchStatus("error");
      }
    }, 280);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [query]);

  const coordinateReadout = useMemo(
    () => `${mapPoint.latitude.toFixed(5)}, ${mapPoint.longitude.toFixed(5)}`,
    [mapPoint.latitude, mapPoint.longitude]
  );

  function useBrowserLocation() {
    if (!navigator.geolocation) {
      setGeoStatus("error");
      setGeoError("This browser does not support geolocation.");
      return;
    }

    setGeoStatus("loading");
    setGeoError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coordinates = clampCoordinate(position.coords.latitude, position.coords.longitude);
        const nextLocation: LocationChoice = {
          ...coordinates,
          name: "Current location",
          source: "browser"
        };

        setGeoStatus("idle");
        setMapPoint(coordinates);
        onLocationChange(nextLocation);
      },
      (error) => {
        setGeoStatus("error");
        setGeoError(error.message || "Location permission was denied.");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5 * 60 * 1000,
        timeout: 12 * 1000
      }
    );
  }

  function submitManualCoordinates(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setManualError("");

    const latitude = Number(manualLatitude);
    const longitude = Number(manualLongitude);

    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
      setManualError("Latitude must be between -90 and 90.");
      return;
    }

    if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
      setManualError("Longitude must be between -180 and 180.");
      return;
    }

    const coordinates = clampCoordinate(latitude, longitude);
    setMapPoint(coordinates);
    onLocationChange({
      ...coordinates,
      name: "Manual coordinates",
      source: "manual"
    });
  }

  function selectSearchResult(result: GeocodingResult) {
    const displayName = [result.name, result.admin1, result.country].filter(Boolean).join(", ");
    const nextLocation: LocationChoice = {
      latitude: result.latitude,
      longitude: result.longitude,
      name: displayName,
      country: result.country,
      admin1: result.admin1,
      timezone: result.timezone,
      elevation: result.elevation,
      source: "search"
    };

    setResults([]);
    setSearchStatus("idle");
    setSearchError("");
    setQuery(displayName);
    setManualLatitude(result.latitude.toFixed(5));
    setManualLongitude(result.longitude.toFixed(5));
    setMapPoint({ latitude: result.latitude, longitude: result.longitude });
    onLocationChange(nextLocation);
  }

  function setMapLocation() {
    onLocationChange({
      latitude: mapPoint.latitude,
      longitude: mapPoint.longitude,
      name: "Map selection",
      source: "map"
    });
  }

  return (
    <Card id="location-tools">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-weather-coral">Location tools</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">Choose your weather location</h2>
            <p className="mt-2 text-sm leading-6 text-ink-500 dark:text-ink-200">
              Use browser location, search for a place, enter coordinates, or click the map.
            </p>
          </div>
          {location ? (
            <Badge tone="leaf">
              <MapPin className="h-3.5 w-3.5" />
              {location.name}
            </Badge>
          ) : (
            <Badge tone="coral">Location required</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-5 lg:grid-cols-[0.95fr_1.25fr]">
          <div className="relative z-20 space-y-4">
            <section className="relative z-30 rounded-[8px] border border-black/10 bg-white/70 p-4 dark:border-white/10 dark:bg-white/[0.05]">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-weather-teal/[0.14] text-weather-teal">
                  <LocateFixed className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-semibold">Browser location</h3>
                  <p className="text-sm text-ink-500 dark:text-ink-200">Best for home or family use on trusted devices.</p>
                </div>
              </div>
              <Button className="mt-4 w-full" disabled={geoStatus === "loading"} onClick={useBrowserLocation}>
                <Navigation className="h-4 w-4" />
                {geoStatus === "loading" ? "Requesting permission" : "Use my location"}
              </Button>
              {geoStatus === "error" ? <p className="mt-3 text-sm text-weather-coral">{geoError}</p> : null}
            </section>

            <section className="rounded-[8px] border border-black/10 bg-white/70 p-4 dark:border-white/10 dark:bg-white/[0.05]">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-weather-sun/[0.18] text-[#9a6c0f] dark:text-[#ffd985]">
                  <Search className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-semibold">City or place search</h3>
                  <p className="text-sm text-ink-500 dark:text-ink-200">Powered by Open-Meteo geocoding.</p>
                </div>
              </div>
              <label className="mt-4 block text-sm font-semibold" htmlFor="place-search">
                Search location
              </label>
              <input
                className={cn("mt-2 w-full", fieldClassName)}
                id="place-search"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search city, town, or postal code"
                value={query}
              />
              <div className="relative z-40 mt-3 space-y-2">
                {searchStatus === "loading" ? (
                  <>
                    <Skeleton className="h-10" />
                    <Skeleton className="h-10" />
                  </>
                ) : null}
                {searchStatus === "error" ? <p className="text-sm text-weather-coral">{searchError}</p> : null}
                {results.map((result) => (
                  <button
                    className={searchResultButtonClassName}
                    key={result.id}
                    onPointerDown={(event) => {
                      event.preventDefault();
                      selectSearchResult(result);
                    }}
                    onClick={() => selectSearchResult(result)}
                    type="button"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{result.name}</span>
                      <span className="block truncate text-xs text-ink-500 dark:text-ink-200">
                        {[result.admin1, result.country, result.timezone].filter(Boolean).join(" · ")}
                      </span>
                    </span>
                    <Send className="h-4 w-4 shrink-0 text-weather-teal" />
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-[8px] border border-black/10 bg-white/70 p-4 dark:border-white/10 dark:bg-white/[0.05]">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-weather-coral/[0.16] text-weather-coral">
                  <Crosshair className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-semibold">Manual coordinates</h3>
                  <p className="text-sm text-ink-500 dark:text-ink-200">Latitude and longitude in WGS84 decimal degrees.</p>
                </div>
              </div>
              <form className="mt-4 grid gap-3 sm:grid-cols-2" onSubmit={submitManualCoordinates}>
                <label className="text-sm font-semibold" htmlFor="latitude">
                  Latitude
                  <input
                    className={cn("mt-2 w-full", fieldClassName)}
                    id="latitude"
                    inputMode="decimal"
                    onChange={(event) => setManualLatitude(event.target.value)}
                    placeholder="28.61390"
                    value={manualLatitude}
                  />
                </label>
                <label className="text-sm font-semibold" htmlFor="longitude">
                  Longitude
                  <input
                    className={cn("mt-2 w-full", fieldClassName)}
                    id="longitude"
                    inputMode="decimal"
                    onChange={(event) => setManualLongitude(event.target.value)}
                    placeholder="77.20900"
                    value={manualLongitude}
                  />
                </label>
                <Button className="sm:col-span-2" type="submit">
                  <MapPin className="h-4 w-4" />
                  Set coordinates
                </Button>
              </form>
              {manualError ? <p className="mt-3 text-sm text-weather-coral">{manualError}</p> : null}
            </section>
          </div>

          <section className="relative z-0 min-w-0 rounded-[8px] border border-black/10 bg-white/70 p-3 dark:border-white/10 dark:bg-white/[0.05]">
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold">Map picker</h3>
                <p className="text-sm text-ink-500 dark:text-ink-200">Click the map or drag the marker.</p>
              </div>
              <Badge className={cn("w-fit font-mono", location?.source === "map" ? "ring-2 ring-weather-coral/30" : "")} tone="wind">
                {coordinateReadout}
              </Badge>
            </div>
            <MapPicker onChange={setMapPoint} value={mapPoint} />
            <Button className="mt-3 w-full" onClick={setMapLocation} variant="secondary">
              <MapPin className="h-4 w-4" />
              Use map selection
            </Button>
          </section>
        </div>
      </CardContent>
    </Card>
  );
}
