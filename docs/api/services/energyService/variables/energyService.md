[**team5-smart-home**](../../../README.md)

***

[team5-smart-home](../../../README.md) / [services/energyService](../README.md) / energyService

# Variable: energyService

> `const` **energyService**: `object`

Defined in: [services/energyService.ts:4](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/services/energyService.ts#L4)

Service-Objekt für Energieverbrauchsdaten.

## Type Declaration

### getLiveConsumption()

> **getLiveConsumption**(): `Promise`\<`object`[]\>

Lädt den aktuellen Energieverbrauch aller Geräte inkl. Raumzuordnung.
Gibt für jedes Gerät `id`, `name`, `type`, `energy_consumption` und
den zugehörigen Raumnamen zurück.

#### Returns

`Promise`\<`object`[]\>

Array von Gerätezeilen mit Raumdaten.

#### Throws

Wenn Supabase nicht konfiguriert ist oder ein DB-Fehler auftritt.
