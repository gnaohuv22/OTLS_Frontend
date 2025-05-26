'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Phone, Mail, User, Info, CalendarIcon, Check, Loader2 } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { AnimatePresence, motion } from "framer-motion";
import { InputWithIcon } from './input-with-icon';
import { PasswordInput } from './password-input';
import { RequiredField } from './required-field';
import { AvatarUploader } from '@/components/ui/avatar-uploader';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AuthService, RegisterRequest } from '@/lib/api/auth';
import { validateUserField, passwordRequirements, genderOptions } from '@/lib/validations/user-validation';

export function RegisterForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    fullname: '',
    username: '',
    phoneNumber: '',
    email: '',
    password: '',
    dateOfBirth: '',
    gender: 'Male',
    avatar: ''
  });
  const [errors, setErrors] = useState({
    fullname: '',
    username: '',
    phoneNumber: '',
    email: '',
    password: '',
    dateOfBirth: '',
    gender: '',
    avatar: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);

  // Debug log khi component mount
  useEffect(() => {
    console.log('[RegisterForm] Component được khởi tạo');
    // Nếu người dùng đã bắt đầu nhập mật khẩu, ẩn tooltip để hiển thị yêu cầu trực tiếp trong form
    if (formData.password) {
      setShowPasswordRequirements(false);
    }
  }, [formData.password]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let processedValue = value;

    // Xử lý đặc biệt cho số điện thoại
    if (name === 'phoneNumber') {
      processedValue = value.replace(/[^0-9]/g, '');
    }

    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));


    // Validation realtime
    validateField(name, processedValue);
  };

  const handleSelectChange = (value: string, fieldName: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
    validateField(fieldName, value);
  };

  const handleAvatarChange = (avatarUrl: string) => {
    setFormData(prev => ({
      ...prev,
      avatar: avatarUrl
    }));
  };

  // Validate từng trường riêng lẻ
  const validateField = (name: string, value: string) => {
    const errorMessage = validateUserField(name, value, true);
    
    setErrors(prev => ({
      ...prev,
      [name]: errorMessage
    }));

    if (errorMessage) {
    }

    return !errorMessage; // Trả về true nếu không có lỗi
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate tất cả các trường
    const isValid = Object.keys(formData).every(field => 
      validateField(field, formData[field as keyof typeof formData])
    );

    if (!isValid) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Vui lòng kiểm tra lại thông tin đăng ký",
      });
      return;
    }

    // Kiểm tra bổ sung cho số điện thoại
    if (!/^(0[3|5|7|8|9])+([0-9]{8})$/.test(formData.phoneNumber)) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Số điện thoại không hợp lệ. Vui lòng nhập đúng định dạng (VD: 0912345678)",
      });
      return;
    }

    // Kiểm tra tuổi hợp lệ
    if (formData.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      if (age < 6 || age > 20) {
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: "Học sinh phải từ 6 đến 20 tuổi",
        });
        return;
      }
    }

    setIsLoading(true);
    
    try {
      
      const registerData: RegisterRequest = {
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        fullname: formData.fullname,
        username: formData.username,
        dateOfBirth: formData.dateOfBirth,
        roleName: "Student",
        gender: formData.gender,
        ...(formData.avatar ? { avatar: formData.avatar } : {})
      };
      
      // Đo thời gian gọi API
      const startTime = performance.now();
      const response = await AuthService.register(registerData);
      const endTime = performance.now();
      
      if (response.success) {
        toast({
          title: "Đăng ký thành công",
          description: "Vui lòng xác thực số điện thoại để hoàn tất đăng ký",
        });
        
        // Lưu số điện thoại và username vào localStorage để sử dụng ở trang xác thực
        localStorage.setItem('registerPhoneNumber', formData.phoneNumber);
        localStorage.setItem('registerUsername', formData.username);
        
        // Chuyển hướng đến trang xác thực số điện thoại
        router.push('/verify-phone');
      } else {
        toast({
          variant: "destructive",
          title: "Đăng ký thất bại",
          description: response.message || "Đăng ký thất bại, tài khoản này đã tồn tại.",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Đăng ký thất bại",
        description: error.message || "Có lỗi xảy ra, vui lòng thử lại sau.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Avatar upload section */}
      <div className="flex flex-col items-center mb-6">
        <AvatarUploader 
          currentAvatar={formData.avatar} 
          fallbackText="HS"
          size="lg"
          onAvatarChange={handleAvatarChange}
          isRegisterMode={true}
        />
        <p className="mt-2 text-sm text-muted-foreground">
          Tải lên ảnh đại diện (tuỳ chọn)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cột 1 */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullname">
              Họ và tên<RequiredField />
            </Label>
            <InputWithIcon
              id="fullname"
              name="fullname"
              icon={User}
              placeholder="Nguyễn Văn A"
              value={formData.fullname}
              onChange={handleInputChange}
              error={errors.fullname}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">
              Tên đăng nhập<RequiredField />
            </Label>
            <InputWithIcon
              id="username"
              name="username"
              icon={User}
              placeholder="student123"
              value={formData.username}
              onChange={handleInputChange}
              error={errors.username}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">
              Ngày sinh<RequiredField />
            </Label>
            <InputWithIcon
              id="dateOfBirth"
              name="dateOfBirth"
              icon={CalendarIcon}
              type="date"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              error={errors.dateOfBirth}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">
              Giới tính<RequiredField />
            </Label>
            <Select
              value={formData.gender}
              onValueChange={(value) => handleSelectChange(value, 'gender')}
              disabled={isLoading}
            >
              <SelectTrigger id="gender" className={errors.gender ? "border-red-500" : ""}>
                <SelectValue placeholder="Chọn giới tính" />
              </SelectTrigger>
              <SelectContent>
                {genderOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <AnimatePresence>
              {errors.gender && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-sm text-red-500"
                >
                  {errors.gender}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Cột 2 */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">
              Số điện thoại phụ huynh<RequiredField />
            </Label>
            <InputWithIcon
              id="phoneNumber"
              name="phoneNumber"
              icon={Phone}
              type="tel"
              placeholder="0912345678"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              error={errors.phoneNumber}
              disabled={isLoading}
              helpText="Số điện thoại phụ huynh sẽ được sử dụng để liên hệ và xác thực tài khoản"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              Email
            </Label>
            <InputWithIcon
              id="email"
              name="email"
              icon={Mail}
              type="email"
              placeholder="example@email.com"
              value={formData.email}
              onChange={handleInputChange}
              error={errors.email}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center">
              <Label htmlFor="password">
                Mật khẩu<RequiredField />
              </Label>
              <TooltipProvider delayDuration={200}>
                <Tooltip open={showPasswordRequirements && !formData.password} onOpenChange={(open) => {
                  // Chỉ cho phép thay đổi trạng thái tooltip khi chưa nhập mật khẩu
                  if (!formData.password) {
                    setShowPasswordRequirements(open);
                  }
                }}>
                  <TooltipTrigger asChild>
                    <Info 
                      className="h-4 w-4 ml-2 text-gray-400 cursor-help" 
                    />
                  </TooltipTrigger>
                  <TooltipContent side="right" align="start" className="space-y-2 p-4 w-72">
                    <h4 className="font-semibold">Yêu cầu mật khẩu:</h4>
                    <ul className="space-y-1">
                      {passwordRequirements.map((req) => (
                        <li key={req.id} className="flex items-center">
                          <div className="h-4 w-4 border border-gray-300 rounded-full mr-2" />
                          {req.label}
                        </li>
                      ))}
                    </ul>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <PasswordInput
              id="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleInputChange}
              error={errors.password}
              disabled={isLoading}
            />
            
            {/* Hiển thị các yêu cầu mật khẩu khi người dùng đang nhập */}
            <AnimatePresence>
              {formData.password && (
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
                        {req.regex.test(formData.password) ? (
                          <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
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
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center space-y-4 mt-6">
        <Button
          type="submit"
          className="w-full max-w-md"
          disabled={isLoading || Object.values(errors).some(error => error !== '')}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang xử lý
            </>
          ) : (
            'Đăng ký'
          )}
        </Button>

        <p className="text-center text-sm text-gray-600">
          Đã có tài khoản?{' '}
          <Link href="/login" className="text-blue-600 hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>
    </form>
  );
} 