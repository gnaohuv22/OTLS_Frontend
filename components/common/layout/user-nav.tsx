"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";

export function UserNav() {
  const router = useRouter();
  const { logout, userData, role, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      // Gọi hàm đăng xuất từ context
      logout();
      
      // Hiển thị thông báo thành công
      toast({
        title: "Đăng xuất thành công",
        description: "Cảm ơn bạn đã sử dụng hệ thống. Hẹn gặp lại!",
        duration: 3000,
      });
      
      // // Tải lại trang để đảm bảo mọi state đều được làm mới
      // setTimeout(() => {
      //   window.location.href = '/';
      // }, 300);
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
      
      toast({
        variant: "destructive",
        title: "Đăng xuất thất bại",
        description: "Đã xảy ra lỗi khi đăng xuất. Vui lòng thử lại sau.",
        duration: 3000,
      });
    }
  };

  // Hiển thị menu đăng nhập/đăng ký nếu chưa đăng nhập
  if (!isAuthenticated) {
    return (
      <div className="flex gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href="/login">Đăng nhập</Link>
        </Button>
        <Button size="sm" asChild>
          <Link href="/register">Đăng ký</Link>
        </Button>
      </div>
    );
  }

  // Hiển thị thông tin người dùng đã đăng nhập
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
          <Avatar>
            <AvatarImage 
              src={userData?.avatar || `/avatars/default.png`} 
              alt={userData?.fullName || "User"} 
            />
            <AvatarFallback>
              {userData?.fullName?.charAt(0) || userData?.userName?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userData?.fullName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {userData?.email}
            </p>
            <p className="text-xs leading-none text-muted-foreground mt-1">
              {role === 'Teacher' ? 'Giáo viên' : role === 'Student' ? 'Học sinh' : role === 'Parent' ? 'Phụ huynh' : 'Quản trị viên'}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/profile")}>
          <User className="mr-2 h-4 w-4" />
          <span>Hồ sơ</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Đăng xuất</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}