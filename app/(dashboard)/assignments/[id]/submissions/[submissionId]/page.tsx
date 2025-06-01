"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getAssignmentById, getSubmissionById } from '@/lib/api/assignment';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/auth-context';
import { AuthGuard } from '@/components/auth/auth-guard';
import { StudentAuthGuard } from '@/components/auth/student-auth-guard';
import { SubmissionDetail } from '@/components/shared/submissions/submission-detail';

export default function SubmissionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { role, user } = useAuth();
  const assignmentId = params.id as string;
  const submissionId = params.submissionId as string;
  
  const [assignment, setAssignment] = useState<any>(null);
  const [submission, setSubmission] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  // Check if student can access this submission
  const checkSubmissionAccess = useCallback(async () => {
    if (role === 'Teacher' || role === 'Admin') {
      setHasAccess(true);
      return true;
    }

    if (role === 'Student' && user?.userID) {
      try {
        // Fetch submission details to check ownership
        const submissionResponse = await getSubmissionById(submissionId);
        
        if (submissionResponse.data && submissionResponse.data.user?.userID === user.userID) {
          setHasAccess(true);
          setSubmission(submissionResponse.data);
          return true;
        } else {
          // Student trying to access someone else's submission
          toast({
            variant: 'destructive',
            title: 'Không có quyền truy cập',
            description: 'Bạn chỉ có thể xem bài nộp của chính mình.',
          });
          router.push(`/assignments/${assignmentId}`);
          return false;
        }
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Lỗi',
          description: 'Không thể kiểm tra quyền truy cập bài nộp.',
        });
        router.push(`/assignments/${assignmentId}`);
        return false;
      }
    }

    setHasAccess(false);
    return false;
  }, [role, user?.userID, submissionId, toast, router, assignmentId]);

  // Fetch assignment details
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Check submission access first
        const hasSubmissionAccess = await checkSubmissionAccess();
        if (!hasSubmissionAccess) {
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
      } catch (error) {
        console.error('Error loading assignment:', error);
        toast({
          variant: 'destructive',
          title: 'Lỗi',
          description: 'Không thể tải thông tin bài tập.',
        });
        router.push('/assignments');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [assignmentId, checkSubmissionAccess, toast, router]);

  if (isLoading) {
    return (
      <AuthGuard>
        <div className="container mx-auto py-6 flex justify-center items-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
        </div>
      </AuthGuard>
    );
  }

  if (!hasAccess || !assignment) {
    return (
      <AuthGuard>
        <div className="container mx-auto py-6 flex justify-center items-center min-h-[60vh]">
          <p className="text-destructive font-medium border border-destructive/30 bg-destructive/10 px-4 py-2 rounded-md">
            Không có quyền truy cập hoặc không tìm thấy bài tập.
          </p>
        </div>
      </AuthGuard>
    );
  }

  // For students, wrap with StudentAuthGuard to check class enrollment
  if (role === 'Student') {
    return (
      <AuthGuard>
        <StudentAuthGuard
          resourceType="assignment"
          resourceId={assignmentId}
        >
          <div className="container mx-auto py-6 space-y-6 text-foreground">
            <SubmissionDetail
              submissionId={submissionId}
              assignmentId={assignmentId}
              assignmentTitle={assignment?.title || "Bài tập"}
              allowEdit={false}
            />
          </div>
        </StudentAuthGuard>
      </AuthGuard>
    );
  }

  // For teachers/admins, no need for StudentAuthGuard
  return (
    <AuthGuard>
      <div className="container mx-auto py-6 space-y-6 text-foreground">
        <SubmissionDetail
          submissionId={submissionId}
          assignmentId={assignmentId}
          assignmentTitle={assignment?.title || "Bài tập"}
          allowEdit={role === 'Teacher' || role === 'Admin'}
        />
      </div>
    </AuthGuard>
  );
} 