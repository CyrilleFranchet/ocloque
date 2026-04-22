import { describe, expect, it } from 'vitest';
import {
  addZonedClock,
  createInitialClocksState,
  hasAnyPin,
  removeZonedClock,
  setLocalPinnedUtcMs,
  setZonedClockPinnedUtcMs,
  setZonedClockTimeZone,
} from './clocksState';

const T = 1_800_000_000_000;

function idSeq(): () => string {
  let n = 0;
  return () => `id-${++n}`;
}

describe('createInitialClocksState', () => {
  it('creates one extra clock at UTC with no pin', () => {
    const gen = idSeq();
    const state = createInitialClocksState(gen);
    expect(state.localPinnedUtcMs).toBeNull();
    expect(state.liveAnchorUtcMs).toBeNull();
    expect(state.extraClocks).toHaveLength(1);
    expect(state.extraClocks[0].ianaTimeZone).toBe('UTC');
    expect(state.extraClocks[0].pinnedUtcMs).toBeNull();
    expect(state.extraClocks[0].id).toBe('id-1');
  });
});

describe('finalizeClocksState / live anchor', () => {
  it('sets anchor to pinned instant on first pin and clears when last pin removed', () => {
    const gen = idSeq();
    let state = createInitialClocksState(gen);
    expect(hasAnyPin(state)).toBe(false);
    state = setZonedClockPinnedUtcMs(state, state.extraClocks[0].id, T, 5_000);
    expect(state.liveAnchorUtcMs).toBe(T);
    state = setZonedClockPinnedUtcMs(state, state.extraClocks[0].id, null, 6_000);
    expect(state.liveAnchorUtcMs).toBeNull();
  });

  it('updates anchor when the pinned instant changes', () => {
    const gen = idSeq();
    let state = createInitialClocksState(gen);
    const id = state.extraClocks[0].id;
    state = setZonedClockPinnedUtcMs(state, id, T, 100);
    expect(state.liveAnchorUtcMs).toBe(T);
    state = setZonedClockPinnedUtcMs(state, id, T + 99, 200);
    expect(state.liveAnchorUtcMs).toBe(T + 99);
  });

  it('recomputes anchor from remaining pins when one extra is unpinned', () => {
    const gen = idSeq();
    let state = createInitialClocksState(gen);
    const id0 = state.extraClocks[0].id;
    state = addZonedClock(state, gen, 'Europe/Paris', 0);
    const id1 = state.extraClocks[1].id;
    state = setZonedClockPinnedUtcMs(state, id0, T, 1);
    state = setZonedClockPinnedUtcMs(state, id1, T + 1_000, 2);
    expect(state.liveAnchorUtcMs).toBe(T + 1_000);
    state = setZonedClockPinnedUtcMs(state, id1, null, 3);
    expect(state.liveAnchorUtcMs).toBe(T);
  });
});

describe('setLocalPinnedUtcMs', () => {
  it('stores and clears a pinned instant', () => {
    const gen = idSeq();
    let state = createInitialClocksState(gen);
    state = setLocalPinnedUtcMs(state, T, 42);
    expect(state.localPinnedUtcMs).toBe(T);
    state = setLocalPinnedUtcMs(state, null, 43);
    expect(state.localPinnedUtcMs).toBeNull();
  });
});

describe('addZonedClock', () => {
  it('appends a clock with normalized zone', () => {
    const gen = idSeq();
    let state = createInitialClocksState(gen);
    state = addZonedClock(state, gen, 'Europe/Paris', T);
    expect(state.extraClocks).toHaveLength(2);
    expect(state.extraClocks[1].ianaTimeZone).toBe('Europe/Paris');
    expect(state.extraClocks[1].pinnedUtcMs).toBeNull();
    expect(state.extraClocks[1].id).toBe('id-2');
  });

  it('normalizes invalid zones to UTC', () => {
    const gen = idSeq();
    let state = createInitialClocksState(gen);
    state = addZonedClock(state, gen, 'Not/A/Zone', T);
    expect(state.extraClocks[1].ianaTimeZone).toBe('UTC');
  });
});

describe('removeZonedClock', () => {
  it('removes by id', () => {
    const gen = idSeq();
    let state = createInitialClocksState(gen);
    state = addZonedClock(state, gen, 'Asia/Tokyo', T);
    const toRemove = state.extraClocks[0].id;
    state = removeZonedClock(state, toRemove, T);
    expect(state.extraClocks).toHaveLength(1);
    expect(state.extraClocks[0].ianaTimeZone).toBe('Asia/Tokyo');
  });
});

describe('setZonedClockTimeZone', () => {
  it('updates matching clock and keeps pin', () => {
    const gen = idSeq();
    let state = createInitialClocksState(gen);
    const id = state.extraClocks[0].id;
    state = setZonedClockPinnedUtcMs(state, id, T, 10);
    state = setZonedClockTimeZone(state, id, 'America/Los_Angeles', 11);
    expect(state.extraClocks[0].ianaTimeZone).toBe('America/Los_Angeles');
    expect(state.extraClocks[0].pinnedUtcMs).toBe(T);
  });

  it('normalizes invalid zones', () => {
    const gen = idSeq();
    let state = createInitialClocksState(gen);
    const id = state.extraClocks[0].id;
    state = setZonedClockTimeZone(state, id, 'Bad/Zone', 0);
    expect(state.extraClocks[0].ianaTimeZone).toBe('UTC');
  });
});

describe('setZonedClockPinnedUtcMs', () => {
  it('updates only the matching clock', () => {
    const gen = idSeq();
    let state = createInitialClocksState(gen);
    state = addZonedClock(state, gen, 'Europe/Paris', 0);
    const id0 = state.extraClocks[0].id;
    state = setZonedClockPinnedUtcMs(state, id0, T, 1);
    expect(state.extraClocks[0].pinnedUtcMs).toBe(T);
    expect(state.extraClocks[1].pinnedUtcMs).toBeNull();
  });
});
