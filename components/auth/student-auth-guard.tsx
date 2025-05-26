'use client';

import React from 'react';
import { useStudentAuthorization } from '@/hooks/auth/use-student-authorization';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface StudentAuthGuardProps {
  children: React.ReactNode;
  resourceType: 'class' | 'assignment' | 'material';
  resourceId: string;
  classId?: string;
  enabled?: boolean;
  loadingComponent?: React.ReactNode;
}

/**
 * Component that guards access to resources based on student enrollment
 * Only shows content if student is authorized to access the resource
 * Redirects to /forbidden page if unauthorized
 */
export function StudentAuthGuard({
  children,
  resourceType,
  resourceId,
  classId,
  enabled = true,
  loadingComponent
}: StudentAuthGuardProps) {
  const { isAuthorized, isLoading, error } = useStudentAuthorization({
    resourceType,
    resourceId,
    classId,
    enabled
  });

  // Show loading state
  if (isLoading) {
    return loadingComponent || <DefaultLoadingComponent />;
  }

  // Show error state - redirect to forbidden page with error reason
  if (error) {
    if (typeof window !== 'undefined') {
      window.location.href = `/forbidden?reason=error&resource=${resourceType}&message=${encodeURIComponent(error)}`;
    }
    return <DefaultLoadingComponent />;
  }

  // Unauthorized - redirect to forbidden page
  if (isAuthorized === false) {
    if (typeof window !== 'undefined') {
      const reasonMessage = getUnauthorizedMessage(resourceType);
      window.location.href = `/forbidden?reason=not_enrolled&resource=${resourceType}&message=${encodeURIComponent(reasonMessage)}`;
    }
    return <DefaultLoadingComponent />;
  }

  // Show content if authorized
  return <>{children}</>;
}

/**
 * Default loading component
 */
function DefaultLoadingComponent() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center p-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-sm text-muted-foreground">Đang kiểm tra quyền truy cập...</p>
        </CardContent>
      </Card>
    </div>
  );
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