[**team5-smart-home**](../../README.md)

***

[team5-smart-home](../../README.md) / [types](../README.md) / ActivityLog

# Interface: ActivityLog

Defined in: [types.ts:138](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L138)

Aktivitätseintrag im Audit-Log.
Wird von allen Services nach zustandsändernden Operationen geschrieben.

## Properties

### action

> **action**: `string`

Defined in: [types.ts:148](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L148)

Beschreibung der ausgeführten Aktion (z. B. `"State Change"`).

***

### actor\_type

> **actor\_type**: `string`

Defined in: [types.ts:152](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L152)

Wer die Aktion ausgelöst hat: Nutzer, Automatisierung oder System.

***

### created\_at

> **created\_at**: `string`

Defined in: [types.ts:142](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L142)

ISO-Zeitstempel des Ereignisses.

***

### device\_id?

> `optional` **device\_id?**: `string`

Defined in: [types.ts:144](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L144)

UUID des betroffenen Geräts (optional).

***

### id

> **id**: `string`

Defined in: [types.ts:140](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L140)

Eindeutige UUID des Log-Eintrags.

***

### new\_value

> **new\_value**: `string` \| `null`

Defined in: [types.ts:150](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L150)

Neuer Wert nach der Aktion (JSON-String oder Freitext).

***

### room\_id?

> `optional` **room\_id?**: `string`

Defined in: [types.ts:146](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L146)

UUID des betroffenen Raums (optional).

***

### user\_id?

> `optional` **user\_id?**: `string`

Defined in: [types.ts:154](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L154)

UUID des ausführenden Nutzers (nur bei `actor_type: 'user'`).
