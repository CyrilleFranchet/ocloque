import { buildClockSnapshots } from '../display/clockSnapshots';
import {
  addZonedClock,
  createInitialClocksState,
  removeZonedClock,
  setZonedClockTimeZone,
  type ClocksState,
  type IdGenerator,
} from '../state/clocksState';
import { listIanaTimeZones } from '../time/timeZone';
import { filteredTimeZones } from './timeZoneOptions';

export type ClockAppOptions = {
  getLocalTimeZone?: () => string;
  getNow?: () => Date;
  generateId?: IdGenerator;
  tickMs?: number;
};

export type ClockAppHandle = {
  dispose(): void;
};

function escapeAttr(value: string): string {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
    return CSS.escape(value);
  }
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

export function createClockApp(root: HTMLElement, options: ClockAppOptions = {}): ClockAppHandle {
  const getNow = options.getNow ?? (() => new Date());
  const getLocalTimeZone =
    options.getLocalTimeZone ?? (() => Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC');
  const generateId = options.generateId ?? (() => crypto.randomUUID());
  const tickMs = options.tickMs ?? 1000;

  let state: ClocksState = createInitialClocksState(generateId);
  const allZones = listIanaTimeZones();
  const filters = new Map<string, string>();

  const shell = document.createElement('div');
  shell.className = 'ocloque';
  shell.innerHTML = `
    <header class="ocloque-header">
      <h1 class="ocloque-title">World clocks</h1>
      <button type="button" class="ocloque-add" aria-label="Add clock">+</button>
    </header>
    <section class="ocloque-row" aria-label="Clocks"></section>
  `;
  root.replaceChildren(shell);

  const row = shell.querySelector<HTMLElement>('.ocloque-row')!;
  const addBtn = shell.querySelector<HTMLButtonElement>('.ocloque-add')!;

  function fillSelect(select: HTMLSelectElement, clockId: string, selected: string): void {
    const q = filters.get(clockId) ?? '';
    const opts = filteredTimeZones(allZones, q, selected);
    select.replaceChildren();
    for (const z of opts) {
      const o = document.createElement('option');
      o.value = z;
      o.textContent = z;
      if (z === selected) o.selected = true;
      select.appendChild(o);
    }
  }

  function buildLocalCard(): HTMLElement {
    const article = document.createElement('article');
    article.className = 'clock-card clock-card--local';
    article.dataset.clockId = 'local';
    article.innerHTML = `
      <h2 class="clock-heading"></h2>
      <p class="clock-time clock-numeric" aria-live="polite"></p>
      <p class="clock-date"></p>
      <p class="clock-offset"></p>
    `;
    return article;
  }

  function buildExtraCard(clock: { id: string; ianaTimeZone: string }): HTMLElement {
    const article = document.createElement('article');
    article.className = 'clock-card';
    article.dataset.clockId = clock.id;
    article.innerHTML = `
      <div class="clock-card-controls">
        <label class="tz-filter-label">Filter
          <input class="tz-filter" type="search" spellcheck="false" autocomplete="off" />
        </label>
        <label class="tz-select-label">Time zone
          <select class="tz-select"></select>
        </label>
        <button type="button" class="clock-remove">Remove</button>
      </div>
      <h2 class="clock-heading"></h2>
      <p class="clock-time clock-numeric" aria-live="polite"></p>
      <p class="clock-date"></p>
      <p class="clock-offset"></p>
    `;

    const filterInput = article.querySelector<HTMLInputElement>('.tz-filter')!;
    const select = article.querySelector<HTMLSelectElement>('.tz-select')!;
    const removeBtn = article.querySelector<HTMLButtonElement>('.clock-remove')!;

    filterInput.value = filters.get(clock.id) ?? '';
    fillSelect(select, clock.id, clock.ianaTimeZone);

    filterInput.addEventListener('input', () => {
      filters.set(clock.id, filterInput.value);
      const current = state.extraClocks.find((c) => c.id === clock.id)?.ianaTimeZone ?? clock.ianaTimeZone;
      fillSelect(select, clock.id, current);
    });

    select.addEventListener('change', () => {
      state = setZonedClockTimeZone(state, clock.id, select.value);
      const updated = state.extraClocks.find((c) => c.id === clock.id)?.ianaTimeZone;
      if (updated) select.value = updated;
      refreshTimesOnly();
      fillSelect(select, clock.id, updated ?? select.value);
    });

    removeBtn.addEventListener('click', () => {
      state = removeZonedClock(state, clock.id);
      filters.delete(clock.id);
      rebuildStructure();
    });

    return article;
  }

  function rebuildStructure(): void {
    row.replaceChildren();
    row.appendChild(buildLocalCard());
    for (const c of state.extraClocks) {
      row.appendChild(buildExtraCard(c));
    }
    refreshTimesOnly();
  }

  function refreshTimesOnly(): void {
    const instant = getNow();
    const localZone = getLocalTimeZone();
    const snaps = buildClockSnapshots(instant, localZone, state.extraClocks);
    for (const s of snaps) {
      const el = row.querySelector<HTMLElement>(`[data-clock-id="${escapeAttr(s.id)}"]`);
      if (!el) continue;
      const heading = el.querySelector<HTMLElement>('.clock-heading');
      const timeEl = el.querySelector<HTMLElement>('.clock-time');
      const dateEl = el.querySelector<HTMLElement>('.clock-date');
      const offEl = el.querySelector<HTMLElement>('.clock-offset');
      if (heading) heading.textContent = s.headingLabel;
      if (timeEl) timeEl.textContent = s.time;
      if (dateEl) dateEl.textContent = s.dateLong;
      if (offEl) offEl.textContent = s.offsetLabel;
    }
  }

  addBtn.addEventListener('click', () => {
    state = addZonedClock(state, generateId, 'UTC');
    rebuildStructure();
  });

  rebuildStructure();
  const timer = window.setInterval(() => {
    refreshTimesOnly();
  }, tickMs);

  return {
    dispose(): void {
      window.clearInterval(timer);
      root.replaceChildren();
    },
  };
}
