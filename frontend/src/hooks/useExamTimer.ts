import { useState, useEffect, useRef, useCallback } from 'react';

export interface TimerState {
  timeLeft: number | undefined;
  timeSpent: number;
  isRunning: boolean;
  isTimeUp: boolean;
}

export interface TimerActions {
  start: () => void;
  pause: () => void;
  reset: (newTime: number) => void;
  stop: () => void;
}

export interface UseExamTimerReturn extends TimerState, TimerActions {}

/**
 * Custom hook for exam timer management
 * Optimized to reduce re-renders and prevent memory leaks
 */
export const useExamTimer = (
  initialTime: number | undefined,
  onTimeUp?: () => void
): UseExamTimerReturn => {
  const [timerState, setTimerState] = useState<TimerState>({
    timeLeft: initialTime,
    timeSpent: 0,
    isRunning: false,
    isTimeUp: false,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onTimeUpRef = useRef(onTimeUp);

  // Keep onTimeUp callback fresh
  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  // Optimized timer with single state update
  useEffect(() => {
    if (!timerState.isRunning || timerState.timeLeft === undefined) {
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimerState(prev => {
        const newTimeLeft = Math.max(0, prev.timeLeft! - 1);
        const newTimeSpent = prev.timeSpent + 1;
        const isTimeUp = newTimeLeft === 0;

        // Call onTimeUp when time reaches zero
        if (isTimeUp && !prev.isTimeUp && onTimeUpRef.current) {
          setTimeout(() => onTimeUpRef.current?.(), 0);
        }

        return {
          ...prev,
          timeLeft: newTimeLeft,
          timeSpent: newTimeSpent,
          isTimeUp,
          isRunning: !isTimeUp, // Auto-stop when time is up
        };
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [timerState.isRunning, timerState.timeLeft]);

  const start = useCallback(() => {
    setTimerState(prev => ({ ...prev, isRunning: true }));
  }, []);

  const pause = useCallback(() => {
    setTimerState(prev => ({ ...prev, isRunning: false }));
  }, []);

  const stop = useCallback(() => {
    setTimerState(prev => ({ ...prev, isRunning: false }));
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const reset = useCallback((newTime: number) => {
    setTimerState({
      timeLeft: newTime,
      timeSpent: 0,
      isRunning: false,
      isTimeUp: false,
    });
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    ...timerState,
    start,
    pause,
    stop,
    reset,
  };
};