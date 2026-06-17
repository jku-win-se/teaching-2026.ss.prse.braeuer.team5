[**team5-smart-home**](../../../README.md)

***

[team5-smart-home](../../../README.md) / [services/roomService](../README.md) / fetchRoomRole

# Function: fetchRoomRole()

> **fetchRoomRole**(`roomId`, `userId`): `Promise`\<[`RoomRole`](../../../types/type-aliases/RoomRole.md) \| `null`\>

Defined in: [services/roomService.ts:43](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/services/roomService.ts#L43)

Gibt die Rolle eines Nutzers in einem bestimmten Raum zurück.

## Parameters

### roomId

`string`

UUID des Raums.

### userId

`string` \| `undefined`

UUID des Nutzers.

## Returns

`Promise`\<[`RoomRole`](../../../types/type-aliases/RoomRole.md) \| `null`\>

`"owner"` oder `"member"` oder `null` wenn keine Mitgliedschaft besteht.
