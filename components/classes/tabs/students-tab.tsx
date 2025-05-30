'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  PlusCircle, 
  Search, 
  Mail, 
  Calendar, 
  UserMinus, 
  AlertCircle,
  CalendarDays,
  User,
  Phone,
  Info,
  Cake,
  X
} from 'lucide-react';
import { StudentsTabProps, Student } from '../types';
import { useToast } from '@/components/ui/use-toast';
import { ClassroomService } from '@/lib/api/classes';
import { UserService, UserInformation } from '@/lib/api/user'; 
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";

export function StudentsTab({ classDetail, role, setShowAddStudentModal }: StudentsTabProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isRemovingStudent, setIsRemovingStudent] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState<{ id: string, name: string } | null>(null);
  const [showStudentDetail, setShowStudentDetail] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [studentDetail, setStudentDetail] = useState<UserInformation | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  
  // Đảm bảo students luôn là một mảng, không bao giờ undefined
  const students = classDetail.students || [];

  // Lọc học sinh theo từ khóa tìm kiếm
  const filteredStudents = searchTerm 
    ? students.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : students;

  // Function to view student details
  const handleViewStudentDetail = useCallback(async (studentId: string) => {
    setSelectedStudentId(studentId);
    setIsLoadingDetail(true);
    
    try {
      const studentInfo = await UserService.getUserById(studentId);
      setStudentDetail(studentInfo);
      setShowStudentDetail(true);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: error.message || 'Không thể lấy thông tin chi tiết của học sinh',
      });
    } finally {
      setIsLoadingDetail(false);
    }
  }, [toast]);

  // Hàm xử lý khi người dùng muốn xóa học sinh khỏi lớp
  const handleRemoveStudentRequest = (student: { id: string, name: string }) => {
    setStudentToRemove(student);
    setIsRemovingStudent(true);
  };

  // Hàm xóa học sinh khỏi lớp học
  const handleRemoveStudent = async () => {
    if (!studentToRemove || !classDetail.classroomId) return;
    
    try {
      // Gọi API để xóa học sinh khỏi lớp học
      await ClassroomService.unenrollStudent(classDetail.classroomId, studentToRemove.id);
      
      // Thông báo thành công
      toast({
        title: 'Thành công',
        description: `Đã xóa học sinh ${studentToRemove.name} khỏi lớp học`,
      });
      
      // Đóng dialog xác nhận
      setIsRemovingStudent(false);
      setStudentToRemove(null);
      
      // Cập nhật lại danh sách học sinh (thực tế cần trigger lại fetch data từ component cha)
      // Đây chỉ là cập nhật UI tạm thời, component cha sẽ cần reload dữ liệu
      window.location.reload(); // Tạm thời reload page để lấy dữ liệu mới
    } catch (error: any) {
      // Thông báo lỗi
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: error.message || 'Không thể xóa học sinh khỏi lớp học',
      });
    }
  };
    
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <h3 className="text-lg font-semibold">Danh sách học sinh ({students.length})</h3>
        {role === 'Teacher' && (
          <Button 
            className="gap-2 w-full sm:w-auto"
            onClick={() => setShowAddStudentModal(true)}
          >
            <PlusCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Thêm học sinh</span>
            <span className="sm:hidden">Thêm học sinh</span>
          </Button>
        )}
      </div>
      
      {/* Thanh tìm kiếm */}
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm học sinh..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>
      
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {filteredStudents.map((student) => (
          <Card key={student.id}>
            <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between">
              <CardTitle className="text-base">{student.name}</CardTitle>
              {role === 'Teacher' && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-destructive"
                  onClick={() => handleRemoveStudentRequest(student)}
                >
                  <UserMinus className="h-4 w-4" />
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={student.avatar || ''} alt={student.name} />
                  <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <div className="flex items-center text-sm">
                    <Mail className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                    <span>{student.email || 'Không có email'}</span>
                  </div>
                  {student.studentDob && (
                    <div className="flex items-center text-sm">
                      <Cake className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                      <span>{new Date(student.studentDob).toLocaleDateString('vi-VN')}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200">
                      {student.status || 'Hoạt động'}
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 px-2 text-blue-600"
                      onClick={() => handleViewStudentDetail(student.id)}
                    >
                      <Info className="h-3.5 w-3.5 mr-1" />
                      <span className="text-xs">Chi tiết</span>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {filteredStudents.length === 0 && (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              {searchTerm ? 'Không tìm thấy học sinh phù hợp.' : 'Hiện tại chưa có học sinh nào trong lớp học này.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Dialog xác nhận xóa học sinh */}
      <AlertDialog open={isRemovingStudent} onOpenChange={setIsRemovingStudent}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa học sinh khỏi lớp học</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="flex flex-col space-y-2">
                <p>Bạn có chắc chắn muốn xóa học sinh <strong>{studentToRemove?.name}</strong> khỏi lớp học này?</p>
                <div className="flex items-center text-amber-600 bg-amber-50 p-2 rounded">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <span className="text-sm">Hành động này không thể hoàn tác.</span>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRemoveStudent}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Xóa học sinh
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Student Detail Dialog */}
      <Dialog open={showStudentDetail} onOpenChange={setShowStudentDetail}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Thông tin chi tiết học sinh</DialogTitle>
            <DialogDescription>
              Xem các thông tin chi tiết của học sinh
            </DialogDescription>
          </DialogHeader>
          
          {isLoadingDetail ? (
            <div className="py-6 flex justify-center items-center">
              <div className="animate-spin h-6 w-6 border-2 border-blue-600 rounded-full border-t-transparent"></div>
              <span className="ml-2">Đang tải...</span>
            </div>
          ) : studentDetail ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={studentDetail.avatar || undefined} alt={studentDetail.fullName || studentDetail.userName} />
                  <AvatarFallback className="text-lg">
                    {studentDetail.fullName ? studentDetail.fullName.charAt(0) : studentDetail.userName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-lg">{studentDetail.fullName || studentDetail.userName}</h3>
                  <p className="text-sm text-muted-foreground">{studentDetail.userName}</p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <dl className="space-y-3">
                  <div className="flex items-center">
                    <dt className="w-1/3 text-sm font-medium text-muted-foreground flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </dt>
                    <dd className="w-2/3 text-sm">{studentDetail.email}</dd>
                  </div>
                  
                  <div className="flex items-center">
                    <dt className="w-1/3 text-sm font-medium text-muted-foreground flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      Số điện thoại
                    </dt>
                    <dd className="w-2/3 text-sm">{studentDetail.phoneNumber || 'Không có'}</dd>
                  </div>
                  
                  <div className="flex items-center">
                    <dt className="w-1/3 text-sm font-medium text-muted-foreground flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Giới tính
                    </dt>
                    <dd className="w-2/3 text-sm">{studentDetail.gender || 'Không có'}</dd>
                  </div>
                  
                  <div className="flex items-center">
                    <dt className="w-1/3 text-sm font-medium text-muted-foreground flex items-center">
                      <CalendarDays className="h-4 w-4 mr-2" />
                      Ngày sinh
                    </dt>
                    <dd className="w-2/3 text-sm">
                      {studentDetail.dateOfBirth 
                        ? (function() {
                            try {
                              return new Date(studentDetail.dateOfBirth).toLocaleDateString('vi-VN');
                            } catch (e) {
                              return 'Định dạng không hợp lệ';
                            }
                          })()
                        : 'Không có'}
                    </dd>
                  </div>
                  
                  <div className="flex items-center">
                    <dt className="w-1/3 text-sm font-medium text-muted-foreground flex items-center">
                      <Info className="h-4 w-4 mr-2" />
                      Tuổi
                    </dt>
                    <dd className="w-2/3 text-sm">{studentDetail.age || 'Không có'}</dd>
                  </div>
                  
                  <div className="flex items-center">
                    <dt className="w-1/3 text-sm font-medium text-muted-foreground flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Ngày tạo
                    </dt>
                    <dd className="w-2/3 text-sm">
                      {studentDetail.createdAt 
                        ? new Date(studentDetail.createdAt).toLocaleDateString('vi-VN')
                        : new Date().toLocaleDateString('vi-VN')}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-muted-foreground">
              Không thể tải thông tin học sinh
            </div>
          )}
          
          <DialogFooter className="sm:justify-end">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Đóng
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 