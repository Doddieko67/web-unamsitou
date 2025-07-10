import { useState, useCallback, useMemo, memo } from "react";
import { DifficultExam } from "./DifficultExam";
// import { Materias } from "./Materias"; // Ya no necesario
import { Personalization } from "./Personalization";
import { QuestionConf } from "./QuestionConf";
import { useNavigate } from "react-router";
import { useAuthStore } from "../../stores/authStore";
import { TimerConf } from "../TimerConf";
import { url_backend } from "../../url_backend";
import { DEFAULT_EXAM_CONFIG } from "../../constants/examConstants";
import { DEFAULT_MODEL } from "../../constants/geminiModels";
import { AIConfiguration } from "../shared/AIConfiguration";
import { useExamGeneration } from "../../hooks/useCancellableRequest";
import { ExamGenerationLoading } from "../shared/LoadingWithCancel";

// Importar SweetAlert2
import Swal from "sweetalert2";

// Tipos
type Difficulty = "easy" | "medium" | "hard" | "mixed";

export const ExamConf = memo(function ExamConf() {
  const { session } = useAuthStore(); // Usar el store de Zustand
  const navigate = useNavigate();

  // --- Estados ---
  // Solo necesitamos el contenido de personalización ahora
  const [questionCount, setQuestionCount] = useState<number>(DEFAULT_EXAM_CONFIG.QUESTION_COUNT);
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<Difficulty | null>(null);
  const [fineTuning, setFineTuning] = useState<string>(DEFAULT_EXAM_CONFIG.FINE_TUNING);
  // Hook para manejo de cancelación
  const { isLoading: isGenerating, cancelRequest, executeWithCancellation } = useExamGeneration();
  const [hour, setHour] = useState<number>(DEFAULT_EXAM_CONFIG.TIMER_HOUR);
  const [minute, setMinute] = useState<number>(DEFAULT_EXAM_CONFIG.TIMER_MINUTE);
  const [second, setSecond] = useState<number>(DEFAULT_EXAM_CONFIG.TIMER_SECOND);
  
  // Estados para configuración de IA
  const [selectedModel, setSelectedModel] = useState<string>(DEFAULT_MODEL);
  const [isApiValid, setIsApiValid] = useState<boolean>(false);

  // --- Handlers ---

  const handleQuestionCountChange = useCallback((count: number) => {
    setQuestionCount(count);
  }, []);

  const handleDifficultySelect = useCallback((difficulty: Difficulty) => {
    setSelectedDifficulty(difficulty);
  }, []);

  const handleFineTuningChange = useCallback((text: string) => {
    setFineTuning(text);
  }, []);

  const handleModelChange = useCallback((model: string) => {
    setSelectedModel(model);
  }, []);

  const handleApiValidChange = useCallback((isValid: boolean) => {
    setIsApiValid(isValid);
  }, []);




  // Handler principal para generar el examen
  const handleGenerateExam = async () => {
    // --- Validación Inicial con Swal ---
    if (!fineTuning.trim() || selectedDifficulty === null || !isApiValid) {
      let errorMessage = "Por favor, completa: ";
      const missing = [];
      
      if (!fineTuning.trim()) missing.push("tema del examen");
      if (selectedDifficulty === null) missing.push("dificultad");
      if (!isApiValid) missing.push("API key válida");
      
      errorMessage += missing.join(", ");
      
      Swal.fire({
        icon: "warning",
        title: "Configuración Incompleta",
        text: errorMessage,
        confirmButtonColor: "#3085d6",
      });
      return;
    }
    
    // --- Validación adicional para evitar error 400 ---
    if (selectedDifficulty === null) {
      Swal.fire({
        icon: "error",
        title: "Error de Validación",
        text: "La dificultad no puede estar vacía. Selecciona una dificultad.",
        confirmButtonColor: "#d33",
      });
      return;
    }

    // Usar el hook para ejecutar la solicitud con cancelación
    const result = await executeWithCancellation(async (signal) => {
      // --- Construir el PROMPT para el backend ---
      let promptText = `Genera un examen de ${questionCount} preguntas sobre el siguiente tema:\n`;
      
      // Usar fineTuning como el contenido principal del examen
      promptText += `Tema y contenido: ${fineTuning.trim()}\n`;
      promptText += `Nivel de dificultad: ${selectedDifficulty}\n`;

      // Calcular el tiempo límite total en segundos
      const tiempoLimiteSegundos = hour * 3600 + minute * 60 + second;

      // Preparar el payload que coincida exactamente con el backend
      const requestPayload = {
        prompt: promptText, // REQUERIDO: prompt de texto construido
        dificultad: selectedDifficulty, // REQUERIDO: debe ser string, no null
        tiempo_limite_segundos: tiempoLimiteSegundos, // REQUERIDO: tiempo límite en segundos
        modelo: selectedModel, // OPCIONAL: modelo seleccionado
      };

      // --- Llama al backend para generar el examen ---
      const response = await fetch(
        `${url_backend}/api/generate-content`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify(requestPayload),
          signal, // Usar el signal del hook
        },
      );

      // --- Manejo de la respuesta del backend ---
      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        
        if (response.status === 400) {
          console.error('Error 400 - Datos enviados:', requestPayload);
          console.error('Error 400 - Respuesta del servidor:', errorBody);
        }
        
        const errorMessage =
          errorBody?.error || errorBody?.message ||
          `Error del servidor: ${response.status} ${response.statusText}`;
        throw new Error(errorMessage);
      }

      const responseData = await response.json();

      // Verifica si la respuesta contiene el ID del examen
      if (!responseData || !responseData.examId) {
        throw new Error(
          "La respuesta del servidor no contenía un ID de examen válido.",
        );
      }

      return responseData;
    });

    // Si la solicitud fue cancelada, result será null
    if (result) {
      // --- NAVEGACIÓN A LA PÁGINA DEL EXAMEN ---
      navigate(`/examen/${result.examId}`);
    }
  };

  // Determina si el botón de generar debe estar deshabilitado (memoizado)
  const isGenerateDisabled = useMemo(() => 
    !fineTuning.trim() ||
    selectedDifficulty === null ||
    !isApiValid ||
    isGenerating,
    [fineTuning, selectedDifficulty, isApiValid, isGenerating]
  );

  return (
    <div id="new-exam-section" className="exam-config-grid">
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
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <i className="fas fa-magic text-2xl text-white"></i>
            </div>
            <div className="header-text">
              <h1 
                className="header-title"
                style={{ color: 'var(--theme-text-primary)' }}
              >
                Crear Examen Inteligente
              </h1>
              <p 
                className="header-subtitle"
                style={{ color: 'var(--theme-text-secondary)' }}
              >
                Configura tu examen personalizado con IA
              </p>
            </div>
          </div>
          
        </div>
      </div>

      {/* Subjects Grid Area - TEMPORARILY DISABLED */}
      {/* 
      <div className="grid-subjects">
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
                className="fas fa-book text-lg"
                style={{ color: 'var(--theme-info)' }}
              ></i>
            </div>
            <div className="card-header-text">
              <h3 
                className="card-title"
                style={{ color: 'var(--theme-text-primary)' }}
              >
                📚 Materias del Examen
              </h3>
              <p 
                className="card-subtitle"
                style={{ color: 'var(--theme-text-secondary)' }}
              >
                Configura las materias para tu examen
              </p>
            </div>
          </div>
          <div className="card-content">
            <Materias
              availableSubjects={availableSubjects}
              selectedSubjects={selectedSubjects}
              onSubjectToggle={handleSubjectToggle}
              onAddCustomSubject={handleAddCustomSubject}
            />
          </div>
        </div>
      </div>
      */}

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
                Cantidad y dificultad
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

      {/* Difficulty Grid Area */}
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
                className="fas fa-cog text-lg"
                style={{ color: 'var(--theme-warning)' }}
              ></i>
            </div>
            <div className="card-header-text">
              <h3 
                className="card-title"
                style={{ color: 'var(--theme-text-primary)' }}
              >
                📊 Dificultad
              </h3>
              <p 
                className="card-subtitle"
                style={{ color: 'var(--theme-text-secondary)' }}
              >
                Nivel del examen
              </p>
            </div>
          </div>
          <div className="card-content">
            <DifficultExam
              selectedDifficulty={selectedDifficulty}
              onDifficultySelect={handleDifficultySelect}
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
                Duración límite
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
      <div className="grid-personalization">
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
                className="fas fa-paintbrush text-lg"
                style={{ color: 'var(--theme-info)' }}
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
                Define el tema y contenido del examen
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
              onModelChange={handleModelChange}
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
              <ExamGenerationLoading onCancel={cancelRequest} />
            ) : (
              <div className="space-y-6 text-center">
                {/* Configuration Summary */}
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
                        backgroundColor: fineTuning.trim().length > 0 ? 'var(--theme-success-light)' : 'var(--theme-bg-secondary)',
                        borderColor: fineTuning.trim().length > 0 ? 'var(--theme-success)' : 'var(--theme-border-primary)',
                        color: fineTuning.trim().length > 0 ? 'var(--theme-success-dark)' : 'var(--theme-text-secondary)'
                      }}
                    >
                      <div className="text-lg font-bold">
                        {fineTuning.trim().length > 0 ? '✓' : '✗'}
                      </div>
                      <div className="text-xs opacity-80">Tema</div>
                    </div>
                    
                    <div 
                      className="p-3 rounded-xl border text-center transition-all duration-300"
                      style={{
                        backgroundColor: selectedDifficulty ? 'var(--theme-warning-light)' : 'var(--theme-bg-secondary)',
                        borderColor: selectedDifficulty ? 'var(--theme-warning)' : 'var(--theme-border-primary)',
                        color: selectedDifficulty ? 'var(--theme-warning-dark)' : 'var(--theme-text-secondary)'
                      }}
                    >
                      <div className="text-xs font-bold">
                        {selectedDifficulty ? selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1) : 'No sel.'}
                      </div>
                      <div className="text-xs opacity-80">Dificultad</div>
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
                        backgroundColor: 'var(--theme-info-light)',
                        borderColor: 'var(--theme-info)',
                        color: 'var(--theme-info-dark)'
                      }}
                    >
                      <div className="text-lg font-bold">{questionCount}</div>
                      <div className="text-xs opacity-80">Preguntas</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3 mt-3">
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
                      backgroundColor: isGenerateDisabled ? 'var(--theme-text-tertiary)' : 'var(--primary)',
                      color: 'white',
                      opacity: isGenerateDisabled ? 0.5 : 1,
                      boxShadow: isGenerateDisabled ? 'none' : 'var(--theme-shadow-lg)'
                    }}
                  >
                    <i className="fas fa-magic text-xl"></i>
                    <span>Generar Examen</span>
                  </button>
                  
                  {isGenerateDisabled && (
                    <p 
                      className="text-xs opacity-80"
                      style={{ color: 'var(--theme-text-secondary)' }}
                    >
                      Completa el tema y selecciona la dificultad
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
