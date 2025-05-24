'use client';

import { useAuth } from '@/lib/auth-context';
import { ReactNode } from 'react';

interface RoleBasedContentProps {
  teacherContent: ReactNode;
  studentContent: ReactNode;
  parentContent?: ReactNode;
  fallbackContent?: ReactNode;
  adminContent?: ReactNode;
}

export function RoleBasedContent({ 
  teacherContent, 
  studentContent, 
  parentContent,
  fallbackContent,
  adminContent
}: RoleBasedContentProps) {
  const { role } = useAuth();

  if (role === 'Teacher') {
    return <>{teacherContent}</>;
  }

  if (role === 'Student') {
    return <>{studentContent}</>;
  }
  
  if (role === 'Parent' && parentContent) {
    return <>{parentContent}</>;
  }

  if (role === 'Admin' && adminContent) {
    return <>{adminContent}</>;
  }

  // Fallback nếu không có role hoặc role không hợp lệ
  return <>{fallbackContent || null}</>;
} 