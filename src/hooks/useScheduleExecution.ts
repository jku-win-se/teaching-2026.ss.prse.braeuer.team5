import { useEffect } from 'react';
import { scheduleService } from '../services/scheduleService';

export const useScheduleExecution = (session: unknown) => {
  useEffect(() => {
    if (!session) {
      return;
    }

    let isMounted = true;

    const runScheduleCheck = async () => {
      if (!isMounted) {
        return;
      }

      await scheduleService.checkAndExecuteSchedules();
    };

    void runScheduleCheck();
    const intervalId = window.setInterval(() => {
      void runScheduleCheck();
    }, 60000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [session]);
};
