[**team5-smart-home**](../../../README.md)

***

[team5-smart-home](../../../README.md) / [services/simulationService](../README.md) / simulationService

# Variable: simulationService

> `const` **simulationService**: `object`

Defined in: [services/simulationService.ts:23](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/services/simulationService.ts#L23)

Service-Objekt für das Laden von Simulationsdaten (schreibgeschützt).

## Type Declaration

### fetchSimulationDevices()

> **fetchSimulationDevices**(): `Promise`\<[`SimDevice`](../type-aliases/SimDevice.md)[]\>

Lädt alle Geräte mit ihrem aktuellen Zustand und Raumzuordnung für den Simulator,
alphabetisch nach Name sortiert.

#### Returns

`Promise`\<[`SimDevice`](../type-aliases/SimDevice.md)[]\>

Array von [SimDevice](../type-aliases/SimDevice.md)-Objekten.

### fetchSimulationSchedules()

> **fetchSimulationSchedules**(): `Promise`\<[`Schedule`](../../../types/interfaces/Schedule.md)[]\>

Lädt alle aktiven Zeitpläne inkl. Gerätedaten für den Simulator,
aufsteigend nach Uhrzeit sortiert.

#### Returns

`Promise`\<[`Schedule`](../../../types/interfaces/Schedule.md)[]\>

Array von [Schedule](../../../types/interfaces/Schedule.md)-Objekten mit befülltem `devices`-Feld.
