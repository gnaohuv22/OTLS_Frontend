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
  }, [authUserData?.userID, authUserData]);

  // Hiển thị trạng thái loading khi đang tải dữ liệu
  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl w-full flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Đang tải thông tin người dùng...</p>
      </div>
    );
  }

  // Hiển thị lỗi nếu có
  if (error && !apiUserData && !authUserData) {
    return (
      <div className="container mx-auto max-w-4xl w-full">
        <div>
          <h1 className="text-2xl font-bold">Hồ sơ của tôi</h1>
          <p className="text-muted-foreground text-red-500">
            {error}
          </p>
        </div>
      </div>
    );
  }

  // Nếu không có dữ liệu người dùng
  if (!apiUserData && !authUserData) {
    return (
      <div className="container mx-auto max-w-4xl w-full">
        <div>
          <h1 className="text-2xl font-bold">Hồ sơ của tôi</h1>
          <p className="text-muted-foreground">
            Không tìm thấy thông tin người dùng
          </p>
        </div>
      </div>
    );
  }

  // Sử dụng dữ liệu từ API nếu có, nếu không thì sử dụng dữ liệu từ context
  const currentUserData = apiUserData || authUserData;

  return (
    <div className="container mx-auto max-w-4xl w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Hồ sơ của tôi</h1>
        <p className="text-muted-foreground">
          Quản lý thông tin cá nhân và tài khoản của bạn
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="profile">Thông tin cá nhân</TabsTrigger>
          <TabsTrigger value="password">Đổi mật khẩu</TabsTrigger>
        </TabsList>

        <div className="w-full min-h-[600px]">
          <TabsContent value="profile" className="space-y-4 w-full">
            <Card className="w-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Thông tin cá nhân</CardTitle>
                    <CardDescription>
                      Cập nhật thông tin cá nhân của bạn
                    </CardDescription>
                  </div>
                  <Button
                    variant={isEditing ? "outline" : "default"}
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? 'Hủy' : 'Sửa thông tin'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ProfileForm
                  userData={currentUserData}
                  isEditing={isEditing}
                  setIsEditing={setIsEditing}
                  avatarUrl={avatarUrl}
                  setAvatarUrl={setAvatarUrl}
                  setApiUserData={setApiUserData}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="password" className="space-y-4 w-full">
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Đổi mật khẩu</CardTitle>
                <CardDescription>
                  Thay đổi mật khẩu để bảo vệ tài khoản của bạn
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <PasswordForm />
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
} 