[**team5-smart-home**](../../../README.md)

***

[team5-smart-home](../../../README.md) / [services/roomService](../README.md) / deleteRoomFromTable

# Function: deleteRoomFromTable()

> **deleteRoomFromTable**(`roomId`): `Promise`\<`boolean`\>

Defined in: [services/roomService.ts:106](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/services/roomService.ts#L106)

Löscht einen Raum (nur für Owner). Schreibt einen Aktivitäts-Log-Eintrag.

## Parameters

### roomId

`string`

UUID des zu löschenden Raums.

## Returns

`Promise`\<`boolean`\>

`true` bei Erfolg, `false` bei fehlendem Owner-Recht oder DB-Fehler.
