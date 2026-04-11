import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2, Check, X, Plus } from "lucide-react";
import "./Rooms.css";
import { addToRoomTable, updateRoomInTable, deleteRoomFromTable, fetchRooms, fetchNumberOfDevicesInRoom } from "../services/roomService";
import { DeleteModal } from "../components/modals/DeleteModal";
import type { Room } from "../types";

export default function Rooms() {

  // 1. Räume beim Start laden
  useEffect(() => {
    async function getRooms() {
      const rooms: Room[] = await fetchRooms();
      setRooms(rooms);
    } 
    getRooms();
  }, []);
  
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showInput, setShowInput] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);

  // --- Logik ---
  const handleAddRoom = async () => {
    if (!newRoomName.trim()) return;

    const newId = await addToRoomTable(newRoomName);

    if (newId) {
      // Wir nehmen die echte ID von Supabase statt Date.now()
      setRooms([...rooms, { id: newId, name: newRoomName }]);
      setNewRoomName("");
      setShowInput(false);
    }
  };

  const handleUpdateRoom = async (id: string, name: string) => {
    const success = await updateRoomInTable(id, name);
    
    if (success) {
      // Nur wenn DB-Update erfolgreich war, lokalen State updaten
      setRooms(rooms.map(r => r.id === id ? { ...r, name } : r));
    }
  };

  const confirmDelete = async() => {
    if (!roomToDelete) return;
    const success = await deleteRoomFromTable(roomToDelete.id);
    if (success) {
      setRooms(rooms.filter(r => r.id !== roomToDelete.id));
      setRoomToDelete(null);
    }
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
            onSelect={() => navigate(`/rooms/${room.id}`, { state: { roomName: room.name } })}
            onUpdate={handleUpdateRoom} 
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

// --- Unter-Komponente: Die Zeile ---

function RoomRow({ room, onSelect, onUpdate, onDelete }: { room: Room, onSelect: () => void, onUpdate: (id: string, name: string) => void, onDelete: () => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(room.name);
  const [deviceCount, setDeviceCount] = useState<number>(0);

  useEffect(() => {
    async function getDeviceCount() {
      const count = await fetchNumberOfDevicesInRoom(room.id);
      setDeviceCount(count);
    }
    getDeviceCount();
  }, [room.id]);

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
    <div 
      className="room-card interactive" 
      onClick={onSelect} // Der gesamte Hintergrund navigiert
    >
      <div className="room-info">
        <span className="room-name">{room.name}</span>
        <span className="device-count">{deviceCount} Geräte</span>
      </div>

      <div className="actions">
        {/* WICHTIG: e.stopPropagation() verhindert das Auslösen von onSelect */}
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
    </div>
  );
}






