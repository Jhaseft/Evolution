import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import axios from "axios";
import EnviarMensajeForm from "@/Components/Dasboard/EnviarMensajeForm";
import { Download, Upload, Loader2 } from "lucide-react";

export default function ExcelTab({ instance }) {
  const [file, setFile] = useState(null);
  const [numbers, setNumbers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progreso, setProgreso] = useState({ actual: 0, total: 0 });
  const cancelToken = useRef(null);

  const handleDownloadTemplate = () => {
    const link = document.createElement("a");
    link.href = "/plantilla_envio.xlsx";
    link.download = "Plantilla_Envio_Masivo.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = async (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (!selectedFile) return;

    try {
      const data = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(data);
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const sheetData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

      const numeros = sheetData
        .map((row) => row[0])
        .filter((n) => typeof n === "string" || typeof n === "number")
        .map((n) => n.toString().trim())
        .filter((n) => n !== "");

      setNumbers(numeros);
    } catch (error) {
      console.error("Error leyendo Excel:", error);
      alert("Hubo un error al leer el archivo. Verifica el formato.");
    }
  };

  const handleCancel = () => {
    if (cancelToken.current) {
      cancelToken.current.abort();
      setLoading(false);
      setProgreso({ actual: 0, total: 0 });
      alert("❌ Envío cancelado por el usuario.");
    }
  };

  const handleSend = async (data) => {
    if (!numbers.length) return alert("No se detectaron números en el archivo Excel.");
  
    try {
      setLoading(true);
      cancelToken.current = new AbortController();
      setProgreso({ actual: 0, total: numbers.length });

      for (let i = 0; i < numbers.length; i++) {
        const num = numbers[i];
        const formData = new FormData();
        formData.append("instance", instance.instance_name);
        formData.append("tipo", data.tipo);
        formData.append("contenido", data.contenido || "");
        formData.append("numbers[0]", num);
        if (data.archivo) formData.append("archivo", data.archivo);

        await axios.post("/enviar-mensaje", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          signal: cancelToken.current.signal,
        });

        setProgreso({ actual: i + 1, total: numbers.length });
      }

      alert("✅ Mensajes enviados correctamente.");
    } catch (err) {
      if (err.name === "CanceledError" || err.code === "ERR_CANCELED") {
        console.warn("Envío cancelado.");
      } else {
        console.error(err);
        alert("⚠️ Error al enviar los mensajes.");
      }
    } finally {
      setLoading(false);
      setProgreso({ actual: 0, total: 0 });
    }
  };

  const isSendDisabled = numbers.length > 170;

  return (
    <div className="animate-fadeIn flex flex-col items-center justify-center h-full space-y-8 relative">
      <h3 className="text-2xl font-bold text-green-400 md:mt-72 mt-80">
        Envío por Excel
      </h3>

      <p className="text-gray-400 text-center max-w-lg">
        Aquí puedes enviar mensajes a múltiples contactos mediante un archivo Excel.  
        Descarga la plantilla de ejemplo, complétala con tus datos y súbela nuevamente.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <button
          onClick={handleDownloadTemplate}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-black font-semibold px-6 py-3 rounded-lg shadow-lg transition-all duration-300"
        >
          <Download size={18} />
          Descargar plantilla
        </button>

        <label className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-gray-200 font-semibold px-6 py-3 rounded-lg shadow-lg transition-all duration-300 cursor-pointer">
          <Upload size={18} />
          Subir archivo Excel
          <input
            type="file"
            accept=".xlsx, .csv"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      {file && (
        <div className="text-sm text-center">
          <p className="text-green-400">
            Archivo seleccionado: <strong>{file.name}</strong>
          </p>
          <p className={`text-gray-400 ${numbers.length > 170 ? "text-red-500 font-bold" : ""}`}>
            {numbers.length > 0
              ? `${numbers.length} números detectados`
              : "Esperando lectura del archivo..."}
            {numbers.length > 170 && " ⚠️ Límite máximo permitido: 170. No se podrá enviar."}
          </p>
        </div>
      )}

      <div className="w-full max-w-xl">
        <EnviarMensajeForm onSend={handleSend} disabled={isSendDisabled} />
      </div>

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
