import { describe, expect, it } from 'vitest';
import { isValidIanaTimeZone, listIanaTimeZones, normalizeIanaTimeZone } from './timeZone';

describe('listIanaTimeZones', () => {
  it('returns a non-empty sorted list', () => {
    const zones = listIanaTimeZones();
    expect(zones.length).toBeGreaterThan(0);
    const sorted = [...zones].sort((a, b) => a.localeCompare(b));
    expect(zones).toEqual(sorted);
    expect(zones).toContain('UTC');
  });
});

describe('isValidIanaTimeZone', () => {
  it('accepts common IANA zones', () => {
    expect(isValidIanaTimeZone('Europe/Paris')).toBe(true);
    expect(isValidIanaTimeZone('America/New_York')).toBe(true);
  });

  it('rejects invalid identifiers', () => {
    expect(isValidIanaTimeZone('Not/A/Zone')).toBe(false);
    expect(isValidIanaTimeZone('')).toBe(false);
    expect(isValidIanaTimeZone('   ')).toBe(false);
  });
});

describe('normalizeIanaTimeZone', () => {
  it('returns trimmed valid zones unchanged', () => {
    expect(normalizeIanaTimeZone('  Europe/Paris  ')).toBe('Europe/Paris');
  });

  it('falls back when invalid', () => {
    expect(normalizeIanaTimeZone('Not/A/Zone', 'UTC')).toBe('UTC');
  });

  it('falls back when empty', () => {
    expect(normalizeIanaTimeZone('', 'UTC')).toBe('UTC');
  });
});
