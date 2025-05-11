import { useState, useCallback, useEffect, useMemo } from "react"; // <-- Añadir useMemo
import { ExamButton } from "./ExamButton";
import { Personalization } from "./Main/Personalization";
import { QuestionConf } from "./Main/QuestionConf";
import { useNavigate } from "react-router";
import { UserAuth } from "../context/AuthContext";
import { TimerConf } from "./TimerConf";
import { PreviewableRecentExamCard } from "./Main/PreviewableExamRecents";
import { supabase } from "../supabase.config";
import { ExamenData } from "./Main/interfacesExam";
import { url_backend } from "../url_backend";

export function ExamBasedOnHistory() {
  const { session } = UserAuth();
  const navigate = useNavigate();
  const { user } = UserAuth(); // Obtener el usuario

  // --- Estados para la generación del examen ---
  // Estado para los IDs de exámenes SELECCIONADOS para generar el nuevo examen
  const [, setselectedExams] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [fineTuning, setFineTuning] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [hour, setHour] = useState<number>(3);
  const [minute, setMinute] = useState<number>(0);
  const [second, setSecond] = useState<number>(0);

  // --- Estados para la lista de exámenes recientes (y su visualización/filtrado) ---
  const [recentExams, setRecentExams] = useState<ExamenData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Loading state for fetching exams
  const [error, setError] = useState<string | null>(null);
  // Estado para los IDs de exámenes PINNEADOS (para la visualización en UI)
  const [pinnedExams, setPinnedExams] = useState<{ [examId: string]: boolean }>(
    {},
  );
  // Estado para la paginación de los NO pinneados
  const [visibleCount, setVisibleCount] = useState(6);

  // --- Handlers para la generación del examen ---

  const handleQuestionCountChange = useCallback((count: number) => {
    setQuestionCount(count);
  }, []);
  const handleFineTuningChange = useCallback((text: string) => {
    setFineTuning(text);
  }, []);

  const handleGenerateExam = async () => {
    // Validación inicial (igual que antes)
    if (Object.keys(pinnedExams).length === 0) {
      // Usar selectedExams
      alert(
        "Por favor, selecciona al menos un examen anterior y un nivel de dificultad.",
      );
      return;
    }
    setIsGenerating(true);

    // --- CONSTRUIR EL PROMPT/LLAMADA AL BACKEND ---
    // Aquí deberías decidir cómo usar los IDs de `selectedExams` para el backend.
    // Podrías enviar la lista de IDs o la lista completa de objetos examen,
    // dependiendo de cómo esté diseñado tu endpoint '/api/generate-content'.
    // Si el backend necesita los datos de los exámenes seleccionados,
    // tendrías que buscarlos en `recentExams` basándote en los `selectedExams` IDs.
    // Para este ejemplo, asumiremos que el backend puede manejar una lista de IDs.

    let promptText = `Genera un examen de ${questionCount} preguntas.\n`;
    if (fineTuning && fineTuning.trim() !== "") {
      promptText += `Instrucciones adicionales: ${fineTuning.trim()}.\n`;
    }

    console.log(
      "Prompt construido en Frontend (para generación basada en historia):",
      promptText,
    ); // Para depuración

    try {
      // Llama al backend, enviando el prompt como texto y otros parámetros relevantes
      const response = await fetch(
        `${url_backend}/api/generate-content-based-on-history`, // O la ruta adecuada para generación basada en historia
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${session && session.access_token}`,
          },
          body: JSON.stringify({
            prompt: promptText,
            // También puedes enviar otros parámetros relevantes si tu backend los usa,
            // como la lista de IDs de los exámenes base, la dificultad seleccionada, el tiempo, etc.
            // Ejemplo:
            exams_id: pinnedExams, // Enviar los IDs seleccionados
            tiempo_limite_segundos: hour * 3600 + minute * 60 + second, // Tiempo para el NUEVO examen
          }),
        },
      );

      if (!response.ok) {
        const errorDetail = await response.text(); // Intenta obtener el texto del error
        throw new Error(
          `Error al generar el examen (${response.status}): ${errorDetail || response.statusText}`,
        );
      }

      const result = await response.json(); // Espera { examId: '...' }

      if (!result.examId) {
        throw new Error(
          "La respuesta del servidor no contenía un ID de examen válido.",
        );
      }

      console.log("Nuevo examen generado y guardado con ID:", result.examId);

      navigate(`/examen/${result.examId}`); // Navega a la ruta con el ID del NUEVO examen
    } catch (error) {
      console.error("Error en la llamada de generación:", error);
      alert(
        `Error al generar examen: ${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // --- Handlers para la visualización/filtrado de exámenes recientes ---

  // Handler para PINNEAR/DESPINNEAR exámenes (clic en el icono de pin)
  const handlePinExam = useCallback((examId: string) => {
    setPinnedExams((prevPinned) => {
      const newPinned = { ...prevPinned };
      // Toggle logic
      if (newPinned[examId]) {
        delete newPinned[examId]; // Unpin
      } else {
        newPinned[examId] = true; // Pin
      }
      // TODO: Consider persisting this state (e.g., localStorage, user metadata in DB)
      // so pins aren't lost on refresh.
      return newPinned;
    });
  }, []); // Sin dependencias, solo actualiza el estado local

  const handleDeleteExam = useCallback(async (examId: string) => {
    // Podrías mostrar un indicador de carga específico para la eliminación si quieres
    // setIsLoading(true);

    try {
      // 1. Quitar el pin si está pinneado
      setPinnedExams((prevPinned) => {
        const newPinned = { ...prevPinned };
        delete newPinned[examId];
        return newPinned;
      });

      // 2. Quitar de la selección si estaba seleccionado
      setselectedExams((prevSelected) =>
        prevSelected.filter((id) => id !== examId),
      );

      // 3. Eliminar de la base de datos
      const { error: examError } = await supabase
        .from("examenes")
        .delete()
        .eq("id", examId);

      if (examError) {
        console.error("Error deleting exam:", examError);
        // Podrías revertir el estado de pin/seleccion si la eliminación falla catastróficamente
      } else {
        // 4. Eliminar del estado local si la DB tuvo éxito
        setRecentExams((prevExams) =>
          prevExams.filter((exam) => exam.id !== examId),
        );
      }
    } catch (error) {
      console.error("Error deleting exam:", error);
      // Podrías mostrar un mensaje de error al usuario
    } finally {
      // Si usaste un indicador de carga específico, restablece aquí
      // setIsLoading(false);
    }
  }, []); // Sin dependencias explícitas que afecten la lógica interna

  // Cargar exámenes recientes al inicio
  useEffect(() => {
    const fetchRecentExams = async () => {
      if (!user) {
        setRecentExams([]);
        setIsLoading(false);
        setError(null);
        return;
      }
      setIsLoading(true); // Activar carga antes de fetch
      setError(null); // Limpiar errores anteriores

      try {
        const { data, error: fetchError } = await supabase
          .from("examenes")
          .select("*")
          .eq("user_id", user.id)
          .order("fecha_inicio", { ascending: false });

        if (fetchError) {
          setError(`Error al cargar exámenes: ${fetchError.message}`);
          setRecentExams([]);
        } else {
          const formattedData = data.map((item) => ({
            ...item,
            datos: Array.isArray(item.datos) ? item.datos : [],
            // Podrías cargar el estado 'pinnedExams' aquí si lo guardaras en DB/localStorage
          }));
          setRecentExams(formattedData as ExamenData[]);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Error desconocido al cargar exámenes.",
        );
        setRecentExams([]);
      } finally {
        setIsLoading(false); // Desactivar carga al finalizar (éxito o error)
      }
    };

    fetchRecentExams();
  }, [user]); // Dependencia 'user'

  // --- Derivar estados o listas a partir de los estados principales ---
  // Usamos useMemo para optimizar la derivación de las listas pinneados/no pinneados
  const pinnedExamList = useMemo(() => {
    // Filtrar los exámenes recientes que están en el estado `pinnedExams`
    return recentExams.filter((exam) => pinnedExams[exam.id]);
  }, [recentExams, pinnedExams]); // Recalcular si cambian los exámenes recientes o el estado de pines

  const nonPinnedExamList = useMemo(() => {
    // Filtrar los exámenes recientes que NO están en el estado `pinnedExams`
    return recentExams.filter((exam) => !pinnedExams[exam.id]);
  }, [recentExams, pinnedExams]); // Recalcular si cambian los exámenes recientes o el estado de pines

  // Aplicar paginación solo a la lista de no pinneados
  const slicedNonPinnedExams = useMemo(() => {
    return nonPinnedExamList.slice(0, visibleCount);
  }, [nonPinnedExamList, visibleCount]); // Recalcular si cambian la lista no pinneada o el contador visible

  const handleLoadMore = useCallback(() => {
    setVisibleCount((prev) => prev + 6); // Carga 6 más de la lista de no pinneados
  }, []); // Sin dependencias, solo actualiza el estado local

  // Comprobación para saber si hay contenido total (pinneados o no) para mostrar secciones
  const hasExamsLoadedAndAvailable =
    !isLoading && !error && recentExams.length > 0;

  // Comprobación para deshabilitar el botón de generar
  const isGenerateDisabled =
    Object.keys(pinnedExams).length === 0 || isGenerating;

  return (
    <div
      id="new-exam-section"
      className="bg-white rounded-xl shadow-lg overflow-hidden p-6 sm:p-8 mb-8 border border-gray-200"
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-8 border-b pb-4">
        Configura tu Examen Personalizado
      </h2>
      <h3 className="text-lg font-medium text-gray-700 mb-4">
        1. Selecciona exámenes anteriores para basar tu nuevo examen
      </h3>
      {/* Sección para mostrar los exámenes recientes */}
      <div className="mb-7">
        {" "}
        {/* Margen inferior para separar de las configuraciones */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Tus exámenes recientes
          </h2>
        </div>
        {/* Mensajes de estado global de la carga de exámenes */}
        {isLoading && (
          <p className="text-gray-600 text-center col-span-full">
            Cargando exámenes...
          </p>
        )}
        {!isLoading && error && (
          <p className="text-red-600 col-span-full text-center">{error}</p>
        )}
        {/* Contenido si NO está cargando, NO hay error y SÍ hay exámenes */}
        {hasExamsLoadedAndAvailable && (
          <>
            {" "}
            {/* Usamos un fragmento para agrupar las secciones pinneados/no pinneados */}
            {/* Sección de Exámenes Fijados */}
            {pinnedExamList.length > 0 && (
              <div className="mb-8">
                {" "}
                {/* Añadir margen inferior */}
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  Exámenes Seleccionados para el analisis (
                  {pinnedExamList.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pinnedExamList.map((exam, index) => (
                    <PreviewableRecentExamCard
                      key={exam.id}
                      exam={exam}
                      onDelete={handleDeleteExam}
                      index={index} // Índice dentro de la lista de pinneados
                      isPinneable={false} // La tarjeta es fijable
                      isThisPinned={true} // La tarjeta está fijada
                      onEntireToggle={handlePinExam} // Handler para seleccionar (clic en tarjeta)
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
            {slicedNonPinnedExams.length > 0 && (
              <div className={`${pinnedExamList.length > 0 ? "" : ""} mt-6`}>
                {" "}
                {/* Margen superior condicional */}
                {/* Mostrar encabezado solo si hay pinneados arriba O si esta es la única sección de exámenes */}
                {(pinnedExamList.length > 0 || pinnedExamList.length === 0) && (
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
                      onDelete={handleDeleteExam}
                      index={index} // Índice dentro de la lista paginada de no pinneados
                      isPinneable={false} // La tarjeta es fijable
                      onEntireToggle={handlePinExam} // Handler para seleccionar (clic en tarjeta)
                    />
                  ))}
                </div>
              </div>
            )}
            {/* Mensaje si hay exámenes pero ninguno pinneado y no se muestran no pinneados */}
            {!isLoading &&
              !error &&
              recentExams.length > 0 &&
              pinnedExamList.length === 0 &&
              slicedNonPinnedExams.length === 0 &&
              visibleCount >= nonPinnedExamList.length && (
                <p className="text-gray-500 text-center mt-4">
                  No hay más exámenes recientes sin fijar para mostrar.
                </p>
              )}
            {/* Mensaje "Fija un examen" si hay exámenes totales pero ninguno pinneado */}
            {!isLoading &&
              !error &&
              recentExams.length > 0 &&
              pinnedExamList.length === 0 && (
                <p className="text-gray-500 text-center mt-4">
                  Selecciona exámenes para empezar a usarlos como base.
                </p>
              )}
          </>
        )}
        {/* Mensaje si NO está cargando, NO hay error y NO hay exámenes en total */}
        {!isLoading && !error && recentExams.length === 0 && (
          <p className="text-gray-600 col-span-full text-center mt-4">
            No tienes exámenes recientes para usar como base. Genera uno
            primero.
          </p>
        )}
        {/* Botón Cargar más */}
        {/* Mostrar si no está cargando, no hay error, y aún quedan no pinneados por mostrar */}
        {!isLoading && !error && visibleCount < nonPinnedExamList.length && (
          <div className="col-span-full flex justify-center mt-6">
            <button
              onClick={handleLoadMore}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition"
            >
              Cargar más ({Math.min(6, nonPinnedExamList.length - visibleCount)}
              )
            </button>
          </div>
        )}
      </div>{" "}
      {/* Fin de la sección de exámenes recientes */}
      {/* Otras configuraciones para el nuevo examen */}
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
      ></TimerConf>
      <Personalization
        fineTuning={fineTuning}
        onFineTuningChange={handleFineTuningChange}
      />
      <ExamButton
        onGenerateClick={handleGenerateExam}
        disabled={isGenerateDisabled}
      />
      {isGenerating && (
        <div className="mt-4 text-center text-sm text-indigo-600">
          <i className="fas fa-spinner fa-spin mr-2"></i>
          Generando tu examen... puede tardar unos minutos.
        </div>
      )}
    </div>
  );
}
