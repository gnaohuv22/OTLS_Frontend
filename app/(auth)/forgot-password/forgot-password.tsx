'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Mail, Loader2, KeyRound } from 'lucide-react';
import Link from 'next/link';
import { toast } from "@/components/ui/use-toast";
import { UserService } from '@/lib/api/user';
import { sendCustomOTPEmail, verifyCustomOTP, resendCustomOTP } from '@/lib/api/firebase-auth';

export function ForgotPassword() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'otp' | 'success'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [userInfo, setUserInfo] = useState<any>(null);

  // Xử lý gửi email
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập email",
        variant: "destructive",
      });
      return;
    }

    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      toast({
        title: "Lỗi",
        description: "Email không hợp lệ",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      console.log('[ForgotPassword] Đang kiểm tra email tồn tại...');
      
      // Bước 1: Kiểm tra email có tồn tại không
      const userData = await UserService.getUserByEmail(email);
      console.log('[ForgotPassword] Tìm thấy người dùng:', userData);
      
      setUserInfo(userData);
      
      // Bước 2: Gửi OTP email
      console.log('[ForgotPassword] Đang gửi OTP email...');
      const otpResult = await sendCustomOTPEmail(email);
      
      if (otpResult.success) {
        toast({
          title: "Email đã được gửi!",
          description: otpResult.message,
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
        
        setStep('otp');
      } else {
        toast({
          title: "Lỗi gửi email",
          description: otpResult.message,
          variant: "destructive",
        });
      }
      
    } catch (error: any) {
      console.error('[ForgotPassword] Lỗi:', error);
      toast({
        title: "Lỗi",
        description: error.message || "Email không tồn tại trong hệ thống",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Xử lý xác thực OTP
  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập mã OTP",
        variant: "destructive",
      });
      return;
    }

    if (otp.length !== 6) {
      toast({
        title: "Lỗi",
        description: "Mã OTP phải có 6 số",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      console.log('[ForgotPassword] Đang xác thực OTP...');
      const verifyResult = await verifyCustomOTP(email, otp);
      
      if (verifyResult.success) {
        toast({
          title: "Xác thực thành công!",
          description: "Mã OTP chính xác. Đang chuyển hướng...",
        });
        
        // Lưu thông tin để sử dụng ở trang reset password
        localStorage.setItem('resetPasswordEmail', email);
        localStorage.setItem('resetPasswordUserId', userInfo?.userID || '');
        
        setStep('success');
        
        // Chuyển hướng đến trang đặt lại mật khẩu sau 2 giây
        setTimeout(() => {
          router.push('/reset-password');
        }, 2000);
        
      } else {
        toast({
          title: "Lỗi xác thực",
          description: verifyResult.message,
          variant: "destructive",
        });
      }
      
    } catch (error: any) {
      console.error('[ForgotPassword] Lỗi xác thực OTP:', error);
      toast({
        title: "Lỗi",
        description: error.message || "Có lỗi xảy ra khi xác thực OTP",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Xử lý gửi lại OTP
  const handleResendOTP = async () => {
    try {
      setLoading(true);
      
      const resendResult = await resendCustomOTP(email);
      
      if (resendResult.success) {
        toast({
          title: "Email đã được gửi lại!",
          description: resendResult.message,
        });
        
        // Thiết lập lại bộ đếm thời gian
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
          description: resendResult.message,
          variant: "destructive",
        });
      }
      
    } catch (error: any) {
      console.error('[ForgotPassword] Lỗi gửi lại OTP:', error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi gửi lại OTP",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Link
        href="/login"
        className="absolute left-4 top-4 flex items-center text-sm text-muted-foreground hover:text-primary md:left-8 md:top-8"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Quay lại đăng nhập
      </Link>

      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
        <div className="flex flex-col space-y-2 text-center mb-4">
          <h1 className="text-2xl font-semibold tracking-tight">
            OTLS - Quên mật khẩu
          </h1>
          <p className="text-sm text-muted-foreground">
            {step === 'email' && 'Nhập email để lấy lại mật khẩu'}
            {step === 'otp' && 'Nhập mã OTP đã được gửi đến email'}
            {step === 'success' && 'Xác thực thành công!'}
          </p>
        </div>
        
        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              {step === 'email' && 'Xác thực email'}
              {step === 'otp' && 'Nhập mã OTP'}
              {step === 'success' && 'Hoàn tất!'}
            </CardTitle>
            <CardDescription className="text-center">
              {step === 'email' && 'Nhập email tài khoản của bạn để nhận mã xác thực'}
              {step === 'otp' && `Mã OTP đã được gửi đến ${email}`}
              {step === 'success' && 'Đang chuyển hướng đến trang đặt lại mật khẩu...'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 'email' && (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || !email}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Gửi mã xác thực
                    </>
                  )}
                </Button>
              </form>
            )}

            {step === 'otp' && (
              <form onSubmit={handleOTPSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">Mã OTP</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Nhập mã OTP 6 số"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                      disabled={loading}
                      className="pl-10 text-center text-xl tracking-widest font-medium"
                      maxLength={6}
                    />
                  </div>
                  <p className="text-sm text-center text-gray-500">
                    Mã OTP đã được gửi đến email của bạn
                  </p>
                </div>
                
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || otp.length !== 6}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang xác thực...
                    </>
                  ) : (
                    <>
                      <KeyRound className="mr-2 h-4 w-4" />
                      Xác nhận OTP
                    </>
                  )}
                </Button>
                
                <div className="flex justify-between items-center">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setStep('email')}
                    disabled={loading}
                    className="text-sm"
                  >
                    Thay đổi email
                  </Button>
                  
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleResendOTP}
                    disabled={loading || remainingTime > 0}
                    className="text-sm"
                  >
                    {remainingTime > 0 
                      ? `Gửi lại (${remainingTime}s)` 
                      : "Gửi lại mã OTP"}
                  </Button>
                </div>
              </form>
            )}

            {step === 'success' && (
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center">
                  <div className="rounded-full bg-green-100 p-3">
                    <KeyRound className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <Alert className="bg-green-50 border-green-200">
                  <AlertDescription>
                    Xác thực thành công! Bạn sẽ được chuyển hướng đến trang đặt lại mật khẩu.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </CardContent>
        </Card>
        
        <p className="text-center text-sm text-gray-600">
          Nhớ mật khẩu?{' '}
          <Link href="/login" className="text-blue-600 hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
} 