import { memo } from 'react';

export interface LoadingWithCancelProps {
  /** Mensaje principal de carga */
  title?: string;
  /** Mensaje secundario/descripción */
  subtitle?: string;
  /** Función para cancelar la operación */
  onCancel: () => void;
  /** Texto del botón de cancelar */
  cancelButtonText?: string;
  /** Mostrar el botón de cancelar */
  showCancelButton?: boolean;
  /** Estilos personalizados para el contenedor */
  className?: string;
  /** Colores del tema a usar */
  theme?: {
    backgroundColor?: string;
    borderColor?: string;
    textColor?: string;
    buttonBackgroundColor?: string;
    buttonBorderColor?: string;
    buttonTextColor?: string;
  };
}

/**
 * Componente reutilizable para mostrar estado de carga con opción de cancelar
 */
export const LoadingWithCancel = memo<LoadingWithCancelProps>(({
  title = 'Procesando...',
  subtitle = 'Esto puede tardar unos momentos',
  onCancel,
  cancelButtonText = '❌ Cancelar',
  showCancelButton = true,
  className = '',
  theme = {}
}) => {
  const defaultTheme = {
    backgroundColor: 'var(--theme-info-light)',
    borderColor: 'var(--theme-info)',
    textColor: 'var(--theme-info-dark)',
    buttonBackgroundColor: 'var(--theme-error-light)',
    buttonBorderColor: 'var(--theme-error)',
    buttonTextColor: 'var(--theme-error-dark)',
    ...theme
  };

  return (
    <div className={`space-y-4 text-center ${className}`}>
      {/* Loading indicator con mensaje */}
      <div 
        className="inline-flex items-center space-x-3 px-6 py-4 rounded-2xl border-2"
        style={{
          backgroundColor: defaultTheme.backgroundColor,
          borderColor: defaultTheme.borderColor,
          color: defaultTheme.textColor
        }}
      >
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
        <span className="font-semibold">{title}</span>
      </div>

      {/* Subtítulo */}
      {subtitle && (
        <p 
          className="text-sm"
          style={{ color: 'var(--theme-text-secondary)' }}
        >
          {subtitle}
        </p>
      )}

      {/* Botón de cancelar */}
      {showCancelButton && (
        <button
          onClick={onCancel}
          className="mt-4 px-4 py-2 rounded-lg font-medium transition-colors hover:opacity-80"
          style={{
            backgroundColor: defaultTheme.buttonBackgroundColor,
            borderColor: defaultTheme.buttonBorderColor,
            color: defaultTheme.buttonTextColor,
            border: `1px solid ${defaultTheme.buttonBorderColor}`
          }}
        >
          {cancelButtonText}
        </button>
      )}
    </div>
  );
});

LoadingWithCancel.displayName = 'LoadingWithCancel';

/**
 * Variantes predefinidas del componente LoadingWithCancel
 */
export const ExamGenerationLoading = memo<Omit<LoadingWithCancelProps, 'title' | 'subtitle'>>(
  (props) => (
    <LoadingWithCancel
      title="Generando examen con IA..."
      subtitle="Esto puede tardar unos momentos"
      cancelButtonText="❌ Cancelar Generación"
      {...props}
    />
  )
);

export const FileProcessingLoading = memo<Omit<LoadingWithCancelProps, 'title' | 'subtitle'>>(
  (props) => (
    <LoadingWithCancel
      title="Procesando archivos..."
      subtitle="Analizando documentos y generando preguntas"
      cancelButtonText="❌ Cancelar Procesamiento"
      {...props}
    />
  )
);

export const HistoryBasedLoading = memo<Omit<LoadingWithCancelProps, 'title' | 'subtitle'>>(
  (props) => (
    <LoadingWithCancel
      title="Generando examen basado en historial..."
      subtitle="Analizando exámenes anteriores para crear contenido personalizado"
      cancelButtonText="❌ Cancelar Generación"
      {...props}
    />
  )
);

ExamGenerationLoading.displayName = 'ExamGenerationLoading';
FileProcessingLoading.displayName = 'FileProcessingLoading';
HistoryBasedLoading.displayName = 'HistoryBasedLoading';