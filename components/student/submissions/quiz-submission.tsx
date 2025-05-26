"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QuizSection, Question as QuizSectionQuestion } from "@/components/student/assignments/quiz-section";
import { Loader2, Save, TextIcon, Type } from "lucide-react";
import { addSubmission, getAssignmentById } from "@/lib/api/assignment";
import { useToast } from "@/components/ui/use-toast";
import { CautionSystem } from "./caution-system";
import { useRouter } from 'next/navigation';
import { TimerDisplay } from '@/components/student/assignments/timer-display';
import { QuizProgress } from '@/components/student/assignments/quiz-progress';

// Local storage keys
const QUIZ_ANSWERS_KEY = 'otls_quiz_answers';
const AUTO_SAVE_INTERVAL_MS = 10000; // Auto-save every 10 seconds
const FONT_SIZE_KEY = 'otls_quiz_font_size'; // Add font size storage key

// Generate timer storage key (same as TimerDisplay component)
const getTimerStorageKey = (timer: string) => `exam_timer_${timer}_${window.location.pathname}`;

interface QuizSubmissionProps {
  assignmentId: string;
  userId: string;
  quizQuestions: {
    quizQuestionId: string;
    question: string;
    options: string[];
    correctOptions: number[];
    points: number;
    explanation: string;
  }[];
  onSubmissionComplete: (submissionId: string) => void;
  timer?: string | null; // This is now in seconds
  isExam?: boolean;
  maxPoints?: number; // Add maxPoints prop
}

