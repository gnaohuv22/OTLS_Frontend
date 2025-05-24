import { useState, useEffect } from 'react';
import { UserInformation } from "@/lib/api/user";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { api } from "@/lib/api/client";
import { toast } from "@/components/ui/use-toast";
import { ApiResponse } from "@/lib/api/auth";

interface UserEditFormProps {
  user: UserInformation | null;
  isSubmitting: boolean;
  onSave: (data: any) => void;
  onCancel: () => void;
}

// Định dạng ngày từ yyyy-MM-dd sang dd/MM/yyyy
const formatDateToDisplay = (dateString: string | undefined): string => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  } catch (error) {
    return dateString;
  }
};

// Định dạng ngày từ dd/MM/yyyy sang yyyy-MM-dd (nếu cần) cho API
const formatDateForApi = (displayDate: string): string => {
  if (!displayDate || displayDate.trim() === '') return '';
  
  // Nếu đã đúng định dạng yyyy-MM-dd, trả về nguyên bản
  if (/^\d{4}-\d{2}-\d{2}$/.test(displayDate)) return displayDate;
  
  try {
    // Parse date từ định dạng dd/MM/yyyy
    const parts = displayDate.split('/');
    if (parts.length !== 3) return displayDate;
    
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Tháng trong JS bắt đầu từ 0
    const year = parseInt(parts[2], 10);
    
    const date = new Date(year, month, day);
    if (isNaN(date.getTime())) return displayDate;
    
    // Format lại theo định dạng yyyy-MM-dd
    return date.toISOString().split('T')[0];
  } catch (error) {
    return displayDate;
  }
};

// API để cập nhật role của người dùng
const updateUserRole = async (email: string, roleName: string): Promise<boolean> => {
  try {
    const response = await api.post<ApiResponse<boolean>>('/auth/assign-role', {
      email,
      roleName
    });

    if (response.data?.isValid) {
      toast({
        title: "Thành công",
        description: `Đã cập nhật vai trò thành ${roleName}`,
        variant: "default",
      });
      return true;
    } else {
      toast({
        title: "Lỗi",
        description: response.data?.message || "Không thể cập nhật vai trò người dùng",
        variant: "destructive",
      });
      return false;
    }
  } catch (error: any) {
    console.error('Lỗi khi cập nhật role người dùng:', error);
    toast({
      title: "Lỗi",
      description: error.message || "Không thể cập nhật vai trò người dùng",
      variant: "destructive",
    });
    return false;
  }
};

