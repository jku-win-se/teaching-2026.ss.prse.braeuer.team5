[**team5-smart-home**](../../README.md)

***

[team5-smart-home](../../README.md) / [types](../README.md) / Schedule

# Interface: Schedule

Defined in: [types.ts:217](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L217)

Zeitgesteuerter Automatisierungsplan.
Führt eine Gerätezustandsänderung an bestimmten Wochentagen zur angegebenen Uhrzeit aus.

## Properties

### action\_value

> **action\_value**: [`DeviceState`](DeviceState.md)

Defined in: [types.ts:231](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L231)

Zielzustand, der zum geplanten Zeitpunkt gesetzt wird.

***

### created\_at?

> `optional` **created\_at?**: `string`

Defined in: [types.ts:235](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L235)

ISO-Zeitstempel der Erstellung.

***

### days

> **days**: `number`[]

Defined in: [types.ts:229](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L229)

Wochentage als Array von Zahlen (0 = Sonntag … 6 = Samstag).

***

### device\_id

> **device\_id**: `string`

Defined in: [types.ts:225](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L225)

UUID des Ziel-Geräts.

***

### devices?

> `optional` **devices?**: `object`

Defined in: [types.ts:237](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L237)

Verknüpfte Gerätedaten (Name, Typ, Raum), per JOIN geladen.

#### name

> **name**: `string`

#### room\_id

> **room\_id**: `string`

#### rooms?

> `optional` **rooms?**: `object`

##### rooms.name

> **name**: `string`

#### type

> **type**: [`DeviceType`](../type-aliases/DeviceType.md)

***

### id

> **id**: `string`

Defined in: [types.ts:219](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L219)

Eindeutige UUID des Zeitplans.

***

### is\_active

> **is\_active**: `boolean`

Defined in: [types.ts:233](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L233)

Ob der Zeitplan aktiv ist.

***

### name

> **name**: `string`

Defined in: [types.ts:221](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L221)

Anzeigename des Zeitplans.

***

### room\_id

> **room\_id**: `string`

Defined in: [types.ts:223](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L223)

UUID des Raums, zu dem der Zeitplan gehört.

***

### time

> **time**: `string`

Defined in: [types.ts:227](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L227)

Ausführungszeit im Format `HH:MM` oder `HH:MM:SS`.
