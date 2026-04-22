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
   * While any pin is active, unpinned (“live”) faces format this instant instead of real time
   * so changing one pin does not advance other live clocks.
   */
  liveAnchorUtcMs: number | null;
};

export type IdGenerator = () => string;

export function hasAnyPin(s: ClocksState): boolean {
  return s.localPinnedUtcMs != null || s.extraClocks.some((c) => c.pinnedUtcMs != null);
}

/** Recompute `liveAnchorUtcMs` after a state transition (pass `Date.now()` or `getNow().getTime()` from the UI). */
export function finalizeClocksState(prev: ClocksState, base: ClocksState, nowMs: number): ClocksState {
  const nextPins = hasAnyPin(base);
  const prevPins = hasAnyPin(prev);
  let liveAnchorUtcMs: number | null;
  if (!nextPins) {
    liveAnchorUtcMs = null;
  } else if (!prevPins) {
    liveAnchorUtcMs = nowMs;
  } else {
    liveAnchorUtcMs = prev.liveAnchorUtcMs ?? nowMs;
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
  return finalizeClocksState(state, base, nowMs);
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
  return finalizeClocksState(state, base, nowMs);
}

export function removeZonedClock(state: ClocksState, id: string, nowMs: number): ClocksState {
  const base = {
    ...state,
    extraClocks: state.extraClocks.filter((c) => c.id !== id),
  };
  return finalizeClocksState(state, base, nowMs);
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
  return finalizeClocksState(state, base, nowMs);
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
  return finalizeClocksState(state, base, nowMs);
}
