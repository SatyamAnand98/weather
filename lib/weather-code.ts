import type { WeatherCondition, WeatherIconKey } from "@/types/weather";

const conditions: Record<number, Omit<WeatherCondition, "code">> = {
  0: {
    label: "Clear",
    description: "Clear sky",
    icon: "sun",
    severity: "clear"
  },
  1: {
    label: "Mostly clear",
    description: "Mainly clear",
    icon: "cloudSun",
    severity: "clear"
  },
  2: {
    label: "Partly cloudy",
    description: "Partly cloudy",
    icon: "cloudSun",
    severity: "cloud"
  },
  3: {
    label: "Overcast",
    description: "Overcast",
    icon: "cloud",
    severity: "cloud"
  },
  45: {
    label: "Fog",
    description: "Foggy",
    icon: "fog",
    severity: "fog"
  },
  48: {
    label: "Rime fog",
    description: "Depositing rime fog",
    icon: "fog",
    severity: "fog"
  },
  51: {
    label: "Light drizzle",
    description: "Light drizzle",
    icon: "drizzle",
    severity: "rain"
  },
  53: {
    label: "Drizzle",
    description: "Moderate drizzle",
    icon: "drizzle",
    severity: "rain"
  },
  55: {
    label: "Heavy drizzle",
    description: "Dense drizzle",
    icon: "drizzle",
    severity: "rain"
  },
  56: {
    label: "Freezing drizzle",
    description: "Light freezing drizzle",
    icon: "drizzle",
    severity: "rain"
  },
  57: {
    label: "Freezing drizzle",
    description: "Dense freezing drizzle",
    icon: "drizzle",
    severity: "rain"
  },
  61: {
    label: "Light rain",
    description: "Slight rain",
    icon: "rain",
    severity: "rain"
  },
  63: {
    label: "Rain",
    description: "Moderate rain",
    icon: "rain",
    severity: "rain"
  },
  65: {
    label: "Heavy rain",
    description: "Heavy rain",
    icon: "rain",
    severity: "rain"
  },
  66: {
    label: "Freezing rain",
    description: "Light freezing rain",
    icon: "rain",
    severity: "rain"
  },
  67: {
    label: "Freezing rain",
    description: "Heavy freezing rain",
    icon: "rain",
    severity: "rain"
  },
  71: {
    label: "Light snow",
    description: "Slight snow fall",
    icon: "snow",
    severity: "snow"
  },
  73: {
    label: "Snow",
    description: "Moderate snow fall",
    icon: "snow",
    severity: "snow"
  },
  75: {
    label: "Heavy snow",
    description: "Heavy snow fall",
    icon: "snow",
    severity: "snow"
  },
  77: {
    label: "Snow grains",
    description: "Snow grains",
    icon: "snow",
    severity: "snow"
  },
  80: {
    label: "Light showers",
    description: "Slight rain showers",
    icon: "rain",
    severity: "rain"
  },
  81: {
    label: "Showers",
    description: "Moderate rain showers",
    icon: "rain",
    severity: "rain"
  },
  82: {
    label: "Heavy showers",
    description: "Violent rain showers",
    icon: "rain",
    severity: "rain"
  },
  85: {
    label: "Snow showers",
    description: "Slight snow showers",
    icon: "snow",
    severity: "snow"
  },
  86: {
    label: "Snow showers",
    description: "Heavy snow showers",
    icon: "snow",
    severity: "snow"
  },
  95: {
    label: "Thunderstorm",
    description: "Thunderstorm",
    icon: "storm",
    severity: "storm"
  },
  96: {
    label: "Thunderstorm hail",
    description: "Thunderstorm with slight hail",
    icon: "storm",
    severity: "storm"
  },
  99: {
    label: "Severe thunderstorm",
    description: "Thunderstorm with heavy hail",
    icon: "storm",
    severity: "storm"
  }
};

export function getWeatherCondition(value: unknown, isDay = true): WeatherCondition {
  const code = typeof value === "number" ? value : -1;
  const condition = conditions[code] ?? {
    label: "Unknown",
    description: "Weather condition unavailable",
    icon: "cloud" as WeatherIconKey,
    severity: "cloud" as const
  };

  return {
    code,
    ...condition,
    icon: condition.icon === "sun" && !isDay ? "moon" : condition.icon
  };
}
