"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getAssignmentById } from '@/lib/api/assignment';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { SubmissionList } from '@/components/teacher/submissions/submission-list';

export default function SubmissionsListPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { role } = useAuth();
  const assignmentId = params.id as string;
  
  const [assignment, setAssignment] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch assignment details
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Check if user is a teacher or admin
        if (role !== 'Teacher' && role !== 'Admin') {
          toast({
            variant: 'destructive',
            title: 'Không có quyền truy cập',
            description: 'Chỉ giáo viên mới có thể xem danh sách bài nộp.',
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
  }, [assignmentId, router, toast, role]);

  const handleBack = () => {
    router.push(`/assignments/${assignmentId}`);
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
      <div className="flex justify-start">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
      </div>
      
      <SubmissionList
        assignmentId={assignmentId}
        assignmentTitle={assignment?.title || "Bài tập"}
        assignmentType={assignment?.assignmentType || "text"}
      />
    </div>
  );
} 