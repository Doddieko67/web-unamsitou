import React, { useState, useEffect, useCallback } from "react";
import { HeaderExam } from "./HeaderExam"; // Asume que existe este componente
import { QuestionSelector } from "./QuestionSelector";
import { SeccionExamen } from "./SeccionExamen";
import { ResultsDisplay } from "./ResultsDisplay"; // Creamos un componente para resultados
import { ExamTimer } from "./ExamTimer";
// --- Interfaces y Datos (igual que antes) ---
interface Opcion {
  texto: string;
}
interface Pregunta {
  id: number;
  pregunta: string;
  opciones: Opcion[];
  correcta: number;
}
const preguntas: Pregunta[] = [
  // ... tu array de preguntas completo
  {
    id: 1,
    pregunta:
      "¿Cuál es el resultado de la siguiente operación: (2 + 3) × 4 - 6 ÷ 2?",
    opciones: [
      { texto: "13" },
      { texto: "17" },
      { texto: "20" },
      { texto: "24" },
    ],
    correcta: 1,
  },
  {
    id: 2,
    pregunta: "¿Qué famoso físico formuló la teoría de la relatividad?",
    opciones: [
      { texto: "Isaac Newton" },
      { texto: "Albert Einstein" },
      { texto: "Stephen Hawking" },
      { texto: "Galileo Galilei" },
    ],
    correcta: 1,
  },
  // ... resto de preguntas
  {
    id: 10,
    pregunta: "¿Qué país es famoso por el Coliseo Romano?",
    opciones: [
      { texto: "Grecia" },
      { texto: "Egipto" },
      { texto: "España" },
      { texto: "Italia" },
    ],
    correcta: 3,
  },
];
const TIEMPO_TOTAL_SEGUNDOS = 3 * 60 * 60; // 3 horas

