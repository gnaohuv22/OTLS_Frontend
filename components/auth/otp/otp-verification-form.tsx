'use client';

import { Button } from "@/components/ui/button";
import { OTPInput } from "@/components/auth/otp/otp-input";

interface OTPVerificationFormProps {
  onVerify: (otp: string) => void;
  onBack: () => void;
  onResendOTP?: () => void;
  canResend?: boolean;
  isLoading?: boolean;
  description?: string;
}

export function OTPVerificationForm({ 
  onVerify, 
  onBack, 
  onResendOTP,
  canResend = true,
  isLoading = false,
  description = "Mã OTP đã được gửi đến số điện thoại phụ huynh"
}: OTPVerificationFormProps) {
  return (
    <div className="space-y-4">
      <OTPInput
        onComplete={onVerify}
        onResend={onResendOTP}
        canResend={canResend}
        isLoading={isLoading}
        description={description}
      />
      
      <Button
        variant="outline"
        onClick={onBack}
        disabled={isLoading}
        className="w-full mt-2"
      >
        Quay lại
      </Button>
    </div>
  );
} 