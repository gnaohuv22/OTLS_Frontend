'use client';

import { CheckCircle2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface SuccessMessageProps {
  onReset: () => void;
}

export function SuccessMessage({ onReset }: SuccessMessageProps) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(3);

  // Hiệu ứng đếm ngược
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-4 text-center">
      <CheckCircle2 className="mx-auto h-8 w-8 text-green-500" />
      <Alert>
        <AlertDescription>
          Chúng tôi đã gửi mật khẩu mới đến số điện thoại phụ huynh của bạn.
          Vui lòng kiểm tra tin nhắn SMS.
        </AlertDescription>
      </Alert>
      <p className="text-sm text-muted-foreground">
        Tự động chuyển hướng đến trang đăng nhập sau {countdown} giây...
      </p>
      <div className="flex flex-col space-y-2">
        <Button
          variant="default"
          className="w-full"
          onClick={() => router.push('/login')}
        >
          Đến trang đăng nhập ngay
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={onReset}
        >
          Quên mật khẩu khác
        </Button>
      </div>
    </div>
  );
} 