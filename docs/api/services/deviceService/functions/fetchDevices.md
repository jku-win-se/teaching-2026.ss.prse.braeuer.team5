[**team5-smart-home**](../../../README.md)

***

[team5-smart-home](../../../README.md) / [services/deviceService](../README.md) / fetchDevices

# Function: fetchDevices()

> **fetchDevices**(`roomId`): `Promise`\<[`Device`](../../../types/type-aliases/Device.md)[]\>

Defined in: [services/deviceService.ts:68](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/services/deviceService.ts#L68)

Lädt alle Geräte eines Raums aus der Datenbank.

## Parameters

### roomId

`string`

UUID des Raums.

## Returns

`Promise`\<[`Device`](../../../types/type-aliases/Device.md)[]\>

Array von [Device](../../../types/type-aliases/Device.md)-Objekten oder leeres Array bei Fehler.
