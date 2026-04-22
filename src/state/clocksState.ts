import { normalizeIanaTimeZone } from '../time/timeZone';

/** Allowed range for manual display shift (whole hours). */
export const DISPLAY_OFFSET_HOURS_MIN = -23;
export const DISPLAY_OFFSET_HOURS_MAX = 23;

export function clampDisplayOffsetHours(hours: number): number {
  const n = Math.trunc(Number.isFinite(hours) ? hours : 0);
  return Math.min(DISPLAY_OFFSET_HOURS_MAX, Math.max(DISPLAY_OFFSET_HOURS_MIN, n));
}

export type ZonedClock = {
  id: string;
  ianaTimeZone: string;
  /** Added to the wall-clock instant before formatting in `ianaTimeZone` (display-only). */
  offsetHours: number;
};

export type ClocksState = {
  /** Display shift for the fixed local clock (same semantics as `ZonedClock.offsetHours`). */
  localOffsetHours: number;
  extraClocks: ZonedClock[];
};

export type IdGenerator = () => string;

export function createInitialClocksState(generateId: IdGenerator): ClocksState {
  return {
    localOffsetHours: 0,
    extraClocks: [{ id: generateId(), ianaTimeZone: 'UTC', offsetHours: 0 }],
  };
}

export function setLocalOffsetHours(state: ClocksState, offsetHours: number): ClocksState {
  return { ...state, localOffsetHours: clampDisplayOffsetHours(offsetHours) };
}

export function addZonedClock(
  state: ClocksState,
  generateId: IdGenerator,
  ianaTimeZone = 'UTC',
): ClocksState {
  const zone = normalizeIanaTimeZone(ianaTimeZone, 'UTC');
  return {
    ...state,
    extraClocks: [...state.extraClocks, { id: generateId(), ianaTimeZone: zone, offsetHours: 0 }],
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

export function setZonedClockOffsetHours(state: ClocksState, id: string, offsetHours: number): ClocksState {
  const h = clampDisplayOffsetHours(offsetHours);
  return {
    ...state,
    extraClocks: state.extraClocks.map((c) => (c.id === id ? { ...c, offsetHours: h } : c)),
  };
}
