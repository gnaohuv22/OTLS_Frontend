import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { StudentAuthorization } from '@/lib/auth/student-authorization';

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
 * Note: This hook does not handle redirects - use StudentAuthGuard component for automatic redirects
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
      } catch (err) {
        console.error('Error checking student authorization:', err);
        setError('Lỗi khi kiểm tra quyền truy cập');
        setIsAuthorized(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthorization();
  }, [enabled, role, user?.userID, resourceType, resourceId, classId]);

  return {
    isAuthorized,
    isLoading,
    error
  };
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