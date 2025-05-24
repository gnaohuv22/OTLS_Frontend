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
import { Bell, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { UserNav } from "@/components/common/layout/user-nav";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useState, useEffect } from "react";

// Interface cho thông báo
interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// Interface cho tin nhắn
interface Message {
  id: string;
  sender: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export function Header() {
  const { userData, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  
  // Thêm console.log để debug thông tin người dùng
  useEffect(() => {
    if (isAuthenticated) {
    } else {
    }
  }, [userData, isAuthenticated]);
  
  useEffect(() => {
    setNotifications([
      {
        id: '1',
        title: 'Tính năng chưa được hỗ trợ',
        message: 'Tính năng thông báo chưa thể phát triển do một vài vấn đề.',
        isRead: false,
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Chúng em sẽ phát triển tính năng này trong tương lai',
        message: 'Do hạn chế về kinh nghiệm, trình độ, tính năng này được tạm loại bỏ khỏi scope của dự án lần này.',
        isRead: true,
        createdAt: new Date().toISOString()
      }
    ]);

    setMessages([
      {
        id: '1',
        sender: 'Vũ Huy Hoàng',
        message: 'Frontend Developer, một phần nhỏ Backend, review database,...',
        isRead: true,
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        sender: 'Đào Quang Duy',
        message: 'Backend Developer là tôi này, tôi cũng sửa một ít database nữa đó',
        isRead: false,
        createdAt: new Date().toISOString()
      }
    ]);
  }, []);

  const unreadNotificationCount = notifications.filter(n => !n.isRead).length;
  const unreadMessageCount = messages.filter(m => !m.isRead).length;
  
  // Kiểm tra xem người dùng đã đăng nhập chưa và hiển thị các biểu tượng tương ứng
  const renderAuthenticatedUI = () => {
    if (isAuthenticated === null) {
      // Đang kiểm tra trạng thái xác thực
      return null;
    }
    
    if (isAuthenticated) {
      return (
        <>
          {/* Chat Shortcut */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <MessageSquare className="h-5 w-5" />
                {unreadMessageCount > 0 && (
                  <Badge 
                    className="absolute -top-1 -right-1 h-5 w-5 justify-center" 
                    variant="secondary"
                  >
                    {unreadMessageCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Tin nhắn</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {messages.length > 0 ? (
                messages.map((message) => (
                  <DropdownMenuItem key={message.id} className="flex items-start gap-3 p-4">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={`/avatars/user${message.id}.png`} alt={message.sender} />
                      <AvatarFallback>{message.sender.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-1">
                      <div className="flex w-full items-center justify-between">
                        <span className="font-medium">{message.sender}</span>
                        {!message.isRead && <Badge variant="secondary" className="ml-2">Mới</Badge>}
                      </div>
                      <span className="text-sm text-muted-foreground truncate">{message.message}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(message.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </DropdownMenuItem>
                ))
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  Không có tin nhắn nào
                </div>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="w-full text-center" asChild>
                <Link href="/chat">
                  <Button variant="ghost" className="w-full">Xem tất cả tin nhắn</Button>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadNotificationCount > 0 && (
                  <Badge 
                    className="absolute -top-1 -right-1 h-5 w-5 justify-center" 
                    variant="destructive"
                  >
                    {unreadNotificationCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Thông báo</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <DropdownMenuItem key={notification.id} className="flex flex-col items-start gap-1 p-4">
                    <div className="flex w-full items-center justify-between">
                      <span className="font-medium">{notification.title}</span>
                      {!notification.isRead && (
                        <Badge variant="secondary" className="ml-2">Mới</Badge>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">{notification.message}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(notification.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </DropdownMenuItem>
                ))
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  Không có thông báo nào
                </div>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="w-full text-center" asChild>
                <Link href="/notifications">
                  <Button variant="ghost" className="w-full">Xem tất cả thông báo</Button>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      );
    }
    
    return null;
  };
  
  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4 w-full">
        <div className="flex-1" />
        <div className="flex items-center gap-4">
          <ThemeToggle />
          
          {renderAuthenticatedUI()}
          
          <UserNav />
        </div>
      </div>
    </header>
  );
} 