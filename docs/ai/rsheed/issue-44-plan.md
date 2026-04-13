# Issue 44 Plan

## Meta

- Issue: `#44`
- Titel: FR-20 Mitglieder einladen und entfernen
- Besitzer: Rsheed
- Branch: `feature/44/mitglieder-einladen-und-entfernen`
- Status: `in progress`

## Ziel

Fuer Raeume einen echten Invite-Flow vorbereiten, damit Eigentuemer weitere Personen per E-Mail einladen, Einladungen in einer Glocke sichtbar werden, eingeladene Nutzer annehmen oder ablehnen koennen und Zugriffe spaeter wieder entzogen werden koennen.

## Scope

- Gehoert dazu:
  - fachliche Analyse von Einladung und Entfernen fuer Release 1
  - Einordnung gegen bestehendes Rollenmodell, Auth-Flow und Datenmodell
  - Ableitung einer kleinen, aber echten Invite-/Accept-/Decline-Reihenfolge nach `#37`
- Gehoert nicht dazu:
  - Implementierung ohne bestaetigtes Rollen- und Auth-Verhalten
  - unsichere Admin-Logik direkt im Frontend
  - komplexe Team-, Gruppen- oder mehrstufige Onboarding-Flows ueber den Raum-/Invite-Kern hinaus

## Akzeptanzkriterien

- Einladung per E-Mail ist moeglich.
- Zugriff kann entzogen werden.
- Rolle Mitglied wird zugewiesen.

## Repo-Kontext

- Issue-Quelle:
  - GitHub Issue `#44`
- Remote-Stand:
  - `origin/main` am 2026-04-13 aktualisiert und post-merge geprueft
  - `#66` Registrierung und `#67` Login / Logout sind nun in `main` gemerged
  - Build und Tests auf aktuellem `main` sind gruen
  - `#37` wurde lokal bereits auf einem vorgelagerten Feature-Branch umgesetzt und verifiziert, aber noch nicht nach `main` gemerged
- Relevante Doku:
  - `AGENTS.md`
  - `.aidlc-rule-details/inception/requirements-analysis.md`
  - `.aidlc-rule-details/inception/units-of-work.md`
  - `C:\Git\Praktikum-SE\teaching.ss26.prse.prwiki.braeuer\project\requirements_smarthome_de.md`
  - `C:\Git\Praktikum-SE\teaching.ss26.prse.prwiki.braeuer\slides\PraktikumSE-00-Vorbesprechung_Johannes.pdf`
- Relevanter Code:
  - `src/config/supabaseClient.ts`
  - `src/services/roomService.ts`
  - `src/pages/Rooms.tsx`
  - `src/pages/Devices.tsx`
  - `src/types.ts`
- Relevante SQL-Artefakte:
  - `sql/db-scheme.txt`
  - `sql/functions/create-room-with-member.txt`
- Aktueller Supabase-Strukturstand im Repo:
  - es gibt derzeit noch keine eingecheckte `supabase/functions/`-Struktur fuer Edge Functions
- Referenzprojekt zur Inspiration:
  - `C:\Git\JKU\KT-Communication-Engineering\backend\app\api\households.py`
  - `C:\Git\JKU\KT-Communication-Engineering\backend\app\models\core.py`
  - `C:\Git\JKU\KT-Communication-Engineering\frontend\src\pages\HouseholdSettings.jsx`
  - `C:\Git\JKU\KT-Communication-Engineering\supabase\migrations\20260412090000_create_household_invites.sql`

## Reference Comparison

### Direkt uebernehmbar

- Mitgliederverwaltung als eigener, klarer UI-Bereich
- Owner/Admin-only-Pruefung fuer Invite, Rollenwechsel und Entfernen
- Mitgliederliste mit sichtbarer Rolle pro Person
- Schutzregeln wie "nicht sich selbst entfernen" als explizite Fachregel
- kleine Inline-Eingabe fuer E-Mail plus `+`-Aktion ist als UI-Muster passend
- Mitgliedersektion direkt im Kontext eines konkreten Haushalts/Raums statt globaler Benutzerverwaltung

