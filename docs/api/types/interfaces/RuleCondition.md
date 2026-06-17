[**team5-smart-home**](../../README.md)

***

[team5-smart-home](../../README.md) / [types](../README.md) / RuleCondition

# Interface: RuleCondition

Defined in: [types.ts:167](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L167)

Bedingung, die eine Automatisierungsregel auslöst.
Vergleicht ein Zustandsfeld des Auslöser-Geräts mit einem Sollwert.

## Properties

### field

> **field**: keyof [`DeviceState`](DeviceState.md)

Defined in: [types.ts:169](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L169)

Zu prüfendes Zustandsfeld des Geräts.

***

### operator

> **operator**: [`TriggerOperator`](../type-aliases/TriggerOperator.md)

Defined in: [types.ts:171](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L171)

Vergleichsoperator.

***

### value

> **value**: `string` \| `number` \| `boolean`

Defined in: [types.ts:173](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L173)

Sollwert, gegen den `field` verglichen wird.
