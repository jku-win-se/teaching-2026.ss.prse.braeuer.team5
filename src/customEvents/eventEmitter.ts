import { logAction } from '../services/logService';
import { type ActivityLog } from '../types';

type EventPayload = Omit<ActivityLog, 'id' | 'created_at'>;

class AppEventEmitter {
  async emitChange(payload: EventPayload) {
    //console.log(`[EventBus] Verarbeite: ${payload.action}`);
    
    try {
      await logAction({
        room_id: payload.room_id,
        device_id: payload.device_id,
        action: payload.action,
        new_value: payload.new_value,
        actor_type: payload.actor_type,
        user_id: payload.user_id || null
      });
      //console.log("[EventBus] Log erfolgreich geschrieben");
    } catch (err) {
      console.error("[EventBus] Fehler beim Loggen:", err);
    }
  }
}

export const eventBus = new AppEventEmitter();