import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useExamTimer } from '../useExamTimer';

describe('useExamTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe('Initialization', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useExamTimer(undefined));
      
      expect(result.current.timeLeft).toBeUndefined();
      expect(result.current.timeSpent).toBe(0);
      expect(result.current.isRunning).toBe(false);
      expect(result.current.isTimeUp).toBe(false);
    });

    it('should initialize with time limit', () => {
      const { result } = renderHook(() => useExamTimer(3600)); // 1 hour
      
      expect(result.current.timeLeft).toBe(3600);
      expect(result.current.timeSpent).toBe(0);
      expect(result.current.isRunning).toBe(false);
      expect(result.current.isTimeUp).toBe(false);
    });

    it('should initialize with initial time spent', () => {
      const { result } = renderHook(() => useExamTimer(3600, undefined, 1800)); // 30 minutes spent
      
      expect(result.current.timeLeft).toBe(1800); // 30 minutes left
      expect(result.current.timeSpent).toBe(1800);
      expect(result.current.isRunning).toBe(false);
      expect(result.current.isTimeUp).toBe(false);
    });

    it('should handle case where initial time spent exceeds time limit', () => {
      const { result } = renderHook(() => useExamTimer(1800, undefined, 3600)); // More time spent than limit
      
      expect(result.current.timeLeft).toBe(0);
      expect(result.current.timeSpent).toBe(3600);
      expect(result.current.isRunning).toBe(false);
      expect(result.current.isTimeUp).toBe(true);
    });

    it('should handle zero time limit', () => {
      const { result } = renderHook(() => useExamTimer(0));
      
      // Zero time limit is treated the same as undefined - not initialized
      expect(result.current.timeLeft).toBeUndefined();
      expect(result.current.timeSpent).toBe(0);
      expect(result.current.isRunning).toBe(false);
      expect(result.current.isTimeUp).toBe(false);
    });

    it('should handle negative time limit', () => {
      const { result } = renderHook(() => useExamTimer(-100));
      
      // Should not initialize with negative time
      expect(result.current.timeLeft).toBeUndefined();
      expect(result.current.timeSpent).toBe(0);
    });
  });

  describe('Timer Actions', () => {
    it('should start timer correctly', () => {
      const { result } = renderHook(() => useExamTimer(60)); // 1 minute
      
      act(() => {
        result.current.start();
      });
      
      expect(result.current.isRunning).toBe(true);
    });

    it('should not start when time limit is undefined', () => {
      const { result } = renderHook(() => useExamTimer(undefined));
      
      act(() => {
        result.current.start();
      });
      
      expect(result.current.isRunning).toBe(false);
    });

    it('should not start when time is up', () => {
      const { result } = renderHook(() => useExamTimer(60, undefined, 60)); // Time already spent
      
      act(() => {
        result.current.start();
      });
      
      expect(result.current.isRunning).toBe(false);
      expect(result.current.isTimeUp).toBe(true);
    });

    it('should pause timer correctly', () => {
      const { result } = renderHook(() => useExamTimer(60));
      
      act(() => {
        result.current.start();
      });
      
      expect(result.current.isRunning).toBe(true);
      
      act(() => {
        result.current.pause();
      });
      
      expect(result.current.isRunning).toBe(false);
    });

    it('should stop timer correctly', () => {
      const { result } = renderHook(() => useExamTimer(60));
      
      act(() => {
        result.current.start();
      });
      
      expect(result.current.isRunning).toBe(true);
      
      act(() => {
        result.current.stop();
      });
      
      expect(result.current.isRunning).toBe(false);
    });

    it('should reset timer with new time limit', () => {
      const { result } = renderHook(() => useExamTimer(60));
      
      act(() => {
        result.current.start();
      });
      
      act(() => {
        vi.advanceTimersByTime(5000); // 5 seconds
      });
      
      act(() => {
        result.current.reset(120); // Reset to 2 minutes
      });
      
      expect(result.current.timeLeft).toBe(120);
      expect(result.current.timeSpent).toBe(0);
      expect(result.current.isRunning).toBe(false);
      expect(result.current.isTimeUp).toBe(false);
    });
  });

  describe('Timer Countdown', () => {
    it('should count down correctly', () => {
      const { result } = renderHook(() => useExamTimer(60)); // 1 minute
      
      act(() => {
        result.current.start();
      });
      
      // Advance time by 5 seconds
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      
      expect(result.current.timeLeft).toBe(55);
      expect(result.current.timeSpent).toBe(5);
      expect(result.current.isRunning).toBe(true);
    });

    it('should handle multiple time advances', () => {
      const { result } = renderHook(() => useExamTimer(60));
      
      act(() => {
        result.current.start();
      });
      
      // Advance time multiple times
      act(() => {
        vi.advanceTimersByTime(10000); // 10 seconds
      });
      
      expect(result.current.timeLeft).toBe(50);
      expect(result.current.timeSpent).toBe(10);
      
      act(() => {
        vi.advanceTimersByTime(20000); // 20 more seconds
      });
      
      expect(result.current.timeLeft).toBe(30);
      expect(result.current.timeSpent).toBe(30);
    });

    it('should not count when paused', () => {
      const { result } = renderHook(() => useExamTimer(60));
      
      act(() => {
        result.current.start();
      });
      
      act(() => {
        vi.advanceTimersByTime(5000); // 5 seconds
      });
      
      act(() => {
        result.current.pause();
      });
      
      const timeLeftAfterPause = result.current.timeLeft;
      const timeSpentAfterPause = result.current.timeSpent;
      
      act(() => {
        vi.advanceTimersByTime(10000); // 10 more seconds while paused
      });
      
      // Should not change while paused
      expect(result.current.timeLeft).toBe(timeLeftAfterPause);
      expect(result.current.timeSpent).toBe(timeSpentAfterPause);
    });

    it('should resume from paused state correctly', () => {
      const { result } = renderHook(() => useExamTimer(60));
      
      // Start and run for 5 seconds
      act(() => {
        result.current.start();
      });
      
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      
      // Pause
      act(() => {
        result.current.pause();
      });
      
      expect(result.current.timeSpent).toBe(5);
      expect(result.current.timeLeft).toBe(55);
      
      // Resume
      act(() => {
        result.current.start();
      });
      
      act(() => {
        vi.advanceTimersByTime(10000); // 10 more seconds
      });
      
      expect(result.current.timeSpent).toBe(15);
      expect(result.current.timeLeft).toBe(45);
    });
  });

  describe('Time Up Handling', () => {
    it('should call onTimeUp when timer reaches zero', () => {
      const onTimeUp = vi.fn();
      const { result } = renderHook(() => useExamTimer(5, onTimeUp)); // 5 seconds
      
      act(() => {
        result.current.start();
      });
      
      act(() => {
        vi.advanceTimersByTime(5000); // 5 seconds - should reach zero
      });
      
      expect(result.current.timeLeft).toBe(0);
      expect(result.current.isTimeUp).toBe(true);
      expect(result.current.isRunning).toBe(false);
      
      // onTimeUp should be called asynchronously
      act(() => {
        vi.runAllTimers();
      });
      
      expect(onTimeUp).toHaveBeenCalledTimes(1);
    });

    it('should not call onTimeUp multiple times', () => {
      const onTimeUp = vi.fn();
      const { result } = renderHook(() => useExamTimer(5, onTimeUp));
      
      act(() => {
        result.current.start();
      });
      
      act(() => {
        vi.advanceTimersByTime(10000); // Advance beyond time limit
      });
      
      act(() => {
        vi.runAllTimers();
      });
      
      expect(onTimeUp).toHaveBeenCalledTimes(1);
    });

    it('should not call onTimeUp when timer is paused at zero', () => {
      const onTimeUp = vi.fn();
      const { result } = renderHook(() => useExamTimer(5, onTimeUp));
      
      act(() => {
        result.current.start();
      });
      
      act(() => {
        vi.advanceTimersByTime(4000); // 4 seconds
      });
      
      act(() => {
        result.current.pause();
      });
      
      // Manually advance to zero (simulating edge case)
      act(() => {
        vi.advanceTimersByTime(2000);
      });
      
      expect(onTimeUp).not.toHaveBeenCalled();
    });

    it('should handle onTimeUp callback change', () => {
      const onTimeUp1 = vi.fn();
      const onTimeUp2 = vi.fn();
      
      const { result, rerender } = renderHook(
        ({ callback }) => useExamTimer(5, callback),
        { initialProps: { callback: onTimeUp1 } }
      );
      
      act(() => {
        result.current.start();
      });
      
      // Change callback before time is up
      rerender({ callback: onTimeUp2 });
      
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      
      act(() => {
        vi.runAllTimers();
      });
      
      expect(onTimeUp1).not.toHaveBeenCalled();
      expect(onTimeUp2).toHaveBeenCalledTimes(1);
    });

    it('should handle undefined onTimeUp callback', () => {
      const { result } = renderHook(() => useExamTimer(5, undefined));
      
      act(() => {
        result.current.start();
      });
      
      expect(() => {
        act(() => {
          vi.advanceTimersByTime(5000);
        });
        
        act(() => {
          vi.runAllTimers();
        });
      }).not.toThrow();
      
      expect(result.current.isTimeUp).toBe(true);
    });
  });

  describe('Time Limit Changes', () => {
    it('should update when time limit changes', () => {
      const { result, rerender } = renderHook(
        ({ timeLimit }) => useExamTimer(timeLimit),
        { initialProps: { timeLimit: 60 } }
      );
      
      expect(result.current.timeLeft).toBe(60);
      
      // Change time limit
      rerender({ timeLimit: 120 });
      
      expect(result.current.timeLeft).toBe(120);
      expect(result.current.timeSpent).toBe(0);
      expect(result.current.isRunning).toBe(false);
    });

    it('should preserve state when time limit stays the same', () => {
      const { result, rerender } = renderHook(
        ({ timeLimit }) => useExamTimer(timeLimit),
        { initialProps: { timeLimit: 60 } }
      );
      
      act(() => {
        result.current.start();
      });
      
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      
      const timeLeft = result.current.timeLeft;
      const timeSpent = result.current.timeSpent;
      
      // Re-render with same time limit
      rerender({ timeLimit: 60 });
      
      // Should not reset
      expect(result.current.timeLeft).toBe(timeLeft);
      expect(result.current.timeSpent).toBe(timeSpent);
    });

    it('should handle change from undefined to defined time limit', () => {
      const { result, rerender } = renderHook(
        ({ timeLimit }) => useExamTimer(timeLimit),
        { initialProps: { timeLimit: undefined } }
      );
      
      expect(result.current.timeLeft).toBeUndefined();
      
      rerender({ timeLimit: 60 });
      
      expect(result.current.timeLeft).toBe(60);
      expect(result.current.timeSpent).toBe(0);
    });

    it('should handle change from defined to undefined time limit', () => {
      const { result, rerender } = renderHook(
        ({ timeLimit }) => useExamTimer(timeLimit),
        { initialProps: { timeLimit: 60 } }
      );
      
      expect(result.current.timeLeft).toBe(60);
      
      rerender({ timeLimit: undefined });
      
      expect(result.current.timeLeft).toBe(60); // Should preserve last valid state
    });
  });

  describe('Initial Time Spent Changes', () => {
    it('should update when initial time spent changes', () => {
      const { result, rerender } = renderHook(
        ({ timeLimit, initialTimeSpent }) => useExamTimer(timeLimit, undefined, initialTimeSpent),
        { initialProps: { timeLimit: 60, initialTimeSpent: 0 } }
      );
      
      expect(result.current.timeLeft).toBe(60);
      expect(result.current.timeSpent).toBe(0);
      
      // Change initial time spent
      rerender({ timeLimit: 60, initialTimeSpent: 30 });
      
      expect(result.current.timeLeft).toBe(30);
      expect(result.current.timeSpent).toBe(30);
    });

    it('should handle undefined initial time spent', () => {
      const { result } = renderHook(() => useExamTimer(60, undefined, undefined));
      
      expect(result.current.timeLeft).toBe(60);
      expect(result.current.timeSpent).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very small time limits', () => {
      const { result } = renderHook(() => useExamTimer(1)); // 1 second
      
      act(() => {
        result.current.start();
      });
      
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      
      expect(result.current.timeLeft).toBe(0);
      expect(result.current.isTimeUp).toBe(true);
    });

    it('should handle very large time limits', () => {
      const largeTimeLimit = 86400; // 24 hours
      const { result } = renderHook(() => useExamTimer(largeTimeLimit));
      
      expect(result.current.timeLeft).toBe(largeTimeLimit);
      
      act(() => {
        result.current.start();
      });
      
      act(() => {
        vi.advanceTimersByTime(3600000); // 1 hour
      });
      
      expect(result.current.timeLeft).toBe(largeTimeLimit - 3600);
      expect(result.current.timeSpent).toBe(3600);
    });

    it('should handle fractional seconds correctly', () => {
      const { result } = renderHook(() => useExamTimer(60));
      
      act(() => {
        result.current.start();
      });
      
      // Advance by 1.5 seconds
      act(() => {
        vi.advanceTimersByTime(1500);
      });
      
      // Should floor to whole seconds
      expect(result.current.timeSpent).toBe(1);
      expect(result.current.timeLeft).toBe(59);
    });

    it('should handle multiple rapid start/stop operations', () => {
      const { result } = renderHook(() => useExamTimer(60));
      
      act(() => {
        result.current.start();
        result.current.stop();
        result.current.start();
        result.current.pause();
        result.current.start();
      });
      
      expect(result.current.isRunning).toBe(true);
    });

    it('should handle operations on zero time limit', () => {
      const { result } = renderHook(() => useExamTimer(0));
      
      act(() => {
        result.current.start();
      });
      
      // Zero time limit behaves like undefined - cannot start
      expect(result.current.isRunning).toBe(false);
      expect(result.current.isTimeUp).toBe(false);
      
      act(() => {
        result.current.pause();
        result.current.stop();
      });
      
      // Should not crash
      expect(result.current.timeLeft).toBeUndefined();
    });
  });

  describe('Memory Management', () => {
    it('should maintain stable function references', () => {
      const { result, rerender } = renderHook(() => useExamTimer(60));
      
      const start1 = result.current.start;
      const pause1 = result.current.pause;
      const stop1 = result.current.stop;
      const reset1 = result.current.reset;
      
      rerender();
      
      expect(result.current.start).toBe(start1);
      expect(result.current.pause).toBe(pause1);
      expect(result.current.stop).toBe(stop1);
      expect(result.current.reset).toBe(reset1);
    });

    it('should clean up intervals on unmount', () => {
      const { result, unmount } = renderHook(() => useExamTimer(60));
      
      act(() => {
        result.current.start();
      });
      
      expect(result.current.isRunning).toBe(true);
      
      unmount();
      
      // Should not throw or cause memory leaks
      expect(() => {
        vi.advanceTimersByTime(5000);
      }).not.toThrow();
    });

    it('should clean up intervals when timer is reset', () => {
      const { result } = renderHook(() => useExamTimer(60));
      
      act(() => {
        result.current.start();
      });
      
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      
      act(() => {
        result.current.reset(120);
      });
      
      // Should not have any running intervals
      expect(result.current.isRunning).toBe(false);
      expect(result.current.timeLeft).toBe(120);
    });
  });

  describe('Time Calculation Accuracy', () => {
    it('should calculate time accurately across pause/resume cycles', () => {
      const { result } = renderHook(() => useExamTimer(100));
      
      // First session: 10 seconds
      act(() => {
        result.current.start();
      });
      
      act(() => {
        vi.advanceTimersByTime(10000);
      });
      
      act(() => {
        result.current.pause();
      });
      
      expect(result.current.timeSpent).toBe(10);
      expect(result.current.timeLeft).toBe(90);
      
      // Second session: 15 seconds
      act(() => {
        result.current.start();
      });
      
      act(() => {
        vi.advanceTimersByTime(15000);
      });
      
      act(() => {
        result.current.pause();
      });
      
      expect(result.current.timeSpent).toBe(25);
      expect(result.current.timeLeft).toBe(75);
      
      // Third session: 5 seconds
      act(() => {
        result.current.start();
      });
      
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      
      expect(result.current.timeSpent).toBe(30);
      expect(result.current.timeLeft).toBe(70);
    });

    it('should maintain accuracy with rapid pause/resume', () => {
      const { result } = renderHook(() => useExamTimer(60));
      
      act(() => {
        result.current.start();
      });
      
      // Rapid pause/resume cycles
      for (let i = 0; i < 5; i++) {
        act(() => {
          vi.advanceTimersByTime(1000); // 1 second
        });
        
        act(() => {
          result.current.pause();
        });
        
        act(() => {
          result.current.start();
        });
      }
      
      expect(result.current.timeSpent).toBe(5);
      expect(result.current.timeLeft).toBe(55);
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle start while already running', () => {
      const { result } = renderHook(() => useExamTimer(60));
      
      act(() => {
        result.current.start();
      });
      
      expect(result.current.isRunning).toBe(true);
      
      act(() => {
        result.current.start(); // Start again while running
      });
      
      expect(result.current.isRunning).toBe(true);
      
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      
      // Should still work correctly
      expect(result.current.timeSpent).toBe(5);
      expect(result.current.timeLeft).toBe(55);
    });

    it('should handle pause while not running', () => {
      const { result } = renderHook(() => useExamTimer(60));
      
      expect(result.current.isRunning).toBe(false);
      
      act(() => {
        result.current.pause(); // Pause while not running
      });
      
      expect(result.current.isRunning).toBe(false);
      expect(result.current.timeSpent).toBe(0);
      expect(result.current.timeLeft).toBe(60);
    });

    it('should handle stop while not running', () => {
      const { result } = renderHook(() => useExamTimer(60));
      
      expect(result.current.isRunning).toBe(false);
      
      act(() => {
        result.current.stop(); // Stop while not running
      });
      
      expect(result.current.isRunning).toBe(false);
      expect(result.current.timeSpent).toBe(0);
      expect(result.current.timeLeft).toBe(60);
    });
  });
});