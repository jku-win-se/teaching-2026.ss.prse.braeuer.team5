import { useEffect } from "react";
import { scheduleService } from "../services/scheduleService";
import { vacationModeService } from "../services/vacationModeService";

/**
 * React-Hook für die zentrale Automatisierungsschleife.
 *
 * Läuft jede Minute via `setInterval` und führt nacheinander aus:
 * 1. {@link vacationModeService.checkAndExecuteVacationMode} – Urlaubsmodus prüfen
 * 2. {@link scheduleService.checkAndExecuteSchedules} – Zeitpläne prüfen
 *
 * Startet sofort nach dem ersten Render (ohne initialen Delay) und
 * bereinigt Timer beim Unmount oder bei Session-Verlust.
 *
 * @param session - Aktuelle Supabase-Session (aus {@link useAuth}).
 *                  Der Hook ist inaktiv wenn `session` falsy ist.
 */
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
