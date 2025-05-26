import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { StudentAuthorization } from '@/lib/auth/student-authorization';
import { useToast } from '@/components/ui/use-toast';

interface UseStudentAuthorizationProps {
  resourceType: 'class' | 'assignment' | 'material';
  resourceId: string;
  classId?: string;
  enabled?: boolean;
}

interface UseStudentAuthorizationReturn {
  isAuthorized: boolean | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook to check if a student is authorized to access a specific resource
 * Automatically redirects to forbidden page if unauthorized
 */
export function useStudentAuthorization({
  resourceType,
  resourceId,
  classId,
  enabled = true
}: UseStudentAuthorizationProps): UseStudentAuthorizationReturn {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { role, user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuthorization = async () => {
      // Skip authorization check if disabled or not a student
      if (!enabled || role !== 'Student' || !user?.userID) {
        setIsAuthorized(true);
        setIsLoading(false);
        return;
      }

      // Skip if no resource ID provided
      if (!resourceId) {
        setIsAuthorized(false);
        setIsLoading(false);
        setError('No resource ID provided');
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const result = await StudentAuthorization.validateStudentAccess(
          user.userID,
          resourceType,
          resourceId,
          classId
        );

        setIsAuthorized(result.authorized);

        if (!result.authorized && result.redirectUrl) {
          // Show toast message before redirecting
          toast({
            title: 'Quyền truy cập bị từ chối',
            description: getUnauthorizedMessage(resourceType),
            variant: 'destructive',
          });

          // Redirect after a short delay to allow toast to show
          setTimeout(() => {
            router.push(result.redirectUrl!);
          }, 1000);
        }
      } catch (err) {
        console.error('Error checking student authorization:', err);
        setError('Lỗi khi kiểm tra quyền truy cập');
        setIsAuthorized(false);
        
        toast({
          title: 'Lỗi',
          description: 'Không thể kiểm tra quyền truy cập. Vui lòng thử lại.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthorization();
  }, [enabled, role, user?.userID, resourceType, resourceId, classId, router, toast]);

  return {
    isAuthorized,
    isLoading,
    error
  };
}

/**
 * Get appropriate unauthorized message based on resource type
 */
function getUnauthorizedMessage(resourceType: 'class' | 'assignment' | 'material'): string {
  switch (resourceType) {
    case 'class':
      return 'Bạn không được ghi danh vào lớp học này.';
    case 'assignment':
      return 'Bạn không có quyền truy cập bài tập này.';
    case 'material':
      return 'Bạn không có quyền truy cập tài liệu này.';
    default:
      return 'Bạn không có quyền truy cập tài nguyên này.';
  }
}

/**
 * Hook to get all class IDs that a student is enrolled in
 */
export function useStudentEnrolledClasses() {
  const [enrolledClassIds, setEnrolledClassIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { role, user } = useAuth();

  useEffect(() => {
    const fetchEnrolledClasses = async () => {
      if (role !== 'Student' || !user?.userID) {
        setEnrolledClassIds([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const classIds = await StudentAuthorization.getStudentEnrolledClassIds(user.userID);
        setEnrolledClassIds(classIds);
      } catch (err) {
        console.error('Error fetching enrolled classes:', err);
        setError('Lỗi khi lấy danh sách lớp học');
        setEnrolledClassIds([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEnrolledClasses();
  }, [role, user?.userID]);

  return {
    enrolledClassIds,
    isLoading,
    error
  };
} 