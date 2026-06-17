[**team5-smart-home**](../../../README.md)

***

[team5-smart-home](../../../README.md) / [services/simulationService](../README.md) / SimDevice

# Type Alias: SimDevice

> **SimDevice** = `object`

Defined in: [services/simulationService.ts:7](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/services/simulationService.ts#L7)

Gerätedarstellung im Simulator (vereinfacht, ohne Energiedaten).

## Properties

### id

> **id**: `string`

Defined in: [services/simulationService.ts:9](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/services/simulationService.ts#L9)

Eindeutige UUID des Geräts.

***

### name

> **name**: `string`

Defined in: [services/simulationService.ts:11](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/services/simulationService.ts#L11)

Anzeigename des Geräts.

***

### room\_id

> **room\_id**: `string`

Defined in: [services/simulationService.ts:15](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/services/simulationService.ts#L15)

UUID des zugehörigen Raums.

***

### rooms?

> `optional` **rooms?**: `object`

Defined in: [services/simulationService.ts:19](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/services/simulationService.ts#L19)

Raumname, per JOIN geladen.

#### name

> **name**: `string`

***

### state?

> `optional` **state?**: [`DeviceState`](../../../types/interfaces/DeviceState.md)

Defined in: [services/simulationService.ts:17](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/services/simulationService.ts#L17)

Aktueller Gerätezustand (als Ausgangsbasis für die Simulation).

***

### type

> **type**: [`DeviceType`](../../../types/type-aliases/DeviceType.md)

Defined in: [services/simulationService.ts:13](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/services/simulationService.ts#L13)

Gerätetyp.
