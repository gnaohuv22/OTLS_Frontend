"use client";

import { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Loader2, Save } from "lucide-react";
import { getSubmissionById, updateSubmission } from "@/lib/api/assignment";
import { useToast } from "@/components/ui/use-toast";
import EditorComponent from "@/components/shared/editor-component";

interface SubmissionGradingProps {
  submissionId: string;
  assignmentId: string;
  userId: string;
  initialGrade?: number;
  initialFeedback?: string;
  maxPoints: number;
  submissionType: 'quiz' | 'text';
  onGradingComplete: () => void;
}

export function SubmissionGrading({ 
  submissionId,
  assignmentId,
  userId,
  initialGrade = 0,
  initialFeedback = "",
  maxPoints = 100,
  submissionType,
  onGradingComplete
}: SubmissionGradingProps) {
  const [grade, setGrade] = useState<number>(initialGrade);
  const [feedback, setFeedback] = useState<string>(initialFeedback);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [exactGradeInput, setExactGradeInput] = useState<string>(initialGrade.toString());
  const { toast } = useToast();
  const editorRef = useRef(null);

  // Handle slider change
  const handleSliderChange = (value: number[]) => {
    const newGrade = value[0];
    setGrade(newGrade);
    setExactGradeInput(newGrade.toString());
  };

  // Handle exact grade input change
  const handleExactGradeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.trim();
    setExactGradeInput(inputValue);
    
    // Parse value as number if valid
    const numValue = parseFloat(inputValue);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= maxPoints) {
      setGrade(numValue);
    }
  };

  // Handle exact grade input blur - normalize value if needed
  const handleExactGradeBlur = () => {
    let numValue = parseFloat(exactGradeInput);
    
    if (isNaN(numValue)) {
      numValue = 0;
    } else if (numValue < 0) {
      numValue = 0;
    } else if (numValue > maxPoints) {
      numValue = maxPoints;
    }
    
    setGrade(numValue);
    setExactGradeInput(numValue.toString());
  };

  // Handle feedback change
  const handleFeedbackChange = (content: string) => {
    setFeedback(content);
  };

  // Handle submission
  const handleSubmitGrading = async () => {
    setIsSubmitting(true);
    
    try {
      // For quiz submissions, we should not allow changing the grade
      if (submissionType === 'quiz') {
        toast({
          variant: "destructive",
          title: "Không thể chấm điểm",
          description: "Bài trắc nghiệm được chấm điểm tự động và không thể thay đổi.",
        });
        setIsSubmitting(false);
        return;
      }

      // Get the current submission first to preserve existing data
      const submissionResponse = await getSubmissionById(submissionId);
      
      if (!submissionResponse.data) {
        throw new Error("Không thể tải thông tin bài nộp");
      }

      const submission = submissionResponse.data;
      
      // Create update data
      const updateData = {
        submissionId: submissionId,
        submittedAt: submission.submittedAt,
        status: "Graded", // Update status to graded
        grade: grade,
        feedback: feedback,
        answers: submission.answers || {}, // Preserve existing answers
        textContent: submission.textContent || "",
        assignmentId: assignmentId,
        userId: userId
      };

      // Submit to the API
      const response = await updateSubmission(updateData);
      
      if (response.data) {
        toast({
          title: "Chấm điểm thành công",
          description: "Đã lưu điểm và nhận xét cho bài nộp.",
        });
        
        // Notify parent component that grading is complete
        onGradingComplete();
      }
    } catch (error) {
      console.error("Error submitting grade:", error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể lưu điểm và nhận xét. Vui lòng thử lại sau.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Chấm điểm bài nộp</CardTitle>
        <CardDescription>
          Đánh giá và cho điểm bài làm của học sinh
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-md font-semibold">Điểm số</h3>
          
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Slider
                defaultValue={[grade]}
                max={maxPoints}
                step={0.5}
                value={[grade]}
                onValueChange={handleSliderChange}
                disabled={submissionType === 'quiz'}
              />
            </div>
            <div className="flex items-center gap-1">
              <Input
                type="number"
                min={0}
                max={maxPoints}
                step={0.1}
                value={exactGradeInput}
                onChange={handleExactGradeChange}
                onBlur={handleExactGradeBlur}
                disabled={submissionType === 'quiz'}
                className="w-20"
              />
              <span className="text-sm text-muted-foreground font-medium">/ {maxPoints}</span>
              <span className="ml-2 text-xs text-muted-foreground">
                ({grade > 0 ? ((grade / maxPoints) * 100).toFixed(0) : 0}%)
              </span>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-md font-semibold">Nhận xét</h3>
          <EditorComponent
            content={feedback}
            onContentChange={handleFeedbackChange}
            editorRef={editorRef}
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          {submissionType === 'quiz' && "Bài trắc nghiệm được chấm điểm tự động. Bạn chỉ có thể thêm nhận xét."}
        </div>
        <Button 
          onClick={handleSubmitGrading} 
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang lưu...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Lưu đánh giá
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
} 