'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  PlusCircle, 
  BookOpen, 
  CalendarClock, 
  ClipboardList, 
  Users, 
  MessageCircle,
  Eye,
  Info,
  School,
  Star,
  GraduationCap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';

export function ParentDashboard() {
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [childFilters, setChildFilters] = useState<{[key: number]: boolean}>({
    1: true, // Mặc định hiển thị tất cả các con
    2: true
  });
  
  // Dữ liệu giả cho học sinh
  const children = [
    {
      id: 1,
      name: "Nguyễn Minh Anh",
      avatar: "/avatars/child-1.jpg",
      grade: "Lớp 3",
      teacher: "Cô Lan",
      age: "8 tuổi",
      dob: "12/05/2016",
      class: "3A",
      school: "Tiểu học Nguyễn Bỉnh Khiêm",
      attendance: "90%",
      awards: ["Học sinh giỏi toán", "Học sinh tiêu biểu tháng 3"],
      upcomingAssignments: 2,
      upcomingLessons: 3,
      previousResults: [
        { subject: "Toán", score: "9/10", comment: "Rất tốt" },
        { subject: "Tiếng Việt", score: "8/10", comment: "Cần cải thiện phần viết" },
        { subject: "Tiếng Anh", score: "10/10", comment: "Xuất sắc" }
      ]
    },
    {
      id: 2,
      name: "Nguyễn Hoàng Minh",
      avatar: "/avatars/child-2.jpg",
      grade: "Lớp 1",
      teacher: "Cô Hoa",
      age: "6 tuổi",
      dob: "20/08/2018",
      class: "1B",
      school: "Tiểu học Nguyễn Bỉnh Khiêm",
      attendance: "95%",
      awards: ["Học sinh ngoan tháng 2"],
      upcomingAssignments: 1,
      upcomingLessons: 2,
      previousResults: [
        { subject: "Toán", score: "8/10", comment: "Cần cải thiện phép tính" },
        { subject: "Tiếng Việt", score: "9/10", comment: "Đọc lưu loát" }
      ]
    }
  ];

  // Dữ liệu giả cho thời khóa biểu
  const schedule = [
    {
      id: 1,
      childName: "Nguyễn Minh Anh",
      subject: "Toán học",
      day: "Thứ Hai",
      time: "15:00 - 16:30",
      teacher: "Cô Lan"
    },
    {
      id: 2,
      childName: "Nguyễn Minh Anh",
      subject: "Tiếng Anh",
      day: "Thứ Ba",
      time: "14:00 - 15:30",
      teacher: "Thầy Hùng"
    },
    {
      id: 3,
      childName: "Nguyễn Hoàng Minh",
      subject: "Tiếng Việt",
      day: "Thứ Tư",
      time: "15:00 - 16:00",
      teacher: "Cô Hoa"
    },
    {
      id: 4,
      childName: "Nguyễn Hoàng Minh",
      subject: "Tự nhiên và Xã hội",
      day: "Thứ Năm",
      time: "14:30 - 16:00",
      teacher: "Cô Mai"
    }
  ];

  // Dữ liệu giả cho bài tập
  const assignments = [
    {
      id: 1,
      childName: "Nguyễn Minh Anh",
      title: "Bài tập về nhà Toán",
      subject: "Toán học",
      dueDate: "20/04/2023",
      status: "Chưa nộp"
    },
    {
      id: 2,
      childName: "Nguyễn Minh Anh",
      title: "Bài tập về nhà Tiếng Anh",
      subject: "Tiếng Anh",
      dueDate: "21/04/2023",
      status: "Đã chấm",
      score: "9/10",
      feedback: "Bài làm tốt, cần chú ý lỗi chính tả trong phần viết."
    },
    {
      id: 3,
      childName: "Nguyễn Hoàng Minh",
      title: "Bài tập Tiếng Việt",
      subject: "Tiếng Việt",
      dueDate: "22/04/2023",
      status: "Chưa nộp"
    },
    {
      id: 4,
      childName: "Nguyễn Hoàng Minh",
      title: "Bài tập Toán tuần 8",
      subject: "Toán",
      dueDate: "18/04/2023",
      status: "Đã chấm",
      score: "8/10",
      feedback: "Cần cải thiện phần giải toán có lời văn, trình bày rõ ràng hơn."
    }
  ];
  
  // Dữ liệu giả cho thông báo
  const notifications = [
    {
      id: 1,
      title: "Họp phụ huynh",
      message: "Buổi họp phụ huynh sẽ diễn ra vào ngày 25/04/2023 tại phòng họp chính của trường. Mong quý phụ huynh sắp xếp thời gian tham dự đầy đủ.",
      time: "3 giờ trước",
      date: "18/04/2023",
      source: "Nhà trường",
      priority: "Cao"
    },
    {
      id: 2,
      title: "Bài kiểm tra Toán",
      message: "Nguyễn Minh Anh có bài kiểm tra Toán vào ngày 22/04/2023. Phụ huynh vui lòng nhắc nhở con ôn tập.",
      time: "5 giờ trước",
      date: "18/04/2023",
      source: "Cô Lan - Giáo viên Toán",
      forChild: "Nguyễn Minh Anh",
      priority: "Thông thường"
    },
    {
      id: 3,
      title: "Hoạt động ngoại khóa",
      message: "Trường sẽ tổ chức hoạt động ngoại khóa vào ngày 29/04/2023. Chi phí: 150,000đ. Phụ huynh vui lòng đăng ký và đóng phí trước ngày 25/04.",
      time: "1 ngày trước",
      date: "17/04/2023",
      source: "Nhà trường",
      priority: "Thông thường"
    },
    {
      id: 4,
      title: "Thông báo nghỉ học",
      message: "Lớp 1B sẽ nghỉ học vào ngày mai (19/04/2023) do phòng học đang được sửa chữa. Lịch học sẽ được bù vào thứ Bảy.",
      time: "12 giờ trước",
      date: "18/04/2023",
      source: "Cô Hoa - Giáo viên chủ nhiệm",
      forChild: "Nguyễn Hoàng Minh",
      priority: "Cao"
    },
    {
      id: 5,
      title: "Kết quả học tập Học kỳ 1",
      message: "Kết quả học tập Học kỳ 1 của các học sinh đã được cập nhật. Phụ huynh vui lòng vào mục 'Kết quả học tập' để xem chi tiết.",
      time: "2 ngày trước",
      date: "16/04/2023",
      source: "Nhà trường",
      priority: "Thông thường"
    }
  ];

  // Dữ liệu giả cho giáo viên chủ nhiệm
  const homeRoomTeachers = [
    {
      id: 1,
      name: "Cô Lan",
      avatar: "/avatars/teacher-1.jpg",
      class: "3A",
      subject: "Giáo viên chủ nhiệm",
      forChild: "Nguyễn Minh Anh",
      phone: "0912345678",
      email: "colan@school.edu.vn"
    },
    {
      id: 2,
      name: "Cô Hoa",
      avatar: "/avatars/teacher-3.jpg",
      class: "1B",
      subject: "Giáo viên chủ nhiệm",
      forChild: "Nguyễn Hoàng Minh",
      phone: "0987654321",
      email: "cohoa@school.edu.vn"
    }
  ];

  // Lọc dữ liệu dựa trên childFilters
  const filteredChildren = children.filter(child => childFilters[child.id]);
  const filteredSchedule = schedule.filter(item => 
    filteredChildren.some(child => child.name === item.childName)
  );
  const filteredAssignments = assignments.filter(item => 
    filteredChildren.some(child => child.name === item.childName)
  );
  const filteredNotifications = notifications.filter(notification => 
    !notification.forChild || 
    filteredChildren.some(child => child.name === notification.forChild)
  );
  const filteredTeachers = homeRoomTeachers.filter(teacher => 
    filteredChildren.some(child => child.name === teacher.forChild)
  );

  // Hàm xử lý khi checkbox thay đổi
  const handleFilterChange = (childId: number) => {
    setChildFilters(prev => {
      // Tạo bản sao của trạng thái trước đó
      const newFilters = { ...prev };
      
      // Đảo ngược trạng thái của checkbox được chọn
      newFilters[childId] = !newFilters[childId];
      
      // Kiểm tra nếu tất cả đều bị uncheck, thì bật lại checkbox được click
      // Đảm bảo luôn có ít nhất một con được hiển thị
      if (Object.values(newFilters).every(value => !value)) {
        newFilters[childId] = true;
      }
      
      return newFilters;
    });
  };

  // Modal xem chi tiết học sinh
  const ChildDetailModal = ({ child }: { child: any }) => {
    if (!child) return null;
    
    return (
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Thông tin chi tiết</DialogTitle>
          <DialogDescription>
            Thông tin chi tiết về học sinh {child.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
          <div className="col-span-1">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex flex-col items-center space-y-2">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={child.avatar} alt={child.name} />
                    <AvatarFallback>{child.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <h3 className="text-lg font-bold">{child.name}</h3>
                    <p className="text-sm text-muted-foreground">{child.grade} ({child.class})</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm font-medium">Tuổi:</div>
                  <div className="text-sm">{child.age}</div>

                  <div className="text-sm font-medium">Ngày sinh:</div>
                  <div className="text-sm">{child.dob}</div>
                  
                  <div className="text-sm font-medium">Trường:</div>
                  <div className="text-sm">{child.school}</div>
                  
                  <div className="text-sm font-medium">Điểm danh:</div>
                  <div className="text-sm">{child.attendance}</div>
                  
                  <div className="text-sm font-medium">GVCN:</div>
                  <div className="text-sm">{child.teacher}</div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="col-span-1 md:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-md flex items-center">
                  <Star className="mr-2 h-5 w-5" />
                  Thành tích và kết quả gần đây
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Thành tích:</h4>
                  <div className="flex flex-wrap gap-2">
                    {child.awards.map((award: string, index: number) => (
                      <Badge key={index} variant="secondary">{award}</Badge>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium mb-2">Kết quả học tập gần đây:</h4>
                  <div className="space-y-2">
                    {child.previousResults.map((result: any, index: number) => (
                      <div key={index} className="rounded-lg border p-3">
                        <div className="flex justify-between">
                          <div className="font-medium">{result.subject}</div>
                          <div>{result.score}</div>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">{result.comment}</div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col items-center justify-center rounded-lg border p-4">
                    <div className="flex items-center text-sm font-medium mb-1">
                      <ClipboardList className="mr-1 h-4 w-4 text-muted-foreground" />
                      Bài tập sắp tới
                    </div>
                    <p className="text-3xl font-bold">{child.upcomingAssignments}</p>
                  </div>
                  <div className="flex flex-col items-center justify-center rounded-lg border p-4">
                    <div className="flex items-center text-sm font-medium mb-1">
                      <CalendarClock className="mr-1 h-4 w-4 text-muted-foreground" />
                      Buổi học sắp tới
                    </div>
                    <p className="text-3xl font-bold">{child.upcomingLessons}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  <GraduationCap className="mr-2 h-4 w-4" />
                  Xem báo cáo học tập đầy đủ
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </DialogContent>
    );
  };

  // Dialog để xem điểm và phản hồi
  const FeedbackDialog = ({ assignment }: { assignment: any }) => {
    return (
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Điểm và phản hồi</DialogTitle>
          <DialogDescription>
            {assignment.title} - {assignment.subject}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-[100px_1fr] items-center gap-2">
            <div className="font-medium">Học sinh:</div>
            <div>{assignment.childName}</div>
            
            <div className="font-medium">Môn học:</div>
            <div>{assignment.subject}</div>
            
            <div className="font-medium">Ngày nộp:</div>
            <div>{assignment.dueDate}</div>
            
            <div className="font-medium">Điểm số:</div>
            <div className="text-lg font-bold">{assignment.score}</div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Nhận xét của giáo viên:</h4>
            <div className="rounded-md border p-3 text-sm">
              {assignment.feedback}
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <Button variant="outline">
            <MessageCircle className="mr-2 h-4 w-4" />
            Gửi tin nhắn cho giáo viên
          </Button>
        </div>
      </DialogContent>
    );
  };

  return (
    <>
      <Tabs defaultValue="overview" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="overview">Tổng quan</TabsTrigger>
            <TabsTrigger value="schedule">Lịch học</TabsTrigger>
            <TabsTrigger value="assignments">Bài tập</TabsTrigger>
            <TabsTrigger value="notifications" className="hidden sm:flex">
              Thông báo
            </TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="h-8 gap-1">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Nhắn tin cho giáo viên
              </span>
            </Button>
          </div>
        </div>

        {/* Thêm bộ lọc chung */}
        <div className="bg-accent/20 rounded-lg p-3 flex flex-wrap items-center gap-4">
          <div className="text-sm font-medium">Lọc theo học sinh:</div>
          {children.map((child) => (
            <div key={child.id} className="flex items-center space-x-2">
              <Checkbox 
                id={`filter-child-${child.id}`} 
                checked={childFilters[child.id]} 
                onCheckedChange={() => handleFilterChange(child.id)}
              />
              <label 
                htmlFor={`filter-child-${child.id}`}
                className="text-sm font-medium flex items-center gap-2 cursor-pointer"
              >
                <Avatar className="h-6 w-6">
                  <AvatarImage src={child.avatar} alt={child.name} />
                  <AvatarFallback>{child.name.charAt(0)}</AvatarFallback>
                </Avatar>
                {child.name}
              </label>
            </div>
          ))}
        </div>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredChildren.map((child) => (
              <Card key={child.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center space-x-2">
                    <Avatar>
                      <AvatarImage src={child.avatar} alt={child.name} />
                      <AvatarFallback>{child.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-sm font-medium">{child.name}</CardTitle>
                      <CardDescription className="text-xs">{child.grade} ({child.class})</CardDescription>
                    </div>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7" 
                        onClick={() => setSelectedChild(child)}
                      >
                        <Info className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <ChildDetailModal child={child} />
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <div className="flex flex-col items-center justify-center rounded-lg border p-2">
                        <div className="flex items-center text-sm font-medium">
                          <ClipboardList className="mr-1 h-4 w-4 text-muted-foreground" />
                          Bài tập
                        </div>
                        <p className="text-2xl font-bold">{child.upcomingAssignments}</p>
                      </div>
                      <div className="flex flex-col items-center justify-center rounded-lg border p-2">
                        <div className="flex items-center text-sm font-medium">
                          <CalendarClock className="mr-1 h-4 w-4 text-muted-foreground" />
                          Buổi học
                        </div>
                        <p className="text-2xl font-bold">{child.upcomingLessons}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <Badge variant="outline" className="mb-1">{child.attendance} điểm danh</Badge>
                      <Badge variant="secondary" className="mb-1">GVCN: {child.teacher}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            <Card>
              <CardHeader>
                <CardTitle className="text-md flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Giáo viên chủ nhiệm
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredTeachers.map((teacher) => (
                    <div key={teacher.id} className="flex items-center justify-between space-x-3 border rounded-lg p-3">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={teacher.avatar} />
                          <AvatarFallback>{teacher.name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{teacher.name}</p>
                          <p className="text-xs text-muted-foreground">{teacher.subject}</p>
                          <p className="text-xs">Lớp {teacher.class} ({teacher.forChild})</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-md flex items-center">
                  <CalendarClock className="mr-2 h-5 w-5" />
                  Lịch học sắp tới
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-4">
                    {filteredSchedule.slice(0, 4).map((item) => (
                      <div key={item.id} className="flex items-start justify-between space-y-0 rounded-lg border p-3">
                        <div>
                          <p className="text-sm font-medium">{item.subject}</p>
                          <p className="text-xs text-muted-foreground">{item.childName}</p>
                          <p className="text-xs">{item.day}, {item.time}</p>
                        </div>
                        <Badge variant="outline">{item.teacher}</Badge>
                      </div>
                    ))}
                    {filteredSchedule.length === 0 && (
                      <div className="text-center py-4 text-muted-foreground">
                        Không có lịch học nào
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-md flex items-center">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Thông báo gần đây
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-4">
                    {filteredNotifications.slice(0, 3).map((notification) => (
                      <div key={notification.id} className="rounded-lg border p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <p className="text-sm font-medium">{notification.title}</p>
                            {notification.priority === "Cao" && (
                              <Badge variant="destructive" className="ml-2">Quan trọng</Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">{notification.time}</span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{notification.message.substring(0, 100)}...</p>
                        <div className="flex justify-between mt-2">
                          <Badge variant="outline" className="text-xs">
                            {notification.source}
                          </Badge>
                          {notification.forChild && (
                            <Badge variant="secondary" className="text-xs">
                              {notification.forChild}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                    {filteredNotifications.length === 0 && (
                      <div className="text-center py-4 text-muted-foreground">
                        Không có thông báo nào
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Lịch học của con</CardTitle>
              <CardDescription>
                Xem lịch học chi tiết của các con
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(70vh-2rem)]">
                <div className="space-y-6">
                  {filteredChildren.map((child) => (
                    <div key={child.id} className="space-y-4">
                      <h3 className="text-md font-medium flex items-center">
                        <Avatar className="h-6 w-6 mr-2">
                          <AvatarImage src={child.avatar} alt={child.name} />
                          <AvatarFallback>{child.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {child.name} - {child.grade}
                      </h3>
                      <div className="rounded-md border">
                        <div className="grid grid-cols-3 gap-2 p-4 font-medium bg-muted/40">
                          <div>Môn học</div>
                          <div>Thời gian</div>
                          <div>Giáo viên</div>
                        </div>
                        {schedule
                          .filter(item => item.childName === child.name)
                          .map((item) => (
                            <div key={item.id} className="grid grid-cols-3 gap-2 p-4 border-t">
                              <div className="font-medium">{item.subject}</div>
                              <div className="text-sm">{item.day}, {item.time}</div>
                              <div className="text-sm">{item.teacher}</div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                  {filteredChildren.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      Không có dữ liệu lịch học
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Bài tập</CardTitle>
              <CardDescription>
                Theo dõi bài tập về nhà và tiến độ hoàn thành của các con
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(70vh-2rem)]">
                <div className="space-y-6">
                  {filteredChildren.map((child) => (
                    <div key={child.id} className="space-y-4">
                      <h3 className="text-md font-medium flex items-center">
                        <Avatar className="h-6 w-6 mr-2">
                          <AvatarImage src={child.avatar} alt={child.name} />
                          <AvatarFallback>{child.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {child.name} - {child.grade}
                      </h3>
                      <div className="rounded-md border">
                        <div className="grid grid-cols-5 gap-2 p-4 font-medium bg-muted/40">
                          <div className="col-span-2">Bài tập</div>
                          <div>Môn học</div>
                          <div>Hạn nộp</div>
                          <div>Trạng thái</div>
                        </div>
                        {assignments
                          .filter(item => item.childName === child.name)
                          .map((item) => (
                            <div key={item.id} className="grid grid-cols-5 gap-2 p-4 border-t">
                              <div className="col-span-2 font-medium">{item.title}</div>
                              <div className="text-sm">{item.subject}</div>
                              <div className="text-sm">{item.dueDate}</div>
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant={
                                    item.status === "Đã chấm" 
                                      ? "outline" 
                                      : item.status === "Chưa nộp" 
                                        ? "destructive" 
                                        : "secondary"
                                  }
                                >
                                  {item.status}
                                </Badge>
                                
                                {item.status === "Đã chấm" && (
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-7 w-7">
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                    </DialogTrigger>
                                    <FeedbackDialog assignment={item} />
                                  </Dialog>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                  {filteredChildren.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      Không có dữ liệu bài tập
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thông báo</CardTitle>
              <CardDescription>
                Các thông báo từ trường học và giáo viên
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(80vh-4rem)]">
                <div className="space-y-4">
                  {filteredNotifications.map((notification) => (
                    <Card key={notification.id} className="border">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-md">{notification.title}</CardTitle>
                            {notification.priority === "Cao" && (
                              <Badge variant="destructive">Quan trọng</Badge>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-muted-foreground block">{notification.time}</span>
                            <span className="text-xs text-muted-foreground block">{notification.date}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {notification.source === "Nhà trường" ? (
                              <><School className="h-3 w-3 mr-1" /> {notification.source}</>
                            ) : (
                              <><MessageCircle className="h-3 w-3 mr-1" /> {notification.source}</>
                            )}
                          </Badge>
                          {notification.forChild && (
                            <Badge variant="secondary" className="text-xs">
                              {notification.forChild}
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{notification.message}</p>
                      </CardContent>
                    </Card>
                  ))}
                  {filteredNotifications.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      Không có thông báo nào
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
} 