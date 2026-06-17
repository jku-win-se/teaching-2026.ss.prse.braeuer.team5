[**team5-smart-home**](../../../README.md)

***

[team5-smart-home](../../../README.md) / [hooks/useScenes](../README.md) / useScenes

# Function: useScenes()

> **useScenes**(): `object`

Defined in: [hooks/useScenes.ts:34](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/hooks/useScenes.ts#L34)

React-Hook zum Laden von Szenen und verfügbaren Geräten.

Lädt beim initialen Render alle Szenen (inkl. Raumzuordnungen) und
alle Geräte parallel.

## Returns

`object`

- `scenes` – Array aller [Scene](../../../types/interfaces/Scene.md)-Objekte
- `devices` – Array aller [SceneDevice](../type-aliases/SceneDevice.md)-Objekte (für Gerätezustand-Editor)
- `loading` – `true` während des Ladevorgangs
- `refresh` – Lädt alle Daten erneut aus der Datenbank

### devices

> **devices**: [`SceneDevice`](../type-aliases/SceneDevice.md)[]

### loading

> **loading**: `boolean`

### refresh

> **refresh**: () => `Promise`\<`void`\> = `loadData`

#### Returns

`Promise`\<`void`\>

### scenes

> **scenes**: [`Scene`](../../../types/interfaces/Scene.md)[]
