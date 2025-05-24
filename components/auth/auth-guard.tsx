'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import React from 'react';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: ('Teacher' | 'Student' | 'Parent' | 'Admin')[];
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const { isAuthenticated, role } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);
  const { toast } = useToast();
  const [redirected, setRedirected] = useState(false);

  useEffect(() => {
    // Kiểm tra xác thực
    if (isAuthenticated === false) { // Chỉ chuyển hướng khi xác nhận là chưa đăng nhập
      if (!redirected) {
        toast({
          title: "Yêu cầu đăng nhập",
          description: "Bạn cần đăng nhập để truy cập trang này.",
          variant: "destructive",
          duration: 3000,
        });
        setRedirected(true);
      }
      router.push(`/login?returnUrl=${encodeURIComponent(pathname)}`);
      return;
    }

    // Kiểm tra role nếu được quy định
    if (allowedRoles && role && !allowedRoles.includes(role)) {
      toast({
        title: "Không có quyền truy cập",
        description: "Bạn không có quyền truy cập trang này.",
        variant: "destructive",
        duration: 3000,
      });
      router.push('/dashboard');
      return;
    }

    setAuthorized(true);
  }, [isAuthenticated, role, router, pathname, allowedRoles, toast, redirected]);

  // Hiển thị trạng thái loading khi đang kiểm tra xác thực
  if (!authorized) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
} 