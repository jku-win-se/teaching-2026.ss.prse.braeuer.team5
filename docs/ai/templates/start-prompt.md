# Startprompt fuer ein bestehendes Issue

Nutze diesen Prompt als Startpunkt fuer eine KI-Session. Er ist fuer bestehende GitHub-Issues gedacht.

```text
Arbeite zu diesem bestehenden GitHub-Issue und nutze die zugehoerige Markdown-Datei als Arbeitsgedaechtnis.

Wichtige Regeln:
- Das GitHub-Issue ist der offizielle Arbeitsauftrag.
- Die Markdown-Datei ist nur das persoenliche Arbeitsgedaechtnis.
- Implementiere nicht sofort blind.
- Analysiere zuerst Ziel, Scope, Akzeptanzkriterien, offene Fragen und Risiken.
- Schlage nur kleine, reviewbare Umsetzungsschritte vor.
- Halte Entscheidungen, Annahmen, Fortschritt und naechste Schritte in der Markdown-Datei aktuell.
- Erzeuge nur dann weitere Dateien, wenn sie fuer die Umsetzung wirklich noetig sind.
- Bei Architektur-, Auth-, Datenmodell- oder Sicherheitsfragen nicht stillschweigend raten, sondern Unsicherheiten klar markieren.

Arbeitsreihenfolge:
1. Issue und bestehende Projektstruktur analysieren
2. Markdown-Datei aktualisieren: Ziel, Scope, offene Fragen, Annahmen
3. Kleinen Umsetzungsplan erstellen
4. Nur den naechsten sinnvollen Schritt umsetzen
5. Danach Verifikation und Fortschritt dokumentieren

Ausgabeformat:
- zuerst kurze Analyse
- dann konkrete naechste Schritte
- dann nur die aktuelle kleine Umsetzung
```
