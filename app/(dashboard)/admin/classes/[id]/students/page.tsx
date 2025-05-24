'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AuthGuard } from '@/components/auth/auth-guard';
import { useAuth } from '@/lib/auth-context';
import { ClassroomService, Classroom } from '@/lib/api/classes';
import { UserService, UserInformation } from '@/lib/api/user';
import { Loader2, ChevronLeft, Search, Plus, ArrowUpDown, XCircle, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { usePagination } from '@/hooks/use-pagination';
import { PaginationControls } from '@/components/common/pagination-controls';

// Định nghĩa kiểu dữ liệu cho học sinh trong lớp học
interface ClassroomStudent {
  userId: string;
  email: string;
  fullName: string;
  status: string; // Ví dụ: Active, Inactive
  joinedAt: string;
}

export default function AdminClassStudentsPage() {
  const { toast } = useToast();
  const { userData, role } = useAuth();
  const router = useRouter();
  const params = useParams();
  const classId = params.id as string;
  
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [students, setStudents] = useState<ClassroomStudent[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<ClassroomStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State cho dialog thêm học sinh
  const [isAddStudentDialogOpen, setIsAddStudentDialogOpen] = useState(false);
  const [studentEmail, setStudentEmail] = useState('');
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  
  // State cho dialog xóa học sinh
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState<ClassroomStudent | null>(null);
  const [isRemovingStudent, setIsRemovingStudent] = useState(false);
  
  // Pagination hook
  const pagination = usePagination({
    data: filteredStudents,
    itemsPerPage: 15,
  });
  
  // Kiểm tra quyền truy cập
  useEffect(() => {
    if (role !== 'Admin') {
      toast({
        title: 'Quyền truy cập bị từ chối',
        description: 'Bạn không có quyền truy cập vào trang quản lý học sinh lớp học.',
        variant: 'destructive',
      });
      router.push('/dashboard');
    }
  }, [role, router, toast]);
  
  // Lấy thông tin lớp học và danh sách học sinh
  useEffect(() => {
    const fetchClassroomAndStudents = async () => {
      try {
        setIsLoading(true);
        
        // Lấy thông tin lớp học
        const classroomData = await ClassroomService.getClassroomById(classId);
        setClassroom(classroomData);
        
        // Lấy danh sách học sinh từ API
        const studentsData = await ClassroomService.getStudentsByClassroomId(classId);
        
        // Chuyển đổi dữ liệu API sang định dạng hiển thị
        const formattedStudents: ClassroomStudent[] = studentsData.map(student => ({
          userId: student.studentId,
          email: student.studentEmail,
          fullName: student.studentName,
          status: 'Active', // Giả sử trạng thái mặc định là Active
          joinedAt: student.joinedAt
        }));
        
        setStudents(formattedStudents);
        setFilteredStudents(formattedStudents);
      } catch (error: any) {
        console.error('Lỗi khi lấy thông tin lớp học và học sinh:', error);
        toast({
          title: 'Không thể tải thông tin',
          description: error.message || 'Đã xảy ra lỗi khi tải thông tin lớp học và học sinh.',
          variant: 'destructive',
        });
        router.push(`/admin/classes/${classId}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (classId) {
      fetchClassroomAndStudents();
    }
  }, [classId, router, toast]);
  
  // Lọc học sinh theo từ khóa tìm kiếm - Sử dụng useCallback để tránh ESLint warning
  const filterStudents = useCallback(() => {
    const filtered = students.filter(student =>
      student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStudents(filtered);
    // Reset to first page when search changes
    pagination.goToPage(1);
  }, [searchTerm, students, pagination]);

  useEffect(() => {
    filterStudents();
  }, [filterStudents]);
  
  // Xử lý thêm học sinh vào lớp học
  const handleAddStudent = async () => {
    if (!studentEmail.trim()) {
      toast({
        title: 'Email không hợp lệ',
        description: 'Vui lòng nhập email học sinh cần thêm vào lớp học.',
        variant: 'destructive',
      });
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(studentEmail.trim())) {
      toast({
        title: 'Email không hợp lệ',
        description: 'Vui lòng nhập địa chỉ email hợp lệ.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsAddingStudent(true);
      
      // Tìm học sinh theo email
      const allUsers = await UserService.getAllUsers();
      const student = allUsers.find(user => 
        user.email.toLowerCase() === studentEmail.toLowerCase().trim() && 
        user.roleName === 'Student'
      );
      
      if (!student) {
        toast({
          title: 'Không tìm thấy học sinh',
          description: 'Không tìm thấy học sinh với email này trong hệ thống.',
          variant: 'destructive',
        });
        return;
      }
      
      // Kiểm tra xem học sinh đã tham gia lớp học chưa
      const isAlreadyEnrolled = students.some(s => s.userId === student.userID);
      if (isAlreadyEnrolled) {
        toast({
          title: 'Học sinh đã tham gia',
          description: 'Học sinh này đã tham gia lớp học rồi.',
          variant: 'destructive',
        });
        return;
      }
      
      // Gọi API thêm học sinh vào lớp học
      await ClassroomService.enrollStudent({
        classroomId: classId,
        studentId: student.userID,
        joinedAt: new Date().toISOString()
      });
      
      // Thêm học sinh mới vào danh sách hiện tại
      const newStudent: ClassroomStudent = {
        userId: student.userID,
        email: student.email,
        fullName: student.fullName || student.userName,
        status: 'Active',
        joinedAt: new Date().toISOString(),
      };
      
      const updatedStudents = [...students, newStudent];
      setStudents(updatedStudents);
      setFilteredStudents(updatedStudents);
      
      toast({
        title: 'Thêm học sinh thành công',
        description: `Đã thêm học sinh ${student.fullName || student.userName} vào lớp học.`,
      });
      
      // Reset form
      setStudentEmail('');
      setIsAddStudentDialogOpen(false);
    } catch (error: any) {
      toast({
        title: 'Không thể thêm học sinh',
        description: error.message || 'Đã xảy ra lỗi khi thêm học sinh vào lớp học.',
        variant: 'destructive',
      });
    } finally {
      setIsAddingStudent(false);
    }
  };
  
  // Xử lý xóa học sinh khỏi lớp học
  const handleRemoveStudent = async () => {
    if (!studentToRemove) return;
    
    try {
      setIsRemovingStudent(true);
      
      // Gọi API xóa học sinh khỏi lớp học
      await ClassroomService.unenrollStudent(classId, studentToRemove.userId);
      
      // Cập nhật danh sách học sinh sau khi xóa
      const updatedStudents = students.filter(student => student.userId !== studentToRemove.userId);
      setStudents(updatedStudents);
      setFilteredStudents(updatedStudents);
      
      toast({
        title: 'Xóa học sinh thành công',
        description: `Đã xóa học sinh ${studentToRemove.fullName} khỏi lớp học.`,
      });
      
      // Đóng dialog
      setIsRemoveDialogOpen(false);
      setStudentToRemove(null);
    } catch (error: any) {
      toast({
        title: 'Không thể xóa học sinh',
        description: error.message || 'Đã xảy ra lỗi khi xóa học sinh khỏi lớp học.',
        variant: 'destructive',
      });
    } finally {
      setIsRemovingStudent(false);
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
            onClick={() => router.push(`/admin/classes/${classId}`)}
            className="flex items-center"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Quay lại lớp học
          </Button>
          
          <h1 className="text-2xl font-bold">
            {isLoading ? 'Đang tải...' : classroom ? `Quản lý học sinh: ${classroom.name}` : 'Quản lý học sinh'}
          </h1>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-lg">Đang tải danh sách học sinh...</span>
          </div>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>Danh sách học sinh</CardTitle>
                <div className="flex space-x-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Tìm theo tên hoặc email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 w-[250px]"
                    />
                  </div>
                  <Button onClick={() => setIsAddStudentDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm học sinh
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent>
                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{students.length}</div>
                    <div className="text-sm text-muted-foreground">Tổng học sinh</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {students.filter(s => s.status === 'Active').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Đang hoạt động</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{filteredStudents.length}</div>
                    <div className="text-sm text-muted-foreground">Hiển thị</div>
                  </div>
                </div>
                
                {pagination.paginatedData.length > 0 ? (
                  <div className="space-y-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]">STT</TableHead>
                          <TableHead>Học sinh</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Ngày tham gia</TableHead>
                          <TableHead>Trạng thái</TableHead>
                          <TableHead className="text-right">Hành động</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pagination.paginatedData.map((student, index) => (
                          <TableRow key={student.userId}>
                            <TableCell className="font-medium">
                              {(pagination.currentPage - 1) * pagination.itemsPerPage + index + 1}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 flex items-center justify-center bg-primary/10 rounded-full text-primary text-sm font-semibold">
                                  {student.fullName.charAt(0)}
                                </div>
                                <div className="font-medium">{student.fullName}</div>
                              </div>
                            </TableCell>
                            <TableCell>{student.email}</TableCell>
                            <TableCell>{formatDate(student.joinedAt)}</TableCell>
                            <TableCell>
                              <Badge
                                className={student.status === 'Active' ? 'bg-green-500' : 'bg-gray-500'}
                              >
                                {student.status === 'Active' ? 'Hoạt động' : 'Không hoạt động'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive border-destructive hover:bg-destructive/10"
                                onClick={() => {
                                  setStudentToRemove(student);
                                  setIsRemoveDialogOpen(true);
                                }}
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Xóa
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    
                    {/* Pagination Controls */}
                    <PaginationControls
                      currentPage={pagination.currentPage}
                      totalPages={pagination.totalPages}
                      totalItems={pagination.totalItems}
                      itemsPerPage={pagination.itemsPerPage}
                      hasNextPage={pagination.hasNextPage}
                      hasPreviousPage={pagination.hasPreviousPage}
                      onPageChange={pagination.goToPage}
                      onItemsPerPageChange={pagination.setItemsPerPage}
                    />
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <UserPlus className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-semibold">
                      {searchTerm ? 'Không tìm thấy học sinh' : 'Chưa có học sinh'}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {searchTerm 
                        ? 'Không có học sinh nào phù hợp với từ khóa tìm kiếm.' 
                        : 'Lớp học này chưa có học sinh nào tham gia.'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Dialog thêm học sinh */}
            <Dialog open={isAddStudentDialogOpen} onOpenChange={setIsAddStudentDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Thêm học sinh vào lớp học</DialogTitle>
                  <DialogDescription>
                    Nhập email của học sinh để thêm vào lớp học {classroom?.name}.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium leading-none">
                      Email học sinh
                    </label>
                    <Input
                      id="email"
                      placeholder="Nhập email học sinh"
                      value={studentEmail}
                      onChange={(e) => setStudentEmail(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddStudentDialogOpen(false)}
                    disabled={isAddingStudent}
                  >
                    Hủy
                  </Button>
                  <Button
                    onClick={handleAddStudent}
                    disabled={isAddingStudent}
                  >
                    {isAddingStudent ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang thêm...
                      </>
                    ) : (
                      'Thêm học sinh'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            {/* Dialog xác nhận xóa học sinh */}
            <AlertDialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Xóa học sinh khỏi lớp học</AlertDialogTitle>
                  <AlertDialogDescription>
                    Bạn có chắc chắn muốn xóa học sinh <strong>{studentToRemove?.fullName}</strong> khỏi lớp học này?
                    Học sinh sẽ không thể truy cập vào các nội dung của lớp học nữa.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isRemovingStudent}>Hủy</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={(e) => {
                      e.preventDefault();
                      handleRemoveStudent();
                    }}
                    disabled={isRemovingStudent}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isRemovingStudent ? "Đang xóa..." : "Xóa học sinh"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </div>
    </AuthGuard>
  );
} 