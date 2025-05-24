'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/lib/auth-context';
import { LoginForm } from '@/components/form/login-form';
import { AuthLayout } from '@/components/common/layout/auth-layout';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const returnUrl = searchParams.get('returnUrl') || '/dashboard';
  
  // Kiểm tra xem người dùng đã đăng nhập chưa
  useEffect(() => {
    if (isAuthenticated) {
      // Nếu đã đăng nhập, chuyển hướng về trang được yêu cầu hoặc dashboard
      router.push(returnUrl);
    }
  }, [isAuthenticated, router, returnUrl]);

  // Kiểm tra xem có tham số chuyển hướng từ middleware không
  useEffect(() => {
    const authRequired = searchParams.get('authRequired');
    if (authRequired === 'true') {
      toast({
        title: "Yêu cầu đăng nhập",
        description: "Bạn cần đăng nhập để truy cập trang này.",
        variant: "destructive",
        duration: 3000,
      });
    }
  }, [searchParams, toast]);

  // Thêm mới: Kiểm tra nếu người dùng vừa bị đăng xuất do token hết hạn
  useEffect(() => {
    const tokenExpired = searchParams.get('tokenExpired');
    if (tokenExpired === 'true') {
      toast({
        title: "Phiên làm việc đã hết hạn",
        description: "Vui lòng đăng nhập lại để tiếp tục.",
        variant: "destructive",
        duration: 3000,
      });
    }
  }, [searchParams, toast]);

  // Nếu đang kiểm tra trạng thái xác thực, hiển thị trạng thái loading
  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AuthLayout 
      title="Đăng nhập"
      description="Đăng nhập để truy cập vào tài khoản của bạn"
      maxWidth="md"
    >
      <LoginForm />
    </AuthLayout>
  );
} 