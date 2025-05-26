'use client';

import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LockIcon, Home, ArrowLeft, BookOpen, FileText, Users } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function ForbiddenPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { role } = useAuth();
  
  // Get information about the attempted access
  const attemptedPath = searchParams.get('from') || '';
  const requiredRole = searchParams.get('requiredRole') || 'Admin';
  const reason = searchParams.get('reason') || 'insufficient_role';
  const resource = searchParams.get('resource') || '';
  const message = searchParams.get('message') || '';
  
  // Determine the main message and description based on reason
  const getContent = () => {
    switch (reason) {
      case 'not_enrolled':
        return {
          title: 'Quyền truy cập bị từ chối',
          description: message || `Bạn không được ghi danh vào ${getResourceName(resource)} này. Vui lòng liên hệ giáo viên để được ghi danh vào lớp học.`,
          icon: getResourceIcon(resource)
        };
      case 'error':
        return {
          title: 'Đã xảy ra lỗi',
          description: message || 'Không thể kiểm tra quyền truy cập. Vui lòng thử lại sau.',
          icon: <LockIcon className="h-20 w-20" />
        };
      default:
        return {
          title: 'Truy cập bị từ chối',
          description: `Bạn không có quyền truy cập vào trang này. Trang này yêu cầu quyền <strong>${requiredRole}</strong>.`,
          icon: <LockIcon className="h-20 w-20" />
        };
    }
  };

  // Get resource name in Vietnamese
  const getResourceName = (resourceType: string) => {
    switch (resourceType) {
      case 'class': return 'lớp học';
      case 'assignment': return 'bài tập';
      case 'material': return 'tài liệu';
      default: return 'tài nguyên';
    }
  };

  // Get appropriate icon for resource type
  const getResourceIcon = (resourceType: string) => {
    switch (resourceType) {
      case 'class': return <Users className="h-20 w-20" />;
      case 'assignment': return <FileText className="h-20 w-20" />;
      case 'material': return <BookOpen className="h-20 w-20" />;
      default: return <LockIcon className="h-20 w-20" />;
    }
  };
  
  // Determine where to go back
  const goBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/dashboard');
    }
  };

  // Get appropriate navigation actions based on reason
  const getNavigationActions = () => {
    if (reason === 'not_enrolled') {
      return (
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="default" onClick={() => router.push('/dashboard')} className="gap-1">
            <Home className="h-4 w-4" />
            Trang chủ
          </Button>
          <Button variant="outline" onClick={() => router.push('/classes')} className="gap-1">
            <Users className="h-4 w-4" />
            Xem danh sách lớp học
          </Button>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button variant="default" onClick={goBack} className="gap-1">
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </Button>
        <Button variant="outline" onClick={() => router.push('/dashboard')} className="gap-1">
          <Home className="h-4 w-4" />
          Trang chủ
        </Button>
      </div>
    );
  };

  // For security, disable browser back to protected page
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (e.state && e.state.url && e.state.url.includes(attemptedPath)) {
        router.push('/dashboard');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [attemptedPath, router]);

  const content = getContent();
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="mx-auto flex w-full max-w-[500px] flex-col items-center px-4 py-10 md:px-6 md:py-16">
        <div className="relative mb-8 h-40 w-40 text-primary">
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-primary/10">
            {content.icon}
          </div>
        </div>
        <h1 className="mb-2 text-center text-3xl font-bold">{content.title}</h1>
        <p 
          className="mb-8 text-center text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: content.description }}
        />
        
        {getNavigationActions()}
        
        {/* Debug info - only in development mode */}
        {process.env.NODE_ENV !== 'production' && (
          <div className="mt-8 w-full rounded-md border bg-muted/50 p-4 text-sm">
            <h3 className="mb-2 font-medium">Debug Info</h3>
            <p><strong>Current Role:</strong> {role || 'Not set'}</p>
            <p><strong>Reason:</strong> {reason}</p>
            <p><strong>Resource:</strong> {resource || 'Unknown'}</p>
            <p><strong>Message:</strong> {message || 'None'}</p>
            <p><strong>Attempted Path:</strong> {attemptedPath || 'Unknown'}</p>
            <p><strong>Required Role:</strong> {requiredRole}</p>
          </div>
        )}
      </div>
    </div>
  );
} 