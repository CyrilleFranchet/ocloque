export function filteredTimeZones(
  allZones: string[],
  query: string,
  selected: string,
  limit = 80,
): string[] {
  const t = query.trim().toLowerCase();
  const pool = t ? allZones.filter((z) => z.toLowerCase().includes(t)) : allZones;
  const capped = pool.slice(0, limit);
  if (allZones.includes(selected) && !capped.includes(selected)) {
    return [selected, ...capped].slice(0, limit);
  }
  return capped;
}
