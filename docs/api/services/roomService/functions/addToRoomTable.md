[**team5-smart-home**](../../../README.md)

***

[team5-smart-home](../../../README.md) / [services/roomService](../README.md) / addToRoomTable

# Function: addToRoomTable()

> **addToRoomTable**(`roomName`): `Promise`\<`string` \| `null`\>

Defined in: [services/roomService.ts:186](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/services/roomService.ts#L186)

Erstellt einen neuen Raum und setzt den aktuellen Nutzer als Owner.
Verwendet die Supabase-RPC `create_room_with_member`.

## Parameters

### roomName

`string`

Anzeigename des neuen Raums.

## Returns

`Promise`\<`string` \| `null`\>

UUID des neu erstellten Raums oder `null` bei Fehler.
