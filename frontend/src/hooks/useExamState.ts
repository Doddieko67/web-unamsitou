import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../supabase.config';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router';

export interface Question {
  id?: number;
  pregunta: string;
  opciones?: string[];
  correcta?: number;
  respuesta?: number;
  feedback?: string;
}

export interface ExamData {
  id: string;
  user_id: string;
  titulo: string;
  dificultad: string;
  estado: "pendiente" | "en_progreso" | "terminado" | "suspendido";
  numero_preguntas: number;
  datos: Question[];
  fecha_inicio: string | null;
  tiempo_limite_segundos: number;
  tiempo_tomado_segundos?: number;
  respuestas_usuario?: { [key: number]: number };
  descripcion: string;
  questions_pinned?: { [key: number]: boolean };
  feedback?: { [key: number]: string };
}

export interface ExamState {
  exam: ExamData | null;
  currentQuestionIndex: number;
  userAnswers: { [key: number]: number };
  pinnedQuestions: { [key: number]: boolean };
  feedback: { [key: number]: string };
  isSubmitted: boolean;
  loading: boolean;
  error: string | null;
}

export interface ExamActions {
  setAnswer: (questionIndex: number, answerIndex: number) => void;
  togglePin: (questionIndex: number) => void;
  navigateToQuestion: (index: number) => void;
  submitExam: (timeSpent: number) => Promise<void>;
  suspendExam: (timeSpent: number) => Promise<void>;
  resetExam: () => Promise<void>;
  loadExam: () => Promise<void>;
}

export interface UseExamStateReturn extends ExamState, ExamActions {}

/**
 * Custom hook for exam state management
 * Centralizes all exam-related state and business logic
 */
