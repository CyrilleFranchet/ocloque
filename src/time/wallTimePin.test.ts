import { describe, expect, it } from 'vitest';
import { nowWallParts, utcMsToWallParts, wallTimeToUtcMs } from './wallTimePin';

describe('wallTimeToUtcMs', () => {
  it('round-trips a winter instant in Europe/Paris', () => {
    const iana = 'Europe/Paris';
    const parts = { year: 2024, month: 1, day: 15, hour: 14, minute: 30 };
    const ms = wallTimeToUtcMs(iana, parts);
    expect(ms).not.toBeNull();
    const back = utcMsToWallParts(ms!, iana);
    expect(back.year).toBe(2024);
    expect(back.month).toBe(1);
    expect(back.day).toBe(15);
    expect(back.hour).toBe(14);
    expect(back.minute).toBe(30);
  });

  it('matches UTC noon', () => {
    const ms = wallTimeToUtcMs('UTC', { year: 2024, month: 6, day: 15, hour: 12, minute: 0 });
    expect(ms).toBe(Date.UTC(2024, 5, 15, 12, 0, 0, 0));
  });
});

describe('nowWallParts', () => {
  it('returns ordered date parts', () => {
    const p = nowWallParts('UTC');
    expect(p.year).toBeGreaterThan(2020);
    expect(p.month).toBeGreaterThanOrEqual(1);
    expect(p.month).toBeLessThanOrEqual(12);
    expect(p.day).toBeGreaterThanOrEqual(1);
    expect(p.day).toBeLessThanOrEqual(31);
  });
});
