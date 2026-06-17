[**team5-smart-home**](../../../README.md)

***

[team5-smart-home](../../../README.md) / [hooks/useEnergyData](../README.md) / useEnergyData

# Function: useEnergyData()

> **useEnergyData**(`range?`): `object`

Defined in: [hooks/useEnergyData.ts:26](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/hooks/useEnergyData.ts#L26)

React-Hook zum Laden und Aggregieren von Energieverbrauchsdaten.

Lädt Gerätedaten und Energie-Verlaufslogs für den gewählten Zeitraum.
Aggregiert die Logs in Zeitslots (Tag: 4-Stunden-Blöcke, Woche: Wochentage)
via `useMemo`, um unnötige Neuberechnungen zu vermeiden.

## Parameters

### range?

`"day"` \| `"week"`

Zeitraum für Verlaufsdaten: `'day'` (24 Stunden) oder `'week'` (7 Tage).

## Returns

- `totalLive` – Aktueller Gesamtverbrauch aktiver Geräte in Watt
- `byRoom` – Verbrauch gruppiert nach Raumname (in Watt)
- `historyChart` – Zeitreihendaten gesamt (`{ label, value }[]`)
- `roomCharts` – Zeitreihendaten je Raum (`Record<string, { label, value }[]>`)
- `deviceCharts` – Zeitreihendaten je Gerät (`Record<string, { label, value }[]>`)
- `byDevice` – Geräteliste mit `isActive` und `consumption` (in Watt)
- `loading` – `true` während des Ladevorgangs
- `exportEnergyHistoryCSV` – Exportiert die Verlaufsdaten als CSV-Datei

### byDevice

> **byDevice**: `object`[]

### byRoom

> **byRoom**: `Record`\<`string`, `number`\>

### deviceCharts

> **deviceCharts**: `object`

#### Index Signature

\[`k`: `string`\]: `object`[]

### exportEnergyHistoryCSV

> **exportEnergyHistoryCSV**: () => `void`

Exportiert die geladenen Energie-Verlaufsdaten als CSV-Datei.
Dateiname enthält den aktuellen `range`-Wert.
Zeigt einen Alert an wenn keine Daten vorhanden sind.

#### Returns

`void`

### historyChart

> **historyChart**: `object`[]

### loading

> **loading**: `boolean`

### roomCharts

> **roomCharts**: `object`

#### Index Signature

\[`k`: `string`\]: `object`[]

### totalLive

> **totalLive**: `number`
