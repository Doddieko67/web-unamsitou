// src/components/PreviewableRecentExamCard.tsx (o la ruta que uses)
import { useState, useRef } from "react"; // Importa React
import { ExamenData } from "./interfacesExam"; // Asegúrate de que la ruta sea correcta
import { RecentExamCard } from "./RecentExamCard"; // Asegúrate de que la ruta sea correcta

// Define las props que este componente necesita
interface PreviewableRecentExamCardProps {
  exam: ExamenData; // Los datos del examen
  onDelete: (id: string) => void; // La función para eliminar (pasada desde el padre)
  index: number; // El índice en la lista (útil para la lógica de columna/posición de preview)
  onPinToggle?: (questionIndex: string) => void;
  isThisPinned?: boolean;
  onEntireToggle: (examId: string) => void;
  isPinneable: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
}

// Umbral en píxeles desde el borde superior del viewport.
// Si el elemento está más cerca que esto, la preview irá debajo. ¡AJUSTA ESTE VALOR!
const VIEWPORT_TOP_THRESHOLD = 300; // Puedes experimentar con 150, 200, etc.

export function PreviewableRecentExamCard({
  exam,
  onDelete,
  index,
  onPinToggle,
  isThisPinned = false,
  onEntireToggle,
  isPinneable = false,
  isSelected = false,
  onSelect,
}: PreviewableRecentExamCardProps) {
  // Estado para la posición de la preview (true = abajo, false = arriba)
  const [showPreviewBelow, setShowPreviewBelow] = useState(false);
  // Referencia al div contenedor para medir su posición en el viewport
  const containerRef = useRef<HTMLDivElement>(null);

  // Manejador al entrar el ratón
  const handleMouseEnter = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      // Si el borde superior del elemento está por encima del umbral (cerca del top)
      // forzamos la preview a aparecer ABAJO para evitar que se salga por arriba.
      // De lo contrario, permitimos que aparezca ARRIBA según la lógica de columna.
      setShowPreviewBelow(rect.top < VIEWPORT_TOP_THRESHOLD);
    }
  };

  // Manejador al salir el ratón (opcional)
  const handleMouseLeave = () => {
    // No es estrictamente necesario resetear aquí si onMouseEnter siempre recalcula,
    // pero puedes hacerlo si prefieres que la preview desaparezca inmediatamente.
    // setShowPreviewBelow(false);
  };

  // --- Construcción dinámica de clases para la Preview ---

  // Clases base para la preview (comunes independientemente de la posición)
  const basePreviewClasses = `
    absolute z-10 w-full max-w-sm /* Ajusta max-width */
    opacity-0 scale-75
    transition-all duration-300 ease-in-out
    pointer-events-none transform rounded-lg
    group-hover:opacity-85 group-hover:scale-100 group-hover:z-20
    overflow-hidden /* Asegura que el contenido redondeado no se desborde */
  `;

  let positionClasses = ""; // Variable para acumular las clases de posicionamiento

  if (showPreviewBelow) {
    // --- Lógica cuando la Preview se fuerza ABAJO ---
    // La posición vertical es siempre 'top-full' (debajo del elemento).
    // Para la posición horizontal, podemos aplicar lógica similar a la de "arriba"
    // para alinearla correctamente según la columna en cada punto de ruptura.

    // Posicionamiento vertical: siempre abajo
    positionClasses = "top-full mt-2"; // mt-2 para un pequeño espacio

    // Posicionamiento horizontal y origen: usando lógica de columna para cada breakpoint
    // Default (mobile, 1 columna): alineado a la izquierda
    positionClasses += " left-0 origin-top-left"; // O right-0 origin-top-right si prefieres

    // md breakpoint (2 columnas)
    // index % 2 === 0: columna izquierda (0, 2, 4...) -> preview a la derecha
    // index % 2 !== 0: columna derecha (1, 3, 5...) -> preview a la izquierda
    if (index % 2 === 0) {
      positionClasses += " md:origin-top-left"; // ml-2 ya está en mt-2, o añadir md:ml-2
    } else {
      positionClasses += " md:origin-top-right"; // mr-2 ya está en mt-2, o añadir md:mr-2
    }

    // lg breakpoint (3 columnas)
    const lgColumn = index % 3;
    if (lgColumn === 0) {
      // Columna izquierda (0, 3, 6...)
      positionClasses += " lg:left-full lg:left-auto lg:origin-top-left";
    } else if (lgColumn === 2) {
      // Columna derecha (2, 5, 8...)
      positionClasses += " lg:right-full lg:left-auto lg:origin-top-right";
    } else {
      // Columna central (1, 4, 7...)
      positionClasses += "lg:translate-x-1/2 lg:right-auto lg:origin-top"; // Origin top center
    }
  } else {
    // --- Lógica cuando la Preview va ARRIBA (si hay espacio) ---
    // La posición vertical es siempre 'bottom-full' (arriba del elemento).

    // Posicionamiento vertical: siempre arriba
    positionClasses = "bottom-full mb-2"; // mb-2 para un pequeño espacio

    // Posicionamiento horizontal y origen: usando lógica de columna para cada breakpoint
    // Default (mobile, 1 columna): alineado a la izquierda
    positionClasses += " left-0 origin-bottom-left"; // O right-0 origin-bottom-right si prefieres

    // md breakpoint (2 columnas)
    // index % 2 === 0: columna izquierda -> preview a la derecha
    // index % 2 !== 0: columna derecha -> preview a la izquierda
    if (index % 2 === 0) {
      positionClasses += " md:left-full md:left-auto md:origin-bottom-left"; // ml-2 ya está en mb-2, o añadir md:ml-2
    } else {
      positionClasses += " md:right-full md:left-auto md:origin-bottom-right"; // mr-2 ya está en mb-2, o añadir md:mr-2
    }

    // lg breakpoint (3 columnas)
    const lgColumn = index % 3;
    if (lgColumn === 0) {
      // Columna izquierda
      positionClasses += " lg:left-full lg:left-auto lg:origin-bottom-left";
    } else if (lgColumn === 2) {
      // Columna derecha
      positionClasses += " lg:right-full lg:left-auto lg:origin-bottom-right";
    } else {
      // Columna central
      positionClasses += "lg:-translate-x-1 lg:left-auto lg:origin-bottom"; // Origin bottom center
    }
  }

  // Clases finales combinadas: clases base + clases de posicionamiento calculadas
  const finalPreviewClassName = `${basePreviewClasses} ${positionClasses}`;
  // --- Fin construcción de clases ---

  return (
    // Este div es el contenedor principal para la tarjeta y la preview.
    // Es el item del grid en ExamRecents.
    // Le aplicamos 'group' para que los efectos 'group-hover' funcionen en la preview.
    // Le aplicamos 'relative' para que la preview 'absolute' se posicione correctamente.
    // La 'key' se coloca aquí porque este es el elemento raíz generado por el map en ExamRecents.
    <div
      key={exam.id}
      ref={containerRef} // Asignamos la referencia para medir la posición
      className="group relative" // Clases de Tailwind
      onMouseEnter={handleMouseEnter} // Manejador al entrar el ratón
      onMouseLeave={handleMouseLeave} // Manejador al salir el ratón (opcional)
    >
      {/* Renderiza la tarjeta principal del examen */}
      <RecentExamCard
        exam={exam}
        onDelete={onDelete}
        onPinToggle={onPinToggle}
        isPinneable={isPinneable}
        isThisPinned={isThisPinned}
        onEntireToggle={onEntireToggle}
        isSelected={isSelected}
        onSelect={onSelect}
      />

      {/* Div para la vista previa. Inicialmente invisible y escalada */}
      <div className={finalPreviewClassName} aria-hidden="true">
        {/* Contenido de la vista previa - Theme Aware */}
        <div 
          className="h-auto w-full shadow-xl rounded-lg border p-4 transition-colors duration-300"
          style={{
            backgroundColor: 'var(--theme-bg-primary)',
            borderColor: 'var(--theme-border-secondary)',
            boxShadow: 'var(--theme-shadow-xl)'
          }}
        >
          {/* Contenido de la Preview */}
          <h4 
            className="font-semibold mb-2"
            style={{ color: 'var(--theme-text-primary)' }}
          >
            {exam.titulo}
          </h4>
          <p 
            className="text-sm"
            style={{ color: 'var(--theme-text-secondary)' }}
          >
            {exam.descripcion || "Sin descripción disponible."}
          </p>
          {/* Preview adicional con metadata del examen */}
          <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--theme-border-primary)' }}>
            <div className="flex items-center justify-between text-xs">
              <span 
                className="flex items-center space-x-1"
                style={{ color: 'var(--theme-text-muted)' }}
              >
                <i className="fas fa-question-circle" style={{ color: 'var(--primary)' }}></i>
                <span>{exam.numero_preguntas} preguntas</span>
              </span>
              <span 
                className="px-2 py-1 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: exam.dificultad === 'easy' ? 'var(--theme-success-light)' :
                                  exam.dificultad === 'medium' ? 'var(--theme-warning-light)' :
                                  exam.dificultad === 'hard' ? 'var(--theme-error-light)' : 'var(--theme-info-light)',
                  color: exam.dificultad === 'easy' ? 'var(--theme-success-dark)' :
                         exam.dificultad === 'medium' ? 'var(--theme-warning-dark)' :
                         exam.dificultad === 'hard' ? 'var(--theme-error-dark)' : 'var(--theme-info-dark)'
                }}
              >
                {exam.dificultad === 'easy' ? '🟢 Fácil' :
                 exam.dificultad === 'medium' ? '🟡 Medio' :
                 exam.dificultad === 'hard' ? '🔴 Difícil' : '🌈 Mixto'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
