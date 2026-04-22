const DAY_MS = 24 * 60 * 60 * 1000;

export function toISODate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * DAY_MS);
}

export function lastNDaysRange(days: number) {
  const end = addDays(new Date(), -1);
  const start = addDays(end, -(days - 1));

  return {
    startDate: toISODate(start),
    endDate: toISODate(end)
  };
}

export function formatDateLabel(value: string, options: Intl.DateTimeFormatOptions = {}) {
  const datePart = value.split("T")[0];
  const [year, month, day] = datePart.split("-").map(Number);
  if (!year || !month || !day) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
    ...options
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export function formatCompactDate(value: string) {
  return formatDateLabel(value, { weekday: undefined, month: "short", day: "numeric" });
}

export function formatHour(value: string) {
  const timePart = value.split("T")[1];
  if (!timePart) {
    return value;
  }

  return timePart.slice(0, 5);
}

export function formatDateTimeLabel(value: string) {
  if (!value.includes("T")) {
    return formatDateLabel(value);
  }

  return `${formatDateLabel(value)} ${formatHour(value)}`;
}

export function sameLocalDate(value: string, date: string) {
  return value.slice(0, 10) === date;
}

export function daysBetween(startDate: string, endDate: string) {
  const start = new Date(`${startDate}T00:00:00Z`).getTime();
  const end = new Date(`${endDate}T00:00:00Z`).getTime();
  return Math.floor((end - start) / DAY_MS) + 1;
}
