import React from "react";

interface QuestionSelectorProps {
  totalQuestions: number;
  currentQuestionIndex: number;
  answeredQuestions: { [key: number]: number }; // Para saber cuáles están respondidas
  onQuestionSelect: (index: number) => void;
  isSubmitted: boolean;
}

export function QuestionSelector({
  totalQuestions,
  currentQuestionIndex,
  answeredQuestions,
  onQuestionSelect,
  isSubmitted,
}: QuestionSelectorProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">Preguntas</h2>
      <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-5 gap-2">
        {Array.from({ length: totalQuestions }).map((_, index) => {
          const isCurrent = index === currentQuestionIndex;
          const isAnswered = answeredQuestions[index] !== undefined;

          let buttonClasses = `
            p-2 rounded border text-center font-medium text-sm transition-colors duration-150
            focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-400
          `;

          if (isSubmitted) {
            // Estilo después de enviar (simplificado, podrías añadir correcto/incorrecto si pasas más datos)
            buttonClasses += isAnswered
              ? " bg-gray-200 text-gray-600 cursor-default"
              : " bg-gray-100 text-gray-400 cursor-default";
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
              onClick={() => !isSubmitted && onQuestionSelect(index)}
              aria-current={isCurrent ? "page" : undefined}
              disabled={isSubmitted}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
      {isSubmitted && (
        <p className="text-xs text-gray-500 mt-3 text-center">
          Examen finalizado. Navegación desactivada.
        </p>
      )}
    </div>
  );
}
