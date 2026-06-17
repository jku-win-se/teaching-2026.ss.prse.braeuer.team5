[**team5-smart-home**](../../README.md)

***

[team5-smart-home](../../README.md) / [types](../README.md) / SceneDeviceEntry

# Interface: SceneDeviceEntry

Defined in: [types.ts:249](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L249)

Ein Geräteeintrag innerhalb einer [Scene](Scene.md).
Legt fest, welchen Zustand das Gerät bei Szenen-Aktivierung erhalten soll.

## Properties

### device\_id

> **device\_id**: `string`

Defined in: [types.ts:251](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L251)

UUID des betreffenden Geräts.

***

### target\_state

> **target\_state**: [`DeviceState`](DeviceState.md)

Defined in: [types.ts:253](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L253)

Zielzustand, der bei Aktivierung der Szene gesetzt wird.
