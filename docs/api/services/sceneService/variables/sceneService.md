[**team5-smart-home**](../../../README.md)

***

[team5-smart-home](../../../README.md) / [services/sceneService](../README.md) / sceneService

# Variable: sceneService

> `const` **sceneService**: `object`

Defined in: [services/sceneService.ts:6](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/services/sceneService.ts#L6)

Service-Objekt für alle Szenen-Operationen (CRUD + Aktivierung).

## Type Declaration

### activateScene()

> **activateScene**(`scene`): `Promise`\<\{ `errors`: `string`[]; `ok`: `boolean`; \}\>

Aktiviert eine Szene: Setzt den Zielzustand für jedes Gerät in `device_states`.
Schreibt einen Aktivitäts-Log-Eintrag für den primären Raum der Szene.

#### Parameters

##### scene

[`Scene`](../../../types/interfaces/Scene.md)

Die zu aktivierende Szene (inkl. `device_states` und `scene_rooms`).

#### Returns

`Promise`\<\{ `errors`: `string`[]; `ok`: `boolean`; \}\>

`{ ok: true, errors: [] }` bei vollständigem Erfolg,
         `{ ok: false, errors: [...] }` wenn mindestens ein Gerät-Update fehlschlug.

### assignRooms()

> **assignRooms**(`sceneId`, `roomIds`): `Promise`\<`void`\>

Ordnet Räume einer Szene zu (ersetzt bestehende Zuordnungen).
Verwendet die Supabase-RPC `assign_scene_rooms`.

#### Parameters

##### sceneId

`string`

UUID der Szene.

##### roomIds

`string`[]

Array von Raum-UUIDs, die der Szene zugeordnet werden sollen.

#### Returns

`Promise`\<`void`\>

### createScene()

> **createScene**(`payload`): `Promise`\<[`Scene`](../../../types/interfaces/Scene.md) \| `null`\>

Erstellt eine neue Szene.

#### Parameters

##### payload

`Pick`\<[`Scene`](../../../types/interfaces/Scene.md), `"name"` \| `"description"` \| `"device_states"`\>

Name, optionale Beschreibung und Liste der [SceneDeviceEntry](../../../types/interfaces/SceneDeviceEntry.md)-Einträge.

#### Returns

`Promise`\<[`Scene`](../../../types/interfaces/Scene.md) \| `null`\>

Die erstellte [Scene](../../../types/interfaces/Scene.md) oder `null` bei Fehler.

### deleteScene()

> **deleteScene**(`id`): `Promise`\<`void`\>

Löscht eine Szene unwiderruflich.

#### Parameters

##### id

`string`

UUID der Szene.

#### Returns

`Promise`\<`void`\>

### fetchAllScenes()

> **fetchAllScenes**(): `Promise`\<[`Scene`](../../../types/interfaces/Scene.md)[]\>

Lädt alle Szenen inkl. Raumzuordnungen, absteigend nach Erstellungsdatum.

#### Returns

`Promise`\<[`Scene`](../../../types/interfaces/Scene.md)[]\>

Array von [Scene](../../../types/interfaces/Scene.md)-Objekten mit befülltem `scene_rooms`.

### updateScene()

> **updateScene**(`id`, `payload`): `Promise`\<`any`\>

Aktualisiert eine bestehende Szene.

#### Parameters

##### id

`string`

UUID der Szene.

##### payload

`Pick`\<[`Scene`](../../../types/interfaces/Scene.md), `"name"` \| `"description"` \| `"device_states"`\>

Neue Konfiguration (Name, Beschreibung, Gerätezustände).

#### Returns

`Promise`\<`any`\>

Die aktualisierte Szene.
