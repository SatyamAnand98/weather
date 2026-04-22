import { lastNDaysRange } from "@/lib/date";
import { asNumber, average, maxBy, minBy, sum } from "@/lib/utils";
import type { HistoricalSummary, WeatherBundle, WeatherPrimitive, WeatherRecord } from "@/types/weather";

const FORECAST_ENDPOINT = "https://api.open-meteo.com/v1/forecast";
const ARCHIVE_ENDPOINT = "https://archive-api.open-meteo.com/v1/archive";

const currentVariables = [
  "temperature_2m",
  "relative_humidity_2m",
  "dew_point_2m",
  "apparent_temperature",
  "is_day",
  "precipitation",
  "rain",
  "showers",
  "snowfall",
  "weather_code",
  "cloud_cover",
  "cloud_cover_low",
  "cloud_cover_mid",
  "cloud_cover_high",
  "pressure_msl",
  "surface_pressure",
  "wind_speed_10m",
  "wind_direction_10m",
  "wind_gusts_10m",
  "visibility",
  "uv_index",
  "uv_index_clear_sky",
  "sunshine_duration",
  "wet_bulb_temperature_2m",
  "total_column_integrated_water_vapour",
  "cape",
  "lifted_index",
  "convective_inhibition",
  "freezing_level_height",
  "boundary_layer_height",
  "shortwave_radiation",
  "direct_radiation",
  "diffuse_radiation",
  "direct_normal_irradiance",
  "global_tilted_irradiance",
  "terrestrial_radiation",
  "evapotranspiration",
  "et0_fao_evapotranspiration",
  "vapour_pressure_deficit"
];

const forecastHourlyVariables = [
  "temperature_2m",
  "relative_humidity_2m",
  "dew_point_2m",
  "apparent_temperature",
  "precipitation_probability",
  "precipitation",
  "rain",
  "showers",
  "snowfall",
  "snow_depth",
  "weather_code",
  "pressure_msl",
  "surface_pressure",
  "cloud_cover",
  "cloud_cover_low",
  "cloud_cover_mid",
  "cloud_cover_high",
  "visibility",
  "evapotranspiration",
  "et0_fao_evapotranspiration",
  "vapour_pressure_deficit",
  "wind_speed_10m",
  "wind_speed_80m",
  "wind_speed_120m",
  "wind_speed_180m",
  "wind_direction_10m",
  "wind_direction_80m",
  "wind_direction_120m",
  "wind_direction_180m",
  "wind_gusts_10m",
  "temperature_80m",
  "temperature_120m",
  "temperature_180m",
  "soil_temperature_0cm",
  "soil_temperature_6cm",
  "soil_temperature_18cm",
  "soil_temperature_54cm",
  "soil_moisture_0_to_1cm",
  "soil_moisture_1_to_3cm",
  "soil_moisture_3_to_9cm",
  "soil_moisture_9_to_27cm",
  "soil_moisture_27_to_81cm",
  "uv_index",
  "uv_index_clear_sky",
  "is_day",
  "sunshine_duration",
  "wet_bulb_temperature_2m",
  "total_column_integrated_water_vapour",
  "cape",
  "lifted_index",
  "convective_inhibition",
  "freezing_level_height",
  "boundary_layer_height",
  "shortwave_radiation",
  "direct_radiation",
  "diffuse_radiation",
  "direct_normal_irradiance",
  "global_tilted_irradiance",
  "terrestrial_radiation"
];

