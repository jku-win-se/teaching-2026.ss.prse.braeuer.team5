[**team5-smart-home**](../../../README.md)

***

[team5-smart-home](../../../README.md) / [services/deviceService](../README.md) / addDeviceToRoom

# Function: addDeviceToRoom()

> **addDeviceToRoom**(`roomId`, `name`, `type`, `energy_consumption?`, `initialState?`): `Promise`\<[`Device`](../../../types/type-aliases/Device.md) \| `null`\>

Defined in: [services/deviceService.ts:98](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/services/deviceService.ts#L98)

Erstellt ein neues Gerät in einem Raum (nur für Owner).
Setzt gerätetyp-spezifische Standardzustände, wenn kein `initialState` angegeben wird.
Schreibt einen Aktivitäts-Log-Eintrag.

## Parameters

### roomId

`string`

UUID des Raums.

### name

`string`

Anzeigename des Geräts.

### type

[`DeviceType`](../../../types/type-aliases/DeviceType.md)

Gerätetyp (bestimmt den Initialzustand).

### energy\_consumption?

`number` \| `null`

Leistungsaufnahme in Watt (optional).

### initialState?

[`DeviceState`](../../../types/interfaces/DeviceState.md)

Überschreibt den gerätetyp-spezifischen Standardzustand.

## Returns

`Promise`\<[`Device`](../../../types/type-aliases/Device.md) \| `null`\>

Das erstellte [Device](../../../types/type-aliases/Device.md) oder `null` bei Fehler.
