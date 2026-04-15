import { useEffect, useState } from "react";
import { fetchPendingRoomInvites, respondToRoomInvite } from "../services/inviteService";
import type { RoomInvite } from "../types";
import "./Notifications.css";

export default function Notifications() {
  const [pendingInvites, setPendingInvites] = useState<RoomInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [processingInviteId, setProcessingInviteId] = useState("");

  const loadInvites = async () => {
    setLoading(true);
    setError("");

    try {
      const invites = await fetchPendingRoomInvites();
      setPendingInvites(invites);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Einladungen konnten nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvites();
  }, []);

  const handleDecision = async (inviteId: string, action: "accept" | "decline") => {
    setProcessingInviteId(inviteId);
    setError("");
    setMessage("");

    try {
      await respondToRoomInvite(inviteId, action);
      setMessage(action === "accept" ? "Einladung angenommen." : "Einladung abgelehnt.");
      await loadInvites();
    } catch (decisionError) {
      setError(decisionError instanceof Error ? decisionError.message : "Einladung konnte nicht verarbeitet werden.");
    } finally {
      setProcessingInviteId("");
    }
  };

  return (
    <section className="notifications-container">
      <div className="notifications-header">
        <div>
          <h2>Einladungen</h2>
          <p>Offene Raum-Einladungen, die du annehmen oder ablehnen kannst.</p>
        </div>
        <span className="notification-pill">{pendingInvites.length} offen</span>
      </div>

      {error ? <p className="notifications-error">{error}</p> : null}
      {message ? <p className="notifications-success">{message}</p> : null}

      {loading ? (
        <p>Laden...</p>
      ) : pendingInvites.length === 0 ? (
        <p>Aktuell gibt es keine offenen Einladungen.</p>
      ) : (
        <div className="invite-list">
          {pendingInvites.map((invite) => (
            <article key={invite.id} className="invite-card">
              <div>
                <h3>{invite.room_name}</h3>
                <p>Rolle nach Annahme: {invite.role}</p>
                <p>E-Mail: {invite.email}</p>
              </div>

              <div className="invite-actions">
                <button
                  type="button"
                  disabled={processingInviteId === invite.id}
                  onClick={() => handleDecision(invite.id, "accept")}
                  className="invite-accept"
                >
                  {processingInviteId === invite.id ? "..." : "Annehmen"}
                </button>
                <button
                  type="button"
                  disabled={processingInviteId === invite.id}
                  onClick={() => handleDecision(invite.id, "decline")}
                  className="invite-decline"
                >
                  Ablehnen
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
