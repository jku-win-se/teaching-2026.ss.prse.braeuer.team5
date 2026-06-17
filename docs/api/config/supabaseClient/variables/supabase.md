[**team5-smart-home**](../../../README.md)

***

[team5-smart-home](../../../README.md) / [config/supabaseClient](../README.md) / supabase

# Variable: supabase

> `const` **supabase**: `SupabaseClient`\<`any`, `"public"`, `"public"`, `any`, `any`\> \| `null`

Defined in: [config/supabaseClient.ts:18](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/config/supabaseClient.ts#L18)

Initialisierter Supabase-Client für alle Datenbankoperationen, Auth und Realtime.
Ist `null` wenn [isSupabaseConfigured](isSupabaseConfigured.md) `false` ist (fehlende `.env`-Variablen).
Alle Services und Hooks prüfen auf `null` bevor sie den Client verwenden.
