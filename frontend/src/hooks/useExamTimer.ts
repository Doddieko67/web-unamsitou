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
  stop: () => void;
  reset: (newTimeLimit: number) => void;
}

export interface UseExamTimerReturn extends TimerState, TimerActions {}

/**
 * Custom hook for exam timer management
 * Handles different exams with different time limits correctly
 */
export const useExamTimer = (
  timeLimitSeconds: number | undefined,
  onTimeUp?: () => void,
  initialTimeSpent?: number
): UseExamTimerReturn => {
  
  const [state, setState] = useState<TimerState>({
    timeLeft: undefined,
    timeSpent: 0,
    isRunning: false,
    isTimeUp: false,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onTimeUpRef = useRef(onTimeUp);
  const startTimeRef = useRef<number | null>(null);
  const pausedTimeRef = useRef<number>(0);

  // Keep onTimeUp callback fresh
  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  // Initialize timer when time limit changes (new exam)
  useEffect(() => {
    // Timer: Initializing with time limit
    
    if (timeLimitSeconds && timeLimitSeconds > 0) {
      const timeSpent = initialTimeSpent || 0;
      const timeLeft = Math.max(0, timeLimitSeconds - timeSpent);
      
      setState(prev => ({
        ...prev,
        timeLeft: timeLeft,
        timeSpent: timeSpent,
        isTimeUp: timeLeft === 0,
        isRunning: false,
      }));
      
      // Set refs based on initial time spent
      startTimeRef.current = null;
      pausedTimeRef.current = timeSpent;
      
      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [timeLimitSeconds, initialTimeSpent]);

  // Timer interval effect
  useEffect(() => {
    if (state.isRunning && state.timeLeft !== undefined && state.timeLeft > 0) {
      // Timer: Starting interval
      
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        
        setState(prev => {
          if (!startTimeRef.current) {
            startTimeRef.current = now;
          }
          
          const elapsedSinceStart = Math.floor((now - startTimeRef.current) / 1000);
          const totalTimeSpent = elapsedSinceStart + pausedTimeRef.current;
          const newTimeLeft = Math.max(0, (timeLimitSeconds || 0) - totalTimeSpent);
          const isTimeUp = newTimeLeft === 0;
          
          // Call onTimeUp when time reaches zero
          if (isTimeUp && !prev.isTimeUp && onTimeUpRef.current) {
            // Timer: Time up! Calling onTimeUp
            setTimeout(() => onTimeUpRef.current?.(), 0);
          }
          
          return {
            ...prev,
            timeLeft: newTimeLeft,
            timeSpent: totalTimeSpent,
            isTimeUp,
            isRunning: !isTimeUp, // Auto-stop when time is up
          };
        });
      }, 1000);
    } else {
      // Clear interval when not running
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [state.isRunning, state.timeLeft, timeLimitSeconds]);

  const start = useCallback(() => {
    // Timer: Starting
    
    setState(prev => {
      if (prev.timeLeft === undefined || prev.timeLeft <= 0) {
        // Timer: Cannot start - no time left
        return prev;
      }
      
      // When starting/resuming, set startTimeRef to current time
      // The pausedTimeRef already contains the accumulated time spent
      startTimeRef.current = Date.now();
      
      return { ...prev, isRunning: true };
    });
  }, []);

  const pause = useCallback(() => {
    // Timer: Pausing
    
    // Clear the interval first
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    setState(prev => {
      if (startTimeRef.current) {
        const now = Date.now();
        const elapsedSinceStart = Math.floor((now - startTimeRef.current) / 1000);
        const newTotalTimeSpent = pausedTimeRef.current + elapsedSinceStart;
        const newTimeLeft = Math.max(0, (timeLimitSeconds || 0) - newTotalTimeSpent);
        
        // Update pausedTimeRef with total time spent
        pausedTimeRef.current = newTotalTimeSpent;
        startTimeRef.current = null;
        
        return { 
          ...prev, 
          isRunning: false,
          timeSpent: newTotalTimeSpent,
          timeLeft: newTimeLeft
        };
      }
      
      return { ...prev, isRunning: false };
    });
  }, [timeLimitSeconds]);

  const stop = useCallback(() => {
    // Timer: Stopping
    
    setState(prev => ({ ...prev, isRunning: false }));
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    startTimeRef.current = null;
  }, []);

  const reset = useCallback((newTimeLimit: number) => {
    // Timer: Resetting with new time limit
    
    // Clear interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Reset all refs
    startTimeRef.current = null;
    pausedTimeRef.current = 0;
    
    // Reset state
    setState({
      timeLeft: newTimeLimit,
      timeSpent: 0,
      isRunning: false,
      isTimeUp: false,
    });
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
    ...state,
    start,
    pause,
    stop,
    reset,
  };
};