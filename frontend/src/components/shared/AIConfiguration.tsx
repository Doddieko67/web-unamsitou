import { useState, useCallback, useEffect, memo } from "react";
import { useAuthStore } from "../../stores/authStore";
import { GeminiService } from "../../services/geminiService";
import { GEMINI_MODELS, DEFAULT_MODEL, GeminiModel } from "../../constants/geminiModels";
import Swal from "sweetalert2";

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

  // Función para validar API key
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
      // Validar API key con el backend
      const response = await GeminiService.validateApiKey(key);
      
      if (response.success && response.data?.isValid) {
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
      const response = await GeminiService.saveApiKey(apiKey);
      
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

  // Cargar estado de API key al montar el componente
  useEffect(() => {
    const loadApiKeyStatus = async () => {
      // Solo cargar si el usuario está autenticado
      if (!session?.access_token) {
        setIsLoadingApiStatus(false);
        return;
      }
      
      setIsLoadingApiStatus(true);
      
      try {
        const response = await GeminiService.getApiKeyStatus();
        
        if (response.success && response.data?.hasApiKey) {
          onApiValidChange(response.data.isValid);
          setApiKeyPreview(response.data.apiKeyPreview || null);
        }
      } catch (error) {
        console.error('Error cargando estado de API key:', error);
      } finally {
        setIsLoadingApiStatus(false);
      }
    };
    
    loadApiKeyStatus();
  }, [session, onApiValidChange]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Authentication Warning */}
      {!session?.access_token && (
        <div 
          className="p-4 rounded-xl border-2 border-dashed"
          style={{ 
            borderColor: 'var(--theme-warning)',
            backgroundColor: 'var(--theme-warning-light)',
            color: 'var(--theme-warning-dark)'
          }}
        >
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
        <label 
          className="block text-sm font-medium mb-3"
          style={{ color: 'var(--theme-text-secondary)' }}
        >
          Modelo de IA
        </label>
        <div className="grid grid-cols-1 gap-3">
          {!isApiValid ? (
            <div 
              className="p-4 text-center rounded-xl border-2 border-dashed"
              style={{ 
                borderColor: 'var(--theme-border-primary)',
                backgroundColor: 'var(--theme-bg-secondary)',
                color: 'var(--theme-text-secondary)'
              }}
            >
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
                className={`p-3 rounded-xl border-2 text-left transition-all duration-300 ${
                  selectedModel === model.name ? 'ring-2 ring-offset-2' : ''
                }`}
                style={{
                  backgroundColor: selectedModel === model.name ? 'var(--primary)' : 'var(--theme-bg-secondary)',
                  borderColor: 'var(--primary)',
                  color: selectedModel === model.name ? 'white' : 'var(--theme-text-primary)',
                  '--tw-ring-color': 'var(--primary)'
                } as any}
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
        <label 
          className="block text-sm font-medium mb-3"
          style={{ color: 'var(--theme-text-secondary)' }}
        >
          API Key de Google
        </label>
        <div className="space-y-2">
          {/* Mostrar preview de API key guardada */}
          {apiKeyPreview && !apiKey && (
            <div 
              className="p-3 rounded-xl border-2 mb-3"
              style={{
                backgroundColor: 'var(--theme-success-light)',
                borderColor: 'var(--theme-success)',
                color: 'var(--theme-success-dark)'
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <i className="fas fa-check-circle"></i>
                  <span className="text-sm font-medium">API Key configurada: {apiKeyPreview}</span>
                </div>
                <button
                  onClick={() => {
                    setApiKeyPreview(null);
                    onApiValidChange(false);
                  }}
                  className="text-xs px-2 py-1 rounded hover:bg-opacity-80 transition-colors"
                  style={{
                    backgroundColor: 'var(--theme-success)',
                    color: 'white'
                  }}
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
                onChange={(e) => handleApiKeyChange(e.target.value)}
                placeholder="AIza..."
                className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 pr-12"
                style={{
                  backgroundColor: 'var(--theme-bg-secondary)',
                  borderColor: isApiValid ? 'var(--theme-success)' : 'var(--theme-border-primary)',
                  color: 'var(--theme-text-primary)'
                }}
                disabled={isValidatingApi}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                {isValidatingApi ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" style={{ color: 'var(--theme-info)' }}></div>
                ) : apiKey && (
                  <i 
                    className={`fas ${isApiValid ? 'fa-check-circle' : 'fa-exclamation-circle'}`}
                    style={{ 
                      color: isApiValid ? 'var(--theme-success)' : 'var(--theme-error)' 
                    }}
                  />
                )}
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <p 
              className="text-xs"
              style={{ color: 'var(--theme-text-secondary)' }}
            >
              Obtén tu API key en Google AI Studio
            </p>
            <div className="flex items-center space-x-2">
              {apiKey && isApiValid && (
                <button
                  onClick={handleSaveApiKey}
                  className="inline-flex items-center space-x-1 text-xs px-2 py-1 rounded-lg transition-all duration-200 hover:scale-105"
                  style={{
                    backgroundColor: 'var(--theme-success)',
                    color: 'white',
                    textDecoration: 'none'
                  }}
                >
                  <i className="fas fa-save"></i>
                  <span>Guardar</span>
                </button>
              )}
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
  );
});