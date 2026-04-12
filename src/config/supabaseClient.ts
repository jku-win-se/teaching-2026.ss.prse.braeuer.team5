import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUB_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl as string, supabaseKey as string)
  : null;


// Optional: Direkt hier einen Test-Login durchführen, damit die Tests und die App direkt loslegen können.
// ACHTUNG: Das ist natürlich nur für Testzwecke und sollte in einer echten App so nicht gemacht werden!

if (!supabase) { 
  alert("Supabase-URL oder Public Key fehlen! Bitte in der .env Datei setzen.");
} else {
  // TEST-LOGIN: Einfach direkt hier drunter klatschen
  supabase.auth.signInWithPassword({
    email: 'test@example.com',
    password: '1234'
  }).then(({ error }) => {
    if (error) alert("Login fehlgeschlagen: " + error.message);
  });
}