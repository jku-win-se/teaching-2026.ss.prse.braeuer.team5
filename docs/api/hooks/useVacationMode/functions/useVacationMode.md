[**team5-smart-home**](../../../README.md)

***

[team5-smart-home](../../../README.md) / [hooks/useVacationMode](../README.md) / useVacationMode

# Function: useVacationMode()

> **useVacationMode**(): `object`

Defined in: [hooks/useVacationMode.ts:27](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/hooks/useVacationMode.ts#L27)

React-Hook zum Laden von Urlaubsmodus-Einträgen und verfügbaren Szenen.

Lädt beim initialen Render alle Urlaubsmodi und alle Szenen parallel.

## Returns

`object`

- `modes` – Array aller [VacationMode](../../../types/interfaces/VacationMode.md)-Objekte
- `scenes` – Array aller [VacationScene](../type-aliases/VacationScene.md)-Objekte (für Szenen-Auswahl im Formular)
- `loading` – `true` während des Ladevorgangs
- `refresh` – Lädt alle Daten erneut aus der Datenbank

### loading

> **loading**: `boolean`

### modes

> **modes**: [`VacationMode`](../../../types/interfaces/VacationMode.md)[]

### refresh

> **refresh**: () => `Promise`\<`void`\> = `loadData`

#### Returns

`Promise`\<`void`\>

### scenes

> **scenes**: [`VacationScene`](../type-aliases/VacationScene.md)[]
