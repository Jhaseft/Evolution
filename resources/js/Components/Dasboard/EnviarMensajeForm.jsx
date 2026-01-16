import { useState } from "react";

export default function EnviarMensajeForm({ onSend, disabled = false }) {
  const [tipo, setTipo] = useState("mensaje");
  const [mensaje, setMensaje] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [preview, setPreview] = useState(null);
  const [contenidoMedia, setContenidoMedia] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setArchivo(file);

    if (file && (tipo === "imagen" || tipo === "video")) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  };

  const handleSend = () => {
    if (disabled) return; // No dejar enviar si está deshabilitado

    if (tipo === "mensaje" && !mensaje.trim()) {
      return alert("Por favor, escribe un mensaje.");
    }
    if (tipo !== "mensaje" && !archivo) {
      return alert(`Por favor, selecciona un archivo de ${tipo}.`);
    }

    onSend?.({
      tipo,
      contenido: tipo === "mensaje" ? mensaje : contenidoMedia || null,
      archivo,
    });
  };

  return (
    <div className="space-y-5 mt-6">
      {/* Tipo de envío */}
      <label className="block">
        <span className="text-gray-400 text-sm">Tipo de envío:</span>
        <select
          value={tipo} 
          onChange={(e) => {
            setTipo(e.target.value);
            setArchivo(null);
            setPreview(null);
            setMensaje("");
            setContenidoMedia("");
          }}
          className="w-full mt-2 p-3 bg-zinc-800 border border-green-700/30 rounded-lg text-gray-200 focus:ring-2 focus:ring-green-400 focus:outline-none"
        >
          <option value="mensaje">Mensaje de texto</option>
          <option value="imagen">Imagen</option>
          <option value="video">Video</option>
          <option value="documento">Documento</option>
        </select>
      </label>

      {/* Campo dinámico según el tipo */}
      {tipo === "mensaje" ? (
        <label className="block">
          <span className="text-gray-400 text-sm">Mensaje:</span>
          <textarea
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            placeholder="Escribe tu mensaje aquí..."
            className="w-full mt-2 p-3 bg-zinc-800 border border-green-700/30 rounded-lg text-gray-200 focus:ring-2 focus:ring-green-400 focus:outline-none"
            rows={4}
          />
        </label>
      ) : (
        <div className="space-y-3">
          <label className="block">
            <span className="text-gray-400 text-sm">
              Selecciona un archivo de {tipo}:
            </span>
            <input
              type="file"
              accept={
                tipo === "imagen"
                  ? "image/*"
                  : tipo === "video"
                  ? "video/*"
                  : "*/*"
              }
              onChange={handleFileChange}
              className="w-full mt-2 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 
                         file:text-sm file:font-semibold file:bg-green-600 file:text-black 
                         hover:file:bg-green-500 cursor-pointer bg-zinc-800 border border-green-700/30 rounded-lg p-2"
            />
          </label>

          <label className="block">
            <span className="text-gray-400 text-sm">Contenido (opcional):</span>
            <textarea
              value={contenidoMedia}
              onChange={(e) => setContenidoMedia(e.target.value)}
              placeholder="Escribe un mensaje opcional para acompañar el archivo..."
              className="w-full mt-2 p-3 bg-zinc-800 border border-green-700/30 rounded-lg text-gray-200 focus:ring-2 focus:ring-green-400 focus:outline-none"
              rows={2}
            />
          </label>

          {preview && (
            <div className="mt-3 flex justify-center">
              {tipo === "imagen" && (
                <img
                  src={preview}
                  alt="preview"
                  className="max-h-48 rounded-lg border border-green-700/40"
                />
              )}
              {tipo === "video" && (
                <video
                  src={preview}
                  controls
                  className="max-h-48 rounded-lg border border-green-700/40"
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* Botón enviar */}
      <div className="text-center pt-2">
        {disabled && (
          <p className="text-red-500 font-bold mb-2">
             Se superó el límite máximo de números permitidos. No se puede enviar.
          </p>
        )}
        <button
          onClick={handleSend}
          disabled={disabled}
          className={`px-8 py-3 font-bold rounded-xl shadow-lg transition-all duration-300
            ${disabled
              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-500 text-black"
            }`}
        >
          Enviar {tipo}
        </button>
      </div>
    </div>
  );
}
