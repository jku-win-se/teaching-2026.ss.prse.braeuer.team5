[**team5-smart-home**](../../../README.md)

***

[team5-smart-home](../../../README.md) / [services/ruleService](../README.md) / evaluateCondition

# Function: evaluateCondition()

> **evaluateCondition**(`cond`, `state`): `boolean`

Defined in: [services/ruleService.ts:44](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/services/ruleService.ts#L44)

Wertet eine Regel-Bedingung gegen den aktuellen Gerätezustand aus.
Unterstützt alle TriggerOperator-Werte: `==`, `!=`, `>`, `>=`, `<`, `<=`.

## Parameters

### cond

[`RuleCondition`](../../../types/interfaces/RuleCondition.md)

Die zu prüfende Bedingung.

### state

[`DeviceState`](../../../types/interfaces/DeviceState.md)

Aktueller Gerätezustand.

## Returns

`boolean`

`true` wenn die Bedingung erfüllt ist, sonst `false`.
