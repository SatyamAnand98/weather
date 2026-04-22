import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function asNumber(value: unknown): number | null {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return null;
  }

  return value;
}

export function average(values: Array<number | null | undefined>) {
  const safeValues = values.filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  if (!safeValues.length) {
    return null;
  }

  return safeValues.reduce((sum, value) => sum + value, 0) / safeValues.length;
}

export function sum(values: Array<number | null | undefined>) {
  return values.reduce<number>((total, value) => total + (typeof value === "number" && Number.isFinite(value) ? value : 0), 0);
}

export function maxBy<T>(items: T[], getValue: (item: T) => number | null | undefined): T | null {
  return items.reduce<T | null>((best, item) => {
    const value = getValue(item);
    if (typeof value !== "number" || !Number.isFinite(value)) {
      return best;
    }

    if (!best) {
      return item;
    }

    const bestValue = getValue(best);
    return typeof bestValue !== "number" || value > bestValue ? item : best;
  }, null);
}

export function minBy<T>(items: T[], getValue: (item: T) => number | null | undefined): T | null {
  return items.reduce<T | null>((best, item) => {
    const value = getValue(item);
    if (typeof value !== "number" || !Number.isFinite(value)) {
      return best;
    }

    if (!best) {
      return item;
    }

    const bestValue = getValue(best);
    return typeof bestValue !== "number" || value < bestValue ? item : best;
  }, null);
}

export function clampCoordinate(latitude: number, longitude: number) {
  return {
    latitude: Math.min(90, Math.max(-90, latitude)),
    longitude: Math.min(180, Math.max(-180, longitude))
  };
}
