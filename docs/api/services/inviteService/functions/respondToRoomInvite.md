[**team5-smart-home**](../../../README.md)

***

[team5-smart-home](../../../README.md) / [services/inviteService](../README.md) / respondToRoomInvite

# Function: respondToRoomInvite()

> **respondToRoomInvite**(`inviteId`, `action`): `Promise`\<`unknown`\>

Defined in: [services/inviteService.ts:219](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/services/inviteService.ts#L219)

Nimmt eine Einladung an oder lehnt sie ab.
Schreibt einen Aktivitäts-Log-Eintrag.

## Parameters

### inviteId

`string`

UUID der Einladung.

### action

`"accept"` \| `"decline"`

`"accept"` um beizutreten, `"decline"` um abzulehnen.

## Returns

`Promise`\<`unknown`\>

Antwort der Edge Function.
