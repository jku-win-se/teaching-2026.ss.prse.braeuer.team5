# Issue 37 Plan

## Meta

- Issue: `#37`
- Titel: FR-13 Rollen Eigentuemer und Mitglied
- Besitzer: Rsheed
- Branch: `feature/37/rollen-eigentuemer-und-mitglied`
- Status: `in progress`

## Ziel

Ein klares Rollenmodell fuer Raeume definieren und fuer Release 1 so umsetzen, dass Eigentuemer volle Verwaltungsrechte haben und Mitglieder nur erlaubte Nutzungsrechte erhalten.

## Scope

- Gehoert dazu:
  - fachliche Analyse des Rollenmodells fuer Release 1
  - Einordnung der Abhaengigkeiten zu Auth, Datenmodell, Supabase und UI
  - kleine, reviewbare Umsetzung fuer vorhandene Raum- und Geraeteverwaltung
- Gehoert nicht dazu:
  - frei erfundene RLS-, Auth- oder Rollenlogik
  - Vollausbau eines komplexen Mehrrollen- oder Einladungssystems ueber Release 1 hinaus
  - vollstaendige spaetere Invite-/Mitgliederverwaltung aus `#44`

## Akzeptanzkriterien

- Eigentuemer hat vollen Zugriff.
- Mitglied hat nur Steuerungsrechte.
- Rechte werden fuer den Release-1-MVP sichtbar und konsistent durchgesetzt.

## Repo-Kontext

- Issue-Quelle:
  - GitHub Issue `#37`
- Remote-Stand:
  - `origin/main` am 2026-04-13 aktualisiert und post-merge geprueft
  - `#66` Registrierung und `#67` Login / Logout sind nun in `main` gemerged
  - Build und Tests auf aktuellem `main` sind gruen
- Relevante Doku:
  - `AGENTS.md`
  - `.aidlc-rule-details/inception/requirements-analysis.md`
  - `.aidlc-rule-details/inception/units-of-work.md`
  - `docs/project-roadmap.md`
  - `docs/system-architecture.md`
  - `C:\Git\Praktikum-SE\teaching.ss26.prse.prwiki.braeuer\project\requirements_smarthome_de.md`
  - `C:\Git\Praktikum-SE\teaching.ss26.prse.prwiki.braeuer\slides\PraktikumSE-00-Vorbesprechung_Johannes.pdf`
- Relevanter Code:
  - `src/config/supabaseClient.ts`
  - `src/services/roomService.ts`
  - `src/services/deviceService.ts`
  - `src/pages/Rooms.tsx`
  - `src/pages/Devices.tsx`
  - `src/hooks/useRoomRole.ts`
  - `src/types.ts`
- Relevante SQL-Artefakte:
  - `sql/db-scheme.txt`
  - `sql/functions/create-room-with-member.txt`
- Referenzprojekt zur Inspiration:
  - `C:\Git\JKU\KT-Communication-Engineering\backend\app\api\households.py`
  - `C:\Git\JKU\KT-Communication-Engineering\backend\app\models\core.py`
  - `C:\Git\JKU\KT-Communication-Engineering\frontend\src\pages\HouseholdSettings.jsx`

## Reference Comparison

### Direkt uebernehmbar

- Rollen an Mitgliedschaft koppeln statt global an Benutzer
- sensible Aktionen immer gegen die Rolle pruefen
- Mitgliederliste als eigener UI-Bereich statt verstreut ueber mehrere Seiten
- Owner/Admin darf andere Mitglieder verwalten, normales Mitglied nicht

### Vereinfachen fuer dieses Projekt

- kein eigener Backend-API-Layer wie im Referenzprojekt; hier laeuft die Logik vorerst ueber Frontend + Supabase
- keine Rollenbearbeitung fuer Release 1 ausser der festen Zuordnung `owner` und `member`
- keine erweiterte Haushalts-/Settings-Seite mit vielen Unterfunktionen, sondern kleine raumbezogene Verwaltung

### Nicht direkt uebernehmen

- kompletten Invite-/Accept-/Decline-Flow
- eigene Invite-Tabelle als Startpunkt fuer `#37`
- Admin-Service-Client-Logik fuer Auth-E-Mail-Aufloesung

## Suggested Project Fit

- `src/types.ts`
  - Typen fuer `RoomMembership` und `RoomRole`
- `src/services/roomService.ts`
  - Lesen von Mitgliedschaften und Owner-Vorabpruefungen fuer Raumaktionen
