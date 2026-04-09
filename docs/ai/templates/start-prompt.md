# Startprompt fuer ein bestehendes Issue

Nutze diesen Prompt als Startpunkt fuer eine KI-Session. Er ist fuer bestehende GitHub-Issues und eine vorhandene persoenliche Plan-Datei gedacht.

```text
Using AI-DLC, arbeite zu diesem bestehenden GitHub-Issue und nutze die zugehoerige persoenliche Plan-Datei als Arbeitsgedaechtnis.

Wichtige Regeln:
- Das GitHub-Issue ist der offizielle Arbeitsauftrag.
- Die Plan-Datei ist nur das persoenliche Arbeitsgedaechtnis.
- Implementiere nicht sofort blind.
- Folge dem Workflow aus `AGENTS.md` und den Regeln unter `.aidlc-rule-details/`.
- Analysiere zuerst Ziel, Scope, Akzeptanzkriterien, offene Fragen und Risiken.
- Schlage nur kleine, reviewbare Umsetzungsschritte vor.
- Halte Entscheidungen, Annahmen, Fortschritt und naechste Schritte in der Plan-Datei aktuell.
- Erzeuge nur dann weitere Dateien, wenn sie fuer die Umsetzung wirklich noetig sind.
- Bei Architektur-, Auth-, Datenmodell- oder Sicherheitsfragen nicht stillschweigend raten, sondern Unsicherheiten klar markieren.

Arbeitsreihenfolge:
1. Issue und bestehende Projektstruktur analysieren
2. Plan-Datei aktualisieren: Ziel, Scope, offene Fragen, Annahmen
3. Kleinen Umsetzungsplan erstellen
4. Nur den naechsten sinnvollen Schritt umsetzen
5. Danach Verifikation und Fortschritt dokumentieren

Ausgabeformat:
- zuerst kurze Analyse
- dann konkrete naechste Schritte
- dann nur die aktuelle kleine Umsetzung
```
