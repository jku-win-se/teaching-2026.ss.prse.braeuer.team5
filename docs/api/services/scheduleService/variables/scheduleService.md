[**team5-smart-home**](../../../README.md)

***

[team5-smart-home](../../../README.md) / [services/scheduleService](../README.md) / scheduleService

# Variable: scheduleService

> `const` **scheduleService**: `object`

Defined in: [services/scheduleService.ts:59](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/services/scheduleService.ts#L59)

Service-Objekt für alle Zeitplan-Operationen (CRUD + Ausführung).

## Type Declaration

### checkAndExecuteSchedules()

> **checkAndExecuteSchedules**(): `Promise`\<`void`\>

Prüft alle aktiven Zeitpläne gegen die aktuelle Uhrzeit und den aktuellen Wochentag
und führt fällige Zeitpläne aus. Überspringt Räume, für die ein aktiver
Urlaubsmodus gilt (via [vacationModeService.getActiveVacationRoomIds](../../vacationModeService/variables/vacationModeService.md#getactivevacationroomids)).

Wird von useAutomation jede Minute aufgerufen.
Schreibt nach jeder Ausführung einen Aktivitäts-Log-Eintrag.

#### Returns

`Promise`\<`void`\>

### createSchedule()

> **createSchedule**(`payload`): `Promise`\<`any`[] \| `null`\>

Erstellt einen neuen Zeitplan. Normalisiert die Uhrzeit auf `HH:MM:SS`
und den Aktionszustand mit normalizeActionValue.

#### Parameters

##### payload

`Pick`\<[`Schedule`](../../../types/interfaces/Schedule.md), `"name"` \| `"room_id"` \| `"device_id"` \| `"time"` \| `"days"` \| `"action_value"`\>

Zeitplankonfiguration (Name, Raum, Gerät, Zeit, Tage, Aktion).

#### Returns

`Promise`\<`any`[] \| `null`\>

Die erstellten Datenbankzeilen oder `null`.

### deleteSchedule()

> **deleteSchedule**(`id`): `Promise`\<`void`\>

Löscht einen Zeitplan unwiderruflich.

#### Parameters

##### id

`string`

UUID des Zeitplans.

#### Returns

`Promise`\<`void`\>

### fetchAllSchedules()

> **fetchAllSchedules**(): `Promise`\<`any`[]\>

Lädt alle Zeitpläne inkl. Gerätedaten, aufsteigend nach Uhrzeit sortiert.
Normalisiert `action_value` aller Einträge mit normalizeActionValue.

#### Returns

`Promise`\<`any`[]\>

Array von [Schedule](../../../types/interfaces/Schedule.md)-Objekten.

### toggleSchedule()

> **toggleSchedule**(`id`, `is_active`): `Promise`\<`void`\>

Schaltet den Aktiv-Status eines Zeitplans um.

#### Parameters

##### id

`string`

UUID des Zeitplans.

##### is\_active

`boolean`

Neuer Aktiv-Status.

#### Returns

`Promise`\<`void`\>

### updateSchedule()

> **updateSchedule**(`id`, `payload`): `Promise`\<`any`[] \| `null`\>

Aktualisiert einen bestehenden Zeitplan.

#### Parameters

##### id

`string`

UUID des Zeitplans.

##### payload

`Pick`\<[`Schedule`](../../../types/interfaces/Schedule.md), `"name"` \| `"room_id"` \| `"device_id"` \| `"time"` \| `"days"` \| `"action_value"`\>

Neue Zeitplankonfiguration.

#### Returns

`Promise`\<`any`[] \| `null`\>

Die aktualisierten Datenbankzeilen oder `null`.
