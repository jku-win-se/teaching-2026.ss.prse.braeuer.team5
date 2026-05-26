import { useEffect } from "react";
import { scheduleService } from "../services/scheduleService";
import { vacationModeService } from "../services/vacationModeService";

// Läuft jede Minute und führt zentrale Automations-Aufgaben aus:
// Urlaubsmodus + Zeitpläne. Dadurch braucht es nur noch einen Hook.
export function useAutomation(session: unknown) {
  useEffect(() => {
    if (!session) {
      return;
    }

    let isMounted = true;

    const run = async () => {
      if (!isMounted) return;
      try {
        await vacationModeService.checkAndExecuteVacationMode();
      } catch (e) {
        console.error('[Automation] Urlaubsmodus Fehler:', e);
      }
      if (!isMounted) return;
      try {
        await scheduleService.checkAndExecuteSchedules();
      } catch (e) {
        console.error('[Automation] Zeitplan Fehler:', e);
      }
    };

    const initialTimer = setTimeout(run, 0);
    const interval = setInterval(run, 60_000);
    return () => {
      isMounted = false;
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [session]);
}
