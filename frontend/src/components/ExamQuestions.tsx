import React, { useState, useCallback, DragEvent, useMemo, memo } from "react";
import { Personalization } from "./Main/Personalization";
import { useAuthStore } from "../stores/authStore";
import { useNavigate } from "react-router";
import Swal from "sweetalert2";
import { TimerConf } from "./TimerConf";
import { url_backend } from "../url_backend";
import { DEFAULT_EXAM_CONFIG } from "../constants/examConstants";
import { AIConfiguration } from "./shared/AIConfiguration";
import { DEFAULT_MODEL } from "../constants/geminiModels";

// Tipo para la dificultad (puede ser null si quieres un estado inicial sin selección)
// type GeneralDifficulty = "mixed" | "easy" | "medium" | "hard";

export const ExamQuestions = memo(function ExamQuestions() {
  // --- Estados del Componente ---
  const navigate = useNavigate();
  const [pastedText, setPastedText] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);
  const [fineTuning, setFineTuning] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);
  const { session } = useAuthStore();
  const [hour, setHour] = useState<number>(DEFAULT_EXAM_CONFIG.TIMER_HOUR);
  const [minute, setMinute] = useState<number>(DEFAULT_EXAM_CONFIG.TIMER_MINUTE);
  const [second, setSecond] = useState<number>(DEFAULT_EXAM_CONFIG.TIMER_SECOND);

  // Estados para configuración de IA
  const [selectedModel, setSelectedModel] = useState<string>(DEFAULT_MODEL);
  const [isApiValid, setIsApiValid] = useState<boolean>(false);

  // --- Handlers ---
  const handleDeleteFile = (indexToDelete: number) => {
    const updatedFiles = files.filter((_, index) => index !== indexToDelete);
    setFiles(updatedFiles);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const newFiles: FileList = event.target.files;
      setFiles((prevFiles) => {
        // Convert new files to array
        const newFilesArray: File[] = Array.from(newFiles);
        if (prevFiles) {
          return [...prevFiles, ...newFilesArray];
        } else {
          return newFilesArray;
        }
      });
    }
  };
  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    /* ... (sin cambios) ... */
    setPastedText(event.target.value);
  };

  // --- Handlers para Drag and Drop (sin cambios) ---
  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    /* ... */
    event.preventDefault();
    setIsDraggingOver(true);
  }, []);
  const handleDragLeave = useCallback((event: DragEvent<HTMLDivElement>) => {
    /* ... */
    event.preventDefault();
    setIsDraggingOver(false);
  }, []);
  const handleDrop = useCallback((event: DragEvent<HTMLDivElement>) => {
    /* ... */
    event.preventDefault();
    setIsDraggingOver(false);
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      const newFiles: FileList = event.dataTransfer.files;
      setFiles((prevFiles) => {
        // Convert new files to array
        const newFilesArray: File[] = Array.from(newFiles);
        if (prevFiles) {
          return [...prevFiles, ...newFilesArray];
        } else {
          return newFilesArray;
        }
      });
      // Archivos soltados procesados
    }
  }, []);

  const handleFineTuningChange = useCallback((text: string) => {
    setFineTuning(text);
  }, []);

  const handleApiValidChange = useCallback((isValid: boolean) => {
    setIsApiValid(isValid);
  }, []);

  // --- Handler para el botón de Generar (Actualizado) ---
  const handleGenerate = async () => {
    if (files.length == 0 && !pastedText.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Contenido Incompleto",
        text: "Por favor, selecciona archivos o pega texto para generar el examen.",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    if (!isApiValid) {
      Swal.fire({
        icon: "warning",
        title: "API Key Requerida",
        text: "Por favor, configura una API key válida de Google.",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    setIsLoading(true);

    let requestBody: FormData | null = null;

    let promptText = ``;
    if (pastedText && pastedText.trim() !== "") {
      promptText += `Contenido: ${pastedText}.\n`;
    }
    if (fineTuning && fineTuning.trim() !== "") {
      promptText += `Instrucciones adicionales: ${fineTuning.trim()}.\n`;
    }

    if (files.length > 0) {
      // Preparando FormData para archivos
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("fuentes", files[i]);
      }

      formData.append("prompt", promptText);
      formData.append(
        "tiempo_limite_segundos",
        (hour * 3600 + minute * 60 + second).toString(),
      );
      formData.append("model", selectedModel);
      requestBody = formData;
      // FormData preparado
    }
    // Preparando JSON para texto

    try {
      const response = await fetch(`${url_backend}/api/upload_files`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${session?.access_token}`,
        },
        body: requestBody,
      });

      if (!response.ok) {
        let errorMsg = `Error del servidor: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorData.message || errorMsg;
        } catch (jsonError) {
          // Error procesando respuesta JSON
          Swal.fire({
            icon: "error",
            title: "Error del servidor interno",
          });
        }
        throw new Error(errorMsg);
      }
      const result = await response.json();
      // Respuesta de generación desde contenido procesada

      if (!result.examId) {
        Swal.fire({
          icon: "error",
          title: "La respuesta del servidor no contenia un ID de examen valido",
        });
        throw new Error(
          "La respuesta del servidor no contenía un ID de examen válido.",
        );
      }

      // Examen generado exitosamente

      // --- NAVEGACIÓN CON ID ---
      navigate(`/examen/${result.examId}`); // Navega a la ruta con el ID del examen
    } catch (error) {
      // Error al generar desde contenido
      Swal.fire({
        icon: 'error',
        title: 'Error al generar examen',
        text: `Error: ${error}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  type FileTypeIcons = {
    [key: string]: string; // string key and string value
  };

  const fileTypeIcons: FileTypeIcons = {
    "application/pdf": "fa-file-pdf bg-red-100 text-red-600",
    "image/": "fa-image bg-blue-100 text-blue-600",
    "video/": "fa-video bg-green-100 text-green-600",
  };

  // Function to determine the appropriate icon class based on file type
  function getFileIconClass(fileType: string): string {
    for (const typePattern in fileTypeIcons) {
      if (fileType.startsWith(typePattern)) {
        return fileTypeIcons[typePattern];
      }
    }
    // Default icon if no match is found:
    return "fa-file bg-gray-200 text-gray-600"; // Or some other default
  }

  // Determina si el botón de generar debe estar deshabilitado (memoizado)
  const isGenerateDisabled = useMemo(() => 
    (files.length == 0 && !pastedText.trim()) ||
    !isApiValid ||
    isLoading,
    [files.length, pastedText, isApiValid, isLoading]
  );

  return (
    <div id="upload-exam-section" className="exam-config-grid">
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
              style={{ backgroundColor: 'var(--secondary)' }}
            >
              <i className="fas fa-file-upload text-2xl text-white"></i>
            </div>
            <div className="header-text">
              <h1 
                className="header-title"
                style={{ color: 'var(--theme-text-primary)' }}
              >
                Subir y Procesar Contenido
              </h1>
              <p 
                className="header-subtitle"
                style={{ color: 'var(--theme-text-secondary)' }}
              >
                Genera exámenes desde archivos PDF, imágenes o texto
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* File Upload Grid Area - Spans full width */}
      <div className="col-span-full">
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
                className="fas fa-cloud-upload-alt text-lg"
                style={{ color: 'var(--theme-success)' }}
              ></i>
            </div>
            <div className="card-header-text">
              <h3 
                className="card-title"
                style={{ color: 'var(--theme-text-primary)' }}
              >
                📁 Agregar Contenido de Estudio
              </h3>
              <p 
                className="card-subtitle"
                style={{ color: 'var(--theme-text-secondary)' }}
              >
                Elige una opción o combina ambas según prefieras
              </p>
            </div>
          </div>
          
          <div className="card-content">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* File Upload Section */}
              <div>
                <h4 className="font-medium mb-4" style={{ color: 'var(--theme-text-primary)' }}>
                  Subir Archivos
                </h4>
                <div
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 ${
                    isDraggingOver ? "animate-pulse" : ""
                  }`}
                  style={{
                    borderColor: isDraggingOver ? 'var(--primary)' : 'var(--theme-border-secondary)',
                    backgroundColor: isDraggingOver ? 'var(--theme-info-light)' : 'var(--theme-bg-secondary)'
                  }}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="flex justify-center mb-4">
                    <i
                      className={`fas fa-file-upload text-3xl transition-all duration-300 ${
                        isDraggingOver ? "animate-bounce" : ""
                      }`}
                      style={{ 
                        color: isDraggingOver ? 'var(--primary)' : 'var(--theme-text-secondary)' 
                      }}
                    ></i>
                  </div>
                  <h5 
                    className="text-base font-medium mb-2"
                    style={{ color: 'var(--theme-text-primary)' }}
                  >
                    Arrastra archivos aquí
                  </h5>
                  <p 
                    className="text-sm mb-4"
                    style={{ color: 'var(--theme-text-secondary)' }}
                  >
                    o
                  </p>
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer inline-flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105"
                    style={{
                      background: 'var(--theme-gradient-purple)',
                      color: 'white',
                      boxShadow: 'var(--theme-shadow-sm)'
                    }}
                  >
                    <i className="fas fa-folder-open"></i>
                    <span>Seleccionar archivos</span>
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    multiple
                    onChange={handleFileChange}
                  />
                </div>
              </div>
              
              {/* Text Input Section */}
              <div>
                <h4 className="font-medium mb-4" style={{ color: 'var(--theme-text-primary)' }}>
                  Pegar Texto Directamente
                </h4>
                <textarea
                  className="w-full h-40 px-4 py-3 rounded-xl border-2 transition-all duration-300 resize-none"
                  style={{
                    backgroundColor: 'var(--theme-bg-secondary)',
                    borderColor: pastedText.trim() ? 'var(--theme-success)' : 'var(--theme-border-primary)',
                    color: 'var(--theme-text-primary)'
                  }}
                  placeholder="Pega aquí el contenido del material de estudio, libros, artículos, notas de clase..."
                  value={pastedText}
                  onChange={handleTextChange}
                />
                <p className="text-xs mt-2" style={{ color: 'var(--theme-text-secondary)' }}>
                  Puedes pegar texto desde PDFs, artículos web, documentos de Word, etc.
                </p>
              </div>
            </div>
            
            {/* Help Section */}
            <div 
              className="mt-6 p-4 rounded-xl border"
              style={{
                backgroundColor: 'var(--theme-info-light)',
                borderColor: 'var(--theme-info)'
              }}
            >
              <div className="flex items-center justify-center space-x-3 mb-3">
                <i 
                  className="fas fa-lightbulb text-xl"
                  style={{ color: 'var(--theme-info-dark)' }}
                ></i>
                <h5 
                  className="font-medium"
                  style={{ color: 'var(--theme-info-dark)' }}
                >
                  Consejos de uso:
                </h5>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div 
                  className="flex items-center space-x-2"
                  style={{ color: 'var(--theme-info-dark)' }}
                >
                  <div 
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: 'var(--theme-info-dark)' }}
                  ></div>
                  <div className="text-sm">
                    <strong>Solo archivos:</strong> Sube PDFs, imágenes de libros, presentaciones
                  </div>
                </div>
                
                <div 
                  className="flex items-center space-x-2"
                  style={{ color: 'var(--theme-info-dark)' }}
                >
                  <div 
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: 'var(--theme-info-dark)' }}
                  ></div>
                  <div className="text-sm">
                    <strong>Solo texto:</strong> Pega contenido copiado de cualquier fuente
                  </div>
                </div>
                
                <div 
                  className="flex items-center space-x-2"
                  style={{ color: 'var(--theme-info-dark)' }}
                >
                  <div 
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: 'var(--theme-info-dark)' }}
                  ></div>
                  <div className="text-sm">
                    <strong>Ambos:</strong> Combina archivos + texto adicional para más contexto
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* File List Grid Area */}
      {files && files.length > 0 && (
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
                style={{ backgroundColor: 'var(--theme-info-light)' }}
              >
                <i 
                  className="fas fa-file-alt text-lg"
                  style={{ color: 'var(--theme-info)' }}
                ></i>
              </div>
              <div className="card-header-text">
                <h3 
                  className="card-title"
                  style={{ color: 'var(--theme-text-primary)' }}
                >
                  📋 Archivos Seleccionados
                </h3>
                <p 
                  className="card-subtitle"
                  style={{ color: 'var(--theme-text-secondary)' }}
                >
                  {files.length} archivo{files.length !== 1 ? 's' : ''} listo{files.length !== 1 ? 's' : ''} para procesar
                </p>
              </div>
            </div>
            
            <div className="card-content">
              <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                {Array.from(files).map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-xl border transition-all duration-300 hover:scale-[1.02]"
                    style={{
                      backgroundColor: 'var(--theme-bg-secondary)',
                      borderColor: 'var(--theme-border-primary)'
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <div 
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${getFileIconClass(file.type)}`}
                      >
                        <i className="fas fa-file text-sm"></i>
                      </div>
                      <div>
                        <p 
                          className="font-medium text-sm"
                          style={{ color: 'var(--theme-text-primary)' }}
                        >
                          {file.name}
                        </p>
                        <p 
                          className="text-xs"
                          style={{ color: 'var(--theme-text-secondary)' }}
                        >
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteFile(index)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
                      style={{
                        backgroundColor: 'var(--theme-error-light)',
                        color: 'var(--theme-error-dark)'
                      }}
                    >
                      <i className="fas fa-times text-xs"></i>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* Instructions Grid Area */}
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
                className="fas fa-edit text-lg"
                style={{ color: 'var(--theme-warning)' }}
              ></i>
            </div>
            <div className="card-header-text">
              <h3 
                className="card-title"
                style={{ color: 'var(--theme-text-primary)' }}
              >
                📝 Instrucciones
              </h3>
              <p 
                className="card-subtitle"
                style={{ color: 'var(--theme-text-secondary)' }}
              >
                Personaliza el enfoque del examen
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
            {isLoading ? (
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
                  <span className="font-semibold">Procesando contenido...</span>
                </div>
                <p 
                  className="text-sm"
                  style={{ color: 'var(--theme-text-secondary)' }}
                >
                  Analizando archivos con IA
                </p>
              </div>
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
                        backgroundColor: (files.length > 0 || pastedText.trim()) ? 'var(--theme-success-light)' : 'var(--theme-bg-secondary)',
                        borderColor: (files.length > 0 || pastedText.trim()) ? 'var(--theme-success)' : 'var(--theme-border-primary)',
                        color: (files.length > 0 || pastedText.trim()) ? 'var(--theme-success-dark)' : 'var(--theme-text-secondary)'
                      }}
                    >
                      <div className="text-lg font-bold">
                        {(files.length > 0 || pastedText.trim()) ? '✓' : '✗'}
                      </div>
                      <div className="text-xs opacity-80">Contenido</div>
                    </div>
                    
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
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div 
                      className="p-3 rounded-xl border text-center transition-all duration-300"
                      style={{
                        backgroundColor: 'var(--theme-info-light)',
                        borderColor: 'var(--theme-info)',
                        color: 'var(--theme-info-dark)'
                      }}
                    >
                      <div className="text-lg font-bold">{files.length}</div>
                      <div className="text-xs opacity-80">Archivos</div>
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
                    onClick={handleGenerate}
                    disabled={isGenerateDisabled}
                    className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center space-x-3 ${
                      isGenerateDisabled ? 'cursor-not-allowed' : 'hover:scale-105 hover:shadow-lg'
                    }`}
                    style={{
                      backgroundColor: isGenerateDisabled ? 'var(--theme-text-tertiary)' : 'var(--secondary)',
                      color: 'white',
                      opacity: isGenerateDisabled ? 0.5 : 1,
                      boxShadow: isGenerateDisabled ? 'none' : 'var(--theme-shadow-lg)'
                    }}
                  >
                    <i className="fas fa-file-upload text-xl"></i>
                    <span>Procesar y Generar</span>
                  </button>
                  
                  {isGenerateDisabled && (
                    <p 
                      className="text-xs opacity-80"
                      style={{ color: 'var(--theme-text-secondary)' }}
                    >
                      Añade contenido y configura la API key
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
