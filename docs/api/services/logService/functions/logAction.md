[**team5-smart-home**](../../../README.md)

***

[team5-smart-home](../../../README.md) / [services/logService](../README.md) / logAction

# Function: logAction()

> **logAction**(`payload`): `Promise`\<`void`\>

Defined in: [services/logService.ts:10](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/services/logService.ts#L10)

Schreibt einen Aktivitätseintrag in die `activity_logs`-Tabelle.
Wird von allen Services nach zustandsändernden Operationen aufgerufen.

## Parameters

### payload

`Omit`\<[`ActivityLog`](../../../types/interfaces/ActivityLog.md), `"id"` \| `"created_at"`\>

Log-Daten ohne `id` und `created_at` (werden von der DB gesetzt).

## Returns

`Promise`\<`void`\>
