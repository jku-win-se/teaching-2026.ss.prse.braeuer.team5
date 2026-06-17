[**team5-smart-home**](../../README.md)

***

[team5-smart-home](../../README.md) / [types](../README.md) / DeviceWithRoom

# Type Alias: DeviceWithRoom

> **DeviceWithRoom** = [`Device`](Device.md) & `object`

Defined in: [types.ts:67](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L67)

Gerät mit optionaler Rauminformation (für raumübergreifende Abfragen).

## Type Declaration

### rooms?

> `optional` **rooms?**: `object`

Verknüpfte Raumdaten (Name), sofern per JOIN geladen.

#### rooms.name

> **name**: `string`
