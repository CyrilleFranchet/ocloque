import { formatInstantInZone } from '../time/formatInZone';

export type ClockFaceSnapshot = {
  id: string;
  role: 'local' | 'extra';
  /** Primary title (abbreviation-focused). */
  headingLabel: string;
  /** IANA identifier shown as a secondary line. */
  ianaCaption: string;
  zoneId: string;
  time: string;
  dateLong: string;
  offsetLabel: string;
  abbreviation: string;
};

function shiftedInstant(instant: Date, offsetHours: number): Date {
  return new Date(instant.getTime() + offsetHours * 3_600_000);
}

function withDisplayOffsetNote(offsetLabel: string, offsetHours: number): string {
  if (offsetHours === 0) return offsetLabel;
  const sign = offsetHours > 0 ? '+' : '';
  return `${offsetLabel} · display ${sign}${offsetHours} h`;
}

export function buildClockSnapshots(
  instant: Date,
  localIanaTimeZone: string,
  localOffsetHours: number,
  extraClocks: { id: string; ianaTimeZone: string; offsetHours: number }[],
): ClockFaceSnapshot[] {
  const localInstant = shiftedInstant(instant, localOffsetHours);
  const local = formatInstantInZone(localInstant, localIanaTimeZone);
  const localAbbr = local.abbreviation || local.timeZoneId;
  const localFace: ClockFaceSnapshot = {
    id: 'local',
    role: 'local',
    headingLabel: `Local — ${localAbbr}`,
    ianaCaption: local.timeZoneId,
    zoneId: local.timeZoneId,
    time: local.time,
    dateLong: local.dateLong,
    offsetLabel: withDisplayOffsetNote(local.offsetLabel, localOffsetHours),
    abbreviation: localAbbr,
  };

  const extras = extraClocks.map((c) => {
    const j = shiftedInstant(instant, c.offsetHours);
    const z = formatInstantInZone(j, c.ianaTimeZone);
    const abbr = z.abbreviation || z.timeZoneId;
    return {
      id: c.id,
      role: 'extra' as const,
      headingLabel: abbr,
      ianaCaption: z.timeZoneId,
      zoneId: c.ianaTimeZone,
      time: z.time,
      dateLong: z.dateLong,
      offsetLabel: withDisplayOffsetNote(z.offsetLabel, c.offsetHours),
      abbreviation: abbr,
    };
  });

  return [localFace, ...extras];
}
