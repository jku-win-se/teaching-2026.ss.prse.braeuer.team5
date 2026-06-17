[**team5-smart-home**](../../README.md)

***

[team5-smart-home](../../README.md) / [types](../README.md) / Room

# Type Alias: Room

> **Room** = `object`

Defined in: [types.ts:75](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L75)

Repräsentiert einen Smart-Home-Raum.

## Properties

### created\_at?

> `optional` **created\_at?**: `string` \| `null`

Defined in: [types.ts:81](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L81)

ISO-Zeitstempel der Erstellung (von Supabase gesetzt).

***

### id

> **id**: `string`

Defined in: [types.ts:77](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L77)

Eindeutige UUID des Raums.

***

### name

> **name**: `string`

Defined in: [types.ts:79](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L79)

Anzeigename des Raums.

***

### role?

> `optional` **role?**: [`RoomRole`](RoomRole.md)

Defined in: [types.ts:83](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L83)

Rolle des aktuellen Nutzers in diesem Raum (clientseitig befüllt).
