# Smart Home Team 5

Webanwendung fuer das PRSE-Projekt im SS26. Die Anwendung dient zur Verwaltung simulierter Smart-Home-Geraete, Raeume und spaeter auch Regeln, Zeitplaenen und Auswertungen.

## Aktueller Stand

- Offizielles Team-Repo auf React, TypeScript und Vite umgestellt
- Erste Navigationsstruktur fuer Dashboard, Devices und Simulator vorhanden
- Supabase-Anbindung vorbereitet ueber Umgebungsvariablen
- GitHub Actions prueft Lint und Production Build

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
- [Git-Workflow](./docs/git-workflow.md)
- [Release-1-Plan](./docs/release-1-plan.md)
- [Backlog-Entwurf](./docs/backlog.md)
