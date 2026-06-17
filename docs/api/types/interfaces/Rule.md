[**team5-smart-home**](../../README.md)

***

[team5-smart-home](../../README.md) / [types](../README.md) / Rule

# Interface: Rule

Defined in: [types.ts:190](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L190)

Automatisierungsregel: Wenn ein Gerät eine Bedingung erfüllt,
wird eine Aktion auf einem (anderen) Gerät ausgeführt.

## Properties

### action

> **action**: [`RuleAction`](RuleAction.md)

Defined in: [types.ts:204](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L204)

Auszuführende Aktion bei erfüllter Bedingung.

***

### condition

> **condition**: [`RuleCondition`](RuleCondition.md)

Defined in: [types.ts:202](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L202)

Auslöser-Bedingung.

***

### cool\_down\_ms

> **cool\_down\_ms**: `number`

Defined in: [types.ts:210](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L210)

Mindestabstand zwischen zwei Ausführungen in Millisekunden.

***

### created\_at?

> `optional` **created\_at?**: `string`

Defined in: [types.ts:194](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L194)

ISO-Zeitstempel der Erstellung.

***

### device\_id

> **device\_id**: `string`

Defined in: [types.ts:198](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L198)

UUID des Auslöser-Geräts, dessen Zustand geprüft wird.

***

### id

> **id**: `string`

Defined in: [types.ts:192](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L192)

Eindeutige UUID der Regel.

***

### is\_active

> **is\_active**: `boolean`

Defined in: [types.ts:206](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L206)

Ob die Regel aktiv ist.

***

### last\_triggered\_at?

> `optional` **last\_triggered\_at?**: `string` \| `null`

Defined in: [types.ts:208](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L208)

ISO-Zeitstempel der letzten Ausführung (für Cooldown-Berechnung).

***

### name

> **name**: `string`

Defined in: [types.ts:200](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L200)

Anzeigename der Regel.

***

### room\_id?

> `optional` **room\_id?**: `string`

Defined in: [types.ts:196](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L196)

UUID des zugehörigen Raums (optional).
