'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Key, Loader2, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { toast } from "@/components/ui/use-toast";
import { validateUserField, passwordRequirements } from '@/lib/validations/user-validation';
import { motion, AnimatePresence } from 'framer-motion';

export function ResetPassword() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({ password: '', confirmPassword: '' });
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Kiểm tra dữ liệu từ localStorage khi component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedEmail = localStorage.getItem('resetPasswordEmail');
      const savedUserId = localStorage.getItem('resetPasswordUserId');
      
      if (!savedEmail || !savedUserId) {
        console.log('[ResetPassword] Không có thông tin reset password, chuyển về forgot password');
        router.push('/forgot-password');
        return;
      }
      
      setEmail(savedEmail);
      setUserId(savedUserId);
    }
  }, [router]);

  // Validate password
  const validatePassword = (value: string) => {
    const errorMessage = validateUserField('password', value, true);
    setErrors(prev => ({ ...prev, password: errorMessage }));
    return !errorMessage;
  };

  // Validate confirm password
  const validateConfirmPassword = (value: string) => {
    let errorMessage = '';
    if (!value) {
      errorMessage = 'Vui lòng xác nhận mật khẩu';
    } else if (value !== password) {
      errorMessage = 'Mật khẩu xác nhận không khớp';
    }
    setErrors(prev => ({ ...prev, confirmPassword: errorMessage }));
    return !errorMessage;
  };

  // Xử lý thay đổi password
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    validatePassword(value);
    
    // Re-validate confirm password if it exists
    if (confirmPassword) {
      validateConfirmPassword(confirmPassword);
    }
  };

  // Xử lý thay đổi confirm password
  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmPassword(value);
    validateConfirmPassword(value);
  };

  // Xử lý submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);
    
    if (!isPasswordValid || !isConfirmPasswordValid) {
      toast({
        title: "Lỗi",
        description: "Vui lòng kiểm tra lại thông tin mật khẩu",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      console.log('[ResetPassword] Đang cập nhật mật khẩu cho userId:', userId);
      
      // TODO: Implement actual password reset API call
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('[ResetPassword] Cập nhật mật khẩu thành công');
      
      setIsSuccess(true);
      
      toast({
        title: "Đặt lại mật khẩu thành công!",
        description: "Mật khẩu của bạn đã được cập nhật thành công.",
      });
      
      // Xóa thông tin từ localStorage
      localStorage.removeItem('resetPasswordEmail');
      localStorage.removeItem('resetPasswordUserId');
      
      // Chuyển hướng về trang đăng nhập sau 3 giây
      setTimeout(() => {
        router.push('/login');
      }, 3000);
      
    } catch (error: any) {
      console.error('[ResetPassword] Lỗi khi cập nhật mật khẩu:', error);
      toast({
        title: "Lỗi",
        description: error.message || "Có lỗi xảy ra khi đặt lại mật khẩu. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="container flex h-screen w-screen flex-col items-center justify-center">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
          <div className="flex flex-col space-y-2 text-center mb-4">
            <h1 className="text-2xl font-semibold tracking-tight">
              OTLS - Đặt lại mật khẩu thành công
            </h1>
            <p className="text-sm text-muted-foreground">
              Mật khẩu của bạn đã được cập nhật thành công
            </p>
          </div>
          
          <Card className="shadow-lg">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center">
                  <div className="rounded-full bg-green-100 p-3">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <Alert className="bg-green-50 border-green-200">
                  <AlertDescription>
                    Đặt lại mật khẩu thành công! 
                    Bạn sẽ được chuyển hướng về trang đăng nhập sau 3 giây.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Link
        href="/forgot-password"
        className="absolute left-4 top-4 flex items-center text-sm text-muted-foreground hover:text-primary md:left-8 md:top-8"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Quay lại
      </Link>

      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
        <div className="flex flex-col space-y-2 text-center mb-4">
          <h1 className="text-2xl font-semibold tracking-tight">
            OTLS - Đặt lại mật khẩu
          </h1>
          <p className="text-sm text-muted-foreground">
            Tạo mật khẩu mới cho tài khoản {email}
          </p>
        </div>
        
        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Tạo mật khẩu mới
            </CardTitle>
            <CardDescription className="text-center">
              Nhập mật khẩu mới cho tài khoản của bạn
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu mới</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu mới"
                    value={password}
                    onChange={handlePasswordChange}
                    disabled={loading}
                    className={`w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Nhập lại mật khẩu mới"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    disabled={loading}
                    className={`w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Hiển thị yêu cầu mật khẩu khi người dùng đang nhập */}
              <AnimatePresence>
                {password && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-2 p-3 border rounded-md bg-muted/50"
                  >
                    <h4 className="text-sm font-medium">Yêu cầu mật khẩu:</h4>
                    <ul className="space-y-1">
                      {passwordRequirements.map((req) => (
                        <li key={req.id} className="flex items-center text-sm">
                          {req.regex.test(password) ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          ) : (
                            <div className="h-4 w-4 border border-gray-300 rounded-full mr-2 flex-shrink-0" />
                          )}
                          {req.label}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <Button
                type="submit"
                className="w-full"
                disabled={loading || !password || !confirmPassword || !!errors.password || !!errors.confirmPassword}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang cập nhật...
                  </>
                ) : (
                  <>
                    <Key className="mr-2 h-4 w-4" />
                    Đặt lại mật khẩu
                  </>
                )}
              </Button>
            </form>
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