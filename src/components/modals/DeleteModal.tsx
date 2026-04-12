import "./DeleteModal.css";

type DeleteModalProps = {
  itemName: string | null;
  itemType?: string; // e.g., "Gerät", "Raum", "Device", "Room"
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function DeleteModal({ itemName, itemType = "Item", isOpen, onClose, onConfirm }: DeleteModalProps) {
  if (!isOpen || !itemName) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>{itemType} löschen</h3>
        <p>
          Möchtest du <b>{itemName}</b> wirklich löschen?
        </p>
        <div className="modal-actions">
          <button onClick={onClose}>Abbrechen</button>
          <button className="danger" onClick={onConfirm}>
            Löschen
          </button>
        </div>
      </div>
    </div>
  );
}