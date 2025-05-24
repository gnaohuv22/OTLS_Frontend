'use client';

import { useState, useEffect, useCallback } from 'react';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, Loader2, ArrowRight, KeyRound, PhoneCall } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from "@/components/ui/use-toast"
import { sendOtp, verifyOtp } from '@/lib/api/twilio';
import { UserService } from '@/lib/api/user';

// Schema cho form xác thực số điện thoại
const verifyPhoneSchema = z.object({
  phone: z.string()
    .regex(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/, 'Số điện thoại không hợp lệ')
})

export function VerifyPhone() {
  const router = useRouter();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [userName, setUserName] = useState('');
  const [remainingTime, setRemainingTime] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [hasAutoSentOtp, setHasAutoSentOtp] = useState(false); // Cờ đánh dấu đã gửi OTP
  const [isVerifyingUser, setIsVerifyingUser] = useState(false); // Trạng thái đang xác thực user

  // Form xác thực số điện thoại
  const form = useForm<z.infer<typeof verifyPhoneSchema>>({
    resolver: zodResolver(verifyPhoneSchema),
    defaultValues: {
      phone: ''
    }
  });

  // Hàm gửi OTP đến số điện thoại
  const sendOtpToPhone = useCallback(async (phone: string) => {
    try {
      setLoading(true);
      console.log('[Debug] Đang gửi OTP đến số điện thoại:', phone);
      
      const result = await sendOtp(phone);
      
      if (!result.success) {
        throw new Error(result.message);
      }

      console.log('[Debug] Gửi OTP thành công');
      toast({
        title: "Mã OTP đã được gửi!",
        description: "Vui lòng kiểm tra tin nhắn SMS để lấy mã xác thực",
      });
      
      // Thiết lập bộ đếm thời gian
      setRemainingTime(30);
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
    } catch (error: any) {
      console.error("[Debug] Lỗi khi gửi OTP:", error);
      toast({
        title: "Lỗi gửi OTP",
        description: error.message || "Đã xảy ra lỗi khi gửi mã OTP. Vui lòng thử lại.",
        variant: "destructive",
      });
      setHasAutoSentOtp(false); // Reset cờ nếu gửi thất bại để có thể thử lại
    } finally {
      setLoading(false);
      setIsVerifyingUser(false);
    }
  }, []);

  // Hàm kiểm tra thông tin user và tự động gửi OTP
  const verifyUserInfo = useCallback(async (phone: string, username: string) => {
    try {
      console.log('[Debug] Đang xác thực thông tin người dùng...');
      
      // Kiểm tra số điện thoại và username
      const userData = await UserService.checkPhoneNumberAndUsername({
        phoneNumber: phone,
        userName: username
      });
      
      console.log('[Debug] Thông tin người dùng:', userData);
      
      // Lưu ID người dùng
      if (userData && userData.userID) {
        console.log('[Debug] Đã lấy được userID:', userData.userID);
        setUserId(userData.userID);
        localStorage.setItem('registerUserId', userData.userID);
        
        // Nếu kiểm tra thành công, tự động gửi OTP
        if (!hasAutoSentOtp) {
          setHasAutoSentOtp(true);
          await sendOtpToPhone(phone);
        }
      } else {
        throw new Error('Không tìm thấy thông tin người dùng');
      }
    } catch (error: any) {
      console.error('[Debug] Lỗi khi xác thực thông tin người dùng:', error);
      toast({
        title: "Lỗi xác thực",
        description: error.message || "Không thể xác thực thông tin người dùng",
        variant: "destructive",
      });
      setIsVerifyingUser(false);
    }
  }, [hasAutoSentOtp, sendOtpToPhone]);

  // Lấy số điện thoại và username từ localStorage khi component được mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedPhone = localStorage.getItem('registerPhoneNumber');
      const savedUsername = localStorage.getItem('registerUsername');
      
      console.log('[Debug] Đọc thông tin từ localStorage:', { 
        phoneNumber: savedPhone, 
        userName: savedUsername 
      });
      
      if (savedPhone && savedUsername && !isVerifyingUser) {
        setIsVerifyingUser(true);
        setPhoneNumber(savedPhone);
        setUserName(savedUsername);
        form.setValue('phone', savedPhone);
        
        // Kiểm tra thông tin user từ API
        verifyUserInfo(savedPhone, savedUsername);
      }
    }
  }, [form, isVerifyingUser, verifyUserInfo]);

  // Xử lý gửi số điện thoại
  const onSubmit = async (values: z.infer<typeof verifyPhoneSchema>) => {
    try {
      setLoading(true);
      setPhoneNumber(values.phone);
      
      // Nếu có userName thì kiểm tra thông qua API
      if (userName) {
        await verifyUserInfo(values.phone, userName);
      } else {
        // Ngược lại thì gửi OTP trực tiếp (giữ lại logic cũ cho tương thích)
        await sendOtpToPhone(values.phone);
      }
    } catch (error: any) {
      console.error("Lỗi khi xử lý:", error);
      toast({
        title: "Lỗi",
        description: error.message || "Đã xảy ra lỗi. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Xử lý xác thực OTP
  const handleVerifyOTP = async () => {
    if (!otp) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập mã OTP",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      console.log('[Debug] Đang xác thực mã OTP...');
      
      const result = await verifyOtp(phoneNumber, otp);
      
      if (!result.success) {
        throw new Error(result.message);
      }

      console.log('[Debug] Xác thực OTP thành công');
      
      // Nếu có userId, cập nhật trạng thái người dùng thành Active
      if (userId) {
        console.log('[Debug] Đang cập nhật trạng thái người dùng thành Active...');
        
        const statusUpdateResult = await UserService.changeStatusUser({
          userId: userId,
          statusUser: 'Active'
        });
        
        if (!statusUpdateResult) {
          console.warn('[Debug] Cập nhật trạng thái người dùng thất bại');
          // Vẫn tiếp tục xử lý dù cập nhật trạng thái thất bại
        } else {
          console.log('[Debug] Cập nhật trạng thái người dùng thành công');
        }
      } else {
        console.warn('[Debug] Không có userId để cập nhật trạng thái');
      }
      
      setIsSubmitted(true);
      toast({
        title: "Xác thực thành công!",
        description: "Số điện thoại của bạn đã được xác thực thành công.",
      });
      
      // Xóa thông tin từ localStorage
      localStorage.removeItem('registerPhoneNumber');
      localStorage.removeItem('registerUsername');
      localStorage.removeItem('registerUserId');
      
      // Sau khi xác thực thành công, chuyển hướng về trang đăng nhập sau 3 giây
      setTimeout(() => {
        router.push('/login');
      }, 3000);
      
    } catch (error: any) {
      console.error("Lỗi khi xác thực OTP:", error);
      toast({
        title: "Lỗi xác thực",
        description: error.message || "Mã OTP không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
        <div className="flex flex-col space-y-2 text-center mb-4">
          <h1 className="text-2xl font-semibold tracking-tight">
            OTLS - Xác thực số điện thoại
          </h1>
          <p className="text-sm text-muted-foreground">
            Xác thực số điện thoại để hoàn tất việc đăng ký tài khoản
          </p>
        </div>
        
        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              {isSubmitted 
                ? "Xác thực thành công!" 
                : step === 'phone' 
                  ? "Nhập số điện thoại" 
                  : "Nhập mã xác thực"}
            </CardTitle>
            <CardDescription className="text-center">
              {step === 'phone' 
                ? 'Nhập số điện thoại của phụ huynh để nhận mã xác thực OTP'
                : `Vui lòng nhập mã OTP đã được gửi đến số điện thoại ${phoneNumber}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSubmitted ? (
              <div className="space-y-4 text-center">
                <div className="flex items-center justify-center">
                  <div className="rounded-full bg-green-100 p-3">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <Alert className="bg-green-50 border-green-200">
                  <AlertDescription>
                    Xác thực số điện thoại thành công! 
                    Bạn sẽ được chuyển hướng về trang đăng nhập sau 3 giây.
                  </AlertDescription>
                </Alert>
              </div>
            ) : step === 'phone' ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số điện thoại phụ huynh</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <PhoneCall className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
                            <Input
                              {...field}
                              type="tel"
                              placeholder="Ví dụ: 0987654321"
                              className="pl-10"
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Số điện thoại này sẽ được sử dụng để liên hệ và xác thực tài khoản
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={!form.formState.isValid || form.formState.isSubmitting || loading || isVerifyingUser}
                  >
                    {loading || isVerifyingUser ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isVerifyingUser ? 'Đang xác thực thông tin...' : 'Đang gửi...'}
                      </>
                    ) : (
                      <>
                        Gửi mã xác thực
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="otp" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Mã OTP</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Nhập mã OTP 6 số"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                      className="pl-10 text-center text-xl tracking-widest font-medium"
                    />
                  </div>
                  <p className="text-sm text-center text-gray-500 mt-2">
                    Mã OTP đã được gửi đến số điện thoại phụ huynh
                  </p>
                </div>

                <Button
                  onClick={handleVerifyOTP}
                  disabled={otp.length < 6 || loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang xác thực...
                    </>
                  ) : (
                    <>
                      Xác nhận mã OTP
                      <CheckCircle2 className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
                
                <div className="flex justify-between items-center mt-4">
                  <Button
                    variant="ghost"
                    onClick={() => setStep('phone')}
                    disabled={loading}
                    className="text-sm"
                  >
                    Thay đổi số điện thoại
                  </Button>
                  
                  <Button
                    variant="ghost"
                    onClick={() => {
                      if (phoneNumber) {
                        sendOtpToPhone(phoneNumber);
                      }
                    }}
                    disabled={loading || remainingTime > 0}
                    className="text-sm"
                  >
                    {remainingTime > 0 
                      ? `Gửi lại mã (${remainingTime}s)` 
                      : "Gửi lại mã OTP"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            {!isSubmitted && (
              <p className="text-xs text-center text-gray-500 w-full mt-2">
                OTLS sử dụng xác thực hai yếu tố qua SMS để bảo vệ tài khoản của bạn. 
                Tin nhắn SMS sẽ được gửi đến số điện thoại đã đăng ký.
              </p>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 