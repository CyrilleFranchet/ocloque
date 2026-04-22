const FALLBACK_ZONES = [
  'UTC',
  'Europe/London',
  'Europe/Paris',
  'America/New_York',
  'America/Los_Angeles',
  'Asia/Tokyo',
  'Australia/Sydney',
] as const;

function hasSupportedTimeZones(): boolean {
  return (
    typeof Intl !== 'undefined' &&
    typeof (Intl as { supportedValuesOf?: (k: string) => string[] }).supportedValuesOf === 'function'
  );
}

function sortZones(zones: string[]): string[] {
  return zones.slice().sort((a, b) => a.localeCompare(b));
}

export function listIanaTimeZones(): string[] {
  if (hasSupportedTimeZones()) {
    const raw = (Intl as { supportedValuesOf: (k: string) => string[] }).supportedValuesOf('timeZone');
    const merged = raw.includes('UTC') ? raw : [...raw, 'UTC'];
    return sortZones(merged);
  }
  return sortZones([...FALLBACK_ZONES]);
}

export function isValidIanaTimeZone(zone: string): boolean {
  const trimmed = zone.trim();
  if (!trimmed) return false;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: trimmed }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

export function normalizeIanaTimeZone(zone: string, fallback = 'UTC'): string {
  const trimmed = zone.trim();
  if (!trimmed) return fallback;
  return isValidIanaTimeZone(trimmed) ? trimmed : fallback;
}
