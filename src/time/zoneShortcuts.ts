/**
 * Common civil abbreviations mapped to a single canonical IANA zone.
 * Several rows may share the same `iana` (e.g. EST + EDT → America/New_York); the picker
 * merges them into one label. Ambiguous tokens (CST = US vs Mexico) stay disambiguated in `description`.
 */
export type ZoneShortcut = {
  abbr: string;
  description: string;
  iana: string;
};

/** Stable picker label: merges every table abbreviation that targets this IANA. */
export function shortcutSelectLabel(iana: string): string | null {
  const matches = ZONE_SHORTCUTS.filter((x) => x.iana === iana);
  if (matches.length === 0) return null;
  const abbrs = matches.map((m) => m.abbr).join(' / ');
  const desc = [...new Set(matches.map((m) => m.description))].join(' · ');
  return `${abbrs} — ${desc} — ${iana}`;
}

/**
 * Curated “classic” abbreviations. Keep each `abbr` unique (tests enforce this).
 * Add pairs (STD/DST) on the same `iana` where both names are widely used.
 */
export const ZONE_SHORTCUTS: readonly ZoneShortcut[] = [
  /* Universal & UK */
  { abbr: 'UTC', description: 'Coordinated Universal Time', iana: 'UTC' },
  { abbr: 'GMT', description: 'United Kingdom', iana: 'Europe/London' },
  { abbr: 'BST', description: 'United Kingdom', iana: 'Europe/London' },

  /* United States & Canada (contiguous + Alaska + Hawaii + Atlantic + Newfoundland) */
  { abbr: 'EST', description: 'US Eastern (winter)', iana: 'America/New_York' },
  { abbr: 'EDT', description: 'US Eastern (summer)', iana: 'America/New_York' },
  { abbr: 'CST', description: 'US Central (winter)', iana: 'America/Chicago' },
  { abbr: 'CDT', description: 'US Central (summer)', iana: 'America/Chicago' },
  { abbr: 'MST', description: 'US Mountain (winter)', iana: 'America/Denver' },
  { abbr: 'MDT', description: 'US Mountain (summer)', iana: 'America/Denver' },
  { abbr: 'PST', description: 'US Pacific (winter)', iana: 'America/Los_Angeles' },
  { abbr: 'PDT', description: 'US Pacific (summer)', iana: 'America/Los_Angeles' },
  { abbr: 'AKST', description: 'Alaska (winter)', iana: 'America/Anchorage' },
  { abbr: 'AKDT', description: 'Alaska (summer)', iana: 'America/Anchorage' },
  { abbr: 'HST', description: 'Hawaii', iana: 'Pacific/Honolulu' },
  { abbr: 'AST', description: 'Atlantic Canada (winter)', iana: 'America/Halifax' },
  { abbr: 'ADT', description: 'Atlantic Canada (summer)', iana: 'America/Halifax' },
  { abbr: 'NST', description: 'Newfoundland', iana: 'America/St_Johns' },

  /* Latin America */
  { abbr: 'BRT', description: 'Brazil (São Paulo)', iana: 'America/Sao_Paulo' },
  { abbr: 'ART', description: 'Argentina (Buenos Aires)', iana: 'America/Argentina/Buenos_Aires' },
  { abbr: 'MEX', description: 'Mexico (central)', iana: 'America/Mexico_City' },
  { abbr: 'COL', description: 'Colombia', iana: 'America/Bogota' },
  { abbr: 'CLT', description: 'Chile (winter)', iana: 'America/Santiago' },
  { abbr: 'CLST', description: 'Chile (summer)', iana: 'America/Santiago' },
  { abbr: 'VET', description: 'Venezuela', iana: 'America/Caracas' },
  { abbr: 'PET', description: 'Peru', iana: 'America/Lima' },
  { abbr: 'UYT', description: 'Uruguay', iana: 'America/Montevideo' },

  /* Europe & Turkey & Russia (common) */
  { abbr: 'CET', description: 'Central Europe (winter)', iana: 'Europe/Paris' },
  { abbr: 'CEST', description: 'Central Europe (summer)', iana: 'Europe/Paris' },
  { abbr: 'EET', description: 'Eastern Europe (winter)', iana: 'Europe/Helsinki' },
  { abbr: 'EEST', description: 'Eastern Europe (summer)', iana: 'Europe/Helsinki' },
  { abbr: 'MSK', description: 'Moscow', iana: 'Europe/Moscow' },
  { abbr: 'WET', description: 'Western Europe (winter)', iana: 'Europe/Lisbon' },
  { abbr: 'WEST', description: 'Western Europe (summer)', iana: 'Europe/Lisbon' },
  { abbr: 'TRT', description: 'Turkey', iana: 'Europe/Istanbul' },
  { abbr: 'YEKT', description: 'Yekaterinburg', iana: 'Asia/Yekaterinburg' },
  { abbr: 'VLAT', description: 'Vladivostok', iana: 'Asia/Vladivostok' },

  /* Africa */
  { abbr: 'WAT', description: 'West Africa', iana: 'Africa/Lagos' },
  { abbr: 'CAT', description: 'Central Africa', iana: 'Africa/Maputo' },
  { abbr: 'SAST', description: 'South Africa', iana: 'Africa/Johannesburg' },
  { abbr: 'EAT', description: 'East Africa', iana: 'Africa/Nairobi' },
  { abbr: 'EGY', description: 'Egypt', iana: 'Africa/Cairo' },

  /* Middle East & South Asia */
  { abbr: 'GST', description: 'Gulf (UAE)', iana: 'Asia/Dubai' },
  { abbr: 'IRST', description: 'Iran (winter)', iana: 'Asia/Tehran' },
  { abbr: 'IRDT', description: 'Iran (summer)', iana: 'Asia/Tehran' },
  { abbr: 'IST', description: 'India', iana: 'Asia/Kolkata' },
  { abbr: 'PKT', description: 'Pakistan', iana: 'Asia/Karachi' },

  /* East & Southeast Asia & Pacific rim */
  { abbr: 'BJT', description: 'China (Beijing)', iana: 'Asia/Shanghai' },
  { abbr: 'JST', description: 'Japan', iana: 'Asia/Tokyo' },
  { abbr: 'KST', description: 'Korea', iana: 'Asia/Seoul' },
  { abbr: 'WIB', description: 'Indonesia (west)', iana: 'Asia/Jakarta' },
  { abbr: 'WIT', description: 'Indonesia (east)', iana: 'Asia/Jayapura' },
  { abbr: 'ICT', description: 'Thailand', iana: 'Asia/Bangkok' },
  { abbr: 'MYT', description: 'Malaysia', iana: 'Asia/Kuala_Lumpur' },
  { abbr: 'SGT', description: 'Singapore', iana: 'Asia/Singapore' },
  { abbr: 'HKT', description: 'Hong Kong', iana: 'Asia/Hong_Kong' },
  { abbr: 'PHT', description: 'Philippines', iana: 'Asia/Manila' },

  /* Australia & Oceania */
  { abbr: 'AEST', description: 'Australia east (winter)', iana: 'Australia/Sydney' },
  { abbr: 'AEDT', description: 'Australia east (summer)', iana: 'Australia/Sydney' },
  { abbr: 'ACST', description: 'Australia central (winter)', iana: 'Australia/Adelaide' },
  { abbr: 'ACDT', description: 'Australia central (summer)', iana: 'Australia/Adelaide' },
  { abbr: 'AWST', description: 'Australia west', iana: 'Australia/Perth' },
  { abbr: 'NZST', description: 'New Zealand (winter)', iana: 'Pacific/Auckland' },
  { abbr: 'NZDT', description: 'New Zealand (summer)', iana: 'Pacific/Auckland' },
  { abbr: 'ChST', description: 'Chamorro / Guam', iana: 'Pacific/Guam' },
  { abbr: 'FJT', description: 'Fiji', iana: 'Pacific/Fiji' },
  { abbr: 'TAHT', description: 'Tahiti', iana: 'Pacific/Tahiti' },
] as const;
