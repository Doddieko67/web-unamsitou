import Swal from "sweetalert2";
import "katex/dist/katex.min.css";

interface Pregunta {
  id?: number;
  pregunta: string;
  opciones?: string[];
  correcta?: number;
  respuesta?: number;
  feedback?: string;
}

interface SeccionExamenProps {
  feedback?: string;
  pregunta: Pregunta;
  questionIndex: number;
  totalQuestions: number;
  selectedAnswer: number | undefined;
  onAnswerSelect: (questionIndex: number, optionIndex: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  onFinalize: () => void;
  isSubmitted: boolean;
  userAnswers: { [key: number]: number };
  preguntas: Pregunta[];
  habilitarBotones: boolean; // Clave para el colapso
  mostrarLista: boolean;
  mostrarEncabezado: boolean;
  onPinToggle: (questionIndex: number) => void;
  isCurrentQuestionPinned: boolean;
  mostrarBandera?: boolean;
  handleScrollToQuestion?: (questionIndex: number) => void;
  onScrollToPreview?: ((questionIndex: number) => void) | null;
  id?: string;
}

export function SeccionExamen({
  feedback = undefined,
  pregunta,
  questionIndex,
  totalQuestions,
  selectedAnswer,
  onAnswerSelect,
  onPrevious,
  onNext,
  onFinalize,
  isSubmitted,
  userAnswers,
  preguntas,
  habilitarBotones, // Usaremos este prop directamente
  mostrarLista = true,
  mostrarEncabezado = true,
  onPinToggle,
  isCurrentQuestionPinned,
  mostrarBandera = true,
  handleScrollToQuestion = () => {},
  onScrollToPreview = null,
  id = "",
}: SeccionExamenProps) {
  const letras = ["A", "B", "C", "D", "E", "F"];

  // --- Clases para las Opciones ---
  const getOptionClassName = (opcionIndex: number): string => {
    const baseClasses =
      "p-3 border rounded-lg flex items-center text-sm sm:text-base transition-all duration-200 hover:-translate-x-1"; // Quitado transition-all y efectos hover complejos
    let stateClasses = "border-gray-200";
    let interactionClasses = ""; // Clases de hover/cursor

    const isSelected = selectedAnswer === opcionIndex;

    if (pregunta.id === undefined) {
      habilitarBotones = false;
      mostrarLista = false;
    }

    if (isSubmitted) {
      // Lógica post-envío (sin cambios)
      const userAnswerForThisQuestion = userAnswers[questionIndex];
      const isActuallyCorrect =
        preguntas[questionIndex].correcta === opcionIndex;
      if (isActuallyCorrect) {
        stateClasses =
          "bg-green-100 border-green-400 text-green-800 font-medium";
      } else if (
        userAnswerForThisQuestion === opcionIndex &&
        !isActuallyCorrect
      ) {
        stateClasses = "bg-red-100 border-red-400 text-red-800";
      } else {
        stateClasses = "bg-gray-50 border-gray-200 text-gray-500 line-through";
      }
      // No hay interacción hover/click después de enviar
    } else if (habilitarBotones) {
      // Lógica ANTES de enviar (SI botones habilitados)
      interactionClasses =
        "hover:bg-indigo-50 hover:border-indigo-300 cursor-pointer"; // Permite hover y cursor
      if (isSelected) {
        stateClasses = "bg-indigo-50 border-indigo-300 font-medium";
      } else {
        stateClasses += "bg-white border-gray-300"; // Estilo normal seleccionable
      }
    } else {
      // Lógica ANTES de enviar (SI botones DEShabilitados - modo solo lectura)
      stateClasses = "bg-gray-50 border-gray-200 text-gray-600"; // Estilo neutro, no interactivo
      if (isSelected) {
        stateClasses = "bg-indigo-50 border-indigo-300 font-medium";
      } else {
        stateClasses += "bg-white border-gray-300"; // Estilo normal seleccionable
      }
      // No hay interactionClasses
    }

    return `${baseClasses} ${stateClasses} ${interactionClasses}`;
  };

  const getResponseClassName = () => {
    let buttonClasses = `bg-gray-100 text-gray-400 cursor-pointer hover:bg-gray-200`;
    const isAnswered = userAnswers[questionIndex] !== undefined;
    if (isCurrentQuestionPinned)
      buttonClasses =
        " bg-pink-100 text-pink-600 cursor-pointer hover:bg-pink-200";
    if (isAnswered)
      buttonClasses =
        " bg-indigo-100 text-indigo-600 cursor-pointer hover:bg-indigo-50";
    if (!isSubmitted) return buttonClasses;
    let isCorrect = false; // Default to false
    if (isSubmitted && isAnswered) {
      const correctAnswer = pregunta?.correcta; // Get correct answer index safely
      isCorrect = selectedAnswer === correctAnswer;
    }

    if (pregunta.id === undefined) {
      buttonClasses =
        " bg-purple-100 text-purple-600 cursor-pointer hover:bg-purple-200";
    } else if (isSubmitted) {
      // Estilo después de enviar (simplificado, podrías añadir correcto/incorrecto si pasas más datos)
      buttonClasses = isAnswered
        ? isCorrect
          ? " bg-green-100 text-green-600 cursor-pointer hover:bg-green-200"
          : " bg-red-100 text-red-600 cursor-pointer hover:bg-red-200"
        : isCurrentQuestionPinned
          ? " bg-pink-100 text-pink-600 cursor-pointer hover:bg-pink-200"
          : " bg-gray-100 text-gray-400 cursor-pointer hover:bg-gray-200";
    }

    return buttonClasses;
  };
  // Determina si se puede hacer clic en una opción
  const canSelectOption = habilitarBotones && !isSubmitted;

  return (
    // Contenedor principal de la tarjeta
    <div
      className={`bg-white rounded-xl shadow-md overflow-hidden transition-all `}
    >
      {mostrarBandera && (
        <div className="flex justify-end">
          <button
            className={`border-2 absolute p-2 mr-2 mt-2 cursor-pointer hover:opacity-90 transition-all ease-out delay-100 rounded-md opacity-50 text-xs ${isCurrentQuestionPinned ? "text-pink-600 bg-pink-200 border-pink-500" : "text-gray-600 bg-gray-200 border-gray-500"}`}
            onClick={() => onPinToggle(questionIndex)}
          >
            <i className="fa-solid fa-font-awesome fa-2xl"></i>
          </button>
        </div>
      )}
      {mostrarEncabezado && (
        <div
          className={`p-4 sm:p-6 border-l-4 border-indigo-300 transition-all delay-100 ${getResponseClassName()} h-full`}
          id={id}
          onClick={() =>
            onScrollToPreview === null
              ? handleScrollToQuestion(questionIndex)
              : onScrollToPreview(questionIndex)
          }
        >
          <div className="flex justify-between items-center">
            {" "}
            {/* items-center para alinear icono */}
            {/* Info Pregunta */}
            <div className="flex-grow mr-4">
              {pregunta.id !== undefined && (
                <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-1">
                  {pregunta.id}
                  <span className="text-xs sm:text-sm text-gray-500 sm:inline">
                    {" "}
                    {/* Espacio */} / {preguntas[preguntas.length - 1].id}
                  </span>
                </h3>
              )}
              <p
                className={`text-gray-700 text-base sm:text-lg ${mostrarLista === false && "line-clamp-3"}`}
              >
                {pregunta.pregunta}
              </p>
            </div>
          </div>
        </div>
      )}
      {/* ----- CUERPO COLAPSABLE (Contiene Opciones y Feedback) ----- */}
      {mostrarLista && (
        <div>
          {/* Contenedor Interno para medir altura con Ref */}
          <div className="px-4 sm:px-6 pb-4 sm:pb-6">
            {" "}
            {/* Ajustado padding (pt-2 para separar un poco del header) */}
            {/* ---- Sección de Opciones y Botones Laterales ---- */}
            <div className="flex flex-row space-x-4 my-4">
              {/* Botón Anterior (Condicional) */}
              {habilitarBotones && (
                <button
                  onClick={onPrevious}
                  disabled={questionIndex === 0}
                  className={`px-3 sm:px-4 py-2 rounded-lg w-14 hover:scale-105 hover:w-16 hover:translate-x-1 transition-all duration-200 font-medium block text-xs sm:text-sm ${
                    questionIndex === 0
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <i className="fas fa-arrow-left"></i>
                </button>
              )}

              {/* Contenedor de Opciones */}
              {/* Usamos w-full siempre, pero si no hay botones, el layout se ajusta */}
              <div className="space-y-3 w-full">
                {pregunta.opciones?.map((opcion, opcionIndex) => (
                  <div
                    key={opcion}
                    className={`${getOptionClassName(opcionIndex)}`}
                    onClick={() =>
                      canSelectOption &&
                      onAnswerSelect(questionIndex, opcionIndex)
                    } // Solo permite seleccionar si canSelectOption es true
                  >
                    <div className="w-6 h-6 rounded-full border border-current mr-3 flex items-center justify-center text-sm font-medium flex-shrink-0">
                      <span>{letras[opcionIndex]}</span>
                    </div>
                    <span className="flex-grow">{opcion}</span>
                    {/* Iconos de Feedback Correcto/Incorrecto (Post-Submit) */}
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

              {/* Botón Siguiente/Finalizar (Condicional) */}
              {habilitarBotones && (
                <>
                  {questionIndex === totalQuestions - 1 ? (
                    !isSubmitted ? (
                      <button
                        onClick={async () => {
                          const confirmar = await Swal.fire({
                            title: "¿Estás seguro?",
                            text: "Una vez terminado, no podrás cambiar tus respuestas.",
                            icon: "warning",
                            showCancelButton: true,
                            confirmButtonColor: "#3085d6",
                            cancelButtonColor: "#d33",
                            confirmButtonText: "Sí, terminar examen",
                            cancelButtonText: "Cancelar",
                          }).then((result) => {
                            return result.isConfirmed;
                          });

                          if (!confirmar) return; // Si el usuario cancela, salir
                          onFinalize();
                        }}
                        className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg font-medium hover:bg-green-700 flex items-center text-xs sm:text-sm hover:scale-105 hover:-translate-x-1 transition-all duration-200"
                      >
                        Finalizar <i className="fas fa-check ml-1 sm:ml-2"></i>
                      </button>
                    ) : (
                      // Si es la última y ya se envió, podemos mostrar un botón deshabilitado o nada
                      // Mostremos uno deshabilitado para consistencia de layout
                      <button
                        className={`block text-gray-400 bg-gray-100 px-3 sm:px-4 py-2 rounded-lg font-medium w-14 transition-all duration-200 text-xs sm:text-sm cursor-not-allowed`}
                        disabled={true}
                      >
                        <i className="fas fa-arrow-right"></i>
                      </button>
                    )
                  ) : (
                    <button
                      onClick={onNext}
                      className={`block bg-indigo-600 text-white px-3 sm:px-4 py-2 rounded-lg font-medium hover:bg-indigo-400 w-14 hover:scale-105 hover:w-16 hover:-translate-x-1 transition-all duration-200 text-xs sm:text-sm `}
                    >
                      <i className="fas fa-arrow-right"></i>
                    </button>
                  )}
                </>
              )}
            </div>{" "}
            {/* Fin de flex-row (opciones y botones laterales) */}
            {/* ---- Sección de Feedback (si isSubmitted) ---- */}
            {isSubmitted &&
              feedback !== undefined &&
              feedback !== "undefined" && (
                <div className="overflow-hidden rounded-lg bg-yellow-100 text-yellow-800 shadow-lg text-start">
                  {/* Contenido colapsable con max-height animado */}
                  <div className="ml-2 overflow-hidden">
                    {/* Contenedor del contenido real para padding y ref */}
                    <div className="p-2">
                      {" "}
                      {/* El ref va aquí */}
                      <p className={`${!mostrarEncabezado && "text-[0.55em]"}`}>
                        {feedback}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            {/* Fin de isSubmitted */}
          </div>
          {/* Fin del div con ref={bodyContentRef} */}
        </div>
      )}
      {/* Fin del div colapsable principal */}
    </div> // Fin del contenedor principal de la tarjeta
  );
}