### Vereinfachen fuer dieses Projekt

- Einladung immer nur mit Zielrolle `member`
- keine Rollenwechsel in `#44`
- kein vollwertiges Benachrichtigungssystem jenseits der Invite-Glocke
- keine Rollenwechsel in `#44`; Rolle bleibt beim Hinzufuegen fest `member`
- keine separate Settings-Seite; fuer Release 1 ist eine kleine Sektion in der bestehenden Raum-/Geraeteseite plus eine einfache Notifications-Seite realistischer

### Nicht direkt uebernehmen

- Supabase-Admin-Invite per E-Mail direkt aus dem Frontend
- Versandlogik mit `email_delivery_status`

## Suggested Project Fit

- `src/types.ts`
  - Typen fuer `RoomMember` und eventuell `RoomInvite` nur dann, wenn spaeter wirklich noetig
- `src/services/roomService.ts`
  - Funktionen fuer Mitgliederliste laden und spaeter Mitglied entfernen
- UI-Struktur:
  - kleine Mitgliedersektion an einem Raum
  - zusaetzlich Glocke / Notifications-Einstieg
  - moeglicher neuer Pfad: `src/pages/Notifications.tsx`
- vorhandene Seiten:
  - `src/pages/Devices.tsx` oder spaeter eigene Raumdetails fuer Mitgliedsverwaltung
  - `src/components/Sidebar.tsx` fuer Glocke / Pending-Hinweis
- Service-/Architekturbedarf:
  - sichere serverseitige Invite-Logik ausserhalb des Frontends
  - entweder Supabase Edge Function oder sichere DB-/RPC-Loesung
- Routing:
  - aktueller Main-Stand verwendet `/room/:id`

## Branch And Commit Convention

- Branch fuer das nachgelagerte zweite fachliche Issue:
  - `feature/44/mitglieder-einladen-und-entfernen`
- Zielbranch laut Doku:
  - `develop`
- Praktischer Ist-Stand im Remote:
  - aktuell wird gegen `main` gearbeitet und gemerged
- Commit-Format laut Doku:
  - `#44 [<zeit>] <kurze beschreibung>`
- Beispiel:
  - `#44 [1.0h] add room member management section`

## Open Questions

- Soll der aktuelle Release-1-Invite-Flow spaeter noch von "nur bestehende Accounts" auf "auch noch nicht registrierte E-Mail-Adressen" erweitert werden?
- Brauchen wir fuer Release 1 bereits aktive Ablaufpruefung fuer `expires_at` oder reicht zunaechst ein dauerhafter `pending`-Status?

## Assumptions

- `#44` baut fachlich auf `#37` auf und sollte nicht vor dem Rollenmodell umgesetzt werden.
- Die Tabelle `room_members` ist auch hier die zentrale technische Grundlage.
- Fuer Release 1 ist ein kleiner echter Invite-Flow mit Pending-Status moeglich, wenn wir den serverseitigen Teil klar begrenzen.
- Der aktuelle Auth-Stand aus `#67` reicht aus, um Mitgliederverwaltung benutzerbezogen zu bauen.
- Im aktuellen Projekt gibt es noch keine Hooks, Services oder UI-Komponenten fuer `room_members`.
- Laut offiziellem Anforderungsdokument ist die fachliche Mindestforderung von FR-20: Eigentuemer kann weitere Mitglieder per E-Mail-Adresse einladen und den Zugang jederzeit widerrufen.
- Laut Requirements-Dokument sind Echtzeit-Push-Benachrichtigungen per SMS oder E-Mail nicht Teil des Projektumfangs; eine In-App-Glocke ist davon aber nicht ausgeschlossen.
- Laut Praktikumsfolien ist Release 1 als MVP mit etwa einem Drittel der User Stories und lauffaehiger Demo gedacht; das stuetzt eine kleine, demonstrierbare Invite-/Mitgliederverwaltungsvariante.

## Decisions

