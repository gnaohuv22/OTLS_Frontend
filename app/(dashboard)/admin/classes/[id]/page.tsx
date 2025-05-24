'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AuthGuard } from '@/components/auth/auth-guard';
import { useAuth } from '@/lib/auth-context';
import { ClassroomService, Classroom, UpdateClassroomRequest } from '@/lib/api/classes';
import { UserService, UserInformation } from '@/lib/api/user';
import { Loader2, ChevronLeft, Save, Trash2, UserPlus, Video, VideoOff } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function AdminClassDetailPage() {
  const { toast } = useToast();
  const { userData, role } = useAuth();
  const router = useRouter();
  const params = useParams();
  const classId = params.id as string;
  
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // State cho form chỉnh sửa
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Inactive');
  
  // State cho dialog xóa
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Kiểm tra quyền truy cập
  useEffect(() => {
    if (role !== 'Admin') {
      toast({
        title: 'Quyền truy cập bị từ chối',
        description: 'Bạn không có quyền truy cập vào trang quản lý lớp học.',
        variant: 'destructive',
      });
      router.push('/dashboard');
    }
  }, [role, router, toast]);
  
  // Lấy thông tin lớp học
  useEffect(() => {
    const fetchClassroom = async () => {
      try {
        setIsLoading(true);
        const data = await ClassroomService.getClassroomById(classId);
        setClassroom(data);
        
        // Trích xuất thông tin từ mô tả
        let extractedSubject = 'Chưa xác định';
        let remainingDescription = data.description;
        
        const subjectMatch = data.description.match(/Môn học: (.*?)(\n|$)/);
        if (subjectMatch) {
          extractedSubject = subjectMatch[1];
          remainingDescription = data.description.replace(subjectMatch[0], '').trim();
        }
        
        // Cập nhật state form
        setName(data.name);
        setSubject(extractedSubject);
        setDescription(remainingDescription);
        setStatus(data.isOnlineMeeting);
      } catch (error: any) {
        if (error.status === 404) {
          router.push('/admin/classes');
        } else {
          toast({
            title: 'Không thể tải thông tin lớp học',
          description: error.message || 'Đã xảy ra lỗi khi tải thông tin lớp học.',
          variant: 'destructive',
          });
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    if (classId) {
      fetchClassroom();
    }
  }, [classId, router, toast]);
  
  // Xử lý lưu thông tin
  const handleSave = async () => {
    try {
      if (!classroom) return;
      
      setIsSaving(true);
      
      // Tạo mô tả mới
      const newDescription = `Môn học: ${subject}\n\n${description}`;
      
      // Tạo dữ liệu cập nhật
      const updateData: UpdateClassroomRequest = {
        classroomId: classroom.classroomId,
        name: name,
        description: newDescription
      };
      
      // Gọi API cập nhật
      const updatedClassroom = await ClassroomService.updateClassroom(updateData);
      
      // Cập nhật state
      setClassroom(updatedClassroom);
      
      toast({
        title: 'Cập nhật thành công',
        description: 'Thông tin lớp học đã được cập nhật thành công.',
      });
    } catch (error: any) {
      toast({
        title: 'Không thể cập nhật lớp học',
        description: error.message || 'Đã xảy ra lỗi khi cập nhật thông tin lớp học.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Xử lý xóa lớp học
  const handleDelete = async () => {
    try {
      if (!classroom) return;
      
      setIsDeleting(true);
      
      // Gọi API xóa lớp học
      await ClassroomService.deleteClassroom(classroom.classroomId);
      
      toast({
        title: 'Xóa lớp học thành công',
        description: 'Lớp học đã được xóa thành công.',
      });
      
      // Chuyển về trang danh sách lớp học
      router.push('/admin/classes');
    } catch (error: any) {
      toast({
        title: 'Không thể xóa lớp học',
        description: error.message || 'Đã xảy ra lỗi khi xóa lớp học.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };
  
  // Xử lý bắt đầu/kết thúc buổi học trực tuyến
  const handleToggleMeeting = async () => {
    try {
      if (!classroom) return;
      
      const newStatus = classroom.isOnlineMeeting === 'Active' ? 'Inactive' : 'Active';
      const actionText = newStatus === 'Active' ? 'bắt đầu' : 'kết thúc';
      
      // Cập nhật trạng thái
      const updatedClassroom = await ClassroomService.updateClassroomStatus(classroom.classroomId, newStatus);
      
      // Cập nhật state
      setClassroom(updatedClassroom);
      setStatus(updatedClassroom.isOnlineMeeting);
      
      toast({
        title: `Đã ${actionText} buổi học trực tuyến`,
        description: `Buổi học trực tuyến đã được ${actionText} thành công.`,
      });
    } catch (error: any) {
      toast({
        title: 'Không thể cập nhật trạng thái buổi học',
        description: error.message || `Đã xảy ra lỗi khi thay đổi trạng thái buổi học trực tuyến.`,
        variant: 'destructive',
      });
    }
  };
  
  // Format ngày tháng
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch (error) {
      return 'Không xác định';
    }
  };
  
  return (
    <AuthGuard>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={() => router.push('/admin/classes')}
            className="flex items-center"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="text-destructive border-destructive hover:bg-destructive/10"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={isLoading || isSaving || isDeleting}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Xóa lớp học
            </Button>
            
            <Button
              onClick={handleSave}
              disabled={isLoading || isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Lưu thay đổi
                </>
              )}
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
            <span>Đang tải thông tin lớp học...</span>
          </div>
        ) : classroom ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin lớp học</CardTitle>
                  <CardDescription>
                    Chỉnh sửa thông tin cơ bản của lớp học
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Tên lớp học</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nhập tên lớp học..."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subject">Môn học</Label>
                    <Select value={subject} onValueChange={setSubject}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn môn học" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Toán">Toán</SelectItem>
                        <SelectItem value="Tiếng Việt">Tiếng Việt</SelectItem>
                        <SelectItem value="Tiếng Anh">Tiếng Anh</SelectItem>
                        <SelectItem value="Khoa học">Khoa học</SelectItem>
                        <SelectItem value="Lịch sử">Lịch sử</SelectItem>
                        <SelectItem value="Địa lý">Địa lý</SelectItem>
                        <SelectItem value="Mỹ thuật">Mỹ thuật</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Mô tả lớp học</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Nhập mô tả lớp học..."
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Học sinh trong lớp</CardTitle>
                    <CardDescription>
                      Quản lý danh sách học sinh tham gia lớp học
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/admin/classes/${classId}/students`)}
                    className="flex items-center"
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Quản lý học sinh
                  </Button>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Nhấn vào nút "Quản lý học sinh" để xem và quản lý danh sách học sinh trong lớp học.
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tổng quan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">Trạng thái lớp học</p>
                    <div className="flex items-center mt-1">
                      <Badge variant={classroom.isOnlineMeeting === 'Active' ? 'default' : 'secondary'} className={classroom.isOnlineMeeting === 'Active' ? 'bg-green-500 hover:bg-green-500/80' : ''}>
                        {classroom.isOnlineMeeting === 'Active' ? 'Đang hoạt động' : 'Không hoạt động'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">Ngày tạo</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(classroom.createdAt)}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">Lần cập nhật cuối</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(classroom.updatedAt)}
                    </p>
                  </div>

                  {classroom.users && (
                    <div className="pt-2 border-t">
                      <p className="text-sm font-medium mb-2">Giáo viên phụ trách</p>
                      <div className="flex items-start space-x-3 bg-muted/50 p-3 rounded-md">
                        <div className="w-10 h-10 flex items-center justify-center bg-primary/10 rounded-full overflow-hidden text-primary">
                          {classroom.users.avatar ? (
                            <img 
                              src={classroom.users.avatar} 
                              alt={classroom.users.fullName} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-lg font-bold">
                              {classroom.users.fullName?.charAt(0) || classroom.users.userName?.charAt(0) || 'T'}
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{classroom.users.fullName}</p>
                          <p className="text-xs text-muted-foreground">{classroom.users.email}</p>
                          <p className="text-xs text-muted-foreground mt-1">SĐT: {classroom.users.phoneNumber}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={classroom.isOnlineMeeting === 'Active' ? 'destructive' : 'default'}
                    onClick={handleToggleMeeting}
                  >
                    {classroom.isOnlineMeeting === 'Active' ? (
                      <>
                        <VideoOff className="mr-2 h-4 w-4" />
                        Kết thúc buổi học trực tuyến
                      </>
                    ) : (
                      <>
                        <Video className="mr-2 h-4 w-4" />
                        Bắt đầu buổi học trực tuyến
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        ) : (
          <div className="flex justify-center py-12">
            <p>Không tìm thấy thông tin lớp học.</p>
          </div>
        )}
      </div>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa lớp học &quot;{classroom?.name}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Mọi dữ liệu liên quan đến lớp học này sẽ bị xóa vĩnh viễn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                'Xóa lớp học'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AuthGuard>
  );
} 