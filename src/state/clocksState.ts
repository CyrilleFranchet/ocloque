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
};

export type IdGenerator = () => string;

export function createInitialClocksState(generateId: IdGenerator): ClocksState {
  return {
    localPinnedUtcMs: null,
    extraClocks: [{ id: generateId(), ianaTimeZone: 'UTC', pinnedUtcMs: null }],
  };
}

export function setLocalPinnedUtcMs(state: ClocksState, pinnedUtcMs: number | null): ClocksState {
  return { ...state, localPinnedUtcMs: pinnedUtcMs };
}

export function addZonedClock(
  state: ClocksState,
  generateId: IdGenerator,
  ianaTimeZone = 'UTC',
): ClocksState {
  const zone = normalizeIanaTimeZone(ianaTimeZone, 'UTC');
  return {
    ...state,
    extraClocks: [...state.extraClocks, { id: generateId(), ianaTimeZone: zone, pinnedUtcMs: null }],
  };
}

export function removeZonedClock(state: ClocksState, id: string): ClocksState {
  return {
    ...state,
    extraClocks: state.extraClocks.filter((c) => c.id !== id),
  };
}

export function setZonedClockTimeZone(
  state: ClocksState,
  id: string,
  ianaTimeZone: string,
): ClocksState {
  const zone = normalizeIanaTimeZone(ianaTimeZone, 'UTC');
  return {
    ...state,
    extraClocks: state.extraClocks.map((c) => (c.id === id ? { ...c, ianaTimeZone: zone } : c)),
  };
}

export function setZonedClockPinnedUtcMs(
  state: ClocksState,
  id: string,
  pinnedUtcMs: number | null,
): ClocksState {
  return {
    ...state,
    extraClocks: state.extraClocks.map((c) => (c.id === id ? { ...c, pinnedUtcMs } : c)),
  };
}
