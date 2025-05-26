"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Users, Book, Loader2, Edit, Trash, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth-context";
import { AuthGuard } from "@/components/auth/auth-guard";
import { StudentAuthGuard } from "@/components/auth/student-auth-guard";
import { useTheme } from "next-themes";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

// Import APIs
import { 
  getAssignmentById, 
  deleteAssignment, 
  createQuizQuestion,
  updateQuizQuestion, 
  deleteQuizQuestion,
  getSubmissionsByAssignmentId,
  getSubmissionsByUserId,
  getQuizsByAssignmentId
} from "@/lib/api/assignment";

// Import các component đã tách
import AssignmentHeader from "@/components/assignments/detail/assignment-header";
import DeleteAssignmentDialog from "@/components/assignments/detail/delete-dialog";
import AssignmentOverview from "@/components/assignments/detail/assignment-overview";
import AssignmentDetails from "@/components/assignments/detail/assignment-details";
import { SubmissionList as TeacherSubmissionList } from "@/components/teacher/submissions/submission-list";
import { SubmissionDetail } from "@/components/shared/submissions/submission-detail";

// Import các kiểu dữ liệu và tiện ích
import type { AssignmentDetail, Submission, QuizQuestionType } from "@/components/assignments/shared/types";
import { getRemainingTime } from "@/components/assignments/shared/utils";

