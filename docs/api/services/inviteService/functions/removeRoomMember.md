[**team5-smart-home**](../../../README.md)

***

[team5-smart-home](../../../README.md) / [services/inviteService](../README.md) / removeRoomMember

# Function: removeRoomMember()

> **removeRoomMember**(`roomId`, `memberUserId`): `Promise`\<`unknown`\>

Defined in: [services/inviteService.ts:154](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/services/inviteService.ts#L154)

Entfernt ein Mitglied aus einem Raum.
Schreibt einen Aktivitäts-Log-Eintrag.

## Parameters

### roomId

`string`

UUID des Raums.

### memberUserId

`string`

UUID des zu entfernenden Mitglieds.

## Returns

`Promise`\<`unknown`\>

Antwort der Edge Function.
