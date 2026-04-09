# Optionale KI-Arbeitsstruktur

Dieser Bereich ist fuer persoenliche, optionale KI-Artefakte gedacht.

Die Struktur folgt jetzt einer AWS AI-DLC inspirierten Aufteilung:

- `AGENTS.md` im Repository-Root als zentrale Workflow-Datei
- `.aidlc-rule-details/` fuer vertiefende Regeln nach Phasen
- `docs/ai/PLANS.md` als lokaler Standard fuer fortsetzbare Plan-Dateien
- persoenliche Dateien unter `docs/ai/<name>/`

## Zweck

Markdown-Dateien in diesem Bereich dienen als Arbeitsgedaechtnis fuer:

- Ziel und Scope
- offene Fragen
- Annahmen
- Entscheidungen
- Fortschritt
- Verifikation
- naechste Schritte

Die offiziellen Team-Artefakte bleiben weiterhin:

- GitHub-Issues als Arbeitsauftrag
- Pull Requests als Integrations- und Review-Einheit
- `docs/` fuer gemeinsame Projektdokumentation

## Grundregeln

- Dieser Bereich ist optional und erzwingt keinen Team-Workflow.
- Jedes Teammitglied arbeitet nur im eigenen Unterordner.
- Ein GitHub-Issue bleibt die einzige offizielle Quelle fuer den Auftrag.
- KI-Dateien sind Arbeitsgedaechtnis, keine zweite Wahrheit.
- Fuer kleine Aenderungen sind keine zusaetzlichen Dateien noetig.

## Struktur

- `PLANS.md`: Standard fuer persoenliche Plan-Dateien
- `.aidlc-rule-details/`: Detailregeln fuer AI-DLC Phasen
- `templates/`: wiederverwendbare Vorlagen
- `rsheed/`: persoenlicher Arbeitsbereich von Rsheed

## Empfohlener Ablauf

1. Bestehendes GitHub-Issue auswaehlen
2. persoenliche Plan-Datei im eigenen Ordner anlegen
3. KI mit einer `Using AI-DLC, ...` Anfrage starten
4. erst analysieren und planen lassen
5. nur kleine, reviewbare Schritte umsetzen
6. Fortschritt und Verifikation in der Plan-Datei aktualisieren
7. Branch, PR, Review und Merge normal ueber GitHub

Weitere persoenliche Ordner koennen spaeter nach demselben Muster ergaenzt werden.
