import { formatInstantInZone } from '../time/formatInZone';

export type ClockFaceSnapshot = {
  id: string;
  role: 'local' | 'extra';
  /** Primary title (abbreviation-focused). */
  headingLabel: string;
  /** IANA identifier shown as a secondary line; appends `· fixed time` when pinned. */
  ianaCaption: string;
  zoneId: string;
  time: string;
  dateLong: string;
  offsetLabel: string;
  abbreviation: string;
  /** `pinned` when showing a user-chosen wall time as a frozen instant. */
  displayMode: 'live' | 'pinned';
};

function instantForFace(
  realNow: Date,
  liveAnchorUtcMs: number | null,
  pinnedUtcMs: number | null,
): Date {
  if (pinnedUtcMs != null) return new Date(pinnedUtcMs);
  const live = liveAnchorUtcMs != null ? new Date(liveAnchorUtcMs) : realNow;
  return live;
}

function captionWithPin(ianaId: string, pinned: boolean): string {
  return pinned ? `${ianaId} · fixed time` : ianaId;
}

export function buildClockSnapshots(
  realNow: Date,
  localIanaTimeZone: string,
  localPinnedUtcMs: number | null,
  extraClocks: { id: string; ianaTimeZone: string; pinnedUtcMs: number | null }[],
  liveAnchorUtcMs: number | null,
): ClockFaceSnapshot[] {
  const localInstant = instantForFace(realNow, liveAnchorUtcMs, localPinnedUtcMs);
  const localPinned = localPinnedUtcMs != null;
  const local = formatInstantInZone(localInstant, localIanaTimeZone);
  const localAbbr = local.abbreviation || local.timeZoneId;
  const localFace: ClockFaceSnapshot = {
    id: 'local',
    role: 'local',
    headingLabel: `Local — ${localAbbr}`,
    ianaCaption: captionWithPin(local.timeZoneId, localPinned),
    zoneId: local.timeZoneId,
    time: local.time,
    dateLong: local.dateLong,
    offsetLabel: local.offsetLabel,
    abbreviation: localAbbr,
    displayMode: localPinned ? ('pinned' as const) : ('live' as const),
  };

  const extras = extraClocks.map((c) => {
    const j = instantForFace(realNow, liveAnchorUtcMs, c.pinnedUtcMs);
    const pinned = c.pinnedUtcMs != null;
    const z = formatInstantInZone(j, c.ianaTimeZone);
    const abbr = z.abbreviation || z.timeZoneId;
    return {
      id: c.id,
      role: 'extra' as const,
      headingLabel: abbr,
      ianaCaption: captionWithPin(z.timeZoneId, pinned),
      zoneId: c.ianaTimeZone,
      time: z.time,
      dateLong: z.dateLong,
      offsetLabel: z.offsetLabel,
      abbreviation: abbr,
      displayMode: pinned ? ('pinned' as const) : ('live' as const),
    };
  });

  return [localFace, ...extras];
}
