import { useState, useEffect, useCallback } from "react";
import { QuestionSelector } from "./QuestionSelector";
import { SeccionExamen } from "./SeccionExamen";
// import { ResultsDisplay } from "./ResultsDisplay"; // Creamos un componente para resultados
import { ExamTimer } from "./ExamTimer";
import { useParams } from "react-router";
import { UserAuth } from "../context/AuthContext";
import { supabase } from "../supabase.config";
import { useNavigate } from "react-router";
import Swal from "sweetalert2";
import { PreviewableSeccionExamen } from "./PreviewableSeccionExamen";
// --- Interfaces y Datos (igual que antes) ---

interface Pregunta {
  id: number;
  pregunta: string;
  opciones: string[];
  correcta: number;
  respuesta?: number;
  feedback?: string;
}

// --- Componente Padre ---
export function ExamenPage() {
  const navigate = useNavigate();
  const { user } = UserAuth();
  const { examId } = useParams<{ examId: string }>(); // Obtener el :examId
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: number }>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null); // 3 horas
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timerIntervalId, setTimerIntervalId] = useState<NodeJS.Timeout | null>(
    null,
  );
  const [, setLoadError] = useState<string | null>(null);
  const [examenData, setExamenData] = useState<ExamenData | null>(null); // Guarda todos los datos del examen
  const [preguntas, setPreguntas] = useState<Pregunta[]>([
    { id: 1, pregunta: "Hola", opciones: ["2"], correcta: 2 },
  ]); // Específico para las preguntas
  const [, setIsLoadingData] = useState<boolean>(true);
  const [tiempoTomadoSegundos, setTiempoTomadoSegundos] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pinnedQuestions, setPinnedQuestions] = useState<{
    [key: number]: boolean;
  }>({});

  // Detectar cambios en la conexión
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  interface ExamenData {
    id: string; // UUID
    user_id: string; // UUID
    titulo: string;
    dificultad: string;
    estado: "pendiente" | "en_progreso" | "terminado" | "suspendido"; // Usa los tipos de estado correctos
    numero_preguntas: number;
    datos: Pregunta[]; // Asume que la columna 'datos' JSONB contiene un array de Pregunta
    fecha_inicio: string | null;
    tiempo_limite_segundos: number;
  }

  // Función para cargar el estado guardado de localStorage
  const cargarEstadoGuardado = useCallback(() => {
    if (!examId) return null;

    try {
      const estadoGuardado = localStorage.getItem(`examen_estado_${examId}`);
      if (!estadoGuardado) return null;

      const parsedState = JSON.parse(estadoGuardado);
      console.log("Estado cargado de localStorage:", parsedState);

      // Validate the structure of the saved state
      if (typeof parsedState !== "object" || parsedState === null) {
        console.error("Estado guardado inválido");
        return null;
      }

      return parsedState;
    } catch (error) {
      console.error("Error al cargar estado guardado:", error);
      return null;
    }
  }, [examId]);

  // Función para guardar el estado actual en localStorage
  const guardarEstadoActual = useCallback(() => {
    if (!examId) return;

    try {
      const estadoActual = {
        tiempoTomadoSegundos,
        userAnswers,
        examenData,
        preguntas,
        currentQuestionIndex,
        ultimaActualizacion: new Date().toISOString(),
      };
      localStorage.setItem(
        `examen_estado_${examId}`,
        JSON.stringify(estadoActual),
      );
      console.log("guardando", localStorage.getItem(`examen_estado_${examId}`));
    } catch (error) {
      console.error("Error al guardar estado:", error);
    }
  }, [
    examId,
    tiempoTomadoSegundos,
    userAnswers,
    preguntas,
    examenData,
    currentQuestionIndex,
  ]);

  useEffect(() => {
    const fetchExamenData = async () => {
      console.log(`Intentando cargar datos para examen ID: ${examId}`);
      setIsLoadingData(true);
      setLoadError(null);
      setExamenData(null);

      if (!examId) {
        setLoadError("ID de examen no encontrado en la URL.");
        setIsLoadingData(false);
        return;
      }
      if (!user) {
        setLoadError("Usuario no autenticado. No se puede cargar el examen.");
        setIsLoadingData(false);
        // Podrías redirigir a login si no está autenticado
        // navigate('/login');
        return;
      }

      try {
        // Primero intentamos cargar datos guardados localmente
        const estadoGuardado = cargarEstadoGuardado();
        if (estadoGuardado) {
          setExamenData(estadoGuardado.examenData);
          setPreguntas(estadoGuardado.preguntas);
          setTiempoTomadoSegundos(estadoGuardado.tiempoTomadoSegundos);
          setUserAnswers(estadoGuardado.userAnswers);
          setCurrentQuestionIndex(estadoGuardado.currentQuestionIndex);
          const tiempoLimite = estadoGuardado.examenData.tiempo_limite_segundos;
          const tiempoTomado = estadoGuardado.tiempoTomadoSegundos || 0;
          const tiempoRestante = Math.max(0, tiempoLimite - tiempoTomado);
          setTimeLeft(tiempoRestante);
        }

        console.log("Estado guardado:", estadoGuardado);
        console.log("Respuestas guardadas:", userAnswers);
        console.log("Tiempo guardado:", tiempoTomadoSegundos);

        // Consulta a Supabase DIRECTA (requiere RLS configurado)
        console.log(
          `Consultando Supabase para examen ${examId} y usuario ${user.id}`,
        );
        const { data, error } = await supabase
          .from("examenes")
          .select("*") // Selecciona todas las columnas
          .eq("id", examId)
          .eq("user_id", user.id) // <-- RLS VIRTUAL: Asegura que solo el dueño lo vea
          .single(); // Esperamos encontrar exactamente uno

        if (error) {
          console.error("Error de Supabase al obtener examen:", error);
          // Podría ser error 404 si no existe, o 401/403 si RLS falla
          if (error.code === "PGRST116") {
            // Código común para 'no rows found' con .single()
            throw new Error(
              "Examen no encontrado o no tienes permiso para acceder.",
            );
          }
          throw new Error(`Error al cargar datos: ${error.message}`);
        }

        if (!data) {
          throw new Error("Examen no encontrado.");
        }

        // Validación básica de los datos recibidos
        if (
          !data.datos ||
          !Array.isArray(data.datos) ||
          data.datos.length === 0
        ) {
          throw new Error(
            "Los datos del examen recuperados no contienen preguntas válidas.",
          );
        }

        console.log("Datos del examen cargados:", data);
        setExamenData(data || (estadoGuardado?.examenData as ExamenData)); // Guarda todos los datos
        console.log("Datos", examenData);
        setPreguntas(data.datos || (estadoGuardado?.preguntas as Pregunta[])); // Guarda específicamente las preguntas
        // Calcular tiempo restante
        const tiempoLimite =
          data.tiempo_limite_segundos ||
          estadoGuardado?.examenData.tiempo_limite_segundos;
        console.log("Tiempo límite:", tiempoLimite);
        const tiempoTomado = estadoGuardado?.tiempoTomadoSegundos || 0;
        const tiempoRestante = Math.max(0, tiempoLimite - tiempoTomado);
        setTimeLeft(tiempoRestante);

        // Opcional: Ajustar el tiempo si lo guardaste
        // if (data.tiempo_total_segundos) setTimeLeft(data.tiempo_total_segundos);

        // Opcional: Marcar el examen como 'en_progreso' si estaba 'pendiente'
        if (data.estado === "pendiente") {
          console.log("Marcando examen como 'en_progreso'...");
          await supabase
            .from("examenes")
            .update({
              estado: "en_progreso",
              fecha_inicio: new Date().toISOString(),
            }) // Actualiza estado y fecha inicio real
            .eq("id", examId)
            .eq("user_id", user.id); // Seguridad
        }
      } catch (error) {
        console.error("Error al cargar/procesar examen:", error);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchExamenData();

    // Limpieza: No necesitamos limpiar nada específico aquí a menos que
    // iniciemos suscripciones de Supabase Realtime.
  }, [examId, user, navigate, cargarEstadoGuardado]);
  // --- Lógica del Timer (stopTimer, startTimer, formatTime) ---

  const stopTimer = useCallback(() => {
    if (timerIntervalId) {
      clearInterval(timerIntervalId);
      setTimerIntervalId(null);
    }
  }, [timerIntervalId]);

  // Guardado automático cada 5 segundos
  useEffect(() => {
    if (isSubmitted) return;

    const autoSaveInterval = setInterval(() => {
      guardarEstadoActual();
    }, 5000); // Guardar cada 5 segundos

    return () => clearInterval(autoSaveInterval);
  }, [guardarEstadoActual, isSubmitted]);

  // Actualizar handleFinalizar para limpiar localStorage y guardar tiempo tomado
  const handleFinalizar = useCallback(async () => {
    const confirmar = await Swal.fire({
      title: "Seguro?",
      text: "Una vez terminado, no podrás volver atrás!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Siii!",
    }).then((result) => {
      return result.isConfirmed;
    });

    if (!confirmar) return;
    if (isSubmitted) return; // Evitar múltiples envíos

    setIsSubmitted(true);
    stopTimer();

    // Limpiar localStorage
    if (examId) {
      localStorage.removeItem(`examen_estado_${examId}`);
    }

    // Guardar en Supabase el tiempo tomado y las respuestas
    try {
      await supabase
        .from("examenes")
        .update({
          estado: "terminado",
          tiempo_tomado_segundos: tiempoTomadoSegundos,
          respuestas_usuario: userAnswers, // Asumiendo que tienes esta columna
        })
        .eq("id", examId)
        .eq("user_id", user?.id);
    } catch (error) {
      console.error("Error al actualizar el estado del examen:", error);
    }

    navigate(`/examen/${examId}`);
    console.log(
      "Examen finalizado. Tiempo tomado:",
      tiempoTomadoSegundos,
      "Respuestas:",
      userAnswers,
    );
  }, [
    examId,
    tiempoTomadoSegundos,
    userAnswers,
    stopTimer,
    isSubmitted,
    navigate,
    user?.id,
  ]);

  // En caso de que el usuario cierre la pestaña/navegador, guardar estado antes de salir
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!isSubmitted) {
        guardarEstadoActual();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [guardarEstadoActual, isSubmitted]);

  // Modificación del timer para incrementar tiempoTomadoSegundos
  const startTimer = useCallback(() => {
    if (timerIntervalId) clearInterval(timerIntervalId);

    const intervalId = setInterval(() => {
      setTiempoTomadoSegundos((prev) => {
        const nuevoTiempo = prev + 1;
        return nuevoTiempo;
      });

      setTimeLeft((prev) => {
        if (!prev || prev <= 1) {
          clearInterval(intervalId);
          if (!isSubmitted) {
            handleFinalizar();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    setTimerIntervalId(intervalId);
  }, [timerIntervalId, handleFinalizar, isSubmitted]);

  // Iniciar/Detener Timer useEffects
  useEffect(() => {
    if (!isSubmitted) {
      startTimer();
    } else {
      stopTimer();
    }
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
  const handlePinQuestion = useCallback((questionIndex: number) => {
    setPinnedQuestions((prevPinned) => {
      const newPinned = { ...prevPinned };
      if (newPinned[questionIndex]) {
        // Si ya está fijada, la quitamos
        delete newPinned[questionIndex];
      } else {
        // Si no está fijada, la añadimos
        newPinned[questionIndex] = true;
      }
      return newPinned;
    });
  }, []);

  const handleQuestionSelect = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const handleScrollToPreview = useCallback((questionIndex: number) => {
    const previewElement = document.getElementById(
      `preview-question-${questionIndex}`,
    );

    if (previewElement) {
      previewElement.scrollIntoView({ behavior: "smooth", block: "center" });

      // Añadir clase para iniciar la animación
      previewElement.classList.add("outline-pulse-repeated");

      // Quitar la clase después de que termine la animación completa (5 repeticiones)
      setTimeout(() => {
        previewElement.classList.remove("outline-pulse-repeated");
      }, 2500); // 500ms por pulsación × 5 repeticiones = 2500ms
    }
  }, []);

  // 2. Añade esta función para hacer scroll hacia arriba y establecer la pregunta actual
  const handleScrollToQuestion = useCallback((questionIndex: number) => {
    setCurrentQuestionIndex(questionIndex);

    // Scroll hacia la parte superior donde está el visor de preguntas
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  const handleAnswerSelect = useCallback(
    (questionIndex: number, optionIndex: number) => {
      if (!isSubmitted) {
        setUserAnswers((prevAnswers) => ({
          ...prevAnswers,
          [questionIndex]: optionIndex,
        }));
      }
    },
    [isSubmitted],
  );

  const handleNavigatePrevious = useCallback(() => {
    setCurrentQuestionIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const handleNavigateNext = useCallback(() => {
    setCurrentQuestionIndex((prev) => Math.min(preguntas.length - 1, prev + 1));
  }, [preguntas]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Optional: Prevent navigation if user is typing in an input/textarea
      console.log(event);
      const activeElement = document.activeElement;
      if (
        activeElement &&
        (activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA")
      ) {
        return;
      }

      // Check if the exam is loaded and not submitted before handling keys
      if (!preguntas || preguntas.length === 0) {
        return;
      }
      console.log("Key pressed", event);
      if (event.key === "1") {
        event.preventDefault(); // Prevent potential browser scrolling
        handleAnswerSelect(currentQuestionIndex, 0);
      } else if (event.key === "2") {
        event.preventDefault(); // Prevent potential browser scrolling
        handleAnswerSelect(currentQuestionIndex, 1);
      } else if (event.key === "3") {
        event.preventDefault(); // Prevent potential browser scrolling
        handleAnswerSelect(currentQuestionIndex, 2);
      } else if (event.key === "4") {
        event.preventDefault(); // Prevent potential browser scrolling
        handleAnswerSelect(currentQuestionIndex, 3);
      } else if (event.key === "ArrowRight" || event.key === "Enter") {
        event.preventDefault(); // Prevent potential browser scrolling
        console.log("ArrowRight detected, calling handleNavigateNext");
        handleNavigateNext();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault(); // Prevent potential browser scrolling
        console.log("ArrowLeft detected, calling handleNavigatePrevious");
        handleNavigatePrevious();
      }
    };

    console.log("Adding keydown listener for arrows");
    window.addEventListener("keydown", handleKeyDown);

    // Cleanup function: remove the listener when the component unmounts
    return () => {
      console.log("Removing keydown listener for arrows");
      window.removeEventListener("keydown", handleKeyDown);
    };

    // Dependencies: Include the stable navigation handlers and relevant state
  }, [
    handleNavigateNext,
    handleNavigatePrevious,
    handleAnswerSelect,
    isSubmitted,
    preguntas,
    currentQuestionIndex,
  ]);

  // --- Cálculo de Resultados ---
  // const calcularResultados = useCallback(() => {
  //   let correctas = 0;
  //   preguntas.forEach((pregunta, index) => {
  //     if (userAnswers[index] === pregunta.correcta) {
  //       correctas++;
  //     }
  //   });
  //   return {
  //     correctas,
  //     total: preguntas.length,
  //     porcentaje:
  //       preguntas.length > 0
  //         ? Math.round((correctas / preguntas.length) * 100)
  //         : 0,
  //   };
  // }, [preguntas, userAnswers]); // Depende de preguntas y userAnswers

  // const resultados = isSubmitted ? calcularResultados() : null;
  const preguntaActual = preguntas[currentQuestionIndex];

  const today = new Date();
  // --- Renderizado ---
  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div>
          {examenData && (
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
              <div className="p-6">
                <div className="flex flex-row justify-evenly items-start md:items-center">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-1">
                      {examenData.titulo}
                    </h1>
                    <p className="text-gray-600">
                      Empezaste el {today.getFullYear()}/{today.getMonth()}/
                      {today.getDay()} a la hora {today.getHours()}:
                      {today.getMinutes()}
                    </p>
                  </div>
                  <div className="mt-4 md:mt-0 bg-indigo-50 text-indigo-800 px-4 py-2 rounded-lg">
                    <i className="fas fa-info-circle mr-2"></i>
                    <span>
                      {examenData.numero_preguntas} preguntas •{" "}
                      {Math.floor(
                        examenData && examenData.tiempo_limite_segundos / 3600,
                      )}
                      :
                      {Math.floor(
                        (examenData.tiempo_limite_segundos % 3600) / 60,
                      )}
                      :{Math.floor(examenData.tiempo_limite_segundos % 60)} •
                      Dificultad: {examenData.dificultad}
                    </span>
                  </div>
                  <div>
                    <i
                      className={`fas fa-wifi mr-2 p-3 rounded-lg border-2 ${isOnline ? "bg-green-100 border-green-300 text-green-600" : "text-red-500 border-red-300 bg-red-100 animate-pulse"}`}
                    ></i>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Columna Izquierda (Info y Navegador) */}
            <div className="lg:w-1/3 space-y-8 flex-shrink-0">
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

              {/* Claudeee, aqui quiero que filtres questionSelector solo para preguntas fijadas, mira
                <QuestionSelector
                  totalQuestions={preguntas.length}
                  currentQuestionIndex={currentQuestionIndex}
                  answeredQuestions={userAnswers}
                  preguntas={preguntas}
                  onQuestionSelect={handleQuestionSelect}
                  isSubmitted={isSubmitted}
                  title={"Fijados"}
                  pinnedQuestions={pinnedQuestions}
                />
                */}
              {Object.keys(pinnedQuestions).length > 0 && (
                <QuestionSelector
                  totalQuestions={preguntas.length}
                  currentQuestionIndex={currentQuestionIndex}
                  answeredQuestions={userAnswers}
                  preguntas={preguntas}
                  onQuestionSelect={handleQuestionSelect}
                  isSubmitted={isSubmitted}
                  title={"Fijados"}
                  pinnedQuestions={pinnedQuestions}
                  pinnedMode={true}
                />
              )}

              <QuestionSelector
                totalQuestions={preguntas.length}
                currentQuestionIndex={currentQuestionIndex}
                answeredQuestions={userAnswers}
                preguntas={preguntas}
                onQuestionSelect={handleQuestionSelect}
                isSubmitted={isSubmitted}
                title={"Preguntas"}
                pinnedQuestions={pinnedQuestions}
              />
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
                  habilitarBotones={true}
                  mostrarLista={true}
                  mostrarEncabezado={true}
                  onPinToggle={handlePinQuestion}
                  isCurrentQuestionPinned={
                    !!pinnedQuestions[currentQuestionIndex]
                  }
                  onScrollToPreview={handleScrollToPreview}
                />
              ) : (
                <p>Cargando pregunta...</p> // O algún estado de carga/error
              )}
            </div>
          </div>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* Filtramos las preguntas que están en el estado pinnedQuestions */}
            {Array.isArray(preguntas) &&
              preguntas
                .filter((_, index) => pinnedQuestions[index]) // Solo incluye preguntas con índice en pinnedQuestions
                .map((preguntaFijada) => {
                  // Mapeamos sobre las preguntas filtradas
                  // Necesitamos encontrar el índice original de esta pregunta fijada
                  // ya que indexFijada aquí será 0, 1, 2...
                  const originalIndex = preguntas.findIndex(
                    (p) => p.id === preguntaFijada.id,
                  );

                  // Si por alguna razón no se encuentra el índice original (debería encontrarse)
                  if (originalIndex === -1) return null;

                  return (
                    <PreviewableSeccionExamen
                      key={preguntaFijada.id || originalIndex}
                      pregunta={preguntaFijada}
                      index={originalIndex} // Pasamos el índice original
                      totalQuestions={preguntas.length}
                      selectedAnswer={userAnswers[originalIndex]} // Usamos el índice original
                      userAnswers={userAnswers}
                      preguntas={preguntas}
                      isSubmitted={isSubmitted}
                      onPinToggle={handlePinQuestion} // Pasamos la función hacia abajo
                      isThisPinned={true} // Esta pregunta SIEMPRE está fijada en esta sección
                      handleScrollToQuestion={handleScrollToQuestion}
                    />
                  );
                })}
          </div>
          <div className="w-full border-2 text-gray-300 my-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {Array.isArray(preguntas) &&
              preguntas.map((pregunta, index) => (
                // Renderiza el componente contenedor y pasa las props necesarias
                <PreviewableSeccionExamen
                  key={pregunta.id || index} // Usa ID si está disponible
                  pregunta={pregunta}
                  index={index} // Pasa el índice para la lógica de columna
                  totalQuestions={preguntas.length}
                  selectedAnswer={userAnswers[index]}
                  userAnswers={userAnswers}
                  preguntas={preguntas} // Pasa el array completo si SeccionExamen lo necesita
                  isSubmitted={isSubmitted}
                  onPinToggle={handlePinQuestion}
                  isThisPinned={!!pinnedQuestions[index]}
                  handleScrollToQuestion={handleScrollToQuestion}
                  id={`preview-question-${index}`} // ID para poder hacer scroll hacia él
                />
              ))}
          </div>
        </div>
      </main>
    </div>
  );
}
