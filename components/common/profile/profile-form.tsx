'use client';

import { UserDTO } from "@/lib/api/auth";
import { profileFormSchema, genderOptions } from "@/lib/validations/user-validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, InfoIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserService } from "@/lib/api/user";
import { useToast } from "@/components/ui/use-toast";
import { AvatarSection } from "./avatar-section";
import { useEffect } from "react";

interface ProfileFormProps {
  userData: UserDTO | null;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  avatarUrl: string;
  setAvatarUrl: (url: string) => void;
  setApiUserData: (data: UserDTO) => void;
}

/**
 * Component hiển thị form thông tin cá nhân
 */
export function ProfileForm({ 
  userData, 
  isEditing, 
  setIsEditing, 
  avatarUrl, 
  setAvatarUrl,
  setApiUserData
}: ProfileFormProps) {
  const { toast } = useToast();

  // Initialize form
  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: '',
      fullName: '',
      phone: '',
      email: '',
      gender: 'Male',
      dateOfBirth: '',
      avatar: '/avatars/default.png'
    }
  });

  // Cập nhật form khi userData thay đổi
  useEffect(() => {
    if (userData) {
      profileForm.reset({
        username: userData.userName || '',
        fullName: userData.fullName || '',
        email: userData.email || '',
        phone: userData.phoneNumber || '',
        gender: (userData.gender as 'Male' | 'Female' | 'Other') || 'Other',
        dateOfBirth: userData.dateOfBirth || '',
        avatar: userData.avatar || '/avatars/default.png'
      });
    }
  }, [userData, profileForm]);

  // Xử lý khi thay đổi avatar
  const handleAvatarChange = async (newAvatarUrl: string) => {
    try {
      // Cập nhật state local
      setAvatarUrl(newAvatarUrl);
      
      // Cập nhật giá trị trong form
      profileForm.setValue('avatar', newAvatarUrl);
      
      // Cập nhật state nếu có userData
      if (userData) {
        const updatedUserData = {
          ...userData,
          avatar: newAvatarUrl
        };
        
        setApiUserData(updatedUserData);
        
        // Lưu avatar mới vào localStorage để đảm bảo dữ liệu được lưu ngay cả khi API gọi thất bại
        try {
          if (typeof window !== 'undefined') {
            const storedUserData = localStorage.getItem('userData');
            if (storedUserData) {
              const parsedUserData = JSON.parse(storedUserData);
              const newUserData = { ...parsedUserData, avatar: newAvatarUrl };
              localStorage.setItem('userData', JSON.stringify(newUserData));
              
              // Thông báo cho các component khác biết avatar đã được cập nhật
              const updateEvent = new CustomEvent('avatar-updated', { 
                detail: { 
                  userId: userData.userID,
                  avatarUrl: newAvatarUrl 
                } 
              });
              window.dispatchEvent(updateEvent);
            }
          }
        } catch (error) {
          console.error('Lỗi khi cập nhật avatar trong localStorage:', error);
        }
      }
    } catch (error: any) {
      toast({
        title: "Lỗi cập nhật ảnh đại diện",
        description: error.message || "Đã có lỗi xảy ra, vui lòng thử lại sau",
        variant: "destructive",
        duration: 5000,
      });
      throw error; // Ném lỗi để AvatarSection có thể bắt và xử lý
    }
  };

  // Xử lý cập nhật thông tin cá nhân
  const onProfileSubmit = async (values: z.infer<typeof profileFormSchema>) => {
    try {
      // Hiển thị toast loading
      toast({
        title: "Đang cập nhật...",
        description: "Vui lòng đợi trong giây lát",
        duration: 3000,
      });


      // Chuẩn bị dữ liệu gửi lên API
      const updateData = {
        userID: userData?.userID || '',
        username: values.username,
        phoneNumber: values.phone,
        fullName: values.fullName,
        email: values.email || '',
        gender: values.gender as 'Male' | 'Female' | 'Other',
        dateOfBirth: values.dateOfBirth || '',
        avatar: values.avatar,
        status: userData?.status as 'Active' | 'Inactive'
      };

      // Gọi API cập nhật thông tin
      const result = await UserService.updateUser(updateData);
      
      // Cập nhật lại dữ liệu người dùng từ API sau khi cập nhật thành công
      if (result) {
        try {
          const updatedUserData = await UserService.getUserById(updateData.userID);
          setApiUserData(updatedUserData);
        } catch (error) {
          console.error("Không thể lấy dữ liệu người dùng mới:", error);
          // Cập nhật với dữ liệu hiện tại và giá trị form
          if (userData) {
            setApiUserData({
              ...userData,
              userName: values.username,
              phoneNumber: values.phone,
              fullName: values.fullName,
              email: values.email || '',
              gender: values.gender as 'Male' | 'Female' | 'Other',
              dateOfBirth: values.dateOfBirth || '',
              avatar: values.avatar
            });
          }
        }
      }
      
      // Hiển thị thông báo thành công
      toast({
        title: "Lưu thông tin thành công",
        description: "Thông tin cá nhân đã được cập nhật",
        duration: 3000,
      });

      // Tắt chế độ chỉnh sửa
      setIsEditing(false);
    } catch (error: any) {
      // Hiển thị thông báo lỗi
      toast({
        title: "Lỗi cập nhật thông tin",
        description: error.message || "Đã có lỗi xảy ra, vui lòng thử lại sau",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  return (
    <>
      <AvatarSection 
        avatarUrl={avatarUrl} 
        userData={userData} 
        onAvatarChange={handleAvatarChange} 
      />

      <Form {...profileForm}>
        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cột 1 */}
            <div className="space-y-4">
              <FormField
                control={profileForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên đăng nhập</FormLabel>
                    <FormControl>
                      <Input {...field} disabled className="bg-gray-30" />
                    </FormControl>
                    <div className="mt-1.5">
                      <Alert>
                        <InfoIcon className="h-4 w-4" />
                        <AlertDescription>
                          Tên đăng nhập không thể thay đổi
                        </AlertDescription>
                      </Alert>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={profileForm.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Họ và tên</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={!isEditing} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={profileForm.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngày sinh</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="date" 
                        disabled={!isEditing} 
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Cột 2 */}
            <div className="space-y-4">
              <FormField
                control={profileForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" disabled={!isEditing} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={profileForm.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giới tính</FormLabel>
                    <Select 
                      disabled={!isEditing} 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn giới tính" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {genderOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={profileForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số điện thoại</FormLabel>
                    <FormControl>
                      <Input {...field} type="tel" disabled className="bg-gray-30" />
                    </FormControl>
                    <div className="mt-1.5">
                      <Alert>
                        <InfoIcon className="h-4 w-4" />
                        <AlertDescription>
                          Số điện thoại không thể thay đổi vì đã được liên kết với tài khoản
                        </AlertDescription>
                      </Alert>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end mt-6">
              <Button 
                type="button"
                disabled={!profileForm.formState.isDirty || profileForm.formState.isSubmitting}
                onClick={(e) => {
                  e.preventDefault();
                  profileForm.handleSubmit(onProfileSubmit)();
                }}
              >
                {profileForm.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  "Lưu thay đổi"
                )}
              </Button>
            </div>
          )}
        </form>
      </Form>
    </>
  );
} 