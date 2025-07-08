import { useCallback, useMemo } from 'react';

interface Question {
  id?: number;
  pregunta: string;
  opciones?: string[];
  correcta?: number;
  respuesta?: number;
  feedback?: string;
}

export interface NavigationState {
  canGoPrevious: boolean;
  canGoNext: boolean;
  currentIndex: number;
  totalQuestions: number;
  progress: number; // Percentage
}

export interface NavigationActions {
  goToPrevious: () => void;
  goToNext: () => void;
  goToQuestion: (index: number) => void;
  goToFirst: () => void;
  goToLast: () => void;
}

export interface UseExamNavigationReturn extends NavigationState, NavigationActions {}

/**
 * Custom hook for exam navigation logic
 * Handles question navigation with bounds checking
 */
export const useExamNavigation = (
  questions: Question[],
  currentIndex: number,
  onNavigate: (index: number) => void
): UseExamNavigationReturn => {
  
  // Navigation state
  const navigationState = useMemo<NavigationState>(() => {
    const totalQuestions = questions.length;
    
    return {
      canGoPrevious: currentIndex > 0,
      canGoNext: currentIndex < totalQuestions - 1,
      currentIndex,
      totalQuestions,
      progress: totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0,
    };
  }, [questions.length, currentIndex]);

  // Go to previous question
  const goToPrevious = useCallback(() => {
    if (navigationState.canGoPrevious) {
      onNavigate(currentIndex - 1);
    }
  }, [navigationState.canGoPrevious, currentIndex, onNavigate]);

  // Go to next question
  const goToNext = useCallback(() => {
    if (navigationState.canGoNext) {
      onNavigate(currentIndex + 1);
    }
  }, [navigationState.canGoNext, currentIndex, onNavigate]);

  // Go to specific question
  const goToQuestion = useCallback((index: number) => {
    if (index >= 0 && index < questions.length) {
      onNavigate(index);
    }
  }, [questions.length, onNavigate]);

  // Go to first question
  const goToFirst = useCallback(() => {
    if (questions.length > 0) {
      onNavigate(0);
    }
  }, [questions.length, onNavigate]);

  // Go to last question
  const goToLast = useCallback(() => {
    if (questions.length > 0) {
      onNavigate(questions.length - 1);
    }
  }, [questions.length, onNavigate]);

  return {
    ...navigationState,
    goToPrevious,
    goToNext,
    goToQuestion,
    goToFirst,
    goToLast,
  };
};