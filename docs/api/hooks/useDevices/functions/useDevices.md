[**team5-smart-home**](../../../README.md)

***

[team5-smart-home](../../../README.md) / [hooks/useDevices](../README.md) / useDevices

# Function: useDevices()

> **useDevices**(`roomId`): `object`

Defined in: [hooks/useDevices.ts:24](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/hooks/useDevices.ts#L24)

React-Hook zur Verwaltung der Geräteliste eines Raums.

Lädt Geräte beim initialen Render und abonniert Supabase-Realtime-Events
(UPDATE auf `devices` gefiltert nach `room_id`), um externe Zustandsänderungen
(z. B. durch Szenen-Aktivierung oder andere Clients) sofort anzuzeigen.
Die Supabase-Subscription wird beim Unmount automatisch bereinigt.

## Parameters

### roomId

`string` \| `undefined`

UUID des Raums. Bei `undefined` wird kein Laden angestoßen.

## Returns

- `devices` – Array der aktuellen [Device](../../../types/type-aliases/Device.md)-Objekte
- `loading` – `true` während des initialen Ladevorgangs
- `addDevice` – Erstellt ein neues Gerät im Raum
- `removeDevice` – Löscht ein Gerät; gibt `true` bei Erfolg zurück
- `renameDevice` – Benennt ein Gerät um
- `toggleDevice` – Schaltet ein Gerät ein/aus (mit optimistischem Update)
- `changeDeviceState` – Aktualisiert beliebige Zustandsfelder (mit optimistischem Update)

### addDevice

> **addDevice**: (`deviceName`, `type`, `energyConsumption`) => `Promise`\<`void`\>

Erstellt ein neues Gerät im Raum und fügt es der lokalen Liste hinzu.

#### Parameters

##### deviceName

`string`

Anzeigename des neuen Geräts.

##### type

[`DeviceType`](../../../types/type-aliases/DeviceType.md)

Gerätetyp.

##### energyConsumption

`number` \| `null`

Leistungsaufnahme in Watt (oder `null`).

#### Returns

`Promise`\<`void`\>

### changeDeviceState

> **changeDeviceState**: (`deviceId`, `newState`) => `Promise`\<`void`\>

Aktualisiert beliebige Zustandsfelder eines Geräts (Partial-Merge).
Aktualisiert den lokalen State optimistisch und persistiert via
[updateDeviceState](../../../services/deviceService/functions/updateDeviceState.md) (löst danach Regelprüfung aus).

#### Parameters

##### deviceId

`string`

UUID des Geräts.

##### newState

`Partial`\<[`DeviceState`](../../../types/interfaces/DeviceState.md)\>

Teilweiser neuer Zustand (wird mit bestehendem State gemergt).

#### Returns

`Promise`\<`void`\>

### devices

> **devices**: [`Device`](../../../types/type-aliases/Device.md)[]

### loading

> **loading**: `boolean`

### removeDevice

> **removeDevice**: (`deviceId`) => `Promise`\<`boolean`\>

Löscht ein Gerät und entfernt es aus der lokalen Liste.

#### Parameters

##### deviceId

`string`

UUID des zu löschenden Geräts.

#### Returns

`Promise`\<`boolean`\>

`true` bei Erfolg.

### renameDevice

> **renameDevice**: (`deviceId`, `newName`) => `Promise`\<`void`\>

Benennt ein Gerät um und aktualisiert die lokale Liste.

#### Parameters

##### deviceId

`string`

UUID des Geräts.

##### newName

`string`

Neuer Anzeigename.

#### Returns

`Promise`\<`void`\>

### toggleDevice

> **toggleDevice**: (`deviceId`, `newOn`) => `Promise`\<`void`\>

Schaltet ein Gerät ein oder aus. Aktualisiert den lokalen State optimistisch
und delegiert dann an [changeDeviceState](#usedevices).

#### Parameters

##### deviceId

`string`

UUID des Geräts.

##### newOn

`boolean`

`true` = einschalten, `false` = ausschalten.

#### Returns

`Promise`\<`void`\>
