[**team5-smart-home**](../../../README.md)

***

[team5-smart-home](../../../README.md) / [services/conflictService](../README.md) / detectScheduleConflicts

# Function: detectScheduleConflicts()

> **detectScheduleConflicts**(`candidate`, `existingSchedules`, `rules`): [`Conflict`](../../../types/interfaces/Conflict.md)[]

Defined in: [services/conflictService.ts:203](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/services/conflictService.ts#L203)

Erkennt Konflikte zwischen einem neuen Zeitplan und bestehenden Zeitplänen/Regeln.

Ein Konflikt (Typ `schedule-schedule`) liegt vor, wenn:
- zwei Zeitpläne dasselbe Gerät zur selben Zeit an denselben Tagen steuern,
- und die Zielzustände widersprüchlich sind.

Ein Konflikt (Typ `rule-schedule`) liegt vor, wenn:
- eine Regel dasselbe Zielgerät mit widersprüchlichem Zustand steuert.

## Parameters

### candidate

Der zu prüfende (neue oder bearbeitete) Zeitplan.

#### action_value

[`DeviceState`](../../../types/interfaces/DeviceState.md)

#### days

`number`[]

#### device_id

`string`

#### id?

`string`

#### time

`string`

### existingSchedules

[`Schedule`](../../../types/interfaces/Schedule.md)[]

Alle vorhandenen Zeitpläne (wird nach `id` gefiltert).

### rules

[`Rule`](../../../types/interfaces/Rule.md)[]

Alle vorhandenen Regeln.

## Returns

[`Conflict`](../../../types/interfaces/Conflict.md)[]

Array von [Conflict](../../../types/interfaces/Conflict.md)-Objekten (leer = kein Konflikt).
