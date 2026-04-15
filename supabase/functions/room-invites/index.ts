import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

type RoomMembershipRow = {
  user_id: string;
  room_id: string;
  role: "owner" | "member";
};

type RoomInviteRow = {
  id: string;
  room_id: string;
  email: string;
  invited_by: string;
  role: "member";
  status: "pending" | "accepted" | "declined";
  expires_at: string | null;
  accepted_at: string | null;
  created_at: string;
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceRole =
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ??
  Deno.env.get("SUPABASE_SERVICE_ROLE") ??
  Deno.env.get("SERVICE_ROLE_KEY") ??
  "";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function decodeJwtPayload(token: string) {
  const [, payload] = token.split(".");

  if (!payload) {
    throw jsonResponse({ error: "Invalid user session" }, 401);
  }

  const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
  const decoded = atob(padded);

  return JSON.parse(decoded) as { sub?: string; email?: string };
}

function getClients(req: Request) {
  const authHeader = req.headers.get("Authorization");

  if (!authHeader) {
    throw new Response(JSON.stringify({ error: "Missing authorization header" }), {
      status: 401,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }

  const adminClient = createClient(supabaseUrl, supabaseServiceRole);

  return { authHeader, adminClient };
}

async function requireUser(req: Request) {
  const { adminClient } = getClients(req);
  const token = req.headers.get("Authorization")!.replace("Bearer ", "");
  const payload = decodeJwtPayload(token);
  const userId = payload.sub;

  if (!userId) {
    throw jsonResponse({ error: "Invalid user session" }, 401);
  }

  const { data, error } = await adminClient.auth.admin.getUserById(userId);

  if (error || !data.user) {
    throw jsonResponse({ error: "Invalid user session" }, 401);
  }

  return { user: data.user, adminClient };
}

async function requireOwner(adminClient: ReturnType<typeof createClient>, roomId: string, userId: string) {
  const { data, error } = await adminClient
    .from("room_members")
    .select("room_id, role")
    .eq("room_id", roomId)
    .eq("user_id", userId)
    .single() as { data: RoomMembershipRow | null; error: unknown };

  if (error || !data || data.role !== "owner") {
    throw jsonResponse({ error: "Only room owners may manage invites" }, 403);
  }
}

async function requireRoomMember(adminClient: ReturnType<typeof createClient>, roomId: string, userId: string) {
  const { data, error } = await adminClient
    .from("room_members")
    .select("room_id, role")
    .eq("room_id", roomId)
    .eq("user_id", userId)
    .single() as { data: RoomMembershipRow | null; error: unknown };

  if (error || !data) {
    throw jsonResponse({ error: "Only room members may view this room" }, 403);
  }

  return data;
}

async function findUserByEmail(adminClient: ReturnType<typeof createClient>, email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const { data, error } = await adminClient.auth.admin.listUsers();

  if (error) {
    throw jsonResponse({ error: "Could not load auth users" }, 500);
  }

  return data.users.find((candidate) => candidate.email?.trim().toLowerCase() === normalizedEmail) ?? null;
}

async function listPendingInvites(req: Request) {
  const { user, adminClient } = await requireUser(req);
  const normalizedEmail = user.email?.trim().toLowerCase();

  if (!normalizedEmail) {
    return jsonResponse([]);
  }

  const { data, error } = await adminClient
    .from("room_invites")
    .select("id, room_id, email, role, status, expires_at, accepted_at, created_at, rooms(name)")
    .eq("email", normalizedEmail)
    .eq("status", "pending") as { data: Array<RoomInviteRow & { rooms?: { name?: string } | null }> | null; error: unknown };

  if (error) {
    return jsonResponse({ error: "Could not load pending invites" }, 500);
  }

  return jsonResponse(
    (data ?? []).map((invite) => ({
      id: invite.id,
      room_id: invite.room_id,
      room_name: invite.rooms?.name ?? "Unbekannter Raum",
      email: invite.email,
      role: invite.role,
      status: invite.status,
      expires_at: invite.expires_at,
      accepted_at: invite.accepted_at,
      created_at: invite.created_at,
    }))
  );
}

async function listRoomMembers(req: Request, roomId: string) {
  const { user, adminClient } = await requireUser(req);
  await requireRoomMember(adminClient, roomId, user.id);

  const { data, error } = await adminClient
    .from("room_members")
    .select("user_id, room_id, role")
    .eq("room_id", roomId) as { data: RoomMembershipRow[] | null; error: unknown };

  if (error) {
    return jsonResponse({ error: "Could not load room members" }, 500);
  }

  const members = await Promise.all(
    (data ?? []).map(async (membership) => {
      const userResult = await adminClient.auth.admin.getUserById(membership.user_id);
      return {
        user_id: membership.user_id,
        role: membership.role,
        email: userResult.data.user?.email ?? "Unbekannt",
      };
    })
  );

  return jsonResponse(members);
}

async function listRoomInvites(req: Request, roomId: string) {
  const { user, adminClient } = await requireUser(req);
  const membership = await requireRoomMember(adminClient, roomId, user.id);

  const { data, error } = await adminClient
    .from("room_invites")
    .select("id, room_id, email, role, status, expires_at, accepted_at, created_at")
    .eq("room_id", roomId)
    .in("status", membership.role === "owner" ? ["pending", "declined"] : ["pending"])
    .order("created_at", { ascending: false }) as { data: RoomInviteRow[] | null; error: unknown };

  if (error) {
    return jsonResponse({ error: "Could not load room invites" }, 500);
  }

  return jsonResponse(
    (data ?? []).map((invite) => ({
      id: invite.id,
      room_id: invite.room_id,
      room_name: "",
      email: invite.email,
      role: invite.role,
      status: invite.status,
      expires_at: invite.expires_at,
      accepted_at: invite.accepted_at,
      created_at: invite.created_at,
    }))
  );
}

async function createInvite(req: Request, roomId: string) {
  const { user, adminClient } = await requireUser(req);
  await requireOwner(adminClient, roomId, user.id);

  const body = await req.json();
  const email = String(body.email ?? "").trim().toLowerCase();

  if (!email) {
    return jsonResponse({ error: "Email is required" }, 400);
  }

  const targetUser = await findUserByEmail(adminClient, email);
  if (!targetUser) {
    return jsonResponse({ error: "Nur bereits registrierte Nutzer koennen eingeladen werden." }, 400);
  }

  const { data: existingMember } = await adminClient
    .from("room_members")
    .select("user_id")
    .eq("room_id", roomId)
    .eq("user_id", targetUser.id)
    .maybeSingle();

  if (existingMember) {
    return jsonResponse({ error: "Dieser Nutzer ist bereits Mitglied des Raums." }, 400);
  }

  const { data: existingInvite } = await adminClient
    .from("room_invites")
    .select("id")
    .eq("room_id", roomId)
    .eq("email", email)
    .eq("status", "pending")
    .maybeSingle();

  if (existingInvite) {
    return jsonResponse({ error: "Fuer diese E-Mail existiert bereits eine offene Einladung." }, 400);
  }

  const { data, error } = await adminClient
    .from("room_invites")
    .insert({
      room_id: roomId,
      email,
      invited_by: user.id,
      role: "member",
      status: "pending",
    })
    .select()
    .single() as { data: RoomInviteRow | null; error: unknown };

  if (error || !data) {
    return jsonResponse({ error: "Invite could not be created" }, 500);
  }

  return jsonResponse(data, 201);
}

async function removeMember(req: Request, roomId: string, memberUserId: string) {
  const { user, adminClient } = await requireUser(req);
  await requireOwner(adminClient, roomId, user.id);

  if (memberUserId === user.id) {
    return jsonResponse({ error: "Eigentuemer koennen sich nicht selbst entfernen." }, 400);
  }

  const { error } = await adminClient
    .from("room_members")
    .delete()
    .eq("room_id", roomId)
    .eq("user_id", memberUserId);

  if (error) {
    return jsonResponse({ error: "Member could not be removed" }, 500);
  }

  return jsonResponse({ message: "Mitglied erfolgreich entfernt." });
}

async function resendInvite(req: Request, inviteId: string) {
  const { user, adminClient } = await requireUser(req);

  const { data, error } = await adminClient
    .from("room_invites")
    .select("*")
    .eq("id", inviteId)
    .single() as { data: RoomInviteRow | null; error: unknown };

  if (error || !data) {
    return jsonResponse({ error: "Invite not found" }, 404);
  }

  await requireOwner(adminClient, data.room_id, user.id);

  const targetUser = await findUserByEmail(adminClient, data.email);
  if (!targetUser) {
    return jsonResponse({ error: "Nur bereits registrierte Nutzer koennen eingeladen werden." }, 400);
  }

  const { data: existingMember } = await adminClient
    .from("room_members")
    .select("user_id")
    .eq("room_id", data.room_id)
    .eq("user_id", targetUser.id)
    .maybeSingle();

  if (existingMember) {
    return jsonResponse({ error: "Dieser Nutzer ist bereits Mitglied des Raums." }, 400);
  }

  const { error: updateError } = await adminClient
    .from("room_invites")
    .update({
      status: "pending",
      accepted_at: null,
      invited_by: user.id,
      created_at: new Date().toISOString(),
    })
    .eq("id", inviteId);

  if (updateError) {
    return jsonResponse({ error: "Invite could not be resent" }, 500);
  }

  return jsonResponse({ message: "Einladung erneut gesendet." });
}

async function deleteInvite(req: Request, inviteId: string) {
  const { user, adminClient } = await requireUser(req);

  const { data, error } = await adminClient
    .from("room_invites")
    .select("id, room_id")
    .eq("id", inviteId)
    .single() as { data: Pick<RoomInviteRow, "id" | "room_id"> | null; error: unknown };

  if (error || !data) {
    return jsonResponse({ error: "Invite not found" }, 404);
  }

  await requireOwner(adminClient, data.room_id, user.id);

  const { error: deleteError } = await adminClient
    .from("room_invites")
    .delete()
    .eq("id", inviteId);

  if (deleteError) {
    return jsonResponse({ error: "Invite could not be deleted" }, 500);
  }

  return jsonResponse({ message: "Einladung geloescht." });
}

async function respondToInvite(req: Request, inviteId: string, action: "accept" | "decline") {
  const { user, adminClient } = await requireUser(req);
  const normalizedEmail = user.email?.trim().toLowerCase();

  if (!normalizedEmail) {
    return jsonResponse({ error: "No email found for current user" }, 400);
  }

  const { data, error } = await adminClient
    .from("room_invites")
    .select("*")
    .eq("id", inviteId)
    .single() as { data: RoomInviteRow | null; error: unknown };

  if (error || !data) {
    return jsonResponse({ error: "Invite not found" }, 404);
  }

  if (data.email.trim().toLowerCase() !== normalizedEmail) {
    return jsonResponse({ error: "Diese Einladung gehoert nicht zu diesem Nutzer." }, 403);
  }

  if (data.status !== "pending") {
    return jsonResponse({ error: "Diese Einladung ist nicht mehr offen." }, 400);
  }

  if (action === "accept") {
    const { data: existingMembership } = await adminClient
      .from("room_members")
      .select("user_id")
      .eq("room_id", data.room_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!existingMembership) {
      const { error: membershipError } = await adminClient
        .from("room_members")
        .insert({
          room_id: data.room_id,
          user_id: user.id,
          role: data.role,
        });

      if (membershipError) {
        return jsonResponse({ error: "Mitgliedschaft konnte nicht erstellt werden." }, 500);
      }
    }
  }

  const updatePayload =
    action === "accept"
      ? { status: "accepted", accepted_at: new Date().toISOString() }
      : { status: "declined" };

  const { error: updateError } = await adminClient
    .from("room_invites")
    .update(updatePayload)
    .eq("id", inviteId);

  if (updateError) {
    return jsonResponse({ error: "Invite response could not be saved" }, 500);
  }

  return jsonResponse({
    message: action === "accept" ? "Einladung angenommen." : "Einladung abgelehnt.",
    room_id: data.room_id,
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/+|\/+$/g, "");
    const rawSegments = path.split("/");
    const segments = rawSegments[0] === "room-invites" ? rawSegments.slice(1) : rawSegments;

    if (req.method === "GET" && segments[0] === "pending") {
      return await listPendingInvites(req);
    }

    if (segments[0] === "rooms" && segments[1]) {
      const roomId = segments[1];

      if (req.method === "GET" && segments[2] === "members") {
        return await listRoomMembers(req, roomId);
      }

      if (req.method === "GET" && segments[2] === "invites") {
        return await listRoomInvites(req, roomId);
      }

      if (req.method === "POST" && segments[2] === "invites") {
        return await createInvite(req, roomId);
      }

      if (req.method === "DELETE" && segments[2] === "members" && segments[3]) {
        return await removeMember(req, roomId, segments[3]);
      }
    }

    if (req.method === "POST" && segments[0] === "invites" && segments[1] && (segments[2] === "accept" || segments[2] === "decline")) {
      return await respondToInvite(req, segments[1], segments[2]);
    }

    if (req.method === "POST" && segments[0] === "invites" && segments[1] && segments[2] === "resend") {
      return await resendInvite(req, segments[1]);
    }

    if (req.method === "DELETE" && segments[0] === "invites" && segments[1]) {
      return await deleteInvite(req, segments[1]);
    }

    return jsonResponse({ error: "Not found" }, 404);
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    console.error(error);
    return jsonResponse({ error: "Unexpected function error" }, 500);
  }
});
