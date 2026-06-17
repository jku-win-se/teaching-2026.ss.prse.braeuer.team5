import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUB_KEY;

/**
 * Gibt an, ob die Supabase-Umgebungsvariablen (`VITE_SUPABASE_URL` und
 * `VITE_SUPABASE_PUB_KEY`) gesetzt sind. Wird verwendet um fehlende
 * Konfiguration frühzeitig zu erkennen.
 */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

/**
 * Initialisierter Supabase-Client für alle Datenbankoperationen, Auth und Realtime.
 * Ist `null` wenn {@link isSupabaseConfigured} `false` ist (fehlende `.env`-Variablen).
 * Alle Services und Hooks prüfen auf `null` bevor sie den Client verwenden.
 */
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl as string, supabaseKey as string)
  : null;

if (!supabase) {
  alert("Supabase-URL oder Public Key fehlen! Bitte in der .env Datei setzen.");
}
