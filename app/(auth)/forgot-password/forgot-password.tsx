'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ForgotPasswordForm } from '../../../components/auth/forgot-password-form';
import { OTPVerificationForm } from '../../../components/auth/otp/otp-verification-form';
import { SuccessMessage } from '../../../components/auth/success-message';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useOTPVerification } from '@/hooks/auth/use-otp-verification';
import { toast } from "@/components/ui/use-toast";

export function ForgotPassword() {
  const router = useRouter();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [step, setStep] = useState<'verify' | 'otp'>('verify');
  const [userData, setUserData] = useState({ username: '', parentPhone: '' });
  const [formLoading, setFormLoading] = useState(false);

  // Sử dụng hook useOTPVerification
  const {
    isLoading: otpLoading,
    canResend,
    remainingTime,
    sendOTP,
    verifyOTP
  } = useOTPVerification({
    onVerificationSuccess: () => {
      setIsSubmitted(true);
      
      // Chuyển hướng về trang đăng nhập sau 3 giây
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    },
    onVerificationError: (error) => {
      // Xử lý lỗi nếu cần
      console.error("Lỗi xác thực:", error);
    }
  });

  // Xử lý form quên mật khẩu
  const handleFormSubmit = async (username: string, parentPhone: string) => {
    try {
      setFormLoading(true);
      
      // Kiểm tra username tồn tại không (giả lập API call)
      // TODO: Thay thế bằng API call thực tế để kiểm tra username và số điện thoại
      const checkUserResponse = await checkUserExists(username, parentPhone);
      
      if (!checkUserResponse.success) {
        toast({
          title: "Lỗi",
          description: checkUserResponse.message || "Tên đăng nhập hoặc số điện thoại không chính xác",
          variant: "destructive",
        });
        return;
      }
      
      // Lưu thông tin người dùng
      setUserData({ username, parentPhone });
      
      // Gửi OTP
      const success = await sendOTP(parentPhone);
      if (success) {
        setStep('otp');
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Lỗi",
        description: error.message || "Đã xảy ra lỗi, vui lòng thử lại sau",
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  };

  // Hàm giả lập kiểm tra người dùng tồn tại
  // TODO: Thay thế bằng API call thực tế
  const checkUserExists = async (username: string, phone: string): Promise<{success: boolean, message?: string}> => {
    // Giả lập API call
    return new Promise((resolve) => {
      setTimeout(() => {
        // Giả sử username và phone hợp lệ
        resolve({ success: true });
      }, 500);
    });
  };

  // Xử lý gửi lại OTP
  const handleResendOTP = async () => {
    await sendOTP(userData.parentPhone);
  };

  // Xử lý xác thực OTP
  const handleOTPVerify = async (otp: string) => {
    await verifyOTP(userData.parentPhone, otp);
  };

  // Xử lý reset
  const handleReset = () => {
    setStep('verify');
    setIsSubmitted(false);
    setUserData({ username: '', parentPhone: '' });
  };

  // Kiểm tra trạng thái đang tải
  const isLoading = formLoading || otpLoading;

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Link
        href="/login"
        className="absolute left-4 top-4 flex items-center text-sm text-muted-foreground hover:text-primary md:left-8 md:top-8"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Quay lại đăng nhập
      </Link>

      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Quên mật khẩu</CardTitle>
            <CardDescription className="text-center">
              {step === 'verify' 
                ? 'Nhập tên đăng nhập và số điện thoại phụ huynh để lấy lại mật khẩu'
                : 'Nhập mã OTP đã được gửi đến số điện thoại phụ huynh'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSubmitted ? (
              <SuccessMessage onReset={handleReset} />
            ) : step === 'verify' ? (
              <ForgotPasswordForm 
                onSubmit={handleFormSubmit} 
                isLoading={isLoading} 
              />
            ) : (
              <OTPVerificationForm 
                onVerify={handleOTPVerify} 
                onBack={() => setStep('verify')}
                onResendOTP={handleResendOTP}
                canResend={canResend}
                isLoading={isLoading}
                description={canResend 
                  ? "Mã OTP đã được gửi đến số điện thoại phụ huynh" 
                  : `Có thể gửi lại mã sau ${remainingTime} giây`}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 