[**team5-smart-home**](../../README.md)

***

[team5-smart-home](../../README.md) / [types](../README.md) / EnergyLog

# Interface: EnergyLog

Defined in: [types.ts:321](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L321)

Eintrag aus dem Energie-Verlaufslog (`energy_logs`-Tabelle).

## Properties

### consumption\_watt?

> `optional` **consumption\_watt?**: `number`

Defined in: [types.ts:325](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L325)

Gemessener Verbrauch in Watt.

***

### created\_at

> **created\_at**: `string`

Defined in: [types.ts:323](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L323)

ISO-Zeitstempel der Messung.

***

### devices?

> `optional` **devices?**: `object`

Defined in: [types.ts:327](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L327)

Verknüpfte Gerätedaten (Name + Raumname), per JOIN geladen.

#### name

> **name**: `string`

#### rooms?

> `optional` **rooms?**: `object`

##### rooms.name

> **name**: `string`
