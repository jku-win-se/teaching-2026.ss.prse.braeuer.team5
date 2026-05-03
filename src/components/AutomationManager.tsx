import React, { useEffect } from 'react';
import { scheduleService } from '../services/scheduleService';

export const AutomationManager: React.FC = () => {
  useEffect(() => {
    scheduleService.checkAndExecuteSchedules();

    const interval = setInterval(() => {
      scheduleService.checkAndExecuteSchedules();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return null;
};