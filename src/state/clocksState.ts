import { normalizeIanaTimeZone } from '../time/timeZone';

export type ZonedClock = {
  id: string;
  ianaTimeZone: string;
  /**
   * When set, the face shows this absolute instant formatted in `ianaTimeZone` (frozen vs live `now`).
   * `null` means follow live time.
   */
  pinnedUtcMs: number | null;
};

export type ClocksState = {
  /** Same semantics as `ZonedClock.pinnedUtcMs` for the local face. */
  localPinnedUtcMs: number | null;
  extraClocks: ZonedClock[];
  /**
   * While any pin is active, unpinned (“live”) faces format this UTC instant instead of real time.
   * It is set to the pinned instant when a pin is applied or changed, recomputed when pins are removed,
   * and preserved across add/zone changes so live faces stay aligned with the edited moment.
   */
  liveAnchorUtcMs: number | null;
};

export type IdGenerator = () => string;

export function hasAnyPin(s: ClocksState): boolean {
  return s.localPinnedUtcMs != null || s.extraClocks.some((c) => c.pinnedUtcMs != null);
}

export function pickFirstPinnedUtcMs(s: ClocksState): number | null {
  if (s.localPinnedUtcMs != null) return s.localPinnedUtcMs;
  for (const c of s.extraClocks) {
    if (c.pinnedUtcMs != null) return c.pinnedUtcMs;
  }
  return null;
}

type LiveAnchorUpdate = 'preserve' | 'recompute' | number;

/** Recompute `liveAnchorUtcMs` after a state transition (pass `Date.now()` or `getNow().getTime()` from the UI). */
export function finalizeClocksState(
  prev: ClocksState,
  base: ClocksState,
  nowMs: number,
  anchorUpdate: LiveAnchorUpdate,
): ClocksState {
  if (!hasAnyPin(base)) {
    return { ...base, liveAnchorUtcMs: null };
  }
  let liveAnchorUtcMs: number;
  if (typeof anchorUpdate === 'number') {
    liveAnchorUtcMs = anchorUpdate;
  } else if (anchorUpdate === 'recompute') {
    const p = pickFirstPinnedUtcMs(base);
    if (p == null) {
      throw new Error('finalizeClocksState: hasAnyPin but pickFirstPinnedUtcMs is null');
    }
    liveAnchorUtcMs = p;
  } else {
    liveAnchorUtcMs = prev.liveAnchorUtcMs ?? pickFirstPinnedUtcMs(base) ?? nowMs;
  }
  return { ...base, liveAnchorUtcMs };
}

export function createInitialClocksState(generateId: IdGenerator): ClocksState {
  return {
    localPinnedUtcMs: null,
    extraClocks: [{ id: generateId(), ianaTimeZone: 'UTC', pinnedUtcMs: null }],
    liveAnchorUtcMs: null,
  };
}

export function setLocalPinnedUtcMs(
  state: ClocksState,
  pinnedUtcMs: number | null,
  nowMs: number,
): ClocksState {
  const base = { ...state, localPinnedUtcMs: pinnedUtcMs };
  const anchorUpdate: LiveAnchorUpdate =
    pinnedUtcMs != null ? pinnedUtcMs : 'recompute';
  return finalizeClocksState(state, base, nowMs, anchorUpdate);
}

export function addZonedClock(
  state: ClocksState,
  generateId: IdGenerator,
  ianaTimeZone = 'UTC',
  nowMs: number,
): ClocksState {
  const zone = normalizeIanaTimeZone(ianaTimeZone, 'UTC');
  const base = {
    ...state,
    extraClocks: [...state.extraClocks, { id: generateId(), ianaTimeZone: zone, pinnedUtcMs: null }],
  };
  return finalizeClocksState(state, base, nowMs, 'preserve');
}

export function removeZonedClock(state: ClocksState, id: string, nowMs: number): ClocksState {
  const base = {
    ...state,
    extraClocks: state.extraClocks.filter((c) => c.id !== id),
  };
  return finalizeClocksState(state, base, nowMs, 'recompute');
}

export function setZonedClockTimeZone(
  state: ClocksState,
  id: string,
  ianaTimeZone: string,
  nowMs: number,
): ClocksState {
  const zone = normalizeIanaTimeZone(ianaTimeZone, 'UTC');
  const base = {
    ...state,
    extraClocks: state.extraClocks.map((c) => (c.id === id ? { ...c, ianaTimeZone: zone } : c)),
  };
  return finalizeClocksState(state, base, nowMs, 'preserve');
}

export function setZonedClockPinnedUtcMs(
  state: ClocksState,
  id: string,
  pinnedUtcMs: number | null,
  nowMs: number,
): ClocksState {
  const base = {
    ...state,
    extraClocks: state.extraClocks.map((c) => (c.id === id ? { ...c, pinnedUtcMs } : c)),
  };
  const anchorUpdate: LiveAnchorUpdate =
    pinnedUtcMs != null ? pinnedUtcMs : 'recompute';
  return finalizeClocksState(state, base, nowMs, anchorUpdate);
}
