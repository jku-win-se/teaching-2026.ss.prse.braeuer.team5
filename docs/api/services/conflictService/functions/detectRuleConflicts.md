[**team5-smart-home**](../../../README.md)

***

[team5-smart-home](../../../README.md) / [services/conflictService](../README.md) / detectRuleConflicts

# Function: detectRuleConflicts()

> **detectRuleConflicts**(`candidate`, `existingRules`, `schedules`): [`Conflict`](../../../types/interfaces/Conflict.md)[]

Defined in: [services/conflictService.ts:136](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/services/conflictService.ts#L136)

Erkennt Konflikte zwischen einer neuen Regel und bestehenden Regeln/Zeitplänen.

Ein Konflikt (Typ `rule-rule`) liegt vor, wenn:
- beide Regeln dasselbe Zielgerät steuern,
- ihre Trigger gleichzeitig ausgelöst werden können,
- und die Zielzustände widersprüchlich sind.

Ein Konflikt (Typ `rule-schedule`) liegt vor, wenn:
- ein Zeitplan dasselbe Zielgerät mit widersprüchlichem Zustand steuert.

## Parameters

### candidate

Die zu prüfende (neue oder bearbeitete) Regel.

#### action

\{ `device_id`: `string`; `state`: [`DeviceState`](../../../types/interfaces/DeviceState.md); \}

#### action.device_id

`string`

#### action.state

[`DeviceState`](../../../types/interfaces/DeviceState.md)

#### condition

[`RuleCondition`](../../../types/interfaces/RuleCondition.md)

#### device_id

`string`

#### id?

`string`

### existingRules

[`Rule`](../../../types/interfaces/Rule.md)[]

Alle vorhandenen Regeln (wird nach `id` des Kandidaten gefiltert).

### schedules

[`Schedule`](../../../types/interfaces/Schedule.md)[]

Alle vorhandenen Zeitpläne.

## Returns

[`Conflict`](../../../types/interfaces/Conflict.md)[]

Array von [Conflict](../../../types/interfaces/Conflict.md)-Objekten (leer = kein Konflikt).
