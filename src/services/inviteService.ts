import { supabase } from "../config/supabaseClient";
import type { RoomInvite, RoomMember } from "../types";
import { eventBus } from "./eventEmitter";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const inviteFunctionBaseUrl = `${supabaseUrl}/functions/v1/room-invites`;

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

async function getDetailedActorType(roomId?: string): Promise<string> {
  if (!roomId) return 'user';
  const role = await fetchRoomRole(roomId);
  return role ? `user (${role})` : 'user';
}

async function getCurrentUserId(): Promise<string | null> {
  return (await supabase?.auth.getUser())?.data?.user?.id ?? null;
}

async function getAccessToken(): Promise<string | null> {
  if (!supabase) return null;

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.access_token ?? null;
}

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

export async function fetchPendingRoomInvites(): Promise<RoomInvite[]> {
  return invokeInviteFunction<RoomInvite[]>("/pending");
}

export async function fetchRoomMembers(roomId: string): Promise<RoomMember[]> {
  return invokeInviteFunction<RoomMember[]>(`/rooms/${roomId}/members`);
}

export async function fetchRoomInvites(roomId: string): Promise<RoomInvite[]> {
  return invokeInviteFunction<RoomInvite[]>(`/rooms/${roomId}/invites`);
}

export async function createRoomInvite(roomId: string, email: string) {
  const userId = await getCurrentUserId();
  const actorType = await getDetailedActorType(roomId);
  
  const result = await invokeInviteFunction(`/rooms/${roomId}/invites`, "POST", { email });
  
  await eventBus.emitChange({
    room_id: roomId,
    action: "Invite Created",
    new_value: `Einladung gesendet an: ${email}`,
    actor_type: actorType, // NEU
    user_id: userId || undefined
  });
  
  return result;
}

export async function removeRoomMember(roomId: string, memberUserId: string) {
  const userId = await getCurrentUserId();
  const actorType = await getDetailedActorType(roomId);

  await eventBus.emitChange({
    room_id: roomId,
    action: "Member Removed",
    new_value: `Mitglied (ID: ${memberUserId}) entfernt`,
    actor_type: actorType, // NEU
    user_id: userId || undefined
  });

  const result = await invokeInviteFunction(`/rooms/${roomId}/members/${memberUserId}`, "DELETE");
  
  return result;
}

export async function resendRoomInvite(inviteId: string) {
  const userId = await getCurrentUserId();
  const result = await invokeInviteFunction(`/invites/${inviteId}/resend`, "POST");
  
  await eventBus.emitChange({
    action: "Invite Resent",
    new_value: `Einladung (ID: ${inviteId}) erneut gesendet`,
    actor_type: 'user',
    user_id: userId || undefined
  });
  
  return result;
}

export async function deleteRoomInvite(inviteId: string) {
  const userId = await getCurrentUserId();
    
  await eventBus.emitChange({
    action: "Invite Deleted",
    new_value: `Einladung (ID: ${inviteId}) gelöscht`,
    actor_type: 'user',
    user_id: userId || undefined
  });

  const result = await invokeInviteFunction(`/invites/${inviteId}`, "DELETE");
  
  return result;
}

export async function respondToRoomInvite(inviteId: string, action: "accept" | "decline") {
  const userId = await getCurrentUserId();
  const result = await invokeInviteFunction(`/invites/${inviteId}/${action}`, "POST");
  
  await eventBus.emitChange({
    action: `Invite ${action === 'accept' ? 'Accepted' : 'Declined'}`,
    new_value: `Einladung ${inviteId} wurde ${action === 'accept' ? 'angenommen' : 'abgelehnt'}`,
    actor_type: 'user',
    user_id: userId || undefined
  });
  
  return result;
}