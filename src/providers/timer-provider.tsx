
"use client"
import React, { createContext, useContext, ReactNode } from 'react';
import { useTimer } from '../hooks/useTimer';

type TimerContextType = ReturnType<typeof useTimer>;

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const TimerProvider = ({ children }: { children: ReactNode }) => {
  const timer = useTimer();
  return <TimerContext.Provider value={timer}>{children}</TimerContext.Provider>;
};

export const useTimerContext = () => {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimerContext must be used within a TimerProvider');
  }
  return context;
};