const forecastDailyVariables = [
  "weather_code",
  "temperature_2m_max",
  "temperature_2m_min",
  "apparent_temperature_max",
  "apparent_temperature_min",
  "sunrise",
  "sunset",
  "daylight_duration",
  "sunshine_duration",
  "uv_index_max",
  "uv_index_clear_sky_max",
  "rain_sum",
  "showers_sum",
  "snowfall_sum",
  "precipitation_sum",
  "precipitation_hours",
  "precipitation_probability_max",
  "wind_speed_10m_max",
  "wind_gusts_10m_max",
  "wind_direction_10m_dominant",
  "shortwave_radiation_sum",
  "et0_fao_evapotranspiration",
  "temperature_2m_mean",
  "apparent_temperature_mean",
  "cloud_cover_mean",
  "cloud_cover_max",
  "cloud_cover_min",
  "dew_point_2m_mean",
  "dew_point_2m_max",
  "dew_point_2m_min",
  "precipitation_probability_mean",
  "precipitation_probability_min",
  "relative_humidity_2m_mean",
  "relative_humidity_2m_max",
  "relative_humidity_2m_min",
  "snowfall_water_equivalent_sum",
  "pressure_msl_mean",
  "pressure_msl_max",
  "pressure_msl_min",
  "surface_pressure_mean",
  "surface_pressure_max",
  "surface_pressure_min",
  "wind_gusts_10m_mean",
  "wind_speed_10m_mean",
  "wind_gusts_10m_min",
  "wind_speed_10m_min",
  "wet_bulb_temperature_2m_mean",
  "wet_bulb_temperature_2m_max",
  "wet_bulb_temperature_2m_min",
  "vapour_pressure_deficit_max"
];

const historicalHourlyVariables = [
  "temperature_2m",
  "relative_humidity_2m",
  "dew_point_2m",
  "apparent_temperature",
  "precipitation",
  "rain",
  "snowfall",
  "snow_depth",
  "weather_code",
  "pressure_msl",
  "surface_pressure",
  "cloud_cover",
  "cloud_cover_low",
  "cloud_cover_mid",
  "cloud_cover_high",
  "et0_fao_evapotranspiration",
  "vapour_pressure_deficit",
  "wind_speed_10m",
  "wind_speed_100m",
  "wind_direction_10m",
  "wind_direction_100m",
  "wind_gusts_10m",
  "soil_temperature_0_to_7cm",
  "soil_temperature_7_to_28cm",
  "soil_temperature_28_to_100cm",
  "soil_temperature_100_to_255cm",
  "soil_moisture_0_to_7cm",
  "soil_moisture_7_to_28cm",
  "soil_moisture_28_to_100cm",
  "soil_moisture_100_to_255cm",
  "boundary_layer_height",
  "wet_bulb_temperature_2m",
  "total_column_integrated_water_vapour",
  "is_day",
  "sunshine_duration",
  "shortwave_radiation",
  "direct_radiation",
  "diffuse_radiation",
  "direct_normal_irradiance",
  "global_tilted_irradiance",
  "terrestrial_radiation"
];

const historicalDailyVariables = [
  "weather_code",
  "temperature_2m_mean",
  "temperature_2m_max",
  "temperature_2m_min",
  "apparent_temperature_mean",
  "apparent_temperature_max",
  "apparent_temperature_min",
  "sunrise",
  "sunset",
  "daylight_duration",
  "sunshine_duration",
  "precipitation_sum",
  "rain_sum",
  "snowfall_sum",
  "precipitation_hours",
  "wind_speed_10m_max",
  "wind_gusts_10m_max",
  "wind_direction_10m_dominant",
  "shortwave_radiation_sum",
  "et0_fao_evapotranspiration",
  "cloud_cover_mean",
  "cloud_cover_max",
  "cloud_cover_min",
  "dew_point_2m_mean",
  "dew_point_2m_max",
  "dew_point_2m_min",
  "relative_humidity_2m_mean",
  "relative_humidity_2m_max",
  "relative_humidity_2m_min",
  "pressure_msl_mean",
  "pressure_msl_max",
  "pressure_msl_min",
  "surface_pressure_mean",
  "surface_pressure_max",
  "surface_pressure_min",
  "wind_gusts_10m_mean",
  "wind_speed_10m_mean",
  "wind_gusts_10m_min",
  "wind_speed_10m_min",
  "wet_bulb_temperature_2m_mean",
  "wet_bulb_temperature_2m_max",
  "wet_bulb_temperature_2m_min",
  "vapour_pressure_deficit_max",
  "soil_moisture_0_to_100cm_mean",
  "soil_moisture_0_to_7cm_mean",
  "soil_moisture_28_to_100cm_mean",
  "soil_moisture_7_to_28cm_mean",
  "soil_temperature_0_to_100cm_mean",
  "soil_temperature_0_to_7cm_mean",
  "soil_temperature_28_to_100cm_mean",
  "soil_temperature_7_to_28cm_mean"
];

