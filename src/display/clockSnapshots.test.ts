import { describe, expect, it } from 'vitest';
import { buildClockSnapshots } from './clockSnapshots';

const utcExtra = (id: string, offsetHours = 0) => ({
  id,
  ianaTimeZone: 'UTC' as const,
  offsetHours,
});

describe('buildClockSnapshots', () => {
  it('places local first then extras', () => {
    const instant = new Date('2024-03-10T18:00:00.000Z');
    const snaps = buildClockSnapshots(instant, 'UTC', 0, [
      { id: 'c1', ianaTimeZone: 'Europe/Paris', offsetHours: 0 },
      { id: 'c2', ianaTimeZone: 'America/New_York', offsetHours: 0 },
    ]);
    expect(snaps).toHaveLength(3);
    expect(snaps[0].role).toBe('local');
    expect(snaps[0].id).toBe('local');
    expect(snaps[0].headingLabel).toContain('Local');
    expect(snaps[0].ianaCaption).toBe('UTC');
    expect(snaps[1].ianaCaption).toBe('Europe/Paris');
    expect(snaps[2].ianaCaption).toBe('America/New_York');
    expect(snaps[1].id).toBe('c1');
    expect(snaps[1].role).toBe('extra');
    expect(snaps[2].id).toBe('c2');
  });

  it('formats each face with time and date strings', () => {
    const instant = new Date('2024-03-10T18:00:00.000Z');
    const snaps = buildClockSnapshots(instant, 'UTC', 0, [utcExtra('c1')]);
    for (const s of snaps) {
      expect(s.time).toMatch(/\d/);
      expect(s.dateLong.length).toBeGreaterThan(6);
      expect(s.offsetLabel).toMatch(/GMT/);
      expect(s.ianaCaption.length).toBeGreaterThan(0);
      expect(s.abbreviation.length).toBeGreaterThan(0);
    }
  });

  it('uses winter abbreviations for New York in January', () => {
    const instant = new Date('2024-01-15T18:00:00.000Z');
    const snaps = buildClockSnapshots(instant, 'UTC', 0, [
      { id: 'c1', ianaTimeZone: 'America/New_York', offsetHours: 0 },
    ]);
    const ny = snaps[1];
    expect(ny.ianaCaption).toBe('America/New_York');
    expect(ny.abbreviation).toMatch(/^(EST|EDT|ET|GMT-5|GMT-4)$/);
  });

  it('shifts displayed wall time when display offset hours are applied', () => {
    const instant = new Date('2024-06-15T12:00:00.000Z');
    const base = buildClockSnapshots(instant, 'UTC', 0, [utcExtra('c1', 0)]);
    const shifted = buildClockSnapshots(instant, 'UTC', 0, [utcExtra('c1', 2)]);
    expect(base[1].time).not.toBe(shifted[1].time);
    expect(shifted[1].offsetLabel).toContain('display +2 h');
  });

  it('applies local display offset independently', () => {
    const instant = new Date('2024-06-15T12:00:00.000Z');
    const a = buildClockSnapshots(instant, 'UTC', 0, [utcExtra('c1', 0)]);
    const b = buildClockSnapshots(instant, 'UTC', 3, [utcExtra('c1', 0)]);
    expect(a[0].time).not.toBe(b[0].time);
    expect(b[0].offsetLabel).toContain('display +3 h');
  });
});
