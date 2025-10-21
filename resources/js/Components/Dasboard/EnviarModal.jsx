import { useState } from "react";
import ManualTab from "./Tabs/ManualTab";
import ExcelTab from "./Tabs/ExcelTab";
import ContactosTab from "./Tabs/ContactosTab";

export default function EnviarModal({ isOpen, onClose, instance }) {
  const [activeTab, setActiveTab] = useState("manual");

  if (!isOpen) return null;

  const renderTabContent = () => {
    switch (activeTab) {
      case "manual":
        return <ManualTab instance={instance} />;
      case "excel":
        return <ExcelTab instance={instance} />;
      case "contactos":
        return <ContactosTab instance={instance} />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-zinc-900 text-white rounded-2xl shadow-2xl w-full max-w-3xl relative border border-green-700/30 overflow-hidden">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl z-20"
        >
          ✕
        </button>

        {/* Encabezado */}
        <div className="bg-green-700/10 p-5 border-b border-green-800/30 text-center">
          <h2 className="text-2xl font-bold text-green-400 tracking-widest">
            Enviar mensaje - {instance?.instance_name}
          </h2>
        </div>

        {/* Menú superior */}
        <div className="flex justify-around bg-green-800/20 border-b border-green-800/40">
          {[
            { key: "manual", label: "Manual" },
            { key: "excel", label: "Excel" },
            { key: "contactos", label: "Extraer contactos" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 py-3 text-lg font-semibold transition-all duration-300 ${
                activeTab === key
                  ? "bg-green-600/30 text-green-400 border-b-2 border-green-400"
                  : "hover:bg-green-700/10 text-gray-400"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Contenido */}
        <div className="p-8 text-gray-300 h-[400px] overflow-y-auto animate-fadeIn">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}
