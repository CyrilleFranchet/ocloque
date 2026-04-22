import { DateTime } from 'luxon';

export type WallDateParts = {
  year: number;
  month: number;
  day: number;
};

export type WallTimeParts = WallDateParts & {
  hour: number;
  minute: number;
};

/**
 * Converts a calendar date + wall clock in `iana` to UTC epoch milliseconds.
 * Returns `null` if Luxon considers the combination invalid (e.g. skipped DST hour).
 */
export function wallTimeToUtcMs(iana: string, parts: WallTimeParts): number | null {
  const dt = DateTime.fromObject(
    {
      year: parts.year,
      month: parts.month,
      day: parts.day,
      hour: parts.hour,
      minute: parts.minute,
      second: 0,
      millisecond: 0,
    },
    { zone: iana },
  );
  if (!dt.isValid) return null;
  return dt.toUTC().toMillis();
}

export function utcMsToWallParts(utcMs: number, iana: string): WallTimeParts {
  const dt = DateTime.fromMillis(utcMs, { zone: iana });
  return {
    year: dt.year,
    month: dt.month,
    day: dt.day,
    hour: dt.hour,
    minute: dt.minute,
  };
}

export function nowWallParts(iana: string): WallTimeParts {
  const dt = DateTime.now().setZone(iana);
  return {
    year: dt.year,
    month: dt.month,
    day: dt.day,
    hour: dt.hour,
    minute: dt.minute,
  };
}
