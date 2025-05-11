interface ExamButtonProps {
  onGenerateClick: () => void; // Función que se ejecuta al hacer clic
  disabled: boolean; // Para desactivar el botón si falta configuración
}

export function ExamButton({ onGenerateClick, disabled }: ExamButtonProps) {
  return (
    <div className="mt-8 flex justify-end border-t pt-6">
      {" "}
      {/* Añadido espacio y línea */}
      <button
        className={`gradient-bg-purple text-white px-8 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300 flex items-center ${
          disabled ? "opacity-50 cursor-not-allowed" : "opacity-100"
        }`}
        onClick={onGenerateClick} // Llama a la función del padre
        disabled={disabled} // Deshabilita el botón
      >
        <i className="fas fa-magic mr-2"></i> Generar Examen
      </button>
    </div>
  );
}
