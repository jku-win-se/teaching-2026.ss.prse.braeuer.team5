[**team5-smart-home**](../../../README.md)

***

[team5-smart-home](../../../README.md) / [services/deviceService](../README.md) / updateDeviceState

# Function: updateDeviceState()

> **updateDeviceState**(`deviceId`, `newState`): `Promise`\<`any`\>

Defined in: [services/deviceService.ts:287](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/services/deviceService.ts#L287)

Aktualisiert den Zustand eines Geräts in der Datenbank.
Schreibt einen Aktivitäts-Log-Eintrag und löst anschließend asynchron
die Regelprüfung via [ruleService.checkAndExecuteRulesForDevice](../../ruleService/variables/ruleService.md#checkandexecuterulesfordevice) aus.

## Parameters

### deviceId

`string`

UUID des Geräts.

### newState

[`DeviceState`](../../../types/interfaces/DeviceState.md)

Vollständiger neuer Gerätezustand.

## Returns

`Promise`\<`any`\>

Das aktualisierte [Device](../../../types/type-aliases/Device.md) oder `null` bei Fehler.
