// Test.jsx
import axios from "axios";
import { useState, useEffect } from "react";
import InstanceForm from "@/Components/Evolution/IntanceForm";
import PairingModal from "@/Components/Evolution/PairingModal";

export default function Test() {
  const [instanceName, setInstanceName] = useState("");
  const [number, setNumber] = useState("");
  const [pairingCode, setPairingCode] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [modalMessage, setModalMessage] = useState({ type: "", text: "" });

  // Crear instancia
  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setMessage({ type: "", text: "" });
    setModalMessage({ type: "", text: "" });

    try {
      const res = await axios.post("/evolution/create", {
        instanceName,
        number,
      });

      const data = res.data.response;
      const pairing =
        data?.qrcode?.pairingCode ||
        data?.instance?.qrcode?.pairingCode ||
        data?.pairingCode ||
        null;

      if (pairing) {
        setPairingCode(pairing);
        setShowModal(true);
        setCountdown(30);
        setMessage({
          type: "success",
          text: "Instancia creada ingresar codigo de acceso.",
        });
        setModalMessage({ type: "success", text: "Instancia creada. Copia el código." });
      } else {
        setMessage({
          type: "error",
          text: "Instancia creada, pero no se devolvió un código de emparejamiento.",
        });
        setModalMessage({
          type: "error",
          text: "No se devolvió un código de emparejamiento.",
        });
        setShowModal(true);
      }
    } catch (err) {
      console.error("Error al crear instancia:", err);
      setMessage({
        type: "error",
        text: "Error al crear la instancia. Verifica los datos o la conexión.",
      });
      setModalMessage({
        type: "error",
        text: "Error al crear la instancia. Revisa tus datos o la conexión.",
      });
      setShowModal(true);
    } finally {
      setProcessing(false);
    }
  };

  // Verificar conexión
  const verificarConexion = async () => {
    try {
      const statusRes = await axios.get(`/evolution/status/${instanceName}`);
      const status = statusRes.data;

      if (!status.connected) {
        await axios.delete(`/evolution/destroy/${instanceName}`);
        setModalMessage({
          type: "error",
          text: ` No se pudo conectar con la Instancia.`,
        });
      } else {
        setModalMessage({
          type: "success",
          text: " Instancia conectada correctamente.",
        });
      }
    } catch (err) {
      
      setModalMessage({
        type: "error",
        text: "Asegurese de haber llenado todos los campos.",
      });
    }
  };

  // Contador del modal
  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (countdown === 0 && showModal) {
     
      verificarConexion();
    }
  }, [showModal, countdown]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 px-4">
      <div
        className="relative w-full max-w-md p-8 bg-gradient-to-br from-gray-800 via-black to-gray-900
                  rounded-r-3xl border-l-4 border-r-4 border-green-500 shadow-2xl hover:shadow-green-600 transition-shadow duration-300"
      >
        <h2
          className="text-2xl text-center mb-6 bg-clip-text text-transparent 
                     bg-gradient-to-r from-green-400 to-green-900 tracking-wide"
        >
          Crear Instancia
        </h2>

        <InstanceForm
          instanceName={instanceName}
          setInstanceName={setInstanceName}
          number={number}
          setNumber={setNumber}
          handleSubmit={handleSubmit}
          processing={processing}
          message={message}
        />

        <div className="mt-4 text-center">
          <button
            onClick={() => setShowModal(!showModal)}
            className="text-green-400 hover:text-green-300 font-medium"
          >
            {showModal ? "" : "Ver último Pairing Code"}
          </button>
        </div>
      </div>

      <PairingModal
        showModal={showModal}
        setShowModal={setShowModal}
        pairingCode={pairingCode}
        countdown={countdown}
        verificarConexion={verificarConexion}
        modalMessage={modalMessage}
      />
    </div>
  );
}