- `src/services/deviceService.ts`
  - Owner-Vorabpruefungen fuer Geraeteverwaltung
- `src/hooks/useRoomRole.ts`
  - kleine wiederverwendbare Rollenabfrage fuer Raumseiten
- `src/pages/Rooms.tsx`
  - Rollenanzeige pro Raum und Owner-only-Verwaltungsaktionen
- `src/pages/Devices.tsx`
  - Geraetesteuerung fuer Mitglieder erlauben, Verwaltungsaktionen aber sperren
- Routing:
  - aktueller Main-Stand verwendet `/room/:id`

## Branch And Commit Convention

- Branch fuer das erste fachliche Issue:
  - `feature/37/rollen-eigentuemer-und-mitglied`
- Zielbranch laut Doku:
  - `develop`
- Praktischer Ist-Stand im Remote:
  - aktuell wird gegen `main` gearbeitet und gemerged
- Commit-Format laut Doku:
  - `#37 [<zeit>] <kurze beschreibung>`
- Beispiel:
  - `#37 [1.0h] add owner and member role checks for room actions`

## Open Questions

- Sollen Mitglieder in Release 1 bestehende Geraete nur steuern und sehen duerfen, aber weder hinzufuegen, umbenennen noch loeschen sowie keine Regeln oder Schedules verwalten?
- Welche Teile der spaeteren serverseitigen Policy-Haertung fuer `rules` und `schedules` sollen noch in Release 1 gezogen werden und welche bleiben als Folgeschritt offen?

## Assumptions

- Das Rollenmodell ist raumbezogen, nicht global pro Benutzer.
- `public.room_members.role` ist die zentrale Stelle fuer die Rollenabbildung.
- Die vorhandene SQL-Datei zeigt nur einen Vorentwurf und noch keine bestaetigte produktive Policy-Struktur.
- Fuer Release 1 ist ein kleines Modell mit genau zwei Rollen realistischer als ein generisches Berechtigungssystem.
- Der aktuelle Auth-Stand aus `#67` ist ausreichend, um einen Benutzer kontextbezogen gegen Raumrollen zu pruefen.
- Die aktuellen RLS-Policies im SQL-Entwurf geben jedem Mitglied noch weitgehend vollen Zugriff auf Raumdaten und passen deshalb noch nicht zum gewuenschten `owner`-/`member`-Schnitt.
- Laut offiziellem Anforderungsdokument bedeutet FR-13 mindestens: `Eigentuemer = vollstaendiger Zugriff`, `Mitglied = nur Steuerung, keine Geraete-/Regelverwaltung`.
- Laut Praktikumsfolien ist Release 1 als MVP mit etwa einem Drittel der User Stories und funktionsfaehiger Demo gedacht; daher ist ein kleiner, demonstrierbarer Rollenschnitt realistischer als ein vollstaendiges Berechtigungssystem.

## Decisions

- Entscheidung: FR-13 aus dem offiziellen Requirements-Dokument als fachliche Leitplanke verwenden und nicht neu interpretieren.
  Grund: Dort ist bereits explizit festgelegt, dass Mitglieder nur Steuerung und keine Geraete-/Regelverwaltung haben.

- Entscheidung: Fuer Release 1 schliesst "keine Verwaltung" auch die bestehende Raumverwaltung ein.
  Grund: Vom Nutzer bestaetigt; das passt zum aktuellen UI mit Raum-Bearbeiten und Raum-Loeschen als Verwaltungsaktionen.

- Entscheidung: Fuer den aktuellen Release-1-Schnitt die Rolleninformation im Service-Layer aus `room_members` laden und im UI ueber einen kleinen Hook konsumieren.
  Grund: Das haelt die Aenderung klein, wiederverwendbar und kompatibel mit der bestehenden Hook-Struktur.

- Entscheidung: Den MVP jetzt mit UI-Gating plus service-seitigen Vorabpruefungen auf Basis von Supabase-Daten umsetzen.
  Grund: Vom Nutzer priorisierter MVP-Schnitt; echte vollstaendige Policy-Haertung in Supabase bleibt wichtig, ist aber nicht vollstaendig aus dem laufenden Frontend-Branch heraus ausrollbar.

- Entscheidung: Rollenlogik, Mitgliederverwaltung und Invite-Flow konzeptionell getrennt behandeln.
  Grund: Das Referenzprojekt zeigt, dass diese Trennung die Komplexitaet reduziert und spaetere Erweiterungen leichter macht.

