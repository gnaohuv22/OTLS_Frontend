"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getAssignmentById, getSubmissionById } from '@/lib/api/assignment';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/auth-context';
import { SubmissionGrading } from '@/components/teacher/submissions/submission-grading';

export default function SubmissionGradingPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { role } = useAuth();
  const assignmentId = params.id as string;
  const submissionId = params.submissionId as string;
  
  const [assignment, setAssignment] = useState<any>(null);
  const [submission, setSubmission] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch assignment and submission details
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Check if user is a teacher or admin
        if (role !== 'Teacher' && role !== 'Admin') {
          toast({
            variant: 'destructive',
            title: 'Không có quyền truy cập',
            description: 'Chỉ giáo viên mới có thể chấm điểm bài tập.',
          });
          router.push(`/assignments/${assignmentId}`);
          return;
        }

        // Load assignment details
        const assignmentResponse = await getAssignmentById(assignmentId);
        if (!assignmentResponse.data) {
          toast({
            variant: 'destructive',
            title: 'Lỗi',
            description: 'Không tìm thấy bài tập.',
          });
          router.push('/assignments');
          return;
        }
        setAssignment(assignmentResponse.data);

        // Load submission details
        const submissionResponse = await getSubmissionById(submissionId);
        if (!submissionResponse.data) {
          toast({
            variant: 'destructive',
            title: 'Lỗi',
            description: 'Không tìm thấy bài nộp.',
          });
          router.push(`/assignments/${assignmentId}`);
          return;
        }
        setSubmission(submissionResponse.data);
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          variant: 'destructive',
          title: 'Lỗi',
          description: 'Không thể tải thông tin.',
        });
        router.push(`/assignments/${assignmentId}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [assignmentId, submissionId, router, toast, role]);

  const handleGradingComplete = () => {
    // Redirect back to the submission detail page
    router.push(`/assignments/${assignmentId}/submissions/${submissionId}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <SubmissionGrading
        submissionId={submissionId}
        assignmentId={assignmentId}
        userId={submission?.user?.userID || ""}
        initialGrade={submission?.grade || 0}
        initialFeedback={submission?.feedback || ""}
        maxPoints={assignment?.maxPoints || 100}
        submissionType={assignment?.assignmentType?.toLowerCase() === 'quiz' ? 'quiz' : 'text'}
        onGradingComplete={handleGradingComplete}
      />
    </div>
  );
} 