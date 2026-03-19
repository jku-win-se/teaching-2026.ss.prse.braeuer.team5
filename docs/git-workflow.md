# Git-Workflow

## Branches

- `main`: stabiler Stand fuer praesentierbare oder freigegebene Versionen
- `develop`: Integrationsbranch fuer die naechste Abgabe oder das naechste Release
- `feature/<issue-id>/<kurzbeschreibung>`: neue Funktion oder technische Aufgabe
- `release/<bezeichnung>`: Vorbereitung einer Abgabe
- `hotfix/<kurzbeschreibung>`: dringende Korrektur auf stabilem Stand

## Branch-Regeln

- Neue Features starten von `develop`.
- Features werden per Pull Request nach `develop` gemerged.
- `main` bekommt nur freigegebene Staende.
- Vor groesseren Aenderungen immer zuerst `develop` aktualisieren.

## Benennung

- Branches nur in Kleinbuchstaben
- Wörter mit `-` trennen
- Beispiel: `feature/12/react-repo-migration`

## Commit-Nachrichten

Empfohlenes Format:

`#<issue-id> [<zeit>] <kurze beschreibung>`

Beispiele:

- `#12 [1.5h] migrate repository to react frontend`
- `#14 [0.5h] add release 1 planning document`
- `#18 [0.25h] fix sidebar navigation styles`

## Pull Requests

- Ein PR pro fachlich zusammenhaengender Aufgabe
- PR enthaelt kurze Beschreibung, Bezug zum Issue und Testhinweis
- Mindestens ein PR muss bis zur morgigen Einheit im Repository sichtbar sein
