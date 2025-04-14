interface PersonalizationProps {
  fineTuning: string;
  onFineTuningChange: (text: string) => void;
}

export function Personalization({
  fineTuning,
  onFineTuningChange,
}: PersonalizationProps) {
  return (
    <div className="mb-8">
      {" "}
      {/* Añadido margen inferior */}
      <label
        htmlFor="fine-tuning-input"
        className="block text-lg font-medium text-gray-700 mb-4" // Ajustado tamaño y margen
      >
        4. Personalización (Opcional)
      </label>
      <div className="relative">
        <textarea
          id="fine-tuning-input"
          name="message" // Puedes quitar 'required' si es opcional
          rows={3} // Ajusta el número de filas si quieres
          className="input-field w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm text-sm"
          placeholder="Ejemplo: Enfócate en álgebra lineal. Preguntas de literatura deben ser sobre el siglo XX..."
          value={fineTuning} // Controlado por el estado del padre
          onChange={(e) => onFineTuningChange(e.target.value)} // Llama a la función del padre
        ></textarea>
        <p className="text-xs text-gray-500 mt-1">
          Describe cualquier detalle específico que la IA deba considerar al
          generar el examen.
        </p>
      </div>
    </div>
  );
}
