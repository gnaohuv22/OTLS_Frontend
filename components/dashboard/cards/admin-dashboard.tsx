'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  UserPlus, 
  School, 
  Users, 
  BookOpen,
  AlertCircle,
  FileText,
  Library,
  CalendarOff,
  Settings,
  ChevronRight,
  Shield,
  BarChart4,
  TrendingUp,
  Activity,
  Database
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

// Management shortcuts data
const managementShortcuts = [
  {
    title: "Quản lý tài khoản",
    description: "Quản lý người dùng và phân quyền",
    href: "/admin/accounts",
    icon: Users,
    category: "Người dùng"
  },
  {
    title: "Quản lý lớp học", 
    description: "Quản lý lớp học và học sinh",
    href: "/admin/classes",
    icon: School,
    category: "Giáo dục"
  },
  {
    title: "Quản lý môn học",
    description: "Quản lý danh mục môn học",
    href: "/admin/subjects",
    icon: BookOpen,
    category: "Giáo dục"
  },
  {
    title: "Quản lý bài tập",
    description: "Quản lý và theo dõi bài tập",
    href: "/admin/assignments",
    icon: FileText,
    category: "Giáo dục"
  },
  {
    title: "Quản lý tài nguyên",
    description: "Quản lý tài liệu và tài nguyên học tập",
    href: "/admin/resources",
    icon: Library,
    category: "Giáo dục"
  },
  {
    title: "Quản lý ngày nghỉ lễ",
    description: "Quản lý lịch nghỉ và sự kiện",
    href: "/admin/holidays",
    icon: CalendarOff,
    category: "Hệ thống"
  },
  {
    title: "Cài đặt hệ thống",
    description: "Cấu hình và tùy chỉnh hệ thống",
    href: "/settings",
    icon: Settings,
    category: "Hệ thống"
  }
];

