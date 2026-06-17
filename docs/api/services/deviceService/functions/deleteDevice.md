[**team5-smart-home**](../../../README.md)

***

[team5-smart-home](../../../README.md) / [services/deviceService](../README.md) / deleteDevice

# Function: deleteDevice()

> **deleteDevice**(`deviceId`): `Promise`\<`boolean`\>

Defined in: [services/deviceService.ts:189](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/services/deviceService.ts#L189)

Löscht ein Gerät (nur für Owner des zugehörigen Raums).
Schreibt einen Aktivitäts-Log-Eintrag.

## Parameters

### deviceId

`string`

UUID des zu löschenden Geräts.

## Returns

`Promise`\<`boolean`\>

`true` bei Erfolg, `false` bei fehlendem Owner-Recht oder DB-Fehler.
