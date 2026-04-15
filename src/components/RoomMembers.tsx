import { useCallback, useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { RoomInvite, RoomRole, RoomMember } from "../types";
import {
  createRoomInvite,
  deleteRoomInvite,
  fetchRoomInvites,
  fetchRoomMembers,
  removeRoomMember,
  resendRoomInvite,
} from "../services/inviteService";
import "./RoomMembers.css";

type RoomMembersProps = {
  roomId?: string;
  role: RoomRole | null;
  canManage: boolean;
};

export function RoomMembers({ roomId, role, canManage }: RoomMembersProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [pendingInvites, setPendingInvites] = useState<RoomInvite[]>([]);
  const [memberEmail, setMemberEmail] = useState("");
  const [memberMessage, setMemberMessage] = useState("");
  const [memberError, setMemberError] = useState("");
  const [memberLoading, setMemberLoading] = useState(false);

  const loadMembers = useCallback(async () => {
    if (!roomId || !role) {
      setMembers([]);
      setPendingInvites([]);
      return;
    }

    try {
      const [nextMembers, nextInvites] = await Promise.all([
        fetchRoomMembers(roomId),
        fetchRoomInvites(roomId),
      ]);
      setMembers(nextMembers);
      setPendingInvites(nextInvites);
      setMemberError("");
    } catch (error) {
      setMemberError(error instanceof Error ? error.message : "Mitglieder konnten nicht geladen werden.");
    }
  }, [roomId, role]);

  useEffect(() => {
    void loadMembers();
  }, [loadMembers]);

  const handleInviteMember = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!roomId || !memberEmail.trim()) return;

    setMemberLoading(true);
    setMemberError("");
    setMemberMessage("");

    try {
      await createRoomInvite(roomId, memberEmail.trim());
      setMemberMessage(`Einladung fuer ${memberEmail.trim()} wurde erstellt.`);
      setMemberEmail("");
      await loadMembers();
    } catch (error) {
      setMemberError(error instanceof Error ? error.message : "Einladung konnte nicht erstellt werden.");
    } finally {
      setMemberLoading(false);
    }
  };

  const handleRemoveMember = async (memberUserId: string, email: string) => {
    if (!roomId) return;

    setMemberLoading(true);
    setMemberError("");
    setMemberMessage("");

    try {
      await removeRoomMember(roomId, memberUserId);
      setMemberMessage(`${email} wurde aus dem Raum entfernt.`);
      await loadMembers();
    } catch (error) {
      setMemberError(error instanceof Error ? error.message : "Mitglied konnte nicht entfernt werden.");
    } finally {
      setMemberLoading(false);
    }
  };

  const handleResendInvite = async (inviteId: string) => {
    setMemberLoading(true);
    setMemberError("");
    setMemberMessage("");

    try {
      await resendRoomInvite(inviteId);
      setMemberMessage("Einladung erneut gesendet.");
      await loadMembers();
    } catch (error) {
      setMemberError(error instanceof Error ? error.message : "Einladung konnte nicht erneut gesendet werden.");
    } finally {
      setMemberLoading(false);
    }
  };

  const handleDeleteInvite = async (inviteId: string) => {
    setMemberLoading(true);
    setMemberError("");
    setMemberMessage("");

    try {
      await deleteRoomInvite(inviteId);
      setMemberMessage("Einladung geloescht.");
      await loadMembers();
    } catch (error) {
      setMemberError(error instanceof Error ? error.message : "Einladung konnte nicht geloescht werden.");
    } finally {
      setMemberLoading(false);
    }
  };

  if (!role) return null;

  return (
    <section className="members-section">
      <button
        type="button"
        className="members-section-toggle"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
      >
        <div>
          <h3>Mitglieder</h3>
          <p>
            {canManage
              ? "Hier kannst du Mitglieder einladen und bestehende Zugriffe entfernen."
              : "Hier siehst du, wer aktuell Zugriff auf diesen Raum hat."}
          </p>
        </div>
        <ChevronDown className={`members-section-chevron ${isOpen ? "members-section-chevron-open" : ""}`} size={18} />
      </button>

      {isOpen ? (
        <>
          {canManage ? (
            <form className="member-invite-form" onSubmit={handleInviteMember}>
              <input
                type="email"
                value={memberEmail}
                onChange={(event) => setMemberEmail(event.target.value)}
                placeholder="E-Mail zum Einladen"
                required
              />
              <button type="submit" disabled={memberLoading || !memberEmail.trim()}>
                {memberLoading ? "..." : "+"}
              </button>
            </form>
          ) : null}

          {memberError ? <p className="members-error">{memberError}</p> : null}
          {memberMessage ? <p className="members-success">{memberMessage}</p> : null}

          <div className="member-list">
            {members.map((member) => (
              <article key={member.user_id} className="member-card">
                <div>
                  <p className="member-email">{member.email}</p>
                  <p className="member-role">{member.role}</p>
                </div>
                {canManage && member.role !== "owner" ? (
                  <button
                    type="button"
                    className="member-remove-button"
                    onClick={() => handleRemoveMember(member.user_id, member.email)}
                  >
                    Entfernen
                  </button>
                ) : null}
              </article>
            ))}

            {pendingInvites.map((invite) => (
              <article
                key={invite.id}
                className={`member-card ${invite.status === "declined" ? "member-card-declined" : "member-card-pending"}`}
              >
                <div>
                  <p className="member-email">{invite.email}</p>
                  <p className="member-role">
                    {invite.status === "declined" ? "Einladung abgelehnt" : "Einladung gesendet"}
                  </p>
                  <p className="member-status">
                    {invite.status === "declined" ? "Antwort war Ablehnen" : "Wartet auf Antwort"}
                  </p>
                </div>
                {canManage && invite.status === "declined" ? (
                  <div className="member-invite-actions">
                    <button
                      type="button"
                      className="member-resend-button"
                      disabled={memberLoading}
                      onClick={() => handleResendInvite(invite.id)}
                    >
                      Erneut senden
                    </button>
                    <button
                      type="button"
                      className="member-remove-button"
                      disabled={memberLoading}
                      onClick={() => handleDeleteInvite(invite.id)}
                    >
                      Loeschen
                    </button>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
