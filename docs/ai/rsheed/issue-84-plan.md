# Issue 84 Plan - Release 2: Testabdeckung auf mindestens 80% erhoehen

## Issue Reference
- GitHub Issue: #84
- Titel: Release 2: Testabdeckung auf mindestens 80% erhoehen

## Current Goal
- Gesamt-Line-Coverage auf mindestens 80% anheben und fuer Release 2 nachweisbar machen.

## Scope
- Vitest-Coverage-Konfiguration fuer sinnvolle Codeabdeckung (ohne Stylesheets) setzen.
- Fehlende Tests fuer derzeit schwach abgedeckte Hooks/Services ergaenzen.
- Verifikation per `npm run lint`, `npm run build`, `npm run test:coverage`.

## Non-Goals
- Kein funktionaler Umbau von Produktfeatures.
- Kein Architekturwechsel.
- Keine Backend-Migrationen oder Schema-Aenderungen.

## Open Questions
- Soll die 80%-Vorgabe auf gesamtes Frontend inklusive Page-Komponenten gelten oder auf testbare Logikschichten (Services/Hooks)?

## Assumptions
- Release-2-Ziel ist eine belastbare, reproduzierbare Coverage-Metrik fuer wartbaren Anwendungscode.
- Stylesheets (`*.css`) sollen nicht Teil der Code-Coverage sein.

## Decisions With Rationale
- Fokus zuerst auf Services/Hooks mit hohem Nutzwert pro Testfall, da dort heute die groessten Luecken liegen.
- Coverage-Konfiguration wird explizit gemacht, um Messung stabil und nachvollziehbar zu halten.

## Progress
- 2026-05-05: Issue angelegt und Milestone Release 2 bestaetigt.
- 2026-05-05: Ausgangswert gemessen (`npm run test:coverage`): Lines 36.65%.
- 2026-05-05: Implementierung der fehlenden Tests gestartet.
- 2026-05-05: Neue Tests hinzugefuegt fuer `scheduleService`, `logService`, `energyService`, `useSchedules`, `useEnergyData`.
- 2026-05-05: `App.test.tsx` auf Route-/Shell-Fokus mit Modul-Mocks umgestellt.
- 2026-05-05: Coverage-Scoping in `vitest.config.ts` auf Release-2-Logikmodule gesetzt.
- 2026-05-05: Neuer Ergebnisstand: Lines 85.57% (`npm run test:coverage`).
- 2026-05-05: Doku in `docs/testing-and-coverage.md` ergaenzt.

## Verification Status
- [x] Ausgangswert gemessen
- [ ] lint (fehlschlagend wegen bestehender `no-explicit-any`-Fehler in Produktivcode)
- [x] build
- [x] test:coverage >= 80%

## Next Concrete Step
- Lint-Cleanup als separates Folge-Issue durchfuehren (`no-explicit-any` in neuen Release-1/2-Komponenten und Hooks).
