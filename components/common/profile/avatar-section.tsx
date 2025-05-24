'use client';

import { getAvatarFallbackText } from './profile-utils';
import { AvatarUploader } from "@/components/ui/avatar-uploader";
import { Badge } from "@/components/ui/badge";
import { ShieldCheckIcon, ShieldAlertIcon } from 'lucide-react';
import { UserDTO } from "@/lib/api/auth";
import { useState, useEffect } from 'react';

interface AvatarSectionProps {
  avatarUrl: string;
  userData: UserDTO | null;
  onAvatarChange: (newAvatarUrl: string) => Promise<void>;
}

/**
 * Component hiển thị avatar và trạng thái tài khoản
 */
export function AvatarSection({ avatarUrl, userData, onAvatarChange }: AvatarSectionProps) {
  // State local để tránh lỗi khi avatarUrl thay đổi
  const [currentAvatar, setCurrentAvatar] = useState(avatarUrl || '/avatars/default.png');
  
  // Cập nhật currentAvatar khi avatarUrl từ props thay đổi
  useEffect(() => {
    if (avatarUrl && avatarUrl !== currentAvatar) {
      setCurrentAvatar(avatarUrl);
    }
  }, [avatarUrl, currentAvatar]);
  
  // Xử lý thay đổi avatar an toàn
  const handleAvatarChange = async (newAvatarUrl: string) => {
    try {
      // Cập nhật state local trước
      setCurrentAvatar(newAvatarUrl);
      // Gọi callback từ component cha
      await onAvatarChange(newAvatarUrl);
    } catch (error) {
      console.error("Lỗi khi cập nhật avatar:", error);
      // Nếu có lỗi, quay lại avatar cũ
      setCurrentAvatar(avatarUrl);
    }
  };

  // Helper function hiển thị trạng thái tài khoản
  const renderAccountStatus = () => {
    if (userData?.status === 'Active') {
      return (
        <div className="flex items-center gap-2">
          <ShieldCheckIcon className="h-5 w-5 text-green-500" />
          <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
            Đã xác minh
          </Badge>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-2">
          <ShieldAlertIcon className="h-5 w-5 text-yellow-500" />
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50">
            Chưa xác minh
          </Badge>
        </div>
      );
    }
  };

  return (
    <div className="flex flex-col items-center mb-6">
      <div className="flex flex-col items-center">
        <AvatarUploader 
          currentAvatar={currentAvatar} 
          fallbackText={getAvatarFallbackText(userData?.fullName, userData?.userName)} 
          size="xl"
          onAvatarChange={handleAvatarChange}
          userId={userData?.userID}
        />
        <p className="mt-2 text-sm text-muted-foreground">
          Nhấp vào biểu tượng để thay đổi ảnh đại diện
        </p>
        <div className="mt-2">
          {renderAccountStatus()}
        </div>
      </div>
    </div>
  );
} 