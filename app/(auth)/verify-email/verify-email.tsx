'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, Loader2, Mail, RefreshCw, ExternalLink } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from "@/components/ui/use-toast"
import { 
  checkEmailVerification, 
  getCurrentUser, 
  resendEmailVerification,
  onEmailVerificationChange,
  signOutUser
} from '@/lib/api/firebase-auth';
import { UserService } from '@/lib/api/user';

export function VerifyEmail() {
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingVerification, setCheckingVerification] = useState(true);
  const [email, setEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const [isResending, setIsResending] = useState(false);

  // Hàm kiểm tra xác thực email từ Firebase
  const checkVerificationStatus = useCallback(async () => {
    try {
      console.log('[Debug] Đang kiểm tra trạng thái xác thực email...');
      
      const user = await getCurrentUser();
      if (!user) {
        console.log('[Debug] Không có user Firebase');
        return false;
      }

      // Refresh user để lấy trạng thái mới nhất
      await user.reload();
      const isEmailVerified = user.emailVerified;
      
      console.log('[Debug] Trạng thái xác thực email:', isEmailVerified);
      
      if (isEmailVerified && userId) {
        // Cập nhật trạng thái người dùng thành Active trong backend
        console.log('[Debug] Email đã được xác thực, đang cập nhật trạng thái user...');
        
        try {
          const statusUpdateResult = await UserService.changeStatusUser({
            userId: userId,
            statusUser: 'Active'
          });
          
          if (statusUpdateResult) {
            console.log('[Debug] Cập nhật trạng thái người dùng thành công');
          } else {
            console.warn('[Debug] Cập nhật trạng thái người dùng thất bại');
          }
        } catch (error) {
          console.error('[Debug] Lỗi khi cập nhật trạng thái:', error);
        }
        
        setIsVerified(true);
        
        // Xóa thông tin từ localStorage
        localStorage.removeItem('registerEmail');
        localStorage.removeItem('registerUsername');
        localStorage.removeItem('registerUserId');
        
        // Đăng xuất khỏi Firebase Auth (vì chúng ta chỉ dùng Firebase để verify email)
        await signOutUser();
        
        toast({
          title: "Xác thực thành công!",
          description: "Email của bạn đã được xác thực thành công.",
        });
        
        // Chuyển hướng về trang đăng nhập sau 3 giây
        setTimeout(() => {
          router.push('/login');
        }, 3000);
        
        return true;
      }
      
      return isEmailVerified;
    } catch (error) {
      console.error('[Debug] Lỗi khi kiểm tra xác thực:', error);
      return false;
    }
  }, [userId, router]);

  // Hàm gửi lại email xác thực
  const handleResendEmail = async () => {
    try {
      setIsResending(true);
      
      const result = await resendEmailVerification();
      
      if (result.success) {
        toast({
          title: "Email đã được gửi lại!",
          description: "Vui lòng kiểm tra hộp thư để lấy email xác thực mới.",
        });
        
        // Thiết lập bộ đếm thời gian
        setRemainingTime(60);
        const timer = setInterval(() => {
          setRemainingTime((time) => {
            if (time <= 1) {
              clearInterval(timer);
              return 0;
            }
            return time - 1;
          });
        }, 1000);
        
      } else {
        toast({
          title: "Lỗi",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('[Debug] Lỗi khi gửi lại email:', error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi gửi email. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  // Hàm kiểm tra thông tin user và thiết lập dữ liệu
  const initializeUserData = useCallback(async () => {
    if (typeof window !== 'undefined') {
      const savedEmail = localStorage.getItem('registerEmail');
      const savedUsername = localStorage.getItem('registerUsername');
      const savedUserId = localStorage.getItem('registerUserId');
      
      console.log('[Debug] Đọc thông tin từ localStorage:', { 
        email: savedEmail, 
        userName: savedUsername,
        userId: savedUserId
      });
      
      if (savedEmail && savedUsername) {
        setEmail(savedEmail);
        setUserName(savedUsername);
        setUserId(savedUserId);
        
        // Kiểm tra trạng thái xác thực ban đầu
        await checkVerificationStatus();
      } else {
        // Nếu không có thông tin trong localStorage, chuyển về trang đăng ký
        console.log('[Debug] Không có thông tin trong localStorage, chuyển về trang đăng ký');
        router.push('/register');
      }
    }
    setCheckingVerification(false);
  }, [checkVerificationStatus, router]);

  // Khởi tạo dữ liệu khi component mount
  useEffect(() => {
    initializeUserData();
  }, [initializeUserData]);

  // Lắng nghe thay đổi trạng thái xác thực email
  useEffect(() => {
    if (!checkingVerification && !isVerified) {
      console.log('[Debug] Bắt đầu lắng nghe thay đổi trạng thái xác thực...');
      
      const unsubscribe = onEmailVerificationChange(async (emailVerified, user) => {
        console.log('[Debug] Trạng thái xác thực thay đổi:', emailVerified);
        
        if (emailVerified && user) {
          await checkVerificationStatus();
        }
      });
      
      // Kiểm tra định kỳ mỗi 10 giây
      const interval = setInterval(async () => {
        if (!isVerified) {
          console.log('[Debug] Kiểm tra định kỳ trạng thái xác thực...');
          await checkVerificationStatus();
        }
      }, 10000);
      
      return () => {
        unsubscribe();
        clearInterval(interval);
      };
    }
  }, [checkingVerification, isVerified, checkVerificationStatus]);

  if (checkingVerification) {
    return (
      <div className="container flex h-screen w-screen flex-col items-center justify-center">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
          <Card className="shadow-lg">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <p className="text-sm text-muted-foreground">Đang kiểm tra thông tin xác thực...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
        <div className="flex flex-col space-y-2 text-center mb-4">
          <h1 className="text-2xl font-semibold tracking-tight">
            OTLS - Xác thực email
          </h1>
          <p className="text-sm text-muted-foreground">
            Xác thực email để hoàn tất việc đăng ký tài khoản
          </p>
        </div>
        
        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              {isVerified 
                ? "Xác thực thành công!" 
                : "Kiểm tra email của bạn"}
            </CardTitle>
            <CardDescription className="text-center">
              {isVerified 
                ? "Email đã được xác thực thành công!"
                : `Chúng tôi đã gửi email xác thực đến ${email}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isVerified ? (
              <div className="space-y-4 text-center">
                <div className="flex items-center justify-center">
                  <div className="rounded-full bg-green-100 p-3">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <Alert className="bg-green-50 border-green-200">
                  <AlertDescription>
                    Xác thực email thành công! 
                    Bạn sẽ được chuyển hướng về trang đăng nhập sau 3 giây.
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center">
                    <div className="rounded-full bg-blue-100 p-3">
                      <Mail className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      Vui lòng kiểm tra email <strong>{email}</strong> và nhấp vào liên kết xác thực.
                    </p>
                    <p className="text-xs text-gray-500">
                      Nếu bạn không thấy email, hãy kiểm tra thư mục spam hoặc gửi lại email xác thực.
                    </p>
                  </div>
                  
                  <Alert className="bg-blue-50 border-blue-200">
                    <Mail className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Hướng dẫn:</strong>
                      <br />1. Mở email từ OTLS
                      <br />2. Nhấp vào liên kết "Xác thực email"
                      <br />3. Quay lại trang này để hoàn tất
                    </AlertDescription>
                  </Alert>
                </div>

                <div className="flex flex-col space-y-3">
                  <Button
                    onClick={handleResendEmail}
                    disabled={isResending || remainingTime > 0}
                    variant="outline"
                    className="w-full"
                  >
                    {isResending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang gửi...
                      </>
                    ) : remainingTime > 0 ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Gửi lại sau {remainingTime}s
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Gửi lại email xác thực
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={checkVerificationStatus}
                    disabled={loading}
                    variant="default"
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang kiểm tra...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Tôi đã xác thực email
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={() => router.push('/register')}
                    variant="ghost"
                    className="w-full text-sm"
                  >
                    Quay lại đăng ký
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            {!isVerified && (
              <p className="text-xs text-center text-gray-500 w-full">
                OTLS sử dụng xác thực email để bảo vệ tài khoản của bạn. 
                Email xác thực sẽ được gửi đến địa chỉ email đã đăng ký.
              </p>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 