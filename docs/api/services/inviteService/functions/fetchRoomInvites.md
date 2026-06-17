[**team5-smart-home**](../../../README.md)

***

[team5-smart-home](../../../README.md) / [services/inviteService](../README.md) / fetchRoomInvites

# Function: fetchRoomInvites()

> **fetchRoomInvites**(`roomId`): `Promise`\<[`RoomInvite`](../../../types/type-aliases/RoomInvite.md)[]\>

Defined in: [services/inviteService.ts:119](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/services/inviteService.ts#L119)

Lädt alle Einladungen für einen bestimmten Raum (alle Status).

## Parameters

### roomId

`string`

UUID des Raums.

## Returns

`Promise`\<[`RoomInvite`](../../../types/type-aliases/RoomInvite.md)[]\>

Array von [RoomInvite](../../../types/type-aliases/RoomInvite.md)-Objekten.
