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
  const endTimeRef = useRef<number | null>(null);
  const warningThresholdRef = useRef<number>(0);
  
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
  
  // Update timer function defined outside useEffect to avoid recreation
  const updateTimer = useCallback(() => {
    if (!endTimeRef.current) return;
    
    const now = Date.now();
    const msRemaining = Math.max(0, endTimeRef.current - now);
    const secondsRemaining = Math.ceil(msRemaining / 1000);
    
    // Update display
    setDisplayTime(formatTimeDisplay(secondsRemaining));
    
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
      
      const timerKey = getTimerStorageKey(timer);
      localStorage.removeItem(timerKey);
      setIsExpired(true);
    }
  }, [formatTimeDisplay, timer]);
  
  // Handle expiration separately to avoid direct router updates during render
  useEffect(() => {
    if (isExpired) {
      onTimeExpired();
    }
  }, [isExpired, onTimeExpired]);
  
  // Initialize timer
  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
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
    
    // Start the interval that updates every second
    intervalRef.current = setInterval(updateTimer, 1000);
    
    // Clean up on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [timer, updateTimer]);
  
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