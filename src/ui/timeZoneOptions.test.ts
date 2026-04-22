import { describe, expect, it } from 'vitest';
import type { ZoneShortcut } from '../time/zoneShortcuts';
import { filteredIanaZones } from './timeZoneOptions';

const sampleShortcuts: readonly ZoneShortcut[] = [
  { abbr: 'EST', description: 'US Eastern', iana: 'America/New_York' },
  { abbr: 'IST', description: 'India', iana: 'Asia/Kolkata' },
];

describe('filteredIanaZones', () => {
  const all = ['Africa/Abidjan', 'Europe/Paris', 'America/New_York', 'Asia/Kolkata', 'UTC'];

  it('lists shortcut zones first when the filter is empty', () => {
    const out = filteredIanaZones(all, sampleShortcuts, '', 'UTC', 10);
    expect(out[0]).toBe('America/New_York');
    expect(out[1]).toBe('Asia/Kolkata');
    expect(out).toContain('UTC');
  });

  it('matches IANA paths and abbreviation tokens', () => {
    expect(filteredIanaZones(all, sampleShortcuts, 'paris', 'UTC', 10)).toEqual(['Europe/Paris']);
    expect(filteredIanaZones(all, sampleShortcuts, 'est', 'UTC', 10)).toContain('America/New_York');
    expect(filteredIanaZones(all, sampleShortcuts, 'ist', 'UTC', 10)).toContain('Asia/Kolkata');
  });

  it('prepends selected when it matches the filter but would fall outside the cap', () => {
    const many = Array.from({ length: 100 }, (_, i) => `Zone/Num_${i}`);
    const out = filteredIanaZones(many, [], 'Num_', 'Zone/Num_3', 3);
    expect(out[0]).toBe('Zone/Num_3');
    expect(out.length).toBe(3);
  });
});
