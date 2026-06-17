[**team5-smart-home**](../../README.md)

***

[team5-smart-home](../../README.md) / [types](../README.md) / RuleAction

# Interface: RuleAction

Defined in: [types.ts:179](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L179)

Aktion, die eine Regel ausführt, wenn die Bedingung erfüllt ist.

## Properties

### device\_id

> **device\_id**: `string`

Defined in: [types.ts:181](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L181)

UUID des Ziel-Geräts, dessen Zustand geändert wird.

***

### state

> **state**: [`DeviceState`](DeviceState.md)

Defined in: [types.ts:183](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L183)

Neuer Zustand, der auf das Ziel-Gerät angewendet wird.
