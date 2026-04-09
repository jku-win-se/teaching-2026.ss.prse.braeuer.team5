# Issue 60 Plan

## Meta

- Issue: `#60`
- Titel: Optionale persoenliche KI-Arbeitsstruktur im Repository einrichten
- Besitzer: Rsheed
- Branch: `feature/60/optionale-persoenliche-ki-arbeitsstruktur`
- Status: `in progress`

## Ziel

Eine optionale persoenliche KI-Arbeitsstruktur einfuehren, die GitHub-Issues als offiziellen Auftrag respektiert und persoenliche Markdown-Dateien fuer Planung, Entscheidungen, Fortschritt und Fortsetzung nutzt.

## Scope

- Gehoert dazu:
  - persoenliche KI-Struktur unter `docs/ai/`
  - kurze zentrale Regeln fuer KI-Agenten
  - Standard fuer persoenliche Plan-Dateien
  - persoenlicher Bereich fuer Rsheed
- Gehoert nicht dazu:
  - verpflichtender Team-Workflow
  - Produktfeature-Implementierung
  - Umstellung der bestehenden Projektdokumentation

## Akzeptanzkriterien

- eine optionale persoenliche KI-Arbeitsstruktur ist im Repository vorhanden
- die Struktur ist von gemeinsamer Team-Dokumentation getrennt
- es ist dokumentiert, wie bestehende Issues als Startpunkt verwendet werden
- das Setup bleibt leichtgewichtig und stoert den Team-Workflow nicht
- die Aenderung wird in einem eigenen Branch und Pull Request geliefert

## Repo-Kontext

- relevante Doku:
  - `docs/git-workflow.md`
  - `docs/system-architecture.md`
  - `docs/ai/README.md`
- neue zentrale KI-Datei:
  - `AGENTS.md`
- Standard fuer fortsetzbare Arbeit:
  - `docs/ai/PLANS.md`

## Offene Fragen

- Ob die Teamkollegen spaeter dieselbe Struktur ebenfalls nutzen wollen
- Ob spaeter zusaetzlich eine tool-spezifische Datei wie `.github/copilot-instructions.md` noetig ist

## Annahmen

- Der persoenliche KI-Workflow startet zunaechst nur fuer Rsheed
- Gemeinsame Team-Dokumente sollen vorerst nicht mit persoenlichen KI-Notizen vermischt werden
- Ein AWS AI-DLC inspiriertes Setup mit zentralem Workflow und Detailregeln passt besser als eine lose Sammlung kleiner Hinweise

## Entscheidungen

- Entscheidung: `AGENTS.md` als zentrale AI-DLC Workflow-Datei nutzen
  Grund: Das entspricht naeher dem gezeigten AWS-Muster und gibt der KI eine deutlich klarere Arbeitsfuehrung.

- Entscheidung: `.aidlc-rule-details/` nach Phasen anlegen
  Grund: Detailregeln sollen nicht alle in einer einzigen Datei vermischt werden.

- Entscheidung: persoenliche Dateien unter `docs/ai/rsheed/`
  Grund: Der Workflow bleibt optional und stoert die Team-Doku nicht.

- Entscheidung: eine echte Plan-Datei fuer `#60` anlegen
  Grund: Das Setup selbst soll bereits nach der neuen Methode dokumentiert sein.

## Plan

1. bestehende Minimalstruktur in OpenAI-orientierte Form ueberfuehren
2. kurze zentrale Agenten-Regeln anlegen
3. Standard fuer Plan-Dateien dokumentieren
4. persoenliche Plan-Datei fuer `#60` pflegen
5. Branch pruefen und fuer PR vorbereiten

## Fortschritt

### Erledigt

- Issue `#60` erstellt
- Feature-Branch erstellt
- erste optionale `docs/ai/`-Struktur angelegt
- AWS AI-DLC inspirierte Struktur mit `AGENTS.md`, `.aidlc-rule-details/` und `PLANS.md` begonnen

### Offen

- finale inhaltliche Pruefung des Setups
- Branch pushen
- Pull Request erstellen

### Blocker

- kein technischer Blocker

## Verifikation

- Typecheck: nicht relevant fuer reine Markdown-Aenderungen
- Lint: nicht ausgefuehrt
- Build: nicht ausgefuehrt
- Tests: nicht relevant fuer reine Markdown-Aenderungen
- Manuelle Pruefung: Struktur und Inhalte geprueft

## Naechster Schritt

Inhalte der neuen Dateien pruefen und entscheiden, ob vor dem Push noch Umbenennungen oder inhaltliche Anpassungen noetig sind.
