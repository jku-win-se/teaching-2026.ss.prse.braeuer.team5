[**team5-smart-home**](../../README.md)

***

[team5-smart-home](../../README.md) / [types](../README.md) / DeviceState

# Interface: DeviceState

Defined in: [types.ts:33](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L33)

Aktueller Zustand eines Geräts.
Welche Felder befüllt sind, hängt vom [DeviceType](../type-aliases/DeviceType.md) ab:
- Schalter: `on`
- Dimmer: `on`, `brightness`
- Thermostat: `temperature`
- Sensor: `value`
- Jalousie: `position`

## Properties

### brightness?

> `optional` **brightness?**: `number`

Defined in: [types.ts:37](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L37)

Helligkeit in Prozent (0–100). Nur für Dimmer.

***

### on?

> `optional` **on?**: `boolean`

Defined in: [types.ts:35](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L35)

Gerät ein- (`true`) oder ausgeschaltet (`false`).

***

### position?

> `optional` **position?**: `number` \| `"offen"` \| `"geschlossen"` \| `"stop"`

Defined in: [types.ts:43](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L43)

Jalousie-Position: Prozentwert oder Freitext-Zustand.

***

### temperature?

> `optional` **temperature?**: `number`

Defined in: [types.ts:39](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L39)

Solltemperatur in °C. Nur für Thermostat.

***

### value?

> `optional` **value?**: `string` \| `number`

Defined in: [types.ts:41](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L41)

Messwert des Sensors (numerisch oder Freitext).
