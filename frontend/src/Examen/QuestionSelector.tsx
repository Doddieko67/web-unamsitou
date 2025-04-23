interface Pregunta {
  id: number;
  pregunta: string;
  opciones: string[];
  correcta: number;
  respuesta?: number;
}

interface QuestionSelectorProps {
  totalQuestions: number;
  currentQuestionIndex: number;
  answeredQuestions: { [key: number]: number }; // Para saber cuáles están respondidas
  preguntas: Pregunta[]; // Array de preguntas
  onQuestionSelect: (index: number) => void;
  isSubmitted: boolean;
  title: string;
}

export function QuestionSelector({
  totalQuestions,
  currentQuestionIndex,
  answeredQuestions,
  preguntas,
  onQuestionSelect,
  isSubmitted,
  title = "Preguntas",
}: QuestionSelectorProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-semibold text-gray-700 mb-6">{title}</h2>
      <div className="grid grid-cols-8 gap-2">
        {Array.from({ length: totalQuestions }).map((_, index) => {
          const isCurrent = index === currentQuestionIndex;
          const isAnswered = answeredQuestions[index] !== undefined;
          let isCorrect = false; // Default to false
          if (isSubmitted && isAnswered) {
            const correctAnswer = preguntas[index]?.correcta; // Get correct answer index safely
            isCorrect = answeredQuestions[index] === correctAnswer;
          }

          let buttonClasses = `
            p-2 rounded border text-center font-medium text-sm transition-colors duration-150
            focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-400
          `;

          if (isSubmitted) {
            // Estilo después de enviar (simplificado, podrías añadir correcto/incorrecto si pasas más datos)
            buttonClasses += isAnswered
              ? isCorrect
                ? " bg-green-200 text-green-600 cursor-pointer"
                : " bg-red-200 text-red-600 cursor-pointer"
              : " bg-gray-100 text-gray-400 cursor-pointer";
            if (isCurrent) {
              buttonClasses += " ring-2 ring-gray-400"; // Resaltar actual incluso después de enviar
            }
          } else {
            // Estilo antes de enviar
            if (isCurrent) {
              buttonClasses += " bg-indigo-600 text-white border-indigo-700";
            } else if (isAnswered) {
              buttonClasses +=
                " bg-indigo-100 text-indigo-800 border-indigo-300 hover:bg-indigo-200";
            } else {
              buttonClasses +=
                " bg-white text-gray-700 border-gray-300 hover:bg-gray-100";
            }
            buttonClasses += " cursor-pointer";
          }

          return (
            <button
              key={index}
              type="button"
              className={buttonClasses}
              onClick={() => onQuestionSelect(index)}
              aria-current={isCurrent ? "page" : undefined}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}
