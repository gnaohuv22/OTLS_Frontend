"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, Clock, User, ArrowLeft, CheckCircle, XCircle, FileText, List } from "lucide-react";
import { getSubmissionById, getAssignmentById, getQuizsByAssignmentId, updateSubmission } from "@/lib/api/assignment";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from 'next/navigation';
import { useAuth } from "@/lib/auth-context";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import EditorComponent from "@/components/shared/editor-component";

// Helper function to format a date string
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

interface SubmissionDetailProps {
  submissionId: string;
  assignmentId: string;
  assignmentTitle: string;
  allowEdit?: boolean;
}

export function SubmissionDetail({ 
  submissionId,
  assignmentId,
  assignmentTitle,
  allowEdit = false
}: SubmissionDetailProps) {
  const [submission, setSubmission] = useState<any>(null);
  const [assignment, setAssignment] = useState<any>(null);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedGrading, setExpandedGrading] = useState(false);
  const [grade, setGrade] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const editorRef = useRef(null);
  const { toast } = useToast();
  const router = useRouter();
  const { user, role } = useAuth();

  // Fetch quiz questions for context
  const fetchQuizQuestions = useCallback(async () => {
    try {
      const quizResponse = await getQuizsByAssignmentId(assignmentId);
      if (quizResponse.data && quizResponse.data.quizQuestions) {
        setQuizQuestions(quizResponse.data.quizQuestions);
      }
    } catch (error) {
      console.error("Error fetching quiz questions:", error);
    }
  }, [assignmentId]);

  // Fetch submission details
  const fetchSubmission = useCallback(async () => {
    try {
      setIsLoading(true);
      // Fetch submission data
      const response = await getSubmissionById(submissionId);
      
      if (response.data) {
        // Also fetch assignment details to get maxPoints
        const assignmentResponse = await getAssignmentById(assignmentId);
        
        if (assignmentResponse.data) {
          // Combine submission with assignment data
          setSubmission({
            ...response.data,
            assignment: {
              maxPoints: assignmentResponse.data.maxPoints || 100
            }
          });
          setAssignment(assignmentResponse.data);
        } else {
          setSubmission(response.data);
        }
        
        setGrade(response.data.grade || 0);
        setFeedback(response.data.feedback || "");
        
        // Check permission - only allow users to view their own submissions unless they're teachers/admins
        if (role === 'Student' && response.data.user?.userID !== user?.userID) {
          toast({
            variant: "destructive",
            title: "Không có quyền truy cập",
            description: "Bạn không có quyền xem bài nộp này.",
          });
          router.push(`/assignments/${assignmentId}`);
        }

        // If it's a quiz submission with answers, fetch quiz questions
        if (response.data.answers && Object.keys(response.data.answers).length > 0) {
          fetchQuizQuestions();
        }
      } else {
        throw new Error("Không tìm thấy bài nộp");
      }
    } catch (error) {
      console.error("Error fetching submission:", error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tải thông tin bài nộp. Vui lòng thử lại sau.",
      });
      router.push(`/assignments/${assignmentId}`);
    } finally {
      setIsLoading(false);
    }
  }, [submissionId, assignmentId, role, user, router, toast, fetchQuizQuestions]);

  // Fetch submission details and quiz questions if needed
  useEffect(() => {
    fetchSubmission();
  }, [fetchSubmission]);

  // Get status badge
  const getStatusBadge = (status: string) => {
    if (!status) return null;
    
    switch (status.toLowerCase()) {
      case 'submitted':
        return <Badge variant="outline">Đã nộp</Badge>;
      case 'graded':
        return <Badge variant="secondary">Đã chấm</Badge>;
      case 'stopped with caution':
        return <Badge variant="destructive">Nộp bắt buộc</Badge>;
      case 'late':
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">Nộp muộn</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Get assignment type badge
  const getAssignmentTypeBadge = () => {
    if (!assignment) return null;
    
    switch (assignment.assignmentType?.toLowerCase()) {
      case 'text':
        return (
          <Badge variant="outline" className="bg-accent/50 text-accent-foreground">
            <FileText className="h-3 w-3 mr-1" />
            Bài tập tự luận
          </Badge>
        );
      case 'quiz':
        return (
          <Badge variant="outline" className="bg-secondary/70 text-secondary-foreground">
            <List className="h-3 w-3 mr-1" />
            Trắc nghiệm
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            Bài tập
          </Badge>
        );
    }
  };

  // Navigation handlers
  const handleBack = () => {
    router.back();
  };

  // Format and display quiz answers
  const renderQuizAnswers = () => {
    if (!submission.answers || Object.keys(submission.answers).length === 0) {
      return <p className="text-muted-foreground">Không có câu trả lời</p>;
    }

    if (quizQuestions.length === 0) {
      // If quiz questions aren't loaded yet, show simplified view
      return (
        <div className="space-y-4">
          {Object.entries(submission.answers).map(([questionId, answer], index) => (
            <div key={questionId} className="border rounded-md p-4">
              <h4 className="font-medium mb-2">Câu hỏi {index + 1}</h4>
              <p>Câu trả lời: {answer as string}</p>
            </div>
          ))}
        </div>
      );
    }

    // Extract question_ID pattern from answer keys
    const getQuestionIdFromKey = (key: string) => {
      // Keys might be in formats like "question_123abc" or just an index
      const match = key.match(/question_(.+)/);
      return match ? match[1] : key;
    };

    return (
      <div className="space-y-4">
        {quizQuestions.map((question, index) => {
          // Find matching answer for this question
          const answerKey = Object.keys(submission.answers).find(key => 
            getQuestionIdFromKey(key) === question.quizQuestionId
          );
          
          // Even if no answer found for this question, still show it
          const studentAnswerValue = answerKey ? submission.answers[answerKey] : "";
          const studentAnswerIndices = studentAnswerValue ? studentAnswerValue.split(',').map((s: string) => parseInt(s.trim())) : [];

          return (
            <div key={question.quizQuestionId} className="border rounded-md p-5 bg-card shadow-sm">
              <h4 className="font-medium text-lg mb-3 text-slate-900 dark:text-slate-50">{question.question}</h4>
              
              <div className="mt-2 space-y-2">
                {question.options.map((option: string, optIndex: number) => {
                  const isStudentSelected = studentAnswerIndices.includes(optIndex);
                  const isCorrect = question.correctOptions.includes(optIndex);
                  
                  // Determine styling based on correctness using theme variables with better contrast
                  let optionClass = "p-3 rounded-md flex items-center mb-1.5 transition-colors";
                  if (isStudentSelected && isCorrect) {
                    optionClass += " bg-green-100 dark:bg-green-900/60 text-green-800 dark:text-green-100 border border-green-300 dark:border-green-700";
                  } else if (isStudentSelected && !isCorrect) {
                    optionClass += " bg-red-100 dark:bg-red-900/60 text-red-800 dark:text-red-100 border border-red-300 dark:border-red-700";
                  } else if (!isStudentSelected && isCorrect) {
                    optionClass += " bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-100 border border-blue-300 dark:border-blue-700";
                  } else {
                    optionClass += " bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700";
                  }
                  
                  return (
                    <div key={optIndex} className={optionClass}>
                      {isStudentSelected && isCorrect && (
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600 dark:text-green-400" />
                      )}
                      {isStudentSelected && !isCorrect && (
                        <XCircle className="h-4 w-4 mr-2 text-red-600 dark:text-red-400" />
                      )}
                      <span className="flex-1">{option}</span>
                      {!isStudentSelected && isCorrect && (
                        <span className="ml-2 text-xs font-medium px-1.5 py-0.5 rounded bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200">Đáp án đúng</span>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {question.explanation && (
                <div className="mt-4 p-3 rounded-md border-l-4 border-blue-500 dark:border-blue-400 text-sm bg-blue-50 dark:bg-blue-950/50 shadow-sm">
                  <p className="font-medium text-blue-800 dark:text-blue-300 mb-1">Giải thích:</p>
                  <div className="text-slate-700 dark:text-slate-300 prose-sm prose-p:my-1">{question.explanation}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const handleToggleGrading = () => {
    setExpandedGrading(!expandedGrading);
  };

  const handleSaveGrading = async () => {
    if (!submission) return;
    
    try {
      setIsSaving(true);
      
      const updateData = {
        submissionId: submission.submissionId,
        submittedAt: submission.submittedAt,
        status: "graded",
        grade: grade,
        feedback: feedback,
        answers: submission.answers || {},
        textContent: submission.textContent || "",
        assignmentId: assignmentId,
        userId: submission.user?.userID,
      };
      
      const response = await updateSubmission(updateData);
      
      if (response.data) {
        setSubmission({...submission, status: "graded", grade: grade, feedback: feedback});
        toast({
          title: "Lưu thành công",
          description: "Đã cập nhật đánh giá cho bài nộp.",
        });
        setExpandedGrading(false);
      }
    } catch (error) {
      console.error("Error saving grading:", error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể lưu đánh giá. Vui lòng thử lại sau.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFeedbackChange = (value: string) => {
    setFeedback(value);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <div className="flex gap-2">
            {getAssignmentTypeBadge()}
            {submission?.status ? getStatusBadge(submission.status) : null}
          </div>
        </div>
        <CardTitle>{assignmentTitle}</CardTitle>
        <CardDescription>Chi tiết bài nộp</CardDescription>
      </CardHeader>

      {isLoading ? (
        <CardContent className="flex justify-center items-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      ) : submission ? (
        <>
          <CardContent className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 md:gap-8">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {submission.user?.fullName || 'Không xác định'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Nộp lúc: {formatDate(submission.submittedAt)}
                </span>
              </div>
            </div>

            <Separator />

            {/* Submission content based on assignment type */}
            {assignment?.assignmentType?.toLowerCase() === 'quiz' ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <List className="h-5 w-5" />
                  Câu trả lời trắc nghiệm
                </h3>
                {Object.keys(submission.answers || {}).length > 0 ? (
                  renderQuizAnswers()
                ) : (
                  <p className="text-muted-foreground">Không có câu trả lời</p>
                )}
              </div>
            ) : assignment?.assignmentType?.toLowerCase() === 'text' ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Bài tự luận
                </h3>
                {submission.textContent ? (
                  <div 
                    className="prose max-w-none dark:prose-invert prose-slate dark:prose-invert-slate"
                    dangerouslySetInnerHTML={{ __html: submission.textContent }}
                  />
                ) : (
                  <p className="text-muted-foreground">Không có nội dung bài làm</p>
                )}
              </div>
            ) : (
              <>
                {/* Fallback for both content types or unknown types */}
                {Object.keys(submission.answers || {}).length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Câu trả lời trắc nghiệm</h3>
                    {renderQuizAnswers()}
                  </div>
                )}

                {submission.textContent && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Bài tự luận</h3>
                    <div 
                      className="prose max-w-none dark:prose-invert prose-slate dark:prose-invert-slate"
                      dangerouslySetInnerHTML={{ __html: submission.textContent }}
                    />
                  </div>
                )}
              </>
            )}

            <Separator />

            {/* Grading section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Đánh giá</h3>
              
              {!expandedGrading ? (
                <>
                  <div className="flex items-center gap-4">
                    <div className="font-medium">Điểm số:</div>
                    <div className="text-xl">
                      {submission.status?.toLowerCase() === 'graded' ? (
                        <div className="flex items-center">
                          <span className="font-semibold">
                            {submission.grade.toFixed(1)}/{submission.assignment?.maxPoints || 100}
                          </span>
                          <span className="ml-2 text-sm text-muted-foreground">
                            ({((submission.grade / (submission.assignment?.maxPoints || 100)) * 100).toFixed(0)}%)
                          </span>
                        </div>
                      ) : (
                        'Chưa chấm điểm'
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="font-medium">Nhận xét:</div>
                    {submission.feedback ? (
                      <div 
                        className="prose max-w-none dark:prose-invert prose-slate dark:prose-invert-slate rounded border border-border p-3 bg-card"
                        dangerouslySetInnerHTML={{ __html: submission.feedback }}
                      />
                    ) : (
                      <p className="text-muted-foreground">Chưa có nhận xét</p>
                    )}
                  </div>
                </>
              ) : (
                // Expanded grading UI
                <div className="space-y-6 border p-4 rounded-md bg-card">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="grade" className="block text-sm font-medium mb-1 text-foreground">Điểm số:</label>
                      <div className="flex items-center gap-2">
                        <Input 
                          id="grade" 
                          type="number" 
                          value={grade}
                          min={0}
                          max={submission.assignment?.maxPoints || 100}
                          onChange={(e) => setGrade(Number(e.target.value))}
                          className="w-32"
                        />
                        <span className="text-sm text-muted-foreground font-medium">
                          / {submission.assignment?.maxPoints || 100}
                        </span>
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({grade > 0 ? ((grade / (submission.assignment?.maxPoints || 100)) * 100).toFixed(0) : 0}%)
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="feedback" className="block text-sm font-medium mb-1 text-foreground">Nhận xét:</label>
                      <EditorComponent
                        content={feedback}
                        onContentChange={handleFeedbackChange}
                        editorRef={editorRef}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={handleToggleGrading}>Hủy</Button>
                    <Button 
                      onClick={handleSaveGrading} 
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Đang lưu...
                        </>
                      ) : "Lưu đánh giá"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>

          {(role === 'Teacher' || role === 'Admin') && allowEdit && !expandedGrading && (
            <CardFooter className="flex justify-end">
              <Button onClick={handleToggleGrading}>
                Chấm điểm
              </Button>
            </CardFooter>
          )}
        </>
      ) : (
        <CardContent>
          <p className="text-center text-muted-foreground">
            Không tìm thấy thông tin bài nộp
          </p>
        </CardContent>
      )}
    </Card>
  );
} 