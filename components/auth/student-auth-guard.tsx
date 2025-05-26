'use client';

import React from 'react';
import { useStudentAuthorization } from '@/hooks/auth/use-student-authorization';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface StudentAuthGuardProps {
  children: React.ReactNode;
  resourceType: 'class' | 'assignment' | 'material';
  resourceId: string;
  classId?: string;
  enabled?: boolean;
  loadingComponent?: React.ReactNode;
  unauthorizedComponent?: React.ReactNode;
}

/**
 * Component that guards access to resources based on student enrollment
 * Only shows content if student is authorized to access the resource
 */
export function StudentAuthGuard({
  children,
  resourceType,
  resourceId,
  classId,
  enabled = true,
  loadingComponent,
  unauthorizedComponent
}: StudentAuthGuardProps) {
  const { isAuthorized, isLoading, error } = useStudentAuthorization({
    resourceType,
    resourceId,
    classId,
    enabled
  });

  const router = useRouter();

  // Show loading state
  if (isLoading) {
    return loadingComponent || <DefaultLoadingComponent />;
  }

  // Show error state
  if (error) {
    return <ErrorComponent error={error} />;
  }

  // Show unauthorized state
  if (isAuthorized === false) {
    return unauthorizedComponent || <DefaultUnauthorizedComponent resourceType={resourceType} />;
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
 * Default unauthorized component
 */
function DefaultUnauthorizedComponent({ resourceType }: { resourceType: string }) {
  const router = useRouter();

  const getResourceName = (type: string) => {
    switch (type) {
      case 'class': return 'lớp học';
      case 'assignment': return 'bài tập';
      case 'material': return 'tài liệu';
      default: return 'tài nguyên';
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <Lock className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-xl">Quyền truy cập bị từ chối</CardTitle>
          <CardDescription>
            Bạn không có quyền truy cập {getResourceName(resourceType)} này. 
            Vui lòng liên hệ giáo viên để được ghi danh vào lớp học.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Button 
            onClick={() => router.push('/dashboard')}
            className="w-full"
          >
            Quay về Dashboard
          </Button>
          <Button 
            variant="outline"
            onClick={() => router.push('/classes')}
            className="w-full"
          >
            Xem danh sách lớp học
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Error component
 */
function ErrorComponent({ error }: { error: string }) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-xl text-destructive">Đã xảy ra lỗi</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => window.location.reload()}
            className="w-full"
          >
            Thử lại
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 