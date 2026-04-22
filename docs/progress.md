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
