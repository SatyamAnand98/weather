import type { WeatherPrimitive } from "@/types/weather";

export function formatNumber(value: WeatherPrimitive | undefined, digits = 0) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "Unavailable";
  }

  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits
  }).format(value);
}

export function formatMetric(value: WeatherPrimitive | undefined, unit?: string, digits = 0) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "Unavailable";
  }

  const formatted = formatNumber(value, digits);
  return unit ? `${formatted} ${unit}` : formatted;
}

export function formatVisibility(value: WeatherPrimitive | undefined, unit?: string) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "Unavailable";
  }

  if (unit === "m") {
    return `${formatNumber(value / 1000, 1)} km`;
  }

  return formatMetric(value, unit, 1);
}

export function formatDurationFromSeconds(value: WeatherPrimitive | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "Unavailable";
  }

  const hours = Math.floor(value / 3600);
  const minutes = Math.round((value % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

export function windCompass(degrees: WeatherPrimitive | undefined) {
  if (typeof degrees !== "number" || !Number.isFinite(degrees)) {
    return "Unavailable";
  }

  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(degrees / 45) % 8;
  return `${directions[index]} ${Math.round(degrees)}deg`;
}

export function labelForField(field: string) {
  const known: Record<string, string> = {
    apparent_temperature: "Feels like",
    apparent_temperature_max: "Max feels like",
    apparent_temperature_mean: "Mean feels like",
    apparent_temperature_min: "Min feels like",
    boundary_layer_height: "Boundary layer height",
    cape: "CAPE",
    cloud_cover: "Cloud cover",
    cloud_cover_high: "High cloud cover",
    cloud_cover_low: "Low cloud cover",
    cloud_cover_max: "Max cloud cover",
    cloud_cover_mean: "Mean cloud cover",
    cloud_cover_mid: "Mid cloud cover",
    cloud_cover_min: "Min cloud cover",
    convective_inhibition: "Convective inhibition",
    dew_point_2m: "Dew point",
    dew_point_2m_max: "Max dew point",
    dew_point_2m_mean: "Mean dew point",
    dew_point_2m_min: "Min dew point",
    direct_normal_irradiance: "Direct normal irradiance",
    direct_radiation: "Direct radiation",
    diffuse_radiation: "Diffuse radiation",
    et0_fao_evapotranspiration: "Reference evapotranspiration",
    evapotranspiration: "Evapotranspiration",
    freezing_level_height: "Freezing level",
    global_tilted_irradiance: "Global tilted irradiance",
    is_day: "Daylight",
    lifted_index: "Lifted index",
    precipitation: "Precipitation",
    precipitation_hours: "Precipitation hours",
    precipitation_probability: "Precipitation probability",
    precipitation_probability_max: "Max precipitation probability",
    precipitation_probability_mean: "Mean precipitation probability",
    precipitation_probability_min: "Min precipitation probability",
    precipitation_sum: "Total precipitation",
    pressure_msl: "Sea-level pressure",
    pressure_msl_max: "Max sea-level pressure",
    pressure_msl_mean: "Mean sea-level pressure",
    pressure_msl_min: "Min sea-level pressure",
    relative_humidity_2m: "Humidity",
    relative_humidity_2m_max: "Max humidity",
    relative_humidity_2m_mean: "Mean humidity",
    relative_humidity_2m_min: "Min humidity",
    shortwave_radiation: "Shortwave radiation",
    shortwave_radiation_sum: "Shortwave radiation sum",
    snow_depth: "Snow depth",
    snowfall: "Snowfall",
    snowfall_sum: "Snowfall total",
    snowfall_water_equivalent_sum: "Snow water equivalent",
    soil_moisture_0_to_100cm_mean: "Mean soil moisture 0-100 cm",
    soil_moisture_0_to_7cm: "Soil moisture 0-7 cm",
    soil_moisture_0_to_7cm_mean: "Mean soil moisture 0-7 cm",
    soil_moisture_0_to_1cm: "Soil moisture 0-1 cm",
    soil_moisture_1_to_3cm: "Soil moisture 1-3 cm",
    soil_moisture_3_to_9cm: "Soil moisture 3-9 cm",
    soil_moisture_7_to_28cm: "Soil moisture 7-28 cm",
    soil_moisture_7_to_28cm_mean: "Mean soil moisture 7-28 cm",
    soil_moisture_9_to_27cm: "Soil moisture 9-27 cm",
    soil_moisture_27_to_81cm: "Soil moisture 27-81 cm",
    soil_moisture_28_to_100cm: "Soil moisture 28-100 cm",
    soil_moisture_28_to_100cm_mean: "Mean soil moisture 28-100 cm",
    soil_moisture_100_to_255cm: "Soil moisture 100-255 cm",
    soil_temperature_0_to_100cm_mean: "Mean soil temp 0-100 cm",
    soil_temperature_0_to_7cm: "Soil temp 0-7 cm",
    soil_temperature_0_to_7cm_mean: "Mean soil temp 0-7 cm",
    soil_temperature_0cm: "Soil temp surface",
    soil_temperature_6cm: "Soil temp 6 cm",
    soil_temperature_7_to_28cm: "Soil temp 7-28 cm",
    soil_temperature_7_to_28cm_mean: "Mean soil temp 7-28 cm",
    soil_temperature_18cm: "Soil temp 18 cm",
    soil_temperature_28_to_100cm: "Soil temp 28-100 cm",
    soil_temperature_28_to_100cm_mean: "Mean soil temp 28-100 cm",
    soil_temperature_54cm: "Soil temp 54 cm",
    soil_temperature_100_to_255cm: "Soil temp 100-255 cm",
    surface_pressure: "Surface pressure",
    surface_pressure_max: "Max surface pressure",
    surface_pressure_mean: "Mean surface pressure",
    surface_pressure_min: "Min surface pressure",
    temperature_2m: "Temperature",
    temperature_2m_max: "High temperature",
    temperature_2m_mean: "Mean temperature",
    temperature_2m_min: "Low temperature",
    temperature_80m: "Temperature 80 m",
    temperature_120m: "Temperature 120 m",
    temperature_180m: "Temperature 180 m",
    terrestrial_radiation: "Terrestrial radiation",
    total_column_integrated_water_vapour: "Water vapour",
    uv_index: "UV index",
    uv_index_clear_sky: "Clear-sky UV index",
    uv_index_clear_sky_max: "Max clear-sky UV",
    uv_index_max: "Max UV index",
    vapour_pressure_deficit: "Vapour pressure deficit",
    vapour_pressure_deficit_max: "Max vapour pressure deficit",
    visibility: "Visibility",
    weather_code: "Condition code",
    wet_bulb_temperature_2m: "Wet bulb temperature",
    wet_bulb_temperature_2m_max: "Max wet bulb temperature",
    wet_bulb_temperature_2m_mean: "Mean wet bulb temperature",
    wet_bulb_temperature_2m_min: "Min wet bulb temperature",
    wind_direction_10m: "Wind direction",
    wind_direction_10m_dominant: "Dominant wind direction",
    wind_direction_80m: "Wind direction 80 m",
    wind_direction_100m: "Wind direction 100 m",
    wind_direction_120m: "Wind direction 120 m",
    wind_direction_180m: "Wind direction 180 m",
    wind_gusts_10m: "Wind gusts",
    wind_gusts_10m_max: "Max wind gusts",
    wind_gusts_10m_mean: "Mean wind gusts",
    wind_gusts_10m_min: "Min wind gusts",
    wind_speed_10m: "Wind speed",
    wind_speed_10m_max: "Max wind speed",
    wind_speed_10m_mean: "Mean wind speed",
    wind_speed_10m_min: "Min wind speed",
    wind_speed_80m: "Wind speed 80 m",
    wind_speed_100m: "Wind speed 100 m",
    wind_speed_120m: "Wind speed 120 m",
    wind_speed_180m: "Wind speed 180 m"
  };

  return known[field] ?? field.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
