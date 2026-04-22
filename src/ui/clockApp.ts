import { buildClockSnapshots } from '../display/clockSnapshots';
import {
  addZonedClock,
  createInitialClocksState,
  removeZonedClock,
  setLocalPinnedUtcMs,
  setZonedClockPinnedUtcMs,
  setZonedClockTimeZone,
  type ClocksState,
  type IdGenerator,
  type ZonedClock,
} from '../state/clocksState';
import { formatTimeZoneAbbreviation } from '../time/formatInZone';
import { listIanaTimeZones } from '../time/timeZone';
import { nowWallParts, utcMsToWallParts, wallTimeToUtcMs } from '../time/wallTimePin';
import { ZONE_SHORTCUTS, shortcutSelectLabel } from '../time/zoneShortcuts';
import { filteredIanaZones } from './timeZoneOptions';

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

function clampHour(n: number): number {
  return Math.min(23, Math.max(0, Math.trunc(Number.isFinite(n) ? n : 0)));
}

function clampMinute(n: number): number {
  return Math.min(59, Math.max(0, Math.trunc(Number.isFinite(n) ? n : 0)));
}

const manualBlockHtml = `
  <div class="clock-manual-time">
    <div class="clock-manual-title">Set time in this zone</div>
    <label class="manual-date-label">Date
      <input type="date" class="pin-date" />
    </label>
    <div class="manual-time-row">
      <label class="manual-hm-label">Hour (0–23)
        <input type="number" class="pin-hour" min="0" max="23" step="1" />
      </label>
      <label class="manual-hm-label">Minute (0–59)
        <input type="number" class="pin-minute" min="0" max="59" step="1" />
      </label>
    </div>
    <div class="clock-manual-actions">
      <button type="button" class="pin-apply">Apply</button>
      <button type="button" class="pin-clear">Use live time</button>
    </div>
  </div>
`;

