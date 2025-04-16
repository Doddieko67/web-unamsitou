interface Pregunta {
  id: number;
  pregunta: string;
  opciones: string[];
  correcta: number;
}

interface SeccionExamenProps {
  pregunta: Pregunta; // La pregunta actual a mostrar
  questionIndex: number; // El índice de esta pregunta
  totalQuestions: number;
  selectedAnswer: number | undefined; // El índice de la respuesta seleccionada por el usuario para ESTA pregunta
  onAnswerSelect: (questionIndex: number, optionIndex: number) => void; // Función para registrar la respuesta
  onPrevious: () => void; // Función para ir a la anterior
  onNext: () => void; // Función para ir a la siguiente
  onFinalize: () => void; // Función para finalizar desde el botón de la última pregunta
  isSubmitted: boolean; // Indica si el examen ya fue enviado
  // Pasamos todas las respuestas y preguntas para mostrar feedback correcto/incorrecto
  userAnswers: { [key: number]: number };
  preguntas: Pregunta[];
}

export function SeccionExamen({
  pregunta,
  questionIndex,
  totalQuestions,
  selectedAnswer,
  onAnswerSelect,
  onPrevious,
  onNext,
  onFinalize,
  isSubmitted,
  userAnswers, // Usado para mostrar feedback
  preguntas, // Usado para saber la correcta
}: SeccionExamenProps) {
  const letras = ["A", "B", "C", "D"]; // Asegúrate de tener suficientes letras

  // --- Clases Dinámicas para Opciones (similar a antes, pero usa props) ---
  const getOptionClassName = (opcionIndex: number): string => {
    const baseClasses =
      "p-3 border rounded-lg transition-all duration-200 flex items-center text-sm sm:text-base";
    const hoverClass = !isSubmitted
      ? "hover:bg-indigo-50 hover:border-indigo-300 cursor-pointer"
      : "cursor-default";
    let stateClasses = "border-gray-200";

    const isSelected = selectedAnswer === opcionIndex;

    if (isSubmitted) {
      const userAnswerForThisQuestion = userAnswers[questionIndex];
      const isActuallyCorrect =
        preguntas[questionIndex].correcta === opcionIndex; // Verifica contra el array completo

      if (isActuallyCorrect) {
        stateClasses =
          "bg-green-100 border-green-400 text-green-800 font-medium"; // Correcta (siempre verde)
      } else if (
        userAnswerForThisQuestion === opcionIndex &&
        !isActuallyCorrect
      ) {
        stateClasses = "bg-red-100 border-red-400 text-red-800"; // Incorrecta seleccionada (rojo)
      } else {
        stateClasses = "bg-gray-50 border-gray-200 text-gray-500 line-through"; // No seleccionada e incorrecta (gris/tachado)
      }
    } else if (isSelected) {
      stateClasses = "bg-indigo-100 border-indigo-400 font-medium"; // Seleccionada antes de enviar
    }

    return `${baseClasses} ${hoverClass} ${stateClasses}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-4 sm:p-6">
        <div className="question-item mb-6 p-4 border-l-4 border-indigo-300">
          {/* Encabezado de la Pregunta */}
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-base sm:text-lg font-medium text-gray-800">
              Pregunta {questionIndex + 1}
            </h3>
            {/* Podrías añadir categoría aquí si existiera */}
          </div>

          {/* Texto de la Pregunta */}
          <p className="text-gray-700 mb-6 text-base sm:text-lg">
            {pregunta.pregunta}
          </p>

          {/* Opciones */}
          <div className="space-y-3">
            {pregunta.opciones.map((opcion, opcionIndex) => (
              <div
                key={opcionIndex}
                className={getOptionClassName(opcionIndex)}
                onClick={() =>
                  !isSubmitted && onAnswerSelect(questionIndex, opcionIndex)
                }
              >
                <div className="w-6 h-6 rounded-full border border-current mr-3 flex items-center justify-center text-sm font-medium flex-shrink-0">
                  <span>{letras[opcionIndex]}</span>
                </div>
                <span className="flex-grow">{opcion}</span>
                {/* Iconos de Feedback */}
                {isSubmitted && (
                  <>
                    {preguntas[questionIndex].correcta === opcionIndex && (
                      <i className="fas fa-check text-green-600 ml-3 flex-shrink-0"></i>
                    )}
                    {userAnswers[questionIndex] === opcionIndex &&
                      preguntas[questionIndex].correcta !== opcionIndex && (
                        <i className="fas fa-times text-red-600 ml-3 flex-shrink-0"></i>
                      )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Navegación y Finalizar */}
        <div className="border-t border-gray-200 pt-6 flex justify-between items-center">
          <button
            onClick={onPrevious}
            disabled={questionIndex === 0 || isSubmitted}
            className={`px-3 sm:px-4 py-2 rounded-lg font-medium flex items-center text-xs sm:text-sm ${
              questionIndex === 0 || isSubmitted
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <i className="fas fa-arrow-left mr-1 sm:mr-2"></i> Anterior
          </button>

          {/* Indicador de Pregunta Actual */}
          <span className="text-xs sm:text-sm text-gray-500 hidden sm:inline">
            Pregunta {questionIndex + 1} / {totalQuestions}
          </span>

          {questionIndex === totalQuestions - 1 ? (
            // Botón Finalizar en la última pregunta (solo si no se ha enviado)
            !isSubmitted && (
              <button
                onClick={onFinalize}
                className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg font-medium hover:bg-green-700 flex items-center text-xs sm:text-sm"
                // Opcional: Deshabilitar si no todas están respondidas
                // disabled={Object.keys(userAnswers).length !== totalQuestions}
              >
                Finalizar <i className="fas fa-check ml-1 sm:ml-2"></i>
              </button>
            )
          ) : (
            // Botón Siguiente
            <button
              onClick={onNext}
              disabled={isSubmitted}
              className={`bg-indigo-600 text-white px-3 sm:px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 flex items-center text-xs sm:text-sm ${
                isSubmitted ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Siguiente <i className="fas fa-arrow-right ml-1 sm:ml-2"></i>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
