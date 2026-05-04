import React, { useEffect } from 'react';
import { scheduleService } from '../services/scheduleService';
import { ruleService } from '../services/ruleService';

export const AutomationManager: React.FC = () => {
  useEffect(() => {
    scheduleService.checkAndExecuteSchedules();
    ruleService.checkAndExecuteRules();

    const interval = setInterval(() => {
      scheduleService.checkAndExecuteSchedules();
      ruleService.checkAndExecuteRules();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return null;
};