// --- Componente Padre ---
export function ExamenPage() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: number }>({});
  const [timeLeft, setTimeLeft] = useState(TIEMPO_TOTAL_SEGUNDOS);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timerIntervalId, setTimerIntervalId] = useState<NodeJS.Timeout | null>(
    null,
  );

  // --- Lógica del Timer (stopTimer, startTimer, formatTime) ---
  const stopTimer = useCallback(() => {
    if (timerIntervalId) {
      clearInterval(timerIntervalId);
      setTimerIntervalId(null);
    }
  }, [timerIntervalId]);

  const handleFinalizar = useCallback(() => {
    if (isSubmitted) return; // Evitar múltiples envíos
    setIsSubmitted(true);
    stopTimer();
    console.log("Examen finalizado desde ExamPage. Respuestas:", userAnswers);
  }, [userAnswers, stopTimer, isSubmitted]); // Añadir isSubmitted a dependencias

  const startTimer = useCallback(() => {
    if (timerIntervalId) clearInterval(timerIntervalId);

    const intervalId = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(intervalId);
          // Solo finalizar si no se ha enviado ya (evita doble llamada si se hace click justo al acabar)
          if (!isSubmitted) {
            handleFinalizar();
          }
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    setTimerIntervalId(intervalId);
  }, [timerIntervalId, handleFinalizar, isSubmitted]); // Añadir isSubmitted y handleFinalizar

  // Iniciar/Detener Timer useEffects
  useEffect(() => {
    if (!isSubmitted) {
      startTimer();
    } else {
      stopTimer();
    }
    // Limpieza al desmontar o si isSubmitted cambia
    return () => stopTimer();
  }, [isSubmitted, startTimer, stopTimer]);

  const formatTime = (totalSeconds: number): string => {
    // ... (misma función formatTime de antes)
    if (totalSeconds < 0) totalSeconds = 0;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // --- Navegación y Selección ---
  const handleQuestionSelect = (index: number) => {
    if (!isSubmitted) {
      setCurrentQuestionIndex(index);
    }
  };

  const handleAnswerSelect = (questionIndex: number, optionIndex: number) => {
    if (!isSubmitted) {
      setUserAnswers((prevAnswers) => ({
        ...prevAnswers,
        [questionIndex]: optionIndex,
      }));
    }
  };

  const handleNavigatePrevious = () => {
    if (!isSubmitted) {
      setCurrentQuestionIndex((prev) => Math.max(0, prev - 1));
    }
  };

  const handleNavigateNext = () => {
    if (!isSubmitted) {
      setCurrentQuestionIndex((prev) =>
        Math.min(preguntas.length - 1, prev + 1),
      );
    }
  };

  // --- Cálculo de Resultados ---
  const calcularResultados = useCallback(() => {
    let correctas = 0;
    preguntas.forEach((pregunta, index) => {
      if (userAnswers[index] === pregunta.correcta) {
        correctas++;
      }
    });
    return {
      correctas,
      total: preguntas.length,
      porcentaje:
        preguntas.length > 0
          ? Math.round((correctas / preguntas.length) * 100)
          : 0,
    };
  }, [preguntas, userAnswers]); // Depende de preguntas y userAnswers

  const resultados = isSubmitted ? calcularResultados() : null;
  const preguntaActual = preguntas[currentQuestionIndex];

  // --- Renderizado ---
  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div>
          {isSubmitted && resultados ? (
            <ResultsDisplay
              resultados={resultados}
              timeLeftFormatted={formatTime(timeLeft)}
            />
          ) : (
            // Layout de dos columnas para el examen activo
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Columna Izquierda (Info y Navegador) */}
              <div className="lg:w-1/3 space-y-8 flex-shrink-0">
                <HeaderExam />
                {/* Tarjeta de Controles: Timer y Envío */}
                <div className="bg-white rounded-xl shadow-md p-5 space-y-1">
                  <ExamTimer
                    timeLeft={timeLeft}
                    formatTime={formatTime}
                    isSubmitted={isSubmitted}
                  />

                  {/* Área de Acción: Botón de Enviar o Estado Enviado */}
                  <div className="pt-4">
                    {!isSubmitted ? (
                      <button
                        onClick={handleFinalizar}
                        className="w-full gradient-bg text-white px-4 py-3 rounded-lg font-semibold text-sm sm:text-base hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out shadow-lg hover:shadow-xl flex items-center justify-center"
                        title="Finalizar y Enviar Examen"
                        disabled={timeLeft <= 0} // Deshabilitar si el tiempo se agotó antes de enviar
                      >
                        <i className="fas fa-paper-plane mr-2"></i>
                        <span>Enviar Examen Ahora</span>
                      </button>
                    ) : (
                      <div className="w-full bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg font-semibold text-sm sm:text-base text-center flex items-center justify-center shadow-inner">
                        <i className="fas fa-check-circle mr-2"></i>
                        <span>Examen Enviado Correctamente</span>
                      </div>
                    )}
                  </div>
                  <div className="pt-4">
                    {!isSubmitted && (
                      <button
                        onClick={handleFinalizar}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 rounded-lg font-semibold text-sm sm:text-base hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out shadow-lg hover:shadow-xl flex items-center justify-center"
                        title="Finalizar y Enviar Examen"
                        disabled={timeLeft <= 0} // Deshabilitar si el tiempo se agotó antes de enviar
                      >
                        <i className="fas fa-calendar-xmark mr-2"></i>
                        <span>Suspender el Examen</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Columna Derecha (Pregunta Actual) */}
              <div className="lg:w-2/3 lg:flex-grow">
                {preguntaActual ? (
                  <SeccionExamen
                    pregunta={preguntaActual}
                    questionIndex={currentQuestionIndex}
                    totalQuestions={preguntas.length}
                    selectedAnswer={userAnswers[currentQuestionIndex]}
                    onAnswerSelect={handleAnswerSelect}
                    onPrevious={handleNavigatePrevious}
                    onNext={handleNavigateNext}
                    onFinalize={handleFinalizar} // Pasamos la función para finalizar
                    isSubmitted={isSubmitted}
                    userAnswers={userAnswers} // Necesario para feedback
                    preguntas={preguntas} // Necesario para feedback
                  />
                ) : (
                  <p>Cargando pregunta...</p> // O algún estado de carga/error
                )}
              </div>
            </div>
          )}
          <div className="mt-4">
            <QuestionSelector
              totalQuestions={preguntas.length}
              currentQuestionIndex={currentQuestionIndex}
              answeredQuestions={userAnswers}
              onQuestionSelect={handleQuestionSelect}
              isSubmitted={isSubmitted}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
