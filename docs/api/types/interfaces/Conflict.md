[**team5-smart-home**](../../README.md)

***

[team5-smart-home](../../README.md) / [types](../README.md) / Conflict

# Interface: Conflict

Defined in: [types.ts:309](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L309)

Ergebnis einer Konfliktprüfung zwischen Regeln und/oder Zeitplänen.
Wird von detectRuleConflicts und detectScheduleConflicts zurückgegeben.

## Properties

### conflictingItemName

> **conflictingItemName**: `string`

Defined in: [types.ts:315](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L315)

Name des kollidierenden Eintrags (Regel oder Zeitplan).

***

### message

> **message**: `string`

Defined in: [types.ts:313](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L313)

Benutzerlesbare Konfliktbeschreibung.

***

### type

> **type**: `"rule-rule"` \| `"schedule-schedule"` \| `"rule-schedule"`

Defined in: [types.ts:311](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L311)

Art des Konflikts.
