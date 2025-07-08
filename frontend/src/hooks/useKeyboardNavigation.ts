import { useEffect, useCallback } from 'react';

export interface KeyboardNavigationConfig {
  onPrevious: () => void;
  onNext: () => void;
  onAnswer1: () => void;
  onAnswer2: () => void;
  onAnswer3: () => void;
  onAnswer4: () => void;
  isSubmitted: boolean;
  disabled?: boolean;
}

/**
 * Custom hook for keyboard navigation in exams
 * Handles arrow keys for navigation and number keys for answers
 */
export const useKeyboardNavigation = (config: KeyboardNavigationConfig) => {
  const {
    onPrevious,
    onNext,
    onAnswer1,
    onAnswer2,
    onAnswer3,
    onAnswer4,
    isSubmitted,
    disabled = false,
  } = config;

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't handle keys if disabled or user is typing in input/textarea
    if (disabled) return;
    
    const activeElement = document.activeElement;
    if (
      activeElement &&
      (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')
    ) {
      return;
    }

    // Answer selection (only if exam not submitted)
    if (!isSubmitted) {
      switch (event.key) {
        case '1':
          event.preventDefault();
          onAnswer1();
          break;
        case '2':
          event.preventDefault();
          onAnswer2();
          break;
        case '3':
          event.preventDefault();
          onAnswer3();
          break;
        case '4':
          event.preventDefault();
          onAnswer4();
          break;
      }
    }

    // Navigation (always available)
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        onPrevious();
        break;
      case 'ArrowRight':
      case 'Enter':
        event.preventDefault();
        onNext();
        break;
    }
  }, [
    disabled,
    isSubmitted,
    onPrevious,
    onNext,
    onAnswer1,
    onAnswer2,
    onAnswer3,
    onAnswer4,
  ]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
};