## Plan

1. Rollenverhalten fuer Release 1 fachlich festziehen
2. betroffene Aktionen im bestehenden UI und Service-Layer absichern
3. MVP-Rollenschnitt im Frontend und im datengetriebenen Service-Layer umsetzen
4. Build und Tests pruefen
5. Restpunkte fuer spaetere Supabase-Haertung explizit dokumentieren

## Proposed Units Of Work

1. Rolleninformationen aus `room_members` fuer die aktuelle Session laden
2. Raumliste um Rollenanzeige und Owner-only-Verwaltungsaktionen erweitern
3. Geraeteseite fuer Mitglieder auf Steuerung beschraenken
4. Schreiboperationen im Service-Layer vor Raum-/Geraeteverwaltung gegen `owner` pruefen
5. Verhalten manuell sowie per Build und Tests pruefen

## Progress

### Erledigt

- Workflow-Dateien gemaess AI-DLC gelesen
- Release-1-Milestone und aktuelle Issue-Staende aus GitHub verifiziert
- Issue `#37` als offen und an `RsheedAlo` zugewiesen bestaetigt
- aktuellen `main` nach Merge von `#66` und `#67` geprueft
- vorhandene Rollenansaetze im SQL-Schema und in `create_room_with_member` identifiziert
- festgestellt, dass der aktuelle Main-Stand nun Login/Register und `useAuth` enthaelt
- festgestellt, dass der aktuelle Main-Stand Routing ueber `/room/:id` verwendet
- Referenzprojekt fuer Rollen- und Mitgliederverwaltung analysiert
- offizielles Requirements-Dokument aus dem PRWiki-Projekt gesichtet
- Praktikumsfolien zur Einordnung von Release-1-MVP und Sprintzielen gesichtet
- Nutzerantworten fuer Release 1 eingearbeitet:
  - Raumverwaltung zaehlt ebenfalls zu verbotener Verwaltung fuer Mitglieder
  - Supabase bleibt primaere fachliche Leitlinie fuer Rechte
  - MVP-Schnitt ist wichtiger als vollstaendige Abdeckung aller spaeteren Tabellen
  - Supabase-Aenderungen duerfen nur nach vorheriger Erklaerung der konkreten Aenderung und ihrer Auswirkung ausgefuehrt werden
- implementiert:
  - `RoomRole` / `RoomMembership` in `src/types.ts`
  - `fetchRoomRole()` und membership-basierte Raumliste in `src/services/roomService.ts`
  - Owner-Vorabpruefungen fuer Raum- und Geraeteverwaltung in `src/services/roomService.ts` und `src/services/deviceService.ts`
  - `useRoomRole()` in `src/hooks/useRoomRole.ts`
  - Rollenanzeige und Owner-only-Aktionen in `src/pages/Rooms.tsx`
  - Owner-only-Geraeteverwaltung bei gleichzeitiger Beibehaltung der Geraetesteuerung fuer Mitglieder in `src/pages/Devices.tsx`, `src/components/DeviceCard.tsx` und `src/components/DeviceTypeSidebar.tsx`
- Verifikation auf dem geaenderten Branch:
  - `npm.cmd run build` bestanden
  - `npm.cmd run test -- --run` bestanden

### Offen

- manuelle App-Pruefung mit mindestens einem Owner und einem Mitglied gegen die echte Supabase-Datenlage
- Entscheidung, ob noch ein separater SQL-/Supabase-Haertungsschritt fuer Release 1 notwendig ist

### Blocker

- kein technischer Blocker mehr im Branch
- fuer echte systemweite Erzwingung bleibt ein moeglicher Folgepunkt auf der Supabase-Policy-Seite offen

## Verification

- Typecheck: ueber `npm.cmd run build` indirekt geprueft
- Lint: nicht ausgefuehrt
- Build: bestanden auf `feature/37/rollen-eigentuemer-und-mitglied` mit `npm.cmd run build`
- Tests: bestanden auf `feature/37/rollen-eigentuemer-und-mitglied` mit `npm.cmd run test -- --run`
- Manuelle Pruefung: Repository, SQL-Dateien, GitHub-Issue und sichtbarer App-Stand geprueft

## Next Step

Den geaenderten Branch lokal in der App als Owner und Mitglied pruefen und danach entscheiden, ob fuer Release 1 noch ein separater SQL-/Supabase-Haertungsschritt noetig ist oder als Folgethema dokumentiert wird.