type OpenMeteoColumns = Record<string, WeatherPrimitive[]>;

type OpenMeteoApiResponse = {
  latitude: number;
  longitude: number;
  elevation?: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  generationtime_ms: number;
  current?: Record<string, WeatherPrimitive>;
  current_units?: Record<string, string>;
  hourly?: OpenMeteoColumns;
  hourly_units?: Record<string, string>;
  daily?: OpenMeteoColumns;
  daily_units?: Record<string, string>;
  error?: boolean;
  reason?: string;
};

type WeatherRequest = {
  latitude: number;
  longitude: number;
  name?: string;
};

export async function getWeatherBundle({ latitude, longitude, name }: WeatherRequest): Promise<WeatherBundle> {
  const { startDate, endDate } = lastNDaysRange(90);
  const forecastUrl = createForecastUrl(latitude, longitude);
  const archiveUrl = createArchiveUrl(latitude, longitude, startDate, endDate);

  const [forecast, archive] = await Promise.all([
    fetchOpenMeteo(forecastUrl, 15 * 60),
    fetchOpenMeteo(archiveUrl, 6 * 60 * 60)
  ]);

  const historicalDaily = columnsToRows(archive.daily);
  const historicalHourly = columnsToRows(archive.hourly);

  return {
    generatedAt: new Date().toISOString(),
    location: {
      name: name?.trim() || "Selected location",
      latitude: forecast.latitude,
      longitude: forecast.longitude,
      elevation: forecast.elevation,
      timezone: forecast.timezone,
      timezoneAbbreviation: forecast.timezone_abbreviation,
      utcOffsetSeconds: forecast.utc_offset_seconds
    },
    units: {
      current: forecast.current_units ?? {},
      forecastHourly: forecast.hourly_units ?? {},
      forecastDaily: forecast.daily_units ?? {},
      historicalHourly: archive.hourly_units ?? {},
      historicalDaily: archive.daily_units ?? {}
    },
    current: normalizeCurrent(forecast.current),
    forecast: {
      hourly: columnsToRows(forecast.hourly),
      daily: columnsToRows(forecast.daily)
    },
    history: {
      startDate,
      endDate,
      hourly: historicalHourly,
      daily: historicalDaily,
      summaries: buildHistoricalSummaries(historicalDaily, archive.daily_units ?? {})
    }
  };
}

function createForecastUrl(latitude: number, longitude: number) {
  const params = new URLSearchParams({
    latitude: latitude.toFixed(5),
    longitude: longitude.toFixed(5),
    timezone: "auto",
    forecast_days: "16",
    temperature_unit: "celsius",
    wind_speed_unit: "kmh",
    precipitation_unit: "mm",
    timeformat: "iso8601",
    current: currentVariables.join(","),
    hourly: forecastHourlyVariables.join(","),
    daily: forecastDailyVariables.join(",")
  });

  return `${FORECAST_ENDPOINT}?${params.toString()}`;
}

function createArchiveUrl(latitude: number, longitude: number, startDate: string, endDate: string) {
  const params = new URLSearchParams({
    latitude: latitude.toFixed(5),
    longitude: longitude.toFixed(5),
    start_date: startDate,
    end_date: endDate,
    timezone: "auto",
    temperature_unit: "celsius",
    wind_speed_unit: "kmh",
    precipitation_unit: "mm",
    timeformat: "iso8601",
    hourly: historicalHourlyVariables.join(","),
    daily: historicalDailyVariables.join(",")
  });

  return `${ARCHIVE_ENDPOINT}?${params.toString()}`;
}

