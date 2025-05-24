'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from 'lucide-react'
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { UserService } from "@/lib/api/user"
import { UserDTO } from "@/lib/api/auth"
import { ProfileForm, PasswordForm } from "@/components/common/profile"

/**
 * Component hiển thị profile card bao gồm thông tin cá nhân và đổi mật khẩu
 */
export function Profile() {
  const { userData: authUserData } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [avatarUrl, setAvatarUrl] = useState('/avatars/default.png');
  const [apiUserData, setApiUserData] = useState<UserDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dữ liệu người dùng từ API khi component mount hoặc khi userID thay đổi
  useEffect(() => {
    const fetchUserData = async () => {
      if (!authUserData?.userID) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Lấy thông tin người dùng từ API
        const userDataFromApi = await UserService.getUserById(authUserData.userID);
        
        if (userDataFromApi) {
          // Cập nhật state với dữ liệu mới nhất từ API
          setApiUserData(userDataFromApi);
          setAvatarUrl(userDataFromApi.avatar || '/avatars/default.png');
        }
      } catch (error: any) {
        setError(error.message || 'Không thể tải thông tin người dùng từ API');
        
        // Sử dụng dữ liệu từ context như là fallback
        if (authUserData) {
          setApiUserData(authUserData);
          setAvatarUrl(authUserData.avatar || '/avatars/default.png');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [authUserData]);

  // Hiển thị trạng thái loading khi đang tải dữ liệu
  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl w-full flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Đang tải thông tin người dùng...</p>
      </div>
    );
  }

  // Rest of the component...
}