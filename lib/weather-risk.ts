import { formatDateTimeLabel } from "@/lib/date";
import { formatMetric } from "@/lib/format";
import { getWeatherCondition } from "@/lib/weather-code";
import type { UnitsMap, WeatherBundle, WeatherPrimitive, WeatherRecord } from "@/types/weather";

export type DangerLevel = "low" | "moderate" | "high" | "severe";

export type DangerSignal = {
  label: string;
  value: string;
  score: number;
};

export type DangerAssessment = {
  time: string;
  label: string;
  level: DangerLevel;
  score: number;
  signals: DangerSignal[];
  summary: string;
};

const DANGER_WINDOW_HOURS = 72;

export function buildCurrentSummary(data: WeatherBundle) {
  const current = data.current;
  const units = data.units.current;
  const condition = getWeatherCondition(current.weather_code, current.is_day === 1 || current.is_day === true);

  return [
    `${condition.label}`,
    `${formatMetric(current.temperature_2m, units.temperature_2m, 0)} now`,
    `feels ${formatMetric(current.apparent_temperature, units.apparent_temperature, 0)}`,
    `humidity ${formatMetric(current.relative_humidity_2m, units.relative_humidity_2m, 0)}`,
    `wind ${formatMetric(current.wind_speed_10m, units.wind_speed_10m, 0)}`,
    `UV ${formatMetric(current.uv_index, units.uv_index, 1)}`
  ].join(" · ");
}

export function findHighestDanger(data: WeatherBundle): DangerAssessment {
  const startIndex = Math.max(
    0,
    data.forecast.hourly.findIndex((row) => String(row.time) >= String(data.current.time))
  );
  const window = data.forecast.hourly.slice(startIndex, startIndex + DANGER_WINDOW_HOURS);
  const assessments = window.map((row) => assessHour(row, data.units.forecastHourly));
  const highest = assessments.reduce<DangerAssessment | null>((best, item) => {
    if (!best || item.score > best.score) {
      return item;
    }

    return best;
  }, null);

  return (
    highest ?? {
      time: data.current.time,
      label: formatDateTimeLabel(data.current.time),
      level: "low",
      score: 0,
      signals: [],
      summary: "No meaningful weather risk found in the upcoming forecast window."
    }
  );
}

export function buildHourlyNotification(data: WeatherBundle) {
  const danger = findHighestDanger(data);
  const title = `${data.location.name}: hourly weather`;
  const dangerLine =
    danger.level === "low"
      ? `Highest watch: ${danger.summary}`
      : `Highest ${danger.level} risk: ${danger.summary}`;

  return {
    title,
    body: `${buildCurrentSummary(data)}\n${dangerLine}`,
    danger
  };
}

function assessHour(row: WeatherRecord, units: UnitsMap): DangerAssessment {
  const signals: DangerSignal[] = [];
  const condition = getWeatherCondition(row.weather_code, row.is_day === 1 || row.is_day === true);

  addWeatherCodeSignal(signals, Number(row.weather_code), condition.label);
  addTemperatureSignal(signals, row.apparent_temperature ?? row.temperature_2m, units.apparent_temperature ?? units.temperature_2m);
  addUvSignal(signals, row.uv_index, units.uv_index);
  addWindSignal(signals, row.wind_gusts_10m, row.wind_speed_10m, units.wind_gusts_10m ?? units.wind_speed_10m);
  addRainSignal(signals, row.precipitation, row.rain, row.precipitation_probability, units.precipitation ?? units.rain);
  addSnowSignal(signals, row.snowfall, units.snowfall);
  addVisibilitySignal(signals, row.visibility, units.visibility);

  const sortedSignals = signals.sort((a, b) => b.score - a.score);
  const score = sortedSignals.reduce((total, signal) => total + signal.score, 0);
  const level = getDangerLevel(score, sortedSignals[0]?.score ?? 0);
  const topSignals = sortedSignals.slice(0, 3);
  const signalText = topSignals.length
    ? topSignals.map((signal) => `${signal.label} ${signal.value}`).join(", ")
    : `${condition.label}, stable range`;

  return {
    time: row.time,
    label: formatDateTimeLabel(row.time),
    level,
    score,
    signals: topSignals,
    summary: `${formatDateTimeLabel(row.time)} · ${signalText}`
  };
}

function addWeatherCodeSignal(signals: DangerSignal[], code: number, label: string) {
  if ([95, 96, 99].includes(code)) {
    signals.push({ label, value: "storm possible", score: code === 99 ? 95 : 80 });
    return;
  }

  if ([65, 67, 82].includes(code)) {
    signals.push({ label, value: "heavy rain", score: 70 });
    return;
  }

  if ([75, 86].includes(code)) {
    signals.push({ label, value: "heavy snow", score: 70 });
    return;
  }

  if ([45, 48].includes(code)) {
    signals.push({ label, value: "fog", score: 35 });
  }
}

