# Tool - GitHub Actions

## 1. Einleitung *(~1 min)*

### Was ist das Tool und wofür wird es eingesetzt?

= ein Automatisierungs- und CI/CD-Tool, das in GitHub integriert ist.
Wenn bestimmte Ereignisse im Repository passieren, werden Workflows automatisch ausgeführt. Beispielsweise Code in das Repository pushen, Erstellen eines Pull Requests oder das Erstellen eines Releases. Ein Workflow besteht aus Jobs und Steps, die in einer Cloud-Umgebung ausgeführt werden (Bauen und Testen von Code, Deployen von Anwendungen).

### Warum ist es für unser Projekt relevant?

GitHub Actions hilft uns den Entwicklungsprozess zu automatisieren. Konkret könnte man es nutzen für automatische Tests beim Upload von Code, Build-Prozesse der Anwendung oder Qualitätskontrollen zur frühen Fehlererkennung.

## 2. Kernkonzepte *(~2 min)*

GitHub Actions ist eine Plattform für Continuous Integration und Continuous Delivery (CI/CD).

CI/CD bedeutet unter anderem:
- Code wird automatisch gebaut (Build)
- Automatisierte Tests überprüfen die Funktionalität
- Software kann automatisch veröffentlicht oder bereitgestellt werden (Deployment)

Grundstruktur von GitHub Actions

Event → Workflow → Job → Step → Action

1. Event
Alles beginnt mit einem Ereignis (Event) im Repository, zum Beispiel:
- Push eines Commits
- Pull Request
- Manuell gestarteter Workflow

Dieses Event startet einen Workflow.

2. Workflow
Ein Workflow ist ein automatisierter Prozess, der beschreibt, welche Aufgaben
ausgeführt werden sollen (z.B. Build, Tests oder Deployment).

Workflows werden im Repository im Ordner gespeichert:
.github/workflows

Sie werden in einer YAML-Datei definiert. YAML ist ein leicht lesbares
Konfigurationsformat.

3. Jobs
Ein Workflow besteht aus einem oder mehreren Jobs.
Ein Job enthält zusammengehörige Aufgaben wie:
- Build
- Tests
- Deployment

Jobs laufen dabei auf sogenannten Runnern (virtuellen Maschinen).

GitHub stellt dafür Runner bereit:
- Linux
- Windows
- macOS

4. Steps
Ein Job besteht aus mehreren Steps (Arbeitsschritten).
Diese beschreiben konkret, was ausgeführt wird, zum Beispiel:
- Repository herunterladen
- Abhängigkeiten installieren
- Code kompilieren
- Tests ausführen

5. Actions
Actions sind wiederverwendbare Automatisierungsbausteine,
die in Steps verwendet werden können.

Beispiele:
- Repository-Code herunterladen
- Programmiersprache einrichten
- Dateien oder Ergebnisse hochladen

Zusammenfassung

1. Ein Entwickler pusht Code in das Repository
2. Ein Event startet automatisch einen Workflow
3. GitHub startet einen Runner (virtuelle Maschine)
4. Jobs und Steps werden ausgeführt
5. Build, Tests oder Deployments laufen automatisch

## 4. Live-Demo *(~4 min)*

### Typischer Workflow Schritt für Schritt

### Häufig verwendete Befehle / Funktionen

### Integration in das Projekt

## 5. Vor- und Nachteile *(~1 min)*

### Stärken des Tools

- Integration in GitHub - dadurch können Workflows leicht mit dem Code verknüpft werden

- Automatisierung von Entwicklungsprozessen - für wiederkehrende Aufgaben wie Tests, Build und Deployments

- Flexible Workflows - flexible Gestaltung bei z.B. jedem Commit, Pull Request, bestimmten Zeitpunkten oder Events

- Große Community und bereits vorhandene Actions

### Bekannte Einschränkungen oder Alternativen

- Laufzeitlimits - Jobs haben begrenzte Laufzeiten und Ressourcen

- Komplexität bei großen Pipelines - schwere Wartung

- Abhängigkeit von GitHub - beste Arbeitsweise bei ausschließlicher Arbeit auf GitHub

- Alternativen - Jenkins, GitLab CI/CD, CircleCI

## 6. Zusammenfassung & Fragen *(~1 min)*

### Die drei wichtigsten Takeaways

- Automatisierung vom Entwicklungsworkflow - Buiöd, Tests und Deployments

- Qualitätsverbesserung des Projektes - frühe Erkennung von Fehlern

- Beschleunigung von Updates und Weiterentwicklung - schnellere Integration und Veröffentlichung

### Weiterführende Ressourcen / Dokumentation

- Offizielle Dokumentation - https://docs.github.com/de/actions 

- Tutorials von GitHub - https://docs.github.com/en/actions/tutorials 

- diverse YouTube Tutorials
