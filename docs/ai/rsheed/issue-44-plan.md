# Issue 44 Plan

## Meta

- Issue: `#44`
- Titel: FR-20 Mitglieder einladen und entfernen
- Besitzer: Rsheed
- Branch: `feature/44/mitglieder-einladen-und-entfernen`
- Status: `in progress`

## Ziel

Release-1-Invite-Flow fuer Raeume:
- Owner kann Mitglieder per E-Mail einladen
- eingeladene Nutzer sehen Einladungen in der App
- eingeladene Nutzer koennen annehmen oder ablehnen
- Owner kann Mitglieder wieder entfernen

## Scope

- Gehoert dazu:
  - In-App-Invite-Flow mit `pending`, `accepted`, `declined`
  - Mitgliederliste im Raumkontext
  - Notifications-Seite fuer Einladungen
  - serverseitige Invite-Logik ueber Supabase Edge Function
- Gehoert nicht dazu:
  - Rollenwechsel ueber `member` hinaus
  - Mailversand / externes Benachrichtigungssystem
  - komplexe Einladungshistorie ausserhalb des aktuellen Raumkontexts

## Akzeptanzkriterien

- Owner kann registrierte Nutzer per E-Mail in einen Raum einladen.
- Eingeladene Nutzer sehen offene Einladungen unter `Einladungen`.
- Einladungen koennen angenommen oder abgelehnt werden.
- Erst bei Annahme entsteht eine Mitgliedschaft in `room_members`.
- Mitglieder koennen vom Owner wieder entfernt werden.
- Mitglieder koennen die Mitgliederliste sehen, aber nichts verwalten.

## Aktueller Stand

- `#37` ist bereits in `main` gemerged.
- `#44` laeuft auf dem Branch `feature/44/mitglieder-einladen-und-entfernen`.
- PR `#71` ist offen.
- Der Branch wurde bereits mit aktuellem `main` synchronisiert und Konflikte wurden aufgeloest.

## Relevante Dateien

- Frontend:
  - `src/pages/Devices.tsx`
  - `src/pages/Notifications.tsx`
  - `src/components/Sidebar.tsx`
  - `src/components/RoomMembers.tsx`
  - `src/services/inviteService.ts`
- Supabase:
  - `supabase/functions/room-invites/index.ts`
  - `supabase/functions/_shared/cors.ts`
  - `sql/room-invites.txt`

## Entscheidungen

- `#44` baut auf dem Rollenmodell aus `#37` auf.
- Einladungen werden fuer Release 1 nur an bereits registrierte Accounts geschickt.
- Invite-Logik liegt nicht im Frontend, sondern in einer Supabase Edge Function.
- Mitgliederliste ist fuer `owner` und `member` sichtbar.
- `member` darf sehen, aber nicht verwalten.
- Offene Einladungen werden direkt in der Mitgliedersektion angezeigt.
- Abgelehnte Einladungen bleiben fuer den Owner sichtbar.
- Abgelehnte Einladungen haben die Aktionen `Erneut senden` und `Loeschen`.
- Der Einstieg in der Sidebar ist nur Text `Einladungen`, ohne Glocken-Icon.
- Der Mitgliederbereich wurde aus `Devices.tsx` in eine eigene Komponente ausgelagert und ist einklappbar.
- Die Raumliste darf Rollen nur aus den Memberships des aktuell eingeloggten Users ableiten.
- Owner-Zeilen zeigen keinen `Entfernen`-Button.

## Umgesetzte Punkte

- Invite-Tabelle `room_invites` fachlich und technisch vorbereitet
- Edge Function `room-invites` fuer:
  - Raum-Mitglieder laden
  - Raum-Einladungen laden
  - Einladung erstellen
  - Einladung erneut senden
  - Einladung loeschen
  - Einladung annehmen
  - Einladung ablehnen
  - Mitglied entfernen
- Frontend-Service fuer Invite-Endpoints umgesetzt
- Notifications-Seite fuer offene Einladungen umgesetzt
- Sidebar-Einstieg `Einladungen` umgesetzt
- Mitgliederbereich im Raumkontext umgesetzt
- Mitgliederliste fuer `owner` und `member` umgesetzt
- Pending- und Declined-Status in der Mitgliedersektion umgesetzt
- `RoomMembers` als eigene Komponente ausgelagert
- Rollenfehler in `/#/rooms` behoben:
  - Raumliste nutzt nur Memberships des aktuellen Users
- unnötigen `Entfernen`-Button bei Owner-Eintraegen entfernt

## Offene Punkte

- finalen manuellen Smoke-Test fuer den aktuellen PR-Stand nochmal komplett durchklicken
- PR-Beschreibung bzw. Review-Kommentare bei Bedarf an den finalen Stand anpassen

## Verifikation

- `npm.cmd run lint`
  - erfolgreich, nur bestehende Warnings in `coverage/lcov-report/*`
- `npx.cmd tsc -b`
  - erfolgreich
- `npm.cmd run build`
  - erfolgreich
- `npm.cmd run test:ci`
  - erfolgreich, `46/46` Tests gruen

## Letzte Beobachtungen

- Ein manueller Fehlerfall wurde behoben:
  - Nach Invite/Accept konnte `/#/rooms` fuer den Owner faelschlich `Mitglied` zeigen.
  - `/#/room/:id` zeigte korrekt weiter `owner`.
  - Ursache war ein zu breiter Fetch aller `room_members` statt nur der Memberships des eingeloggten Users.
- UI-Polish:
  - Owner kann sich nicht entfernen; deshalb wird der Button bei Owner-Eintraegen nicht mehr angezeigt.

## Naechster Schritt

- finalen manuellen Test auf dem aktuellen Branch bestaetigen
- danach committen/pushen bzw. PR `#71` final zum Merge vorbereiten
