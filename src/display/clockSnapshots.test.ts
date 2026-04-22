import { describe, expect, it } from 'vitest';
import { buildClockSnapshots } from './clockSnapshots';

describe('buildClockSnapshots', () => {
  it('places local first then extras', () => {
    const instant = new Date('2024-03-10T18:00:00.000Z');
    const snaps = buildClockSnapshots(instant, 'UTC', [
      { id: 'c1', ianaTimeZone: 'Europe/Paris' },
      { id: 'c2', ianaTimeZone: 'America/New_York' },
    ]);
    expect(snaps).toHaveLength(3);
    expect(snaps[0].role).toBe('local');
    expect(snaps[0].id).toBe('local');
    expect(snaps[0].headingLabel).toContain('Local');
    expect(snaps[1].id).toBe('c1');
    expect(snaps[1].role).toBe('extra');
    expect(snaps[2].id).toBe('c2');
  });

  it('formats each face with time and date strings', () => {
    const instant = new Date('2024-03-10T18:00:00.000Z');
    const snaps = buildClockSnapshots(instant, 'UTC', [{ id: 'c1', ianaTimeZone: 'UTC' }]);
    for (const s of snaps) {
      expect(s.time).toMatch(/\d/);
      expect(s.dateLong.length).toBeGreaterThan(6);
      expect(s.offsetLabel).toMatch(/GMT/);
    }
  });
});
