"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Minimize2, Maximize2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface TimerDisplayProps {
  timer: string; // In seconds
  onTimeExpired: () => void;
}

// Generate a unique key for this assignment's timer in localStorage
const getTimerStorageKey = (timer: string) => `exam_timer_${timer}_${window.location.pathname}`;

export function TimerDisplay({ timer, onTimeExpired }: TimerDisplayProps) {
  const [displayTime, setDisplayTime] = useState<string>("00:00:00");
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [showWarning, setShowWarning] = useState<boolean>(false);
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const endTimeRef = useRef<number | null>(null);
  const warningThresholdRef = useRef<number>(0);
  const lastUpdateTimeRef = useRef<number>(Date.now());
  const wasTabActiveRef = useRef<boolean>(true);
  
  // Format time display
  const formatTimeDisplay = useCallback((totalSeconds: number): string => {
    if (totalSeconds <= 0) return "00:00:00";
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0')
    ].join(':');
  }, []);
  
  // Save current end time to localStorage
  const saveTimerState = useCallback(() => {
    if (endTimeRef.current) {
      const timerKey = getTimerStorageKey(timer);
      localStorage.setItem(timerKey, endTimeRef.current.toString());
    }
  }, [timer]);
  
  // Update timer function defined outside useEffect to avoid recreation
  const updateTimer = useCallback(() => {
    if (!endTimeRef.current) return;
    
    const now = Date.now();
    const msRemaining = Math.max(0, endTimeRef.current - now);
    const secondsRemaining = Math.ceil(msRemaining / 1000);
    
    // Update display
    setDisplayTime(formatTimeDisplay(secondsRemaining));
    
    // Save last update time
    lastUpdateTimeRef.current = now;
    
    // Check for warning
    if (msRemaining > 0 && msRemaining <= warningThresholdRef.current) {
      setShowWarning(true);
    }
    
    // Check for expiration
    if (msRemaining <= 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      const timerKey = getTimerStorageKey(timer);
      localStorage.removeItem(timerKey);
      setIsExpired(true);
      return;
    }
    
    // Schedule next update precisely to the next second
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    const nextSecondDelay = 1000 - (now % 1000);
    timeoutRef.current = setTimeout(() => {
      updateTimer();
    }, nextSecondDelay);
    
    // Save timer state periodically (every 5 seconds)
    if (now - lastUpdateTimeRef.current >= 5000) {
      saveTimerState();
    }
  }, [formatTimeDisplay, timer, saveTimerState]);
  
  // Handle tab visibility changes
  const handleVisibilityChange = useCallback(() => {
    const isTabActive = document.visibilityState === 'visible';
    
    if (isTabActive && !wasTabActiveRef.current) {
      // Tab became visible again after being hidden
      // Recalculate timer immediately to ensure accuracy
      updateTimer();
    }
    
    wasTabActiveRef.current = isTabActive;
  }, [updateTimer]);
  
  // Handle expiration separately to avoid direct router updates during render
  useEffect(() => {
    if (isExpired) {
      onTimeExpired();
    }
  }, [isExpired, onTimeExpired]);
  
  // Initialize timer
  useEffect(() => {
    // Clear any existing interval and timeout
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    const timerKey = getTimerStorageKey(timer);
    
    // Parse timer value from seconds
    const initialSeconds = parseInt(timer, 10);
    if (isNaN(initialSeconds)) {
      return;
    }
    
    // Try to get existing end time from localStorage
    const storedEndTime = localStorage.getItem(timerKey);
    
    if (storedEndTime) {
      endTimeRef.current = parseInt(storedEndTime, 10);
      
      // Validate stored end time is in the future
      if (endTimeRef.current <= Date.now()) {
        localStorage.removeItem(timerKey);
        setIsExpired(true);
        return;
      }
    } else {
      // Create a new end time
      endTimeRef.current = Date.now() + (initialSeconds * 1000);
      localStorage.setItem(timerKey, endTimeRef.current.toString());
    }
    
    // Set warning threshold (10% of timer or 5 minutes, whichever is less)
    warningThresholdRef.current = Math.min(initialSeconds * 100, 300000);
    
    // Set initial display immediately
    updateTimer();
    
    // Add visibility change listener
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Set up heartbeat interval (every 10 seconds) as a backup
    // This ensures the timer keeps running even if the timeout is delayed
    intervalRef.current = setInterval(() => {
      if (document.visibilityState === 'visible') {
        updateTimer();
      }
    }, 10000);
    
    // Clean up on unmount
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      // Save timer state on unmount
      saveTimerState();
    };
  }, [timer, updateTimer, handleVisibilityChange, saveTimerState]);
  
  // Save timer state before unload/refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveTimerState();
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [saveTimerState]);
  
  // Toggle minimized state
  const toggleMinimized = useCallback(() => {
    setIsMinimized(prev => !prev);
  }, []);
  
  return (
    <Card 
      className={cn(
        "fixed transition-all duration-300 z-50",
        isMinimized 
          ? "top-4 right-4 w-auto" 
          : "top-20 right-4 w-64"
      )}
      id="timer-display"
    >
      <CardContent 
        className={cn(
          "flex items-center p-4 space-x-2 text-slate-700 dark:text-slate-300",
          showWarning && "bg-red-50 dark:bg-red-950 animate-pulse"
        )}
      >
        <Clock className={cn(
          "h-5 w-5", 
          showWarning && "text-red-500"
        )} />
        
        {!isMinimized && (
          <div className="flex-1">
            <div className="text-sm">Thời gian còn lại:</div>
            <div className={cn(
              "text-lg font-mono font-bold",
              showWarning && "text-red-600 dark:text-red-400"
            )}>
              {displayTime}
            </div>
          </div>
        )}
        
        {isMinimized && (
          <div className={cn(
            "text-sm font-mono font-bold",
            showWarning && "text-red-600 dark:text-red-400"
          )}>
            {displayTime}
          </div>
        )}
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0" 
          onClick={toggleMinimized}
          aria-label={isMinimized ? "Maximize" : "Minimize"}
        >
          {isMinimized ? (
            <Maximize2 className="h-4 w-4" />
          ) : (
            <Minimize2 className="h-4 w-4" />
          )}
        </Button>
      </CardContent>
    </Card>
  );
} 