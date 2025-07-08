import { useState, useCallback, useMemo, memo } from "react";
import { ExamButton } from "../ExamButton";
import { DifficultExam } from "./DifficultExam";
// import { Materias } from "./Materias"; // Ya no necesario
import { Personalization } from "./Personalization";
import { QuestionConf } from "./QuestionConf";
import { useNavigate } from "react-router";
import { useAuthStore } from "../../stores/authStore";
import { TimerConf } from "../TimerConf";
import { url_backend } from "../../url_backend";
import { DEFAULT_EXAM_CONFIG } from "../../constants/examConstants";

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
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [hour, setHour] = useState<number>(DEFAULT_EXAM_CONFIG.TIMER_HOUR);
  const [minute, setMinute] = useState<number>(DEFAULT_EXAM_CONFIG.TIMER_MINUTE);
  const [second, setSecond] = useState<number>(DEFAULT_EXAM_CONFIG.TIMER_SECOND);
  
  // Estados para configuración de IA
  const [selectedModel, setSelectedModel] = useState<string>('gemini-1.5-flash');
  const [apiKey, setApiKey] = useState<string>('');
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

  const handleApiKeyChange = useCallback((key: string) => {
    setApiKey(key);
    // Verificación básica de API key (formato de Google API)
    const isValidFormat = key.length > 20 && key.startsWith('AIza');
    setIsApiValid(isValidFormat);
  }, []);

  // Handler principal para generar el examen
  const handleGenerateExam = async () => {
    // --- Validación Inicial con Swal ---
    if (!fineTuning.trim() || selectedDifficulty === null || !isApiValid) {
      Swal.fire({
        icon: "warning",
        title: "Configuración Incompleta",
        text: "Por favor, completa el tema del examen, selecciona la dificultad y configura una API key válida.",
        confirmButtonColor: "#3085d6", // Color azul estándar de Swal
      });
      return; // Detiene la ejecución si la validación falla
    }

    setIsGenerating(true); // Habilita el indicador de carga

    try {
      // --- Construir el PROMPT para el backend ---
      let promptText = `Genera un examen de ${questionCount} preguntas sobre el siguiente tema:\n`;
      
      // Usar fineTuning como el contenido principal del examen
      promptText += `Tema y contenido: ${fineTuning.trim()}\n`;
      promptText += `Nivel de dificultad: ${selectedDifficulty}\n`;

      // Calcular el tiempo límite total en segundos
      const tiempoLimiteSegundos = hour * 3600 + minute * 60 + second;
      // Opcionalmente, puedes añadir esto al prompt si el modelo necesita saberlo en texto
      // if (tiempoLimiteSegundos > 0) {
      //   promptText += `El examen tiene un tiempo límite de ${hour} horas, ${minute} minutos y ${second} segundos.\n`;
      // }

      // Preparar el payload
      const requestPayload = {
        prompt: promptText, // Envía el prompt de texto construido
        dificultad: selectedDifficulty, // Envía la dificultad como dato estructurado si el backend lo necesita
        tiempo_limite_segundos: tiempoLimiteSegundos, // Envía el tiempo límite
        tema_principal: fineTuning.trim(), // Envía el tema principal desde personalización
        cantidad_preguntas: questionCount, // Envía la cantidad de preguntas
        contenido_detallado: fineTuning.trim(), // Envía el contenido detallado
        // Puedes añadir más datos estructurados si tu backend los espera
      };

      // Payload preparado para el backend

      // --- Llama al backend para generar el examen ---
      const response = await fetch(
        // Asegúrate de que la URL es correcta para tu API
        `${url_backend}/api/generate-content`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Incluye el token de autorización si es necesario
            authorization: `Bearer ${session?.access_token}`, // Usa encadenamiento opcional por si session es null/undefined
          },
          // Envía los datos necesarios al backend
          body: JSON.stringify(requestPayload),
        },
      );

      // --- Manejo de la respuesta del backend ---
      if (!response.ok) {
        // Intenta leer el mensaje de error del cuerpo de la respuesta si está disponible
        const errorBody = await response.json().catch(() => null); // Intenta parsear JSON, ignora errores si no es JSON
        
        // Error del backend se manejará en el UI
        
        const errorMessage =
          errorBody?.error || errorBody?.message ||
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

      // Examen generado exitosamente

      // --- NAVEGACIÓN A LA PÁGINA DEL EXAMEN ---
      // Navega a la ruta con el ID del examen generado.
      // No se muestra un Swal de éxito aquí porque la navegación es la indicación visual de éxito.
      navigate(`/examen/${result.examId}`);
    } catch (error) {
      // Especifica 'any' o un tipo de error más específico si lo conoces
      // --- Manejo de Errores con Swal ---
      // Error en la generación del examen
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
                className="fas fa-chart-bar text-lg"
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
            <div className="space-y-6">
              {/* Model Selection */}
              <div>
                <label 
                  className="block text-sm font-medium mb-3"
                  style={{ color: 'var(--theme-text-secondary)' }}
                >
                  Modelo de IA
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.0-pro'].map((model) => (
                    <button
                      key={model}
                      onClick={() => handleModelChange(model)}
                      className={`p-3 rounded-xl border-2 text-left transition-all duration-300 ${
                        selectedModel === model ? 'ring-2 ring-offset-2' : ''
                      }`}
                      style={{
                        backgroundColor: selectedModel === model ? 'var(--primary)' : 'var(--theme-bg-secondary)',
                        borderColor: 'var(--primary)',
                        color: selectedModel === model ? 'white' : 'var(--theme-text-primary)',
                        '--tw-ring-color': 'var(--primary)'
                      } as any}
                    >
                      <div className="font-semibold text-sm">{model}</div>
                      <div className="text-xs opacity-80 mt-1">
                        {model.includes('flash') ? 'Rápido y eficiente' : 
                         model.includes('pro') ? 'Mayor capacidad' : 'Modelo estándar'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* API Key Input */}
              <div>
                <label 
                  className="block text-sm font-medium mb-3"
                  style={{ color: 'var(--theme-text-secondary)' }}
                >
                  API Key de Google
                </label>
                <div className="space-y-2">
                  <div className="relative">
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => handleApiKeyChange(e.target.value)}
                      placeholder="AIza..."
                      className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 pr-12"
                      style={{
                        backgroundColor: 'var(--theme-bg-secondary)',
                        borderColor: isApiValid ? 'var(--theme-success)' : 'var(--theme-border-primary)',
                        color: 'var(--theme-text-primary)'
                      }}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                      {apiKey && (
                        <i 
                          className={`fas ${isApiValid ? 'fa-check-circle' : 'fa-exclamation-circle'}`}
                          style={{ 
                            color: isApiValid ? 'var(--theme-success)' : 'var(--theme-error)' 
                          }}
                        />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p 
                      className="text-xs"
                      style={{ color: 'var(--theme-text-secondary)' }}
                    >
                      Obtén tu API key en Google AI Studio
                    </p>
                    <a
                      href="https://youtu.be/RVGbLSVFtIk?si=svQg0FVLtHrFYcap&t=21"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-xs px-2 py-1 rounded-lg transition-all duration-200 hover:scale-105"
                      style={{
                        backgroundColor: 'var(--theme-info-light)',
                        color: 'var(--theme-info-dark)',
                        textDecoration: 'none'
                      }}
                    >
                      <i className="fab fa-youtube"></i>
                      <span>Ver tutorial</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
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
                  <span className="font-semibold">Generando examen con IA...</span>
                </div>
                <p 
                  className="text-sm"
                  style={{ color: 'var(--theme-text-secondary)' }}
                >
                  Esto puede tardar unos momentos
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
