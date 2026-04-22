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

export function buildClockSnapshots(
  instant: Date,
  localIanaTimeZone: string,
  extraClocks: { id: string; ianaTimeZone: string }[],
): ClockFaceSnapshot[] {
  const local = formatInstantInZone(instant, localIanaTimeZone);
  const localAbbr = local.abbreviation || local.timeZoneId;
  const localFace: ClockFaceSnapshot = {
    id: 'local',
    role: 'local',
    headingLabel: `Local — ${localAbbr}`,
    ianaCaption: local.timeZoneId,
    zoneId: local.timeZoneId,
    time: local.time,
    dateLong: local.dateLong,
    offsetLabel: local.offsetLabel,
    abbreviation: localAbbr,
  };

  const extras = extraClocks.map((c) => {
    const z = formatInstantInZone(instant, c.ianaTimeZone);
    const abbr = z.abbreviation || z.timeZoneId;
    return {
      id: c.id,
      role: 'extra' as const,
      headingLabel: abbr,
      ianaCaption: z.timeZoneId,
      zoneId: c.ianaTimeZone,
      time: z.time,
      dateLong: z.dateLong,
      offsetLabel: z.offsetLabel,
      abbreviation: abbr,
    };
  });

  return [localFace, ...extras];
}
