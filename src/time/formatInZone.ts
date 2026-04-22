import { normalizeIanaTimeZone } from './timeZone';

export type ZonedInstantDisplay = {
  time: string;
  dateLong: string;
  timeZoneId: string;
  offsetLabel: string;
  /** Short name from Intl (e.g. EST, IST); may include numeric offsets on some engines. */
  abbreviation: string;
};

function offsetLabelFor(date: Date, ianaTimeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: ianaTimeZone,
    timeZoneName: 'longOffset',
  }).formatToParts(date);
  const name = parts.find((p) => p.type === 'timeZoneName')?.value;
  return name ?? '';
}

export function formatTimeZoneAbbreviation(instant: Date, ianaTimeZone: string): string {
  const timeZoneId = normalizeIanaTimeZone(ianaTimeZone);
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timeZoneId,
    timeZoneName: 'short',
  }).formatToParts(instant);
  return parts.find((p) => p.type === 'timeZoneName')?.value?.trim() ?? '';
}

export function formatInstantInZone(
  instant: Date,
  requestedZone: string,
  fallbackZone = 'UTC',
): ZonedInstantDisplay {
  const timeZoneId = normalizeIanaTimeZone(requestedZone, fallbackZone);

  const time = new Intl.DateTimeFormat('en-US', {
    timeZone: timeZoneId,
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(instant);

  const dateLong = new Intl.DateTimeFormat('en-US', {
    timeZone: timeZoneId,
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(instant);

  const offsetLabel = offsetLabelFor(instant, timeZoneId);
  const abbreviation = formatTimeZoneAbbreviation(instant, timeZoneId);

  return { time, dateLong, timeZoneId, offsetLabel, abbreviation };
}
