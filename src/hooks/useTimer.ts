"use client"

import { useState, useEffect, useCallback } from 'react';

export function useTimer() {
  const [time, setTime] = useState(0); // Timer in seconds
  const [isRunning, setIsRunning] = useState(false);

  // Start the timer
  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  // Pause the timer
  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  // Reset the timer
  const reset = useCallback(() => {
    setTime(0);
    setIsRunning(false);
  }, []);

  // Restart the timer
  const restart = useCallback(() => {
    // setTime(0);
    setIsRunning(true);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  return { time, start, pause, reset, restart, isRunning };
}
