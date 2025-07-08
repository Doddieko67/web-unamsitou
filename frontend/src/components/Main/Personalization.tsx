interface PersonalizationProps {
  fineTuning: string;
  onFineTuningChange: (text: string) => void;
}

export function Personalization({
  fineTuning,
  onFineTuningChange,
}: PersonalizationProps) {
  return (
    <div className="h-full flex flex-col">
      <label
        htmlFor="fine-tuning-input"
        className="block text-lg font-medium mb-4"
        style={{ color: 'var(--theme-text-primary)' }}
      >
        Personalización (Opcional)
      </label>
      <div className="relative flex-1 flex flex-col">
        <textarea
          id="fine-tuning-input"
          name="message"
          className="w-full h-full px-4 py-3 rounded-xl border-2 transition-all duration-300 text-sm resize-none"
          style={{
            backgroundColor: 'var(--theme-bg-secondary)',
            borderColor: fineTuning.trim() ? 'var(--primary)' : 'var(--theme-border-primary)',
            color: 'var(--theme-text-primary)',
            minHeight: '200px'
          }}
          placeholder="Ejemplo: Enfócate en álgebra lineal. Preguntas de literatura deben ser sobre el siglo XX. Incluye preguntas de aplicación práctica. Evita preguntas demasiado teóricas..."
          value={fineTuning}
          onChange={(e) => onFineTuningChange(e.target.value)}
        ></textarea>
        <p 
          className="text-xs mt-2"
          style={{ color: 'var(--theme-text-secondary)' }}
        >
          Describe cualquier detalle específico que la IA deba considerar al generar el examen.
        </p>
      </div>
    </div>
  );
}
