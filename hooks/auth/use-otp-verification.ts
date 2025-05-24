'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from "@/components/ui/use-toast";
import { sendOtp, verifyOtp } from '@/lib/api/twilio';

interface UseOTPVerificationProps {
  onVerificationSuccess?: () => void;
  onVerificationError?: (error: Error) => void;
  autoStartTimer?: boolean;
  resendCooldown?: number;
}

interface UseOTPVerificationReturn {
  isLoading: boolean;
  canResend: boolean;
  remainingTime: number;
  sendOTP: (phoneNumber: string) => Promise<boolean>;
  verifyOTP: (phoneNumber: string, otp: string) => Promise<boolean>;
  resetTimer: () => void;
}

export function useOTPVerification({
  onVerificationSuccess,
  onVerificationError,
  autoStartTimer = true,
  resendCooldown = 30,
}: UseOTPVerificationProps = {}): UseOTPVerificationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);

  // Thiết lập bộ đếm thời gian
  const startTimer = useCallback(() => {
    // Xóa timer cũ nếu có
    if (timerId) {
      clearInterval(timerId);
    }

    setRemainingTime(resendCooldown);
    const timer = setInterval(() => {
      setRemainingTime((time) => {
        if (time <= 1) {
          clearInterval(timer);
          return 0;
        }
        return time - 1;
      });
    }, 1000);

    setTimerId(timer);

    // Dọn dẹp timer khi component unmount
    return () => {
      clearInterval(timer);
    };
  }, [resendCooldown, timerId]);

  // Reset timer
  const resetTimer = useCallback(() => {
    if (timerId) {
      clearInterval(timerId);
      setTimerId(null);
    }
    setRemainingTime(0);
  }, [timerId]);

  // Dọn dẹp khi component unmount
  useEffect(() => {
    return () => {
      if (timerId) {
        clearInterval(timerId);
      }
    };
  }, [timerId]);

  // Gửi OTP đến số điện thoại
  const sendOTP = async (phoneNumber: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Sử dụng API thực tế từ lib/api/twilio
      const result = await sendOtp(phoneNumber);
      
      if (!result.success) {
        throw new Error(result.message || "Lỗi khi gửi OTP");
      }

      toast({
        title: "Mã OTP đã được gửi!",
        description: "Vui lòng kiểm tra tin nhắn SMS để lấy mã xác thực",
      });
      
      // Tự động bắt đầu bộ đếm thời gian nếu được cấu hình
      if (autoStartTimer) {
        startTimer();
      }
      
      return true;
    } catch (error: any) {
      console.error("Lỗi khi gửi OTP:", error);
      toast({
        title: "Lỗi gửi OTP",
        description: error.message || "Đã xảy ra lỗi khi gửi mã OTP. Vui lòng thử lại.",
        variant: "destructive",
      });
      
      if (onVerificationError) {
        onVerificationError(error);
      }
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Xác thực OTP
  const verifyOTP = async (phoneNumber: string, otp: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Sử dụng API thực tế từ lib/api/twilio
      const result = await verifyOtp(phoneNumber, otp);
      
      if (!result.success) {
        throw new Error(result.message || "Mã OTP không hợp lệ");
      }

      toast({
        title: "Xác thực thành công!",
        description: "Mã OTP đã được xác thực thành công.",
      });
      
      if (onVerificationSuccess) {
        onVerificationSuccess();
      }
      
      resetTimer();
      return true;
    } catch (error: any) {
      console.error("Lỗi khi xác thực OTP:", error);
      toast({
        title: "Lỗi xác thực",
        description: error.message || "Mã OTP không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.",
        variant: "destructive",
      });
      
      if (onVerificationError) {
        onVerificationError(error);
      }
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    canResend: remainingTime === 0,
    remainingTime,
    sendOTP,
    verifyOTP,
    resetTimer,
  };
} 