[**team5-smart-home**](../../../README.md)

***

[team5-smart-home](../../../README.md) / [services/vacationModeService](../README.md) / vacationModeService

# Variable: vacationModeService

> `const` **vacationModeService**: `object`

Defined in: [services/vacationModeService.ts:16](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/services/vacationModeService.ts#L16)

Service-Objekt für alle Urlaubsmodus-Operationen (CRUD + automatische Ausführung).

## Type Declaration

### assignRooms()

> **assignRooms**(`vacationModeId`, `roomIds`): `Promise`\<`void`\>

Ordnet Räume einem Urlaubsmodus zu (ersetzt bestehende Zuordnungen).
Setzt `vacation_mode_id` in der `rooms`-Tabelle direkt.

#### Parameters

##### vacationModeId

`string`

UUID des Urlaubsmodus.

##### roomIds

`string`[]

Array von Raum-UUIDs, die zugeordnet werden sollen.

#### Returns

`Promise`\<`void`\>

### checkAndExecuteVacationMode()

> **checkAndExecuteVacationMode**(): `Promise`\<`void`\>

Prüft alle aktiven Urlaubsmodi gegen die aktuelle Uhrzeit und aktiviert
bei Übereinstimmung die verknüpfte Szene via [sceneService.activateScene](../../sceneService/variables/sceneService.md#activatescene).

Deaktiviert automatisch alle Einträge, deren `end_date` in der Vergangenheit liegt.
Wird von useAutomation jede Minute aufgerufen.
Schreibt für jeden betroffenen Raum einen Aktivitäts-Log-Eintrag.

#### Returns

`Promise`\<`void`\>

### create()

> **create**(`payload`): `Promise`\<`any`[] \| `null`\>

Erstellt einen neuen Urlaubsmodus-Eintrag. Startet sofort aktiviert.

#### Parameters

##### payload

`Pick`\<[`VacationMode`](../../../types/interfaces/VacationMode.md), `"name"` \| `"scene_id"` \| `"start_date"` \| `"end_date"` \| `"daily_time"`\>

Name, Szenen-UUID, Start-/Enddatum und tägliche Aktivierungszeit.

#### Returns

`Promise`\<`any`[] \| `null`\>

Die erstellten Datenbankzeilen oder `null`.

### delete()

> **delete**(`id`): `Promise`\<`void`\>

Löscht einen Urlaubsmodus-Eintrag. Raum-Verknüpfungen werden durch
die DB-Constraint `ON DELETE SET NULL` automatisch aufgelöst.

#### Parameters

##### id

`string`

UUID des Eintrags.

#### Returns

`Promise`\<`void`\>

### fetchAll()

> **fetchAll**(): `Promise`\<[`VacationMode`](../../../types/interfaces/VacationMode.md)[]\>

Lädt alle Urlaubsmodus-Einträge inkl. verknüpfter Szenen und Räume,
aufsteigend nach Startdatum sortiert.

#### Returns

`Promise`\<[`VacationMode`](../../../types/interfaces/VacationMode.md)[]\>

Array von [VacationMode](../../../types/interfaces/VacationMode.md)-Objekten.

### getActiveVacationRoomIds()

> **getActiveVacationRoomIds**(): `Promise`\<`Set`\<`string`\>\>

Gibt alle Raum-UUIDs zurück, für die heute ein aktiver Urlaubsmodus gilt.
Wird von scheduleService.checkAndExecuteSchedules verwendet,
um Zeitpläne in Urlaubsräumen zu überspringen.

#### Returns

`Promise`\<`Set`\<`string`\>\>

Set mit Raum-UUIDs.

### toggle()

> **toggle**(`id`, `is_active`): `Promise`\<`void`\>

Schaltet den Aktiv-Status eines Urlaubsmodus um.

#### Parameters

##### id

`string`

UUID des Eintrags.

##### is\_active

`boolean`

Neuer Aktiv-Status.

#### Returns

`Promise`\<`void`\>

### update()

> **update**(`id`, `payload`): `Promise`\<`any`[] \| `null`\>

Aktualisiert einen bestehenden Urlaubsmodus-Eintrag.

#### Parameters

##### id

`string`

UUID des Eintrags.

##### payload

`Pick`\<[`VacationMode`](../../../types/interfaces/VacationMode.md), `"name"` \| `"scene_id"` \| `"start_date"` \| `"end_date"` \| `"daily_time"`\>

Neue Konfiguration.

#### Returns

`Promise`\<`any`[] \| `null`\>

Die aktualisierten Datenbankzeilen oder `null`.