export function UserEditForm({ user, isSubmitting, onSave, onCancel }: UserEditFormProps) {
  const [formData, setFormData] = useState({
    userName: '',
    password: '',
    fullName: '',
    email: '',
    phoneNumber: '',
    gender: 'Male',
    dateOfBirth: '',
    status: 'Active',
    roleName: 'Student',
    avatar: ''
  });
  
  const [initialRole, setInitialRole] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Cập nhật dữ liệu form khi user thay đổi
  useEffect(() => {
    if (user) {
      const role = user.roleName || 'Student';
      setInitialRole(role);
      
      setFormData({
        userName: user.userName || '',
        password: '', // Password không được hiển thị khi chỉnh sửa
        fullName: user.fullName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        gender: user.gender || 'Male',
        dateOfBirth: formatDateToDisplay(user.dateOfBirth),
        status: user.status || 'Active',
        roleName: role,
        avatar: user.avatar || ''
      });
    } else {
      setInitialRole('Student');
      
      setFormData({
        userName: '',
        password: '',
        fullName: '',
        email: '',
        phoneNumber: '',
        gender: 'Male',
        dateOfBirth: '',
        status: 'Active',
        roleName: 'Student',
        avatar: ''
      });
    }
  }, [user]);
  
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSubmit = async () => {
    // Chuyển đổi định dạng ngày về chuẩn API trước khi gửi
    const apiFormData = {
      ...formData,
      dateOfBirth: formatDateForApi(formData.dateOfBirth),
      username: formData.userName, // Để phù hợp với API
      fullname: formData.fullName, // Để phù hợp với API
      // Đảm bảo các trường khác cũng phù hợp với API
      avatar: formData.avatar || undefined
    };
    
    try {
      // Gọi API cập nhật thông tin người dùng
      onSave(apiFormData);

      // Kiểm tra xem role có thay đổi không
      if (user && formData.roleName !== initialRole) {
        console.log(`Vai trò đã thay đổi từ ${initialRole} thành ${formData.roleName}. Đang cập nhật...`);
        
        // Nếu có thay đổi, gọi API cập nhật role
        await updateUserRole(formData.email, formData.roleName);
      }
    } catch (error) {
      console.error('Lỗi khi xử lý cập nhật:', error);
    }
  };
  
  return (
    <div className="space-y-4 py-2">
      {/* Tên đăng nhập - Chỉ hiển thị khi thêm mới */}
      {!user && (
        <div className="grid gap-2">
          <Label htmlFor="userName" className="text-sm font-medium">Tên đăng nhập</Label>
          <Input 
            id="userName" 
            value={formData.userName} 
            onChange={(e) => handleChange('userName', e.target.value)} 
          />
        </div>
      )}
      
      {/* Mật khẩu - Chỉ hiển thị khi thêm mới */}
      {!user && (
        <div className="grid gap-2">
          <Label htmlFor="password" className="text-sm font-medium">Mật khẩu</Label>
          <div className="relative">
            <Input 
              id="password" 
              type={showPassword ? "text" : "password"} 
              value={formData.password} 
              onChange={(e) => handleChange('password', e.target.value)} 
            />
            <button 
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOffIcon className="h-4 w-4" />
              ) : (
                <EyeIcon className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      )}
      
      <div className="grid gap-2">
        <Label htmlFor="fullName" className="text-sm font-medium">Họ và tên</Label>
        <Input 
          id="fullName" 
          value={formData.fullName} 
          onChange={(e) => handleChange('fullName', e.target.value)} 
        />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="email" className="text-sm font-medium">Email</Label>
        <Input 
          id="email" 
          type="email" 
          value={formData.email} 
          onChange={(e) => handleChange('email', e.target.value)} 
        />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="phoneNumber" className="text-sm font-medium">Số điện thoại</Label>
        <Input 
          id="phoneNumber" 
          value={formData.phoneNumber} 
          onChange={(e) => handleChange('phoneNumber', e.target.value)} 
        />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="gender" className="text-sm font-medium">Giới tính</Label>
        <Select value={formData.gender} onValueChange={(value) => handleChange('gender', value)}>
          <SelectTrigger id="gender">
            <SelectValue placeholder="Chọn giới tính" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Male">Nam</SelectItem>
            <SelectItem value="Female">Nữ</SelectItem>
            <SelectItem value="Other">Khác</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="dateOfBirth" className="text-sm font-medium">Ngày sinh (DD/MM/YYYY)</Label>
        <Input 
          id="dateOfBirth" 
          value={formData.dateOfBirth} 
          onChange={(e) => handleChange('dateOfBirth', e.target.value)} 
          placeholder="15/05/2009"
        />
      </div>

      {/* Vai trò người dùng */}
      <div className="grid gap-2">
        <Label htmlFor="roleName" className="text-sm font-medium">Vai trò</Label>
        <Select value={formData.roleName} onValueChange={(value) => handleChange('roleName', value)}>
          <SelectTrigger id="roleName">
            <SelectValue placeholder="Chọn vai trò" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Student">Học sinh</SelectItem>
            <SelectItem value="Teacher">Giáo viên</SelectItem>
            <SelectItem value="Parent">Phụ huynh</SelectItem>
            <SelectItem value="Admin">Quản trị viên</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="status" className="text-sm font-medium">Trạng thái</Label>
        <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
          <SelectTrigger id="status">
            <SelectValue placeholder="Chọn trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Active">Hoạt động</SelectItem>
            <SelectItem value="Inactive">Không hoạt động</SelectItem>
            <SelectItem value="Pending">Chờ xác nhận</SelectItem>
            <SelectItem value="Bannned">Đã khóa</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button 
          type="button" 
          onClick={handleSubmit} 
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
              <span>Đang xử lý...</span>
            </>
          ) : (
            user ? 'Cập nhật' : 'Thêm mới'
          )}
        </Button>
      </DialogFooter>
    </div>
  );
} 