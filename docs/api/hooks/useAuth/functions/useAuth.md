[**team5-smart-home**](../../../README.md)

***

[team5-smart-home](../../../README.md) / [hooks/useAuth](../README.md) / useAuth

# Function: useAuth()

> **useAuth**(): `object`

Defined in: [hooks/useAuth.ts:16](https://github.com/jku-win-se/teaching-2026.ss.prse.braeuer.team5/blob/main/src/hooks/useAuth.ts#L16)

React-Hook für die Supabase-Authentifizierung.

Abonniert Auth-Zustandsänderungen (Login, Logout, Token-Refresh) und
räumt die Subscription beim Unmount automatisch auf.
Liest beim initialen Mount die vorhandene Session aus.

## Returns

`object`

- `session` – aktuelle Supabase-Session oder `null` wenn nicht eingeloggt
- `loading` – `true` während des initialen Session-Checks

### loading

> **loading**: `boolean`

### session

> **session**: `Session` \| `null`
