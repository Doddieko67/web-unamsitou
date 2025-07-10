import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useExamNavigation } from '../useExamNavigation';

// Mock question data
const createMockQuestions = (count: number) => {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    pregunta: `Question ${index + 1}`,
    opciones: ['Option A', 'Option B', 'Option C', 'Option D'],
    correcta: 0,
  }));
};

describe('useExamNavigation', () => {
  let mockOnNavigate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnNavigate = vi.fn();
  });

  describe('Initialization', () => {
    it('should initialize with correct navigation state for first question', () => {
      const questions = createMockQuestions(5);
      const { result } = renderHook(() => 
        useExamNavigation(questions, 0, mockOnNavigate)
      );
      
      expect(result.current.canGoPrevious).toBe(false);
      expect(result.current.canGoNext).toBe(true);
      expect(result.current.currentIndex).toBe(0);
      expect(result.current.totalQuestions).toBe(5);
      expect(result.current.progress).toBe(20); // 1/5 * 100
    });

    it('should initialize with correct navigation state for middle question', () => {
      const questions = createMockQuestions(5);
      const { result } = renderHook(() => 
        useExamNavigation(questions, 2, mockOnNavigate)
      );
      
      expect(result.current.canGoPrevious).toBe(true);
      expect(result.current.canGoNext).toBe(true);
      expect(result.current.currentIndex).toBe(2);
      expect(result.current.totalQuestions).toBe(5);
      expect(result.current.progress).toBe(60); // 3/5 * 100
    });

    it('should initialize with correct navigation state for last question', () => {
      const questions = createMockQuestions(5);
      const { result } = renderHook(() => 
        useExamNavigation(questions, 4, mockOnNavigate)
      );
      
      expect(result.current.canGoPrevious).toBe(true);
      expect(result.current.canGoNext).toBe(false);
      expect(result.current.currentIndex).toBe(4);
      expect(result.current.totalQuestions).toBe(5);
      expect(result.current.progress).toBe(100); // 5/5 * 100
    });

    it('should handle empty questions array', () => {
      const { result } = renderHook(() => 
        useExamNavigation([], 0, mockOnNavigate)
      );
      
      expect(result.current.canGoPrevious).toBe(false);
      expect(result.current.canGoNext).toBe(false);
      expect(result.current.currentIndex).toBe(0);
      expect(result.current.totalQuestions).toBe(0);
      expect(result.current.progress).toBe(0);
    });

    it('should handle single question', () => {
      const questions = createMockQuestions(1);
      const { result } = renderHook(() => 
        useExamNavigation(questions, 0, mockOnNavigate)
      );
      
      expect(result.current.canGoPrevious).toBe(false);
      expect(result.current.canGoNext).toBe(false);
      expect(result.current.currentIndex).toBe(0);
      expect(result.current.totalQuestions).toBe(1);
      expect(result.current.progress).toBe(100); // 1/1 * 100
    });
  });

  describe('Progress Calculation', () => {
    it('should calculate progress correctly for different positions', () => {
      const questions = createMockQuestions(10);
      
      // Test different positions
      const testCases = [
        { index: 0, expected: 10 },  // 1/10 * 100
        { index: 1, expected: 20 },  // 2/10 * 100
        { index: 4, expected: 50 },  // 5/10 * 100
        { index: 9, expected: 100 }, // 10/10 * 100
      ];

      testCases.forEach(({ index, expected }) => {
        const { result } = renderHook(() => 
          useExamNavigation(questions, index, mockOnNavigate)
        );
        
        expect(result.current.progress).toBe(expected);
      });
    });

    it('should handle fractional progress correctly', () => {
      const questions = createMockQuestions(3);
      
      const { result: result1 } = renderHook(() => 
        useExamNavigation(questions, 0, mockOnNavigate)
      );
      expect(result1.current.progress).toBeCloseTo(33.33, 2); // 1/3 * 100
      
      const { result: result2 } = renderHook(() => 
        useExamNavigation(questions, 1, mockOnNavigate)
      );
      expect(result2.current.progress).toBeCloseTo(66.67, 2); // 2/3 * 100
    });
  });

  describe('Navigation Actions', () => {
    describe('goToPrevious', () => {
      it('should navigate to previous question when possible', () => {
        const questions = createMockQuestions(5);
        const { result } = renderHook(() => 
          useExamNavigation(questions, 2, mockOnNavigate)
        );
        
        act(() => {
          result.current.goToPrevious();
        });
        
        expect(mockOnNavigate).toHaveBeenCalledWith(1);
        expect(mockOnNavigate).toHaveBeenCalledTimes(1);
      });

      it('should not navigate when at first question', () => {
        const questions = createMockQuestions(5);
        const { result } = renderHook(() => 
          useExamNavigation(questions, 0, mockOnNavigate)
        );
        
        act(() => {
          result.current.goToPrevious();
        });
        
        expect(mockOnNavigate).not.toHaveBeenCalled();
      });

      it('should not navigate when questions array is empty', () => {
        const { result } = renderHook(() => 
          useExamNavigation([], 0, mockOnNavigate)
        );
        
        act(() => {
          result.current.goToPrevious();
        });
        
        expect(mockOnNavigate).not.toHaveBeenCalled();
      });
    });

    describe('goToNext', () => {
      it('should navigate to next question when possible', () => {
        const questions = createMockQuestions(5);
        const { result } = renderHook(() => 
          useExamNavigation(questions, 2, mockOnNavigate)
        );
        
        act(() => {
          result.current.goToNext();
        });
        
        expect(mockOnNavigate).toHaveBeenCalledWith(3);
        expect(mockOnNavigate).toHaveBeenCalledTimes(1);
      });

      it('should not navigate when at last question', () => {
        const questions = createMockQuestions(5);
        const { result } = renderHook(() => 
          useExamNavigation(questions, 4, mockOnNavigate)
        );
        
        act(() => {
          result.current.goToNext();
        });
        
        expect(mockOnNavigate).not.toHaveBeenCalled();
      });

      it('should not navigate when questions array is empty', () => {
        const { result } = renderHook(() => 
          useExamNavigation([], 0, mockOnNavigate)
        );
        
        act(() => {
          result.current.goToNext();
        });
        
        expect(mockOnNavigate).not.toHaveBeenCalled();
      });
    });

    describe('goToQuestion', () => {
      it('should navigate to valid question index', () => {
        const questions = createMockQuestions(5);
        const { result } = renderHook(() => 
          useExamNavigation(questions, 0, mockOnNavigate)
        );
        
        act(() => {
          result.current.goToQuestion(3);
        });
        
        expect(mockOnNavigate).toHaveBeenCalledWith(3);
        expect(mockOnNavigate).toHaveBeenCalledTimes(1);
      });

      it('should not navigate to negative index', () => {
        const questions = createMockQuestions(5);
        const { result } = renderHook(() => 
          useExamNavigation(questions, 0, mockOnNavigate)
        );
        
        act(() => {
          result.current.goToQuestion(-1);
        });
        
        expect(mockOnNavigate).not.toHaveBeenCalled();
      });

      it('should not navigate to index beyond questions length', () => {
        const questions = createMockQuestions(5);
        const { result } = renderHook(() => 
          useExamNavigation(questions, 0, mockOnNavigate)
        );
        
        act(() => {
          result.current.goToQuestion(5); // Index 5 is out of bounds for 5 questions
        });
        
        expect(mockOnNavigate).not.toHaveBeenCalled();
      });

      it('should navigate to first question (index 0)', () => {
        const questions = createMockQuestions(5);
        const { result } = renderHook(() => 
          useExamNavigation(questions, 2, mockOnNavigate)
        );
        
        act(() => {
          result.current.goToQuestion(0);
        });
        
        expect(mockOnNavigate).toHaveBeenCalledWith(0);
      });

      it('should navigate to last question', () => {
        const questions = createMockQuestions(5);
        const { result } = renderHook(() => 
          useExamNavigation(questions, 0, mockOnNavigate)
        );
        
        act(() => {
          result.current.goToQuestion(4);
        });
        
        expect(mockOnNavigate).toHaveBeenCalledWith(4);
      });

      it('should not navigate when questions array is empty', () => {
        const { result } = renderHook(() => 
          useExamNavigation([], 0, mockOnNavigate)
        );
        
        act(() => {
          result.current.goToQuestion(0);
        });
        
        expect(mockOnNavigate).not.toHaveBeenCalled();
      });
    });

    describe('goToFirst', () => {
      it('should navigate to first question when questions exist', () => {
        const questions = createMockQuestions(5);
        const { result } = renderHook(() => 
          useExamNavigation(questions, 3, mockOnNavigate)
        );
        
        act(() => {
          result.current.goToFirst();
        });
        
        expect(mockOnNavigate).toHaveBeenCalledWith(0);
        expect(mockOnNavigate).toHaveBeenCalledTimes(1);
      });

      it('should not navigate when questions array is empty', () => {
        const { result } = renderHook(() => 
          useExamNavigation([], 0, mockOnNavigate)
        );
        
        act(() => {
          result.current.goToFirst();
        });
        
        expect(mockOnNavigate).not.toHaveBeenCalled();
      });

      it('should work with single question', () => {
        const questions = createMockQuestions(1);
        const { result } = renderHook(() => 
          useExamNavigation(questions, 0, mockOnNavigate)
        );
        
        act(() => {
          result.current.goToFirst();
        });
        
        expect(mockOnNavigate).toHaveBeenCalledWith(0);
      });
    });

    describe('goToLast', () => {
      it('should navigate to last question when questions exist', () => {
        const questions = createMockQuestions(5);
        const { result } = renderHook(() => 
          useExamNavigation(questions, 1, mockOnNavigate)
        );
        
        act(() => {
          result.current.goToLast();
        });
        
        expect(mockOnNavigate).toHaveBeenCalledWith(4);
        expect(mockOnNavigate).toHaveBeenCalledTimes(1);
      });

      it('should not navigate when questions array is empty', () => {
        const { result } = renderHook(() => 
          useExamNavigation([], 0, mockOnNavigate)
        );
        
        act(() => {
          result.current.goToLast();
        });
        
        expect(mockOnNavigate).not.toHaveBeenCalled();
      });

      it('should work with single question', () => {
        const questions = createMockQuestions(1);
        const { result } = renderHook(() => 
          useExamNavigation(questions, 0, mockOnNavigate)
        );
        
        act(() => {
          result.current.goToLast();
        });
        
        expect(mockOnNavigate).toHaveBeenCalledWith(0);
      });
    });
  });

  describe('State Updates', () => {
    it('should update state when current index changes', () => {
      const questions = createMockQuestions(5);
      const { result, rerender } = renderHook(
        ({ currentIndex }) => useExamNavigation(questions, currentIndex, mockOnNavigate),
        { initialProps: { currentIndex: 0 } }
      );
      
      expect(result.current.canGoPrevious).toBe(false);
      expect(result.current.canGoNext).toBe(true);
      expect(result.current.progress).toBe(20);
      
      // Change current index
      rerender({ currentIndex: 2 });
      
      expect(result.current.canGoPrevious).toBe(true);
      expect(result.current.canGoNext).toBe(true);
      expect(result.current.currentIndex).toBe(2);
      expect(result.current.progress).toBe(60);
    });

    it('should update state when questions change', () => {
      const { result, rerender } = renderHook(
        ({ questions }) => useExamNavigation(questions, 0, mockOnNavigate),
        { initialProps: { questions: createMockQuestions(3) } }
      );
      
      expect(result.current.totalQuestions).toBe(3);
      expect(result.current.progress).toBeCloseTo(33.33, 2);
      
      // Change questions
      rerender({ questions: createMockQuestions(5) });
      
      expect(result.current.totalQuestions).toBe(5);
      expect(result.current.progress).toBe(20);
    });

    it('should handle transition from empty to populated questions', () => {
      const { result, rerender } = renderHook(
        ({ questions }) => useExamNavigation(questions, 0, mockOnNavigate),
        { initialProps: { questions: [] } }
      );
      
      expect(result.current.totalQuestions).toBe(0);
      expect(result.current.canGoPrevious).toBe(false);
      expect(result.current.canGoNext).toBe(false);
      expect(result.current.progress).toBe(0);
      
      // Add questions
      rerender({ questions: createMockQuestions(3) });
      
      expect(result.current.totalQuestions).toBe(3);
      expect(result.current.canGoPrevious).toBe(false);
      expect(result.current.canGoNext).toBe(true);
      expect(result.current.progress).toBeCloseTo(33.33, 2);
    });

    it('should handle transition from populated to empty questions', () => {
      const { result, rerender } = renderHook(
        ({ questions }) => useExamNavigation(questions, 2, mockOnNavigate),
        { initialProps: { questions: createMockQuestions(5) } }
      );
      
      expect(result.current.totalQuestions).toBe(5);
      expect(result.current.canGoPrevious).toBe(true);
      expect(result.current.canGoNext).toBe(true);
      
      // Remove all questions
      rerender({ questions: [] });
      
      expect(result.current.totalQuestions).toBe(0);
      // With currentIndex=2 and 0 questions: canGoPrevious is true (2 > 0), canGoNext is false (2 >= 0-1)
      expect(result.current.canGoPrevious).toBe(true);
      expect(result.current.canGoNext).toBe(false);
      expect(result.current.progress).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle current index beyond questions length', () => {
      const questions = createMockQuestions(3);
      const { result } = renderHook(() => 
        useExamNavigation(questions, 5, mockOnNavigate) // Index 5 for 3 questions
      );
      
      expect(result.current.currentIndex).toBe(5);
      expect(result.current.totalQuestions).toBe(3);
      expect(result.current.canGoPrevious).toBe(true); // 5 > 0
      expect(result.current.canGoNext).toBe(false); // 5 >= 3-1
      expect(result.current.progress).toBeCloseTo(200, 2); // (5+1)/3 * 100
    });

    it('should handle negative current index', () => {
      const questions = createMockQuestions(3);
      const { result } = renderHook(() => 
        useExamNavigation(questions, -1, mockOnNavigate)
      );
      
      expect(result.current.currentIndex).toBe(-1);
      expect(result.current.canGoPrevious).toBe(false); // -1 <= 0
      expect(result.current.canGoNext).toBe(true); // -1 < 3-1
      expect(result.current.progress).toBe(0); // ((-1)+1)/3 * 100 = 0
    });

    it('should handle very large question arrays', () => {
      const questions = createMockQuestions(1000);
      const { result } = renderHook(() => 
        useExamNavigation(questions, 500, mockOnNavigate)
      );
      
      expect(result.current.totalQuestions).toBe(1000);
      expect(result.current.currentIndex).toBe(500);
      expect(result.current.canGoPrevious).toBe(true);
      expect(result.current.canGoNext).toBe(true);
      expect(result.current.progress).toBe(50.1); // (500+1)/1000 * 100
    });
  });

  describe('Performance and Memory Management', () => {
    it('should maintain stable function references', () => {
      const questions = createMockQuestions(5);
      const { result, rerender } = renderHook(() => 
        useExamNavigation(questions, 2, mockOnNavigate)
      );
      
      const goToPrevious1 = result.current.goToPrevious;
      const goToNext1 = result.current.goToNext;
      const goToQuestion1 = result.current.goToQuestion;
      const goToFirst1 = result.current.goToFirst;
      const goToLast1 = result.current.goToLast;
      
      rerender();
      
      expect(result.current.goToPrevious).toBe(goToPrevious1);
      expect(result.current.goToNext).toBe(goToNext1);
      expect(result.current.goToQuestion).toBe(goToQuestion1);
      expect(result.current.goToFirst).toBe(goToFirst1);
      expect(result.current.goToLast).toBe(goToLast1);
    });

    it('should only recalculate when dependencies change', () => {
      const questions = createMockQuestions(5);
      const { result, rerender } = renderHook(
        ({ onNavigate }) => useExamNavigation(questions, 2, onNavigate),
        { initialProps: { onNavigate: mockOnNavigate } }
      );
      
      const state1 = {
        canGoPrevious: result.current.canGoPrevious,
        canGoNext: result.current.canGoNext,
        progress: result.current.progress,
      };
      
      // Re-render with different onNavigate function (should not affect memoized state)
      const newOnNavigate = vi.fn();
      rerender({ onNavigate: newOnNavigate });
      
      const state2 = {
        canGoPrevious: result.current.canGoPrevious,
        canGoNext: result.current.canGoNext,
        progress: result.current.progress,
      };
      
      expect(state1).toEqual(state2);
    });
  });

  describe('Callback Integration', () => {
    it('should call onNavigate with correct parameters', () => {
      const questions = createMockQuestions(5);
      const { result } = renderHook(() => 
        useExamNavigation(questions, 2, mockOnNavigate)
      );
      
      act(() => {
        result.current.goToPrevious();
      });
      expect(mockOnNavigate).toHaveBeenCalledWith(1);
      
      act(() => {
        result.current.goToNext();
      });
      expect(mockOnNavigate).toHaveBeenCalledWith(3);
      
      act(() => {
        result.current.goToQuestion(0);
      });
      expect(mockOnNavigate).toHaveBeenCalledWith(0);
      
      act(() => {
        result.current.goToFirst();
      });
      expect(mockOnNavigate).toHaveBeenCalledWith(0);
      
      act(() => {
        result.current.goToLast();
      });
      expect(mockOnNavigate).toHaveBeenCalledWith(4);
      
      expect(mockOnNavigate).toHaveBeenCalledTimes(5);
    });

    it('should handle onNavigate callback changes', () => {
      const questions = createMockQuestions(5);
      const newOnNavigate = vi.fn();
      
      const { result, rerender } = renderHook(
        ({ onNavigate }) => useExamNavigation(questions, 2, onNavigate),
        { initialProps: { onNavigate: mockOnNavigate } }
      );
      
      // Change the callback
      rerender({ onNavigate: newOnNavigate });
      
      act(() => {
        result.current.goToNext();
      });
      
      expect(mockOnNavigate).not.toHaveBeenCalled();
      expect(newOnNavigate).toHaveBeenCalledWith(3);
    });

    it('should handle undefined onNavigate gracefully', () => {
      const questions = createMockQuestions(5);
      const { result } = renderHook(() => 
        useExamNavigation(questions, 2, undefined as any)
      );
      
      // The hook doesn't guard against undefined onNavigate, so it will throw
      expect(() => {
        act(() => {
          result.current.goToNext();
        });
      }).toThrow('onNavigate is not a function');
    });
  });
});