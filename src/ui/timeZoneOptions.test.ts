import { describe, expect, it } from 'vitest';
import { filteredTimeZones } from './timeZoneOptions';

describe('filteredTimeZones', () => {
  const all = ['Africa/Abidjan', 'Europe/Paris', 'America/New_York', 'UTC'];

  it('returns all zones when query empty up to limit', () => {
    expect(filteredTimeZones(all, '', 'UTC', 10)).toEqual(all);
  });

  it('filters by substring', () => {
    expect(filteredTimeZones(all, 'paris', 'Europe/Paris', 10)).toEqual(['Europe/Paris']);
  });

  it('prepends selected when not in capped results', () => {
    const many = Array.from({ length: 100 }, (_, i) => `Zone/Num_${i}`);
    many.push('Europe/Paris');
    const out = filteredTimeZones(many, 'Num_', 'Europe/Paris', 5);
    expect(out[0]).toBe('Europe/Paris');
    expect(out.length).toBeLessThanOrEqual(5);
  });
});
