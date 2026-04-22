import type { ZoneShortcut } from '../time/zoneShortcuts';

export function filteredIanaZones(
  allIana: string[],
  shortcuts: readonly ZoneShortcut[],
  query: string,
  selected: string,
  limit = 80,
): string[] {
  const t = query.trim().toLowerCase();
  const out: string[] = [];

  const push = (z: string) => {
    if (out.length >= limit) return;
    if (out.includes(z)) return;
    out.push(z);
  };

  if (t) {
    for (const s of shortcuts) {
      const hit =
        s.abbr.toLowerCase().includes(t) ||
        s.description.toLowerCase().includes(t) ||
        s.iana.toLowerCase().includes(t);
      if (hit) push(s.iana);
    }
    for (const z of allIana) {
      if (z.toLowerCase().includes(t)) push(z);
    }
  } else {
    for (const s of shortcuts) {
      push(s.iana);
    }
    for (const z of allIana) {
      push(z);
    }
  }

  const selectedMatchesQuery =
    !t ||
    selected.toLowerCase().includes(t) ||
    shortcuts.some(
      (s) =>
        s.iana === selected &&
        (s.abbr.toLowerCase().includes(t) ||
          s.description.toLowerCase().includes(t) ||
          s.iana.toLowerCase().includes(t)),
    );

  if (allIana.includes(selected) && !out.includes(selected) && selectedMatchesQuery) {
    out.unshift(selected);
    while (out.length > limit) {
      out.pop();
    }
  }

  return out.slice(0, limit);
}
