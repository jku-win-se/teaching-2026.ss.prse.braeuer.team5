# Benutzerdokumentation

## Zielgruppe

Die Anwendung richtet sich an Benutzerinnen und Benutzer, die virtuelle Smart-Home-Geraete in einer gemeinsamen Oberflaeche verwalten und steuern wollen.

## Installation und Start

1. Node.js 22 und npm 11 installieren.
2. Repository im Terminal oeffnen.
3. `npm ci` ausfuehren.
4. `.env.example` nach `.env` kopieren und bei Bedarf Supabase-Werte eintragen.
5. `npm run dev` starten.

## Aktuelle Oberflaeche

- `Dashboard`: Ueberblick ueber Verbindungsstatus und Beispielgeraete
- `Devices`: Platzhalter fuer Raum- und Geraeteverwaltung
- `Simulator`: Platzhalter fuer spaetere Tagesablauf-Simulation

## Demo-Szenario fuer morgen

1. Anwendung starten
2. Dashboard oeffnen
3. Navigationswechsel zu Devices
4. Rueckkehr zum Dashboard
5. Erklaeren, wo Supabase und die End-to-End-Funktion als Naechstes angebunden werden

## Bekannte Einschraenkungen

- Login ist noch nicht implementiert.
- Es werden aktuell Platzhalterdaten angezeigt.
- Die Supabase-Anbindung ist vorbereitet, aber noch nicht produktiv genutzt.
