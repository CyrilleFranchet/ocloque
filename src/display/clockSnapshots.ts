import { formatInstantInZone } from '../time/formatInZone';

export type ClockFaceSnapshot = {
  id: string;
  role: 'local' | 'extra';
  headingLabel: string;
  zoneId: string;
  time: string;
  dateLong: string;
  offsetLabel: string;
};

export function buildClockSnapshots(
  instant: Date,
  localIanaTimeZone: string,
  extraClocks: { id: string; ianaTimeZone: string }[],
): ClockFaceSnapshot[] {
  const local = formatInstantInZone(instant, localIanaTimeZone);
  const localFace: ClockFaceSnapshot = {
    id: 'local',
    role: 'local',
    headingLabel: `Local (${local.timeZoneId})`,
    zoneId: local.timeZoneId,
    time: local.time,
    dateLong: local.dateLong,
    offsetLabel: local.offsetLabel,
  };

  const extras = extraClocks.map((c) => {
    const z = formatInstantInZone(instant, c.ianaTimeZone);
    return {
      id: c.id,
      role: 'extra' as const,
      headingLabel: z.timeZoneId,
      zoneId: c.ianaTimeZone,
      time: z.time,
      dateLong: z.dateLong,
      offsetLabel: z.offsetLabel,
    };
  });

  return [localFace, ...extras];
}
