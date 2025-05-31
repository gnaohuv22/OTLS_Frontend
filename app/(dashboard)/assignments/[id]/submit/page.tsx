"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth-context";
import { AuthGuard } from "@/components/auth/auth-guard";
import { StudentAuthGuard } from "@/components/auth/student-auth-guard";
import { getAssignmentById, getQuizsByAssignmentId, getSubmissionsByUserId } from "@/lib/api/assignment";
import { QuizSubmission } from "@/components/student/submissions/quiz-submission";
import { TextSubmission } from "@/components/student/submissions/text-submission";
import { Badge } from "@/components/ui/badge";

// Define animations
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

export default function AssignmentSubmitPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const assignmentId = params.id as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [assignment, setAssignment] = useState<any>(null);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [hasSubmission, setHasSubmission] = useState(false);
  
  // Fetch assignment data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Get assignment details
        const response = await getAssignmentById(assignmentId);
        
        if (!response.data) {
          toast({
            variant: 'destructive',
            title: 'Lỗi',
            description: 'Không tìm thấy bài tập',
          });
          router.push('/assignments');
          return;
        }
        
        setAssignment(response.data);
        
        // If quiz type, fetch questions
        if (response.data.assignmentType?.toLowerCase() === "quiz") {
          const quizResponse = await getQuizsByAssignmentId(assignmentId);
          if (quizResponse.data && quizResponse.data.quizQuestions) {
            setQuizQuestions(quizResponse.data.quizQuestions);
          }
        }
        
        // Check if student already has a submission for an EXAM assignment
        // For non-exam assignments (timer === "0" or null), allow retaking
        const isExam = response.data.timer && response.data.timer !== "0";
        
        if (user?.userID && isExam) {
          try {
            // Only check for existing submissions if it's an exam (has timer and timer !== "0")
            const submissionResponse = await getSubmissionsByUserId(user.userID);
            
            if (submissionResponse?.data?.submissions) {
              const existingSubmission = submissionResponse.data.submissions.find(
                (sub: any) => sub.assignmentId === assignmentId
              );
              
              if (existingSubmission) {
                setHasSubmission(true);
              }
            }
          } catch (submissionError) {
            // Log the error but don't redirect - assume no submissions if API fails
            console.error('Error fetching user submissions:', submissionError);
            // Don't set hasSubmission to true or redirect - let user continue
          }
        }
      } catch (error) {
        console.error('Error fetching assignment data:', error);
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
    
    fetchData();
  }, [assignmentId, router, toast, user?.userID]);
  
  // Handle submission completion
  const handleSubmissionComplete = (submissionId: string) => {
    toast({
      title: 'Nộp bài thành công',
      description: 'Bài làm của bạn đã được gửi thành công',
    });
    
    // Redirect back to assignment detail page
    router.push(`/assignments/${assignmentId}`);
  };
  
  // Handle go back
  const handleGoBack = () => {
    router.push(`/assignments/${assignmentId}`);
  };
  
  // Check if assignment is expired
  const isExpired = assignment ? new Date(assignment.dueDate) < new Date() : false;
  
  // Check if assignment is exam mode
  const isExam = assignment?.timer && assignment.timer !== "0";
  
  if (isLoading) {
    return (
      <AuthGuard>
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg">Đang tải thông tin bài tập...</p>
          </div>
        </div>
      </AuthGuard>
    );
  }
  
  // If expired, redirect back
  if (isExpired) {
    router.push(`/assignments/${assignmentId}`);
    return null;
  }
  
  // If student already has a submission and it's an exam, redirect back
  if (hasSubmission && isExam) {
    router.push(`/assignments/${assignmentId}`);
    return null;
  }
  
  if (!assignment) {
    return (
      <AuthGuard>
        <div className="container mx-auto p-4 space-y-6">
          <h1 className="text-2xl font-bold">Không tìm thấy bài tập</h1>
          <p>Bài tập này không tồn tại hoặc đã bị xóa.</p>
          <Button 
            onClick={() => router.push('/assignments')}
            className="border border-gray-300 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Quay lại danh sách bài tập
          </Button>
        </div>
      </AuthGuard>
    );
  }
  
  const assignmentType = assignment.assignmentType?.toLowerCase() === "quiz" ? "quiz" : "text";
  
  return (
    <AuthGuard>
      <StudentAuthGuard
        resourceType="assignment"
        resourceId={assignmentId}
      >
        <motion.div
          className="w-full min-h-screen bg-background"
          initial="hidden"
          animate="show"
          exit="exit"
          variants={fadeInUp}
        >
          {/* Header */}
          <div className="p-4 border-b sticky top-0 bg-background/80 backdrop-blur-sm z-10">
            <div className="container mx-auto flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button className="bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800" size="icon" onClick={handleGoBack}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-xl font-bold truncate">{assignment.title}</h1>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{assignment.subject?.subjectName || "N/A"}</span>
                    {isExam && (
                      <Badge className="bg-red-500 text-white hover:bg-red-600 ml-2">
                        Bài kiểm tra
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Due date info */}
              <div className="text-right text-sm text-muted-foreground hidden sm:block">
                Hạn nộp: {new Date(assignment.dueDate).toLocaleDateString('vi-VN')}
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="container mx-auto p-4">
            {assignmentType === "quiz" ? (
              <QuizSubmission
                assignmentId={assignmentId}
                userId={user?.userID || ""}
                quizQuestions={quizQuestions}
                onSubmissionComplete={handleSubmissionComplete}
                timer={assignment.timer}
                isExam={isExam}
                maxPoints={assignment.maxPoints || 100}
              />
            ) : (
              <TextSubmission
                assignmentId={assignmentId}
                userId={user?.userID || ""}
                assignmentTitle={assignment.title}
                onSubmissionComplete={handleSubmissionComplete}
                timer={assignment.timer}
                isExam={isExam}
                maxPoints={assignment.maxPoints || 100}
              />
            )}
          </div>
        </motion.div>
      </StudentAuthGuard>
    </AuthGuard>
  );
} 