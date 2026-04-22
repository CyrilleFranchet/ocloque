# Implementation progress

## 2026-04-22

### Scaffold (Vite + TypeScript + Vitest)

- Added `package.json` with Vite 6, TypeScript 5, Vitest 3, jsdom.
- Added `vite.config.ts` (Vitest merge config, jsdom environment).
- Added `tsconfig.json`, root `index.html`, minimal `src/main.ts` and `src/style.css`.
- Added `src/scaffold.test.ts` to validate the test runner.
- Next: timezone formatting utilities and their unit tests.

### Timezone utilities

- Added `src/time/timeZone.ts`: `listIanaTimeZones` (sorted, ensures `UTC` is selectable), `isValidIanaTimeZone`, `normalizeIanaTimeZone`.
- Added `src/time/formatInZone.ts`: `formatInstantInZone` for clock display (time, long date, offset).
- Unit tests: `timeZone.test.ts`, `formatInZone.test.ts`.
- Next: clock list state (add / remove / change zone) with tests.

### Clock list state

- Added `src/state/clocksState.ts`: immutable `createInitialClocksState`, `addZonedClock`, `removeZonedClock`, `setZonedClockTimeZone` with injectable `IdGenerator`.
- Unit tests in `clocksState.test.ts`.
- Next: UI layer, snapshot builder, and Docker image.

### UI and display

- Added `src/display/clockSnapshots.ts` plus tests: builds ordered snapshots for local + extra clocks.
- Added `src/ui/timeZoneOptions.ts` plus tests: filters long IANA lists while keeping the current selection visible.
- Added `src/ui/clockApp.ts` plus DOM tests: header with “+”, local card, extra cards with filter + select + remove, 1s tick without rebuilding selects each tick.
- Updated `src/main.ts` and `src/style.css` for layout and theming.
- Removed the initial scaffold-only Vitest file.
- Next: Docker image and deployment docs.

### Docker and docs

- Added multi-stage `Dockerfile` (Node build runs `npm test` + `npm run build`, nginx Alpine serves `dist/`).
- Added `nginx.conf` (gzip, SPA-style `try_files`).
- Added `docker-compose.yml` mapping **8080 → 80**.
- Added `.dockerignore` and root `README.md` with run instructions.
- Status: feature-complete per PRD v1 (no persistence).

### Abbreviations and shortcuts

- `formatInstantInZone` now exposes an **abbreviation** (`Intl` `timeZoneName: 'short'`).
- Clock cards show **abbr + IANA**; the select lists **`ABBR — IANA`** options.
- Added `src/time/zoneShortcuts.ts` (EST, IST, PST, … → canonical IANA) and `filteredIanaZones` so the filter matches abbreviations and shortcut descriptions.
- PRD and README updated accordingly.
