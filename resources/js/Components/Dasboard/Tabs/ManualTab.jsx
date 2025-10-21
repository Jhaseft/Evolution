import { useState } from "react";
import axios from "axios";
import EnviarMensajeForm from "@/Components/Dasboard/EnviarMensajeForm";

export default function ManualTab({ instance }) {
  const [numeros, setNumeros] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async (data) => {
    const numbers = numeros
      .split(",")
      .map((n) => n.trim())
      .filter((n) => n !== "");

    if (!numbers.length) return alert("Debes ingresar al menos un número.");

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("instance", instance.instance_name);
      formData.append("tipo", data.tipo);
      formData.append("contenido", data.contenido || "");
      numbers.forEach((num, i) => formData.append(`numbers[${i}]`, num));
      if (data.archivo) formData.append("archivo", data.archivo);

      await axios.post("/enviar-mensaje", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert(" Mensajes enviados correctamente");
    } catch (err) {
      console.error(err);
      alert(" Error al enviar el mensaje.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <h3 className="text-xl font-bold text-green-400">
        Envío manual de mensajes
      </h3>

      <label className="block">
        <span className="text-gray-400 text-sm">Números de WhatsApp:</span>
        <textarea
          value={numeros}
          onChange={(e) => setNumeros(e.target.value)}
          placeholder="59171234567, 59169876543, sin (+)"
          className="w-full mt-2 p-3 bg-zinc-800 border border-green-700/30 rounded-lg text-gray-200 focus:ring-2 focus:ring-green-400 focus:outline-none"
          rows={3}
        ></textarea>
      </label>

      <EnviarMensajeForm onSend={handleSend} />

      {loading && (
        <div className="text-green-400 text-sm animate-pulse text-center">
          Enviando mensajes...
        </div>
      )}
    </div>
  );
}
