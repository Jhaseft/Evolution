import { useState, useEffect } from "react";
import { Link } from "@inertiajs/react";
import axios from "axios";

export default function Instances() {
  const [instances, setInstances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false); // 🔹 estado para spinner global

  const fetchInstances = async () => {
    try {
      const res = await axios.get(route("evolution.list"));
      if (res.data.error === false) {
        setInstances(res.data.instances || []);
      }
    } catch (err) {
      console.error("Error al obtener las instancias:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstances();
  }, []);

  const handleDelete = async (instanceName) => {
    if (!confirm("¿Seguro quieres eliminar esta instancia?")) return;
    setDeleting(true); // 🔹 mostrar spinner global

    try {
      await axios.delete(route("evolution.destroy", instanceName));
      setInstances((prev) => prev.filter((inst) => inst.instance_name !== instanceName));
    } catch (err) {
      console.error("Error al eliminar instancia:", err);
      alert("No se pudo eliminar la instancia.");
    } finally {
      setDeleting(false); // 🔹 ocultar spinner al finalizar
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-6 text-gray-400 text-lg">
        Cargando instancias...
      </div>
    );
  }

  return (
    <div className="relative p-8 space-y-8">
      {/* 🔹 Overlay de carga a pantalla completa */}
      {deleting && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
          <div className="w-16 h-16 border-4 border-green-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-green-400 font-semibold text-lg tracking-widest">
            Eliminando instancia...
          </p>
        </div>
      )}

      {/* 🔹 Título */}
      <h2 className="text-4xl font-bold text-green-400 tracking-widest text-center">
        Instancias
      </h2>

      {instances.length === 0 ? (
        <div className="flex flex-col items-center gap-6">
          <Link
            href={route("evolution.form")}
            className="px-8 py-4 bg-gradient-to-br from-green-600 to-green-800 text-black rounded-3xl font-bold 
                   shadow-[0_0_25px_rgba(34,197,94,0.4)] hover:shadow-[0_0_35px_rgba(34,197,94,0.6)] 
                   hover:scale-[1.03] transition-all duration-300 text-lg"
          >
            + Crear instancia
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-10 justify-center">
          {instances.map((inst) => (
            <div
              key={inst.id}
              className="relative bg-gradient-to-br from-green-950 via-black to-green-900 
                     text-green-300 rounded-3xl shadow-[0_0_25px_rgba(34,197,94,0.3)] 
                     hover:shadow-[0_0_40px_rgba(34,197,94,0.5)] 
                     p-8 w-full max-w-3xl mx-auto flex flex-col justify-between 
                     overflow-hidden transition-all duration-500 hover:scale-[1.02] border border-green-800/30"
            >
              {/* Brillo animado lateral */}
              <div className="absolute inset-0 bg-gradient-to-r from-green-700/10 via-transparent to-transparent animate-pulse pointer-events-none"></div>

              {/* Estado arriba derecha */}
              <span
                className={`absolute top-5 right-5 px-3 py-1 rounded-full text-xs font-semibold 
              ${inst.status === "open"
                    ? "bg-green-500 text-black"
                    : inst.status === "connecting"
                      ? "bg-yellow-400 text-black"
                      : "bg-red-600 text-white"
                  }`}
              >
                {inst.status.toUpperCase()}
              </span>

              {/* Parte superior: nombre */}
              <div className="flex justify-between items-center">
                <h3 className="text-3xl font-bold tracking-widest text-green-400">
                  {inst.instance_name}
                </h3>
              </div>

              {/* Teléfono */}
              <div className="mt-6 text-xl tracking-widest text-gray-300 font-mono">
                Número: +{inst.phone_number}
              </div>

              {/* Botones */}
              <div className="flex gap-4 mt-8">
                <Link
                  href={route("evolution.groups", { instance: inst.id })}
                  className="flex-1 px-5 py-3 bg-green-500/90 rounded-xl text-black font-semibold hover:bg-green-400 text-center shadow-md hover:shadow-lg transition-all duration-300"
                >
                  Grupos
                </Link>
                <button
                  onClick={() => handleDelete(inst.instance_name)}
                  className="flex-1 px-5 py-3 bg-red-700 rounded-xl text-white font-semibold 
                         hover:bg-red-600 shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                  disabled={deleting}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {instances.length >= 1 && (
        <div className="text-center text-gray-400 mt-6 text-lg">
          Solo puedes tener <b>una instancia</b>. Elimina la actual para crear otra.
        </div>
      )}
    </div>
  );

}
