import { useState, useRef } from "react";
import axios from "axios";
import EnviarMensajeForm from "@/Components/Dasboard/EnviarMensajeForm";
import { Loader2 } from "lucide-react";

export default function ManualTab({ instance }) {
  const [numeros, setNumeros] = useState("");
  const [loading, setLoading] = useState(false);
  const [progreso, setProgreso] = useState({ actual: 0, total: 0 });
  const cancelToken = useRef(null);

  // Convertir texto a array de números
  const numbersArray = numeros
    .split(",")
    .map((n) => n.trim())
    .filter((n) => n !== "");

  // Contador de números
  const totalNumeros = numbersArray.length;

  

  // Cancelar envío
  const handleCancel = () => {
    if (cancelToken.current) {
      cancelToken.current.abort();
      setLoading(false);
      setProgreso({ actual: 0, total: 0 });
      alert(" Envío cancelado por el usuario.");
    }
  };

  const handleSend = async (data) => {
    if (!numbersArray.length) return alert("Debes ingresar al menos un número.");

    try {
      setLoading(true);
      cancelToken.current = new AbortController();
      setProgreso({ actual: 0, total: totalNumeros });

      for (let i = 0; i < totalNumeros; i++) {
        const num = numbersArray[i];
        const formData = new FormData();
        formData.append("instance", instance.instance_name);
        formData.append("tipo", data.tipo);
        formData.append("contenido", data.contenido || "");
        formData.append("numbers[0]", num); // enviamos un número por vez
        if (data.archivo) formData.append("archivo", data.archivo);

        await axios.post("/enviar-mensaje", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          signal: cancelToken.current.signal,
        });

        // Actualizar progreso
        setProgreso({ actual: i + 1, total: totalNumeros });
      }

      alert(" Mensajes enviados correctamente.");
    } catch (err) {
      if (err.name === "CanceledError" || err.code === "ERR_CANCELED") {
        console.warn("Envío cancelado por el usuario.");
      } else {
        console.error(err);
        alert("⚠️ Error al enviar el mensaje.");
      }
    } finally {
      setLoading(false);
      setProgreso({ actual: 0, total: 0 });
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn relative">
      <h3 className="text-xl font-bold text-green-400">Envío manual de mensajes</h3>

      <label className="block">
        <span className="text-gray-400 text-sm">Números de WhatsApp:</span>
        <textarea
          value={numeros}
          onChange={(e) => setNumeros(e.target.value)}
          placeholder="Agrega los números manualmente, sin el signo +. Ejemplo: 591xxxxxxxx,591yyyyyyyy"
          className="w-full mt-2 p-3 bg-zinc-800 border border-green-700/30 rounded-lg text-gray-200 focus:ring-2 focus:ring-green-400 focus:outline-none"
          rows={3}
        />
        <p className={`mt-1 text-sm font-semibold ${disabled ? 'text-red-500' : 'text-green-400'}`}>
          {totalNumeros} número{totalNumeros !== 1 ? 's' : ''} ingresado{totalNumeros !== 1 ? 's' : ''}
          {disabled ? "  Límite máximo excedido" : ""}
        </p>
      </label>

      <EnviarMensajeForm onSend={handleSend} disabled={disabled} />

      {/* Overlay de carga con contador dinámico */}
      {loading && (
        <div className="fixed inset-0 bg-black/70 flex flex-col items-center justify-center z-50">
          <Loader2 className="animate-spin text-green-400 w-16 h-16 mb-6" />
          <p className="text-green-300 text-lg font-semibold mb-2">
            Enviando mensajes, por favor espera...
          </p>
          <p className="text-gray-200 text-sm mb-6">
            {progreso.actual}/{progreso.total} enviados
          </p>
          <button
            onClick={handleCancel}
            className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-semibold shadow-md transition"
          >
            Cancelar envío
          </button>
        </div>
      )}
    </div>
  );
}
