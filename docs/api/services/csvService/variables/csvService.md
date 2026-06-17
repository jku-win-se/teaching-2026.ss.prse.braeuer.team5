[**team5-smart-home**](../../../README.md)

***

[team5-smart-home](../../../README.md) / [services/csvService](../README.md) / csvService

# Variable: csvService

> `const` **csvService**: `object`

Defined in: [services/csvService.ts:2](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/services/csvService.ts#L2)

Service-Objekt für CSV-Exporte.

## Type Declaration

### exportToCSV()

> **exportToCSV**(`headers`, `rows`, `filename`): `void`

Exportiert tabellarische Daten als CSV-Datei und löst einen Browser-Download aus.
Verwendet UTF-8 mit BOM (`﻿`) für korrekte Darstellung in Microsoft Excel.
Spalten werden mit Semikolon getrennt (deutsches Excel-Format).

#### Parameters

##### headers

`string`[]

Spaltenüberschriften (erste Zeile).

##### rows

(`string` \| `number`)[][]

Datenzeilen (jede Zeile ist ein Array von Werten).

##### filename

`string`

Dateiname ohne Endung (`.csv` wird automatisch angehängt).

#### Returns

`void`
