[**team5-smart-home**](../../../README.md)

***

[team5-smart-home](../../../README.md) / [hooks/useDeviceCount](../README.md) / useDeviceCount

# Function: useDeviceCount()

> **useDeviceCount**(`roomId`): `number`

Defined in: [hooks/useDeviceCount.ts:11](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/hooks/useDeviceCount.ts#L11)

React-Hook zum Abrufen der Geräteanzahl in einem Raum.
Wird auf der Raumübersicht (Rooms) für die Anzeige der Geräteanzahl genutzt.

## Parameters

### roomId

`string`

UUID des Raums.

## Returns

`number`

Aktuelle Anzahl der Geräte im Raum (0 während des Ladevorgangs).
