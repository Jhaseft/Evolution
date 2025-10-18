import axios from "axios";
import { useState, useEffect } from "react";
import { Inertia } from "@inertiajs/inertia";
import InstanceForm from "@/Components/Evolution/IntanceForm";
import PairingModal from "@/Components/Evolution/PairingModal";

export default function PublicTest() {
  const [instanceName, setInstanceName] = useState("");
  const [number, setNumber] = useState("");
  const [pairingCode, setPairingCode] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [connectionState, setConnectionState] = useState("pending"); // pending, connected, failed

  //  CREAR instancia sin BD (ruta pública)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setMessage({ type: "", text: "" });
    setConnectionState("pending");

    try {
      const res = await axios.post("/evolution/public/create", { instanceName, number });

      if (res.data.error) {
        setMessage({ type: "error", text: res.data.message });
      } else {
        const pairing = res.data.response?.qrcode?.pairingCode || null;
        if (pairing) {
          setPairingCode(pairing);
          setShowModal(true);
          setCountdown(30);
          setMessage({ type: "success", text: "Instancia creada correctamente." });
        } else {
          setMessage({ type: "error", text: "No se pudo generar el código de emparejamiento." });
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Error al crear la instancia.";
      setMessage({ type: "error", text: msg });
    } finally {
      setProcessing(false);
    }
  };

  // 🟡 Verificar conexión cada 3 segundos
  useEffect(() => {
    if (!showModal) return;
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`/evolution/public/status/${instanceName}`);
        if (res.data.connected) {
          setConnectionState("connected");
          clearInterval(interval);
          setTimeout(() => {
            setShowModal(false);
            setMessage({ type: "success", text: "Instancia conectada correctamente Jaime" });
          }, 2000);
        }
      } catch {
        // no hacemos nada
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [showModal, instanceName]);

  //  Countdown
  useEffect(() => {
    if (!showModal || countdown <= 0) return;
    const timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [showModal, countdown]);

  // ❌ Si se acaba el tiempo y no se conectó, eliminar
  useEffect(() => {
    if (countdown === 0 && showModal && connectionState !== "connected") {
      setConnectionState("failed");
      axios.delete(`/evolution/public/destroy/${instanceName}`)
        .then(() => setMessage({ type: "error", text: "Instancia eliminada por timeout." }))
        .finally(() => setTimeout(() => setShowModal(false), 3000));

    }
  }, [countdown, showModal, connectionState, instanceName]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 px-4">
      <div className="relative w-full max-w-md p-8 bg-gradient-to-br from-gray-800 via-black to-gray-900
                      rounded-r-3xl border-l-4 border-r-4 border-green-500 shadow-2xl hover:shadow-green-600 transition-shadow duration-300">
        <h2 className="text-2xl text-center mb-6 bg-clip-text text-transparent 
                       bg-gradient-to-r from-green-400 to-green-900 tracking-wide">
          Crear instancia pública (sin BD)
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
      </div>

      <PairingModal
        showModal={showModal}
        pairingCode={pairingCode}
        countdown={countdown}
        connectionState={connectionState}
      />
    </div>
  );
}
