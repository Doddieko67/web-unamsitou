// src/components/PreguntaCard.tsx (New or Renamed File)
import React from "react";

interface Pregunta {
  id: number;
  pregunta: string;
  opciones: string[];
  correcta: number;
}

interface PreguntaCardProps {
  pregunta: Pregunta;
  questionIndex: number; // Index of this question in the full list
  totalQuestions: number;
  selectedAnswer: number | undefined; // Index of the selected option, or undefined
  onAnswerSelect: (questionIndex: number, optionIndex: number) => void;
  isSubmitted: boolean;
}

// Helper to get Tailwind classes based on state
const getOptionClasses = (
  optionIndex: number,
  selectedAnswer: number | undefined,
  correctAnswer: number,
  isSubmitted: boolean,
): string => {
  let baseClasses =
    "option-item p-4 border rounded-lg cursor-pointer transition duration-200 ease-in-out flex items-center text-sm sm:text-base";
  const disabledClasses = "cursor-not-allowed opacity-70";
  const hoverClasses = "hover:bg-indigo-50 hover:border-indigo-300"; // Only apply hover if not submitted

  if (isSubmitted) {
    if (correctAnswer === optionIndex) {
      // Correct option (always green after submit)
      baseClasses +=
        " bg-green-100 border-green-400 text-green-800 font-medium";
    } else if (selectedAnswer === optionIndex) {
      // User selected this, but it's incorrect
      baseClasses += " bg-red-100 border-red-400 text-red-800 font-medium";
    } else {
      // Other incorrect options
      baseClasses += " border-gray-200 text-gray-600";
    }
    return `${baseClasses} ${disabledClasses}`; // Disable interactions after submit
  } else {
    // Before submission
    if (selectedAnswer === optionIndex) {
      // Currently selected
      baseClasses +=
        " bg-indigo-100 border-indigo-400 text-indigo-800 font-medium ring-2 ring-indigo-200";
    } else {
      // Not selected
      baseClasses += " border-gray-200 text-gray-700";
    }
    return `${baseClasses} ${hoverClasses}`; // Enable hover effect
  }
};

// Helper for icon
const getOptionIcon = (
  optionIndex: number,
  selectedAnswer: number | undefined,
  correctAnswer: number,
  isSubmitted: boolean,
): React.ReactNode => {
  const baseIconClass = "w-5 h-5 mr-3 flex-shrink-0";

  if (isSubmitted) {
    if (correctAnswer === optionIndex) {
      return (
        <i
          className={`fas fa-check-circle text-green-600 ${baseIconClass}`}
        ></i>
      );
    } else if (selectedAnswer === optionIndex) {
      return (
        <i className={`fas fa-times-circle text-red-600 ${baseIconClass}`}></i>
      );
    } else {
      return <i className={`far fa-circle text-gray-400 ${baseIconClass}`}></i>; // Empty circle for others
    }
  } else {
    // Before submission
    if (selectedAnswer === optionIndex) {
      return (
        <i className={`fas fa-dot-circle text-indigo-600 ${baseIconClass}`}></i>
      ); // Filled dot for selected
    } else {
      return <i className={`far fa-circle text-gray-400 ${baseIconClass}`}></i>; // Empty circle
    }
  }
};

export function PreguntaCard({
  pregunta,
  questionIndex,
  totalQuestions,
  selectedAnswer,
  onAnswerSelect,
  isSubmitted,
}: PreguntaCardProps) {
  const optionLabels = ["A", "B", "C", "D", "E", "F", "G", "H"]; // Add more if needed

  return (
    <div
      className="question-item bg-white rounded-xl shadow-md overflow-hidden mb-6 border-l-4 border-indigo-500"
      id={`question-${questionIndex}`} // Add id for potential scroll-to functionality
    >
      <div className="p-5 sm:p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 leading-tight">
            {/* Include question number */}
            Pregunta {questionIndex + 1} / {totalQuestions}
          </h3>
          {/* Optional: Add category/tag if available in pregunta data */}
          {/* <span className="text-xs sm:text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded">Categoría</span> */}
        </div>
        <p className="text-gray-700 mb-6 text-sm sm:text-base">
          {pregunta.pregunta}
        </p>

        <div className="space-y-3 sm:space-y-4">
          {pregunta.opciones.map((opcion, optionIndex) => (
            <div
              key={optionIndex}
              className={getOptionClasses(
                optionIndex,
                selectedAnswer,
                pregunta.correcta,
                isSubmitted,
              )}
              onClick={() =>
                !isSubmitted && onAnswerSelect(questionIndex, optionIndex)
              } // Prevent selection after submit
              role="radio" // Accessibility
              aria-checked={selectedAnswer === optionIndex}
              tabIndex={isSubmitted ? -1 : 0} // Manage focus
              onKeyDown={(e) => {
                if (!isSubmitted && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault(); // Prevent page scroll on space
                  onAnswerSelect(questionIndex, optionIndex);
                }
              }}
            >
              {getOptionIcon(
                optionIndex,
                selectedAnswer,
                pregunta.correcta,
                isSubmitted,
              )}
              <span className="font-medium mr-2">
                {optionLabels[optionIndex]}.
              </span>
              <span>{opcion}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
