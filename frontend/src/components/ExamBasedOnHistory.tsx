import { useState, useCallback, useEffect, useMemo, memo } from "react";
import { Personalization } from "./Main/Personalization";
import { QuestionConf } from "./Main/QuestionConf";
import { useNavigate } from "react-router";
import { useAuthStore } from "../stores/authStore";
import { TimerConf } from "./TimerConf";
import { PreviewableRecentExamCard } from "./Main/PreviewableExamRecents";
import { supabase } from "../supabase.config";
import { ExamenData } from "./Main/interfacesExam";
import Swal from "sweetalert2";
import { url_backend } from "../url_backend";
import { DEFAULT_EXAM_CONFIG } from "../constants/examConstants";
import { AIConfiguration } from "./shared/AIConfiguration";
import { DEFAULT_MODEL } from "../constants/geminiModels";

export const ExamBasedOnHistory = memo(function ExamBasedOnHistory() {
  const { session } = useAuthStore();
  const navigate = useNavigate();
  const { user } = useAuthStore(); // Obtener el usuario

  // --- Estados para la generación del examen ---
  // Estado para los IDs de exámenes SELECCIONADOS para generar el nuevo examen
  const [, setselectedExams] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState<number>(DEFAULT_EXAM_CONFIG.QUESTION_COUNT);
  const [fineTuning, setFineTuning] = useState<string>(DEFAULT_EXAM_CONFIG.FINE_TUNING);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [hour, setHour] = useState<number>(DEFAULT_EXAM_CONFIG.TIMER_HOUR);
  const [minute, setMinute] = useState<number>(DEFAULT_EXAM_CONFIG.TIMER_MINUTE);
  const [second, setSecond] = useState<number>(DEFAULT_EXAM_CONFIG.TIMER_SECOND);

  // Estados para configuración de IA
  const [selectedModel, setSelectedModel] = useState<string>(DEFAULT_MODEL);
  const [isApiValid, setIsApiValid] = useState<boolean>(false);

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

  const handleApiValidChange = useCallback((isValid: boolean) => {
    setIsApiValid(isValid);
  }, []);

  const handleGenerateExam = async () => {
    // Validación inicial
    if (Object.keys(pinnedExams).length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Selección Incompleta',
        text: 'Por favor, selecciona al menos un examen anterior como base.',
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    if (!isApiValid) {
      Swal.fire({
        icon: 'warning',
        title: 'API Key Requerida',
        text: 'Por favor, configura una API key válida de Google.',
        confirmButtonColor: '#3085d6',
      });
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

    // Prompt construido para generación basada en historia

    try {
      // Llama al backend, enviando el prompt como texto y otros parámetros relevantes
      const response = await fetch(
        `${url_backend}/api/generate-content-based-on-history`, // O la ruta adecuada para generación basada en historia
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            prompt: promptText,
            model: selectedModel,
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

      // Nuevo examen generado exitosamente

      navigate(`/examen/${result.examId}`); // Navega a la ruta con el ID del NUEVO examen
    } catch (error) {
      // Error en la generación del examen
      Swal.fire({
        icon: 'error',
        title: 'Error al generar examen',
        text: `Error: ${error instanceof Error ? error.message : String(error)}`,
      });
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
        // Error eliminando examen de la base de datos
        // Podrías revertir el estado de pin/seleccion si la eliminación falla catastróficamente
      } else {
        // 4. Eliminar del estado local si la DB tuvo éxito
        setRecentExams((prevExams) =>
          prevExams.filter((exam) => exam.id !== examId),
        );
      }
    } catch (error) {
      // Error eliminando examen
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

  // Comprobación para deshabilitar el botón de generar (memoizado)
  const isGenerateDisabled = useMemo(() =>
    Object.keys(pinnedExams).length === 0 ||
    !isApiValid ||
    isGenerating,
    [pinnedExams, isApiValid, isGenerating]
  );

  return (
    <div id="history-exam-section" className="exam-config-grid">
      {/* Header Grid Area */}
      <div className="grid-header">
        <div 
          className="exam-header-card"
          style={{
            background: 'linear-gradient(135deg, var(--theme-bg-primary) 0%, var(--theme-bg-accent) 50%, var(--theme-bg-primary) 100%)',
            borderColor: 'var(--theme-border-primary)'
          }}
        >
          <div className="header-content">
            <div 
              className="header-icon"
              style={{ backgroundColor: 'var(--terciary)' }}
            >
              <i className="fas fa-history text-2xl text-white"></i>
            </div>
            <div className="header-text">
              <h1 
                className="header-title"
                style={{ color: 'var(--theme-text-primary)' }}
              >
                Generar desde Historial
              </h1>
              <p 
                className="header-subtitle"
                style={{ color: 'var(--theme-text-secondary)' }}
              >
                Crea nuevos exámenes basados en exámenes anteriores
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* History Selection Grid Area */}
      <div className="col-span-full grid-personalization">
        <div 
          className="config-card"
          style={{
            backgroundColor: 'var(--theme-bg-primary)',
            borderColor: 'var(--theme-border-primary)',
            boxShadow: 'var(--theme-shadow-md)'
          }}
        >
          <div className="card-header">
            <div 
              className="card-icon"
              style={{ backgroundColor: 'var(--theme-info-light)' }}
            >
              <i 
                className="fas fa-archive text-lg"
                style={{ color: 'var(--theme-info)' }}
              ></i>
            </div>
            <div className="card-header-text">
              <h3 
                className="card-title"
                style={{ color: 'var(--theme-text-primary)' }}
              >
                📚 Seleccionar Exámenes Base
              </h3>
              <p 
                className="card-subtitle"
                style={{ color: 'var(--theme-text-secondary)' }}
              >
                {isLoading ? 'Cargando...' : `${recentExams.length} examen${recentExams.length !== 1 ? 'es' : ''} disponible${recentExams.length !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
          
          <div className="card-content">
            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ color: 'var(--primary)' }}></div>
                <p style={{ color: 'var(--theme-text-secondary)' }}>Cargando exámenes...</p>
              </div>
            )}

            {/* Error State */}
            {!isLoading && error && (
              <div className="text-center py-8">
                <i className="fas fa-exclamation-circle text-4xl mb-4" style={{ color: 'var(--theme-error)' }}></i>
                <p style={{ color: 'var(--theme-error)' }}>{error}</p>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && recentExams.length === 0 && (
              <div className="text-center py-8">
                <i className="fas fa-inbox text-4xl mb-4" style={{ color: 'var(--theme-text-secondary)' }}></i>
                <p style={{ color: 'var(--theme-text-secondary)' }}>
                  No tienes exámenes recientes. Genera uno primero.
                </p>
              </div>
            )}

            {/* Content */}
            {hasExamsLoadedAndAvailable && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column: Available Exams */}
                <div>
                  <h4 
                    className="font-semibold mb-4"
                    style={{ color: 'var(--theme-text-primary)' }}
                  >
                    📋 Otros Disponibles ({nonPinnedExamList.length})
                  </h4>
                  
                  {slicedNonPinnedExams.length > 0 ? (
                    <>
                      <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                        {slicedNonPinnedExams.map((exam, index) => (
                          <PreviewableRecentExamCard
                            key={exam.id}
                            exam={exam}
                            onDelete={handleDeleteExam}
                            index={index}
                            isPinneable={false}
                            onEntireToggle={handlePinExam}
                          />
                        ))}
                      </div>
                      
                      {/* Load More Button */}
                      {visibleCount < nonPinnedExamList.length && (
                        <div className="text-center mt-4">
                          <button
                            onClick={handleLoadMore}
                            className="px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105"
                            style={{
                              backgroundColor: 'var(--theme-info-light)',
                              color: 'var(--theme-info-dark)',
                              border: `1px solid var(--theme-info)`
                            }}
                          >
                            Cargar más ({Math.min(6, nonPinnedExamList.length - visibleCount)})
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div 
                      className="text-center py-8 rounded-xl border-2 border-dashed"
                      style={{
                        borderColor: 'var(--theme-border-secondary)',
                        backgroundColor: 'var(--theme-bg-secondary)'
                      }}
                    >
                      <i className="fas fa-inbox text-2xl mb-2" style={{ color: 'var(--theme-text-secondary)' }}></i>
                      <p className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
                        Todos los exámenes están seleccionados
                      </p>
                    </div>
                  )}
                </div>

                {/* Right Column: Selected Exams */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 
                      className="font-semibold"
                      style={{ color: 'var(--theme-text-primary)' }}
                    >
                      ✅ Seleccionados ({pinnedExamList.length})
                    </h4>
                    {pinnedExamList.length > 0 && (
                      <div 
                        className="px-3 py-1 rounded-lg text-xs font-medium"
                        style={{
                          backgroundColor: 'var(--theme-success-light)',
                          color: 'var(--theme-success-dark)'
                        }}
                      >
                        Listos para usar
                      </div>
                    )}
                  </div>
                  
                  {pinnedExamList.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                      {pinnedExamList.map((exam, index) => (
                        <PreviewableRecentExamCard
                          key={exam.id}
                          exam={exam}
                          onDelete={handleDeleteExam}
                          index={index}
                          isPinneable={false}
                          isThisPinned={true}
                          onEntireToggle={handlePinExam}
                        />
                      ))}
                    </div>
                  ) : (
                    <div 
                      className="text-center py-8 rounded-xl border-2 border-dashed"
                      style={{
                        borderColor: 'var(--theme-border-secondary)',
                        backgroundColor: 'var(--theme-bg-secondary)'
                      }}
                    >
                      <i className="fas fa-hand-point-up text-2xl mb-2" style={{ color: 'var(--theme-text-secondary)' }}></i>
                      <p className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
                        Haz clic en los exámenes para seleccionarlos como base
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Questions Grid Area */}
      <div className="grid-questions">
        <div 
          className="config-card"
          style={{
            backgroundColor: 'var(--theme-bg-primary)',
            borderColor: 'var(--theme-border-primary)',
            boxShadow: 'var(--theme-shadow-md)'
          }}
        >
          <div className="card-header">
            <div 
              className="card-icon"
              style={{ backgroundColor: 'var(--theme-success-light)' }}
            >
              <i 
                className="fas fa-question-circle text-lg"
                style={{ color: 'var(--theme-success)' }}
              ></i>
            </div>
            <div className="card-header-text">
              <h3 
                className="card-title"
                style={{ color: 'var(--theme-text-primary)' }}
              >
                🔢 Preguntas
              </h3>
              <p 
                className="card-subtitle"
                style={{ color: 'var(--theme-text-secondary)' }}
              >
                Cantidad para el nuevo examen
              </p>
            </div>
          </div>
          <div className="card-content">
            <QuestionConf
              questionCount={questionCount}
              onQuestionCountChange={handleQuestionCountChange}
            />
          </div>
        </div>
      </div>

      {/* Timer Grid Area */}
      <div className="grid-timer">
        <div 
          className="config-card"
          style={{
            backgroundColor: 'var(--theme-bg-primary)',
            borderColor: 'var(--theme-border-primary)',
            boxShadow: 'var(--theme-shadow-md)'
          }}
        >
          <div className="card-header">
            <div 
              className="card-icon"
              style={{ backgroundColor: 'var(--theme-error-light)' }}
            >
              <i 
                className="fas fa-clock text-lg"
                style={{ color: 'var(--theme-error)' }}
              ></i>
            </div>
            <div className="card-header-text">
              <h3 
                className="card-title"
                style={{ color: 'var(--theme-text-primary)' }}
              >
                ⏱️ Tiempo
              </h3>
              <p 
                className="card-subtitle"
                style={{ color: 'var(--theme-text-secondary)' }}
              >
                Duración límite del examen
              </p>
            </div>
          </div>
          <div className="card-content">
            <TimerConf
              hour={hour}
              setHour={setHour}
              minute={minute}
              setMinute={setMinute}
              second={second}
              setSecond={setSecond}
            />
          </div>
        </div>
      </div>

      {/* Personalization Grid Area */}
      <div className="grid-difficulty">
        <div 
          className="config-card"
          style={{
            backgroundColor: 'var(--theme-bg-primary)',
            borderColor: 'var(--theme-border-primary)',
            boxShadow: 'var(--theme-shadow-md)'
          }}
        >
          <div className="card-header">
            <div 
              className="card-icon"
              style={{ backgroundColor: 'var(--theme-warning-light)' }}
            >
              <i 
                className="fas fa-paintbrush text-lg"
                style={{ color: 'var(--theme-warning)' }}
              ></i>
            </div>
            <div className="card-header-text">
              <h3 
                className="card-title"
                style={{ color: 'var(--theme-text-primary)' }}
              >
                🎨 Personalización
              </h3>
              <p 
                className="card-subtitle"
                style={{ color: 'var(--theme-text-secondary)' }}
              >
                Ajustes adicionales del examen
              </p>
            </div>
          </div>
          <div className="card-content">
            <Personalization
              fineTuning={fineTuning}
              onFineTuningChange={handleFineTuningChange}
            />
          </div>
        </div>
      </div>

      {/* AI Configuration Grid Area */}
      <div className="grid-ai-config">
        <div 
          className="config-card"
          style={{
            backgroundColor: 'var(--theme-bg-primary)',
            borderColor: 'var(--theme-border-primary)',
            boxShadow: 'var(--theme-shadow-md)'
          }}
        >
          <div className="card-header">
            <div 
              className="card-icon"
              style={{ backgroundColor: 'var(--theme-info-light)' }}
            >
              <i 
                className="fas fa-robot text-lg"
                style={{ color: 'var(--theme-info)' }}
              ></i>
            </div>
            <div className="card-header-text">
              <h3 
                className="card-title"
                style={{ color: 'var(--theme-text-primary)' }}
              >
                🤖 Configuración de IA
              </h3>
              <p 
                className="card-subtitle"
                style={{ color: 'var(--theme-text-secondary)' }}
              >
                Modelo y API de Gemini
              </p>
            </div>
          </div>
          
          <div className="card-content">
            <AIConfiguration
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
              isApiValid={isApiValid}
              onApiValidChange={handleApiValidChange}
            />
          </div>
        </div>
      </div>

      {/* Generate Button Grid Area */}
      <div className="grid-generate">
        <div className="flex items-center justify-center h-full">
          <div 
            className="w-full max-w-md mx-auto"
            style={{
              padding: '2rem',
              borderRadius: '1.5rem',
              border: '2px dashed',
              borderColor: isGenerateDisabled ? 'var(--theme-border-primary)' : 'var(--primary)',
              backgroundColor: isGenerateDisabled ? 'var(--theme-bg-secondary)' : 'var(--theme-bg-primary)',
              transition: 'all 0.3s ease'
            }}
          >
            {isGenerating ? (
              <div className="space-y-4 text-center">
                <div 
                  className="inline-flex items-center space-x-3 px-6 py-4 rounded-2xl border-2"
                  style={{
                    backgroundColor: 'var(--theme-info-light)',
                    borderColor: 'var(--theme-info)',
                    color: 'var(--theme-info-dark)'
                  }}
                >
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  <span className="font-semibold">Generando examen...</span>
                </div>
                <p 
                  className="text-sm"
                  style={{ color: 'var(--theme-text-secondary)' }}
                >
                  Analizando exámenes base con IA
                </p>
              </div>
            ) : (
              <div className="space-y-6 text-center">
                {/* Statistics Summary */}
                <div className="space-y-4">
                  <h4 
                    className="text-lg font-bold"
                    style={{ color: 'var(--theme-text-primary)' }}
                  >
                    📊 Resumen de Configuración
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div 
                      className="p-3 rounded-xl border text-center transition-all duration-300"
                      style={{
                        backgroundColor: Object.keys(pinnedExams).length > 0 ? 'var(--theme-success-light)' : 'var(--theme-bg-secondary)',
                        borderColor: Object.keys(pinnedExams).length > 0 ? 'var(--theme-success)' : 'var(--theme-border-primary)',
                        color: Object.keys(pinnedExams).length > 0 ? 'var(--theme-success-dark)' : 'var(--theme-text-secondary)'
                      }}
                    >
                      <div className="text-lg font-bold">
                        {Object.keys(pinnedExams).length || '0'}
                      </div>
                      <div className="text-xs opacity-80">Base</div>
                    </div>
                    
                    <div 
                      className="p-3 rounded-xl border text-center transition-all duration-300"
                      style={{
                        backgroundColor: 'var(--theme-info-light)',
                        borderColor: 'var(--theme-info)',
                        color: 'var(--theme-info-dark)'
                      }}
                    >
                      <div className="text-lg font-bold">{questionCount}</div>
                      <div className="text-xs opacity-80">Preguntas</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div 
                      className="p-3 rounded-xl border text-center transition-all duration-300"
                      style={{
                        backgroundColor: isApiValid ? 'var(--theme-success-light)' : 'var(--theme-bg-secondary)',
                        borderColor: isApiValid ? 'var(--theme-success)' : 'var(--theme-border-primary)',
                        color: isApiValid ? 'var(--theme-success-dark)' : 'var(--theme-text-secondary)'
                      }}
                    >
                      <div className="text-lg font-bold">
                        {isApiValid ? '✓' : '✗'}
                      </div>
                      <div className="text-xs opacity-80">API</div>
                    </div>
                    
                    <div 
                      className="p-3 rounded-xl border text-center transition-all duration-300"
                      style={{
                        backgroundColor: 'var(--theme-error-light)',
                        borderColor: 'var(--theme-error)',
                        color: 'var(--theme-error-dark)'
                      }}
                    >
                      <div className="text-xs font-bold">
                        {hour > 0 ? `${hour}h` : ''} {minute > 0 ? `${minute}m` : ''} {second > 0 ? `${second}s` : ''}
                      </div>
                      <div className="text-xs opacity-80">Tiempo</div>
                    </div>
                  </div>
                </div>
                
                {/* Generate Button */}
                <div className="space-y-3">
                  <button
                    onClick={handleGenerateExam}
                    disabled={isGenerateDisabled}
                    className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center space-x-3 ${
                      isGenerateDisabled ? 'cursor-not-allowed' : 'hover:scale-105 hover:shadow-lg'
                    }`}
                    style={{
                      backgroundColor: isGenerateDisabled ? 'var(--theme-text-tertiary)' : 'var(--terciary)',
                      color: 'white',
                      opacity: isGenerateDisabled ? 0.5 : 1,
                      boxShadow: isGenerateDisabled ? 'none' : 'var(--theme-shadow-lg)'
                    }}
                  >
                    <i className="fas fa-history text-xl"></i>
                    <span>Generar desde Historial</span>
                  </button>
                  
                  {isGenerateDisabled && (
                    <p 
                      className="text-xs opacity-80"
                      style={{ color: 'var(--theme-text-secondary)' }}
                    >
                      Selecciona exámenes base y configura la API
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