export function QuizSubmission({ 
  assignmentId, 
  userId, 
  quizQuestions,
  onSubmissionComplete,
  timer = null,
  isExam = false,
  maxPoints = 100 // Default to 100 if not provided
}: QuizSubmissionProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forcedSubmit, setForcedSubmit] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [fontSize, setFontSize] = useState<'normal' | 'large'>('normal'); // Add font size state
  const { toast } = useToast();
  const router = useRouter();
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const draftKey = `${QUIZ_ANSWERS_KEY}_${assignmentId}_${userId}`;

  // Load saved answers from localStorage on initial mount - only for practice mode
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Load font size preference from localStorage
      const savedFontSize = localStorage.getItem(FONT_SIZE_KEY);
      if (savedFontSize === 'large') {
        setFontSize('large');
      }
      
      // Only load answers for non-exam mode
      if (!isExam) {
        try {
          const savedAnswers = localStorage.getItem(draftKey);
          if (savedAnswers) {
            const parsedAnswers = JSON.parse(savedAnswers);
            setAnswers(parsedAnswers);
            setLastSaved(new Date());
            
            toast({
              title: "Câu trả lời đã được khôi phục",
              description: "Các câu trả lời của bạn đã được khôi phục từ bản lưu trước đó.",
            });
          }
        } catch (error) {
          console.error("Error loading saved quiz answers:", error);
        }
      }
    }
  }, [draftKey, toast, isExam]);

  // Toggle font size
  const toggleFontSize = useCallback(() => {
    setFontSize(current => {
      const newSize = current === 'normal' ? 'large' : 'normal';
      // Save preference to localStorage
      localStorage.setItem(FONT_SIZE_KEY, newSize);
      return newSize;
    });
  }, []);

  // Set up auto-save functionality - only for practice mode
  useEffect(() => {
    // Skip auto-save for exam mode
    if (isExam) return;

    const saveAnswersToLocalStorage = () => {
      if (Object.keys(answers).length > 0) {
        try {
          localStorage.setItem(draftKey, JSON.stringify(answers));
          setLastSaved(new Date());
          console.log("Auto-saved quiz answers at", new Date().toLocaleTimeString());
        } catch (error) {
          console.error("Error saving quiz answers:", error);
        }
      }
    };

    // Start auto-save timer
    if (autoSaveTimerRef.current) {
      clearInterval(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setInterval(saveAnswersToLocalStorage, AUTO_SAVE_INTERVAL_MS);

    // Clean up on unmount
    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, [answers, draftKey, isExam]);

  // Memoize quiz questions to prevent unnecessary re-renders
  const mappedQuestions = useMemo(() => 
    quizQuestions.map(q => ({
      id: q.quizQuestionId,
      type: "multiple_choice" as const,
      question: q.question,
      options: q.options,
      // We don't want to expose the correct answer to the student
      correctAnswer: undefined
    }))
  , [quizQuestions]);

  // Function to grade the quiz automatically
  const gradeQuiz = useCallback((): { grade: number, fullCorrect: number, partialCorrect: number } => {
    let totalPoints = 0;
    let earnedPoints = 0;
    let fullCorrect = 0;
    let partialCorrect = 0;

    quizQuestions.forEach(question => {
      const questionId = question.quizQuestionId;
      const studentAnswer = answers[questionId];
      totalPoints += question.points;

      if (studentAnswer) {
        // Parse student answer - may be a comma-separated list of selected indices
        const studentSelectedIndices = studentAnswer.split(',').map(s => parseInt(s));
        const correctIndices = question.correctOptions;

        // Calculate correct answers (intersection of selected and correct)
        const correctAnswers = studentSelectedIndices.filter(index => 
          correctIndices.includes(index)
        );

        // Calculate incorrect answers (selected but not correct)
        const incorrectAnswers = studentSelectedIndices.filter(index => 
          !correctIndices.includes(index)
        );

        if (correctAnswers.length > 0) {
          if (correctAnswers.length === correctIndices.length && incorrectAnswers.length === 0) {
            // Fully correct
            earnedPoints += question.points;
            fullCorrect++;
          } else {
            // Partially correct - award partial points
            const partialPoints = question.points * (correctAnswers.length / correctIndices.length);
            earnedPoints += partialPoints;
            partialCorrect++;
          }
        }
      }
    });

    // Calculate final grade as a percentage of maxPoints, not hardcoded 100
    const percentageScore = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
    // Scale to maxPoints
    const finalGrade = (percentageScore / 100) * maxPoints;
    
    return {
      grade: parseFloat(finalGrade.toFixed(1)),
      fullCorrect,
      partialCorrect
    };
  }, [quizQuestions, answers, maxPoints]);

  // Handle when quiz answers change
  const handleAnswersChange = useCallback((newAnswers: Record<string, string>) => {
    // Log for debugging
    console.log("Quiz answers changed:", newAnswers);
    
    // Use functional update to avoid potential dependency issues
    setAnswers(prevAnswers => {
      // Only update if the answers have actually changed
      if (JSON.stringify(prevAnswers) !== JSON.stringify(newAnswers)) {
        return newAnswers;
      }
      return prevAnswers;
    });
  }, []);

  // Manually save answers - only for practice mode
  const saveDraft = () => {
    // Don't allow saving in exam mode
    if (isExam) {
      toast({
        variant: "destructive",
        title: "Không thể lưu",
        description: "Không thể lưu bài làm trong chế độ kiểm tra.",
      });
      return;
    }

    if (Object.keys(answers).length > 0) {
      try {
        localStorage.setItem(draftKey, JSON.stringify(answers));
        setLastSaved(new Date());
        toast({
          title: "Đã lưu câu trả lời",
          description: "Các câu trả lời của bạn đã được lưu thành công.",
        });
      } catch (error) {
        console.error("Error saving quiz answers:", error);
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: "Không thể lưu câu trả lời. Vui lòng thử lại sau.",
        });
      }
    } else {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Vui lòng trả lời ít nhất một câu hỏi trước khi lưu.",
      });
    }
  };

  // Handle submission
  const handleSubmit = useCallback(async (forced: boolean = false) => {
    setIsSubmitting(true);
    
    if (forced) {
      setForcedSubmit(true);
      toast({
        variant: "destructive",
        title: "Nộp bài tự động",
        description: "Bài làm của bạn đã bị nộp tự động do vi phạm quy định làm bài.",
      });
    }

    try {
      // Grade the quiz
      const { grade, fullCorrect, partialCorrect } = gradeQuiz();
      
      // Format answers for submission, ensuring all questions are included
      const formattedAnswers: Record<string, string> = {};
      
      // Include all questions in the submission, even unanswered ones
      quizQuestions.forEach(question => {
        const questionId = question.quizQuestionId;
        // Use the answer if provided, otherwise empty string
        formattedAnswers[`question_${questionId}`] = answers[questionId] || "";
      });

      // Create submission data
      const submissionData = {
        submittedAt: new Date().toISOString(),
        status: forced ? "Stopped with caution" : "Graded",
        grade: grade,
        feedback: forced 
          ? "Bài làm bị buộc nộp do vi phạm quy định làm bài 3 lần."
          : `Tự động chấm điểm: ${fullCorrect} câu đúng hoàn toàn, ${partialCorrect} câu đúng một phần.`,
        answers: formattedAnswers,
        textContent: "",
        assignmentId: assignmentId,
        userId: userId
      };

      // Submit to the API
      const response = await addSubmission(submissionData);
      
      if (response.data) {
        // Clear the saved answers from localStorage since submission was successful
        try {
          localStorage.removeItem(draftKey);
        } catch (error) {
          console.error("Error removing saved quiz answers:", error);
        }
        
        // Clear timer from localStorage for exam mode
        if (isExam && timer) {
          try {
            const timerKey = getTimerStorageKey(timer);
            localStorage.removeItem(timerKey);
            console.log("Timer cleared from localStorage after exam submission");
          } catch (error) {
            console.error("Error removing timer from localStorage:", error);
          }
        }
        
        toast({
          title: "Nộp bài thành công",
          description: `Điểm của bạn: ${grade.toFixed(1)}`,
        });
        
        // Notify parent component that submission is complete
        onSubmissionComplete(response.data.submissionId);
        
        // Redirect to assignments list
        router.push('/assignments');
      }
    } catch (error) {
      console.error("Error submitting quiz:", error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể nộp bài. Vui lòng thử lại sau.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [answers, assignmentId, gradeQuiz, onSubmissionComplete, router, toast, userId, draftKey, quizQuestions, isExam, timer]);

  // Handle max cautions reached - memoize to prevent recreating function on each render
  const handleMaxCautionsReached = useCallback(() => {
    // Submit with empty answers and banned message for forced submissions due to anti-cheat
    handleSubmit(true);
  }, [handleSubmit]);

  // Handle timer expiration
  const handleTimeExpired = useCallback(() => {
    handleSubmit(true);
  }, [handleSubmit]);

  // Handle quiz progress navigation
  const handleQuestionClick = useCallback((questionId: string) => {
    // This function is passed to the QuizProgress component
    // The scrolling is handled there
  }, []);

  // Format last saved time
  const getLastSavedTime = () => {
    if (!lastSaved) return null;
    
    return lastSaved.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <>
      {/* Place quiz progress first for proper z-index stacking */}
      <QuizProgress 
        questions={mappedQuestions}
        answers={answers}
        onQuestionClick={handleQuestionClick}
      />
      
      {/* Timer display for exam mode */}
      {isExam && timer && (
        <TimerDisplay timer={timer} onTimeExpired={handleTimeExpired} />
      )}
      
      <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              {isExam ? "Bài thi trắc nghiệm" : "Làm bài trắc nghiệm"}
            </CardTitle>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={toggleFontSize}
              className="gap-1"
            >
              <Type className="h-4 w-4" />
              <span className="sr-only md:not-sr-only md:inline-block">
                {fontSize === 'normal' ? 'Phóng to chữ' : 'Cỡ chữ bình thường'}
              </span>
            </Button>
          </div>
          
          <CardDescription>
            {isExam 
              ? "Đây là bài kiểm tra. Bạn chỉ có một lần làm bài và không thể làm lại."
              : "Chọn đáp án đúng cho mỗi câu hỏi. Có thể chọn nhiều đáp án nếu cần."}
          </CardDescription>
          <CautionSystem 
            isActive={!isSubmitting} 
            maxCautions={3} 
            onMaxCautionsReached={handleMaxCautionsReached}
            assignmentId={assignmentId}
          />
          {lastSaved && (
            <div className="text-xs text-muted-foreground mt-2">
              Đã lưu lúc: {getLastSavedTime()}
            </div>
          )}
        </CardHeader>
        <CardContent className={fontSize === 'large' ? 'text-lg' : ''}>
          <QuizSection 
            questions={mappedQuestions} 
            onAnswersChange={handleAnswersChange}
            isExam={isExam}
          />
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              {Object.keys(answers).length} / {quizQuestions.length} câu đã làm
            </div>
            {!isExam && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={saveDraft}
                disabled={isSubmitting || Object.keys(answers).length === 0}
              >
                <Save className="mr-2 h-4 w-4" />
                Lưu câu trả lời
              </Button>
            )}
          </div>
          <Button 
            onClick={() => handleSubmit(false)} 
            disabled={isSubmitting || forcedSubmit}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang nộp bài...
              </>
            ) : "Nộp bài làm"}
          </Button>
        </CardFooter>
      </Card>
    </>
  );
} 