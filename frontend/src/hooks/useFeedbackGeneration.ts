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
      setState(prev => ({ ...prev, error: 'Usuario no autenticado' }));
      return;
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
        setState(prev => ({
          ...prev,
          feedback: {},
          isGenerating: false,
          isLoading: false,
          error: 'Respuesta inesperada del servidor',
        }));
      }
    } catch (error) {
      console.error('❌ Error en la generación de feedback:', error);
      setState(prev => ({
        ...prev,
        isGenerating: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      }));
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