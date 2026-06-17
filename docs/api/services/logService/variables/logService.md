[**team5-smart-home**](../../../README.md)

***

[team5-smart-home](../../../README.md) / [services/logService](../README.md) / logService

# Variable: logService

> `const` **logService**: `object`

Defined in: [services/logService.ts:23](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/services/logService.ts#L23)

Service-Objekt für Lesen, Abonnieren und Exportieren von Aktivitäts-Logs.

## Type Declaration

### exportToCSV()

> **exportToCSV**(): `Promise`\<`void`\>

Exportiert alle Aktivitäts-Logs als CSV-Datei (UTF-8 mit BOM für Excel).
Spalten: Zeitpunkt, Objekt-Typ, Objekt-ID, Aktion, Details, Akteur.

#### Returns

`Promise`\<`void`\>

### fetchLogs()

> **fetchLogs**(`limit?`): `Promise`\<[`ActivityLog`](../../../types/interfaces/ActivityLog.md)[]\>

Lädt die neuesten Aktivitäts-Logs, absteigend nach Erstellungsdatum sortiert.

#### Parameters

##### limit?

`number` = `50`

Maximale Anzahl zurückgegebener Einträge (Standard: 50).

#### Returns

`Promise`\<[`ActivityLog`](../../../types/interfaces/ActivityLog.md)[]\>

Array von [ActivityLog](../../../types/interfaces/ActivityLog.md)-Objekten.

### subscribeToLogs()

> **subscribeToLogs**(`onNewLog`): `RealtimeChannel` \| `null`

Abonniert Echtzeit-Inserts in `activity_logs` via Supabase Realtime.

#### Parameters

##### onNewLog

(`log`) => `void`

Callback, der bei jedem neuen Log-Eintrag aufgerufen wird.

#### Returns

`RealtimeChannel` \| `null`

Der Supabase-Channel (zum Abbestellen via `supabase.removeChannel`)
         oder `null` wenn Supabase nicht konfiguriert ist.
