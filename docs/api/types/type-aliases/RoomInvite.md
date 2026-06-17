[**team5-smart-home**](../../README.md)

***

[team5-smart-home](../../README.md) / [types](../README.md) / RoomInvite

# Type Alias: RoomInvite

> **RoomInvite** = `object`

Defined in: [types.ts:113](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L113)

Einladung in einen Raum.

## Properties

### accepted\_at?

> `optional` **accepted\_at?**: `string` \| `null`

Defined in: [types.ts:129](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L129)

Zeitpunkt der Annahme (ISO-String).

***

### created\_at

> **created\_at**: `string`

Defined in: [types.ts:131](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L131)

Zeitpunkt der Erstellung (ISO-String).

***

### email

> **email**: `string`

Defined in: [types.ts:121](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L121)

E-Mail-Adresse des Eingeladenen.

***

### expires\_at?

> `optional` **expires\_at?**: `string` \| `null`

Defined in: [types.ts:127](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L127)

Ablaufzeitpunkt der Einladung (ISO-String).

***

### id

> **id**: `string`

Defined in: [types.ts:115](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L115)

Eindeutige UUID der Einladung.

***

### role

> **role**: `"member"`

Defined in: [types.ts:123](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L123)

Zugewiesene Rolle (aktuell immer `member`).

***

### room\_id

> **room\_id**: `string`

Defined in: [types.ts:117](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L117)

UUID des Raums, zu dem eingeladen wird.

***

### room\_name

> **room\_name**: `string`

Defined in: [types.ts:119](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L119)

Name des Ziel-Raums (für die Anzeige).

***

### status

> **status**: `"pending"` \| `"accepted"` \| `"declined"`

Defined in: [types.ts:125](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L125)

Aktueller Status der Einladung.
