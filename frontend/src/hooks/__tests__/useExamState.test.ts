import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useExamState, Question, ExamData } from '../useExamState';
import { useAuthStore } from '../../stores/authStore';
import { useNavigate } from 'react-router';
import { supabase } from '../../supabase.config';

// Mock dependencies
vi.mock('../../stores/authStore');
vi.mock('react-router');
vi.mock('../../supabase.config', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn()
          }))
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn()
        }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn()
        }))
      }))
    }))
  }
}));

const mockUseAuthStore = vi.mocked(useAuthStore);
const mockUseNavigate = vi.mocked(useNavigate);
const mockSupabase = vi.mocked(supabase);

// Mock navigate function
const mockNavigate = vi.fn();

// Mock user
const mockUser = {
  id: 'user-123',
  email: 'test@example.com'
};

// Mock exam data
const mockExamData: ExamData = {
  id: 'exam-123',
  user_id: 'user-123',
  titulo: 'Test Exam',
  descripcion: 'A test exam description',
  dificultad: 'easy',
  estado: 'pendiente',
  numero_preguntas: 3,
  datos: [
    {
      id: 1,
      pregunta: 'What is 2+2?',
      opciones: ['2', '3', '4', '5'],
      correcta: 2
    },
    {
      id: 2,
      pregunta: 'What is the capital of France?',
      opciones: ['London', 'Berlin', 'Paris', 'Madrid'],
      correcta: 2
    },
    {
      id: 3,
      pregunta: 'What is JavaScript?',
      opciones: ['Language', 'Framework', 'Library', 'Database'],
      correcta: 0
    }
  ],
  fecha_inicio: null,
  tiempo_limite_segundos: 3600,
  tiempo_tomado_segundos: 0,
  respuestas_usuario: {},
  questions_pinned: {},
  feedback: {}
};

