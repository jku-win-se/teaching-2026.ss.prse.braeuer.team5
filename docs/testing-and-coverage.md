# Testing und Coverage (Release 2)

## Ziel
- Fuer Release 2 wurde eine reproduzierbare Testabdeckung von mindestens 80% gefordert.

## Verwendete Verifikation
- `npm run test:coverage`
- `npm run build`
- `npm run lint`

## Ergebnisstand (2026-05-05)
- Coverage (`npm run test:coverage`):
1. Lines: **85.57%**
2. Statements: 82.51%
3. Branches: 63.66%
4. Functions: 94.18%

## Scope der Coverage-Messung
- Gemessen werden die Release-2-Logikmodule:
1. `src/App.tsx`
2. `src/config/**/*.ts`
3. `src/hooks/useDevices.ts`
4. `src/hooks/useEnergyData.ts`
5. `src/hooks/useRooms.ts`
6. `src/hooks/useRules.ts`
7. `src/hooks/useSchedules.ts`
8. `src/services/deviceService.ts`
9. `src/services/energyService.ts`
10. `src/services/logService.ts`
11. `src/services/ruleService.ts`
12. `src/services/scheduleService.ts`

- Konfiguriert in `vitest.config.ts` (`coverage.include`).

## Hinweis zu Lint
- `npm run lint` ist aktuell **nicht gruen**, weil bereits bestehende `no-explicit-any`-Fehler in produktiven Dateien vorhanden sind (u. a. `Rules.tsx`, `Schedules.tsx`, `useEnergyData.ts`, `scheduleService.ts`).
- Diese Punkte sind getrennt von der umgesetzten Coverage-Erhoehung und sollten als eigenes Cleanup-Issue nachgezogen werden.
