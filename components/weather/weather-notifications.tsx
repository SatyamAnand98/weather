"use client";

import { Bell, BellOff, Clock, Send, ShieldAlert } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { buildCurrentSummary, buildHourlyNotification, findHighestDanger } from "@/lib/weather-risk";
import type { DangerLevel } from "@/lib/weather-risk";
import type { WeatherBundle } from "@/types/weather";

const ENABLED_KEY = "family-weather-notifications-enabled";
const LAST_SENT_HOUR_KEY = "family-weather-notifications-last-hour";

type PermissionState = NotificationPermission | "unsupported";
type WeatherNotificationOptions = NotificationOptions & {
  renotify?: boolean;
  requireInteraction?: boolean;
  badge?: string;
};

export function WeatherNotifications({
  weather,
  onWeatherUpdate
}: {
  weather: WeatherBundle;
  onWeatherUpdate: (weather: WeatherBundle) => void;
}) {
  const [enabled, setEnabled] = useState(false);
  const [permission, setPermission] = useState<PermissionState>("default");
  const [lastSent, setLastSent] = useState<string>("");
  const [status, setStatus] = useState("");
  const danger = useMemo(() => findHighestDanger(weather), [weather]);

  useEffect(() => {
    if (!("Notification" in window)) {
      setPermission("unsupported");
      setEnabled(false);
      return;
    }

    setPermission(Notification.permission);
    setEnabled(window.localStorage.getItem(ENABLED_KEY) === "true" && Notification.permission === "granted");
    setLastSent(window.localStorage.getItem(LAST_SENT_HOUR_KEY) ?? "");
  }, []);

  useEffect(() => {
    if (!enabled || permission !== "granted") {
      return;
    }

    const interval = window.setInterval(() => {
      void sendIfNewHour(weather, onWeatherUpdate, setLastSent, setStatus);
    }, 60 * 1000);

    void sendIfNewHour(weather, onWeatherUpdate, setLastSent, setStatus);

    return () => window.clearInterval(interval);
  }, [enabled, onWeatherUpdate, permission, weather]);

  async function enableNotifications() {
    if (!("Notification" in window)) {
      setPermission("unsupported");
      setStatus("Browser notifications are not supported here.");
      return;
    }

    const nextPermission = await Notification.requestPermission();
    setPermission(nextPermission);

    if (nextPermission !== "granted") {
      setEnabled(false);
      window.localStorage.setItem(ENABLED_KEY, "false");
      setStatus("Notification permission is not enabled.");
      return;
    }

    window.localStorage.setItem(ENABLED_KEY, "true");
    await sendWeatherNotification(weather, onWeatherUpdate, setLastSent, setStatus, true);
    setEnabled(true);
  }

  function disableNotifications() {
    setEnabled(false);
    window.localStorage.setItem(ENABLED_KEY, "false");
    setStatus("Hourly weather notifications are off.");
  }

  async function sendNow() {
    if (permission !== "granted") {
      await enableNotifications();
      return;
    }

    await sendWeatherNotification(weather, onWeatherUpdate, setLastSent, setStatus, true);
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[8px] bg-weather-sun/[0.18] text-[#8a610d] dark:text-[#ffd985]">
            {enabled ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-semibold">Hourly weather notifications</h2>
              <Badge tone={enabled ? "leaf" : "cloud"}>{enabled ? "On" : permission === "denied" ? "Blocked" : "Off"}</Badge>
              <Badge tone={dangerTone(danger.level)}>
                <ShieldAlert className="h-3.5 w-3.5" />
                {danger.level} risk
              </Badge>
            </div>
            <p className="mt-1 text-sm text-ink-500 dark:text-ink-200">{buildCurrentSummary(weather)}</p>
            <p className="mt-1 text-sm text-ink-600 dark:text-ink-100">
              Highest upcoming risk: <span className="font-semibold">{danger.summary}</span>
            </p>
            {status ? <p className="mt-1 text-xs text-ink-500 dark:text-ink-200">{status}</p> : null}
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center lg:shrink-0">
          {lastSent ? (
            <Badge tone="neutral">
              <Clock className="h-3.5 w-3.5" />
              Last sent {lastSent}
            </Badge>
          ) : null}
          <Button onClick={sendNow} variant="secondary">
            <Send className="h-4 w-4" />
            Send now
          </Button>
          {enabled ? (
            <Button onClick={disableNotifications} variant="ghost">
              <BellOff className="h-4 w-4" />
              Turn off
            </Button>
          ) : (
            <Button onClick={enableNotifications}>
              <Bell className="h-4 w-4" />
              Enable hourly
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

async function sendIfNewHour(
  weather: WeatherBundle,
  onWeatherUpdate: (weather: WeatherBundle) => void,
  setLastSent: (value: string) => void,
  setStatus: (value: string) => void
) {
  const key = getCurrentHourKey();
  if (window.localStorage.getItem(LAST_SENT_HOUR_KEY) === key) {
    return;
  }

  await sendWeatherNotification(weather, onWeatherUpdate, setLastSent, setStatus, false);
}

async function sendWeatherNotification(
  weather: WeatherBundle,
  onWeatherUpdate: (weather: WeatherBundle) => void,
  setLastSent: (value: string) => void,
  setStatus: (value: string) => void,
  force: boolean
) {
  if (!("Notification" in window) || Notification.permission !== "granted") {
    return;
  }

  const key = getCurrentHourKey();
  if (!force && window.localStorage.getItem(LAST_SENT_HOUR_KEY) === key) {
    return;
  }

  const latestWeather = await fetchLatestWeather(weather).catch(() => weather);
  onWeatherUpdate(latestWeather);

  const notification = buildHourlyNotification(latestWeather);
  const options: WeatherNotificationOptions = {
    body: notification.body,
    icon: "/favicon.svg",
    badge: "/favicon.svg",
    tag: "family-weather-hourly-summary",
    renotify: notification.danger.level === "high" || notification.danger.level === "severe",
    requireInteraction: notification.danger.level === "high" || notification.danger.level === "severe",
    data: {
      url: "/"
    }
  };

  await showNotification(notification.title, options);
  window.localStorage.setItem(LAST_SENT_HOUR_KEY, key);
  setLastSent(key);
  setStatus(`Notification sent for ${latestWeather.location.name}.`);
}

async function fetchLatestWeather(weather: WeatherBundle) {
  const params = new URLSearchParams({
    latitude: String(weather.location.latitude),
    longitude: String(weather.location.longitude),
    name: weather.location.name
  });
  const response = await fetch(`/api/weather?${params.toString()}`);
  const data = (await response.json()) as WeatherBundle | { error?: string };

  if (!response.ok) {
    throw new Error("error" in data && data.error ? data.error : "Unable to refresh weather.");
  }

  return data as WeatherBundle;
}

async function showNotification(title: string, options: NotificationOptions) {
  if ("serviceWorker" in navigator) {
    const registration = await navigator.serviceWorker.register("/weather-notification-sw.js");
    await registration.showNotification(title, options);
    return;
  }

  new Notification(title, options);
}

function getCurrentHourKey() {
  const now = new Date();
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours()));
}

function dangerTone(level: DangerLevel): "neutral" | "leaf" | "sun" | "coral" {
  if (level === "severe" || level === "high") {
    return "coral";
  }

  if (level === "moderate") {
    return "sun";
  }

  return "leaf";
}