describe('useExamState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset localStorage
    localStorage.clear();
    
    // Mock auth store
    mockUseAuthStore.mockReturnValue({
      user: mockUser,
      isLoading: false,
      token: 'mock-token'
    } as any);
    
    // Mock navigate
    mockUseNavigate.mockReturnValue(mockNavigate);
    
    // Mock successful supabase response by default
    const mockFrom = vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: mockExamData,
              error: null
            })
          }))
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn().mockResolvedValue({ error: null })
        }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({
            data: { id: 'new-exam-123' },
            error: null
          })
        }))
      }))
    }));
    
    mockSupabase.from.mockImplementation(mockFrom);
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Initialization', () => {
    it('should initialize with correct default state', async () => {
      const { result } = renderHook(() => useExamState('exam-123'));
      
      expect(result.current.exam).toBeNull();
      expect(result.current.currentQuestionIndex).toBe(0);
      expect(result.current.userAnswers).toEqual({});
      expect(result.current.pinnedQuestions).toEqual({});
      expect(result.current.feedback).toEqual({});
      expect(result.current.isSubmitted).toBe(false);
      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it('should load exam data on mount', async () => {
      const { result } = renderHook(() => useExamState('exam-123'));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.exam).toEqual(mockExamData);
      expect(result.current.error).toBeNull();
    });

    it('should handle loading state properly', async () => {
      const { result } = renderHook(() => useExamState('exam-123'));
      
      expect(result.current.loading).toBe(true);
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should not load exam when examId is empty', async () => {
      const { result } = renderHook(() => useExamState(''));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(true);
      });
      
      expect(mockSupabase.from).not.toHaveBeenCalled();
    });

    it('should not load exam when user is not available', async () => {
      mockUseAuthStore.mockReturnValue({
        user: null,
        isLoading: false,
        token: null
      } as any);
      
      const { result } = renderHook(() => useExamState('exam-123'));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(true);
      });
      
      expect(mockSupabase.from).not.toHaveBeenCalled();
    });
  });

  describe('Exam Loading', () => {
    it('should handle supabase error during load', async () => {
      const errorMessage = 'Database connection failed';
      const mockFrom = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: new Error(errorMessage)
              })
            }))
          }))
        }))
      }));
      
      mockSupabase.from.mockImplementation(mockFrom);
      
      const { result } = renderHook(() => useExamState('exam-123'));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.error).toBe(errorMessage);
      expect(result.current.exam).toBeNull();
    });

    it('should load saved state from localStorage', async () => {
      const savedState = {
        currentQuestionIndex: 1,
        userAnswers: { 0: 2 },
        pinnedQuestions: { 1: true },
        feedback: { 0: 'Good answer' }
      };
      
      localStorage.setItem('examen_estado_exam-123', JSON.stringify(savedState));
      
      const { result } = renderHook(() => useExamState('exam-123'));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.currentQuestionIndex).toBe(1);
      expect(result.current.userAnswers).toEqual({ 0: 2 });
      expect(result.current.pinnedQuestions).toEqual({ 1: true });
      expect(result.current.feedback).toEqual({ 0: 'Good answer' });
    });

    it('should ignore saved state for completed exams', async () => {
      const savedState = {
        currentQuestionIndex: 1,
        userAnswers: { 0: 2 }
      };
      
      localStorage.setItem('examen_estado_exam-123', JSON.stringify(savedState));
      
      const completedExam = { ...mockExamData, estado: 'terminado' as const };
      const mockFrom = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: completedExam,
                error: null
              })
            }))
          }))
        }))
      }));
      
      mockSupabase.from.mockImplementation(mockFrom);
      
      const { result } = renderHook(() => useExamState('exam-123'));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.currentQuestionIndex).toBe(0);
      expect(result.current.isSubmitted).toBe(true);
    });

    it('should handle invalid localStorage data gracefully', async () => {
      localStorage.setItem('examen_estado_exam-123', 'invalid json');
      
      const { result } = renderHook(() => useExamState('exam-123'));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.currentQuestionIndex).toBe(0);
      expect(result.current.userAnswers).toEqual({});
    });

    it('should mark pending exam as in progress', async () => {
      const mockUpdate = vi.fn().mockResolvedValue({ error: null });
      const mockFrom = vi.fn((table) => {
        if (table === 'examenes') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(() => ({
                  single: vi.fn().mockResolvedValue({
                    data: mockExamData,
                    error: null
                  })
                }))
              }))
            })),
            update: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: mockUpdate
              }))
            }))
          };
        }
      });
      
      mockSupabase.from.mockImplementation(mockFrom);
      
      const { result } = renderHook(() => useExamState('exam-123'));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(mockUpdate).toHaveBeenCalled();
    });
  });

  describe('Answer Management', () => {
    it('should set answer correctly', async () => {
      const { result } = renderHook(() => useExamState('exam-123'));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      act(() => {
        result.current.setAnswer(0, 2);
      });
      
      expect(result.current.userAnswers).toEqual({ 0: 2 });
    });

    it('should update answer when called multiple times', async () => {
      const { result } = renderHook(() => useExamState('exam-123'));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      act(() => {
        result.current.setAnswer(0, 1);
      });
      
      expect(result.current.userAnswers).toEqual({ 0: 1 });
      
      act(() => {
        result.current.setAnswer(0, 3);
      });
      
      expect(result.current.userAnswers).toEqual({ 0: 3 });
    });

    it('should handle multiple question answers', async () => {
      const { result } = renderHook(() => useExamState('exam-123'));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      act(() => {
        result.current.setAnswer(0, 2);
        result.current.setAnswer(1, 1);
        result.current.setAnswer(2, 0);
      });
      
      expect(result.current.userAnswers).toEqual({ 0: 2, 1: 1, 2: 0 });
    });

    it('should not set answer when exam is submitted', async () => {
      const submittedExam = { ...mockExamData, estado: 'terminado' as const };
      const mockFrom = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: submittedExam,
                error: null
              })
            }))
          }))
        }))
      }));
      
      mockSupabase.from.mockImplementation(mockFrom);
      
      const { result } = renderHook(() => useExamState('exam-123'));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      act(() => {
        result.current.setAnswer(0, 2);
      });
      
      expect(result.current.userAnswers).toEqual({});
    });
  });

  describe('Pin Management', () => {
    it('should pin question correctly', async () => {
      const { result } = renderHook(() => useExamState('exam-123'));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      act(() => {
        result.current.togglePin(0);
      });
      
      expect(result.current.pinnedQuestions).toEqual({ 0: true });
    });

    it('should unpin question when called again', async () => {
      const { result } = renderHook(() => useExamState('exam-123'));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      act(() => {
        result.current.togglePin(0);
      });
      
      expect(result.current.pinnedQuestions).toEqual({ 0: true });
      
      act(() => {
        result.current.togglePin(0);
      });
      
      expect(result.current.pinnedQuestions).toEqual({});
    });

    it('should handle multiple pinned questions', async () => {
      const { result } = renderHook(() => useExamState('exam-123'));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      act(() => {
        result.current.togglePin(0);
        result.current.togglePin(2);
      });
      
      expect(result.current.pinnedQuestions).toEqual({ 0: true, 2: true });
    });
  });

  describe('Navigation', () => {
    it('should navigate to valid question index', async () => {
      const { result } = renderHook(() => useExamState('exam-123'));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      act(() => {
        result.current.navigateToQuestion(1);
      });
      
      expect(result.current.currentQuestionIndex).toBe(1);
    });

    it('should not navigate to negative index', async () => {
      const { result } = renderHook(() => useExamState('exam-123'));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      act(() => {
        result.current.navigateToQuestion(-1);
      });
      
      expect(result.current.currentQuestionIndex).toBe(0);
    });

    it('should not navigate beyond available questions', async () => {
      const { result } = renderHook(() => useExamState('exam-123'));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      act(() => {
        result.current.navigateToQuestion(10);
      });
      
      expect(result.current.currentQuestionIndex).toBe(0);
    });

    it('should not navigate when exam is null', async () => {
      mockSupabase.from.mockImplementation(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: new Error('Not found')
              })
            }))
          }))
        }))
      }));
      
      const { result } = renderHook(() => useExamState('exam-123'));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      act(() => {
        result.current.navigateToQuestion(1);
      });
      
      expect(result.current.currentQuestionIndex).toBe(0);
    });
  });

  describe('Exam Submission', () => {
    it('should submit exam successfully', async () => {
      const mockUpdate = vi.fn().mockResolvedValue({ error: null });
      const mockFrom = vi.fn((table) => {
        if (table === 'examenes') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(() => ({
                  single: vi.fn().mockResolvedValue({
                    data: mockExamData,
                    error: null
                  })
                }))
              }))
            })),
            update: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: mockUpdate
              }))
            }))
          };
        }
      });
      
      mockSupabase.from.mockImplementation(mockFrom);
      
      const { result } = renderHook(() => useExamState('exam-123'));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      // Add some answers first
      act(() => {
        result.current.setAnswer(0, 2);
        result.current.setAnswer(1, 1);
      });
      
      await act(async () => {
        await result.current.submitExam(1800); // 30 minutes
      });
      
      expect(result.current.isSubmitted).toBe(true);
      expect(mockUpdate).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/examen/exam-123');
    });

    it('should save submission to localStorage before supabase', async () => {
      const { result } = renderHook(() => useExamState('exam-123'));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      await act(async () => {
        await result.current.submitExam(1800);
      });
      
      // Should clean up localStorage after successful submission
      expect(localStorage.getItem('examen_final_pending_exam-123')).toBeNull();
      expect(localStorage.getItem('examen_estado_exam-123')).toBeNull();
    });

    it('should handle submission error', async () => {
      const mockUpdate = vi.fn().mockResolvedValue({ 
        error: new Error('Network error') 
      });
      const mockFrom = vi.fn((table) => {
        if (table === 'examenes') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(() => ({
                  single: vi.fn().mockResolvedValue({
                    data: mockExamData,
                    error: null
                  })
                }))
              }))
            })),
            update: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: mockUpdate
              }))
            }))
          };
        }
      });
      
      mockSupabase.from.mockImplementation(mockFrom);
      
      const { result } = renderHook(() => useExamState('exam-123'));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      // Check the state before submission attempt
      expect(result.current.isSubmitted).toBe(false);
      
      let submissionError: Error | null = null;
      await act(async () => {
        try {
          await result.current.submitExam(1800);
        } catch (error) {
          submissionError = error as Error;
        }
      });
      
      // Should have thrown an error
      expect(submissionError).toBeInstanceOf(Error);
      expect(submissionError?.message).toBe('Network error');
      
      // isSubmitted should be true even after error
      expect(result.current.isSubmitted).toBe(true);
      // Should not navigate on error
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should not submit when exam is null', async () => {
      mockSupabase.from.mockImplementation(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: new Error('Not found')
              })
            }))
          }))
        }))
      }));
      
      const { result } = renderHook(() => useExamState('exam-123'));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      await act(async () => {
        await result.current.submitExam(1800);
      });
      
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should not submit when already submitted', async () => {
      const submittedExam = { ...mockExamData, estado: 'terminado' as const };
      const mockFrom = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: submittedExam,
                error: null
              })
            }))
          }))
        }))
      }));
      
      mockSupabase.from.mockImplementation(mockFrom);
      
      const { result } = renderHook(() => useExamState('exam-123'));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      await act(async () => {
        await result.current.submitExam(1800);
      });
      
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Exam Suspension', () => {
    it('should suspend exam successfully', async () => {
      const mockUpdate = vi.fn().mockResolvedValue({ error: null });
      const mockFrom = vi.fn((table) => {
        if (table === 'examenes') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(() => ({
                  single: vi.fn().mockResolvedValue({
                    data: mockExamData,
                    error: null
                  })
                }))
              }))
            })),
            update: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: mockUpdate
              }))
            }))
          };
        }
      });
      
      mockSupabase.from.mockImplementation(mockFrom);
      
      const { result } = renderHook(() => useExamState('exam-123'));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      await act(async () => {
        await result.current.suspendExam(900); // 15 minutes
      });
      
      expect(mockUpdate).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/examenes');
    });

    it('should handle suspension error', async () => {
      const mockUpdate = vi.fn().mockResolvedValue({ 
        error: new Error('Suspension failed') 
      });
      const mockFrom = vi.fn((table) => {
        if (table === 'examenes') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(() => ({
                  single: vi.fn().mockResolvedValue({
                    data: mockExamData,
                    error: null
                  })
                }))
              }))
            })),
            update: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: mockUpdate
              }))
            }))
          };
        }
      });
      
      mockSupabase.from.mockImplementation(mockFrom);
      
      const { result } = renderHook(() => useExamState('exam-123'));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      await expect(
        act(async () => {
          await result.current.suspendExam(900);
        })
      ).rejects.toThrow('Suspension failed');
    });

    it('should not suspend when exam is null', async () => {
      mockSupabase.from.mockImplementation(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: new Error('Not found')
              })
            }))
          }))
        }))
      }));
      
      const { result } = renderHook(() => useExamState('exam-123'));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      await act(async () => {
        await result.current.suspendExam(900);
      });
      
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Exam Reset', () => {
    it('should reset exam successfully', async () => {
      const mockInsert = vi.fn().mockResolvedValue({
        data: { id: 'new-exam-456' },
        error: null
      });
      const mockFrom = vi.fn((table) => {
        if (table === 'examenes') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(() => ({
                  single: vi.fn().mockResolvedValue({
                    data: mockExamData,
                    error: null
                  })
                }))
              }))
            })),
            insert: vi.fn(() => ({
              select: vi.fn(() => ({
                single: mockInsert
              }))
            }))
          };
        }
      });
      
      mockSupabase.from.mockImplementation(mockFrom);
      
      const { result } = renderHook(() => useExamState('exam-123'));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      await act(async () => {
        await result.current.resetExam();
      });
      
      expect(mockInsert).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/examen/new-exam-456');
    });

    it('should handle reset error', async () => {
      const mockInsert = vi.fn().mockResolvedValue({
        data: null,
        error: new Error('Reset failed')
      });
      const mockFrom = vi.fn((table) => {
        if (table === 'examenes') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(() => ({
                  single: vi.fn().mockResolvedValue({
                    data: mockExamData,
                    error: null
                  })
                }))
              }))
            })),
            insert: vi.fn(() => ({
              select: vi.fn(() => ({
                single: mockInsert
              }))
            }))
          };
        }
      });
      
      mockSupabase.from.mockImplementation(mockFrom);
      
      const { result } = renderHook(() => useExamState('exam-123'));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      await expect(
        act(async () => {
          await result.current.resetExam();
        })
      ).rejects.toThrow('Reset failed');
    });

    it('should clean up localStorage on reset', async () => {
      localStorage.setItem('examen_estado_exam-123', '{}');
      localStorage.setItem('examen_final_pending_exam-123', '{}');
      
      const { result } = renderHook(() => useExamState('exam-123'));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      await act(async () => {
        await result.current.resetExam();
      });
      
      expect(localStorage.getItem('examen_estado_exam-123')).toBeNull();
      expect(localStorage.getItem('examen_final_pending_exam-123')).toBeNull();
    });

    it('should not reset when exam is null', async () => {
      mockSupabase.from.mockImplementation(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: new Error('Not found')
              })
            }))
          }))
        }))
      }));
      
      const { result } = renderHook(() => useExamState('exam-123'));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      await act(async () => {
        await result.current.resetExam();
      });
      
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('LocalStorage Management', () => {
    it('should handle null localStorage data', () => {
      const { result } = renderHook(() => useExamState('exam-123'));
      
      // Should not crash when localStorage is empty
      expect(result.current.loading).toBe(true);
    });

    it('should handle corrupted localStorage data', () => {
      localStorage.setItem('examen_estado_exam-123', '{invalid json}');
      
      const { result } = renderHook(() => useExamState('exam-123'));
      
      // Should not crash with invalid JSON
      expect(result.current.loading).toBe(true);
    });

    it('should handle non-object localStorage data', async () => {
      localStorage.setItem('examen_estado_exam-123', '"string"');
      
      const { result } = renderHook(() => useExamState('exam-123'));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      // Should use default state when localStorage contains non-object
      expect(result.current.currentQuestionIndex).toBe(0);
      expect(result.current.userAnswers).toEqual({});
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing exam ID', () => {
      const { result } = renderHook(() => useExamState(''));
      
      expect(result.current.exam).toBeNull();
      expect(result.current.loading).toBe(true);
    });

    it('should handle missing user', async () => {
      mockUseAuthStore.mockReturnValue({
        user: null,
        isLoading: false,
        token: null
      } as any);
      
      const { result } = renderHook(() => useExamState('exam-123'));
      
      expect(result.current.exam).toBeNull();
      expect(result.current.loading).toBe(true);
    });

    it('should handle exam without questions data', async () => {
      const examWithoutQuestions = { ...mockExamData, datos: [] };
      const mockFrom = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: examWithoutQuestions,
                error: null
              })
            }))
          }))
        }))
      }));
      
      mockSupabase.from.mockImplementation(mockFrom);
      
      const { result } = renderHook(() => useExamState('exam-123'));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      act(() => {
        result.current.navigateToQuestion(1);
      });
      
      expect(result.current.currentQuestionIndex).toBe(0);
    });
  });

  describe('Memory Management', () => {
    it('should maintain stable function references', async () => {
      const { result, rerender } = renderHook(() => useExamState('exam-123'));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      const setAnswer1 = result.current.setAnswer;
      const togglePin1 = result.current.togglePin;
      const navigateToQuestion1 = result.current.navigateToQuestion;
      
      rerender();
      
      expect(result.current.setAnswer).toBe(setAnswer1);
      expect(result.current.togglePin).toBe(togglePin1);
      expect(result.current.navigateToQuestion).toBe(navigateToQuestion1);
    });

    it('should update refs when state changes', async () => {
      const { result } = renderHook(() => useExamState('exam-123'));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      act(() => {
        result.current.setAnswer(0, 2);
        result.current.togglePin(1);
      });
      
      // Refs should be updated internally (this is tested indirectly through submit/suspend)
      expect(result.current.userAnswers).toEqual({ 0: 2 });
      expect(result.current.pinnedQuestions).toEqual({ 1: true });
    });
  });
});