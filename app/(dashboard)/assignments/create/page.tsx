'use client';

import React, { useState, useEffect, Suspense, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/auth-context';
import { AuthGuard } from '@/components/auth/auth-guard';
import { FileText, List, Brain, Loader2 } from 'lucide-react';
import { useTheme } from "next-themes";
import { addAssignment, createQuizQuestion } from '@/lib/api/assignment';
import ClassroomService, { Classroom } from '@/lib/api/classes';
import { SubjectService, SubjectDTO } from '@/lib/api/resource';

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

const AIQuizTab = dynamic(
  () => import('@/components/assignments/create/ai-quiz-tab'),
  {
    loading: () => <LoadingPlaceholder height="600px" />,
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

// Add a function to create quiz options since it's not exported from assignment.ts
const createQuizOption = async (data: { questionId: string, content: string, isCorrect: boolean }) => {
  try {
    const response = await fetch('/api/quiz-options', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return await response.json();
  } catch (error) {
    console.error('Error creating quiz option:', error);
    return null;
  }
};

// Component chính với context provider
export default function CreateAssignmentPage() {
  return (
    <AuthGuard allowedRoles={['Teacher', 'Admin']}>
      <AssignmentProvider>
        <CreateAssignmentForm />
      </AssignmentProvider>
    </AuthGuard>
  );
}

// Form component sử dụng context
function CreateAssignmentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { role, user } = useAuth();
  const { toast } = useToast();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const [remainingTime, setRemainingTime] = useState('');
  const [titleError, setTitleError] = useState<string | undefined>(undefined);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [classIds, setClassIds] = useState<string[]>([]);
  const [classes, setClasses] = useState<{id: string, name: string}[]>([]);
  const [subjects, setSubjects] = useState<SubjectDTO[]>([]);

  // Sử dụng state từ context
  const { 
    state,
    setCommonField,
    setTextContent
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
        
        // If there's a classId in the URL, preselect it
        const classIdFromUrl = searchParams.get('classId');
        if (classIdFromUrl && transformedClasses.some((c: {id: string}) => c.id === classIdFromUrl)) {
          setClassIds([classIdFromUrl]);
          setCommonField('classIds', [classIdFromUrl]);
        }
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
  }, [user?.userID, searchParams, setCommonField, toast, role]);

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
          title: 'Lỗi',
          description: 'Không thể tải danh sách môn học. Vui lòng thử lại sau.',
        });
      }
    };
    
    fetchSubjects();
  }, [toast]);

  // Memoize các callback xử lý thay đổi field để giảm re-render
  const handleTitleChange = useCallback((value: string) => {
    setCommonField('title', value);
    // Xoá lỗi nếu có
    if (value && titleError) {
      setTitleError(undefined);
    }
  }, [setCommonField, titleError]);

  const handleDescriptionChange = useCallback((value: string) => {
    setCommonField('description', value);
  }, [setCommonField]);

  const handleSubjectChange = useCallback((value: string) => {
    setCommonField('subject', value);
  }, [setCommonField]);

  const handleClassIdsChange = useCallback((value: string[]) => {
    setClassIds(value);
    // Cập nhật classIds trong state
    setCommonField('classIds', value);
  }, [setCommonField]);

  const handleDueDateChange = useCallback((value: string) => {
    setCommonField('dueDate', value);
  }, [setCommonField]);

  const handleMaxPointsChange = useCallback((value: string) => {
    setCommonField('maxPoints', value);
  }, [setCommonField]);

  const handleAllowLateSubmissionsChange = useCallback((checked: boolean) => {
    setCommonField('allowLateSubmissions', checked);
  }, [setCommonField]);

  const handleTimerChange = useCallback((value: string | null) => {
    setCommonField('timer', value);
  }, [setCommonField]);

  const handleAssignmentTypeChange = useCallback((value: 'text' | 'quiz' | 'file' | 'ai-quiz') => {
    setCommonField('assignmentType', value);
  }, [setCommonField]);

  useEffect(() => {
    setMounted(true);

    // Đặt mặc định thời hạn là 1 ngày sau thời điểm hiện tại
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 0);

    const defaultDueDate = tomorrow.toISOString().slice(0, 16);
    setCommonField('dueDate', defaultDueDate);
    setCommonField('description', ''); // Initialize with empty description
  }, [setCommonField]);

  // Cập nhật thời gian còn lại khi thay đổi thời hạn nộp
  useEffect(() => {
    if (!dueDate) return;

    const calculateRemainingTime = () => {
      const now = new Date();
      const due = new Date(dueDate);
      const diffMs = due.getTime() - now.getTime();

      if (diffMs <= 0) {
        setRemainingTime('Đã hết hạn');
        return;
      }

      // Tính toán ngày, giờ, phút
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      
      let result = '';
      if (diffDays > 0) result += `${diffDays} ngày `;
      if (diffHours > 0) result += `${diffHours} giờ `;
      result += `${diffMinutes} phút`;
      
      setRemainingTime(`Còn lại ${result} trước khi hết hạn nộp bài`);
    };

    calculateRemainingTime();
    const interval = setInterval(calculateRemainingTime, 60000); // Cập nhật mỗi phút

    return () => clearInterval(interval);
  }, [dueDate]);

  // Memoize và tối ưu hoá validateForm
  const validateForm = useCallback(() => {
    const errors: Record<string, string> = {};
    let isValid = true;

    // Validate các trường bắt buộc
    if (!title) {
      errors.title = 'Vui lòng nhập tiêu đề bài tập';
      setTitleError('Vui lòng nhập tiêu đề bài tập');
      isValid = false;
    }

    // Description field is optional, no validation needed

    if (!subject) {
      errors.subject = 'Vui lòng chọn môn học';
      isValid = false;
    }

    if (classIds.length === 0) {
      errors.classIds = 'Vui lòng chọn ít nhất một lớp học';
      isValid = false;
    }

    if (!dueDate) {
      errors.dueDate = 'Vui lòng chọn hạn nộp bài';
      isValid = false;
    }

    // Kiểm tra nội dung bài tập
    if (assignmentType === 'text' && !textContent) {
      errors.textContent = 'Vui lòng nhập nội dung bài tập';
      isValid = false;
    }

    if (assignmentType === 'quiz') {
      const { quizQuestions } = state;
      const invalidQuestions = quizQuestions.filter(q =>
        !q.question || q.options.some(opt => !opt)
      );
      
      if (invalidQuestions.length > 0) {
        errors.quizQuestions = 'Vui lòng điền đầy đủ câu hỏi và các phương án trả lời';
        isValid = false;
      }
    }

    // Cập nhật state lỗi
    setFormErrors(errors);

    if (!isValid) {
      toast({
        variant: 'destructive',
        title: 'Thiếu thông tin',
        description: 'Vui lòng điền đầy đủ các trường bắt buộc.',
      });
    }

    return isValid;
  }, [state, title, subject, classIds, dueDate, assignmentType, textContent, toast]);

  // Xử lý submit form 
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Get the current user ID from auth context
      const userId = user?.userID;
      
      if (!userId) {
        throw new Error('User ID not found');
      }

      const { title, subject, description, dueDate, maxPoints, allowLateSubmissions, assignmentType, textContent, quizQuestions, timer } = state;
      
      // Prepare the request data
      const assignmentData = {
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
      
      // Call the API to create the assignment
      const response = await addAssignment(assignmentData);

      // If quiz, create quiz questions
      if (assignmentType === 'quiz' && response.data) {
        const assignmentId = response.data.assignmentId;
        
        // Process all quiz questions, both manual and AI-generated
        const questionsPromises = quizQuestions.map(async (question) => {
          try {
            // Create the question with options embedded in the API call
            const questionData = {
              assignmentId,
              question: question.question,
              options: question.options,
              correctOptions: question.correctOptions,
              points: question.points,
              explanation: question.explanation || 'Chưa có giải thích cho câu hỏi này.'
            };
            
            return await createQuizQuestion(questionData);
          } catch (error) {
            console.error('Error creating quiz question:', error);
            // Continue with other questions
            return null;
          }
        });
        
        await Promise.all(questionsPromises);
      }

      toast({
        title: 'Tạo bài tập thành công',
        description: 'Bài tập đã được tạo và gửi cho học sinh.',
      });

      // Chuyển hướng về trang danh sách bài tập
      router.push('/assignments');
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Không thể tạo bài tập. Vui lòng thử lại.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [validateForm, router, toast, user, state, classIds]);

  // Memoize onContentChange callback
  const handleTextContentChange = useCallback((content: string) => {
    setTextContent(content);
  }, [setTextContent]);

  return (
    <div className="container mx-auto py-6">
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle>Tạo bài tập mới</CardTitle>
          <CardDescription>
            Tạo bài tập và gửi cho học sinh trong lớp
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
                defaultValue="text" 
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
                      {/* AI Quiz Generator */}
                      <AIQuizTab />
                      
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
                onClick={() => router.back()}
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
                    Đang tạo...
                  </>
                ) : 'Tạo bài tập'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 