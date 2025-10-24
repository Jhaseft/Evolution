import axios from "axios";

export default function ContactosTab({ instance }) {
  const handleExtract = async () => {
    if (!instance?.instance_name) {
      alert("No hay una instancia activa.");
      return;
    }

    try {
      const url = `/extraer-contactos/${instance.instance_name}`;
      const response = await axios.get(url, {
        responseType: "blob", // Para descargar archivos
      });

      // Crear un enlace de descarga
      const blob = new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `Contactos_${instance.instance_name}.xlsx`;
      link.click();

      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error(" Error al extraer contactos:", error);
      alert("Error al obtener los contactos.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h3 className="text-xl font-bold text-green-400 mb-4">Extraer contactos</h3>
      <p className="text-gray-400 mb-6 text-center">
        Esta sección permitirá obtener los contactos de tu Numero Enlazado
        <br />
        <span className="text-green-400 font-mono">
          ({instance?.instance_name})
        </span>
      </p>
      <button
        onClick={handleExtract}
        className="px-8 py-3 bg-green-600 hover:bg-green-500 text-black font-bold rounded-xl shadow-lg transition-all duration-300"
      >
        Extraer ahora
      </button>
    </div>
  );
}
