// PairingModal.jsx
export default function PairingModal({
  showModal,
  setShowModal,
  pairingCode,
  countdown,
  verificarConexion,
  modalMessage,
}) {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white p-6 rounded-l-3xl shadow-2xl w-80 text-center relative border-l-4 border-green-500">
        {/* Botón de cerrar */}
        <button
          onClick={() => setShowModal(false)}
          className="absolute top-2 right-3 text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>

        <h3 className="text-xl font-light mb-3 text-green-400 tracking-wide">
          Pairing Code
        </h3>

        {/* Mensaje del modal */}
        {modalMessage.text && (
          <p
            className={`mb-4 text-sm ${
              modalMessage.type === "error" ? "text-red-500" : "text-green-400"
            }`}
          >
            {modalMessage.text}
          </p>
        )}

        {pairingCode && (
          <>
            <p className="text-2xl font-semibold text-blue-400 mb-2">
              {pairingCode}
            </p>
            <p className="text-gray-300 mb-4 text-sm">
              Tienes <span className="font-bold text-red-500">{countdown}s</span> para configurarlo.
            </p>
          </>
        )}

        <button
          onClick={() => {
            
            verificarConexion();
          }}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-all mt-2 w-full"
        >
          Verificar conexión
        </button>
      </div>
    </div>
  );
}
