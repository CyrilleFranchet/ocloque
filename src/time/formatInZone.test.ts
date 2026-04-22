import { describe, expect, it } from 'vitest';
import { formatInstantInZone } from './formatInZone';

describe('formatInstantInZone', () => {
  it('formats a fixed instant in UTC', () => {
    const instant = new Date('2024-06-15T14:30:45.000Z');
    const out = formatInstantInZone(instant, 'UTC');
    expect(out.timeZoneId).toBe('UTC');
    expect(out.time).toMatch(/2:30:45/);
    expect(out.dateLong).toContain('2024');
    expect(out.offsetLabel).toMatch(/GMT/);
  });

  it('uses fallback for invalid zones', () => {
    const instant = new Date('2024-06-15T14:30:45.000Z');
    const out = formatInstantInZone(instant, 'Not/A/Zone', 'UTC');
    expect(out.timeZoneId).toBe('UTC');
  });

  it('formats New York with numeric time components', () => {
    const instant = new Date('2024-01-15T20:00:00.000Z');
    const out = formatInstantInZone(instant, 'America/New_York');
    expect(out.timeZoneId).toBe('America/New_York');
    expect(out.time).toMatch(/\d{1,2}:\d{2}:\d{2}/);
    expect(out.dateLong.length).toBeGreaterThan(10);
  });
});