function fillPinFields(
  article: HTMLElement,
  zone: string,
  pinnedUtcMs: number | null,
): void {
  const dateIn = article.querySelector<HTMLInputElement>('.pin-date')!;
  const hourIn = article.querySelector<HTMLInputElement>('.pin-hour')!;
  const minIn = article.querySelector<HTMLInputElement>('.pin-minute')!;
  const parts = pinnedUtcMs != null ? utcMsToWallParts(pinnedUtcMs, zone) : nowWallParts(zone);
  dateIn.value = `${String(parts.year).padStart(4, '0')}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`;
  hourIn.value = String(parts.hour);
  minIn.value = String(parts.minute);
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
    const opts = filteredIanaZones(allZones, ZONE_SHORTCUTS, q, selected);
    const instant = getNow();
    select.replaceChildren();
    for (const z of opts) {
      const o = document.createElement('option');
      o.value = z;
      const fromShortcut = shortcutSelectLabel(z);
      if (fromShortcut) {
        o.textContent = fromShortcut;
      } else {
        const abbr = formatTimeZoneAbbreviation(instant, z);
        o.textContent = abbr && abbr !== z ? `${abbr} — ${z}` : z;
      }
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
      <p class="clock-iana"></p>
      <p class="clock-time clock-numeric" aria-live="polite"></p>
      <p class="clock-date"></p>
      <p class="clock-offset"></p>
      ${manualBlockHtml}
    `;
    fillPinFields(article, getLocalTimeZone(), state.localPinnedUtcMs);
    const applyBtn = article.querySelector<HTMLButtonElement>('.pin-apply')!;
    const clearBtn = article.querySelector<HTMLButtonElement>('.pin-clear')!;
    applyBtn.addEventListener('click', () => {
      const zone = getLocalTimeZone();
      const dateIn = article.querySelector<HTMLInputElement>('.pin-date')!;
      const hourIn = article.querySelector<HTMLInputElement>('.pin-hour')!;
      const minIn = article.querySelector<HTMLInputElement>('.pin-minute')!;
      const ds = dateIn.value;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(ds)) {
        window.alert('Pick a calendar date.');
        return;
      }
      const [y, mo, d] = ds.split('-').map(Number);
      const ms = wallTimeToUtcMs(zone, {
        year: y,
        month: mo,
        day: d,
        hour: clampHour(Number.parseInt(hourIn.value, 10)),
        minute: clampMinute(Number.parseInt(minIn.value, 10)),
      });
      if (ms == null) {
        window.alert('Invalid date/time in this zone (e.g. DST gap).');
        return;
      }
      state = setLocalPinnedUtcMs(state, ms);
      fillPinFields(article, zone, state.localPinnedUtcMs);
      refreshTimesOnly();
    });
    clearBtn.addEventListener('click', () => {
      state = setLocalPinnedUtcMs(state, null);
      fillPinFields(article, getLocalTimeZone(), null);
      refreshTimesOnly();
    });
    return article;
  }

  function buildExtraCard(clock: ZonedClock): HTMLElement {
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
      <p class="clock-iana"></p>
      <p class="clock-time clock-numeric" aria-live="polite"></p>
      <p class="clock-date"></p>
      <p class="clock-offset"></p>
      ${manualBlockHtml}
    `;

    const filterInput = article.querySelector<HTMLInputElement>('.tz-filter')!;
    const select = article.querySelector<HTMLSelectElement>('.tz-select')!;
    const removeBtn = article.querySelector<HTMLButtonElement>('.clock-remove')!;
    const zoneNow = () =>
      state.extraClocks.find((c) => c.id === clock.id)?.ianaTimeZone ?? clock.ianaTimeZone;
    const pinNow = () => state.extraClocks.find((c) => c.id === clock.id)?.pinnedUtcMs ?? null;

    filterInput.value = filters.get(clock.id) ?? '';
    fillSelect(select, clock.id, clock.ianaTimeZone);
    fillPinFields(article, zoneNow(), pinNow());

    filterInput.addEventListener('input', () => {
      filters.set(clock.id, filterInput.value);
      const current = state.extraClocks.find((c) => c.id === clock.id)?.ianaTimeZone ?? clock.ianaTimeZone;
      fillSelect(select, clock.id, current);
    });

    select.addEventListener('change', () => {
      state = setZonedClockTimeZone(state, clock.id, select.value);
      const updated = state.extraClocks.find((c) => c.id === clock.id)?.ianaTimeZone;
      if (updated) select.value = updated;
      fillPinFields(article, zoneNow(), pinNow());
      refreshTimesOnly();
      fillSelect(select, clock.id, updated ?? select.value);
    });

    const applyBtn = article.querySelector<HTMLButtonElement>('.pin-apply')!;
    const clearBtn = article.querySelector<HTMLButtonElement>('.pin-clear')!;
    applyBtn.addEventListener('click', () => {
      const zone = zoneNow();
      const dateIn = article.querySelector<HTMLInputElement>('.pin-date')!;
      const hourIn = article.querySelector<HTMLInputElement>('.pin-hour')!;
      const minIn = article.querySelector<HTMLInputElement>('.pin-minute')!;
      const ds = dateIn.value;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(ds)) {
        window.alert('Pick a calendar date.');
        return;
      }
      const [y, mo, d] = ds.split('-').map(Number);
      const ms = wallTimeToUtcMs(zone, {
        year: y,
        month: mo,
        day: d,
        hour: clampHour(Number.parseInt(hourIn.value, 10)),
        minute: clampMinute(Number.parseInt(minIn.value, 10)),
      });
      if (ms == null) {
        window.alert('Invalid date/time in this zone (e.g. DST gap).');
        return;
      }
      state = setZonedClockPinnedUtcMs(state, clock.id, ms);
      fillPinFields(article, zoneNow(), pinNow());
      refreshTimesOnly();
    });
    clearBtn.addEventListener('click', () => {
      state = setZonedClockPinnedUtcMs(state, clock.id, null);
      fillPinFields(article, zoneNow(), null);
      refreshTimesOnly();
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
    const snaps = buildClockSnapshots(instant, localZone, state.localPinnedUtcMs, state.extraClocks);
    for (const s of snaps) {
      const el = row.querySelector<HTMLElement>(`[data-clock-id="${escapeAttr(s.id)}"]`);
      if (!el) continue;
      const heading = el.querySelector<HTMLElement>('.clock-heading');
      const ianaEl = el.querySelector<HTMLElement>('.clock-iana');
      const timeEl = el.querySelector<HTMLElement>('.clock-time');
      const dateEl = el.querySelector<HTMLElement>('.clock-date');
      const offEl = el.querySelector<HTMLElement>('.clock-offset');
      if (heading) heading.textContent = s.headingLabel;
      if (ianaEl) ianaEl.textContent = s.ianaCaption;
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
