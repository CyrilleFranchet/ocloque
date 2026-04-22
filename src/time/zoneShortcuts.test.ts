import { describe, expect, it } from 'vitest';
import { isValidIanaTimeZone } from './timeZone';
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

  it('only references valid IANA identifiers', () => {
    const ianas = [...new Set(ZONE_SHORTCUTS.map((s) => s.iana))];
    for (const z of ianas) {
      expect(isValidIanaTimeZone(z)).toBe(true);
    }
  });
});

describe('shortcutSelectLabel', () => {
  it('merges winter and summer abbreviations for US Eastern', () => {
    const label = shortcutSelectLabel('America/New_York');
    expect(label).toContain('EST');
    expect(label).toContain('EDT');
    expect(label).toContain('America/New_York');
  });

  it('merges GMT and BST for London', () => {
    const label = shortcutSelectLabel('Europe/London');
    expect(label).toContain('GMT');
    expect(label).toContain('BST');
    expect(label).toContain('Europe/London');
  });

  it('returns null for zones not in the shortcut table', () => {
    expect(shortcutSelectLabel('Europe/Zurich')).toBeNull();
  });
});
