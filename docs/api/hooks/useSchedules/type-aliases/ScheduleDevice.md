[**team5-smart-home**](../../../README.md)

***

[team5-smart-home](../../../README.md) / [hooks/useSchedules](../README.md) / ScheduleDevice

# Type Alias: ScheduleDevice

> **ScheduleDevice** = `object`

Defined in: [hooks/useSchedules.ts:9](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/hooks/useSchedules.ts#L9)

Gerätedarstellung für die Zeitplan-Verwaltung (inkl. `state` für Vorschau).

## Properties

### id

> **id**: `string`

Defined in: [hooks/useSchedules.ts:11](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/hooks/useSchedules.ts#L11)

Eindeutige UUID des Geräts.

***

### name

> **name**: `string`

Defined in: [hooks/useSchedules.ts:13](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/hooks/useSchedules.ts#L13)

Anzeigename des Geräts.

***

### room\_id

> **room\_id**: `string`

Defined in: [hooks/useSchedules.ts:17](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/hooks/useSchedules.ts#L17)

UUID des zugehörigen Raums.

***

### rooms?

> `optional` **rooms?**: `object`

Defined in: [hooks/useSchedules.ts:19](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/hooks/useSchedules.ts#L19)

Raumname, per JOIN geladen.

#### name

> **name**: `string`

***

### state

> **state**: `string`

Defined in: [hooks/useSchedules.ts:21](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/hooks/useSchedules.ts#L21)

Aktueller Gerätezustand (für typen-spezifische Vorschau).

***

### type

> **type**: `string`

Defined in: [hooks/useSchedules.ts:15](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/hooks/useSchedules.ts#L15)

Gerätetyp als String.
