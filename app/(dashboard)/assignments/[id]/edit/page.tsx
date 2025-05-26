'use client';

import React, { useState, useEffect, Suspense, useCallback, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/auth-context';
import { AuthGuard } from '@/components/auth/auth-guard';
import { FileText, List, Loader2, ChevronLeft } from 'lucide-react';
import { useTheme } from "next-themes";
import { updateAssignment, createQuizQuestion, getAssignmentById, AssignmentDetails, getQuizsByAssignmentId, QuizQuestion, updateQuizQuestion, deleteQuizQuestion } from '@/lib/api/assignment';
import ClassroomService, { Classroom } from '@/lib/api/classes';
import { SubjectService, SubjectDTO } from '@/lib/api/resource';
import { StudentAuthGuard } from '@/components/auth/student-auth-guard';

// Assignment Context Provider
import { AssignmentProvider, useAssignment } from '@/components/assignments/create/assignment-context';

// Import optimized components
import { CommonFields } from '@/components/assignments/create/optimized-form-fields';

// Lazy load components với code splitting
const TextAssignment = dynamic(
  () => import('@/components/assignments/create/text-assignment'),
  {
    loading: () => <LoadingPlaceholder height="400px" />,
    ssr: false
  }
);

const QuizAssignment = dynamic(
  () => import('@/components/assignments/create/quiz-assignment'),
  {
    loading: () => <LoadingPlaceholder height="500px" />,
    ssr: false
  }
);

// Loading placeholder để hiển thị khi đang lazy load
function LoadingPlaceholder({ height = "400px" }) {
  return (
    <div 
      className="flex justify-center items-center bg-muted/20 rounded-md border border-dashed" 
      style={{ height }}
    >
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Đang tải...</span>
      </div>
    </div>
  );
}

// Component chính với context provider
export default function EditAssignmentPage() {
  return (
    <AuthGuard allowedRoles={['Teacher', 'Admin']}>
      <AssignmentProvider>
        <EditAssignmentForm />
      </AssignmentProvider>
    </AuthGuard>
  );
}

// Form component sử dụng context
function EditAssignmentForm() {
  const router = useRouter();
  const params = useParams();
  const assignmentId = params.id as string;
  const { role, user } = useAuth();
  const { toast } = useToast();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAssignment, setIsLoadingAssignment] = useState(true);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const [remainingTime, setRemainingTime] = useState('');
  const [titleError, setTitleError] = useState<string | undefined>(undefined);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [classIds, setClassIds] = useState<string[]>([]);
  const [classes, setClasses] = useState<{id: string, name: string}[]>([]);
  const [subjects, setSubjects] = useState<SubjectDTO[]>([]);
  const [assignment, setAssignment] = useState<AssignmentDetails | null>(null);

  // Sử dụng state từ context
  const { 
    state,
    setCommonField,
    setTextContent,
    dispatch
  } = useAssignment();

  const {
    title,
    subject,
    description,
    dueDate,
    maxPoints,
    allowLateSubmissions,
    assignmentType,
    textContent,
    quizQuestions,
    timer
  } = state;

  // Helper function to set quiz questions
  const setQuizQuestions = useCallback((questions: any[]) => {
    dispatch({ type: 'SET_QUIZ_QUESTIONS', questions });
  }, [dispatch]);

  // Fetch assignment data
  useEffect(() => {
    const fetchAssignmentData = async () => {
      if (!assignmentId) return;
      
      try {
        setIsLoadingAssignment(true);
        
        // Fetch assignment details
        const assignmentResponse = await getAssignmentById(assignmentId);
        if (!assignmentResponse.isValid || !assignmentResponse.data) {
          throw new Error('Assignment not found');
        }
        
        const assignmentData = assignmentResponse.data;
        setAssignment(assignmentData);
        
        // Update form state with assignment data
        setCommonField('title', assignmentData.title);
        setCommonField('description', assignmentData.description);
        setCommonField('subject', assignmentData.subject?.subjectId || '');
        setCommonField('dueDate', new Date(assignmentData.dueDate).toISOString().slice(0, 16));
        setCommonField('maxPoints', assignmentData.maxPoints);
        setCommonField('allowLateSubmissions', assignmentData.allowLateSubmissions);
        setCommonField('assignmentType', assignmentData.assignmentType as any);
        setCommonField('timer', assignmentData.timer ? parseInt(assignmentData.timer) : 0);
        
        // Set class IDs
        const assignmentClassIds = assignmentData.classes?.map(c => c.classroomId) || [];
        setClassIds(assignmentClassIds);
        setCommonField('classIds', assignmentClassIds);
        
        // Set text content if applicable
        if (assignmentData.assignmentType === 'text' && assignmentData.textContent) {
          setTextContent(assignmentData.textContent);
        }
        
        // Fetch quiz questions if it's a quiz assignment
        if (assignmentData.assignmentType === 'quiz') {
          try {
            const quizResponse = await getQuizsByAssignmentId(assignmentId);
            if (quizResponse.isValid && quizResponse.data && quizResponse.data.quizQuestions) {
              const formattedQuestions = quizResponse.data.quizQuestions.map((quiz, index) => ({
                id: parseInt(quiz.quizQuestionId) || Date.now() + index,
                question: quiz.question,
                options: quiz.options || [],
                correctOptions: quiz.correctOptions || [],
                points: quiz.points || 1,
                explanation: quiz.explanation || ''
              }));
              setQuizQuestions(formattedQuestions);
            }
          } catch (error) {
            console.error('Error fetching quiz questions:', error);
          }
        }
        
      } catch (error: any) {
        console.error('Error fetching assignment:', error);
        toast({
          variant: 'destructive',
          title: 'Lỗi',
          description: error.message || 'Không thể tải thông tin bài tập.',
        });
        router.push('/assignments');
      } finally {
        setIsLoadingAssignment(false);
      }
    };
    
    fetchAssignmentData();
  }, [assignmentId, router, toast, setCommonField, setTextContent, setQuizQuestions]);

  // Fetch classes for the logged-in teacher
  useEffect(() => {
    const fetchTeacherClasses = async () => {
      if (!user?.userID) return;
      
      try {
        setIsLoadingClasses(true);
        let classrooms;
        if (role === 'Admin') {
          classrooms = await ClassroomService.getAllClassrooms();
        } else {
          classrooms = await ClassroomService.getClassroomsByTeacherId(user.userID);
        }
        
        // Transform classroom data to match the expected format
        const transformedClasses = classrooms.map((classroom: Classroom) => ({
          id: classroom.classroomId,
          name: classroom.name
        }));
        
        setClasses(transformedClasses);
      } catch (error) {
        console.error('Error fetching teacher classes:', error);
        toast({
          variant: 'destructive',
          title: 'Lỗi',
          description: 'Không thể tải danh sách lớp học. Vui lòng thử lại sau.',
        });
      } finally {
        setIsLoadingClasses(false);
      }
    };
    
    fetchTeacherClasses();
  }, [user?.userID, toast, role]);

  // Fetch subjects for the logged-in teacher
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const subjects = await SubjectService.getAllSubjects();
        setSubjects(subjects);
      } catch (error) {
        console.error('Error fetching subjects:', error);
        toast({
          variant: 'destructive',
          title: 'Không thể tải danh sách môn học. Vui lòng thử lại sau.',
        });
      }
    };
    
    fetchSubjects();
  }, [toast]);

  // Memoize các callback xử lý thay đổi field để giảm re-render
  const handleTitleChange = useCallback((value: string) => {
    setCommonField('title', value);
    // Xoá lỗi nếu có
    if (titleError) {
      setTitleError(undefined);
    }
  }, [setCommonField, titleError]);

  const handleDescriptionChange = useCallback((value: string) => {
    setCommonField('description', value);
  }, [setCommonField]);

  const handleSubjectChange = useCallback((value: string) => {
    setCommonField('subject', value);
  }, [setCommonField]);

  const handleClassIdsChange = useCallback((ids: string[]) => {
    setClassIds(ids);
    setCommonField('classIds', ids);
  }, [setCommonField]);

  const handleDueDateChange = useCallback((value: string) => {
    setCommonField('dueDate', value);
  }, [setCommonField]);

  const handleMaxPointsChange = useCallback((value: string) => {
    const numValue = parseInt(value) || 0;
    setCommonField('maxPoints', numValue);
  }, [setCommonField]);

  const handleAllowLateSubmissionsChange = useCallback((value: boolean) => {
    setCommonField('allowLateSubmissions', value);
  }, [setCommonField]);

  const handleTimerChange = useCallback((value: string | null) => {
    const numValue = value ? parseInt(value) : null;
    setCommonField('timer', numValue || 0);
  }, [setCommonField]);

  const handleAssignmentTypeChange = useCallback((value: 'text' | 'quiz' | 'file' | 'ai-quiz') => {
    setCommonField('assignmentType', value);
  }, [setCommonField]);

  // Mount effect
  useEffect(() => {
    setMounted(true);
  }, []);

  // Validate form
  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};
    
    if (!title.trim()) {
      newErrors.title = 'Tiêu đề bài tập không được để trống';
      setTitleError('Tiêu đề bài tập không được để trống');
    }
    
    if (!subject) {
      newErrors.subject = 'Vui lòng chọn môn học';
    }
    
    if (classIds.length === 0) {
      newErrors.classIds = 'Vui lòng chọn ít nhất một lớp học';
    }
    
    if (!dueDate) {
      newErrors.dueDate = 'Vui lòng chọn hạn nộp bài';
    }
    
    if (maxPoints <= 0) {
      newErrors.maxPoints = 'Điểm tối đa phải lớn hơn 0';
    }
    
    // Validate assignment type specific fields
    if (assignmentType === 'text' && !textContent.trim()) {
      newErrors.textContent = 'Nội dung bài tập không được để trống';
    }
    
    if (assignmentType === 'quiz' && quizQuestions.length === 0) {
      newErrors.quiz = 'Vui lòng thêm ít nhất một câu hỏi trắc nghiệm';
    }
    
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [title, subject, classIds, dueDate, maxPoints, assignmentType, textContent, quizQuestions]);

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        variant: 'destructive',
        title: 'Lỗi validation',
        description: 'Vui lòng kiểm tra lại thông tin đã nhập.',
      });
      return;
    }
    
    if (!assignment) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Không tìm thấy thông tin bài tập.',
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Get the current user ID from auth context
      const userId = user?.userID;
      
      if (!userId) {
        throw new Error('User ID not found');
      }

      const { title, subject, description, dueDate, maxPoints, allowLateSubmissions, assignmentType, textContent, quizQuestions, timer } = state;
      
      // Prepare the update request data
      const updateData = {
        assignmentId: assignment.assignmentId,
        userId,
        subjectId: subject,
        title,
        description: description || 'Đây là mô tả mặc định cho bài tập của bạn.', 
        classIds,
        dueDate,
        maxPoints: Number(maxPoints),
        allowLateSubmissions,
        assignmentType: assignmentType,
        textContent: assignmentType === 'text' ? textContent : '',
        timer: timer ? timer.toString() : null
      };
      
      // Call the API to update the assignment
      const response = await updateAssignment(updateData);

      // If quiz, handle quiz questions updates
      if (assignmentType === 'quiz' && response.data) {
        // Get existing quiz questions to compare
        const existingQuizResponse = await getQuizsByAssignmentId(assignmentId);
        const existingQuestions = existingQuizResponse.isValid && existingQuizResponse.data?.quizQuestions 
          ? existingQuizResponse.data.quizQuestions 
          : [];
        
        // Create maps for comparison
        const existingQuestionsMap = new Map(existingQuestions.map((q: any) => [q.quizQuestionId, q]));
        const newQuestionsMap = new Map(quizQuestions.map(q => [q.id.toString(), q])); // Convert to string for comparison
        
        // Delete questions that are no longer in the form
        for (const existingQuestion of existingQuestions) {
          if (!newQuestionsMap.has(existingQuestion.quizQuestionId)) {
            try {
              await deleteQuizQuestion(existingQuestion.quizQuestionId);
            } catch (error) {
              console.error('Error deleting quiz question:', error);
            }
          }
        }
        
        // Update or create questions
        const questionsPromises = quizQuestions.map(async (question) => {
          try {
            const existingQuestion = existingQuestionsMap.get(question.id.toString()); // Convert to string for lookup
            
            if (existingQuestion) {
              // Update existing question
              const updateQuestionData = {
                quizQuestionId: question.id.toString(), // Convert to string
                question: question.question,
                options: question.options,
                correctOptions: question.correctOptions,
                points: question.points,
                explanation: question.explanation || 'Chưa có giải thích cho câu hỏi này.',
                assignmentId: assignmentId
              };
              
              return await updateQuizQuestion(updateQuestionData);
            } else {
              // Create new question
              const questionData = {
                assignmentId,
                question: question.question,
                options: question.options,
                correctOptions: question.correctOptions,
                points: question.points,
                explanation: question.explanation || 'Chưa có giải thích cho câu hỏi này.'
              };
              
              return await createQuizQuestion(questionData);
            }
          } catch (error) {
            console.error('Error processing quiz question:', error);
            return null;
          }
        });
        
        await Promise.all(questionsPromises);
      }

      toast({
        title: 'Cập nhật bài tập thành công',
        description: 'Bài tập đã được cập nhật thành công.',
      });

      // Chuyển hướng về trang chi tiết bài tập
      router.push(`/assignments/${assignmentId}`);
    } catch (error) {
      console.error('Error updating assignment:', error);
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Không thể cập nhật bài tập. Vui lòng thử lại.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [validateForm, router, toast, user, state, classIds, assignment, assignmentId]);

  // Memoize onContentChange callback
  const handleTextContentChange = useCallback((content: string) => {
    setTextContent(content);
  }, [setTextContent]);

  if (isLoadingAssignment) {
    return (
      <AuthGuard allowedRoles={['Teacher', 'Admin']}>
        <div className="container mx-auto py-6">
          <Card className="animate-fade-in">
            <CardContent className="p-6">
              <div className="flex justify-center items-center py-12">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Đang tải thông tin bài tập...</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </AuthGuard>
    );
  }

  if (!assignment) {
    return (
      <AuthGuard allowedRoles={['Teacher', 'Admin']}>
        <div className="container mx-auto py-6">
          <Card className="animate-fade-in">
            <CardContent className="p-6">
              <div className="text-center py-12">
                <h3 className="text-lg font-medium mb-2">Không tìm thấy bài tập</h3>
                <p className="text-muted-foreground mb-4">Bài tập bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
                <Button onClick={() => router.push('/assignments')}>
                  Quay lại danh sách bài tập
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AuthGuard>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <Button 
          variant="outline" 
          onClick={() => router.push(`/assignments/${assignmentId}`)}
          className="flex items-center"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>
      </div>

      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle>Chỉnh sửa bài tập</CardTitle>
          <CardDescription>
            Cập nhật thông tin bài tập và gửi cho học sinh trong lớp
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Common Fields - Sử dụng component đã tối ưu */}
            <div className="animate-slide-in">
              <CommonFields 
                title={title}
                onTitleChange={handleTitleChange}
                titleError={titleError}
                
                description={description}
                onDescriptionChange={handleDescriptionChange}
                
                subject={subject}
                onSubjectChange={handleSubjectChange}
                
                classIds={classIds}
                onClassIdsChange={handleClassIdsChange}
                
                dueDate={dueDate}
                onDueDateChange={handleDueDateChange}
                
                maxPoints={maxPoints.toString()}
                onMaxPointsChange={handleMaxPointsChange}
                
                allowLateSubmissions={allowLateSubmissions}
                onAllowLateSubmissionsChange={handleAllowLateSubmissionsChange}
                
                timer={state.timer ? state.timer.toString() : null}
                onTimerChange={handleTimerChange}
                
                remainingTime={remainingTime}
                classes={classes}
                isLoadingClasses={isLoadingClasses}
                subjects={subjects}
              />
            </div>

            {/* Assignment Type Tabs */}
            <div className="space-y-4 animate-slide-in" style={{ animationDelay: '150ms' }}>
              <Tabs 
                value={assignmentType} 
                onValueChange={(value) => 
                  handleAssignmentTypeChange(value as any)
                }
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="text" className="flex items-center gap-2 transition-all hover:bg-primary/10">
                    <FileText className="h-4 w-4" />
                    Bài tập tự luận
                  </TabsTrigger>
                  <TabsTrigger value="quiz" className="flex items-center gap-2 transition-all hover:bg-primary/10">
                    <List className="h-4 w-4" />
                    Trắc nghiệm
                  </TabsTrigger>
                </TabsList>

                {/* Text Assignment */}
                <TabsContent value="text" className="animate-fade-in">
                  <Suspense fallback={<LoadingPlaceholder height="400px" />}>
                    <TextAssignment 
                      initialContent={textContent} 
                      onContentChange={handleTextContentChange}
                    />
                  </Suspense>
                </TabsContent>

                {/* Quiz Assignment */}
                <TabsContent value="quiz" className="animate-fade-in">
                  <Suspense fallback={<LoadingPlaceholder height="500px" />}>
                    <div className="space-y-6">
                      {/* Manual Quiz Editor */}
                      <QuizAssignment />
                    </div>
                  </Suspense>
                </TabsContent>
              </Tabs>
            </div>

            <div className="flex justify-end gap-4 animate-slide-in" style={{ animationDelay: '300ms' }}>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/assignments/${assignmentId}`)}
                disabled={isLoading}
                className="transition-all hover:scale-105"
              >
                Hủy
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="transition-all hover:scale-105"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang cập nhật...
                  </>
                ) : 'Cập nhật bài tập'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 