// Quick access shortcuts for overview
const quickAccessShortcuts = [
  {
    title: "Tài khoản",
    description: "Quản lý người dùng",
    href: "/admin/accounts",
    icon: Users,
    color: "bg-blue-500"
  },
  {
    title: "Lớp học",
    description: "Quản lý lớp học",
    href: "/admin/classes",
    icon: School,
    color: "bg-green-500"
  },
  {
    title: "Bài tập",
    description: "Quản lý bài tập",
    href: "/admin/assignments",
    icon: FileText,
    color: "bg-purple-500"
  },
  {
    title: "Tài nguyên",
    description: "Quản lý tài nguyên",
    href: "/admin/resources",
    icon: Library,
    color: "bg-orange-500"
  }
];

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const router = useRouter();

  const handleShortcutClick = (href: string) => {
    router.push(href);
  };

  return (
    <div className="flex min-h-screen">
      
      {/* Main Content */}
      <div className="flex-1 pl-14 pt-6 pb-16 pr-4 md:pr-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Bảng điều khiển quản trị</h1>
              <p className="text-muted-foreground">
                Trung tâm quản lý và điều hướng tất cả các chức năng quản trị OTLS
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1" onClick={() => router.push('/admin/accounts')}>
                <UserPlus className="h-4 w-4" />
                <span>Thêm người dùng</span>
              </Button>
            </div>
          </div>

          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Tổng quan</TabsTrigger>
              <TabsTrigger value="management">Quản lý chi tiết</TabsTrigger>
              <TabsTrigger value="system">Hệ thống</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickAccessShortcuts.map((shortcut) => {
                  const IconComponent = shortcut.icon;
                  return (
                    <Card 
                      key={shortcut.href}
                      className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-2 hover:border-primary/20"
                      onClick={() => handleShortcutClick(shortcut.href)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className={`p-3 rounded-lg ${shortcut.color} text-white`}>
                            <IconComponent className="h-6 w-6" />
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-1">
                          <h3 className="font-semibold text-lg">{shortcut.title}</h3>
                          <p className="text-sm text-muted-foreground">{shortcut.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      Chức năng quản trị chính
                    </CardTitle>
                    <CardDescription>
                      Truy cập nhanh các chức năng quản lý quan trọng
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button 
                        variant="outline" 
                        className="w-full justify-start h-auto p-3"
                        onClick={() => router.push('/admin/accounts')}
                      >
                        <Users className="mr-3 h-4 w-4" />
                        <div className="text-left">
                          <div className="font-medium">Quản lý tài khoản</div>
                          <div className="text-xs text-muted-foreground">Quản lý người dùng và phân quyền</div>
                        </div>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="w-full justify-start h-auto p-3"
                        onClick={() => router.push('/admin/classes')}
                      >
                        <School className="mr-3 h-4 w-4" />
                        <div className="text-left">
                          <div className="font-medium">Quản lý lớp học</div>
                          <div className="text-xs text-muted-foreground">Quản lý lớp học và học sinh</div>
                        </div>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="w-full justify-start h-auto p-3"
                        onClick={() => router.push('/admin/subjects')}
                      >
                        <BookOpen className="mr-3 h-4 w-4" />
                        <div className="text-left">
                          <div className="font-medium">Quản lý môn học</div>
                          <div className="text-xs text-muted-foreground">Quản lý danh mục môn học</div>
                        </div>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Quản lý nội dung học tập
                    </CardTitle>
                    <CardDescription>
                      Quản lý bài tập, tài nguyên và nội dung giáo dục
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button 
                        variant="outline" 
                        className="w-full justify-start h-auto p-3"
                        onClick={() => router.push('/admin/assignments')}
                      >
                        <FileText className="mr-3 h-4 w-4" />
                        <div className="text-left">
                          <div className="font-medium">Quản lý bài tập</div>
                          <div className="text-xs text-muted-foreground">Quản lý và theo dõi bài tập</div>
                        </div>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="w-full justify-start h-auto p-3"
                        onClick={() => router.push('/admin/resources')}
                      >
                        <Library className="mr-3 h-4 w-4" />
                        <div className="text-left">
                          <div className="font-medium">Quản lý tài nguyên</div>
                          <div className="text-xs text-muted-foreground">Quản lý tài liệu học tập</div>
                        </div>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="w-full justify-start h-auto p-3"
                        onClick={() => router.push('/admin/holidays')}
                      >
                        <CalendarOff className="mr-3 h-4 w-4" />
                        <div className="text-left">
                          <div className="font-medium">Quản lý ngày nghỉ</div>
                          <div className="text-xs text-muted-foreground">Quản lý lịch nghỉ lễ</div>
                        </div>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="management" className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {managementShortcuts.map((shortcut) => {
                    const IconComponent = shortcut.icon;
                    return (
                      <Card 
                        key={shortcut.href}
                        className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
                        onClick={() => handleShortcutClick(shortcut.href)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <IconComponent className="h-8 w-8 text-primary" />
                            <div className="text-right">
                              <div className="text-xs text-muted-foreground">{shortcut.category}</div>
                              <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
                            </div>
                          </div>
                          <CardTitle className="text-lg">{shortcut.title}</CardTitle>
                          <CardDescription>{shortcut.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Button variant="outline" className="w-full" size="sm">
                            Truy cập ngay
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="system" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Cài đặt hệ thống
                    </CardTitle>
                    <CardDescription>
                      Cấu hình và tùy chỉnh hệ thống OTLS
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => router.push('/settings')}
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Cài đặt chung
                      </Button>
                      <p className="text-sm text-muted-foreground">
                        Truy cập vào trang cài đặt để tùy chỉnh giao diện, các cấu hình hệ thống sẽ được phát triển.
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart4 className="h-5 w-5" />
                      Báo cáo & Thống kê
                    </CardTitle>
                    <CardDescription>
                      Xem các báo cáo và thống kê hệ thống
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="p-3 border rounded-lg">
                          <Database className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                          <div className="text-sm font-medium">Hệ thống</div>
                          <div className="text-xs text-muted-foreground">Hoạt động tốt</div>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <Activity className="h-6 w-6 mx-auto mb-2 text-green-500" />
                          <div className="text-sm font-medium">Hiệu suất</div>
                          <div className="text-xs text-muted-foreground">Ổn định</div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Các báo cáo chi tiết sẽ được triển khai trong các phiên bản tương lai.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
} 