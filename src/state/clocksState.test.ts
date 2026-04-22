import { describe, expect, it } from 'vitest';
import {
  addZonedClock,
  createInitialClocksState,
  removeZonedClock,
  setZonedClockTimeZone,
} from './clocksState';

function idSeq(): () => string {
  let n = 0;
  return () => `id-${++n}`;
}

describe('createInitialClocksState', () => {
  it('creates one extra clock defaulting to UTC', () => {
    const gen = idSeq();
    const state = createInitialClocksState(gen);
    expect(state.extraClocks).toHaveLength(1);
    expect(state.extraClocks[0].ianaTimeZone).toBe('UTC');
    expect(state.extraClocks[0].id).toBe('id-1');
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
    state = setZonedClockTimeZone(state, id, 'America/Los_Angeles');
    expect(state.extraClocks[0].ianaTimeZone).toBe('America/Los_Angeles');
  });

  it('normalizes invalid zones', () => {
    const gen = idSeq();
    let state = createInitialClocksState(gen);
    const id = state.extraClocks[0].id;
    state = setZonedClockTimeZone(state, id, 'Bad/Zone');
    expect(state.extraClocks[0].ianaTimeZone).toBe('UTC');
  });
});
