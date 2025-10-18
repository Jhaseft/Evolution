// GroupContactsModal.jsx
import { Fragment } from "react";

export default function GroupContactsModal({ isOpen, onClose, group }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg p-6 w-96 relative">
        <h3 className="text-xl font-bold mb-4 text-green-600">Contactos del Grupo</h3>
        <p><strong>ID:</strong> {group.id}</p>
        <p><strong>Nombre:</strong> {group.group_name}</p>

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cerrar
          </button>
          {/* Aquí puedes agregar otro botón para asignar un número de teléfono */}
        </div>
      </div>
    </div>
  );
}
