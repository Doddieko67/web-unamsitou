import { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
import { AnimatePresence, motion } from "motion/react"; // Usar framer-motion en lugar de motion/react

// --- Interfaces y Datos (igual que antes) ---

interface Pregunta {
  id: number;
  pregunta: string;
  opciones: string[];
  correcta: number;
  respuesta?: number;
  feedback?: string;
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
  tiempo_limite_segundos: number;
  tiempo_tomado_segundos?: number; // Añadir esto si no estaba
  respuestas_usuario?: { [key: number]: number }; // Añadir esto si no estaba
  descripcion: string;
}

// --- Componente Padre ---
export function ExamenPage() {
  const navigate = useNavigate();
  const { user } = UserAuth();
  const { examId } = useParams<{ examId: string }>(); // Obtener el :examId
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: number }>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null); // Puede ser null al inicio, luego number
  const [isSubmitted, setIsSubmitted] = useState(false);

  // --- CAMBIO CLAVE 1: Usar useRef para el ID del timer ---
  // Ya no necesitas este estado:
  // const [timerIntervalId, setTimerIntervalId] = useState<NodeJS.Timeout | null>(null);
  const timerIntervalIdRef = useRef<NodeJS.Timeout | null>(null);

  const [, setLoadError] = useState<string | null>(null);
  const [examenData, setExamenData] = useState<ExamenData | null>(null); // Guarda Todas los datos del examen
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]); // Inicializar vacío, no con dummy data
  const [, setIsLoadingData] = useState<boolean>(true);
  const [tiempoTomadoSegundos, setTiempoTomadoSegundos] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pinnedQuestions, setPinnedQuestions] = useState<{
    [key: number]: boolean;
  }>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [searchCategory, setSearchCategory] = useState("Todas");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [reset, setReset] = useState(false);

  // --- CAMBIO CLAVE 2: Referencia para isSubmitted para usarla dentro del intervalo ---
  const isSubmittedRef = useRef(isSubmitted);

  // --- CAMBIO CLAVE 3: useEffect para mantener isSubmittedRef actualizada ---
  useEffect(() => {
    isSubmittedRef.current = isSubmitted;
    console.log("Ref isSubmitted actualizada:", isSubmitted);
  }, [isSubmitted]); // Solo se ejecuta cuando isSubmitted cambia

  // Categorías para el dropdown
  const getSearchCategories = () => {
    const baseCategories = ["Todas", "Contestadas", "Sin contestar"];
    if (isSubmitted) {
      return [...baseCategories, "Correctas", "Incorrectas"];
    }
    return baseCategories;
  };

  // Función para filtrar preguntas
  const filteredPreguntas = useMemo(() => {
    if (!Array.isArray(preguntas)) return [];

    return preguntas.filter((pregunta, index) => {
      const matchesSearch = pregunta.pregunta
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      let matchesCategory = true;
      if (searchCategory === "Contestadas") {
        matchesCategory = userAnswers[index] !== undefined;
      } else if (searchCategory === "Sin contestar") {
        matchesCategory = userAnswers[index] === undefined;
      } else if (searchCategory === "Correctas" && isSubmitted) {
        matchesCategory = userAnswers[index] === pregunta.correcta;
      } else if (searchCategory === "Incorrectas" && isSubmitted) {
        matchesCategory =
          userAnswers[index] !== undefined &&
          userAnswers[index] !== pregunta.correcta;
      }

      return matchesSearch && matchesCategory;
    });
  }, [preguntas, searchTerm, searchCategory, userAnswers, isSubmitted]);

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

  // Función para cargar el estado guardado de localStorage
  const cargarEstadoGuardado = useCallback(() => {
    if (!examId) return null;
    try {
      const estadoGuardado = localStorage.getItem(`examen_estado_${examId}`);
      if (!estadoGuardado) return null;
      const parsedState = JSON.parse(estadoGuardado);
      console.log("Estado cargado de localStorage:", parsedState);
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
    if (!examId) return; // No guardar si ya fue enviado

    try {
      const estadoActual = {
        tiempoTomadoSegundos,
        userAnswers,
        examenData, // Guardar los datos completos del examen también
        preguntas, // Guardar las preguntas también
        currentQuestionIndex,
        pinnedQuestions,
        timeLeft,
        isSubmitted: isSubmittedRef.current, // Asegurarnos de guardar el estado de envío
        ultimaActualizacion: new Date().toISOString(),
      };
      localStorage.setItem(
        `examen_estado_${examId}`,
        JSON.stringify(estadoActual),
      );
      console.log("Estado actual guardado en localStorage.");
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
    pinnedQuestions,
    timeLeft,
    isSubmittedRef, // Usar la ref para saber si ya se envió
  ]);

  // Cargar datos del examen y estado guardado al inicio
  useEffect(() => {
    const fetchExamenData = async () => {
      console.log(`Intentando cargar datos para examen ID: ${examId}`);
      setIsLoadingData(true);
      setLoadError(null);
      setExamenData(null);
      setPreguntas([]); // Limpiar preguntas al inicio de la carga

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

      const estadoGuardado = cargarEstadoGuardado();
      if (estadoGuardado) {
        console.log("Cargando estado desde localStorage...");
        setTiempoTomadoSegundos(estadoGuardado.tiempoTomadoSegundos || 0);
        setUserAnswers(estadoGuardado.userAnswers || {});
        setPinnedQuestions(estadoGuardado.pinnedQuestions || []);
        setCurrentQuestionIndex(estadoGuardado.currentQuestionIndex || 0); // Opcional: volver a la última pregunta
        setPreguntas(estadoGuardado.preguntas || []);
        setExamenData(estadoGuardado.examenData || {});
        setTimeLeft(estadoGuardado.timeLeft || 0);
        setIsSubmitted(estadoGuardado.isSubmitted || false);
        // setPinnedQuestions(estadoGuardado.pinnedQuestions || {});
      }
      try {
        let data: ExamenData | null = null;
        let estadoGuardado = null;

        // 1. Intentar cargar desde Supabase primero para el estado más reciente (incluyendo si ya terminó)
        console.log(
          `Consultando Supabase para examen ${examId} y usuario ${user.id}`,
        );
        const { data: supabaseData, error: supabaseError } = await supabase
          .from("examenes")
          .select("*") // Selecciona todas las columnas
          .eq("id", examId)
          .eq("user_id", user.id) // <-- RLS VIRTUAL: Asegura que solo el dueño lo vea
          .single(); // Esperamos encontrar exactamente uno

        if (supabaseError) {
          console.error("Error de Supabase al obtener examen:", supabaseError);
          if (supabaseError.code === "PGRST116") {
            throw new Error(
              "Examen no encontrado o no tienes permiso para acceder.",
            );
          }
          throw new Error(`Error al cargar datos: ${supabaseError.message}`);
        }

        if (!supabaseData) {
          throw new Error("Examen no encontrado.");
        }
        data = supabaseData as ExamenData; // Usamos los datos de Supabase

        // 2. Cargar estado guardado local si el examen NO ha sido terminado/suspendido en Supabase
        if (data.estado !== "terminado" && data.estado !== "suspendido") {
          estadoGuardado = cargarEstadoGuardado();
          if (estadoGuardado) {
            console.log("Cargando estado desde localStorage...");
            setTiempoTomadoSegundos(estadoGuardado.tiempoTomadoSegundos || 0);
            setUserAnswers(estadoGuardado.userAnswers || {});
            setPinnedQuestions(estadoGuardado.pinnedQuestions || []);
            setCurrentQuestionIndex(estadoGuardado.currentQuestionIndex || 0); // Opcional: volver a la última pregunta
            setPreguntas(estadoGuardado.preguntas || []);
            // Otros estados locales si los guardaste (e.g., pinnedQuestions)
            // setPinnedQuestions(estadoGuardado.pinnedQuestions || {});
          }
        } else {
          // Si el examen ya terminó en Supabase, forzar el estado isSubmitted
          setIsSubmitted(true);
          console.log(
            "Examen ya marcado como terminado en Supabase. Forzando estado 'enviado'.",
          );
          // Limpiar cualquier estado local si el examen ya terminó en DB
          localStorage.removeItem(`examen_estado_${examId}`);
          // Cargar respuestas y tiempo tomado desde Supabase si el estado es terminado
          if (data.estado === "terminado") {
            setUserAnswers(data.respuestas_usuario || {});
            setTiempoTomadoSegundos(data.tiempo_tomado_segundos || 0);
          }
          // No calculamos timeLeft si ya terminó
          const tiempoLimite = data.tiempo_limite_segundos;
          const tiempoTomado = data.tiempo_tomado_segundos || 0; // Usar tiempo guardado si existe
          const tiempoRestante = Math.max(0, tiempoLimite - tiempoTomado);
          setTimeLeft(tiempoRestante);
          console.log(
            `Tiempo límite: ${tiempoLimite}, Tiempo tomado guardado: ${tiempoTomado}, Tiempo restante calculado: ${tiempoRestante}`,
          );
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
        setExamenData(data); // Guarda Todos los datos
        setPreguntas(data.datos); // Guarda específicamente las preguntas

        // Calcular tiempo restante solo si el examen NO está terminado/suspendido
        if (data.estado !== "terminado" && data.estado !== "suspendido") {
          const tiempoLimite = data.tiempo_limite_segundos;
          const tiempoTomado = estadoGuardado?.tiempoTomadoSegundos || 0; // Usar tiempo guardado si existe
          const tiempoRestante = Math.max(0, tiempoLimite - tiempoTomado);
          setTimeLeft(tiempoRestante);
          console.log(
            `Tiempo límite: ${tiempoLimite}, Tiempo tomado guardado: ${tiempoTomado}, Tiempo restante calculado: ${tiempoRestante}`,
          );

          // Opcional: Marcar el examen como 'en_progreso' si estaba 'pendiente'
          if (data.estado === "pendiente") {
            console.log("Marcando examen como 'en_progreso'...");
            await supabase
              .from("examenes")
              .update({
                estado: "en_progreso",
                fecha_inicio: new Date().toISOString(), // Usar fecha actual de inicio real
              })
              .eq("id", examId)
              .eq("user_id", user.id);
          }
        } else {
          // Si ya estaba terminado/suspendido, setTimeLeft ya fue puesto a 0 arriba.
        }
      } catch (error) {
        console.error("Error al cargar/procesar examen:", error);
        setLoadError(
          error instanceof Error
            ? error.message
            : "Ocurrió un error desconocido al cargar el examen.",
        );
        // Podrías redirigir a una página de error
        // navigate('/error', { state: { message: error.message } });
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchExamenData();

    // Limpieza al desmontar: detener el timer si aún está corriendo
    // Esto lo haremos en el useEffect del timer principal ahora.
  }, [
    examId,
    user,
    navigate,
    cargarEstadoGuardado,
    setIsSubmitted,
    setTiempoTomadoSegundos,
    setUserAnswers,
    setTimeLeft,
  ]); // Agregar dependencias de setters

  // --- REMOVER stopTimer y startTimer como funciones separadas de useCallback ---
  // Toda la lógica de inicio/detención del timer se moverá al useEffect principal del timer.
  // Ya no necesitas esto:
  // const stopTimer = useCallback(() => { ... }, [timerIntervalId]);
  // const startTimer = useCallback(() => { ... }, [timerIntervalId, handleFinalizar, isSubmitted]); // ¡Este era parte del problema por sus deps!

  // --- CAMBIO CLAVE 4: useEffect principal para el control del Timer ---
  // Este efecto se encargará de iniciar o detener el timer basándose en `isSubmitted`
  useEffect(() => {
    console.log("⏰ useEffect Timer Control [isSubmitted]:", { isSubmitted });

    // --- Lógica interna para detener el timer ---
    const stopTimer = () => {
      console.log(
        "⏰ Deteniendo timer. ID de referencia actual:",
        timerIntervalIdRef.current,
      );
      if (timerIntervalIdRef.current !== null) {
        clearInterval(timerIntervalIdRef.current);
        timerIntervalIdRef.current = null; // Limpiar la referencia
        console.log("Timer detenido con éxito.");
      }
    };

    // Si el examen NO ha sido enviado, iniciar el timer
    if (!isSubmitted) {
      console.log("⏰ Iniciando timer...");
      // Asegurarse de que no haya un timer anterior corriendo (útil en re-renders)
      stopTimer(); // Limpia cualquier timer previo

      const intervalId = setInterval(() => {
        // Lógica que se ejecuta cada segundo
        console.log("⏰ Tick del intervalo...");

        // Incrementar tiempo tomado
        setTiempoTomadoSegundos((prev) => prev + 1);

        // Decrementar tiempo restante
        setTimeLeft((prev) => {
          // Manejar caso inicial prev = null
          const newTime = (prev || 0) - 1;

          if (newTime <= 0) {
            console.log(
              "⏰ Tiempo agotado en el intervalo. Desencadenando finalización...",
            );
            // Detener este intervalo específico desde dentro
            clearInterval(intervalId); // Usa la variable local `intervalId` de esta instancia
            timerIntervalIdRef.current = null; // Limpiar la referencia global también

            // CAMBIO CLAVE 5: Señalizar fin de tiempo cambiando el estado `isSubmitted`.
            // El `useEffect` que maneja las acciones de finalización reaccionará a esto.
            // Usar la ref para acceder al estado actual de isSubmitted
            if (!isSubmittedRef.current) {
              // Solo intentar finalizar si NO ha sido enviado ya (por el botón)
              console.log(
                "⏰ Estableciendo isSubmitted a true desde el intervalo (tiempo agotado).",
              );
              setIsSubmitted(true);
            } else {
              console.log(
                "⏰ Tiempo agotado, pero isSubmitted ya es true. No se desencadena finalización adicional.",
              );
            }

            return 0; // Establecer el tiempo restante a 0
          }
          return newTime; // Continuar decrementando
        });
      }, 1000); // 1000 milisegundos = 1 segundo

      // CAMBIO CLAVE 6: Guardar el ID del nuevo intervalo en la referencia
      timerIntervalIdRef.current = intervalId;
      console.log(
        "⏰ Timer iniciado. Nuevo ID de referencia:",
        timerIntervalIdRef.current,
      );
    } else {
      // Si `isSubmitted` es true (el examen ha sido enviado)
      console.log("⏰ isSubmitted es true. Deteniendo timer...");
      stopTimer(); // Asegurarse de que el timer se detenga
    }

    // Función de limpieza del useEffect: Se ejecuta antes de que el efecto se vuelva a ejecutar
    // (si `isSubmitted` cambia) y cuando el componente se desmonta.
    // Esto garantiza que el timer siempre se detenga para evitar fugas de memoria.
    return () => {
      console.log(
        "⏰ Limpieza de useEffect Timer Control. Deteniendo timer...",
      );
      stopTimer();
    };

    // Dependencias: Este efecto solo necesita reaccionar a `isSubmitted` para decidir si iniciar/detener.
    // Los setters de estado (`setTimeLeft`, `setTiempoTomadoSegundos`, `setIsSubmitted`) son usados dentro
    // de la callback del intervalo (que está definida dentro de este efecto), por lo que deben ser dependencias.
  }, [isSubmitted, setTimeLeft, setTiempoTomadoSegundos, setIsSubmitted]);

  // --- CAMBIO CLAVE 7: Modificar handleFinalizar ---
  // Ahora handleFinalizar solo cambia el estado `isSubmitted` y limpia localStorage.
  // Las acciones pesadas (Supabase, navegación) se mueven a un useEffect separado.

  const handleFinalizar = useCallback(async () => {
    // Mostrar SweetAlert de confirmación

    // CAMBIO CLAVE 8: Usar la ref para un chequeo rápido y evitar múltiples ejecuciones
    if (isSubmittedRef.current) {
      console.log(
        "⏰ handleFinalizar llamado, pero isSubmittedRef ya es true. Saliendo.",
      );
      return; // Salir si ya está marcado como enviado
    }

    console.log(
      "⏰ handleFinalizar llamado. Estableciendo isSubmitted a true.",
    );
    // CAMBIO CLAVE 9: Solo establecer el estado. Esto desencadenará el `useEffect` del timer (para detenerlo)
    // y el NUEVO `useEffect` de finalización (para guardar y navegar).
    setIsSubmitted(true);

    // Limpiar localStorage inmediatamente al finalizar (éxito o tiempo agotado)
    if (examId) {
      localStorage.removeItem(`examen_estado_${examId}`);
      console.log(`localStorage limpiado para examen_${examId}`);
    }

    // Las acciones de guardar y navegar se hacen ahora en el useEffect de finalización
    // console.log( "Examen finalizado. Tiempo tomado:", tiempoTomadoSegundos, "Respuestas:", userAnswers ); // Logs pueden quedarse, pero los valores podrían estar ligeramente desactualizados aquí
  }, [examId, setIsSubmitted]); // Dependencias solo incluyen cosas usadas directamente aquí (examId, setIsSubmitted)

  // --- CAMBIO CLAVE 10: Nuevo useEffect para ejecutar acciones de Finalización (Guardar y Navegar) ---
  // Este efecto se dispara CUANDO `isSubmitted` cambia a `true`.
  useEffect(() => {
    console.log("✅ useEffect Finalization Actions:", { isSubmitted });
    if (isSubmitted) {
      console.log(
        "✅ isSubmitted es true. Ejecutando acciones de finalización (Guardar en DB y Navegar).",
      );

      const performFinalizationActions = async () => {
        // Acceder a los últimos valores de estado (estos ya están frescos aquí porque isSubmitted cambió)
        console.log(
          "✅ Guardando estado final. Tiempo tomado:",
          tiempoTomadoSegundos, // Estado fresco
          "Respuestas:",
          userAnswers, // Estado fresco
        );
        try {
          const { error } = await supabase
            .from("examenes")
            .update({
              estado: "terminado", // O 'suspendido' si tuvieras un botón específico para eso
              tiempo_tomado_segundos: tiempoTomadoSegundos,
              respuestas_usuario: userAnswers,
              questions_pinned: pinnedQuestions,
              fecha_fin: new Date().toISOString(), // Registrar fecha/hora de fin
            })
            .eq("id", examId);

          if (error) {
            console.error(
              "Error de Supabase al actualizar estado del examen:",
              error,
            );
            // Considerar mostrar un error al usuario
          } else {
            console.log("✅ Estado final guardado en Supabase con éxito.");
          }
        } catch (error) {
          console.error(
            "Error general al actualizar el estado del examen:",
            error,
          );
          // Considerar mostrar un error al usuario
        } finally {
          // Navegar SIEMPRE después de intentar guardar
          console.log(`✅ Navegando a /examen/${examId}`);
          navigate(`/examen/${examId}`);
        }
      };

      // Ejecutar las acciones asíncronas
      performFinalizationActions();
    }
    // Dependencias: Reaccionar a isSubmitted. Usar los últimos valores de estado (tiempoTomadoSegundos, userAnswers)
    // y otras variables necesarias para Supabase/navegación (examId, user, navigate).
  }, [
    isSubmitted,
    tiempoTomadoSegundos,
    userAnswers,
    examId,
    user,
    navigate,
    pinnedQuestions,
  ]);

  const handleReset = useCallback(() => {
    console.log("⏰ handleReset llamado. Estableciendo isSubmitted a false.");
    setReset(false);
  }, [setReset]);

  useEffect(() => {
    console.log("✅ useEffect Finalization Actions:", { reset });
    if (!user || !examenData) return;
    if (reset) {
      console.log(
        "✅ isReset es true. Ejecutando acciones de reinicio (Guardar en DB y Navegar).",
      );

      const performResetActions = async () => {
        // Acceder a los últimos valores de estado (estos ya están frescos aquí porque isSubmitted cambió)
        try {
          const { error } = await supabase.from("examenes").insert({
            user_id: user.id,
            titulo: examenData.titulo,
            descripcion: examenData.descripcion,
            datos: preguntas,
            dificultad: examenData.dificultad,
            numero_preguntas: preguntas.length,
            tiempo_limite_segundos: examenData.tiempo_limite_segundos,
          });

          if (error) {
            console.error(
              "Error de Supabase al actualizar estado del examen:",
              error,
            );
            // Considerar mostrar un error al usuario
          } else {
            console.log("✅ Estado final guardado en Supabase con éxito.");
          }
        } catch (error) {
          console.error(
            "Error general al actualizar el estado del examen:",
            error,
          );
          // Considerar mostrar un error al usuario
        } finally {
          // Navegar SIEMPRE después de intentar guardar
          console.log(`✅ Navegando a /examen/${examId}`);
          navigate(`/examen/${examId}`);
        }
      };

      // Ejecutar las acciones asíncronas
      performResetActions();
    }
    // Dependencias: Reaccionar a isSubmitted. Usar los últimos valores de estado (tiempoTomadoSegundos, userAnswers)
    // y otras variables necesarias para Supabase/navegación (examId, user, navigate).
  }, [setReset, user, examenData]);

  // Guardado automático cada 5 segundos
  useEffect(() => {
    // Guardar solo si NO está enviado
    console.log("Iniciando auto-guardado cada 5 segundos...");
    const autoSaveInterval = setInterval(() => {
      console.log("Ejecutando auto-guardado...");
      guardarEstadoActual();
    }, 5000); // Guardar cada 5 segundos

    return () => {
      console.log("Limpiando intervalo de auto-guardado.");
      clearInterval(autoSaveInterval);
    };
  }, [guardarEstadoActual]); // Depende de guardarEstadoActual y si ya se envió

  // En caso de que el usuario cierre la pestaña/navegador, guardar estado antes de salir
  useEffect(() => {
    const handleBeforeUnload = () => {
      guardarEstadoActual();
      // Nota: No puedes hacer llamadas async (como a Supabase) aquí de forma confiable
      // localStorage es la mejor opción para guardar rápido antes de cerrar
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [guardarEstadoActual, isSubmitted]);

  const formatTime = (totalSeconds: number | null): string => {
    // Acepta null
    if (totalSeconds === null || totalSeconds < 0) totalSeconds = 0;
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
        delete newPinned[questionIndex];
      } else {
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
      previewElement.classList.add("outline-pulse-repeated");
      setTimeout(() => {
        previewElement.classList.remove("outline-pulse-repeated");
      }, 2500); // 500ms por pulsación × 5 repeticiones = 2500ms
    }
  }, []);

  const handleScrollToQuestion = useCallback((questionIndex: number) => {
    setCurrentQuestionIndex(questionIndex);
    const viewerElement = document.getElementById(`question-viewer`);
    if (viewerElement) {
      viewerElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  const handleAnswerSelect = useCallback(
    (questionIndex: number, optionIndex: number) => {
      // Solo permitir responder si el examen no ha sido enviado
      if (!isSubmitted) {
        setUserAnswers((prevAnswers) => ({
          ...prevAnswers,
          [questionIndex]: optionIndex,
        }));
      } else {
        console.log("Intento de responder pregunta, pero examen ya enviado.");
      }
    },
    [isSubmitted], // Esta función solo cambia si isSubmitted cambia
  );

  const handleNavigatePrevious = useCallback(() => {
    setCurrentQuestionIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const handleNavigateNext = useCallback(() => {
    setCurrentQuestionIndex((prev) => Math.min(preguntas.length - 1, prev + 1));
  }, [preguntas]); // Depende de preguntas para saber el límite

  // Manejo de teclado para navegación y respuestas
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // No hacer nada si el usuario está escribiendo en un input/textarea
      const activeElement = document.activeElement;
      if (
        activeElement &&
        (activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA")
      ) {
        return;
      }

      // Solo permitir respuestas si el examen NO está enviado
      if (!isSubmitted) {
        if (event.key === "1") {
          event.preventDefault();
          handleAnswerSelect(currentQuestionIndex, 0);
        } else if (event.key === "2") {
          event.preventDefault();
          handleAnswerSelect(currentQuestionIndex, 1);
        } else if (event.key === "3") {
          event.preventDefault();
          handleAnswerSelect(currentQuestionIndex, 2);
        } else if (event.key === "4") {
          event.preventDefault();
          handleAnswerSelect(currentQuestionIndex, 3);
        }
      }

      // La navegación con flechas y Enter SIEMPRE está permitida (útil para revisar)
      if (!preguntas || preguntas.length === 0) return; // No navegar si no hay preguntas

      if (event.key === "ArrowRight" || event.key === "Enter") {
        event.preventDefault();
        handleNavigateNext();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        handleNavigatePrevious();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
    // Dependencias: Necesita las funciones de navegación y manejo de respuesta, isSubmitted y currentQuestionIndex
  }, [
    handleNavigateNext,
    handleNavigatePrevious,
    handleAnswerSelect,
    isSubmitted,
    preguntas,
    currentQuestionIndex,
  ]);

  const preguntaActual = preguntas[currentQuestionIndex];
  const today = new Date(examenData?.fecha_inicio || Date.now()); // Usar fecha de inicio del examen si existe

  // --- Renderizado ---
  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div>
          <div className="flex flex-col md:flex-row w-full mb-8 gap-8">
            <div className="flex-shrink-0 lg:w-1/3 hidden lg:block">
              {Object.keys(pinnedQuestions).length > 0 ? (
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
              ) : (
                <div className="flex flex-col items-center justify-center h-full w-full bg-white p-4 rounded-lg shadow-lg">
                  <h2 className="text-2xl font-bold text-gray-500">
                    Fija una pregunta
                  </h2>
                </div>
              )}
            </div>
            <div className="flex flex-col w-full md:flex-row lg:w-2/3 gap-8">
              <div className="bg-white rounded-xl hidden md:flex flex-col shadow-md p-5 space-y-1 w-full lg:max-w-[350px]">
                <ExamTimer
                  timeLeft={timeLeft}
                  formatTime={formatTime}
                  isSubmitted={isSubmitted}
                />

                {/* Área de Acción: Botón de Enviar o Estado Enviado */}
                <div className="pt-4 w-full">
                  {!isSubmitted ? (
                    <div className="space-y-4">
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
                          handleFinalizar();
                        }}
                        className="w-full gradient-bg text-white px-4 py-3 rounded-lg font-semibold text-sm sm:text-base hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out shadow-lg hover:shadow-xl flex items-center justify-center"
                        title="Finalizar y Enviar Examen"
                        disabled={timeLeft <= 0} // Deshabilitar si el tiempo se agotó antes de enviar
                      >
                        <i className="fas fa-paper-plane mr-2"></i>
                        <span>Enviar Examen Ahora</span>
                      </button>
                      <button
                        onClick={async () => {
                          const confirmar = await Swal.fire({
                            title: "¿Estás seguro?",
                            text: "Seguro que quieres suspender el examen? Simplemente se guardará el estado actual del examen en la base de datos y pausará el tiempo restante.",
                            icon: "warning",
                            showCancelButton: true,
                            confirmButtonColor: "#3085d6",
                            cancelButtonColor: "#d33",
                            confirmButtonText: "Sí, suspender examen",
                            cancelButtonText: "Cancelar",
                          }).then((result) => {
                            return result.isConfirmed;
                          });

                          if (!confirmar) return; // Si el usuario cancela, salir
                          handleFinalizar();
                        }}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 rounded-lg font-semibold text-sm sm:text-base hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out shadow-lg hover:shadow-xl flex items-center justify-center"
                        title="Suspender y Enviar Examen"
                        disabled={timeLeft <= 0} // Deshabilitar si el tiempo se agotó antes de enviar
                      >
                        <i className="fas fa-calendar-xmark mr-2"></i>
                        <span>Suspender el Examen</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <button
                        onClick={async () => {
                          const confirmar = await Swal.fire({
                            title: "¿Estás seguro?",
                            text: "Seguro que quieres suspender el examen? Simplemente se guardará el estado actual del examen en la base de datos y pausará el tiempo restante.",
                            icon: "warning",
                            showCancelButton: true,
                            confirmButtonColor: "#3085d6",
                            cancelButtonColor: "#d33",
                            confirmButtonText: "Sí, suspender examen",
                            cancelButtonText: "Cancelar",
                          }).then((result) => {
                            return result.isConfirmed;
                          });

                          if (!confirmar) return; // Si el usuario cancela, salir
                          handleFinalizar();
                        }}
                        className="w-full text-yellow-600 bg-yellow-100 shadow-yellow-100 border-yellow-300 border-2 hover:shadow-yellow-400 px-4 py-3 rounded-lg font-semibold text-sm sm:text-base transition duration-150 ease-in-out shadow-md flex items-center justify-center"
                        title="Retroalimentar Examen"
                        disabled={timeLeft <= 0} // Deshabilitar si el tiempo se agotó antes de enviar
                      >
                        <i class="fa-solid fa-wheat-awn-circle-exclamation mr-2"></i>{" "}
                        <span>Retroalimentar todo</span>
                      </button>
                      <button
                        onClick={handleFinalizar}
                        className="w-full text-purple-600 bg-purple-100 shadow-purple-100 border-purple-300 border-2 hover:shadow-purple-400 px-4 py-3 rounded-lg font-semibold text-sm sm:text-base transition duration-150 ease-in-out shadow-md flex items-center justify-center"
                        title="Suspender y Enviar Examen"
                        disabled={timeLeft <= 0} // Deshabilitar si el tiempo se agotó antes de enviar
                      >
                        <i className="fas fa-undo mr-2"></i>
                        <span>Reiniciar el examen</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
              {examenData && (
                <div className="bg-white flex justify-center rounded-xl shadow-md overflow-hidden w-full p-6 relative">
                  <div className="absolute top-2 right-2">
                    <i
                      className={`fas fa-wifi p-3 rounded-lg border-2 ${isOnline ? "bg-green-100 border-green-300 text-green-600" : "text-red-500 border-red-300 bg-red-100 animate-pulse"}`}
                    ></i>
                  </div>
                  <div className="flex flex-col justify-center items-center align-middle">
                    <h1 className="text-2xl font-bold text-gray-800 mb-1">
                      {examenData.titulo}
                    </h1>
                    <p className="text-gray-600 mb-2">
                      Empezaste el {today.getFullYear()}/{today.getMonth()}/
                      {today.getDay()} a la hora {today.getHours()}:
                      {today.getMinutes()}
                    </p>
                    <div className="mt-4 md:mt-0 bg-indigo-50 text-indigo-800 px-4 py-2 rounded-lg">
                      <i className="fas fa-info-circle mr-2"></i>
                      <span>
                        {examenData.numero_preguntas} preguntas •{" "}
                        {formatTime(examenData.tiempo_limite_segundos)} •
                        Dificultad: {examenData.dificultad}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div className="bg-white rounded-xl flex md:hidden flex-col shadow-md p-5 space-y-1 w-full lg:max-w-[350px]">
                <ExamTimer
                  timeLeft={timeLeft}
                  formatTime={formatTime}
                  isSubmitted={isSubmitted}
                />

                {/* Área de Acción: Botón de Enviar o Estado Enviado */}
                <div className="pt-4 w-full">
                  {!isSubmitted ? (
                    <div className="space-y-4">
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
                          handleFinalizar();
                        }}
                        className="w-full gradient-bg text-white px-4 py-3 rounded-lg font-semibold text-sm sm:text-base hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out shadow-lg hover:shadow-xl flex items-center justify-center"
                        title="Finalizar y Enviar Examen"
                        disabled={timeLeft <= 0} // Deshabilitar si el tiempo se agotó antes de enviar
                      >
                        <i className="fas fa-paper-plane mr-2"></i>
                        <span>Enviar Examen Ahora</span>
                      </button>
                      <button
                        onClick={async () => {
                          const confirmar = await Swal.fire({
                            title: "¿Estás seguro?",
                            text: "Seguro que quieres suspender el examen? Simplemente se guardará el estado actual del examen en la base de datos y pausará el tiempo restante.",
                            icon: "warning",
                            showCancelButton: true,
                            confirmButtonColor: "#3085d6",
                            cancelButtonColor: "#d33",
                            confirmButtonText: "Sí, suspender examen",
                            cancelButtonText: "Cancelar",
                          }).then((result) => {
                            return result.isConfirmed;
                          });

                          if (!confirmar) return; // Si el usuario cancela, salir
                          handleFinalizar();
                        }}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 rounded-lg font-semibold text-sm sm:text-base hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out shadow-lg hover:shadow-xl flex items-center justify-center"
                        title="Suspender y Enviar Examen"
                        disabled={timeLeft <= 0} // Deshabilitar si el tiempo se agotó antes de enviar
                      >
                        <i className="fas fa-calendar-xmark mr-2"></i>
                        <span>Suspender el Examen</span>
                      </button>
                    </div>
                  ) : (
                    <div className="w-full bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg font-semibold text-sm sm:text-base text-center flex items-center justify-center shadow-inner">
                      <i className="fas fa-check-circle mr-2"></i>
                      <span>Examen Enviado Correctamente</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col lg:flex-row gap-8" id="question-viewer">
            {/* Columna Izquierda (Info y Navegador) */}
            <div className="lg:w-1/3 space-y-8 flex-shrink-0">
              {/* Tarjeta de Controles: Timer y Envío */}

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

              <div className="lg:hidden">
                {Object.keys(pinnedQuestions).length > 0 ? (
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
                ) : (
                  <div className="flex flex-col items-center justify-center h-full w-full bg-white p-4 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold text-gray-500">
                      Fija una pregunta
                    </h2>
                  </div>
                )}
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
                .map((preguntaFijada, indexGrid) => {
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
                      indexGrid={indexGrid}
                    />
                  );
                })}
          </div>
          <div className="w-full border-4 border-sky-200 my-8 bg-sky-500"></div>
          <div className="mb-6">
            <form className="max-w-full" onSubmit={(e) => e.preventDefault()}>
              <div className="flex">
                <div className="relative">
                  <button
                    type="button"
                    className="shrink-0 justify-between min-w-[200px] z-10 inline-flex items-center py-2.5 px-4 text-sm font-medium text-center text-gray-900 bg-gray-100 border border-gray-300 rounded-s-lg hover:bg-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    {searchCategory}{" "}
                    <i
                      className={`fas fa-chevron-down ml-2 text-xs transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`}
                    ></i>
                  </button>

                  {/* Dropdown animado */}
                  <div
                    ref={dropdownRef}
                    className={`absolute left-0 top-full z-20 mt-1 bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-44 overflow-hidden transition-all duration-300 ease-in-out ${
                      isDropdownOpen
                        ? "opacity-100 max-h-96 translate-y-0"
                        : "opacity-0 max-h-0 -translate-y-2 pointer-events-none"
                    }`}
                  >
                    <ul className="py-2 text-sm text-gray-700">
                      {getSearchCategories().map((category) => (
                        <li key={category}>
                          <button
                            type="button"
                            className={`inline-flex w-full px-4 py-2 hover:bg-gray-100 ${
                              category === "Correctas"
                                ? "text-green-600"
                                : category === "Incorrectas"
                                  ? "text-red-600"
                                  : ""
                            }`}
                            onClick={() => {
                              setSearchCategory(category);
                              setIsDropdownOpen(false);
                            }}
                          >
                            {category === "Correctas" && (
                              <i className="fas fa-check-circle mr-2"></i>
                            )}
                            {category === "Incorrectas" && (
                              <i className="fas fa-times-circle mr-2"></i>
                            )}
                            {category === "Contestadas" && (
                              <i className="fas fa-circle-check mr-2"></i>
                            )}
                            {category === "Sin contestar" && (
                              <i className="fas fa-circle-question mr-2"></i>
                            )}
                            {category === "Todas" && (
                              <i className="fas fa-list-ul mr-2"></i>
                            )}
                            {category}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="relative w-full">
                  <input
                    type="search"
                    className="block p-2.5 w-full z-10 text-sm text-indigo-900 bg-indigo-50 focus:outline rounded-e-lg border-s-indigo-50 border-s-2 border border-indigo-300 focus:ring-indigo-300 focus:border-indigo-300 focus:outline-indigo-300 focus:bg-indigo-100 transition-all delay-100"
                    placeholder="Buscar preguntas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </form>

            <div className="mt-3 flex justify-center items-center">
              <div className="text-sm text-gray-500">
                Mostrando {filteredPreguntas.length} de {preguntas.length}{" "}
                preguntas
              </div>
            </div>
          </div>

          {/* Y luego modifica el grid para usar filteredPreguntas en lugar de preguntas */}
          <AnimatePresence>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {Array.isArray(filteredPreguntas) &&
                filteredPreguntas.map((pregunta, indexGrid) => {
                  // Encontrar el índice original en el array de preguntas
                  const index = preguntas.findIndex(
                    (p) => p.id === pregunta.id,
                  );

                  return (
                    <motion.div
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -10, opacity: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <PreviewableSeccionExamen
                        key={pregunta.id || index}
                        pregunta={pregunta}
                        index={index} // Mantenemos el índice original
                        totalQuestions={preguntas.length}
                        selectedAnswer={userAnswers[index]}
                        userAnswers={userAnswers}
                        preguntas={preguntas}
                        isSubmitted={isSubmitted}
                        onPinToggle={handlePinQuestion}
                        isThisPinned={!!pinnedQuestions[index]}
                        handleScrollToQuestion={handleScrollToQuestion}
                        id={`preview-question-${index}`}
                        indexGrid={indexGrid}
                      />
                    </motion.div>
                  );
                })}
            </div>

            {filteredPreguntas.length === 0 && (
              <motion.div
                className="text-center py-8"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-gray-400 mb-2">
                  <i className="fas fa-search fa-3x"></i>
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  No se encontraron resultados
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Intenta con otros términos de búsqueda o cambia la categoría
                  de filtrado
                </p>
                {searchCategory !== "Todas" && (
                  <button
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    onClick={() => setSearchCategory("Todas")}
                  >
                    Ver todas las preguntas
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