- Entscheidung: `#44` als nachgelagertes Issue zu `#37` behandeln.
  Grund: Das Issue selbst nennt FR-13 als Aufbaupunkt und benoetigt zuerst klares Rollenverhalten.

- Entscheidung: `#44` vorerst als gestapelten Branch auf Basis von `feature/37/rollen-eigentuemer-und-mitglied` beginnen.
  Grund: Der aktuelle Mitgliederverwaltungsstand baut direkt auf der lokalen, bereits verifizierten Rollenlogik aus `#37` auf.

- Entscheidung: Den Release-1-Scope konservativ bewerten.
  Grund: Echte Einladungs-E-Mails, Statusverwaltung und sichere Rechteuebernahme betreffen Auth, Supabase und Datenmodell gleichzeitig.

- Entscheidung: `#44` wird als echter Invite-Flow mit Glocke und Accept/Decline weitergeschnitten.
  Grund: Vom Nutzer ausdruecklich so gewuenscht; das passt auch fachlich gut zu FR-20.

- Entscheidung: Das Referenzprojekt dient fuer `#44` jetzt als direkte Strukturvorlage.
  Grund: Dort sind Invite-Tabelle, Pending-Status, Glocke und Accept/Decline bereits sauber getrennt modelliert.

- Entscheidung: Keine Admin-/Service-Role-Logik direkt im Frontend.
  Grund: Sicherheitsrelevant; Invite-Erzeugung und sensible Nutzerauflosung muessen serverseitig passieren.

- Entscheidung: Fuer Release 1 den Invite-Flow moeglichst klein, aber echt schneiden.
  Grund: Ziel ist nicht Vollausbau, sondern ein demonstrierbarer In-App-Flow: Einladung anlegen, Glocke sehen, annehmen/ablehnen, Mitglied entfernen.

- Entscheidung: Fuer `#44` eine neue kleine Supabase-Edge-Function-Struktur im Repo einfuehren.
  Grund: Der aktuelle Repo-Stand hat noch keine serverseitige Invite-Schicht; fuer sicheren Invite-Flow braucht es einen klaren Ort dafuer.

- Entscheidung: Edge Functions sind die bestaetigte serverseitige Form fuer den Invite-Flow.
  Grund: Vom Nutzer bestaetigt; das passt am besten zur benoetigten sicheren Serverlogik ohne Admin-Zugriff im Frontend.

- Entscheidung: Owner sollen sich in `#44` nicht selbst entfernen koennen.
  Grund: Das Referenzprojekt nutzt dieselbe Schutzregel, und sie verhindert unnoetige Inkonsistenzen im Raumzugriff.

- Entscheidung: Der Release-1-Invite-Flow soll komplett als In-App-Flow mit `pending`, `accept` und `decline` gedacht werden, auch wenn echter Mailversand spaeter folgen kann.
  Grund: Vom Nutzer gewuenschter Funktionskern; Glocke und Decisions sind Teil der Zieldefinition.

- Entscheidung: Die erste technische Umsetzung von `#44` laedt nur bestehende registrierte Accounts ein.
  Grund: Das ist fuer Release 1 kleiner, sicherer und passt zur Edge-Function-Pruefung per bestehendem Auth-User.

## Plan

1. Invite-Datenmodell und Edge-Function-Grenzen festziehen
2. Frontend-Einbaupunkte fuer Raumkontext, Glocke und Notifications bestimmen
3. Construction-Reihenfolge in kleine reviewbare Schritte schneiden
4. erst nach letzter menschlicher Bestaetigung in Construction wechseln

## Proposed Units Of Work

1. SQL-Datenmodell fuer `room_invites` plus minimale Regeln festlegen
2. Edge Function `create-room-invite` fuer Owner-only-Einladung per E-Mail vorsehen
3. Edge Functions `accept-room-invite` und `decline-room-invite` vorsehen
4. Frontend-Service fuer Invite-Fetch/Create/Accept/Decline definieren
5. Sidebar um Glocke/Pending-Count erweitern
6. Notifications-Seite fuer offene Einladungen ergaenzen
7. Raumkontext um Mitgliederliste und Entfernen erweitern
8. Verhalten manuell und per Build/Test pruefen

