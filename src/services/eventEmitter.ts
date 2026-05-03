import { logAction } from './logService';
import { type ActivityLog } from '../types';

type EventPayload = Omit<ActivityLog, 'id' | 'created_at'>;

class AppEventEmitter {
  async emitChange(payload: EventPayload) {
    console.log(`Event ausgelöst: ${payload.action}`, payload);
    
    await logAction(payload);
  }
}

export const eventBus = new AppEventEmitter();