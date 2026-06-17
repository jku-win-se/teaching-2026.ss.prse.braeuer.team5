[**team5-smart-home**](../../../README.md)

***

[team5-smart-home](../../../README.md) / [services/ruleService](../README.md) / ruleService

# Variable: ruleService

> `const` **ruleService**: `object`

Defined in: [services/ruleService.ts:71](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/services/ruleService.ts#L71)

Service-Objekt für alle Regel-Operationen (CRUD + Regelausführung).

## Type Declaration

### checkAndExecuteRulesForDevice()

> **checkAndExecuteRulesForDevice**(`deviceId`): `Promise`\<`void`\>

Prüft und führt alle aktiven Regeln aus, die durch eine Zustandsänderung
des angegebenen Geräts ausgelöst werden könnten.

Ablauf pro Regel:
1. Cooldown-Prüfung (`cool_down_ms`)
2. Zustand des Auslöser-Geräts laden
3. Bedingung mit [evaluateCondition](../functions/evaluateCondition.md) prüfen
4. Ziel-Gerät aktualisieren und `last_triggered_at` setzen
5. [ruleNotifier](../../../customEvents/ruleNotifier/variables/ruleNotifier.md) emittiert den Regelnamen (für UI-Overlay)
6. Aktivitäts-Log-Eintrag schreiben

#### Parameters

##### deviceId

`string`

UUID des Geräts, das seinen Zustand geändert hat.

#### Returns

`Promise`\<`void`\>

### createRule()

> **createRule**(`payload`): `Promise`\<`any`[] \| `null`\>

Erstellt eine neue Regel mit Standard-Cooldown von 500 ms.
Die Regel wird sofort aktiviert (`is_active: true`).

#### Parameters

##### payload

`RulePayload`

Regelkonfiguration (Name, Gerät, Bedingung, Aktion).

#### Returns

`Promise`\<`any`[] \| `null`\>

Die erstellten Datenbankzeilen oder `null`.

### deleteRule()

> **deleteRule**(`id`): `Promise`\<`void`\>

Löscht eine Regel unwiderruflich.

#### Parameters

##### id

`string`

UUID der Regel.

#### Returns

`Promise`\<`void`\>

### fetchAllRules()

> **fetchAllRules**(): `Promise`\<`any`[]\>

Lädt alle Regeln absteigend nach Erstellungsdatum.

#### Returns

`Promise`\<`any`[]\>

Array von [Rule](../../../types/interfaces/Rule.md)-Objekten oder leeres Array.

### getRulesForDevice()

> **getRulesForDevice**(`deviceId`): `Promise`\<\[\] \| [`Rule`](../../../types/interfaces/Rule.md)[]\>

Lädt alle Regeln, die einem bestimmten Gerät als Auslöser zugeordnet sind.

#### Parameters

##### deviceId

`string`

UUID des Auslöser-Geräts.

#### Returns

`Promise`\<\[\] \| [`Rule`](../../../types/interfaces/Rule.md)[]\>

Array von [Rule](../../../types/interfaces/Rule.md)-Objekten oder leeres Array.

### toggleRule()

> **toggleRule**(`id`, `is_active`): `Promise`\<`void`\>

Schaltet den Aktiv-Status einer Regel um.

#### Parameters

##### id

`string`

UUID der Regel.

##### is\_active

`boolean`

Neuer Aktiv-Status.

#### Returns

`Promise`\<`void`\>

### updateRule()

> **updateRule**(`id`, `payload`): `Promise`\<`any`[] \| `null`\>

Aktualisiert eine bestehende Regel.

#### Parameters

##### id

`string`

UUID der Regel.

##### payload

`RulePayload`

Neue Regelkonfiguration.

#### Returns

`Promise`\<`any`[] \| `null`\>

Die aktualisierten Datenbankzeilen oder `null`.
