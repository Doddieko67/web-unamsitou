import { useState, useEffect } from 'react';
import { ApiKeyService } from '../services/apiKeyService';
import { useAuthStore } from '../stores/authStore';

export interface UseApiKeyReturn {
  apiKey: string | null;
  loading: boolean;
  error: string | null;
  hasApiKey: boolean;
  isValid: boolean;
  refreshApiKey: () => Promise<void>;
}

/**
 * Hook para obtener la API key de Gemini del usuario
 */
export function useApiKey(): UseApiKeyReturn {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isValid, setIsValid] = useState(false);
  
  const { session } = useAuthStore();

  const loadApiKey = async () => {
    if (!session?.access_token) {
      setApiKey(null);
      setHasApiKey(false);
      setIsValid(false);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Obtener status de la API key
      const statusResponse = await ApiKeyService.getApiKeyStatus();
      
      if (statusResponse.success && statusResponse.data) {
        setHasApiKey(statusResponse.data.hasApiKey);
        setIsValid(statusResponse.data.isValid);

        // Si tiene API key válida, obtener la key desencriptada
        if (statusResponse.data.hasApiKey && statusResponse.data.isValid) {
          const keyResponse = await ApiKeyService.getDecryptedApiKey();
          
          if (keyResponse.success && keyResponse.apiKey) {
            setApiKey(keyResponse.apiKey);
          } else {
            setError(keyResponse.error || 'Error obteniendo API key');
            setApiKey(null);
          }
        } else {
          setApiKey(null);
        }
      } else {
        setError(statusResponse.error || 'Error obteniendo estado de API key');
        setApiKey(null);
        setHasApiKey(false);
        setIsValid(false);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      setApiKey(null);
      setHasApiKey(false);
      setIsValid(false);
    } finally {
      setLoading(false);
    }
  };

  const refreshApiKey = async () => {
    ApiKeyService.clearCache();
    await loadApiKey();
  };

  useEffect(() => {
    loadApiKey();
  }, [session?.access_token]);

  return {
    apiKey,
    loading,
    error,
    hasApiKey,
    isValid,
    refreshApiKey
  };
}

/**
 * Hook simplificado para obtener solo la API key cuando se necesite
 */
export function useGeminiApiKey(): string | null {
  const { apiKey, hasApiKey, isValid } = useApiKey();
  
  // Solo retornar la API key si está disponible y es válida
  return hasApiKey && isValid ? apiKey : null;
}