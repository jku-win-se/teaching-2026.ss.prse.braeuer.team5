[**team5-smart-home**](../../../README.md)

***

[team5-smart-home](../../../README.md) / [hooks/useAutomation](../README.md) / useAutomation

# Function: useAutomation()

> **useAutomation**(`session`): `void`

Defined in: [hooks/useAutomation.ts:18](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/hooks/useAutomation.ts#L18)

React-Hook für die zentrale Automatisierungsschleife.

Läuft jede Minute via `setInterval` und führt nacheinander aus:
1. [vacationModeService.checkAndExecuteVacationMode](../../../services/vacationModeService/variables/vacationModeService.md#checkandexecutevacationmode) – Urlaubsmodus prüfen
2. [scheduleService.checkAndExecuteSchedules](../../../services/scheduleService/variables/scheduleService.md#checkandexecuteschedules) – Zeitpläne prüfen

Startet sofort nach dem ersten Render (ohne initialen Delay) und
bereinigt Timer beim Unmount oder bei Session-Verlust.

## Parameters

### session

`unknown`

Aktuelle Supabase-Session (aus useAuth).
                 Der Hook ist inaktiv wenn `session` falsy ist.

## Returns

`void`
