"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getAssignmentById } from '@/lib/api/assignment';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/auth-context';
import { SubmissionDetail } from '@/components/shared/submissions/submission-detail';

export default function SubmissionDetailPage() {
  const params = useParams();
  const { toast } = useToast();
  const { role } = useAuth();
  const assignmentId = params.id as string;
  const submissionId = params.submissionId as string;
  
  const [assignment, setAssignment] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch assignment details
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Load assignment details
        const assignmentResponse = await getAssignmentById(assignmentId);
        
        if (!assignmentResponse.data) {
          toast({
            variant: 'destructive',
            title: 'Lỗi',
            description: 'Không tìm thấy bài tập.',
          });
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
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [assignmentId, toast]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <SubmissionDetail
        submissionId={submissionId}
        assignmentId={assignmentId}
        assignmentTitle={assignment?.title || "Bài tập"}
        allowEdit={role === 'Teacher' || role === 'Admin'}
      />
    </div>
  );
} 