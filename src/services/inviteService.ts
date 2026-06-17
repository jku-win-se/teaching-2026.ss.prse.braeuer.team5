import { supabase } from "../config/supabaseClient";
import { logAction } from "./logService";
import type { RoomInvite, RoomMember } from "../types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const inviteFunctionBaseUrl = `${supabaseUrl}/functions/v1/room-invites`;

/**
 * Gibt die Rolle des aktuellen Nutzers in einem Raum zurück.
 * Liest aus der View `room_permissions`.
 * @param roomId - UUID des Raums.
 * @returns Rollenstring oder `null`.
 */
async function fetchRoomRole(roomId: string): Promise<string | null> {
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('room_permissions')
    .select('role')
    .eq('room_id', roomId)
    .eq('user_id', user.id)
    .single();

  return data?.role || null;
}

/**
 * Gibt einen erweiterten `actor_type`-String zurück, der die Rolle enthält.
 * Wird für Aktivitäts-Logs verwendet.
 * @param roomId - UUID des Raums (optional).
 * @returns Z. B. `"user (owner)"` oder `"user"`.
 */
async function getDetailedActorType(roomId?: string): Promise<string> {
  if (!roomId) return 'user';
  const role = await fetchRoomRole(roomId);
  return role ? `user (${role})` : 'user';
}

/**
 * Gibt die UUID des aktuell authentifizierten Nutzers zurück.
 * @returns Nutzer-UUID oder `null` wenn keine Session vorhanden ist.
 */
async function getCurrentUserId(): Promise<string | null> {
  return (await supabase?.auth.getUser())?.data?.user?.id ?? null;
}

/**
 * Gibt das aktuelle Supabase-Session-Access-Token zurück.
 * Wird für API-Aufrufe an die Edge Function benötigt.
 * @returns JWT-Token-String oder `null`.
 */
async function getAccessToken(): Promise<string | null> {
  if (!supabase) return null;

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.access_token ?? null;
}

/**
 * Generische Hilfsfunktion zum Aufruf der `room-invites` Edge Function.
 * @param path - Pfadsuffix relativ zur Basis-URL (z. B. `"/pending"`).
 * @param method - HTTP-Methode (Standard: `"GET"`).
 * @param body - Optionaler Request-Body (wird als JSON serialisiert).
 * @returns Typisiertes Response-Objekt.
 * @throws Wenn kein Access-Token vorhanden ist oder die Antwort einen Fehler enthält.
 */
async function invokeInviteFunction<T>(path: string, method = "GET", body?: unknown): Promise<T> {
  const token = await getAccessToken();

  if (!token) {
    throw new Error("Keine aktive Session gefunden.");
  }

  const response = await fetch(`${inviteFunctionBaseUrl}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error ?? "Unbekannter Invite-Fehler");
  }

  return data as T;
}

/**
 * Lädt alle offenen (pending) Einladungen für den aktuellen Nutzer.
 * @returns Array von {@link RoomInvite}-Objekten.
 */
export async function fetchPendingRoomInvites(): Promise<RoomInvite[]> {
  return invokeInviteFunction<RoomInvite[]>("/pending");
}

/**
 * Lädt alle Mitglieder eines bestimmten Raums.
 * @param roomId - UUID des Raums.
 * @returns Array von {@link RoomMember}-Objekten.
 */
export async function fetchRoomMembers(roomId: string): Promise<RoomMember[]> {
  return invokeInviteFunction<RoomMember[]>(`/rooms/${roomId}/members`);
}

/**
 * Lädt alle Einladungen für einen bestimmten Raum (alle Status).
 * @param roomId - UUID des Raums.
 * @returns Array von {@link RoomInvite}-Objekten.
 */
export async function fetchRoomInvites(roomId: string): Promise<RoomInvite[]> {
  return invokeInviteFunction<RoomInvite[]>(`/rooms/${roomId}/invites`);
}

/**
 * Erstellt eine neue Einladung und sendet sie an die angegebene E-Mail-Adresse.
 * Schreibt einen Aktivitäts-Log-Eintrag.
 * @param roomId - UUID des Raums.
 * @param email - E-Mail-Adresse des Einzuladenden.
 * @returns Antwort der Edge Function.
 */
export async function createRoomInvite(roomId: string, email: string) {
  const userId = await getCurrentUserId();
  const actorType = await getDetailedActorType(roomId);

  const result = await invokeInviteFunction(`/rooms/${roomId}/invites`, "POST", { email });

  await logAction({
    room_id: roomId,
    action: "Invite Created",
    new_value: `Einladung gesendet an: ${email}`,
    actor_type: actorType,
    user_id: userId || undefined,
  });

  return result;
}

/**
 * Entfernt ein Mitglied aus einem Raum.
 * Schreibt einen Aktivitäts-Log-Eintrag.
 * @param roomId - UUID des Raums.
 * @param memberUserId - UUID des zu entfernenden Mitglieds.
 * @returns Antwort der Edge Function.
 */
export async function removeRoomMember(roomId: string, memberUserId: string) {
  const userId = await getCurrentUserId();
  const actorType = await getDetailedActorType(roomId);

  await logAction({
    room_id: roomId,
    action: "Member Removed",
    new_value: `Mitglied (ID: ${memberUserId}) entfernt`,
    actor_type: actorType,
    user_id: userId || undefined,
  });

  const result = await invokeInviteFunction(`/rooms/${roomId}/members/${memberUserId}`, "DELETE");

  return result;
}

/**
 * Sendet eine bestehende Einladung erneut.
 * Schreibt einen Aktivitäts-Log-Eintrag.
 * @param inviteId - UUID der Einladung.
 * @returns Antwort der Edge Function.
 */
export async function resendRoomInvite(inviteId: string) {
  const userId = await getCurrentUserId();
  const result = await invokeInviteFunction(`/invites/${inviteId}/resend`, "POST");

  await logAction({
    action: "Invite Resent",
    new_value: `Einladung (ID: ${inviteId}) erneut gesendet`,
    actor_type: 'user',
    user_id: userId || undefined,
  });

  return result;
}

/**
 * Löscht eine Einladung unwiderruflich.
 * Schreibt einen Aktivitäts-Log-Eintrag.
 * @param inviteId - UUID der Einladung.
 * @returns Antwort der Edge Function.
 */
export async function deleteRoomInvite(inviteId: string) {
  const userId = await getCurrentUserId();

  await logAction({
    action: "Invite Deleted",
    new_value: `Einladung (ID: ${inviteId}) gelöscht`,
    actor_type: 'user',
    user_id: userId || undefined,
  });

  const result = await invokeInviteFunction(`/invites/${inviteId}`, "DELETE");

  return result;
}

/**
 * Nimmt eine Einladung an oder lehnt sie ab.
 * Schreibt einen Aktivitäts-Log-Eintrag.
 * @param inviteId - UUID der Einladung.
 * @param action - `"accept"` um beizutreten, `"decline"` um abzulehnen.
 * @returns Antwort der Edge Function.
 */
export async function respondToRoomInvite(inviteId: string, action: "accept" | "decline") {
  const userId = await getCurrentUserId();
  const result = await invokeInviteFunction(`/invites/${inviteId}/${action}`, "POST");

  await logAction({
    action: `Invite ${action === 'accept' ? 'Accepted' : 'Declined'}`,
    new_value: `Einladung ${inviteId} wurde ${action === 'accept' ? 'angenommen' : 'abgelehnt'}`,
    actor_type: 'user',
    user_id: userId || undefined,
  });

  return result;
}
