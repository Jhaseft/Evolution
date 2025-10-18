import { useState } from "react";
import axios from "axios";
import GroupContactsModal from "@/Components/Groups/GroupContactsModal.jsx";

export default function Groups({ groups: initialGroups = [], instance }) {
  const [groupName, setGroupName] = useState("");
  const [groups, setGroups] = useState(initialGroups);
  const [loading, setLoading] = useState(false);

  // Estado para el modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) return alert("El nombre del grupo es obligatorio");

    try {
      setLoading(true);

      await axios.post(`/evolution/groups/${instance.id}`, { group_name: groupName });

      const { data } = await axios.get(`/evolution/groups/${instance.id}/list`);
      setGroups(data.groups);

      setGroupName("");
    } catch (error) {
      console.error("Error al crear grupo:", error);
      alert("Ocurrió un error al crear el grupo.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (groupId) => {
    if (!confirm("¿Seguro quieres eliminar este grupo?")) return;

    try {
      setLoading(true);
      await axios.delete(`/evolution/groups/${groupId}`);
      setGroups(groups.filter((g) => g.id !== groupId));
    } catch (error) {
      console.error("Error al eliminar grupo:", error);
      alert("Ocurrió un error al eliminar el grupo.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenContacts = (group) => {
    setSelectedGroup(group);
    setModalOpen(true);
  };

  const handleCloseContacts = () => {
    setSelectedGroup(null);
    setModalOpen(false);
  };

  return (
    <div className="relative p-6 space-y-6">
      {loading && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-50 rounded-lg">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-t-transparent border-green-400 rounded-full animate-spin"></div>
            <p className="mt-2 text-white font-semibold">Procesando...</p>
          </div>
        </div>
      )}

      <h2 className="text-2xl font-bold text-green-400">
        Grupos de la instancia: {instance.instance_name}
      </h2>

      <form onSubmit={handleCreate} className="flex gap-2">
        <input
          type="text"
          placeholder="Nombre del grupo"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          disabled={loading}
          className="border px-3 py-2 rounded flex-1 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-black rounded disabled:opacity-50"
        >
          Crear
        </button>
      </form>

      <div className="mt-6 space-y-2">
        {groups.length === 0 && <p className="text-gray-400">No hay grupos creados.</p>}

        {groups.map((g) => (
          <div
            key={g.id}
            className="flex justify-between items-center p-2 border rounded bg-white/5"
          >
            <span>{g.group_name}</span>
            <div className="flex gap-2">
              <button
                onClick={() => handleOpenContacts(g)}
                className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Contactos
              </button>
              <button
                onClick={() => handleDelete(g.id)}
                disabled={loading}
                className="px-2 py-1 bg-red-600 text-white rounded disabled:opacity-50"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de contactos */}
      {selectedGroup && (
        <GroupContactsModal
          isOpen={modalOpen}
          onClose={handleCloseContacts}
          group={selectedGroup}
        />
      )}
    </div>
  );
}
