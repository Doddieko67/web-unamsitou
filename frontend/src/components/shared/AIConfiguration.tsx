import { useState, useCallback, useEffect, memo, useRef } from "react";
import { useAuthStore } from "../../stores/authStore";
import { GeminiService } from "../../services/geminiService";
import { ApiKeyService } from "../../services/apiKeyService";
import { GEMINI_MODELS, DEFAULT_MODEL, GeminiModel } from "../../constants/geminiModels";
import Swal from "sweetalert2";

// Función debounce personalizada
function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T & { cancel: () => void } {
  let timeoutId: NodeJS.Timeout | null = null;
  
  const debouncedFunction = function (...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  } as T & { cancel: () => void };
  
  debouncedFunction.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };
  
  return debouncedFunction;
}

interface AIConfigurationProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  isApiValid: boolean;
  onApiValidChange: (isValid: boolean) => void;
  className?: string;
}

export const AIConfiguration = memo(function AIConfiguration({
  selectedModel,
  onModelChange,
  isApiValid,
  onApiValidChange,
  className = ""
}: AIConfigurationProps) {
  const { session } = useAuthStore();
  
  // Estados locales para API key management
  const [apiKey, setApiKey] = useState<string>('');
  const [isValidatingApi, setIsValidatingApi] = useState<boolean>(false);
  const [isLoadingApiStatus, setIsLoadingApiStatus] = useState<boolean>(true);
  const [apiKeyPreview, setApiKeyPreview] = useState<string | null>(null);

  // Función para validar API key con debounce
  const handleApiKeyChange = useCallback(async (key: string) => {
    setApiKey(key);
    onApiValidChange(false);
    
    // Verificación básica de formato
    if (!key || key.length < 20 || !key.startsWith('AIza')) {
      return;
    }
    
    // Verificar si el usuario está autenticado
    if (!session?.access_token) {
      Swal.fire({
        icon: 'warning',
        title: 'No autenticado',
        text: 'Por favor, inicia sesión para validar la API key',
        confirmButtonColor: '#3085d6'
      });
      return;
    }
    
    setIsValidatingApi(true);
    
    try {
      // Validar API key con el backend usando ApiKeyService
      const response = await ApiKeyService.validateApiKey(key);
      
      if (response.success && response.isValid) {
        onApiValidChange(true);
        
        Swal.fire({
          icon: 'success',
          title: 'API Key Válida',
          text: 'Ahora puedes seleccionar un modelo y generar exámenes',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        onApiValidChange(false);
        
        Swal.fire({
          icon: 'error',
          title: 'API Key Inválida',
          text: response.error || 'La API key no es válida',
          confirmButtonColor: '#d33'
        });
      }
    } catch (error) {
      console.error('Error validando API key:', error);
      onApiValidChange(false);
      
      const errorMessage = error instanceof Error ? error.message : 'Error al validar la API key';
      
      Swal.fire({
        icon: 'error',
        title: 'Error de Validación',
        text: errorMessage,
        confirmButtonColor: '#d33'
      });
    } finally {
      setIsValidatingApi(false);
    }
  }, [session, onApiValidChange]);

  // Debounce para la validación
  const debouncedValidation = useCallback(
    debounce(handleApiKeyChange, 1000), // Esperar 1 segundo después de que el usuario termine de escribir
    [handleApiKeyChange]
  );

  // Función para manejar el cambio de input
  const handleInputChange = useCallback((key: string) => {
    setApiKey(key);
    onApiValidChange(false);
    
    // Cancelar validación anterior
    debouncedValidation.cancel?.();
    
    // Verificación básica de formato
    if (!key || key.length < 20 || !key.startsWith('AIza')) {
      return;
    }
    
    // Programar nueva validación
    debouncedValidation(key);
  }, [debouncedValidation, onApiValidChange]);

  // Función para guardar API key
  const handleSaveApiKey = useCallback(async () => {
    if (!apiKey || !isApiValid) {
      Swal.fire({
        icon: 'warning',
        title: 'API Key Requerida',
        text: 'Por favor ingresa y valida una API key antes de guardar',
        confirmButtonColor: '#3085d6'
      });
      return;
    }
    
    // Verificar si el usuario está autenticado
    if (!session?.access_token) {
      Swal.fire({
        icon: 'warning',
        title: 'No autenticado',
        text: 'Por favor, inicia sesión para guardar la API key',
        confirmButtonColor: '#3085d6'
      });
      return;
    }
    
    try {
      // Usar ApiKeyService en lugar de GeminiService
      const response = await ApiKeyService.saveApiKey(apiKey);
      
      if (response.success) {
        Swal.fire({
          icon: 'success',
          title: 'API Key Guardada',
          text: 'Tu API key se ha guardado de forma segura',
          timer: 2000,
          showConfirmButton: false
        });
        
        // Limpiar el campo de API key y mostrar preview
        setApiKey('');
        setApiKeyPreview(`***${apiKey.slice(-8)}`);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error al Guardar',
          text: response.error || 'Error al guardar la API key',
          confirmButtonColor: '#d33'
        });
      }
    } catch (error) {
      console.error('Error guardando API key:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al guardar la API key';
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
        confirmButtonColor: '#d33'
      });
    }
  }, [apiKey, isApiValid, session]);

  // Cargar estado de API key al montar el componente (solo una vez)
  useEffect(() => {
    const loadApiKeyStatus = async () => {
      // Solo cargar si el usuario está autenticado
      if (!session?.access_token) {
        setIsLoadingApiStatus(false);
        return;
      }
      
      setIsLoadingApiStatus(true);
      
      try {
        // Usar ApiKeyService en lugar de GeminiService - NO MÁS LLAMADAS AL BACKEND
        const response = await ApiKeyService.getApiKeyStatus();
        
        if (response.success && response.data?.hasApiKey) {
          onApiValidChange(response.data.isValid);
          setApiKeyPreview(response.data.apiKeyPreview || null);
        } else {
          onApiValidChange(false);
          setApiKeyPreview(null);
        }
      } catch (error) {
        console.error('Error cargando estado de API key:', error);
        onApiValidChange(false);
        setApiKeyPreview(null);
      } finally {
        setIsLoadingApiStatus(false);
      }
    };
    
    // Solo cargar una vez al montar el componente si hay sesión
    if (session?.access_token) {
      loadApiKeyStatus();
    } else {
      setIsLoadingApiStatus(false);
    }
  }, [session?.access_token, onApiValidChange]); // Solo escuchar cambios en el token

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Authentication Warning */}
      {!session?.access_token && (
        <div className="auth-warning">
          <div className="flex items-center space-x-2 mb-2">
            <i className="fas fa-exclamation-triangle"></i>
            <span className="text-sm font-medium">Autenticación requerida</span>
          </div>
          <div className="text-xs opacity-80">
            Inicia sesión para validar y guardar tu API key de Gemini
          </div>
        </div>
      )}
      
      {/* Model Selection */}
      <div>
        <label className="api-key-label">
          Modelo de IA
        </label>
        <div className="grid grid-cols-1 gap-3">
          {!isApiValid ? (
            <div className="models-locked">
              <i className="fas fa-lock text-2xl mb-2"></i>
              <div className="text-sm font-medium mb-1">Modelos no disponibles</div>
              <div className="text-xs opacity-80">
                {!session?.access_token 
                  ? 'Inicia sesión y configura una API key válida' 
                  : 'Configura una API key válida para ver los modelos'
                }
              </div>
            </div>
          ) : (
            GEMINI_MODELS.map((model) => (
              <button
                key={model.name}
                onClick={() => onModelChange(model.name)}
                className={`model-button ${
                  selectedModel === model.name ? 'selected ring-2 ring-offset-2' : ''
                }`}
              >
                <div className="font-semibold text-sm">{model.displayName}</div>
                <div className="text-xs opacity-80 mt-1">
                  {model.description}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
      
      {/* API Key Input */}
      <div>
        <label className="api-key-label">
          API Key de Google
        </label>
        <div className="space-y-2">
          {/* Mostrar preview de API key guardada */}
          {apiKeyPreview && !apiKey && (
            <div className="api-key-preview">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <i className="fas fa-check-circle"></i>
                  <span className="text-sm font-medium">API Key configurada: {apiKeyPreview}</span>
                </div>
                <button
                  onClick={async () => {
                    const result = await Swal.fire({
                      icon: 'warning',
                      title: '¿Cambiar API Key?',
                      text: 'Esto eliminará tu API key actual. ¿Estás seguro?',
                      showCancelButton: true,
                      confirmButtonColor: '#d33',
                      cancelButtonColor: '#3085d6',
                      confirmButtonText: 'Sí, cambiar',
                      cancelButtonText: 'Cancelar'
                    });

                    if (result.isConfirmed) {
                      try {
                        const response = await ApiKeyService.deleteApiKey();
                        if (response.success) {
                          setApiKeyPreview(null);
                          onApiValidChange(false);
                          Swal.fire({
                            icon: 'success',
                            title: 'API Key eliminada',
                            text: 'Puedes ingresar una nueva API key',
                            timer: 2000,
                            showConfirmButton: false
                          });
                        }
                      } catch (error) {
                        Swal.fire({
                          icon: 'error',
                          title: 'Error',
                          text: 'Error al eliminar la API key',
                          confirmButtonColor: '#d33'
                        });
                      }
                    }
                  }}
                  className="api-key-button change"
                >
                  Cambiar
                </button>
              </div>
            </div>
          )}
          
          {/* Input de API key */}
          {(!apiKeyPreview || apiKey) && (
            <div className="relative">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="AIza..."
                className={`api-key-input ${isApiValid ? 'valid' : 'invalid'}`}
                disabled={isValidatingApi}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                {isValidatingApi ? (
                  <div className="api-key-spinner"></div>
                ) : apiKey && (
                  <i 
                    className={`fas ${isApiValid ? 'fa-check-circle' : 'fa-exclamation-circle'} api-key-status-icon ${isApiValid ? 'valid' : 'invalid'}`}
                  />
                )}
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <p className="api-key-help-text">
              Obtén tu API key en Google AI Studio
            </p>
            <div className="flex items-center space-x-2">
              {apiKey && isApiValid && (
                <button
                  onClick={handleSaveApiKey}
                  className="api-key-button save"
                >
                  <i className="fas fa-save"></i>
                  <span>Guardar</span>
                </button>
              )}
              <a
                href="https://youtu.be/RVGbLSVFtIk?si=svQg0FVLtHrFYcap&t=21"
                target="_blank"
                rel="noopener noreferrer"
                className="api-key-button tutorial"
              >
                <i className="fab fa-youtube"></i>
                <span>Ver tutorial</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});