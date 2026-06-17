[**team5-smart-home**](../../../README.md)

***

[team5-smart-home](../../../README.md) / [services/roomService](../README.md) / updateRoomInTable

# Function: updateRoomInTable()

> **updateRoomInTable**(`roomId`, `newName`): `Promise`\<`boolean`\>

Defined in: [services/roomService.ts:146](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/services/roomService.ts#L146)

Benennt einen Raum um (nur für Owner). Schreibt einen Aktivitäts-Log-Eintrag.

## Parameters

### roomId

`string`

UUID des Raums.

### newName

`string`

Neuer Anzeigename.

## Returns

`Promise`\<`boolean`\>

`true` bei Erfolg, `false` bei fehlendem Owner-Recht oder DB-Fehler.
