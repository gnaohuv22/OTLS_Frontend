'use client';

import React from 'react';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, KeyRound, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { AuthService, LoginRequest } from '@/lib/api/auth';
import { useAuth } from '@/lib/auth-context';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { login } = useAuth();
  const returnUrl = searchParams.get('returnUrl') || '/dashboard';

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState({
    username: '',
    password: ''
  });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      username: '',
      password: ''
    };

    // Validate username
    if (!formData.username) {
      newErrors.username = 'Vui lòng nhập tên đăng nhập';
      isValid = false;
    } else if (formData.username.length < 3) {
      newErrors.username = 'Tên đăng nhập phải có ít nhất 3 ký tự';
      isValid = false;
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Vui lòng kiểm tra lại thông tin đăng nhập",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const loginData: LoginRequest = {
        username: formData.username,
        password: formData.password
      };
      
      // // Theo dõi số lần đăng nhập thất bại để tăng cường bảo mật
      // let loginAttempts = parseInt(localStorage.getItem('loginAttempts') || '0');
      
      // // Kiểm tra nếu có quá nhiều lần đăng nhập thất bại
      // if (loginAttempts >= 5) {
      //   const lastAttemptTime = parseInt(localStorage.getItem('lastLoginAttempt') || '0');
      //   const currentTime = Date.now();
        
      //   // Nếu thời gian giữa lần cuối và hiện tại < 15 phút, tạm khóa
      //   if (currentTime - lastAttemptTime < 15 * 60 * 1000) {
      //     toast({
      //       variant: "destructive",
      //       title: "Tài khoản tạm thời bị khóa",
      //       description: "Quá nhiều lần đăng nhập không thành công. Vui lòng thử lại sau 15 phút.",
      //     });
      //     setIsLoading(false);
      //     return;
      //   } else {
      //     // Reset nếu đã qua 15 phút
      //     localStorage.setItem('loginAttempts', '0');
      //     loginAttempts = 0;
      //   }
      // }
      
      const response = await AuthService.login(loginData);
      
      if (response.success && response.userData && response.token && response.roleName) {
        // Kiểm tra trạng thái tài khoản
        if (response.userData.status !== 'Active') {
          // Xử lý tài khoản không active
          toast({
            variant: "destructive",
            title: "Tài khoản không hoạt động",
            description: "Tài khoản của bạn đã bị khóa hoặc chưa được kích hoạt. Vui lòng liên hệ quản trị viên.",
          });
          // Tăng số lần đăng nhập thất bại
          // loginAttempts++;
          // localStorage.setItem('loginAttempts', loginAttempts.toString());
          localStorage.setItem('lastLoginAttempt', Date.now().toString());
          setIsLoading(false);
          return;
        }
        
        // Reset số lần đăng nhập thất bại
        localStorage.removeItem('loginAttempts');
        localStorage.removeItem('lastLoginAttempt');
        
        // Lưu thông tin vào context
        login(response.userData, response.token, response.roleName as 'Student' | 'Teacher' | 'Parent');
        
        toast({
          title: "Đăng nhập thành công",
          description: "Chào mừng bạn quay trở lại!",
        });
        
        // Redirect sau khi đăng nhập thành công
        router.push(returnUrl);
      } else {
        // Tăng số lần đăng nhập thất bại
        // loginAttempts++;
        // localStorage.setItem('loginAttempts', loginAttempts.toString());
        localStorage.setItem('lastLoginAttempt', Date.now().toString());
        
        toast({
          variant: "destructive",
          title: "Đăng nhập thất bại",
          description: response.message || "Tên đăng nhập hoặc mật khẩu không chính xác",
        });
      }
    } catch (error: any) {
      console.error('Lỗi đăng nhập:', error);
      
      // Cải thiện thông báo lỗi
      let errorMessage = "Đã xảy ra lỗi khi đăng nhập";
      
      if (error.message === 'Network Error') {
        errorMessage = "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng hoặc đảm bảo máy chủ backend đang chạy.";
      } else if (error.response) {
        // Lỗi có phản hồi từ server
        errorMessage = "Tên đăng nhập hoặc mật khẩu không chính xác, hoặc máy chủ có thể đang gặp sự cố.";
      }
      
      toast({
        variant: "destructive",
        title: "Đăng nhập thất bại",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="username">Tên đăng nhập</Label>
        <div className="relative">
          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="username"
            name="username"
            type="text"
            placeholder="Nhập tên đăng nhập"
            className={cn("pl-9", errors.username && "border-red-500")}
            value={formData.username}
            onChange={handleInputChange}
            disabled={isLoading}
            autoFocus
          />
        </div>
        {errors.username && (
          <p className="text-sm text-red-500">{errors.username}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Mật khẩu</Label>
        <div className="relative">
          <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Nhập mật khẩu"
            className={cn("pl-9 pr-9", errors.password && "border-red-500")}
            value={formData.password}
            onChange={handleInputChange}
            disabled={isLoading}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-10 w-10 px-3"
            onClick={togglePasswordVisibility}
            disabled={isLoading}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password}</p>
        )}
      </div>
      <Button className="w-full" size="lg" type="submit" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Đang xử lý...
          </>
        ) : (
          "Đăng nhập"
        )}
      </Button>
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          Chưa có tài khoản?{" "}
          <Link href="/register" className="underline text-primary hover:text-primary/90">
            Đăng ký ngay
          </Link>
        </p>
        <p className="text-sm text-muted-foreground">
          <Link href="/forgot-password" className="underline text-primary hover:text-primary/90">
            Quên mật khẩu?
          </Link>
        </p>
      </div>
    </form>
  );
} 