## Progress

### Erledigt

- Workflow-Dateien gemaess AI-DLC gelesen
- Release-1-Milestone und aktuelle Issue-Staende aus GitHub verifiziert
- Issue `#44` als offen und an `RsheedAlo` zugewiesen bestaetigt
- aktuellen `main` nach Merge von `#66` und `#67` geprueft
- bestehenden Datenmodellansatz `room_members` und owner-Anlage beim Raum-Erstellen identifiziert
- festgestellt, dass es im Frontend noch keine UI fuer Mitgliederverwaltung, Benutzerliste oder Einladungen gibt
- festgestellt, dass der aktuelle Main-Stand nun Login/Register und `useAuth` enthaelt
- Referenzprojekt fuer Mitglieder-, Rollen- und Invite-Flow analysiert
- offizielles Requirements-Dokument aus dem PRWiki-Projekt gesichtet
- Praktikumsfolien zur Einordnung von Release-1-MVP und Sprintzielen gesichtet
- Branch `feature/44/mitglieder-einladen-und-entfernen` von aktuellem `#37`-Stand erstellt
- manuellen Sichttest mit laufender App festgehalten:
  - keine sichtbare Mitgliederliste pro Raum
  - keine Invite-Eingabe und keine Rolle pro Person in der UI sichtbar
  - Raumverwaltung ist vorhanden, aber noch ohne Besitzer-/Mitgliedsbezug
- Post-Merge-Verifikation auf `main` festgehalten:
  - `npm.cmd run build` bestanden
  - `npm.cmd run test -- --run` bestanden
- bestaetigt, dass die aktuelle Codebasis fuer Mitgliederverwaltung noch keinen separaten Frontend- oder Service-Baustein enthaelt
- Referenzprojekt genauer auf Invite-Flow, Glocke, Accept/Decline und Mitgliederseite gegen `#44` abgeglichen
- bestaetigt, dass im aktuellen Repo noch keine bestehende Edge-Function-Struktur vorhanden ist
- Edge Function als serverseitige Architektur fuer `#44` bestaetigt
- konkrete Construction-Reihenfolge fuer Invite-Tabelle, Edge Functions, Glocke und Notifications abgeleitet
- erste Construction fuer `#44` begonnen
- SQL-Artefakt `sql/room-invites.txt` fuer Invite-Tabelle vorbereitet
- Edge Function `supabase/functions/room-invites/index.ts` fuer create/list/accept/decline/remove angelegt
- Frontend-Service `src/services/inviteService.ts` fuer den Edge-Function-Aufruf angelegt
- Sidebar um Glocke und Pending-Count erweitert
- Notifications-Seite fuer offene Einladungen angelegt
- Mitgliedersektion in `src/pages/Devices.tsx` fuer Owner eingebaut
- erste Invite-Flow-Tests fuer Sidebar/Notifications hinzugefuegt

### Offen

- pruefen, ob fuer Release 1 noch eine SQL-Unique-Absicherung fuer offene Invites noetig ist
- Supabase-Seite fuer `room_invites` und Edge Function wirklich anlegen/deployen
- manuelle Invite-Demo mit zwei Accounts durchklicken

### Blocker

- kein aktueller fachlicher Blocker
- Abhaengigkeit zu `#37` Rollenmodell bleibt bestehen

## Verification

- Typecheck: implizit ueber `npm.cmd run build` bestanden
- Lint: bestanden mit `npm.cmd run lint`
- Build: bestanden mit `npm.cmd run build`
- Tests: bestanden mit `npm.cmd run test -- --run`
- Manuelle Pruefung: Repository, SQL-Dateien, GitHub-Issue, sichtbarer App-Stand und Referenzprojekt geprueft; Invite-Flow in Supabase noch offen

## Next Step

Vor einer echten Demo den Supabase-Teil bewusst freigeben und ausrollen:
- `room_invites` in Supabase anlegen
- Edge Function `room-invites` deployen
- danach Invite-Flow manuell mit Owner-/Member-Accounts pruefen
