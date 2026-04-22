/**
 * Common civil abbreviations mapped to a single canonical IANA zone.
 * Abbreviations like CST are ambiguous; we document the intended region in `description`.
 */
export type ZoneShortcut = {
  abbr: string;
  description: string;
  iana: string;
};

export const ZONE_SHORTCUTS: readonly ZoneShortcut[] = [
  { abbr: 'UTC', description: 'Coordinated Universal Time', iana: 'UTC' },
  { abbr: 'GMT', description: 'United Kingdom (civil)', iana: 'Europe/London' },
  { abbr: 'EST', description: 'US Eastern', iana: 'America/New_York' },
  { abbr: 'CST', description: 'US Central', iana: 'America/Chicago' },
  { abbr: 'MST', description: 'US Mountain', iana: 'America/Denver' },
  { abbr: 'PST', description: 'US Pacific', iana: 'America/Los_Angeles' },
  { abbr: 'AKST', description: 'Alaska', iana: 'America/Anchorage' },
  { abbr: 'HST', description: 'Hawaii', iana: 'Pacific/Honolulu' },
  { abbr: 'IST', description: 'India', iana: 'Asia/Kolkata' },
  { abbr: 'JST', description: 'Japan', iana: 'Asia/Tokyo' },
  { abbr: 'KST', description: 'Korea', iana: 'Asia/Seoul' },
  { abbr: 'CET', description: 'Central Europe', iana: 'Europe/Paris' },
  { abbr: 'EET', description: 'Eastern Europe', iana: 'Europe/Helsinki' },
  { abbr: 'MSK', description: 'Moscow', iana: 'Europe/Moscow' },
  { abbr: 'WET', description: 'Western Europe (Portugal)', iana: 'Europe/Lisbon' },
  { abbr: 'AEST', description: 'Australia (east)', iana: 'Australia/Sydney' },
  { abbr: 'NZDT', description: 'New Zealand', iana: 'Pacific/Auckland' },
  { abbr: 'BRT', description: 'Brazil (São Paulo)', iana: 'America/Sao_Paulo' },
  { abbr: 'ART', description: 'Argentina (Buenos Aires)', iana: 'America/Argentina/Buenos_Aires' },
  { abbr: 'SGT', description: 'Singapore', iana: 'Asia/Singapore' },
  { abbr: 'HKT', description: 'Hong Kong', iana: 'Asia/Hong_Kong' },
  { abbr: 'ICT', description: 'Thailand', iana: 'Asia/Bangkok' },
] as const;
