import { useState, useEffect } from "react";

export default function PairingModal({
  showModal,
  pairingCode,
  countdown,
  connectionState, // "pending", "connected", "failed"
}) {
  const [copied, setCopied] = useState(false);

  // Ocultar mensaje de copiado después de 2 segundos
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  if (!showModal) return null; // ahora esto solo detiene el render, pero los hooks ya se llamaron

  const copyToClipboard = () => {
    navigator.clipboard.writeText(pairingCode);
    setCopied(true);
  };

  const getStatusMessage = () => {
    switch (connectionState) {
      case "pending":
        return "Escanea el código en WhatsApp y espera a que se conecte.";
      case "connected":
        return "¡Instancia conectada correctamente!";
      case "failed":
        return "No se pudo conectar. La instancia será eliminada.";
      default:
        return "";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white p-6 rounded-l-3xl shadow-2xl w-80 text-center border-l-4 border-green-500 relative">
        <h3 className="text-xl font-light mb-3 text-green-400 tracking-wide">
          CÓDIGO DE EMPAREJAMIENTO
        </h3>

        {pairingCode && (
          <>
            <p className="text-2xl font-semibold text-blue-400 mb-2">
              {pairingCode}
            </p>
            <p className="text-gray-300 mb-2 text-sm">{getStatusMessage()}</p>

            {connectionState === "pending" && (
              <>
                <p className="text-gray-300 mb-2 text-sm">
                  Tienes <span className="font-bold text-red-500">{countdown}s</span> para copiarlo.
                </p>

                <button
                  onClick={copyToClipboard}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-all w-full"
                >
                  Copiar código
                </button>

                {copied && (
                  <span className="absolute top-2 right-4 text-green-400 font-semibold text-sm">
                    ¡Copiado!
                  </span>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
