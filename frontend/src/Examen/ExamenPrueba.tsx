import { useState, useEffect, useCallback } from "react";
import { QuestionSelector } from "./QuestionSelector";
import { SeccionExamen } from "./SeccionExamen";
import { ExamTimer } from "./ExamTimer";
import { useParams } from "react-router";
import { UserAuth } from "../context/AuthContext";
import { supabase } from "../supabase.config";
import { useNavigate } from "react-router";
import Swal from "sweetalert2";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
// --- Interfaces y Datos (igual que antes) ---

interface Pregunta {
  id: number;
  pregunta: string;
  opciones: string[];
  correcta: number;
}

interface ExamenData {
  id: string; // UUID
  user_id: string; // UUID
  titulo: string;
  dificultad: string;
  estado: "pendiente" | "en_progreso" | "terminado" | "suspendido"; // Usa los tipos de estado correctos
  numero_preguntas: number;
  datos: Pregunta[]; // Asume que la columna 'datos' JSONB contiene un array de Pregunta
  fecha_inicio: string | null;
}

const TIEMPO_TOTAL_SEGUNDOS = 3 * 60 * 60; // 3 horas

// --- Componente Padre ---
export function ExamenPrueba() {
  // const navigate = useNavigate();
  // const { user } = UserAuth();
  // const { examId } = useParams<{ examId: string }>(); // Obtener el :examId
  const [secciones, setSecciones] = useState(2);
  const [currentQuestionIndices, setCurrentQuestionIndices] = useState(
    Array(secciones).fill(0), // Inicializa con 0 para cada sección
  );
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: number }>({});
  const [timeLeft, setTimeLeft] = useState(TIEMPO_TOTAL_SEGUNDOS);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timerIntervalId, setTimerIntervalId] = useState<NodeJS.Timeout | null>(
    null,
  );

  const [, setLoadError] = useState<string | null>(null);
  const [examenData, setExamenData] = useState<ExamenData | null>(null); // Guarda todos los datos del examen
  const [preguntas, setPreguntas] = useState<Pregunta[]>([
    {
      id: 1,
      correcta: 2,
      opciones: ["Si", "Tal vez", "Demasiado", "No se"],
      pregunta: " Damian es muy pero muy naco?",
    },
    {
      //escribe para Damian como una venganzota
      id: 2,
      correcta: 2,
      opciones: ["Si", "si", "si", "si"],
      pregunta: "alagandro todo el dia juega en el celu",
    },
    {
      id: 3,
      correcta: 2,
      opciones: ["si", "si", "si", "si"],
      pregunta: "Damian lloro por unas chips por gorditititito",
    },
    {
      id: 4,
      correcta: 3,
      opciones: ["si", "si", "si", "si"],
      pregunta: "damian es el favorito de la tia rocio",
    },
    {
      id: 5,
      correcta: 2,
      opciones: ["si", "si", "si", "si"],
      pregunta:
        "damian le dijo que alondra es una negra africana que come tierra",
    },
    {
      id: 6,
      correcta: 1,
      opciones: ["si", "si", "si", "si"],
      pregunta: "Damian es un puerquin",
    },
    {
      id: 7,
      correcta: 3,
      opciones: ["si", "si", "si", "si"],
      pregunta: "Damian es un niño naco y es un pedito",
    },
    {
      id: 8,
      correcta: 3,
      opciones: ["si", "si", "si", "si"],
      pregunta: "Damian es gordototote",
    },
    {
      id: 9,
      correcta: 2,
      opciones: ["si", "si", "si", "si"],
      pregunta: "Damian es un niño rata uy rarito",
    },
    {
      id: 10,
      correcta: 2,
      opciones: ["si", "si", "si", "si"],
      pregunta: "Damian es niña y le gusta ericksoya y alco ",
    },
  ]); // Específico para las preguntas
  const [, setIsLoadingData] = useState<boolean>(true);

  // useEffect(() => {
  //   const fetchExamenData = async () => {
  //     console.log(`Intentando cargar datos para examen ID: ${examId}`);
  //     setIsLoadingData(true);
  //     setLoadError(null);
  //     setExamenData(null);

  //     if (!examId) {
  //       setLoadError("ID de examen no encontrado en la URL.");
  //       setIsLoadingData(false);
  //       return;
  //     }
  //     if (!user) {
  //       setLoadError("Usuario no autenticado. No se puede cargar el examen.");
  //       setIsLoadingData(false);
  //       // Podrías redirigir a login si no está autenticado
  //       // navigate('/login');
  //       return;
  //     }

  //     try {
  //       // Consulta a Supabase DIRECTA (requiere RLS configurado)
  //       console.log(
  //         `Consultando Supabase para examen ${examId} y usuario ${user.id}`,
  //       );
  //       const { data, error } = await supabase
  //         .from("examenes")
  //         .select("*") // Selecciona todas las columnas
  //         .eq("id", examId)
  //         .eq("user_id", user.id) // <-- RLS VIRTUAL: Asegura que solo el dueño lo vea
  //         .single(); // Esperamos encontrar exactamente uno

  //       if (error) {
  //         console.error("Error de Supabase al obtener examen:", error);
  //         // Podría ser error 404 si no existe, o 401/403 si RLS falla
  //         if (error.code === "PGRST116") {
  //           // Código común para 'no rows found' con .single()
  //           throw new Error(
  //             "Examen no encontrado o no tienes permiso para acceder.",
  //           );
  //         }
  //         throw new Error(`Error al cargar datos: ${error.message}`);
  //       }

  //       if (!data) {
  //         throw new Error("Examen no encontrado.");
  //       }

  //       // Validación básica de los datos recibidos
  //       if (
  //         !data.datos ||
  //         !Array.isArray(data.datos) ||
  //         data.datos.length === 0
  //       ) {
  //         throw new Error(
  //           "Los datos del examen recuperados no contienen preguntas válidas.",
  //         );
  //       }

  //       console.log("Datos del examen cargados:", data);
  //       setExamenData(data as ExamenData); // Guarda todos los datos
  //       setPreguntas(data.datos as Pregunta[]); // Guarda específicamente las preguntas

  //       // Opcional: Ajustar el tiempo si lo guardaste
  //       // if (data.tiempo_total_segundos) setTimeLeft(data.tiempo_total_segundos);

  //       // Opcional: Marcar el examen como 'en_progreso' si estaba 'pendiente'
  //       if (data.estado === "pendiente") {
  //         console.log("Marcando examen como 'en_progreso'...");
  //         await supabase
  //           .from("examenes")
  //           .update({
  //             estado: "en_progreso",
  //             fecha_inicio: new Date().toISOString(),
  //           }) // Actualiza estado y fecha inicio real
  //           .eq("id", examId)
  //           .eq("user_id", user.id); // Seguridad
  //       }
  //     } catch (error) {
  //       console.error("Error al cargar/procesar examen:", error);
  //     } finally {
  //       setIsLoadingData(false);
  //     }
  //   };

  //   fetchExamenData();

  //   // Limpieza: No necesitamos limpiar nada específico aquí a menos que
  //   // iniciemos suscripciones de Supabase Realtime.
  // }, [examId, user, navigate]);
  // --- Lógica del Timer (stopTimer, startTimer, formatTime) ---
  const stopTimer = useCallback(() => {
    if (timerIntervalId) {
      clearInterval(timerIntervalId);
      setTimerIntervalId(null);
    }
  }, [timerIntervalId]);

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
    if (isSubmitted) return; // Evitar múltiples envíos
    setIsSubmitted(confirmar);
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
  const handleQuestionSelect = (
    sectionIndex: number,
    questionIndex: number,
  ) => {
    setCurrentQuestionIndices((prevIndices) => {
      const newIndices = [...prevIndices]; // Copia el array existente
      newIndices[sectionIndex] = questionIndex; // Actualiza el índice para la sección correcta
      return newIndices;
    });
  };

  const handleAnswerSelect = (questionIndex: number, optionIndex: number) => {
    if (!isSubmitted) {
      setUserAnswers((prevAnswers) => ({
        ...prevAnswers,
        [questionIndex]: optionIndex,
      }));
    }
  };

  const handleNavigatePrevious = (sectionIndex: number) => {
    setCurrentQuestionIndices((prevIndices) => {
      const newIndices = [...prevIndices];
      newIndices[sectionIndex] = Math.max(0, newIndices[sectionIndex] - 1);
      return newIndices;
    });
  };

  const handleNavigateNext = (sectionIndex: number) => {
    setCurrentQuestionIndices((prevIndices) => {
      const newIndices = [...prevIndices];
      newIndices[sectionIndex] = Math.min(
        preguntas.length - 1,
        newIndices[sectionIndex] + 1,
      );
      return newIndices;
    });
  };

  const handleGrid = (number: number) => {
    setSecciones(number);
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

  const today = new Date();
  // --- Renderizado ---
  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div>
          <header className="p-4 bg-white rounded-xl w-[100%] mb-4 shadow-md">
            <ul className="flex flex-row gap-2">
              <button
                className="w-10 h-10 p-1 border-2 border-sky-300 bg-gray-100"
                onClick={() => handleGrid(1)}
              >
                <div className="grid grid-cols-1 w-full h-full">
                  <span className="bg-green-500 rounded-sm w-full h-full"></span>
                </div>
              </button>
              <button
                className="w-10 h-10 p-1 border-2 border-sky-300 bg-gray-100"
                onClick={() => handleGrid(2)}
              >
                <div className="grid grid-cols-2 gap-1 w-full h-full">
                  <span className="bg-green-500 rounded-sm w-full h-full"></span>
                  <span className="bg-green-500 rounded-sm w-full h-full"></span>
                </div>
              </button>
              <button
                className="w-10 h-10 p-1 border-2 border-sky-300 bg-gray-100"
                onClick={() => handleGrid(3)}
              >
                <div className="grid grid-cols-2 gap-1 w-full h-full">
                  <span className="bg-green-500 rounded-sm w-full h-full row-span-2"></span>
                  <span className="bg-green-500 rounded-sm w-full h-full"></span>
                  <span className="bg-green-500 rounded-sm w-full h-full"></span>
                </div>
              </button>
              <button
                className="w-10 h-10 p-1 border-2 border-sky-300 bg-gray-100"
                onClick={() => handleGrid(4)}
              >
                <div className="grid grid-cols-2 gap-1 w-full h-full">
                  <span className="bg-green-500 rounded-sm w-full h-full col-span-2"></span>
                  <span className="bg-green-500 rounded-sm w-full h-full"></span>
                  <span className="bg-green-500 rounded-sm w-full h-full"></span>
                </div>
              </button>
            </ul>
          </header>
          <div className="flex flex-col gap-4 mb-4 md:flex-row w-[100%]">
            {examenData && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col justify-between items-start md:items-center">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-800 mb-1">
                        {examenData.titulo}
                      </h1>
                      <p className="text-gray-600">
                        Empezaste el {examenData.fecha_inicio}/
                        {today.getMonth()}/{today.getDay()} a la hora{" "}
                        {today.getHours()}:{today.getMinutes()}
                      </p>
                    </div>
                    <div className="mt-4 md:mt-0 bg-indigo-50 text-indigo-800 px-4 py-2 rounded-lg">
                      <i className="fas fa-info-circle mr-2"></i>
                      <span>
                        {examenData.numero_preguntas} preguntas • 3 horas •
                        Dificultad: {examenData.dificultad}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="bg-white rounded-xl shadow-md p-5 w-[100%]">
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
                    className="w-full gradient-bg hover:bg-gradient-to-r hover:from-pink-400 duration-500 hover:to-sky-400 hover:scDamian-[101%] cursor-pointer text-white px-4 py-3 rounded-lg font-semibold text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition ease-in-out shadow-lg hover:shadow-xl flex items-center justify-center"
                    title="Finalizar y Enviar Examen"
                    disabled={timeLeft <= 0 || isSubmitted} // Deshabilitar si el tiempo se agotó antes de enviar
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
                    className="w-full bg-gradient-to-r from-indigo-600 hover:scDamian-[101%] to-purple-600 duration-300 cursor-pointer text-white px-4 py-3 rounded-lg font-semibold text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition ease-in-out shadow-lg hover:shadow-xl flex items-center justify-center"
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
          <div className={`flex flex-col lg:flex-row gap-8`}>
            {Array.from({ length: secciones }).map((_, sectionIndex) => (
              <div
                key={sectionIndex}
                // className={`flex flex-col ${secciones % 2 != 0 && `lg:flex-row`} gap-8 w-full`}
                className={`flex flex-col ${secciones % 2 != 0 && `lg:flex-row`} gap-8 w-full`}
              >
                <PanelGroup direction="horizontal">
                  {/* Columna Izquierda (Info y Navegador) */}
                  <Panel minSize={20} className="w-full">
                    <div
                      // className={`${secciones % 2 != 0 && `max-w-1/3`} space-y-8 w-full`}
                      className={`space-y-8 w-full`}
                    >
                      <QuestionSelector
                        totalQuestions={preguntas.length}
                        currentQuestionIndex={
                          currentQuestionIndices[sectionIndex]
                        }
                        answeredQuestions={userAnswers}
                        onQuestionSelect={(questionIndex) =>
                          handleQuestionSelect(sectionIndex, questionIndex)
                        }
                        isSubmitted={isSubmitted}
                      />
                    </div>
                  </Panel>

                  <PanelResizeHandle className="mx-2 border-2 border-sky-400 hover:border-4 " />
                  {/* Columna Derecha (Pregunta Actual) */}
                  <Panel minSize={20}>
                    <div className={`w-full`}>
                      <SeccionExamen
                        pregunta={
                          preguntas[currentQuestionIndices[sectionIndex]]
                        }
                        questionIndex={currentQuestionIndices[sectionIndex]}
                        totalQuestions={preguntas.length}
                        selectedAnswer={
                          userAnswers[currentQuestionIndices[sectionIndex]]
                        }
                        onAnswerSelect={handleAnswerSelect}
                        onPrevious={() => handleNavigatePrevious(sectionIndex)}
                        onNext={() => handleNavigateNext(sectionIndex)}
                        onFinalize={handleFinalizar}
                        isSubmitted={isSubmitted}
                        userAnswers={userAnswers}
                        preguntas={preguntas}
                        habilitarBotones={true}
                      />
                    </div>
                  </Panel>
                </PanelGroup>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-8 mt-8">
            {isSubmitted && (
              <>
                {preguntas.map((_, indexPregunta) => (
                  <SeccionExamen
                    pregunta={preguntas[indexPregunta]}
                    questionIndex={indexPregunta}
                    totalQuestions={preguntas.length}
                    selectedAnswer={indexPregunta}
                    onAnswerSelect={handleAnswerSelect}
                    onPrevious={() => handleNavigatePrevious(0)}
                    onNext={() => handleNavigateNext(0)}
                    onFinalize={handleFinalizar}
                    isSubmitted={isSubmitted}
                    userAnswers={userAnswers}
                    preguntas={preguntas}
                    habilitarBotones={false}
                  />
                ))}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
