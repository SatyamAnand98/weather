"use client";

import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSun,
  Moon,
  Snowflake,
  Sun
} from "lucide-react";

import type { WeatherIconKey } from "@/types/weather";

const icons = {
  sun: Sun,
  moon: Moon,
  cloudSun: CloudSun,
  cloud: Cloud,
  fog: CloudFog,
  drizzle: CloudDrizzle,
  rain: CloudRain,
  snow: Snowflake,
  storm: CloudLightning
};

export function WeatherIcon({ icon, className }: { icon: WeatherIconKey; className?: string }) {
  const Icon = icons[icon] ?? Cloud;
  return <Icon aria-hidden="true" className={className} strokeWidth={1.8} />;
}
