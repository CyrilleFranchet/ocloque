import { normalizeIanaTimeZone } from '../time/timeZone';

export type ZonedClock = {
  id: string;
  ianaTimeZone: string;
};

export type ClocksState = {
  extraClocks: ZonedClock[];
};

export type IdGenerator = () => string;

export function createInitialClocksState(generateId: IdGenerator): ClocksState {
  return {
    extraClocks: [{ id: generateId(), ianaTimeZone: 'UTC' }],
  };
}

export function addZonedClock(
  state: ClocksState,
  generateId: IdGenerator,
  ianaTimeZone = 'UTC',
): ClocksState {
  const zone = normalizeIanaTimeZone(ianaTimeZone, 'UTC');
  return {
    extraClocks: [...state.extraClocks, { id: generateId(), ianaTimeZone: zone }],
  };
}

export function removeZonedClock(state: ClocksState, id: string): ClocksState {
  return {
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
    extraClocks: state.extraClocks.map((c) => (c.id === id ? { ...c, ianaTimeZone: zone } : c)),
  };
}
