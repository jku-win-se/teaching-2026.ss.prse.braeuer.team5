# Systemarchitektur

## Ueberblick

Die Anwendung wird als Web-Frontend mit React, TypeScript und Vite umgesetzt. Fuer Persistenz, Authentifizierung und spaetere Echtzeitfunktionen ist Supabase als Backend-Service vorgesehen.

## Architekturbausteine

- `src/components`: wiederverwendbare UI-Bausteine wie Navigation
- `src/pages`: seitenbezogene Oberflaechen fuer Dashboard, Devices und Simulator
- `src/config`: technische Konfiguration wie die Supabase-Anbindung

## Geplante Gesamtarchitektur

- Frontend: React-Anwendung im Browser
- Backend-Service: Supabase fuer Auth, Datenhaltung und spaetere Regeln/Aktivitaetslogs
- Deployment: statischer Frontend-Build aus `dist/`

## Zentrale Designentscheidungen

- React mit TypeScript fuer schnelle Iteration und klare Komponentenstruktur
- Vite fuer einfaches Projektskelett und schnellen Build
- Supabase statt eigenem Server fuer schnellen Start bei Auth und Datenmodell
- Erst ein einfacher End-to-End-Flow, spaeter Ausbau auf Regeln, Rollen und Auswertungen

## Erweiterungspunkte

- Login und Rollenmodell
- CRUD fuer Raeume und Geraete
- Aktivitaetslog
- Regeln und Zeitplaene
- Simulator fuer Tagesablaeufe
- Energie-Dashboard

## Build und Qualitaet

- Paketverwaltung: npm
- Build: `npm run build`
- Statische Analyse: `npm run lint`
- CI: GitHub Actions fuehrt Lint und Build auf Push und Pull Request aus

## Vorlaeufiges Komponentenbild

Das zugehoerige Diagramm liegt in [component-diagram.puml](./component-diagram.puml).
