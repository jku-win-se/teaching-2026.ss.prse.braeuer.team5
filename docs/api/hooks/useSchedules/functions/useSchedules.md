[**team5-smart-home**](../../../README.md)

***

[team5-smart-home](../../../README.md) / [hooks/useSchedules](../README.md) / useSchedules

# Function: useSchedules()

> **useSchedules**(): `object`

Defined in: [hooks/useSchedules.ts:36](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/hooks/useSchedules.ts#L36)

React-Hook zum Laden von Zeitplänen und verfügbaren Geräten.

Lädt beim initialen Render alle Zeitpläne (inkl. Gerätedaten) und
alle Geräte parallel.

## Returns

`object`

- `schedules` – Array aller [Schedule](../../../types/interfaces/Schedule.md)-Objekte mit normalisierten `action_value`
- `devices` – Array aller [ScheduleDevice](../type-aliases/ScheduleDevice.md)-Objekte (für Gerät-Auswahl im Formular)
- `loading` – `true` während des Ladevorgangs
- `refresh` – Lädt alle Daten erneut aus der Datenbank

### devices

> **devices**: [`ScheduleDevice`](../type-aliases/ScheduleDevice.md)[]

### loading

> **loading**: `boolean`

### refresh

> **refresh**: () => `Promise`\<`void`\> = `loadData`

#### Returns

`Promise`\<`void`\>

### schedules

> **schedules**: [`Schedule`](../../../types/interfaces/Schedule.md)[]
