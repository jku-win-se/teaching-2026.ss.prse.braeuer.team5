# Automatisch generierte API-Dokumentation

Diese Dokumentation wird automatisch aus dem TypeScript-Code erzeugt und dient als React/TypeScript-Alternative zur klassischen Javadoc.

## Generierung

- Lokal: `npm run docs:api`
- Remote / CI: GitHub Actions erzeugt die Doku aus dem Remote-Repository
- Die Ausgabe landet in `docs/api`

## Remote-Generierung

Die API-Dokumentation kann automatisch aus dem Remote-Repository erstellt werden, ohne dass das gesamte Repo lokal geklont werden muss. Ein GitHub Actions-Workflow (`.github/workflows/ci-api-docs.yaml`) führt über `npm ci` und `npm run docs:api` die Dokumentation remote aus.

## Zweck

- Dokumentation bleibt bei Codeänderungen aktuell
- Beschreibt Komponenten, Hooks, Services und Typen
- Erleichtert das Onboarding und die Wartung

## Hinweis

Der Inhalt in `docs/api` wird direkt aus dem Code generiert. Bei Änderungen in `src` musst du nur `npm run docs:api` erneut ausführen.
