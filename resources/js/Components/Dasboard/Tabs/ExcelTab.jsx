import { useState } from "react";
import * as XLSX from "xlsx";
import axios from "axios";
import EnviarMensajeForm from "@/Components/Dasboard/EnviarMensajeForm";
import { Download, Upload } from "lucide-react";

export default function ExcelTab({ instance }) {
  const [file, setFile] = useState(null);
  const [numbers, setNumbers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Descargar plantilla
  const handleDownloadTemplate = () => {
    const link = document.createElement("a");
    link.href = "/plantilla_envio.xlsx";
    link.download = "Plantilla_Envio_Masivo.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Leer Excel
  const handleFileUpload = async (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (!selectedFile) return;

    try {
      const data = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(data);
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const sheetData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

      // Extraer solo los valores de la columna A (ignorando encabezados vacíos)
      const numeros = sheetData
        .map((row) => row[0])
        .filter((n) => typeof n === "string" || typeof n === "number")
        .map((n) => n.toString().trim())
        .filter((n) => n !== "");

      setNumbers(numeros);
      console.log(" Números leídos del Excel:", numeros);
    } catch (error) {
      console.error(" Error leyendo Excel:", error);
      alert("Hubo un error al leer el archivo. Verifica el formato.");
    }
  };

  // Enviar mensajes a todos los números del Excel
  const handleSend = async (data) => {
    if (!numbers.length) {
      return alert("No se detectaron números en el archivo Excel.");
    }

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

      alert(" Mensajes enviados correctamente.");
    } catch (err) {
      console.error(err);
      alert(" Error al enviar los mensajes.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fadeIn flex flex-col items-center justify-center h-full space-y-8">
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

      {/* Mostrar archivo y números detectados */}
      {file && (
        <div className="text-sm text-center">
          <p className="text-green-400">
             Archivo seleccionado: <strong>{file.name}</strong>
          </p>
          <p className="text-gray-400">
            {numbers.length > 0
              ? ` ${numbers.length} números detectados`
              : "Esperando lectura del archivo..."}
          </p>
        </div>
      )}

      {/* Formulario de tipo de envío */}
      <div className="w-full max-w-xl">
        <EnviarMensajeForm onSend={handleSend} />
      </div>

      {loading && (
        <div className="text-green-400 text-sm animate-pulse text-center">
          Enviando mensajes...
        </div>
      )}
    </div>
  );
}