// Định nghĩa animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function AssignmentDetail() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { role, user } = useAuth();
  const { theme } = useTheme();
  const assignmentId = params.id as string;
  
  const [activeTab, setActiveTab] = useState("overview");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isQuestionLoading, setIsQuestionLoading] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState<any | null>(null);
  const [refreshData, setRefreshData] = useState(false);
  const [studentSubmission, setStudentSubmission] = useState<any>(null);
  const [studentSubmissionLoading, setStudentSubmissionLoading] = useState(false);
  
  // State for edited question
  const [editedQuestion, setEditedQuestion] = useState<{
    question: string;
    options: string[];
    correctOptions: number[];
    points: number;
    explanation: string;
  } | null>(null);
  
  // Update edited question when active question changes
  useEffect(() => {
    if (activeQuestion) {
      setEditedQuestion({
        question: activeQuestion.question,
        options: [...activeQuestion.options],
        correctOptions: [...activeQuestion.correctOptions],
        points: activeQuestion.points,
        explanation: activeQuestion.explanation
      });
    } else {
      setEditedQuestion(null);
    }
  }, [activeQuestion]);
  
  const [assignment, setAssignment] = useState<AssignmentDetail | null>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  
  // Fetch quiz questions for quiz type assignments
  const fetchQuizQuestions = useCallback(async () => {
    try {
      const quizResponse = await getQuizsByAssignmentId(assignmentId);
      if (quizResponse.data && quizResponse.data.quizQuestions) {
        setQuizQuestions(quizResponse.data.quizQuestions);
      }
    } catch (error) {
      console.error('Error fetching quiz questions:', error);
    }
  }, [assignmentId]);
  
  // Fetch submissions for teachers
  const fetchTeacherSubmissions = useCallback(async () => {
    try {
      const response = await getSubmissionsByAssignmentId(assignmentId);
      
      if (response.data && response.data.submissions) {
        setSubmissions(response.data.submissions);
      } else {
        setSubmissions([]);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      setSubmissions([]);
    }
  }, [assignmentId]);
  
  // Fetch submissions for students (just their own)
  const fetchStudentSubmission = useCallback(async () => {
    if (!user?.userID) return;
    
    try {
      setStudentSubmissionLoading(true);
      const response = await getSubmissionsByUserId(user.userID);
      
      if (response.data && response.data.submissions) {
        // Find submission for this assignment
        const submission = response.data.submissions.find(
          (sub: any) => sub.assignmentId === assignmentId
        );
        
        if (submission) {
          setStudentSubmission(submission);
        } else {
          setStudentSubmission(null);
        }
      } else {
        setStudentSubmission(null);
      }
    } catch (error) {
      console.error('Error fetching student submission:', error);
      setStudentSubmission(null);
    } finally {
      setStudentSubmissionLoading(false);
    }
  }, [user?.userID, assignmentId]);
  
  // Fetch the assignment data 
  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        setIsLoading(true);
        
        // Get the assignment details
        const response = await getAssignmentById(assignmentId);
        
        if (response.data) {
          const apiData = response.data;
          
          // Transform assignment data
          const transformedAssignment: AssignmentDetail = {
            id: apiData.assignmentId,
            title: apiData.title,
            subject: apiData.subject?.subjectName || "N/A",
            dueDate: apiData.dueDate,
            type: (apiData.assignmentType?.toLowerCase() === "quiz" ? "quiz" : "text") as "text" | "quiz" | "file" | "mixed",
            status: "assigned" as "graded" | "completed" | "assigned" | "overdue", // Default status
            progress: 0, // Default progress
            className: apiData.classes && apiData.classes[0] ? apiData.classes[0].name : "N/A",
            createdAt: apiData.createdAt,
            description: apiData.description || "",
            textContent: apiData.textContent || "", // Include textContent from API response
            createdBy: apiData.user?.fullName || "Người dùng không xác định",
            classId: apiData.classes && apiData.classes[0] ? apiData.classes[0].classroomId : "",
            timer: apiData.timer,
            isExam: apiData.timer !== null && apiData.timer !== "0", // Determine if it's an exam based on timer
            quiz: {
              questions: apiData.quizQuestions?.map((q: any) => ({
                id: q.quizQuestionId,
                type: "multiple_choice",
                question: q.question,
                options: q.options,
                correctAnswer: q.correctOptions[0]?.toString() || "0",
                image: ""
              })) || []
            }
          };
          
          setAssignment(transformedAssignment);
          
          // If it's a quiz, get the quiz details
          if (apiData.assignmentType?.toLowerCase() === "quiz") {
            fetchQuizQuestions();
          }
          
          // Fetch submissions based on role
          if (role === 'Teacher' || role === 'Admin') {
            fetchTeacherSubmissions();
          } else if (role === 'Student' && user?.userID) {
            fetchStudentSubmission();
          }
        } else {
          toast({
            variant: 'destructive',
            title: 'Lỗi',
            description: 'Không tìm thấy bài tập',
          });
          router.push('/assignments');
        }
      } catch (error) {
        console.error('Error fetching assignment:', error);
        toast({
          variant: 'destructive',
          title: 'Lỗi',
          description: 'Không thể tải thông tin bài tập',
        });
        router.push('/assignments');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignment();
  }, [assignmentId, router, toast, refreshData, user?.userID, role, fetchQuizQuestions, fetchTeacherSubmissions, fetchStudentSubmission]);
  
  // Add a new quiz question
  const handleAddQuizQuestion = async () => {
    if (!assignment) return;
    
    try {
      setIsQuestionLoading(true);
      
      const newQuestionData = {
        assignmentId: assignment.id,
        question: "Câu hỏi mới",
        options: ["Phương án 1", "Phương án 2", "Phương án 3", "Phương án 4"],
        correctOptions: [0], // First option is correct by default
        points: 10,
        explanation: "Giải thích câu hỏi"
      };
      
      const response = await createQuizQuestion(newQuestionData);
      
      if (response.data) {
        // Add new question to the list
        setQuizQuestions(prev => [...prev, response.data]);
        
        toast({
          title: 'Thành công',
          description: 'Đã thêm câu hỏi mới',
        });
      }
    } catch (error) {
      console.error('Error adding quiz question:', error);
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Không thể thêm câu hỏi mới',
      });
    } finally {
      setIsQuestionLoading(false);
    }
  };
  
  // Update a quiz question
  const handleUpdateQuizQuestion = async (questionId: string, data: any) => {
    try {
      setIsQuestionLoading(true);
      
      const updateData = {
        quizQuestionId: questionId,
        assignmentId: assignment?.id || "",
        ...data
      };
      
      const response = await updateQuizQuestion(updateData);
      
      if (response.data) {
        // Update the question in the list
        setQuizQuestions(prev => 
          prev.map(q => q.quizQuestionId === questionId ? response.data : q)
        );
        
        toast({
          title: 'Thành công',
          description: 'Đã cập nhật câu hỏi',
        });
      }
    } catch (error) {
      console.error('Error updating quiz question:', error);
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Không thể cập nhật câu hỏi',
      });
    } finally {
      setIsQuestionLoading(false);
      setActiveQuestion(null);
    }
  };
  
  // Delete a quiz question
  const handleDeleteQuizQuestion = async (questionId: string) => {
    try {
      setIsQuestionLoading(true);
      
      const response = await deleteQuizQuestion(questionId);
      
      if (response.data === true) {
        // Remove the question from the list
        setQuizQuestions(prev => prev.filter(q => q.quizQuestionId !== questionId));
        
        toast({
          title: 'Thành công',
          description: 'Đã xóa câu hỏi',
        });
      }
    } catch (error) {
      console.error('Error deleting quiz question:', error);
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Không thể xóa câu hỏi',
      });
    } finally {
      setIsQuestionLoading(false);
    }
  };
  
  const remainingTime = assignment ? getRemainingTime(assignment.dueDate) : "";
  const isExpired = assignment ? new Date(assignment.dueDate) < new Date() : false;
  
  // Count submissions by status
  const submittedCount = submissions.filter(sub => sub.status?.toLowerCase() === 'submitted').length;
  const gradedCount = submissions.filter(sub => sub.status?.toLowerCase() === 'graded').length;
  const lateCount = submissions.filter(sub => sub.status?.toLowerCase() === 'late').length;
  
  // Handle navigation to the full screen submission page
  const handleGoToSubmitPage = () => {
    if (!assignment) return;
    
    // Navigate to the full screen submission page
    router.push(`/assignments/${assignmentId}/submit`);
  };
  
  const handleDeleteAssignment = async () => {
    setIsSubmitting(true);
    
    try {
      const response = await deleteAssignment(assignmentId);
      
      if (response.data === true) {
        setIsSubmitting(false);
        setShowDeleteDialog(false);
        
        toast({
          title: 'Đã xóa bài tập',
          description: 'Bài tập đã được xóa thành công',
        });
        
        router.push('/assignments');
      } else {
        throw new Error('Failed to delete assignment');
      }
    } catch (error) {
      console.error('Error deleting assignment:', error);
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Không thể xóa bài tập. Vui lòng thử lại.',
      });
      setIsSubmitting(false);
    }
  };
  
  // Handle text input changes
  const handleInputChange = (field: string, value: any) => {
    if (!editedQuestion) return;
    setEditedQuestion(prev => prev ? { ...prev, [field]: value } : null);
  };
  
  // Handle option text changes
  const handleOptionChange = (index: number, value: string) => {
    if (!editedQuestion) return;
    const newOptions = [...editedQuestion.options];
    newOptions[index] = value;
    setEditedQuestion(prev => prev ? { ...prev, options: newOptions } : null);
  };
  
  // Handle correct option checkbox changes
  const handleCorrectOptionChange = (index: number, checked: boolean) => {
    if (!editedQuestion) return;
    let newCorrectOptions = [...editedQuestion.correctOptions];
    if (checked) {
      // Add index if it doesn't exist
      if (!newCorrectOptions.includes(index)) {
        newCorrectOptions.push(index);
      }
    } else {
      // Remove index if it exists
      newCorrectOptions = newCorrectOptions.filter(opt => opt !== index);
    }
    setEditedQuestion(prev => prev ? { ...prev, correctOptions: newCorrectOptions } : null);
  };
  
  // Save edited question changes
  const handleSaveEditedQuestion = () => {
    if (!activeQuestion || !editedQuestion) return;
    handleUpdateQuizQuestion(activeQuestion.quizQuestionId, editedQuestion);
  };

  if (isLoading) {
    return (
      <AuthGuard>
        <div className="container mx-auto p-4 space-y-6 flex items-center justify-center min-h-[50vh]">
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg">Đang tải thông tin bài tập...</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (!assignment) {
    return (
      <AuthGuard>
        <div className="container mx-auto p-4 space-y-6">
          <h1 className="text-2xl font-bold">Không tìm thấy bài tập</h1>
          <p>Bài tập này không tồn tại hoặc đã bị xóa.</p>
          <button 
            onClick={() => router.push('/assignments')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Quay lại danh sách bài tập
          </button>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <StudentAuthGuard
        resourceType="assignment"
        resourceId={assignmentId}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="container mx-auto p-4 space-y-6"
        >
          {/* Header */}
          <AssignmentHeader 
            title={assignment.title}
            subject={assignment.subject}
            role={role || ''}
            assignmentId={assignmentId}
            isExpired={isExpired}
            remainingTime={remainingTime}
            isExam={assignment.isExam}
            timer={assignment.timer}
            onDeleteClick={() => setShowDeleteDialog(true)}
          />
          
          {/* Delete Dialog */}
          <DeleteAssignmentDialog 
            isOpen={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
            onDelete={handleDeleteAssignment}
            isSubmitting={isSubmitting}
          />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:w-[500px]">
              <TabsTrigger value="overview">Tổng quan</TabsTrigger>
              
              {/* For teachers, show submissions list with count */}
              {(role === 'Teacher' || role === 'Admin') && (
                <TabsTrigger value="submissions">
                  Bài nộp ({submissions.length})
                </TabsTrigger>
              )}
              
              {/* For teachers with quiz assignments, show preview tab */}
              {(role === 'Teacher' || role === 'Admin') && assignment?.type === 'quiz' && (
                <TabsTrigger value="preview">Xem trước</TabsTrigger>
              )}
              
              {/* For students, always show their submissions */}
              {role === 'Student' && (
                <TabsTrigger value="submissions">Bài nộp</TabsTrigger>
              )}
              
              <TabsTrigger value="details">Chi tiết</TabsTrigger>
            </TabsList>

            {/* Tổng quan */}
            <TabsContent value="overview" className="space-y-4 mt-6">
              <AssignmentOverview 
                assignment={assignment}
                isExpired={isExpired}
                role={role || ''}
                onSubmitClick={handleGoToSubmitPage}
              />
            </TabsContent>

            {/* Tab Bài nộp cho cả học sinh và giáo viên */}
            <TabsContent value="submissions" className="space-y-4">
              {/* For teachers, show submissions list */}
              {(role === 'Teacher' || role === 'Admin') && (
                <TeacherSubmissionList
                  assignmentId={assignmentId}
                  assignmentTitle={assignment.title}
                  assignmentType={assignment.type}
                />
              )}
              
              {/* For students, show their submission */}
              {role === 'Student' && (
                <div>
                  {studentSubmissionLoading ? (
                    <Card className="w-full p-8">
                      <CardContent className="flex justify-center items-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </CardContent>
                    </Card>
                  ) : studentSubmission ? (
                    <div className="space-y-4">
                      <SubmissionDetail
                        submissionId={studentSubmission.submissionId}
                        assignmentId={assignmentId}
                        assignmentTitle={assignment.title}
                        allowEdit={false}
                      />
                      
                      {/* Add retake button for non-exam assignments */}
                      {!assignment.isExam && !isExpired && (
                        <Card className="w-full p-4">
                          <CardContent className="flex justify-between items-center">
                            <div>
                              <h3 className="font-medium">Bạn muốn làm lại bài tập này?</h3>
                              <p className="text-sm text-muted-foreground">
                                Bài tập không phải là bài kiểm tra, bạn có thể làm lại nhiều lần
                              </p>
                            </div>
                            <Button onClick={handleGoToSubmitPage}>
                              Làm lại bài
                            </Button>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  ) : (
                    <Card className="w-full p-8">
                      <CardContent className="flex flex-col justify-center items-center p-8">
                        <p className="mb-4 text-muted-foreground">Bạn chưa nộp bài tập này</p>
                        {!isExpired && (
                          <Button onClick={handleGoToSubmitPage}>
                            Làm bài ngay
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </TabsContent>

            {/* Tab Quiz Preview for Teacher */}
            {(role === 'Teacher' || role === 'Admin') && assignment?.type === 'quiz' && (
              <TabsContent value="preview" className="space-y-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">Quản lý câu hỏi</h3>
                      <p className="text-sm text-muted-foreground">
                        Tạo và quản lý các câu hỏi cho bài kiểm tra trắc nghiệm
                      </p>
                    </div>
                    <Button 
                      onClick={handleAddQuizQuestion}
                      disabled={isQuestionLoading}
                      className="flex items-center gap-1"
                    >
                      {isQuestionLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                      Thêm câu hỏi
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {isQuestionLoading ? (
                      <div className="flex justify-center items-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : quizQuestions.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">Chưa có câu hỏi nào</p>
                        <p className="text-sm text-muted-foreground">Nhấn "Thêm câu hỏi" để bắt đầu tạo câu hỏi</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {quizQuestions.map((question, index) => (
                          <Card key={question.quizQuestionId} className="overflow-hidden">
                            <div className="p-4 bg-muted/50">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h4 className="font-medium">Câu hỏi {index + 1}</h4>
                                  <p className="text-sm mt-1">{question.question}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => setActiveQuestion(question)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => handleDeleteQuizQuestion(question.quizQuestionId)}
                                    className="text-destructive hover:text-destructive"
                                  >
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              <div className="mt-2 grid gap-2">
                                {question.options.map((option: string, optIndex: number) => (
                                  <div 
                                    key={optIndex} 
                                    className={`p-2 rounded-md text-sm ${question.correctOptions.includes(optIndex) ? 'bg-primary/20 text-primary' : 'bg-muted'}`}
                                  >
                                    {option} {question.correctOptions.includes(optIndex) && '✓'}
                                  </div>
                                ))}
                              </div>
                              {question.explanation && (
                                <div className="mt-3 text-sm p-2 border-t border-muted">
                                  <p className="font-medium">Giải thích:</p>
                                  <p className="text-muted-foreground">{question.explanation}</p>
                                </div>
                              )}
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* Tab Chi tiết */}
            <TabsContent value="details" className="space-y-4 mt-6">
              <AssignmentDetails 
                assignment={assignment}
                gradedCount={gradedCount}
                submittedCount={submittedCount}
                lateCount={lateCount}
                role={role || ''}
                userSubmissionStatus={studentSubmission?.status}
                onViewSubmissions={() => setActiveTab("submissions")}
              />
            </TabsContent>
          </Tabs>
        </motion.div>
        
        {/* Edit Question Dialog */}
        {activeQuestion && editedQuestion && (
          <Dialog 
            open={!!activeQuestion} 
            onOpenChange={(open) => !open && setActiveQuestion(null)}
          >
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Chỉnh sửa câu hỏi</DialogTitle>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="question">Câu hỏi</Label>
                  <Textarea 
                    id="question" 
                    value={editedQuestion.question} 
                    onChange={(e) => handleInputChange('question', e.target.value)}
                    rows={3}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label>Các phương án</Label>
                  {editedQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Checkbox 
                        id={`option-${index}`} 
                        checked={editedQuestion.correctOptions.includes(index)}
                        onCheckedChange={(checked) => handleCorrectOptionChange(index, checked as boolean)}
                      />
                      <div className="flex-1">
                        <Input
                          value={option}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          placeholder={`Phương án ${index + 1}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="explanation">Giải thích</Label>
                  <Textarea 
                    id="explanation" 
                    value={editedQuestion.explanation} 
                    onChange={(e) => handleInputChange('explanation', e.target.value)}
                    rows={2}
                    placeholder="Giải thích đáp án đúng"
                  />
                </div>
              </div>
              
              <DialogFooter className="sm:justify-end">
                <DialogClose asChild>
                  <Button variant="outline" type="button">Hủy</Button>
                </DialogClose>
                <Button 
                  type="button" 
                  onClick={handleSaveEditedQuestion}
                  disabled={isQuestionLoading}
                >
                  {isQuestionLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    'Lưu thay đổi'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </StudentAuthGuard>
    </AuthGuard>
  );
} 