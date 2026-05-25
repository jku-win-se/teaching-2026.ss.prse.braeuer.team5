import { useEffect } from "react";
import { scheduleService } from "../services/scheduleService";
import { vacationModeService } from "../services/vacationModeService";

// Läuft jede Minute und führt Zeitpläne + Urlaubsmodus aus
export function useAutomation() {
  useEffect(() => {
    const run = async () => {
      await vacationModeService.checkAndExecuteVacationMode();
      await scheduleService.checkAndExecuteSchedules();
    };

    run();
    const interval = setInterval(run, 60_000);
    return () => clearInterval(interval);
  }, []);
}
