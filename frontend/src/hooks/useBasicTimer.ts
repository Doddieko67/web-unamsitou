import { useState, useEffect, useRef, useCallback } from 'react';

export interface BasicTimerReturn {
  timeLeft: number | undefined;
  timeSpent: number;
  isRunning: boolean;
  isPaused: boolean;
  isTimeUp: boolean;
  start: () => void;
  togglePause: () => void;
  stop: () => void;
}

/**
 * Super simple timer - one source of truth
 */
export const useBasicTimer = (
  timeLimitSeconds: number | undefined,
  onTimeUp?: () => void,
  initialTimeSpent?: number
): BasicTimerReturn => {
  
  // Single source of truth: total time spent
  const [totalTimeSpent, setTotalTimeSpent] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isTimeUp, setIsTimeUp] = useState<boolean>(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onTimeUpRef = useRef(onTimeUp);
  const timeLimitRef = useRef(timeLimitSeconds);

  // Update refs
  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
    timeLimitRef.current = timeLimitSeconds;
  }, [onTimeUp, timeLimitSeconds]);

  // Initialize when time limit changes
  useEffect(() => {
    console.log('🔥 BasicTimer: Init - limit:', timeLimitSeconds, 'initial spent:', initialTimeSpent);
    
    if (timeLimitSeconds && timeLimitSeconds > 0) {
      const spent = initialTimeSpent || 0;
      setTotalTimeSpent(spent);
      setIsTimeUp(spent >= timeLimitSeconds);
      setIsRunning(false);
      setIsPaused(false);
    }
  }, [timeLimitSeconds, initialTimeSpent]);

  // Calculate derived values
  const timeLeft = timeLimitRef.current && timeLimitRef.current > 0 
    ? Math.max(0, timeLimitRef.current - totalTimeSpent)
    : undefined;

  // Single interval that only updates total time spent
  useEffect(() => {
    // Only tick if: running AND not paused AND not time up
    if (isRunning && !isPaused && !isTimeUp && timeLimitRef.current && totalTimeSpent < timeLimitRef.current) {
      console.log('🔥 BasicTimer: Starting interval');
      
      intervalRef.current = setInterval(() => {
        setTotalTimeSpent(prev => {
          const newTimeSpent = prev + 1;
          const limit = timeLimitRef.current || 0;
          
          console.log('🔥 Tick:', newTimeSpent, '/', limit);
          
          // Check if time is up
          if (newTimeSpent >= limit) {
            console.log('🔥 Time up!');
            setIsRunning(false);
            setIsTimeUp(true);
            if (onTimeUpRef.current) {
              setTimeout(() => onTimeUpRef.current?.(), 0);
            }
          }
          
          return newTimeSpent;
        });
      }, 1000);
    } else {
      // Clear interval
      if (intervalRef.current) {
        console.log('🔥 BasicTimer: Clearing interval');
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
  }, [isRunning, isPaused, isTimeUp, totalTimeSpent]);

  const start = useCallback(() => {
    console.log('🔥 BasicTimer: START');
    if (!isTimeUp && timeLimitRef.current && totalTimeSpent < timeLimitRef.current) {
      setIsRunning(true);
      setIsPaused(false);
    }
  }, [isTimeUp, totalTimeSpent]);

  const togglePause = useCallback(() => {
    console.log('🔥 BasicTimer: TOGGLE PAUSE - currently paused:', isPaused);
    if (!isTimeUp && isRunning) {
      setIsPaused(prev => !prev);
    }
  }, [isPaused, isTimeUp, isRunning]);

  const stop = useCallback(() => {
    console.log('🔥 BasicTimer: STOP');
    setIsRunning(false);
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    timeLeft,
    timeSpent: totalTimeSpent,
    isRunning: isRunning && !isPaused, // Show as "not running" when paused
    isPaused,
    isTimeUp,
    start,
    togglePause,
    stop,
  };
};