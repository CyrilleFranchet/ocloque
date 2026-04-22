import { describe, expect, it } from 'vitest';
import { buildClockSnapshots } from './clockSnapshots';

const utcExtra = (id: string, pinned: number | null = null) => ({
  id,
  ianaTimeZone: 'UTC' as const,
  pinnedUtcMs: pinned,
});

describe('buildClockSnapshots', () => {
  it('places local first then extras', () => {
    const instant = new Date('2024-03-10T18:00:00.000Z');
    const snaps = buildClockSnapshots(instant, 'UTC', null, [
      { id: 'c1', ianaTimeZone: 'Europe/Paris', pinnedUtcMs: null },
      { id: 'c2', ianaTimeZone: 'America/New_York', pinnedUtcMs: null },
    ], null);
    expect(snaps).toHaveLength(3);
    expect(snaps[0].role).toBe('local');
    expect(snaps[0].id).toBe('local');
    expect(snaps[0].headingLabel).toContain('Local');
    expect(snaps[0].displayMode).toBe('live');
    expect(snaps[0].ianaCaption).toBe('UTC');
    expect(snaps[1].ianaCaption).toContain('Europe/Paris');
    expect(snaps[2].ianaCaption).toContain('America/New_York');
    expect(snaps[1].id).toBe('c1');
    expect(snaps[1].role).toBe('extra');
    expect(snaps[2].id).toBe('c2');
  });

  it('formats each face with time and date strings', () => {
    const instant = new Date('2024-03-10T18:00:00.000Z');
    const snaps = buildClockSnapshots(instant, 'UTC', null, [utcExtra('c1')], null);
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
    const snaps = buildClockSnapshots(instant, 'UTC', null, [
      { id: 'c1', ianaTimeZone: 'America/New_York', pinnedUtcMs: null },
    ], null);
    const ny = snaps[1];
    expect(ny.ianaCaption).toContain('America/New_York');
    expect(ny.abbreviation).toMatch(/^(EST|EDT|ET|GMT-5|GMT-4)$/);
  });

  it('uses pinned instant instead of live now for an extra clock', () => {
    const instant = new Date('2024-06-15T12:00:00.000Z');
    const pinned = Date.UTC(2020, 0, 1, 15, 0, 0);
    const live = buildClockSnapshots(instant, 'UTC', null, [utcExtra('c1', null)], null);
    const pin = buildClockSnapshots(instant, 'UTC', null, [utcExtra('c1', pinned)], null);
    expect(live[1].time).not.toBe(pin[1].time);
    expect(pin[1].displayMode).toBe('pinned');
    expect(pin[1].ianaCaption).toContain('fixed time');
  });

  it('uses local pin independently and aligns live extra to the pinned instant', () => {
    const instant = new Date('2024-06-15T12:00:00.000Z');
    const pinned = Date.UTC(2019, 5, 1, 6, 30, 0);
    const a = buildClockSnapshots(instant, 'UTC', null, [utcExtra('c1')], null);
    const b = buildClockSnapshots(instant, 'UTC', pinned, [utcExtra('c1')], pinned);
    expect(a[0].time).not.toBe(b[0].time);
    expect(b[0].displayMode).toBe('pinned');
    expect(b[0].ianaCaption).toContain('fixed time');
    const refExtra = buildClockSnapshots(new Date(pinned), 'UTC', null, [utcExtra('c1')], null)[1];
    expect(b[1].time).toBe(refExtra.time);
    expect(b[1].dateLong).toBe(refExtra.dateLong);
  });

  it('uses the same instant for all live faces when a live anchor is set', () => {
    const realNow = new Date('2024-06-15T18:30:00.000Z');
    const anchor = realNow.getTime();
    const snaps = buildClockSnapshots(
      new Date('2099-01-01T00:00:00.000Z'),
      'UTC',
      null,
      [utcExtra('a'), utcExtra('b')],
      anchor,
    );
    expect(snaps[1].time).toBe(snaps[2].time);
    expect(snaps[1].dateLong).toBe(snaps[2].dateLong);
  });
});
