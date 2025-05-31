"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import { addSubmission, getAssignmentById } from "@/lib/api/assignment";
import { useToast } from "@/components/ui/use-toast";
import { CautionSystem, exitFullscreenMode } from "./caution-system";
import EditorComponent from "@/components/shared/editor-component";
import { useRouter } from 'next/navigation';
import { TimerDisplay } from '@/components/student/assignments/timer-display';

// Local storage keys
const DRAFT_CONTENT_KEY = 'otls_draft_content';
const AUTO_SAVE_INTERVAL_MS = 10000; // Auto-save every 10 seconds

// Generate timer storage key (same as TimerDisplay component)
const getTimerStorageKey = (timer: string) => `exam_timer_${timer}_${window.location.pathname}`;

interface TextSubmissionProps {
  assignmentId: string;
  userId: string;
  assignmentTitle: string;
  onSubmissionComplete: (submissionId: string) => void;
  timer?: string | null; // This is now in seconds
  isExam?: boolean;
  maxPoints?: number; // Add maxPoints prop
}

export function TextSubmission({ 
  assignmentId, 
  userId, 
  assignmentTitle,
  onSubmissionComplete,
  timer = null,
  isExam = false,
  maxPoints = 100 // Default to 100 if not provided
}: TextSubmissionProps) {
  const [content, setContent] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forcedSubmit, setForcedSubmit] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [assignment, setAssignment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const { toast } = useToast();
  const router = useRouter();
  const editorRef = useRef(null);
  const draftKey = `${DRAFT_CONTENT_KEY}_${assignmentId}`;
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Fetch assignment details
  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        setLoading(true);
        const response = await getAssignmentById(assignmentId);
        if (response.data) {
          setAssignment(response.data);
        }
      } catch (error) {
        console.error("Error fetching assignment:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAssignment();
  }, [assignmentId]);
  
  // Load saved content from localStorage on initial mount
  useEffect(() => {
    // When in exam mode, don't load previous content
    if (isExam) return;
    
    try {
      const savedContent = localStorage.getItem(draftKey);
      if (savedContent) {
        setContent(savedContent);
        setLastSaved(new Date());
        console.log("Loaded saved draft content");
      }
    } catch (error) {
      console.error("Error loading saved content:", error);
    }
  }, [draftKey, isExam]);
  
  // Handle content changes from EditorComponent
  const handleContentChange = (newContent: string) => {
    setContent(newContent);
  };
  
  // Manual save draft function
  const saveDraft = () => {
    // Don't allow saving if in exam mode
    if (isExam) {
      toast({
        title: "Không thể lưu bản nháp",
        description: "Bạn không thể lưu bản nháp trong chế độ kiểm tra",
        variant: "destructive"
      });
      return;
    }
    
    if (content && content.trim().length > 10) {
      try {
        localStorage.setItem(draftKey, content);
        setLastSaved(new Date());
        
        toast({
          title: "Đã lưu",
          description: "Bản nháp bài làm của bạn đã được lưu",
        });
      } catch (error) {
        console.error("Error saving draft:", error);
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: "Không thể lưu bản nháp. Vui lòng thử lại sau.",
        });
      }
    } else {
      toast({
        variant: "destructive",
        title: "Bài làm quá ngắn",
        description: "Bài làm cần có ít nhất 10 ký tự để lưu",
      });
    }
  };

  // Set up auto-save functionality
  useEffect(() => {
    // Don't auto-save in exam mode
    if (isExam) return;
    
    const saveContentToLocalStorage = () => {
      if (content && content.trim().length > 10) {
        try {
          localStorage.setItem(draftKey, content);
          setLastSaved(new Date());
          console.log("Auto-saved content at", new Date().toLocaleTimeString());
        } catch (error) {
          console.error("Error auto-saving draft:", error);
        }
      }
    };
    
    // Set up auto-save timer if we have meaningful content
    if (content.trim().length > 10) {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
      
      autoSaveTimerRef.current = setInterval(saveContentToLocalStorage, AUTO_SAVE_INTERVAL_MS);
    }
    
    // Clear the timer when unmounting
    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, [content, draftKey, isExam]);

  // Handle submission - ensure validation works for both normal and forced submissions
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
      // Format the content for submission
      // For forced submissions, add a warning banner to the content
      const formattedContent = forced 
        ? `<div style="color: red; font-weight: bold; padding: 10px; border: 2px solid red; margin-bottom: 10px;">
            BÀI LÀM NÀY BỊ BUỘC NỘP DO VI PHẠM QUY ĐỊNH LÀM BÀI.
          </div>
          ${content}`
        : content;
      
      // Create submission data with all required fields
      const submissionData = {
        submittedAt: new Date().toISOString(),
        status:"Submitted",
        grade: 0, // Text submissions are manually graded later
        feedback: forced 
          ? "Bài làm bị buộc nộp do vi phạm quy định làm bài."
          : "",
        // Ensure answers field is included to pass validation
        answers: {}, 
        textContent: formattedContent,
        assignmentId: assignmentId,
        userId: userId,
        // Additional fields to ensure validation passes
      };

      console.log("Submitting text with data:", submissionData);
      
      // Submit to the API
      const response = await addSubmission(submissionData);
      
      if (response.data) {
        // Exit fullscreen mode if in exam mode
        if (isExam) {
          exitFullscreenMode();
        }
        
        // Clear the saved content from localStorage since submission was successful
        try {
          localStorage.removeItem(draftKey);
        } catch (error) {
          console.error("Error removing saved text content:", error);
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
          description: forced 
            ? "Bài làm đã được nộp do vi phạm quy định làm bài."
            : "Bài làm của bạn đã được gửi thành công.",
        });
        
        // Notify parent component that submission is complete
        onSubmissionComplete(response.data.submissionId);
        
        // Redirect to assignments list
        router.push('/assignments');
      }
    } catch (error) {
      console.error("Error submitting text:", error);
      
      // More informative error message
      let errorMessage = "Không thể nộp bài. Vui lòng thử lại sau.";
      if (error instanceof Error) {
        errorMessage = `Lỗi: ${error.message}`;
      }
      
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: errorMessage,
      });
      
      // Even if there's an error, if it was a forced submission, we should still redirect
      if (forced) {
        setTimeout(() => {
          router.push('/assignments');
        }, 3000);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [content, assignmentId, userId, onSubmissionComplete, router, toast, draftKey, isExam, timer]);

  // Handle timer expiration
  const handleTimeExpired = () => {
    handleSubmit(true);
  };

  // Calculate character count for display
  const getCharacterCount = () => {
    // Strip HTML tags to get just text content
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = content;
    const textContent = tempDiv.textContent || "";
    return textContent.trim().length;
  };

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
      {/* Timer display for exam mode */}
      {isExam && timer && (
        <TimerDisplay timer={timer} onTimeExpired={handleTimeExpired} />
      )}
      
      <Card className="w-full">
        <CardHeader>
          <CardTitle>
            {isExam ? "Bài thi viết" : "Viết bài làm"}
          </CardTitle>
          <CardDescription>
            {isExam
              ? "Đây là bài kiểm tra. Bạn chỉ có một lần làm bài và không thể làm lại."
              : assignmentTitle}
          </CardDescription>
          <CautionSystem 
            isActive={!isSubmitting} 
            assignmentId={assignmentId}
            isExam={isExam}
          />
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Display assignment text content if available */}
          {assignment?.textContent && (
            <div className="space-y-4">
              <h3 className="text-md font-semibold">Nội dung bài tập</h3>
              <div className="p-4 border rounded-md bg-card">
                <div 
                  className="prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: assignment.textContent }}
                />
              </div>
            </div>
          )}

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-md font-semibold">Bài làm của bạn</h3>
              {!isExam && lastSaved && (
                <span className="text-xs text-muted-foreground">
                  Đã lưu lúc: {getLastSavedTime()}
                </span>
              )}
            </div>
            <EditorComponent
              content={content}
              onContentChange={handleContentChange}
              editorRef={editorRef}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Số ký tự: {getCharacterCount()}
            </div>
            {!isExam && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={saveDraft}
                disabled={isSubmitting || content.trim().length < 10}
              >
                <Save className="mr-2 h-4 w-4" />
                Lưu bản nháp
              </Button>
            )}
          </div>
          <Button 
            onClick={() => handleSubmit(false)} 
            disabled={isSubmitting || forcedSubmit || content.trim().length < 10}
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