import { useState, useEffect, useRef, useCallback } from 'react';

export interface SimpleTimerState {
  timeLeft: number | undefined;
  timeSpent: number;
  isRunning: boolean;
  isTimeUp: boolean;
}

export interface SimpleTimerActions {
  start: () => void;
  togglePause: () => void;
  stop: () => void;
  reset: (newTimeLimit: number) => void;
}

export interface UseSimpleTimerReturn extends SimpleTimerState, SimpleTimerActions {}

/**
 * Simplified timer hook with reliable pause/resume functionality
 */
export const useSimpleTimer = (
  timeLimitSeconds: number | undefined,
  onTimeUp?: () => void,
  initialTimeSpent?: number
): UseSimpleTimerReturn => {
  
  const [timeLeft, setTimeLeft] = useState<number | undefined>(undefined);
  const [timeSpent, setTimeSpent] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isTimeUp, setIsTimeUp] = useState<boolean>(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onTimeUpRef = useRef(onTimeUp);

  // Keep onTimeUp callback fresh
  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  // Initialize timer when time limit changes
  useEffect(() => {
    console.log('⏱️ SimpleTimer: Initializing with time limit:', timeLimitSeconds, 'initial time spent:', initialTimeSpent);
    
    if (timeLimitSeconds && timeLimitSeconds > 0) {
      const spent = initialTimeSpent || 0;
      const left = Math.max(0, timeLimitSeconds - spent);
      
      setTimeLeft(left);
      setTimeSpent(spent);
      setIsTimeUp(left === 0);
      setIsRunning(false);
    }
  }, [timeLimitSeconds, initialTimeSpent]);

  // Timer interval effect
  useEffect(() => {
    if (isRunning && timeLeft !== undefined && timeLeft > 0) {
      console.log('⏱️ SimpleTimer: Starting interval');
      
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev === undefined || prev <= 0) {
            setIsRunning(false);
            setIsTimeUp(true);
            if (onTimeUpRef.current) {
              onTimeUpRef.current();
            }
            return 0;
          }
          
          const newTimeLeft = prev - 1;
          
          // Update time spent
          setTimeSpent(prevSpent => {
            const newTimeSpent = prevSpent + 1;
            return newTimeSpent;
          });
          
          // Check if time is up
          if (newTimeLeft === 0) {
            setIsRunning(false);
            setIsTimeUp(true);
            if (onTimeUpRef.current) {
              setTimeout(() => onTimeUpRef.current?.(), 0);
            }
          }
          
          return newTimeLeft;
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
  }, [isRunning, timeLeft]);

  const start = useCallback(() => {
    console.log('⏱️ SimpleTimer: Starting');
    
    if (timeLeft === undefined || timeLeft <= 0) {
      console.log('⏱️ SimpleTimer: Cannot start - no time left');
      return;
    }
    
    setIsRunning(true);
  }, [timeLeft]);

  const togglePause = useCallback(() => {
    console.log('⏱️ SimpleTimer: Toggling pause - currently running:', isRunning);
    setIsRunning(prev => !prev);
  }, [isRunning]);

  const stop = useCallback(() => {
    console.log('⏱️ SimpleTimer: Stopping');
    setIsRunning(false);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const reset = useCallback((newTimeLimit: number) => {
    console.log('⏱️ SimpleTimer: Resetting with new time limit:', newTimeLimit);
    
    // Clear interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Reset state
    setTimeLeft(newTimeLimit);
    setTimeSpent(0);
    setIsRunning(false);
    setIsTimeUp(false);
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
    timeLeft,
    timeSpent,
    isRunning,
    isTimeUp,
    start,
    togglePause,
    stop,
    reset,
  };
};