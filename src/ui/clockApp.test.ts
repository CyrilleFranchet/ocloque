import { afterEach, describe, expect, it } from 'vitest';
import { createClockApp } from './clockApp';

afterEach(() => {
  document.body.replaceChildren();
});

describe('createClockApp', () => {
  it('renders the local clock and one configurable clock', () => {
    const root = document.createElement('div');
    document.body.appendChild(root);
    const fixed = new Date('2024-06-15T14:30:00.000Z');
    const app = createClockApp(root, {
      getNow: () => fixed,
      getLocalTimeZone: () => 'UTC',
      tickMs: 60_000,
      generateId: () => 'extra-1',
    });
    const cards = root.querySelectorAll('.clock-card');
    expect(cards.length).toBe(2);
    expect(root.querySelectorAll('.pin-apply').length).toBe(2);
    expect(root.querySelector('[data-clock-id="local"]')).toBeTruthy();
    expect(root.querySelector('[data-clock-id="extra-1"]')).toBeTruthy();
    app.dispose();
    document.body.removeChild(root);
  });

  it('adds another clock when the plus button is clicked', () => {
    const root = document.createElement('div');
    document.body.appendChild(root);
    const fixed = new Date('2024-06-15T14:30:00.000Z');
    let n = 0;
    const gen = () => `cid-${++n}`;
    const app = createClockApp(root, {
      getNow: () => fixed,
      getLocalTimeZone: () => 'UTC',
      tickMs: 60_000,
      generateId: gen,
    });
    root.querySelector<HTMLButtonElement>('.ocloque-add')!.click();
    const cards = root.querySelectorAll('.clock-card');
    expect(cards.length).toBe(3);
    app.dispose();
    document.body.removeChild(root);
  });
});
