import { describe, expect, it } from 'vitest';
import { ZONE_SHORTCUTS } from './zoneShortcuts';

describe('ZONE_SHORTCUTS', () => {
  it('maps EST and IST to expected IANA zones', () => {
    expect(ZONE_SHORTCUTS.find((s) => s.abbr === 'EST')?.iana).toBe('America/New_York');
    expect(ZONE_SHORTCUTS.find((s) => s.abbr === 'IST')?.iana).toBe('Asia/Kolkata');
    expect(ZONE_SHORTCUTS.find((s) => s.abbr === 'PST')?.iana).toBe('America/Los_Angeles');
  });

  it('uses unique abbreviations in this table', () => {
    const abbrs = ZONE_SHORTCUTS.map((s) => s.abbr.toUpperCase());
    expect(new Set(abbrs).size).toBe(abbrs.length);
  });
});
