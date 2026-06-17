[**team5-smart-home**](../../../README.md)

***

[team5-smart-home](../../../README.md) / [hooks/useRooms](../README.md) / useRooms

# Function: useRooms()

> **useRooms**(): `object`

Defined in: [hooks/useRooms.ts:17](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/hooks/useRooms.ts#L17)

React-Hook zur Verwaltung der Raumliste des aktuellen Nutzers.

Lädt beim initialen Render alle Räume via [fetchRooms](../../../services/roomService/functions/fetchRooms.md) und
hält eine lokale Kopie für optimistische Updates aktuell.

## Returns

- `rooms` – Array der aktuellen [Room](../../../types/type-aliases/Room.md)-Objekte mit befülltem `role`-Feld
- `addRoom` – Erstellt einen neuen Raum; gibt `true` bei Erfolg zurück
- `updateRoom` – Benennt einen Raum um
- `deleteRoom` – Löscht einen Raum; gibt `true` bei Erfolg zurück

### addRoom

> **addRoom**: (`name`) => `Promise`\<`boolean`\>

Erstellt einen neuen Raum und fügt ihn der lokalen Liste hinzu.
Der aktuelle Nutzer wird automatisch als Owner gesetzt.

#### Parameters

##### name

`string`

Anzeigename des neuen Raums.

#### Returns

`Promise`\<`boolean`\>

`true` wenn der Raum erfolgreich erstellt wurde.

### deleteRoom

> **deleteRoom**: (`id`) => `Promise`\<`boolean`\>

Löscht einen Raum und entfernt ihn aus der lokalen Liste.

#### Parameters

##### id

`string`

UUID des Raums.

#### Returns

`Promise`\<`boolean`\>

`true` bei Erfolg.

### rooms

> **rooms**: [`Room`](../../../types/type-aliases/Room.md)[]

### updateRoom

> **updateRoom**: (`id`, `name`) => `Promise`\<`void`\>

Benennt einen Raum um und aktualisiert die lokale Liste.

#### Parameters

##### id

`string`

UUID des Raums.

##### name

`string`

Neuer Anzeigename.

#### Returns

`Promise`\<`void`\>
