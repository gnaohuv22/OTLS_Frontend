'use client';

import { useState, useRef, KeyboardEvent, ClipboardEvent, ChangeEvent } from 'react';
import { Button } from "@/components/ui/button";
import { FormControl, FormDescription, FormItem, FormLabel } from "@/components/ui/form";
import { cn } from '@/lib/utils';

interface OTPInputProps {
  length?: number;
  onComplete: (otp: string) => void;
  onResend?: () => void;
  canResend?: boolean;
  isLoading?: boolean;
  label?: string;
  description?: string;
}

export function OTPInput({
  length = 6,
  onComplete,
  onResend,
  canResend = true,
  isLoading = false,
  label = "Mã OTP",
  description = "Mã OTP đã được gửi đến số điện thoại của bạn"
}: OTPInputProps) {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  // Xử lý khi người dùng nhập vào input
  const handleChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    if (isNaN(Number(value))) return; // Chỉ cho phép nhập số

    const newOtp = [...otp];
    // Chỉ lấy ký tự cuối cùng nếu người dùng nhập nhiều số
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Nếu có giá trị và không phải ô cuối cùng, focus vào ô tiếp theo
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Kiểm tra xem đã nhập đủ các ô chưa
    const otpValue = newOtp.join('');
    if (otpValue.length === length) {
      onComplete(otpValue);
    }
  };

  // Xử lý khi người dùng nhấn phím
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Nếu ô hiện tại trống và người dùng nhấn Backspace, quay lại ô trước đó
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      // Di chuyển sang trái
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      // Di chuyển sang phải
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Xử lý khi người dùng paste OTP
  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    if (isNaN(Number(pastedData))) return; // Chỉ cho phép dán số

    const pastedOtp = pastedData.slice(0, length).split('');
    const newOtp = [...otp];
    
    for (let i = 0; i < Math.min(length, pastedOtp.length); i++) {
      newOtp[i] = pastedOtp[i];
    }
    
    setOtp(newOtp);
    
    // Focus vào ô cuối cùng được điền
    if (pastedOtp.length < length) {
      inputRefs.current[pastedOtp.length]?.focus();
    } else {
      // Nếu đã điền đủ, gọi callback onComplete
      onComplete(newOtp.join(''));
    }
  };

  return (
    <div className="space-y-4">
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <FormControl>
          <div className="flex justify-between gap-2">
            {Array.from({ length }, (_, index) => (
              <input
                key={index}
                type="text"
                ref={(el) => { inputRefs.current[index] = el; }}
                value={otp[index]}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={index === 0 ? handlePaste : undefined}
                maxLength={1}
                disabled={isLoading}
                aria-label={`OTP digit ${index + 1}`}
                title={`OTP digit ${index + 1}`}
                className={cn(
                  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-center",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  { "opacity-50 cursor-not-allowed": isLoading }
                )}
              />
            ))}
          </div>
        </FormControl>
        <FormDescription className="text-center">
          {description}
        </FormDescription>
      </FormItem>

      {onResend && (
        <Button
          variant="outline"
          onClick={onResend}
          disabled={!canResend || isLoading}
          className="w-full"
        >
          Gửi lại mã
        </Button>
      )}
    </div>
  );
} 