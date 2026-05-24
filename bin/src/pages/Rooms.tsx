import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2, Check, X, Plus } from "lucide-react";
import "./Rooms.css";
import { useRooms } from "../hooks/useRooms";
import { useDeviceCount } from "../hooks/useDeviceCount";
import { DeleteModal } from "../components/modals/DeleteModal";
import type { Room } from "../types";

export default function Rooms() {
  const navigate = useNavigate();
  const { rooms, addRoom, updateRoom, deleteRoom } = useRooms();
  const [showInput, setShowInput] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);

  const handleAddRoom = async () => {
    if (!newRoomName.trim()) return;
    const success = await addRoom(newRoomName);
    if (success) {
      setNewRoomName("");
      setShowInput(false);
    }
  };

  const confirmDelete = async () => {
    if (!roomToDelete) return;
    const success = await deleteRoom(roomToDelete.id);
    if (success) setRoomToDelete(null);
  };

  return (
    <section className="rooms-container">
      <div className="rooms-header">
        <h2>Rooms</h2>
        <button className="add-button" aria-label="Add room" onClick={() => setShowInput(!showInput)}>
          <div><Plus size={16} /></div>
          <span>Room</span>
        </button>
      </div>

      {showInput && (
        <div className="add-room">
          <input value={newRoomName} onChange={(e) => setNewRoomName(e.target.value)} placeholder="Room name..." />
          <button onClick={handleAddRoom}>Save</button>
        </div>
      )}

      <div className="room-list">
        {rooms.map((room) => (
          <RoomRow
            key={room.id}
            room={room}
            onSelect={() => navigate(`/room/${room.id}`, { state: { roomName: room.name } })}
            onUpdate={updateRoom}
            onDelete={() => setRoomToDelete(room)}
          />
        ))}
      </div>

      <DeleteModal
        itemName={roomToDelete?.name || null}
        itemType="Raum"
        isOpen={roomToDelete !== null}
        onClose={() => setRoomToDelete(null)}
        onConfirm={confirmDelete}
      />
    </section>
  );
}

function RoomRow({ room, onSelect, onUpdate, onDelete }: { room: Room; onSelect: () => void; onUpdate: (id: string, name: string) => void; onDelete: () => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(room.name);
  const deviceCount = useDeviceCount(room.id);
  const canManage = room.role === "owner";
  const roleLabel = canManage ? "Eigentuemer" : "Mitglied";

  if (isEditing) {
    return (
      <div className="room-card">
        <input className="room-input" value={editName} onChange={(e) => setEditName(e.target.value)} />
        <div className="actions">
          <button aria-label="Save changes" onClick={() => { onUpdate(room.id, editName); setIsEditing(false); }}>
            <div><Check className="check" size={16} /></div>
          </button>
          <button aria-label="Cancel editing" onClick={() => setIsEditing(false)}>
            <div><X className="x" size={16} /></div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="room-card interactive" onClick={onSelect}>
      <div className="room-info">
        <div className="room-title-row">
          <span className="room-name">{room.name}</span>
          <span className={`room-role-badge ${canManage ? "owner" : "member"}`}>{roleLabel}</span>
        </div>
        <span className="device-count">{deviceCount} Geraete</span>
      </div>

      {canManage ? (
        <div className="actions">
          <button
            className="icon-btn"
            aria-label="Edit"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
          >
            <div style={{ color: "gray" }}>
              <Pencil size={20} />
            </div>
          </button>

          <button
            className="icon-btn delete"
            aria-label="Delete"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <div>
              <Trash2 size={20} color="red" />
            </div>
          </button>
        </div>
      ) : (
        <span className="room-permission-note">Nur Steuerung</span>
      )}
    </div>
  );
}