function addTemperatureSignal(signals: DangerSignal[], value: WeatherPrimitive | undefined, unit?: string) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return;
  }

  if (value >= 45) {
    signals.push({ label: "Extreme heat", value: formatMetric(value, unit, 0), score: 95 });
  } else if (value >= 40) {
    signals.push({ label: "Dangerous heat", value: formatMetric(value, unit, 0), score: 75 });
  } else if (value >= 35) {
    signals.push({ label: "High heat", value: formatMetric(value, unit, 0), score: 45 });
  } else if (value <= -15) {
    signals.push({ label: "Extreme cold", value: formatMetric(value, unit, 0), score: 85 });
  } else if (value <= -5) {
    signals.push({ label: "Dangerous cold", value: formatMetric(value, unit, 0), score: 60 });
  } else if (value <= 0) {
    signals.push({ label: "Freezing", value: formatMetric(value, unit, 0), score: 35 });
  }
}

function addUvSignal(signals: DangerSignal[], value: WeatherPrimitive | undefined, unit?: string) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return;
  }

  if (value >= 11) {
    signals.push({ label: "Extreme UV", value: formatMetric(value, unit, 1), score: 85 });
  } else if (value >= 8) {
    signals.push({ label: "Very high UV", value: formatMetric(value, unit, 1), score: 60 });
  } else if (value >= 6) {
    signals.push({ label: "High UV", value: formatMetric(value, unit, 1), score: 35 });
  }
}

function addWindSignal(
  signals: DangerSignal[],
  gust: WeatherPrimitive | undefined,
  sustained: WeatherPrimitive | undefined,
  unit?: string
) {
  const gustValue = typeof gust === "number" && Number.isFinite(gust) ? gust : null;
  const sustainedValue = typeof sustained === "number" && Number.isFinite(sustained) ? sustained : null;

  if (gustValue !== null) {
    if (gustValue >= 90) {
      signals.push({ label: "Severe gusts", value: formatMetric(gustValue, unit, 0), score: 90 });
    } else if (gustValue >= 70) {
      signals.push({ label: "Dangerous gusts", value: formatMetric(gustValue, unit, 0), score: 70 });
    } else if (gustValue >= 50) {
      signals.push({ label: "Strong gusts", value: formatMetric(gustValue, unit, 0), score: 40 });
    }
  }

  if (sustainedValue !== null && sustainedValue >= 50) {
    signals.push({ label: "Strong wind", value: formatMetric(sustainedValue, unit, 0), score: sustainedValue >= 70 ? 65 : 35 });
  }
}

function addRainSignal(
  signals: DangerSignal[],
  precipitation: WeatherPrimitive | undefined,
  rain: WeatherPrimitive | undefined,
  probability: WeatherPrimitive | undefined,
  unit?: string
) {
  const amount =
    typeof precipitation === "number" && Number.isFinite(precipitation)
      ? precipitation
      : typeof rain === "number" && Number.isFinite(rain)
        ? rain
        : null;
  const probabilityValue = typeof probability === "number" && Number.isFinite(probability) ? probability : null;

  if (amount !== null) {
    if (amount >= 20) {
      signals.push({ label: "Extreme rain", value: formatMetric(amount, unit, 1), score: 90 });
    } else if (amount >= 10) {
      signals.push({ label: "Heavy rain", value: formatMetric(amount, unit, 1), score: 65 });
    } else if (amount >= 5) {
      signals.push({ label: "Moderate rain", value: formatMetric(amount, unit, 1), score: 35 });
    }
  }

  if (probabilityValue !== null && probabilityValue >= 85) {
    signals.push({ label: "Rain chance", value: formatMetric(probabilityValue, "%", 0), score: amount !== null && amount >= 5 ? 30 : 20 });
  }
}

function addSnowSignal(signals: DangerSignal[], value: WeatherPrimitive | undefined, unit?: string) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return;
  }

  if (value >= 5) {
    signals.push({ label: "Heavy snowfall", value: formatMetric(value, unit, 1), score: 80 });
  } else if (value >= 2) {
    signals.push({ label: "Snowfall", value: formatMetric(value, unit, 1), score: 55 });
  } else if (value >= 0.5) {
    signals.push({ label: "Light snow", value: formatMetric(value, unit, 1), score: 30 });
  }
}

function addVisibilitySignal(signals: DangerSignal[], value: WeatherPrimitive | undefined, unit?: string) {
  if (typeof value !== "number" || !Number.isFinite(value) || unit !== "m") {
    return;
  }

  if (value <= 500) {
    signals.push({ label: "Very low visibility", value: `${Math.round(value)} m`, score: 85 });
  } else if (value <= 1000) {
    signals.push({ label: "Low visibility", value: `${Math.round(value)} m`, score: 60 });
  } else if (value <= 2000) {
    signals.push({ label: "Reduced visibility", value: `${Math.round(value)} m`, score: 30 });
  }
}

function getDangerLevel(score: number, highestSignal: number): DangerLevel {
  if (score >= 110 || highestSignal >= 90) {
    return "severe";
  }

  if (score >= 70 || highestSignal >= 70) {
    return "high";
  }

  if (score >= 35 || highestSignal >= 35) {
    return "moderate";
  }

  return "low";
}
