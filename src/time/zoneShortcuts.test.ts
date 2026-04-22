import { describe, expect, it } from 'vitest';
import { ZONE_SHORTCUTS, shortcutSelectLabel } from './zoneShortcuts';

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

describe('shortcutSelectLabel', () => {
  it('includes the table abbreviation for US Eastern', () => {
    const label = shortcutSelectLabel('America/New_York');
    expect(label).toContain('EST');
    expect(label).toContain('America/New_York');
  });

  it('returns null for zones not in the shortcut table', () => {
    expect(shortcutSelectLabel('Europe/Zurich')).toBeNull();
  });
});
