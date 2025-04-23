import { useState, useRef } from "react";
import { SeccionExamen } from "./SeccionExamen"; // Ajusta la ruta
// Asegúrate de importar la interfaz Pregunta si la necesitas aquí directamente
// o pásala a través de las props como un tipo genérico si es necesario.

interface Pregunta {
  id: number;
  pregunta: string;
  opciones: string[];
  correcta: number;
  respuesta?: number;
  feedback?: string;
}

// Define las props que este componente necesita
interface PreviewableSeccionExamenProps {
  pregunta: Pregunta; // O el tipo correcto si `Pregunta` no está definida aquí
  index: number; // Necesario para la lógica de columna
  totalQuestions: number;
  selectedAnswer: number | undefined;
  userAnswers: { [key: number]: number };
  preguntas: Pregunta[];
  isSubmitted: boolean;
  onPinToggle: (questionIndex: number) => void;
  isThisPinned: boolean;
  handleScrollToQuestion: (questionIndex: number) => void;
  directed?: boolean;
  id?: string;
}

// Umbral en píxeles desde el borde superior del viewport.
// Si el elemento está más cerca que esto, la preview irá debajo. ¡AJUSTA ESTE VALOR!
const VIEWPORT_TOP_THRESHOLD = 300; // Intenta con 150px, por ejemplo

export function PreviewableSeccionExamen({
  pregunta,
  index,
  totalQuestions,
  selectedAnswer,
  userAnswers,
  preguntas,
  isSubmitted, // Asumimos que es true si este componente se renderiza
  onPinToggle,
  isThisPinned,
  handleScrollToQuestion,
  id = "",
}: PreviewableSeccionExamenProps) {
  const [showPreviewBelow, setShowPreviewBelow] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      // Comprueba si la parte superior del elemento está demasiado cerca del borde superior del viewport
      if (rect.top < VIEWPORT_TOP_THRESHOLD) {
        setShowPreviewBelow(true); // No hay espacio arriba, fuerza abajo
      } else {
        setShowPreviewBelow(false); // Hay espacio, usa la lógica normal (arriba)
      }
    }
  };

  // Opcional: Resetear al salir, aunque onMouseEnter lo recalcula
  const handleMouseLeave = () => {
    // Puedes descomentar si quieres que siempre se recalcule al entrar de nuevo
    // setShowPreviewBelow(false);
  };

  // --- Construcción dinámica de clases ---
  const isEvenIndex = index % 2 === 0; // Columna 1 (izquierda)

  const basePreviewClasses = `
    absolute z-10 w-full max-w-md /* Añadido max-width para evitar que sea gigante */
    opacity-0 scale-75
    transition-all duration-300 ease-in-out
    pointer-events-none transform rounded-lg
    group-hover:opacity-85 group-hover:scale-100 group-hover:z-20
  `;

  let positionClasses = "";

  if (showPreviewBelow) {
    // --- FORZADO ABAJO ---
    // Aparece debajo, origen arriba-izquierda por defecto.
    // Podríamos refinar la posición horizontal aquí si es necesario
    positionClasses = "top-full left-0 origin-top-left mt-2";
    // Si está en la columna derecha, quizá prefieras 'top-full right-0 origin-top-right mt-2'?
    // if (!isEvenIndex) {
    //   positionClasses = 'top-full right-0 origin-top-right mt-2 md:left-auto';
    // }
  } else {
    // --- ARRIBA (Lógica de columna para md+) ---
    // Default móvil (aparece arriba simple)
    const mobileAbove = "bottom-full left-0 origin-bottom-left mb-2";
    // Lógica md+
    let mdAbove = "";
    if (isEvenIndex) {
      // Columna 1 -> Arriba-Derecha
      mdAbove =
        "md:bottom-full md:left-full md:top-auto md:mb-0 md:ml-2 md:origin-bottom-left";
    } else {
      // Columna 2 -> Arriba-Izquierda
      mdAbove =
        "md:bottom-full md:right-full md:top-auto md:left-auto md:mb-0 md:mr-2 md:origin-bottom-right";
    }
    positionClasses = `${mobileAbove} ${mdAbove}`;
  }

  const finalPreviewClassName = `${basePreviewClasses} ${positionClasses}`;
  // --- Fin construcción de clases ---

  return (
    <div
      ref={containerRef}
      className="group relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave} // Opcional
    >
      {/* Componente Original */}
      <SeccionExamen
        pregunta={pregunta}
        questionIndex={index}
        totalQuestions={totalQuestions}
        selectedAnswer={selectedAnswer}
        onAnswerSelect={() => {}} // Dummy
        onPrevious={() => {}} // Dummy
        onNext={() => {}} // Dummy
        onFinalize={() => {}} // Dummy
        isSubmitted={isSubmitted}
        userAnswers={userAnswers}
        preguntas={preguntas}
        habilitarBotones={false} // Siempre false
        mostrarLista={false}
        mostrarEncabezado={true}
        onPinToggle={onPinToggle}
        isCurrentQuestionPinned={isThisPinned}
        handleScrollToQuestion={handleScrollToQuestion}
        id={id}
      />

      {/* Div de la Vista Previa con clases calculadas */}
      <div className={finalPreviewClassName} aria-hidden="true">
        {/* Estilo visual */}
        <div className="h-auto w-full bg-white shadow-xl rounded-lg border border-gray-200 overflow-hidden">
          {/* Contenido de la Preview */}
          <SeccionExamen
            pregunta={pregunta}
            questionIndex={index}
            totalQuestions={totalQuestions}
            selectedAnswer={selectedAnswer}
            onAnswerSelect={() => {}} // Dummy
            onPrevious={() => {}} // Dummy
            onNext={() => {}} // Dummy
            onFinalize={() => {}} // Dummy
            isSubmitted={isSubmitted}
            userAnswers={userAnswers}
            preguntas={preguntas}
            habilitarBotones={false} // Siempre false
            mostrarLista={true}
            mostrarEncabezado={false}
            mostrarBandera={false}
            onPinToggle={() => {}}
            isCurrentQuestionPinned={isThisPinned}
          />
        </div>
      </div>
    </div>
  );
}
