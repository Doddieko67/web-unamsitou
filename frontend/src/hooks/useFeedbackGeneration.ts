import { useState, useCallback } from 'react';
import { useAuthStore } from '../stores/authStore';
import { url_backend } from '../url_backend';

export interface FeedbackState {
  feedback: { [key: number]: string };
  isGenerating: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface FeedbackActions {
  generateFeedback: (examId: string) => Promise<void>;
  clearError: () => void;
  setFeedback: (feedback: { [key: number]: string }) => void;
}

export interface UseFeedbackGenerationReturn extends FeedbackState, FeedbackActions {}

/**
 * Custom hook for feedback generation
 * Handles AI-powered feedback generation for exam questions
 */
export const useFeedbackGeneration = (): UseFeedbackGenerationReturn => {
  const { user, session } = useAuthStore();
  
  const [state, setState] = useState<FeedbackState>({
    feedback: {},
    isGenerating: false,
    isLoading: false,
    error: null,
  });

  const generateFeedback = useCallback(async (examId: string) => {
    if (!user || !session?.access_token) {
      const errorMessage = 'Usuario no autenticado';
      setState(prev => ({ ...prev, error: errorMessage }));
      throw new Error(errorMessage);
    }

    setState(prev => ({ 
      ...prev, 
      isGenerating: true, 
      isLoading: true, 
      error: null 
    }));

    try {
      console.log('🤖 Iniciando generación de feedback para examen:', examId);
      
      const response = await fetch(`${url_backend}/api/generate-feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          examen_id: examId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const responseData = await response.json();

      if (responseData && responseData.feedback) {
        setState(prev => ({
          ...prev,
          feedback: responseData.feedback,
          isGenerating: false,
          isLoading: false,
        }));
        
        console.log('✅ Feedback generado exitosamente:', responseData.feedback);
      } else {
        console.warn('⚠️ La API no devolvió el objeto de feedback esperado');
        const errorMessage = 'Respuesta inesperada del servidor';
        setState(prev => ({
          ...prev,
          feedback: {},
          isGenerating: false,
          isLoading: false,
          error: errorMessage,
        }));
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('❌ Error en la generación de feedback:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setState(prev => ({
        ...prev,
        isGenerating: false,
        isLoading: false,
        error: errorMessage,
      }));
      // Re-throw the error so it can be caught by the component
      throw new Error(errorMessage);
    }
  }, [user, session]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const setFeedback = useCallback((feedback: { [key: number]: string }) => {
    setState(prev => ({ ...prev, feedback }));
  }, []);

  return {
    ...state,
    generateFeedback,
    clearError,
    setFeedback,
  };
};