export type WeatherPrimitive = string | number | boolean | null;

export type WeatherRecord = {
  time: string;
  [key: string]: WeatherPrimitive;
};

export type UnitsMap = Record<string, string>;

export type LocationChoice = {
  latitude: number;
  longitude: number;
  name: string;
  country?: string;
  admin1?: string;
  timezone?: string;
  elevation?: number;
  source: "browser" | "manual" | "map" | "search" | "stored";
};

export type GeocodingResult = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  timezone?: string;
  country?: string;
  countryCode?: string;
  admin1?: string;
  admin2?: string;
  population?: number;
};

export type WeatherLocation = {
  name: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  timezone: string;
  timezoneAbbreviation: string;
  utcOffsetSeconds: number;
};

export type CurrentWeather = WeatherRecord & {
  interval?: number;
};

export type HistoricalSummary = {
  id: string;
  label: string;
  value: number | string | null;
  unit?: string;
  date?: string;
  tone: "sun" | "rain" | "wind" | "cloud" | "leaf" | "neutral";
};

export type WeatherBundle = {
  generatedAt: string;
  location: WeatherLocation;
  units: {
    current: UnitsMap;
    forecastHourly: UnitsMap;
    forecastDaily: UnitsMap;
    historicalHourly: UnitsMap;
    historicalDaily: UnitsMap;
  };
  current: CurrentWeather;
  forecast: {
    hourly: WeatherRecord[];
    daily: WeatherRecord[];
  };
  history: {
    startDate: string;
    endDate: string;
    hourly: WeatherRecord[];
    daily: WeatherRecord[];
    summaries: HistoricalSummary[];
  };
};

export type WeatherCondition = {
  code: number;
  label: string;
  description: string;
  icon: WeatherIconKey;
  severity: "clear" | "cloud" | "fog" | "rain" | "snow" | "storm";
};

export type WeatherIconKey =
  | "sun"
  | "moon"
  | "cloudSun"
  | "cloud"
  | "fog"
  | "drizzle"
  | "rain"
  | "snow"
  | "storm";
