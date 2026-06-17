[**team5-smart-home**](../../README.md)

***

[team5-smart-home](../../README.md) / [types](../README.md) / Scene

# Interface: Scene

Defined in: [types.ts:259](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L259)

Szene: eine benannte Sammlung von Gerätezuständen, die auf Knopfdruck aktiviert werden kann.

## Properties

### created\_at?

> `optional` **created\_at?**: `string`

Defined in: [types.ts:271](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L271)

ISO-Zeitstempel der Erstellung.

***

### description?

> `optional` **description?**: `string`

Defined in: [types.ts:267](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L267)

Optionale Beschreibung der Szene.

***

### device\_states

> **device\_states**: [`SceneDeviceEntry`](SceneDeviceEntry.md)[]

Defined in: [types.ts:269](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L269)

Liste der Geräte-Soll-Zustände, die bei Aktivierung angewendet werden.

***

### id

> **id**: `string`

Defined in: [types.ts:261](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L261)

Eindeutige UUID der Szene.

***

### name

> **name**: `string`

Defined in: [types.ts:265](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L265)

Anzeigename der Szene.

***

### room\_id?

> `optional` **room\_id?**: `string` \| `null`

Defined in: [types.ts:263](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L263)

UUID des primären Raums (veraltet, wird durch `scene_rooms` ersetzt).

***

### rooms?

> `optional` **rooms?**: `object`

Defined in: [types.ts:273](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L273)

Primärer Raumname (per JOIN, veraltet).

#### name

> **name**: `string`

***

### scene\_rooms?

> `optional` **scene\_rooms?**: `object`[]

Defined in: [types.ts:275](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/types.ts#L275)

Zugeordnete Räume inkl. Raumnamen (n:m über `scene_rooms`).

#### room\_id

> **room\_id**: `string`

#### rooms?

> `optional` **rooms?**: `object`

##### rooms.name

> **name**: `string`
