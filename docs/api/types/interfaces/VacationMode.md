[**team5-smart-home**](../../README.md)

***

[team5-smart-home](../../README.md) / [types](../README.md) / VacationMode

# Interface: VacationMode

Defined in: [types.ts:282](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L282)

Urlaubsmodus: aktiviert täglich eine Szene innerhalb eines Datumsbereichs.
Läuft automatisch via useAutomation ab.

## Properties

### created\_at?

> `optional` **created\_at?**: `string`

Defined in: [types.ts:298](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L298)

ISO-Zeitstempel der Erstellung.

***

### daily\_time

> **daily\_time**: `string`

Defined in: [types.ts:294](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L294)

Tägliche Aktivierungszeit im Format `HH:MM`.

***

### end\_date

> **end\_date**: `string`

Defined in: [types.ts:292](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L292)

Enddatum im Format `YYYY-MM-DD`.

***

### id

> **id**: `string`

Defined in: [types.ts:284](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L284)

Eindeutige UUID des Urlaubsmodus-Eintrags.

***

### is\_active

> **is\_active**: `boolean`

Defined in: [types.ts:296](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L296)

Ob der Urlaubsmodus aktiv ist.

***

### name

> **name**: `string`

Defined in: [types.ts:286](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L286)

Anzeigename des Urlaubsmodus.

***

### rooms?

> `optional` **rooms?**: `object`[]

Defined in: [types.ts:300](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L300)

Zugeordnete Räume (id + name).

#### id

> **id**: `string`

#### name

> **name**: `string`

***

### scene\_id

> **scene\_id**: `string` \| `null`

Defined in: [types.ts:288](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L288)

UUID der zu aktivierenden Szene (null = keine Szene).

***

### scenes?

> `optional` **scenes?**: \{ `name`: `string`; \} \| `null`

Defined in: [types.ts:302](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L302)

Verknüpfte Szene (Name), per JOIN geladen.

***

### start\_date

> **start\_date**: `string`

Defined in: [types.ts:290](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L290)

Startdatum im Format `YYYY-MM-DD`.
