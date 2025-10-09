import { useState } from "react";

export default function InstanceForm({
  instanceName,
  setInstanceName,
  number,
  setNumber,
  handleSubmit,
  processing,
  message,
}) {
  const [errors, setErrors] = useState({ instanceName: "", number: "" });
  const [submitted, setSubmitted] = useState(false);

  // 🔍 Validaciones
  const validateInstanceName = (value) => {
    if (!value.trim()) return "El nombre no puede estar vacío.";
    if (/\s/.test(value)) return "No se permiten espacios.";
    if (value.length < 3) return "Debe tener al menos 3 caracteres.";
    if (value.length > 20) return "No puede superar los 20 caracteres.";
    if (!/^[a-zA-Z0-9_-]+$/.test(value))
      return "Solo letras, números, guiones y guiones bajos.";
    return "";
  };

  const validateNumber = (value) => {
    if (!value) return "El número es obligatorio.";
    if (!/^[0-9]+$/.test(value)) return "Solo se permiten números.";
    if (value.length < 8) return "El número es demasiado corto.";
    if (value.length > 15) return "El número es demasiado largo.";
    return "";
  };

  // 🧠 Al enviar el formulario
  const onSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);

    const nameError = validateInstanceName(instanceName);
    const numberError = validateNumber(number);
    setErrors({ instanceName: nameError, number: numberError });

    if (!nameError && !numberError) {
      handleSubmit(e);
    }
  };

  // ✋ Solo números en el número
  const handleNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setNumber(value);
  };

  // ✋ Evitar espacios en nombre de instancia
  const handleInstanceNameChange = (e) => {
    const value = e.target.value.replace(/\s/g, "");
    setInstanceName(value);

    if (submitted) {
      setErrors((prev) => ({ ...prev, instanceName: validateInstanceName(value) }));
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Nombre de instancia */}
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-1">
          Nombre de instancia
        </label>
        <input
          type="text"
          value={instanceName}
          onChange={handleInstanceNameChange}
          className={`w-full border-l-4 rounded-r-xl p-2 outline-none transition-all
            ${
              submitted && errors.instanceName
                ? "border-red-500 focus:ring-red-500"
                : "border-green-500 focus:ring-green-400"
            } bg-gray-800 text-white placeholder-gray-400`}
          placeholder="Ej: MiEmpresaBot"
        />
        {submitted && errors.instanceName && (
          <p className="text-red-500 text-sm mt-1">{errors.instanceName}</p>
        )}
      </div>

      {/* Número de WhatsApp */}
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-1">
          Número de WhatsApp
        </label>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={number}
          onChange={handleNumberChange}
          className={`w-full border-l-4 rounded-r-xl p-2 outline-none transition-all
            ${
              submitted && errors.number
                ? "border-red-500 focus:ring-red-500"
                : "border-green-500 focus:ring-green-400"
            } bg-gray-800 text-white placeholder-gray-400`}
          placeholder="Ej: 5491123456789"
        />
        {submitted && errors.number && (
          <p className="text-red-500 text-sm mt-1">{errors.number}</p>
        )}
      </div>

      {/* Botón */}
      <button
        type="submit"
        disabled={processing}
        className={`w-full text-white py-2 rounded-lg transition-all font-semibold
          ${
            processing
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-500"
          }`}
      >
        {processing ? "Creando..." : "Crear instancia"}
      </button>

      {/* Mensaje general */}
      {message.text && (
        <div
          className={`mt-4 text-center font-semibold ${
            message.type === "error" ? "text-red-500" : "text-green-400"
          }`}
        >
          {message.text}
        </div>
      )}
    </form>
  );
}
