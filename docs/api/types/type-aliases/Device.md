[**team5-smart-home**](../../README.md)

***

[team5-smart-home](../../README.md) / [types](../README.md) / Device

# Type Alias: Device

> **Device** = `object`

Defined in: [types.ts:49](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L49)

Repräsentiert ein Smart-Home-Gerät in der Datenbank.

## Properties

### energy\_consumption?

> `optional` **energy\_consumption?**: `number` \| `null`

Defined in: [types.ts:59](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L59)

Leistungsaufnahme in Watt (optional, für Energiemonitoring).

***

### id

> **id**: `string`

Defined in: [types.ts:51](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L51)

Eindeutige UUID des Geräts.

***

### name

> **name**: `string`

Defined in: [types.ts:55](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L55)

Anzeigename des Geräts.

***

### room\_id

> **room\_id**: `string`

Defined in: [types.ts:53](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L53)

UUID des Raums, dem das Gerät zugeordnet ist.

***

### state?

> `optional` **state?**: [`DeviceState`](../interfaces/DeviceState.md)

Defined in: [types.ts:61](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L61)

Aktueller Betriebszustand des Geräts.

***

### type

> **type**: [`DeviceType`](DeviceType.md)

Defined in: [types.ts:57](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L57)

Kategorie des Geräts – bestimmt verfügbare Steuerungsoptionen.
