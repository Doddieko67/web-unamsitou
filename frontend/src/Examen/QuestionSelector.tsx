interface Pregunta {
  id?: number;
  pregunta: string;
  opciones?: string[];
  correcta?: number;
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
  pinnedQuestions: { [key: number]: boolean };
  pinnedMode?: boolean; // New prop to indicate we're in pinned mode
  grid?: number;
}

export function QuestionSelector({
  totalQuestions,
  currentQuestionIndex,
  answeredQuestions,
  preguntas,
  onQuestionSelect,
  isSubmitted,
  title = "Preguntas",
  pinnedQuestions,
  pinnedMode = false, // Default to false
  grid = 8, // Default to 8 columns
}: QuestionSelectorProps) {
  // If we're in pinned mode, we'll create a mapping of filtered indices to original indices
  const pinnedIndices = pinnedMode
    ? Object.keys(pinnedQuestions)
        .map(Number)
        .sort((a, b) => a - b)
    : [];

  // Get the actual number of questions to display
  const displayCount = pinnedMode ? pinnedIndices.length : totalQuestions;

  // If there are no pinned questions and we're in pinned mode, don't render anything
  if (pinnedMode && displayCount === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-semibold text-gray-700 mb-6">{title}</h2>
      <div className={`grid grid-cols-${grid} gap-2`}>
        {Array.from({ length: displayCount }).map((_, i) => {
          // If in pinned mode, map the index to the original question index
          const index = pinnedMode ? pinnedIndices[i] : i;

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

          if (preguntas[index]?.id === undefined) {
            buttonClasses += "bg-purple-200 text-purple-600 cursor-pointer";
          } else if (isSubmitted) {
            // Estilo después de enviar
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
              buttonClasses +=
                pinnedQuestions[index] !== undefined
                  ? " bg-pink-400 text-white border-pink-200"
                  : " bg-indigo-600 text-white border-indigo-700";
            } else if (isAnswered) {
              buttonClasses +=
                " bg-indigo-100 text-indigo-800 border-indigo-300 hover:bg-indigo-200";
            } else {
              buttonClasses +=
                " bg-white text-gray-700 border-gray-300 hover:bg-gray-100";
            }
            buttonClasses += " cursor-pointer";
          }

          // Always add the pink outline for pinned questions
          if (pinnedQuestions[index] !== undefined) {
            buttonClasses += " outline-pink-400 outline-2";
          }

          return (
            <button
              key={index}
              type="button"
              className={buttonClasses}
              onClick={() => onQuestionSelect(index)}
              aria-current={isCurrent ? "page" : undefined}
            >
              {preguntas[index]?.id ? (
                preguntas[index].id
              ) : (
                <i className="fas fa-book"></i>
              )}{" "}
              {/* Display original question number */}
            </button>
          );
        })}
      </div>
    </div>
  );
}
