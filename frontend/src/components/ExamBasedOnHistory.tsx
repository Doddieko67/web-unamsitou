// src/components/ExamBasedOnHistory.tsx
import { useState, useCallback, useEffect, useMemo } from "react";
import { ExamButton } from "./ExamButton";
import { Personalization } from "./Main/Personalization";
import { QuestionConf } from "./Main/QuestionConf";
import { useNavigate } from "react-router";
import { UserAuth } from "../context/AuthContext";
import { TimerConf } from "./TimerConf";
import { PreviewableRecentExamCard } from "./Main/PreviewableExamRecents"; // Asegúrate de que la ruta sea correcta
import { supabase } from "../supabase.config"; // Asegúrate de que la ruta sea correcta
import { ExamenData } from "./Main/interfacesExam"; // Asegúrate de que la ruta y la interfaz sean correctas

// Importar SweetAlert2
import Swal from "sweetalert2";

export function ExamBasedOnHistory() {
  const { session, user } = UserAuth(); // Obtener la sesión y el usuario
  const navigate = useNavigate();

  // --- Estados para la generación del examen ---
  // Estado para los IDs de exámenes PINNEADOS que servirán de BASE para el nuevo examen.
  // El objeto key-value { examId: true } es útil para búsquedas rápidas O(1).
  const [pinnedExams, setPinnedExams] = useState<{ [examId: string]: boolean }>(
    {},
  );
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [fineTuning, setFineTuning] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [hour, setHour] = useState<number>(0); // Estado para horas del NUEVO examen
  const [minute, setMinute] = useState<number>(30); // Estado para minutos del NUEVO examen (ej: 30min por defecto)
  const [second, setSecond] = useState<number>(0); // Estado para segundos del NUEVO examen

  // --- Estados para la lista de exámenes recientes (y su visualización/filtrado) ---
  const [recentExams, setRecentExams] = useState<ExamenData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Estado de carga al obtener exámenes
  const [error, setError] = useState<string | null>(null); // Estado para errores al obtener exámenes
  // Estado para la paginación de los NO pinneados en la UI
  const [visibleCount, setVisibleCount] = useState(6);

  // --- Handlers para la configuración del NUEVO examen ---

  const handleQuestionCountChange = useCallback((count: number) => {
    setQuestionCount(count);
  }, []);

  const handleFineTuningChange = useCallback((text: string) => {
    setFineTuning(text);
  }, []);

  // Handler principal para generar el nuevo examen basado en historial
  const handleGenerateExam = async () => {
    // --- Validación Inicial con Swal ---
    // Comprobar si se ha seleccionado al menos un examen base (pinneado)
    if (Object.keys(pinnedExams).length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Selecciona Exámenes Base",
        text: "Por favor, selecciona al menos un examen anterior fijándolo con el ícono de pin para usarlo como base.",
        confirmButtonColor: "#3085d6", // Color azul estándar de Swal
      });
      return; // Detiene la ejecución si la validación falla
    }

    setIsGenerating(true); // Habilita el indicador de carga

    try {
      // --- Preparar datos para enviar al backend ---
      // El backend necesitará saber qué exámenes usar como base (sus IDs).
      // También puede necesitar el número de preguntas, tiempo, fine-tuning, etc.
      const baseExamIds = Object.keys(pinnedExams); // Obtiene un array de IDs de los exámenes pinneados

      // Construir un prompt de texto básico si el backend lo espera (aunque la lógica principal puede basarse en los IDs)
      let promptText = `Genera un examen de ${questionCount} preguntas`;
      if (fineTuning && fineTuning.trim() !== "") {
        promptText += ` con las siguientes instrucciones adicionales: ${fineTuning.trim()}.`;
      } else {
        promptText += `.`;
      }
      // Puedes añadir al prompt que se base en los temas/dificultades de los exámenes con IDs: ${baseExamIds.join(', ')}
      // pero esto depende de si tu modelo AI puede procesar esa información textualmente o si el backend lo gestiona.

      console.log(
        "Datos enviados al Backend para generación basada en historial:",
        {
          prompt: promptText,
          base_exams_id: baseExamIds, // Enviar los IDs de los exámenes pinneados
          cantidad_preguntas: questionCount, // También puedes enviar esto estructurado
          tiempo_limite_segundos: hour * 3600 + minute * 60 + second, // Tiempo para el NUEVO examen
          instrucciones_adicionales: fineTuning.trim(), // Fine-tuning estructurado
          // user_id: user?.id, // Podrías enviar el user_id si el backend lo necesita explícitamente
        },
      ); // Para depuración

      // --- Llama al backend para generar el examen ---
      const response = await fetch(
        // Usa una ruta específica si la generación basada en historia tiene un endpoint diferente
        "http://localhost:3000/api/generate-exam-from-history", // Ejemplo de ruta
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Incluye el token de autorización si es necesario
            authorization: `Bearer ${session?.access_token}`, // Usa encadenamiento opcional
          },
          body: JSON.stringify({
            prompt: promptText, // Envía el prompt construido
            base_exams_id: baseExamIds, // Envía el array de IDs de los exámenes base
            cantidad_preguntas: questionCount,
            tiempo_limite_segundos: hour * 3600 + minute * 60 + second,
            instrucciones_adicionales: fineTuning.trim(),
            // Añade cualquier otro parámetro que el backend necesite
          }),
        },
      );

      // --- Manejo de la respuesta del backend ---
      if (!response.ok) {
        // Intenta leer el mensaje de error del cuerpo de la respuesta si está disponible
        const errorBody = await response.json().catch(() => null); // Intenta parsear JSON, ignora errores si no es JSON
        const errorMessage =
          errorBody?.message ||
          `Error del servidor: ${response.status} ${response.statusText}`;
        throw new Error(errorMessage); // Lanza un error con un mensaje más específico
      }

      const result = await response.json();

      // Verifica si la respuesta contiene el ID del examen
      if (!result || !result.examId) {
        throw new Error(
          "La respuesta del servidor no contenía un ID de examen válido.",
        );
      }

      console.log("Nuevo examen generado y guardado con ID:", result.examId);

      // --- NAVEGACIÓN A LA PÁGINA DEL NUEVO EXAMEN ---
      // Navega a la ruta con el ID del examen generado.
      // No se muestra un Swal de éxito aquí porque la navegación es la indicación visual de éxito.
      navigate(`/examen/${result.examId}`);
    } catch (error) {
      // Especifica 'any' o un tipo de error más específico si lo conoces
      // --- Manejo de Errores con Swal ---
      console.error("Error en la llamada de generación:", error); // Loguea el error completo para debugging
      Swal.fire({
        icon: "error",
        title: "Error al Generar Examen",
        text: `Hubo un problema al intentar generar tu examen. Por favor, inténtalo de nuevo.`,
        confirmButtonColor: "#d33", // Color rojo estándar de Swal
      });
    } finally {
      // Este bloque siempre se ejecuta, ya sea que haya éxito o error
      setIsGenerating(false); // Deshabilita el indicador de carga
    }
  };

  // --- Handlers para la visualización/filtrado de exámenes recientes ---

  // Handler para PINNEAR/DESPINNEAR exámenes (clic en el icono de pin o en la tarjeta completa)
  const handlePinExam = useCallback((examId: string) => {
    setPinnedExams((prevPinned) => {
      const newPinned = { ...prevPinned };
      // Toggle logic: Si ya está pinneado, lo quita; si no, lo añade
      if (newPinned[examId]) {
        delete newPinned[examId]; // Despinnear
        console.log(`Examen ${examId} despinnneado.`);
      } else {
        newPinned[examId] = true; // Pinnear
        console.log(`Examen ${examId} pinneado.`);
      }
      // TODO: Considerar persistir este estado (e.g., localStorage, metadatos del usuario en DB)
      // para que los pines no se pierdan al recargar la página.
      return newPinned;
    });
  }, []); // Dependencias vacías, solo actualiza el estado local

  // Handler para eliminar un examen
  const handleDeleteExam = useCallback(
    async (examId: string) => {
      // Confirmación antes de eliminar
      const result = await Swal.fire({
        title: "¿Estás seguro?",
        text: "¡No podrás revertir esta acción!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33", // Rojo para confirmar eliminación
        cancelButtonColor: "#3085d6", // Azul para cancelar
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
      });

      // Si el usuario confirma
      if (result.isConfirmed) {
        // Podrías mostrar un indicador de carga específico para la eliminación si quieres
        // setIsLoading(true); // Esto podría interferir con el loading general

        try {
          // 1. Quitar el pin si está pinneado en el estado local inmediatamente (optimista)
          setPinnedExams((prevPinned) => {
            const newPinned = { ...prevPinned };
            delete newPinned[examId];
            return newPinned;
          });

          // 2. Eliminar de la base de datos
          const { error: examError } = await supabase
            .from("examenes")
            .delete()
            .eq("id", examId)
            .eq("user_id", user?.id); // Asegurar que solo el dueño pueda eliminar

          if (examError) {
            console.error("Error deleting exam:", examError);
            // Si falla la eliminación en DB, podrías revertir el estado de pin si quieres
            // Podrías mostrar un Swal de error aquí
            Swal.fire({
              icon: "error",
              title: "Error al Eliminar",
              text: `No se pudo eliminar el examen: ${examError.message}`,
            });
          } else {
            // 3. Eliminar del estado local recentExams si la DB tuvo éxito
            setRecentExams((prevExams) =>
              prevExams.filter((exam) => exam.id !== examId),
            );
            // Mostrar Swal de éxito (opcional, ya que la eliminación visual es el feedback principal)
            Swal.fire({
              icon: "success",
              title: "Eliminado",
              text: "El examen ha sido eliminado correctamente.",
              toast: true,
              position: "top-end",
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true,
            });
          }
        } catch (error) {
          console.error("Error deleting exam:", error);
          // Mostrar Swal de error genérico
          Swal.fire({
            icon: "error",
            title: "Error al Eliminar",
            text: `Ocurrió un error inesperado: ${error || "Error desconocido"}`,
          });
        } finally {
          // Si usaste un indicador de carga específico, restablece aquí
          // setIsLoading(false);
        }
      }
    },
    [user],
  ); // Dependencia: user es necesario para la comprobación de user_id en supabase

  // Cargar exámenes recientes al inicio para mostrarlos como opciones base
  useEffect(() => {
    const fetchRecentExams = async () => {
      // No cargar si no hay usuario logueado
      if (!user) {
        setRecentExams([]);
        setIsLoading(false);
        setError(null);
        return;
      }
      setIsLoading(true); // Activar carga antes de fetch
      setError(null); // Limpiar errores anteriores

      try {
        // Consultar exámenes del usuario, ordenados por fecha descendente
        const { data, error: fetchError } = await supabase
          .from("examenes")
          .select("*") // Seleccionar todas las columnas
          .eq("user_id", user.id) // Filtrar por el ID del usuario actual
          .order("fecha_inicio", { ascending: false }); // Ordenar por fecha

        if (fetchError) {
          console.error("Supabase fetch error:", fetchError); // Log para depuración
          setError(`Error al cargar exámenes: ${fetchError.message}`);
          setRecentExams([]);
        } else {
          // Formatear los datos si es necesario (ej: asegurar que 'datos' es un array)
          const formattedData = data.map((item) => ({
            ...item,
            datos: Array.isArray(item.datos) ? item.datos : [], // Asegurar que 'datos' es un array, o ajusta según tu tipo
          }));
          setRecentExams(formattedData as ExamenData[]);
          // Aquí podrías también cargar el estado 'pinnedExams' si lo persistieras
          // Por ejemplo: cargar de localStorage o de metadatos del usuario si aplica
        }
      } catch (err) {
        console.error("General fetch error:", err); // Log para depuración
        setError(
          err instanceof Error
            ? `Error desconocido al cargar exámenes: ${err.message}`
            : "Error desconocido al cargar exámenes.",
        );
        setRecentExams([]); // Limpiar exámenes en caso de error
      } finally {
        setIsLoading(false); // Desactivar carga al finalizar (éxito o error)
      }
    };

    fetchRecentExams();
  }, [user]); // Dependencia: Volver a cargar si cambia el usuario

  // --- Derivar estados o listas a partir de los estados principales (optimizados con useMemo) ---

  // Lista de exámenes pinneados (para mostrar arriba)
  const pinnedExamList = useMemo(() => {
    return recentExams.filter((exam) => pinnedExams[exam.id]);
  }, [recentExams, pinnedExams]); // Recalcular si cambian los exámenes o el estado de pines

  // Lista de exámenes NO pinneados (para mostrar debajo)
  const nonPinnedExamList = useMemo(() => {
    return recentExams.filter((exam) => !pinnedExams[exam.id]);
  }, [recentExams, pinnedExams]); // Recalcular si cambian los exámenes o el estado de pines

  // Lista de exámenes NO pinneados paginados (para mostrar en la sección de abajo)
  const slicedNonPinnedExams = useMemo(() => {
    return nonPinnedExamList.slice(0, visibleCount);
  }, [nonPinnedExamList, visibleCount]); // Recalcular si cambian la lista no pinneada o el contador visible

  // Handler para cargar más exámenes (incrementar visibleCount)
  const handleLoadMore = useCallback(() => {
    setVisibleCount((prev) => prev + 6); // Carga 6 más de la lista de no pinneados
  }, []); // Sin dependencias

  // Comprobación para saber si hay contenido total (pinneados o no) para mostrar secciones de listas
  const hasExamsLoadedAndAvailable =
    !isLoading && !error && recentExams.length > 0;

  // Comprobación para deshabilitar el botón de generar:
  // Deshabilitado si:
  // 1. No hay exámenes pinneados seleccionados.
  // 2. Se está generando un examen actualmente.
  const isGenerateDisabled =
    Object.keys(pinnedExams).length === 0 || isGenerating;

  return (
    <div
      id="new-exam-section"
      className="bg-white rounded-xl shadow-lg overflow-hidden p-6 sm:p-8 mb-8 border border-gray-200"
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-8 border-b pb-4">
        Generar Examen Basado en Historial
      </h2>
      <h3 className="text-lg font-medium text-gray-700 mb-4">
        1. Selecciona uno o más exámenes anteriores para usar como base (fíjalos
        con el ícono <i className="fas fa-thumbtack text-gray-500"></i>)
      </h3>
      {/* Sección para mostrar los exámenes recientes */}
      <div className="mb-7">
        {/* Mensajes de estado global de la carga de exámenes */}
        {isLoading && (
          <p className="text-gray-600 text-center col-span-full">
            <i className="fas fa-spinner fa-spin mr-2"></i>Cargando exámenes...
          </p>
        )}
        {/* Mostrar error al cargar exámenes si existe */}
        {!isLoading && error && (
          <p className="text-red-600 col-span-full text-center">{error}</p>
        )}
        {/* Contenido si NO está cargando, NO hay error y SÍ hay exámenes disponibles */}
        {hasExamsLoadedAndAvailable && (
          <>
            {" "}
            {/* Fragmento para agrupar las secciones pinneados/no pinneados */}
            {/* Sección de Exámenes Fijados (usados como base) */}
            {pinnedExamList.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  Exámenes Base Seleccionados ({pinnedExamList.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pinnedExamList.map((exam, index) => (
                    <PreviewableRecentExamCard
                      key={exam.id}
                      exam={exam}
                      onDelete={handleDeleteExam} // Pasa el handler de eliminación
                      isPinneable={true} // Indica que la tarjeta tiene funcionalidad de pin
                      isThisPinned={true} // Indica que esta tarjeta está actualmente pinneada
                      onEntireToggle={handlePinExam} // Handler que se llama al hacer clic en la tarjeta (para pinnear/despinnear)
                      index={index} // El índice no es estrictamente necesario aquí a menos que lo uses para algo visual
                    />
                  ))}
                </div>
                {/* Separador visual si también hay exámenes no pinneados visibles */}
                {slicedNonPinnedExams.length > 0 && (
                  <div className="border-t border-gray-200 mt-6 pt-6"></div>
                )}
              </div>
            )}
            {/* Sección de Exámenes Recientes (No Fijados) */}
            {/* Mostrar esta sección si hay exámenes no pinneados para visualizar (incluso si están paginados) */}
            {nonPinnedExamList.length > 0 && (
              <div className={`${pinnedExamList.length > 0 ? "" : "mt-6"}`}>
                {/* Mostrar encabezado solo si hay pinneados arriba O si NO hay pinneados y esta es la única sección */}
                {(pinnedExamList.length > 0 ||
                  nonPinnedExamList.length > 0) && (
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">
                    {pinnedExamList.length > 0
                      ? "Otros Exámenes Recientes"
                      : "Exámenes Recientes"}{" "}
                    ({nonPinnedExamList.length})
                  </h3>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {slicedNonPinnedExams.map((exam, index) => (
                    <PreviewableRecentExamCard
                      key={exam.id}
                      exam={exam}
                      onDelete={handleDeleteExam} // Pasa el handler de eliminación
                      isPinneable={true} // Indica que la tarjeta tiene funcionalidad de pin
                      isThisPinned={false} // Indica que esta tarjeta NO está pinneada
                      onEntireToggle={handlePinExam} // Handler para pinnear/despinnear
                      index={index} // Índice no estrictamente necesario
                    />
                  ))}
                </div>
              </div>
            )}
            {/* Mensaje si hay exámenes totales, pero ninguno pinneado Y ya se mostraron todos los no pinneados */}
            {!isLoading &&
              !error &&
              recentExams.length > 0 && // Hay exámenes en total
              pinnedExamList.length === 0 && // Ninguno está pinneado
              visibleCount >= nonPinnedExamList.length && // Ya se cargaron todos los no pinneados disponibles
              nonPinnedExamList.length > 0 && ( // Y había al menos uno no pinneado (para evitar mensaje duplicado)
                <p className="text-gray-500 text-center mt-4">
                  No hay más exámenes recientes sin fijar para mostrar.
                </p>
              )}
            {/* Mensaje "Fija un examen" si hay exámenes totales pero ninguno pinneado Y no hay no-pinneados visibles (ej: recién cargado) */}
            {!isLoading &&
              !error &&
              recentExams.length > 0 &&
              pinnedExamList.length === 0 &&
              slicedNonPinnedExams.length === 0 && ( // Ninguno está pinneado y ninguno no pinneado visible (ej: recién cargado)
                <p className="text-gray-500 text-center mt-4">
                  Selecciona exámenes para empezar a usarlos como base para tu
                  nuevo examen.
                </p>
              )}
          </>
        )}

        {/* Mensaje si NO está cargando, NO hay error y NO hay exámenes en total */}
        {!isLoading && !error && recentExams.length === 0 && (
          <p className="text-gray-600 col-span-full text-center mt-4">
            <i className="fas fa-info-circle mr-2"></i>No tienes exámenes
            recientes para usar como base. Genera un examen primero para empezar
            a construir tu historial.
          </p>
        )}

        {/* Botón Cargar más */}
        {/* Mostrar si no está cargando, no hay error, y aún quedan no pinneados por mostrar */}
        {!isLoading && !error && visibleCount < nonPinnedExamList.length && (
          <div className="col-span-full flex justify-center mt-6">
            <button
              onClick={handleLoadMore}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition"
              disabled={isGenerating} // Deshabilitar si se está generando un examen
            >
              Cargar más ({Math.min(6, nonPinnedExamList.length - visibleCount)}
              ) {/* Muestra cuántos se cargarán */}
            </button>
          </div>
        )}
      </div>{" "}
      {/* Fin de la sección de exámenes recientes */}
      {/* --- Configuraciones Adicionales para el Nuevo Examen --- */}
      <h3 className="text-lg font-medium text-gray-700 my-4 border-t pt-4">
        2. Configura las preguntas y tiempo del nuevo examen
      </h3>
      <QuestionConf
        questionCount={questionCount}
        onQuestionCountChange={handleQuestionCountChange}
      />
      <TimerConf
        hour={hour}
        setHour={setHour}
        minute={minute}
        setMinute={setMinute}
        second={second}
        setSecond={setSecond}
      />
      <h3 className="text-lg font-medium text-gray-700 my-4 border-t pt-4">
        3. Añade instrucciones adicionales (Opcional)
      </h3>
      <Personalization
        fineTuning={fineTuning}
        onFineTuningChange={handleFineTuningChange}
      />
      {/* Botón para generar el examen, deshabilitado si la configuración no está completa o está generando */}
      <h3 className="text-lg font-medium text-gray-700 my-4 border-t pt-4">
        4. Genera tu nuevo examen
      </h3>
      <ExamButton
        onGenerateClick={handleGenerateExam}
        disabled={isGenerateDisabled} // Usa la variable de estado derivada
      />
      {/* Indicador visual mientras se genera el examen */}
      {isGenerating && (
        <div className="mt-4 text-center text-sm text-indigo-600">
          <i className="fas fa-spinner fa-spin mr-2"></i>{" "}
          {/* Icono de spinner (requiere FontAwesome) */}
          Generando tu nuevo examen basado en tu historial... esto puede tardar
          unos momentos.
        </div>
      )}
    </div>
  );
}
