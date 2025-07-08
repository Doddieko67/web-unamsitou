interface ExamButtonProps {
  onGenerateClick: () => void; // Función que se ejecuta al hacer clic
  disabled: boolean; // Para desactivar el botón si falta configuración
}

export function ExamButton({ onGenerateClick, disabled }: ExamButtonProps) {
  return (
    <div 
      className="mt-8 flex justify-end border-t pt-6 transition-colors duration-300"
      style={{ borderTopColor: 'var(--theme-border-primary)' }}
    >
      <button
        className={`text-white px-8 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 flex items-center ${
          disabled ? "opacity-50 cursor-not-allowed" : "opacity-100"
        }`}
        style={{
          background: disabled 
            ? 'var(--theme-text-tertiary)' 
            : 'linear-gradient(135deg, var(--terciary), var(--cuaternary))',
          '--tw-ring-color': 'var(--primary)',
          '--tw-ring-opacity': '0.5'
        } as React.CSSProperties}
        onMouseEnter={(e) => {
          if (!disabled) {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled) {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
          }
        }}
        onClick={onGenerateClick}
        disabled={disabled}
      >
        <i className="fas fa-magic mr-2"></i> Generar Examen
      </button>
    </div>
  );
}
