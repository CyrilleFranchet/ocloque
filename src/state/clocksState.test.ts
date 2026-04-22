import { describe, expect, it } from 'vitest';
import {
  addZonedClock,
  createInitialClocksState,
  removeZonedClock,
  setLocalPinnedUtcMs,
  setZonedClockPinnedUtcMs,
  setZonedClockTimeZone,
} from './clocksState';

function idSeq(): () => string {
  let n = 0;
  return () => `id-${++n}`;
}

describe('createInitialClocksState', () => {
  it('creates one extra clock at UTC with no pin', () => {
    const gen = idSeq();
    const state = createInitialClocksState(gen);
    expect(state.localPinnedUtcMs).toBeNull();
    expect(state.extraClocks).toHaveLength(1);
    expect(state.extraClocks[0].ianaTimeZone).toBe('UTC');
    expect(state.extraClocks[0].pinnedUtcMs).toBeNull();
    expect(state.extraClocks[0].id).toBe('id-1');
  });
});

describe('setLocalPinnedUtcMs', () => {
  it('stores and clears a pinned instant', () => {
    const gen = idSeq();
    let state = createInitialClocksState(gen);
    state = setLocalPinnedUtcMs(state, 1_700_000_000_000);
    expect(state.localPinnedUtcMs).toBe(1_700_000_000_000);
    state = setLocalPinnedUtcMs(state, null);
    expect(state.localPinnedUtcMs).toBeNull();
  });
});

describe('addZonedClock', () => {
  it('appends a clock with normalized zone', () => {
    const gen = idSeq();
    let state = createInitialClocksState(gen);
    state = addZonedClock(state, gen, 'Europe/Paris');
    expect(state.extraClocks).toHaveLength(2);
    expect(state.extraClocks[1].ianaTimeZone).toBe('Europe/Paris');
    expect(state.extraClocks[1].pinnedUtcMs).toBeNull();
    expect(state.extraClocks[1].id).toBe('id-2');
  });

  it('normalizes invalid zones to UTC', () => {
    const gen = idSeq();
    let state = createInitialClocksState(gen);
    state = addZonedClock(state, gen, 'Not/A/Zone');
    expect(state.extraClocks[1].ianaTimeZone).toBe('UTC');
  });
});

describe('removeZonedClock', () => {
  it('removes by id', () => {
    const gen = idSeq();
    let state = createInitialClocksState(gen);
    state = addZonedClock(state, gen, 'Asia/Tokyo');
    const toRemove = state.extraClocks[0].id;
    state = removeZonedClock(state, toRemove);
    expect(state.extraClocks).toHaveLength(1);
    expect(state.extraClocks[0].ianaTimeZone).toBe('Asia/Tokyo');
  });
});

describe('setZonedClockTimeZone', () => {
  it('updates matching clock and keeps pin', () => {
    const gen = idSeq();
    let state = createInitialClocksState(gen);
    const id = state.extraClocks[0].id;
    state = setZonedClockPinnedUtcMs(state, id, 1_700_000_000_000);
    state = setZonedClockTimeZone(state, id, 'America/Los_Angeles');
    expect(state.extraClocks[0].ianaTimeZone).toBe('America/Los_Angeles');
    expect(state.extraClocks[0].pinnedUtcMs).toBe(1_700_000_000_000);
  });

  it('normalizes invalid zones', () => {
    const gen = idSeq();
    let state = createInitialClocksState(gen);
    const id = state.extraClocks[0].id;
    state = setZonedClockTimeZone(state, id, 'Bad/Zone');
    expect(state.extraClocks[0].ianaTimeZone).toBe('UTC');
  });
});

describe('setZonedClockPinnedUtcMs', () => {
  it('updates only the matching clock', () => {
    const gen = idSeq();
    let state = createInitialClocksState(gen);
    state = addZonedClock(state, gen, 'Europe/Paris');
    const id0 = state.extraClocks[0].id;
    state = setZonedClockPinnedUtcMs(state, id0, 1_800_000_000_000);
    expect(state.extraClocks[0].pinnedUtcMs).toBe(1_800_000_000_000);
    expect(state.extraClocks[1].pinnedUtcMs).toBeNull();
  });
});