export const useExamState = (examId: string): UseExamStateReturn => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Core state
  const [state, setState] = useState<ExamState>({
    exam: null,
    currentQuestionIndex: 0,
    userAnswers: {},
    pinnedQuestions: {},
    feedback: {},
    isSubmitted: false,
    loading: true,
    error: null,
  });

  // Refs for stable references
  const userAnswersRef = useRef(state.userAnswers);
  const pinnedQuestionsRef = useRef(state.pinnedQuestions);
  const currentQuestionIndexRef = useRef(state.currentQuestionIndex);

  // Update refs when state changes
  useEffect(() => {
    userAnswersRef.current = state.userAnswers;
    pinnedQuestionsRef.current = state.pinnedQuestions;
    currentQuestionIndexRef.current = state.currentQuestionIndex;
  }, [state.userAnswers, state.pinnedQuestions, state.currentQuestionIndex]);

  // Load saved state from localStorage
  const loadSavedState = useCallback(() => {
    if (!examId) return null;
    
    try {
      const savedState = localStorage.getItem(`examen_estado_${examId}`);
      if (!savedState) return null;
      
      const parsedState = JSON.parse(savedState);
      console.log('Estado cargado de localStorage:', parsedState);
      
      if (typeof parsedState !== 'object' || parsedState === null) {
        console.error('Estado guardado inválido');
        return null;
      }
      
      return parsedState;
    } catch (error) {
      console.error('Error al cargar estado guardado:', error);
      return null;
    }
  }, [examId]);

  // Load exam data from Supabase
  const loadExam = useCallback(async () => {
    if (!examId || !user?.id) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const { data, error } = await supabase
        .from('examenes')
        .select('*')
        .eq('id', examId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      // Try to load saved state first
      const savedState = loadSavedState();
      
      if (savedState && data.estado !== 'terminado') {
        // Use saved state if exam is not finished
        setState(prev => ({
          ...prev,
          exam: data,
          currentQuestionIndex: savedState.currentQuestionIndex || 0,
          userAnswers: savedState.userAnswers || {},
          pinnedQuestions: savedState.pinnedQuestions || data.questions_pinned || {},
          feedback: savedState.feedback || data.feedback || {},
          isSubmitted: data.estado === 'terminado',
          loading: false,
        }));
      } else {
        // Use data from Supabase
        setState(prev => ({
          ...prev,
          exam: data,
          currentQuestionIndex: 0,
          userAnswers: data.respuestas_usuario || {},
          pinnedQuestions: data.questions_pinned || {},
          feedback: data.feedback || {},
          isSubmitted: data.estado === 'terminado',
          loading: false,
        }));
      }

      // Mark exam as in progress if it was pending
      if (data.estado === 'pendiente') {
        await supabase
          .from('examenes')
          .update({
            estado: 'en_progreso',
            fecha_inicio: new Date().toISOString(),
          })
          .eq('id', examId)
          .eq('user_id', user.id);
      }

    } catch (error) {
      console.error('Error loading exam:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Error loading exam',
        loading: false,
      }));
    }
  }, [examId, user?.id, loadSavedState]);

  // Set answer
  const setAnswer = useCallback((questionIndex: number, answerIndex: number) => {
    if (state.isSubmitted) return;

    setState(prev => ({
      ...prev,
      userAnswers: {
        ...prev.userAnswers,
        [questionIndex]: answerIndex,
      },
    }));
  }, [state.isSubmitted]);

  // Toggle question pin
  const togglePin = useCallback((questionIndex: number) => {
    setState(prev => {
      const newPinned = { ...prev.pinnedQuestions };
      if (newPinned[questionIndex]) {
        delete newPinned[questionIndex];
      } else {
        newPinned[questionIndex] = true;
      }
      return {
        ...prev,
        pinnedQuestions: newPinned,
      };
    });
  }, []);

  // Navigate to specific question
  const navigateToQuestion = useCallback((index: number) => {
    if (!state.exam?.datos || index < 0 || index >= state.exam.datos.length) return;
    
    setState(prev => ({
      ...prev,
      currentQuestionIndex: index,
    }));
  }, [state.exam?.datos]);

  // Submit exam
  const submitExam = useCallback(async (timeSpent: number) => {
    if (!state.exam || state.isSubmitted) return;

    setState(prev => ({ ...prev, isSubmitted: true }));

    const finalState = {
      estado: 'terminado' as const,
      tiempo_tomado_segundos: timeSpent, // Use actual time spent
      respuestas_usuario: userAnswersRef.current,
      questions_pinned: pinnedQuestionsRef.current,
      fecha_fin: new Date().toISOString(),
    };

    console.log('🚀 IMMEDIATE SAVE: Submitting exam with final state:', finalState);

    try {
      // Save to localStorage first
      localStorage.setItem(
        `examen_final_pending_${examId}`,
        JSON.stringify(finalState)
      );

      // Save to Supabase IMMEDIATELY
      const { error } = await supabase
        .from('examenes')
        .update(finalState)
        .eq('id', examId)
        .eq('user_id', user?.id);

      if (error) throw error;

      console.log('✅ IMMEDIATE SAVE SUCCESS: Exam submitted and saved immediately');

      // Clean up localStorage on success
      localStorage.removeItem(`examen_final_pending_${examId}`);
      localStorage.removeItem(`examen_estado_${examId}`);

      // Navigate to results
      navigate(`/examen/${examId}`);

    } catch (error) {
      console.error('❌ Error submitting exam:', error);
      // Keep in localStorage for retry
      throw error; // Re-throw to handle in UI
    }
  }, [state.exam, state.isSubmitted, examId, user?.id, navigate]);

  // Suspend exam
  const suspendExam = useCallback(async (timeSpent: number) => {
    if (!state.exam || state.isSubmitted) return;

    console.log('🚀 IMMEDIATE SAVE: Suspending exam with time spent:', timeSpent);

    try {
      const { error } = await supabase
        .from('examenes')
        .update({
          estado: 'suspendido',
          tiempo_tomado_segundos: timeSpent, // Use actual time spent
          respuestas_usuario: userAnswersRef.current,
          questions_pinned: pinnedQuestionsRef.current,
        })
        .eq('id', examId)
        .eq('user_id', user?.id);

      if (error) throw error;

      console.log('✅ IMMEDIATE SAVE SUCCESS: Exam suspended and saved immediately');

      navigate('/examenes');
    } catch (error) {
      console.error('❌ Error suspending exam:', error);
      throw error; // Re-throw to handle in UI
    }
  }, [state.exam, state.isSubmitted, examId, user?.id, navigate]);

  // Reset exam - creates a new exam instance
  const resetExam = useCallback(async () => {
    if (!state.exam || !user?.id) return;

    console.log('🔄 RESET: Creating new exam instance');

    try {
      const { data: newExam, error } = await supabase
        .from('examenes')
        .insert({
          estado: 'pendiente',
          user_id: user.id,
          titulo: state.exam.titulo,
          descripcion: state.exam.descripcion,
          datos: state.exam.datos,
          dificultad: state.exam.dificultad,
          numero_preguntas: state.exam.numero_preguntas,
          tiempo_limite_segundos: state.exam.tiempo_limite_segundos,
          tiempo_tomado_segundos: 0,
        })
        .select('id')
        .single();

      if (error) throw error;

      if (!newExam?.id) {
        throw new Error('No se pudo crear el nuevo examen');
      }

      console.log('✅ RESET SUCCESS: New exam created with ID:', newExam.id);

      // Clean up localStorage for current exam
      localStorage.removeItem(`examen_estado_${examId}`);
      localStorage.removeItem(`examen_final_pending_${examId}`);

      // Navigate to new exam
      navigate(`/examen/${newExam.id}`);
    } catch (error) {
      console.error('❌ Error resetting exam:', error);
      throw error; // Re-throw to handle in UI
    }
  }, [state.exam, user?.id, examId, navigate]);

  // Load exam on mount
  useEffect(() => {
    loadExam();
  }, [loadExam]);

  return {
    ...state,
    setAnswer,
    togglePin,
    navigateToQuestion,
    submitExam,
    suspendExam,
    resetExam,
    loadExam,
  };
};