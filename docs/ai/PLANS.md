# PLANS.md

Standard fuer persoenliche KI-gestuetzte Plan-Dateien in diesem Repository.

Diese Datei beschreibt nicht das Produkt, sondern wie eine Plan-Datei innerhalb des AWS AI-DLC inspirierten Workflows aufgebaut sein soll, damit Arbeit spaeter sauber fortgesetzt, geprueft und reviewed werden kann.

## Ziel

Eine Plan-Datei soll:

- den Bezug zu einem GitHub-Issue klar machen
- den aktuellen Stand sichtbar machen
- Entscheidungen und Annahmen festhalten
- offene Fragen dokumentieren
- den naechsten konkreten Schritt benennen
- Verifikation und Review vorbereiten

## Wann eine Plan-Datei sinnvoll ist

Plan-Dateien sind sinnvoll fuer:

- groessere Features
- mehrschrittige Aenderungen
- Architektur- oder Datenmodellfragen
- Aufgaben, die nicht in einer Session fertig werden
- Arbeit mit KI, die spaeter fortgesetzt werden soll

Plan-Dateien sind nicht noetig fuer:

- kleine Textkorrekturen
- triviale UI-Anpassungen
- sehr kleine lokale Refactorings ohne offenes Risiko

## Speicherort

Persoenliche Plan-Dateien liegen unter:

- `docs/ai/<name>/`

Empfohlenes Namensschema:

- `issue-<nummer>-plan.md`

Beispiel:

- `docs/ai/rsheed/issue-60-plan.md`

## Pflichtabschnitte

Jede Plan-Datei soll mindestens diese Abschnitte enthalten:

### 1. Meta

- Issue-Nummer
- Titel
- Besitzer
- Branch
- Status

### 2. Ziel

Kurze fachliche Beschreibung des Ergebnisses.

### 3. Scope

- was gehoert dazu
- was gehoert nicht dazu

### 4. Akzeptanzkriterien

Aus dem Issue uebernommen oder konkretisiert.

### 5. Repo-Kontext

- betroffene Dateien
- relevante Dokumente
- technische Abhaengigkeiten

### 6. Offene Fragen

Ungeklaerte Punkte, die Implementierung oder Design beeinflussen.

### 7. Annahmen

Bewusst getroffene Annahmen, solange Fragen noch offen sind.

### 8. Entscheidungen

Entscheidungen mit kurzer Begruendung.

### 9. Plan

Eine kurze Liste kleiner, reviewbarer Schritte.

### 10. Fortschritt

- erledigt
- offen
- blocker

### 11. Verifikation

- lint
- build
- tests
- manuelle Pruefung falls relevant

### 12. Naechster Schritt

Genau ein kleiner, konkreter naechster Schritt.

## Schreibregeln

- kurz, konkret, fortsetzbar
- keine langen Fliesstext-Protokolle
- keine Chat-Kopie in die Datei
- keine Minuten- oder Stundenchronik
- nur Informationen festhalten, die fuer Fortsetzung, Review oder Entscheidung relevant sind

## Zusammenarbeit

- GitHub-Issue bleibt offizieller Auftrag
- PR bleibt die Review-Einheit
- Plan-Datei dient nur als persoenliches Arbeitsgedaechtnis
- gemeinsame Team-Dokumente werden nur geaendert, wenn das Team sie wirklich gemeinsam tragen will

## KI-Verhalten

Wenn eine KI mit einer Plan-Datei arbeitet, soll sie:

1. zuerst den aktuellen Stand lesen
2. offene Fragen und Annahmen sichtbar machen
3. nicht mehrere grosse Schritte auf einmal ausfuehren
4. nach jeder relevanten Aenderung die Datei aktualisieren
5. Verifikation nicht ueberspringen

## Beziehung zu AGENTS.md und .aidlc-rule-details

- `AGENTS.md` beschreibt den zentralen AI-DLC Workflow fuer dieses Repository.
- `.aidlc-rule-details/` enthaelt vertiefende Regeln nach Phasen und Themen.
- `PLANS.md` definiert den lokalen Standard fuer laengere, fortsetzbare Arbeit.
- die konkrete Arbeit passiert in den persoenlichen `issue-<nummer>-plan.md` Dateien.
