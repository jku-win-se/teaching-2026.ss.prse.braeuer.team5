[**team5-smart-home**](../../../README.md)

***

[team5-smart-home](../../../README.md) / [hooks/useRoomRole](../README.md) / useRoomRole

# Function: useRoomRole()

> **useRoomRole**(`roomId`): `object`

Defined in: [hooks/useRoomRole.ts:18](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/hooks/useRoomRole.ts#L18)

React-Hook zum Abrufen der Rolle des aktuellen Nutzers in einem Raum.

Lädt die Rolle neu wenn sich `roomId` ändert. Räumt ausstehende
asynchrone Operationen beim Unmount auf.

## Parameters

### roomId

`string` \| `undefined`

UUID des Raums. Bei `undefined` wird `role` auf `null` gesetzt.

## Returns

`object`

- `role` – `"owner"`, `"member"` oder `null` wenn keine Mitgliedschaft besteht
- `loading` – `true` während des Ladevorgangs
- `canManage` – `true` wenn `role === "owner"` (für Berechtigungsprüfungen in der UI)

### canManage

> **canManage**: `boolean`

### loading

> **loading**: `boolean`

### role

> **role**: [`RoomRole`](../../../types/type-aliases/RoomRole.md) \| `null`
