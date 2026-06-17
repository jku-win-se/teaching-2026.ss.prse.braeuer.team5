[**team5-smart-home**](../../../README.md)

***

[team5-smart-home](../../../README.md) / [hooks/useRules](../README.md) / useRules

# Function: useRules()

> **useRules**(): `object`

Defined in: [hooks/useRules.ts:20](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/hooks/useRules.ts#L20)

React-Hook zum Laden und Verwalten von Automatisierungsregeln.

Lädt beim initialen Render alle Regeln und alle verfügbaren Geräte
(mit Raumzuordnung) parallel.

## Returns

- `rules` – Array aller [Rule](../../../types/interfaces/Rule.md)-Objekte
- `devices` – Array aller [DeviceWithRoom](../../../types/type-aliases/DeviceWithRoom.md)-Objekte (für Trigger/Aktion-Auswahl)
- `loading` – `true` während des Ladevorgangs
- `refresh` – Lädt alle Daten erneut aus der Datenbank
- `toggleRuleLocal` – Ändert `is_active` nur im lokalen State (kein DB-Call;
  für optimistische Updates nach einem bereits gesendeten DB-Toggle)

### devices

> **devices**: [`DeviceWithRoom`](../../../types/type-aliases/DeviceWithRoom.md)[]

### loading

> **loading**: `boolean`

### refresh

> **refresh**: () => `Promise`\<`void`\> = `loadData`

#### Returns

`Promise`\<`void`\>

### rules

> **rules**: [`Rule`](../../../types/interfaces/Rule.md)[]

### toggleRuleLocal

> **toggleRuleLocal**: (`id`, `isActive`) => `void`

Aktualisiert den `is_active`-Status einer Regel ausschließlich im lokalen State.
Kein Datenbankaufruf – muss nach einem DB-Toggle aufgerufen werden um die UI
konsistent zu halten.

#### Parameters

##### id

`string`

UUID der Regel.

##### isActive

`boolean`

Neuer Aktiv-Status.

#### Returns

`void`
