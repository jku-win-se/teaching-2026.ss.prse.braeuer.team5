import { useState, useEffect } from "react";
import { Pencil, Trash2, Check, X, Plus } from "lucide-react";
import "./Rooms.css";
import { supabase } from "../config/supabaseClient"; // Dein Pfad zum Supabase-Client
import { addToRoomTable, updateRoomInTable, deleteRoomFromTable } from "../services/roomService"; // Deine DB-Funktionen


type Room = { id: string; name: string };


export default function Rooms() {

  async function fetchRooms() {
    if (!supabase) return;
    const { data, error } = await supabase.from("rooms").select("*");
    if (error) console.error("Error fetching rooms:", error);
    else setRooms(data || []);
  }

  // 1. Räume beim Start laden
  useEffect(() => {
    fetchRooms();
  }, []);
  
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
    
    await deleteRoomFromTable(roomToDelete.id);

    setRooms(rooms.filter(r => r.id !== roomToDelete.id));
    setRoomToDelete(null);
  };

  return (
    <section className="rooms-container">
      <div className="rooms-header">
        <h2>Rooms</h2>
        <button className="add-button" aria-label="Add room" onClick={() => setShowInput(!showInput)}>
          <div style={{ color: "lightgray" }}><Plus size={16} /></div>
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
            onUpdate={handleUpdateRoom} 
            onDelete={() => setRoomToDelete(room)} 
          />
        ))}
      </div>

      {/* Das ausgelagerte Modal (Logik bleibt hier, Darstellung ist unten) */}
      {roomToDelete && (
        <DeleteModal 
          roomName={roomToDelete.name} 
          onConfirm={confirmDelete} 
          onCancel={() => setRoomToDelete(null)} 
        />
      )}
    </section>
  );
}

// --- Unter-Komponente: Das Modal ---
function DeleteModal({ roomName, onConfirm, onCancel }: { roomName: string, onConfirm: () => void, onCancel: () => void }) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Delete Room</h3>
        <p>Do you really want to delete <b>{roomName}</b>?</p>
        <div className="modal-actions">
          <button onClick={onCancel}>Cancel</button>
          <button className="danger" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}

// --- Unter-Komponente: Die Zeile ---
function RoomRow({ room, onUpdate, onDelete }: { room: Room, onUpdate: (id: string, name: string) => void, onDelete: () => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(room.name);

  if (isEditing) {
    return (
      <div className="room-card">
        <input className="room-input" value={editName} onChange={(e) => setEditName(e.target.value)} />
        <div className="actions">
          {/* NEU: aria-label="Save changes" */}
          <button aria-label="Save changes" onClick={() => { onUpdate(room.id, editName); setIsEditing(false); }}>
            <div style={{ color: "green" }}><Check size={16} /></div>
          </button>
          {/* NEU: aria-label="Cancel editing" */}
          <button aria-label="Cancel editing" onClick={() => setIsEditing(false)}>
            <div style={{ color: "red" }}><X size={16} /></div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="room-card">
      <span className="room-name">{room.name}</span>
      <div className="actions">
        <button aria-label="Edit room" onClick={() => setIsEditing(true)}>
          <div style={{ color: "gray" }}><Pencil size={16} /></div>
        </button>
        {/* NEU: aria-label="Delete room" */}
        <button aria-label="Delete room" onClick={onDelete}>
          <div style={{ color: "red" }}><Trash2 size={16} /></div>
        </button>
      </div>
    </div>
  );
}



