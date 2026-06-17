[**team5-smart-home**](../../../README.md)

***

[team5-smart-home](../../../README.md) / [services/deviceService](../README.md) / updateDeviceName

# Function: updateDeviceName()

> **updateDeviceName**(`deviceId`, `name`): `Promise`\<`boolean`\>

Defined in: [services/deviceService.ts:236](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/services/deviceService.ts#L236)

Benennt ein Gerät um (nur für Owner des zugehörigen Raums).
Schreibt einen Aktivitäts-Log-Eintrag.

## Parameters

### deviceId

`string`

UUID des Geräts.

### name

`string`

Neuer Anzeigename.

## Returns

`Promise`\<`boolean`\>

`true` bei Erfolg, `false` bei fehlendem Owner-Recht oder DB-Fehler.
