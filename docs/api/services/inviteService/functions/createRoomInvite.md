[**team5-smart-home**](../../../README.md)

***

[team5-smart-home](../../../README.md) / [services/inviteService](../README.md) / createRoomInvite

# Function: createRoomInvite()

> **createRoomInvite**(`roomId`, `email`): `Promise`\<`unknown`\>

Defined in: [services/inviteService.ts:130](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/services/inviteService.ts#L130)

Erstellt eine neue Einladung und sendet sie an die angegebene E-Mail-Adresse.
Schreibt einen Aktivitäts-Log-Eintrag.

## Parameters

### roomId

`string`

UUID des Raums.

### email

`string`

E-Mail-Adresse des Einzuladenden.

## Returns

`Promise`\<`unknown`\>

Antwort der Edge Function.
