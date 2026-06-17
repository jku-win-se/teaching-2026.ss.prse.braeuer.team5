import { supabase } from "../config/supabaseClient";
import { logAction } from "./logService";
import { sceneService } from "./sceneService";
import type { VacationMode, Scene } from "../types";

/**
 * Formatiert ein Date-Objekt als `YYYY-MM-DD` String.
 * @param d - Das zu formatierende Datum.
 * @returns ISO-Datumsstring ohne Uhrzeit.
 */
function toDateString(d: Date): string {
  return d.toISOString().split("T")[0];
}

/** Service-Objekt für alle Urlaubsmodus-Operationen (CRUD + automatische Ausführung). */
export const vacationModeService = {

  /**
   * Lädt alle Urlaubsmodus-Einträge inkl. verknüpfter Szenen und Räume,
   * aufsteigend nach Startdatum sortiert.
   * @returns Array von {@link VacationMode}-Objekten.
   */
  async fetchAll(): Promise<VacationMode[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from("vacation_mode")
      .select("*, scenes (name), rooms (id, name)")
      .order("start_date", { ascending: true });
    if (error) throw error;
    return (data as VacationMode[]) || [];
  },

  /**
   * Erstellt einen neuen Urlaubsmodus-Eintrag. Startet sofort aktiviert.
   * @param payload - Name, Szenen-UUID, Start-/Enddatum und tägliche Aktivierungszeit.
   * @returns Die erstellten Datenbankzeilen oder `null`.
   */
  async create(payload: Pick<VacationMode, "name" | "scene_id" | "start_date" | "end_date" | "daily_time">) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from("vacation_mode")
      .insert([{ ...payload, is_active: true }])
      .select();
    if (error) throw error;
    return data;
  },

  /**
   * Aktualisiert einen bestehenden Urlaubsmodus-Eintrag.
   * @param id - UUID des Eintrags.
   * @param payload - Neue Konfiguration.
   * @returns Die aktualisierten Datenbankzeilen oder `null`.
   */
  async update(id: string, payload: Pick<VacationMode, "name" | "scene_id" | "start_date" | "end_date" | "daily_time">) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from("vacation_mode")
      .update(payload)
      .eq("id", id)
      .select();
    if (error) throw error;
    return data;
  },

  /**
   * Ordnet Räume einem Urlaubsmodus zu (ersetzt bestehende Zuordnungen).
   * Setzt `vacation_mode_id` in der `rooms`-Tabelle direkt.
   * @param vacationModeId - UUID des Urlaubsmodus.
   * @param roomIds - Array von Raum-UUIDs, die zugeordnet werden sollen.
   */
  async assignRooms(vacationModeId: string, roomIds: string[]) {
    if (!supabase) return;
    // Unassign rooms currently linked to this vacation mode
    await supabase
      .from("rooms")
      .update({ vacation_mode_id: null })
      .eq("vacation_mode_id", vacationModeId);
    // Assign selected rooms
    if (roomIds.length > 0) {
      await supabase
        .from("rooms")
        .update({ vacation_mode_id: vacationModeId })
        .in("id", roomIds);
    }
  },

  /**
   * Schaltet den Aktiv-Status eines Urlaubsmodus um.
   * @param id - UUID des Eintrags.
   * @param is_active - Neuer Aktiv-Status.
   */
  async toggle(id: string, is_active: boolean) {
    if (!supabase) return;
    const { error } = await supabase
      .from("vacation_mode")
      .update({ is_active })
      .eq("id", id);
    if (error) throw error;
  },

  /**
   * Löscht einen Urlaubsmodus-Eintrag. Raum-Verknüpfungen werden durch
   * die DB-Constraint `ON DELETE SET NULL` automatisch aufgelöst.
   * @param id - UUID des Eintrags.
   */
  async delete(id: string) {
    if (!supabase) return;
    const { error } = await supabase.from("vacation_mode").delete().eq("id", id);
    if (error) throw error;
  },

  /**
   * Gibt alle Raum-UUIDs zurück, für die heute ein aktiver Urlaubsmodus gilt.
   * Wird von {@link scheduleService.checkAndExecuteSchedules} verwendet,
   * um Zeitpläne in Urlaubsräumen zu überspringen.
   * @returns Set mit Raum-UUIDs.
   */
  async getActiveVacationRoomIds(): Promise<Set<string>> {
    if (!supabase) return new Set();
    const today = toDateString(new Date());
    const { data } = await supabase
      .from("vacation_mode")
      .select("rooms (id)")
      .eq("is_active", true)
      .lte("start_date", today)
      .gte("end_date", today);
    const roomIds = ((data || []) as { rooms: { id: string }[] }[])
      .flatMap((vm) => (vm.rooms || []).map((r) => r.id));
    return new Set(roomIds);
  },

  /**
   * Prüft alle aktiven Urlaubsmodi gegen die aktuelle Uhrzeit und aktiviert
   * bei Übereinstimmung die verknüpfte Szene via {@link sceneService.activateScene}.
   *
   * Deaktiviert automatisch alle Einträge, deren `end_date` in der Vergangenheit liegt.
   * Wird von {@link useAutomation} jede Minute aufgerufen.
   * Schreibt für jeden betroffenen Raum einen Aktivitäts-Log-Eintrag.
   */
  async checkAndExecuteVacationMode() {
    if (!supabase) return;

    const now = new Date();
    const today = toDateString(now);
    const currentTime = now.toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    // Abgelaufene Modi automatisch deaktivieren
    await supabase
      .from("vacation_mode")
      .update({ is_active: false })
      .eq("is_active", true)
      .lt("end_date", today);

    // Aktive Modi für heute holen
    const { data: activeModes, error } = await supabase
      .from("vacation_mode")
      .select("*, scenes (*), rooms (id)")
      .eq("is_active", true)
      .lte("start_date", today)
      .gte("end_date", today);

    if (error || !activeModes || activeModes.length === 0) return;

    for (const mode of activeModes) {
      const modeTime = typeof mode.daily_time === "string"
        ? mode.daily_time.substring(0, 5)
        : "";
      if (modeTime !== currentTime) continue;
      if (!mode.scenes) continue;

      await sceneService.activateScene(mode.scenes as Scene);

      const roomIds: string[] = (mode.rooms || []).map((r: { id: string }) => r.id);
      const logText = `Urlaubsmodus "${mode.name}": Szene "${mode.scenes.name}" aktiviert`;

      for (const roomId of roomIds) {
        await logAction({
          room_id: roomId,
          action: "Urlaubsmodus ausgeführt",
          new_value: logText,
          actor_type: "automation",
          user_id: undefined,
        });
      }
    }
  },
};
