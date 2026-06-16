# Smart Home Team 5

![Coverage](https://raw.githubusercontent.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/main/.github/badges/coverage.svg)
![CI](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/actions/workflows/ci-quality-check.yaml/badge.svg)

Webanwendung fuer das PRSE-Projekt im SS26. Die Anwendung dient zur Verwaltung simulierter Smart-Home-Geraete, Raeume, Regeln, Zeitplaenen und Auswertungen.

## Aktueller Stand

- Frontend mit React, TypeScript und Vite
- Navigation und Seiten fuer Dashboard, Raeume, Geraete, Regeln, Szenen, Zeitplaene, Urlaub, Benachrichtigungen und Simulator
- Supabase-Anbindung vorbereitet fuer Authentifizierung, Datenhaltung und spaetere Echtzeitfunktionen
- UI-Komponenten, wiederverwendbare Hooks und Services fuer Geraete-, Raum- und Automatisierungsdaten
- GitHub Actions prueft Lint und Production Build auf Push und Pull Request

## Voraussetzungen

- Node.js 22
- npm 11

## Lokaler Start

1. Abhaengigkeiten installieren: `npm ci`
2. Umgebungsvariablen anlegen: `.env` aus `.env.example` erstellen
3. Entwicklungsserver starten: `npm run dev`
4. Produktionsbuild pruefen: `npm run build`

## Wichtige Skripte

- `npm run dev`
- `npm run lint`
- `npm run build`

## Dokumentation

- [Benutzerdokumentation](./docs/user-handbook.md)
- [Systemarchitektur](./docs/system-architecture.md)
- [UML-Diagramme zur Systemarchitektur](./docs/uml-diagram.md)
- [Automatisch generierte API-Dokumentation](./docs/api/README.md)
- [Git-Workflow](./docs/git-workflow.md)
- [Projekt-Roadmap](./docs/project-roadmap.md)
- [Testing und Coverage](./docs/testing-and-coverage.md)