async function fetchOpenMeteo(url: string, revalidate: number): Promise<OpenMeteoApiResponse> {
  const response = await fetch(url, {
    next: { revalidate },
    headers: {
      Accept: "application/json"
    }
  });

  const data = (await response.json()) as OpenMeteoApiResponse;

  if (!response.ok || data.error) {
    throw new Error(data.reason || `Open-Meteo request failed with ${response.status}`);
  }

  return data;
}

function normalizeCurrent(current?: Record<string, WeatherPrimitive>) {
  if (!current?.time) {
    return { time: "" };
  }

  return current as WeatherBundle["current"];
}

function columnsToRows(columns?: OpenMeteoColumns): WeatherRecord[] {
  const times = columns?.time;
  if (!Array.isArray(times)) {
    return [];
  }

  const keys = Object.keys(columns ?? {}).filter((key) => key !== "time");

  return times.map((time, index) => {
    const row: WeatherRecord = { time: String(time ?? "") };

    for (const key of keys) {
      const values = columns?.[key];
      row[key] = Array.isArray(values) ? values[index] ?? null : null;
    }

    return row;
  });
}

function buildHistoricalSummaries(daily: WeatherRecord[], units: Record<string, string>): HistoricalSummary[] {
  const hottest = maxBy(daily, (row) => asNumber(row.temperature_2m_max));
  const coldest = minBy(daily, (row) => asNumber(row.temperature_2m_min));
  const rainiest = maxBy(daily, (row) => asNumber(row.precipitation_sum));
  const windiest = maxBy(daily, (row) => asNumber(row.wind_speed_10m_max));
  const cloudiest = maxBy(daily, (row) => asNumber(row.cloud_cover_mean));

  return [
    {
      id: "average-temperature",
      label: "Average temperature",
      value: average(daily.map((row) => asNumber(row.temperature_2m_mean))),
      unit: units.temperature_2m_mean,
      tone: "sun"
    },
    {
      id: "average-feels-like",
      label: "Average feels like",
      value: average(daily.map((row) => asNumber(row.apparent_temperature_mean))),
      unit: units.apparent_temperature_mean,
      tone: "sun"
    },
    {
      id: "hottest-day",
      label: "Hottest day",
      value: hottest ? asNumber(hottest.temperature_2m_max) : null,
      unit: units.temperature_2m_max,
      date: hottest?.time,
      tone: "sun"
    },
    {
      id: "coldest-day",
      label: "Coldest day",
      value: coldest ? asNumber(coldest.temperature_2m_min) : null,
      unit: units.temperature_2m_min,
      date: coldest?.time,
      tone: "cloud"
    },
    {
      id: "rainiest-day",
      label: "Rainiest day",
      value: rainiest ? asNumber(rainiest.precipitation_sum) : null,
      unit: units.precipitation_sum,
      date: rainiest?.time,
      tone: "rain"
    },
    {
      id: "total-rain",
      label: "Total precipitation",
      value: sum(daily.map((row) => asNumber(row.precipitation_sum))),
      unit: units.precipitation_sum,
      tone: "rain"
    },
    {
      id: "windiest-day",
      label: "Windiest day",
      value: windiest ? asNumber(windiest.wind_speed_10m_max) : null,
      unit: units.wind_speed_10m_max,
      date: windiest?.time,
      tone: "wind"
    },
    {
      id: "average-humidity",
      label: "Average humidity",
      value: average(daily.map((row) => asNumber(row.relative_humidity_2m_mean))),
      unit: units.relative_humidity_2m_mean,
      tone: "leaf"
    },
    {
      id: "average-pressure",
      label: "Average pressure",
      value: average(daily.map((row) => asNumber(row.pressure_msl_mean))),
      unit: units.pressure_msl_mean,
      tone: "neutral"
    },
    {
      id: "cloudiest-day",
      label: "Cloudiest day",
      value: cloudiest ? asNumber(cloudiest.cloud_cover_mean) : null,
      unit: units.cloud_cover_mean,
      date: cloudiest?.time,
      tone: "cloud"
    }
  ];
}
