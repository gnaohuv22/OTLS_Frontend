"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { CheckCircle2, Circle, ArrowUp, ArrowDown, ListFilter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface QuizProgressProps {
  questions: {
    id: string;
    question: string;
  }[];
  answers: Record<string, string>;
  onQuestionClick: (questionId: string) => void;
}

export const QuizProgress = ({ questions, answers, onQuestionClick }: QuizProgressProps) => {
  const [questionElements, setQuestionElements] = useState<HTMLElement[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number | null>(null);
  const [timerHeight, setTimerHeight] = useState(0);
  const timerCheckRef = useRef<NodeJS.Timeout | null>(null);
  const [questionMapping, setQuestionMapping] = useState<Record<string, number>>({});
  
  // Listen for quiz mapping changes from QuizSection
  useEffect(() => {
    const handleMappingChange = (event: CustomEvent) => {
      if (event.detail && event.detail.questionMapping) {
        setQuestionMapping(event.detail.questionMapping);
      }
    };
    
    // Add event listener for the custom event
    window.addEventListener('quiz-mapping-changed', handleMappingChange as EventListener);
    
    // Clean up
    return () => {
      window.removeEventListener('quiz-mapping-changed', handleMappingChange as EventListener);
    };
  }, []);
  
  // Find the timer element and calculate position
  useEffect(() => {
    const checkTimerElement = () => {
      const timerElement = document.getElementById('timer-display');
      if (timerElement) {
        // Get the bounding rectangle to calculate the bottom position
        const timerRect = timerElement.getBoundingClientRect();
        const bottomPosition = timerRect.bottom + 10; // Add 10px padding
        
        // Set the position directly using the bottom of the timer
        setTimerHeight(bottomPosition);
        
        // Clear the interval once we've found the timer
        if (timerCheckRef.current) {
          clearInterval(timerCheckRef.current);
          timerCheckRef.current = null;
        }
      }
    };
    
    // Check immediately
    checkTimerElement();
    
    // Set up an interval to keep checking for the timer (it might not be rendered yet)
    timerCheckRef.current = setInterval(checkTimerElement, 500);
    
    return () => {
      if (timerCheckRef.current) {
        clearInterval(timerCheckRef.current);
      }
    };
  }, []);
  
  // Find all question elements by their IDs when component mounts
  useEffect(() => {
    const elements = questions.map(q => document.getElementById(`question-${q.id}`));
    setQuestionElements(elements.filter(Boolean) as HTMLElement[]);
    
    // Set up intersection observer to track current question
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            const questionId = id.replace('question-', '');
            const index = questions.findIndex(q => q.id === questionId);
            if (index !== -1) {
              setCurrentQuestionIndex(index);
            }
          }
        });
      },
      {
        root: null,
        threshold: 0.5,
      }
    );
    
    // Observe each question element
    elements.forEach(el => {
      if (el) observer.observe(el);
    });
    
    return () => {
      elements.forEach(el => {
        if (el) observer.unobserve(el);
      });
    };
  }, [questions]);
  
  const handleQuestionClick = (questionId: string, index: number) => {
    onQuestionClick(questionId);
    setCurrentQuestionIndex(index);
    
    // Scroll to the question
    const element = questionElements[index];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  
  // Navigate to previous/next question
  const goToPrevQuestion = () => {
    if (currentQuestionIndex === null || currentQuestionIndex <= 0) return;
    const prevIndex = currentQuestionIndex - 1;
    const prevQuestion = questions[prevIndex];
    handleQuestionClick(prevQuestion.id, prevIndex);
  };
  
  const goToNextQuestion = () => {
    if (currentQuestionIndex === null || currentQuestionIndex >= questions.length - 1) return;
    const nextIndex = currentQuestionIndex + 1;
    const nextQuestion = questions[nextIndex];
    handleQuestionClick(nextQuestion.id, nextIndex);
  };
  
  // Calculate completion percentage
  const completionPercentage = questions.length > 0 
    ? Math.round((Object.keys(answers).length / questions.length) * 100) 
    : 0;
  
  // Helper to get the correct display index for a question
  const getDisplayIndex = useCallback((questionId: string, defaultIndex: number): number => {
    // If we have mapping data and this is a randomized quiz, use it
    if (Object.keys(questionMapping).length > 0 && questionMapping[questionId] !== undefined) {
      // The original index is the default index, we need to show the index in the original order
      return defaultIndex;
    }
    // Otherwise, use the default index
    return defaultIndex;
  }, [questionMapping]);
  
  return (
    <AnimatePresence>
      <motion.div 
        className="fixed right-4 z-40"
        style={{ 
          top: timerHeight ? `${timerHeight}px` : '90px'
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card 
          className="shadow-lg border-2 p-3 w-64"
        >
          {/* Progress information */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative w-10 h-10 flex items-center justify-center">
                <svg className="w-10 h-10" viewBox="0 0 36 36">
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray="100"
                    strokeDashoffset={100 - completionPercentage}
                    strokeLinecap="round"
                    className="text-primary opacity-20"
                    transform="rotate(-90 18 18)"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray="100"
                    strokeDashoffset={100}
                    strokeLinecap="round"
                    className="text-primary"
                    transform="rotate(-90 18 18)"
                    style={{ strokeDashoffset: 100 - completionPercentage }}
                  />
                  <text
                    x="18"
                    y="20"
                    textAnchor="middle"
                    className="text-xs font-medium fill-current"
                  >
                    {completionPercentage}%
                  </text>
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  {Object.keys(answers).length}/{questions.length}
                </span>
                <span className="text-xs text-muted-foreground">
                  câu đã trả lời
                </span>
              </div>
            </div>
            
            <div className="flex-shrink-0 flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className="p-1 rounded-full hover:bg-muted"
                      onClick={(e) => {
                        e.stopPropagation();
                        goToPrevQuestion();
                      }}
                      disabled={currentQuestionIndex === null || currentQuestionIndex <= 0}
                      aria-label="Câu trước"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Câu trước</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className="p-1 rounded-full hover:bg-muted"
                      onClick={(e) => {
                        e.stopPropagation();
                        goToNextQuestion();
                      }}
                      disabled={currentQuestionIndex === null || currentQuestionIndex >= questions.length - 1}
                      aria-label="Câu tiếp theo"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Câu tiếp theo</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          
          {/* Current question indicator */}
          {currentQuestionIndex !== null && (
            <div className="mt-2 text-xs text-center text-muted-foreground">
              Đang xem câu {getDisplayIndex(questions[currentQuestionIndex].id, currentQuestionIndex) + 1}
            </div>
          )}
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}; 