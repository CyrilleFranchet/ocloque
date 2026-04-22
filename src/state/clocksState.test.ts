import { describe, expect, it } from 'vitest';
import {
  addZonedClock,
  clampDisplayOffsetHours,
  createInitialClocksState,
  removeZonedClock,
  setLocalOffsetHours,
  setZonedClockOffsetHours,
  setZonedClockTimeZone,
} from './clocksState';

function idSeq(): () => string {
  let n = 0;
  return () => `id-${++n}`;
}

describe('createInitialClocksState', () => {
  it('creates one extra clock defaulting to UTC with zero offsets', () => {
    const gen = idSeq();
    const state = createInitialClocksState(gen);
    expect(state.localOffsetHours).toBe(0);
    expect(state.extraClocks).toHaveLength(1);
    expect(state.extraClocks[0].ianaTimeZone).toBe('UTC');
    expect(state.extraClocks[0].offsetHours).toBe(0);
    expect(state.extraClocks[0].id).toBe('id-1');
  });
});

describe('clampDisplayOffsetHours', () => {
  it('clamps to the allowed hour range', () => {
    expect(clampDisplayOffsetHours(100)).toBe(23);
    expect(clampDisplayOffsetHours(-50)).toBe(-23);
    expect(clampDisplayOffsetHours(3.7)).toBe(3);
  });
});

describe('setLocalOffsetHours', () => {
  it('updates the local display offset', () => {
    const gen = idSeq();
    let state = createInitialClocksState(gen);
    state = setLocalOffsetHours(state, -2);
    expect(state.localOffsetHours).toBe(-2);
  });
});

describe('setZonedClockOffsetHours', () => {
  it('updates only the matching extra clock', () => {
    const gen = idSeq();
    let state = createInitialClocksState(gen);
    state = addZonedClock(state, gen, 'Europe/Paris');
    const id0 = state.extraClocks[0].id;
    state = setZonedClockOffsetHours(state, id0, 5);
    expect(state.extraClocks[0].offsetHours).toBe(5);
    expect(state.extraClocks[1].offsetHours).toBe(0);
  });
});

describe('addZonedClock', () => {
  it('appends a clock with normalized zone', () => {
    const gen = idSeq();
    let state = createInitialClocksState(gen);
    state = addZonedClock(state, gen, 'Europe/Paris');
    expect(state.extraClocks).toHaveLength(2);
    expect(state.extraClocks[1].ianaTimeZone).toBe('Europe/Paris');
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
  it('updates matching clock', () => {
    const gen = idSeq();
    let state = createInitialClocksState(gen);
    const id = state.extraClocks[0].id;
    state = setZonedClockOffsetHours(state, id, 4);
    state = setZonedClockTimeZone(state, id, 'America/Los_Angeles');
    expect(state.extraClocks[0].ianaTimeZone).toBe('America/Los_Angeles');
    expect(state.extraClocks[0].offsetHours).toBe(4);
  });

  it('normalizes invalid zones', () => {
    const gen = idSeq();
    let state = createInitialClocksState(gen);
    const id = state.extraClocks[0].id;
    state = setZonedClockTimeZone(state, id, 'Bad/Zone');
    expect(state.extraClocks[0].ianaTimeZone).toBe('UTC');
  });
});
