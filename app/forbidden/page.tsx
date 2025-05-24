'use client';

import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LockIcon, Home, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function ForbiddenPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { role } = useAuth();
  
  // Get information about the attempted path
  const attemptedPath = searchParams.get('from') || '';
  const requiredRole = searchParams.get('requiredRole') || 'Admin';
  
  // Determine where to go back
  const goBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/dashboard');
    }
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
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="mx-auto flex w-full max-w-[500px] flex-col items-center px-4 py-10 md:px-6 md:py-16">
        <div className="relative mb-8 h-40 w-40 text-primary">
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-primary/10">
            <LockIcon className="h-20 w-20" />
          </div>
        </div>
        <h1 className="mb-2 text-center text-3xl font-bold">Truy cập bị từ chối</h1>
        <p className="mb-8 text-center text-muted-foreground">
          Bạn không có quyền truy cập vào trang này. Trang này yêu cầu quyền <strong>{requiredRole}</strong>.
        </p>
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
        
        {/* Debug info - only in development mode */}
        {process.env.NODE_ENV !== 'production' && (
          <div className="mt-8 w-full rounded-md border bg-muted/50 p-4 text-sm">
            <h3 className="mb-2 font-medium">Debug Info</h3>
            <p><strong>Current Role:</strong> {role || 'Not set'}</p>
            <p><strong>Attempted Path:</strong> {attemptedPath || 'Unknown'}</p>
            <p><strong>Required Role:</strong> {requiredRole}</p>
          </div>
        )}
      </div>
    </div>
  );
} 