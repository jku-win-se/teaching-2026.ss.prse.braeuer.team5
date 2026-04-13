import { supabase } from "../config/supabaseClient";
import type { RoomInvite, RoomMember } from "../types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const inviteFunctionBaseUrl = `${supabaseUrl}/functions/v1/room-invites`;

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
  return invokeInviteFunction(`/rooms/${roomId}/invites`, "POST", { email });
}

export async function removeRoomMember(roomId: string, memberUserId: string) {
  return invokeInviteFunction(`/rooms/${roomId}/members/${memberUserId}`, "DELETE");
}

export async function resendRoomInvite(inviteId: string) {
  return invokeInviteFunction(`/invites/${inviteId}/resend`, "POST");
}

export async function deleteRoomInvite(inviteId: string) {
  return invokeInviteFunction(`/invites/${inviteId}`, "DELETE");
}

export async function respondToRoomInvite(inviteId: string, action: "accept" | "decline") {
  return invokeInviteFunction(`/invites/${inviteId}/${action}`, "POST");
}
