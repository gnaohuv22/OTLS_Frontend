'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AuthGuard } from '@/components/auth/auth-guard';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Plus } from 'lucide-react';
import { AssignmentService, AssignmentDetails } from '@/lib/api/assignment';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, FileText, Calendar, Users, Clock } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { usePagination } from '@/hooks/use-pagination';
import { PaginationControls } from '@/components/common/pagination-controls';

export default function AdminAssignmentsPage() {
  const { toast } = useToast();
  const { userData, role } = useAuth();
  const router = useRouter();
  
  const [assignments, setAssignments] = useState<AssignmentDetails[]>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<AssignmentDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [assignmentToDelete, setAssignmentToDelete] = useState<AssignmentDetails | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Pagination hook
  const pagination = usePagination({
    data: filteredAssignments,
    itemsPerPage: 10,
  });
  
  // Kiểm tra quyền truy cập
  useEffect(() => {
    if (role !== 'Admin') {
      toast({
        title: 'Quyền truy cập bị từ chối',
        description: 'Bạn không có quyền truy cập vào trang quản lý bài tập.',
        variant: 'destructive',
      });
      router.push('/dashboard');
    }
  }, [role, router, toast]);
  
  // Lấy danh sách bài tập từ API
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setIsLoading(true);
        const response = await AssignmentService.getAllAssignments();
        if (response.isValid && response.data) {
          setAssignments(response.data);
          setFilteredAssignments(response.data);
        }
      } catch (error: any) {
        if (error.status === 404) {
          setAssignments([]);
          setFilteredAssignments([]);
        } else {
          toast({
            title: 'Không thể tải danh sách bài tập',
            description: error.message || 'Đã xảy ra lỗi khi tải danh sách bài tập.',
            variant: 'destructive',
          });
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAssignments();
  }, [toast]);
  
  // Lọc bài tập dựa trên từ khóa tìm kiếm và bộ lọc - Sử dụng useCallback để tránh ESLint warning
  const filterAssignments = useCallback(() => {
    let result = [...assignments];
    
    // Lọc theo từ khóa tìm kiếm
    if (searchTerm) {
      result = result.filter(
        assignment => 
          assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          assignment.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Lọc theo môn học
    if (subjectFilter !== 'all') {
      result = result.filter(assignment => assignment.subject?.subjectId === subjectFilter);
    }
    
    // Lọc theo trạng thái (dựa trên due date)
    if (statusFilter !== 'all') {
      const now = new Date();
      result = result.filter(assignment => {
        const dueDate = new Date(assignment.dueDate);
        switch (statusFilter) {
          case 'active':
            return dueDate > now;
          case 'expired':
            return dueDate <= now;
          default:
            return true;
        }
      });
    }
    
    setFilteredAssignments(result);
    // Reset to first page when filters change
    pagination.goToPage(1);
  }, [searchTerm, subjectFilter, statusFilter, assignments, pagination]);

  useEffect(() => {
    filterAssignments();
  }, [filterAssignments]);
  
  // Xử lý xóa bài tập
  const handleDeleteAssignment = async () => {
    if (!assignmentToDelete) return;
    
    try {
      setIsDeleting(true);
      await AssignmentService.deleteAssignment(assignmentToDelete.assignmentId);
      
      // Cập nhật lại danh sách bài tập
      setAssignments(prevAssignments => 
        prevAssignments.filter(assignment => assignment.assignmentId !== assignmentToDelete.assignmentId)
      );
      
      toast({
        title: 'Xóa bài tập thành công',
        description: 'Bài tập đã được xóa thành công.',
      });
      
      setIsDeleteDialogOpen(false);
      setAssignmentToDelete(null);
    } catch (error: any) {
      toast({
        title: 'Không thể xóa bài tập',
        description: error.message || 'Đã xảy ra lỗi khi xóa bài tập.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Format ngày
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
  
  // Kiểm tra trạng thái bài tập
  const getAssignmentStatus = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    
    if (due > now) {
      return { label: 'Hoạt động', variant: 'default' as const };
    } else {
      return { label: 'Hết hạn', variant: 'destructive' as const };
    }
  };
  
  return (
    <AuthGuard>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Quản lý bài tập</h1>
            <p className="text-muted-foreground">
              Quản lý và theo dõi tất cả bài tập trên nền tảng
            </p>
          </div>
          <Button onClick={() => router.push('/assignments/create')}>
            <Plus className="h-4 w-4 mr-2" />
            Tạo bài tập mới
          </Button>
        </div>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Danh sách bài tập</CardTitle>
            <CardDescription>
              Tổng cộng có {filteredAssignments.length} bài tập {searchTerm || subjectFilter !== 'all' || statusFilter !== 'all' ? '(đã lọc)' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Bộ lọc */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm bài tập..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              
              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Tất cả môn học" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả môn học</SelectItem>
                  {/* Sẽ được populate từ API subjects */}
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Tất cả trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="active">Hoạt động</SelectItem>
                  <SelectItem value="expired">Hết hạn</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Bảng dữ liệu */}
            {isLoading ? (
              <div className="flex justify-center items-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-lg">Đang tải danh sách bài tập...</span>
              </div>
            ) : pagination.paginatedData.length > 0 ? (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tiêu đề</TableHead>
                      <TableHead>Môn học</TableHead>
                      <TableHead>Người tạo</TableHead>
                      <TableHead>Hạn nộp</TableHead>
                      <TableHead>Loại</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="text-right">Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagination.paginatedData.map((assignment) => {
                      const status = getAssignmentStatus(assignment.dueDate);
                      return (
                        <TableRow key={assignment.assignmentId}>
                          <TableCell className="font-medium">
                            <div>
                              <div className="font-medium">{assignment.title}</div>
                              <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                                {assignment.description}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {assignment.subject?.subjectName || 'Không xác định'}
                          </TableCell>
                          <TableCell>
                            {assignment.user?.fullName || assignment.user?.userName || 'Không xác định'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                              {formatDate(assignment.dueDate)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {assignment.assignmentType === 'Quiz' ? 'Trắc nghiệm' : 'Tự luận'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={status.variant}>
                              {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push(`/admin/assignments/${assignment.assignmentId}`)}
                              >
                                Xem
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive border-destructive hover:bg-destructive/10"
                                onClick={() => {
                                  setAssignmentToDelete(assignment);
                                  setIsDeleteDialogOpen(true);
                                }}
                              >
                                Xóa
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
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
              <div className="text-center py-6">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">Không có bài tập</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {searchTerm || subjectFilter !== 'all' || statusFilter !== 'all' 
                    ? 'Không tìm thấy bài tập phù hợp với bộ lọc.' 
                    : 'Chưa có bài tập nào được tạo.'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Dialog xác nhận xóa */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xác nhận xóa bài tập</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn có chắc chắn muốn xóa bài tập <strong>{assignmentToDelete?.title}</strong>? 
                Hành động này không thể hoàn tác và sẽ xóa tất cả dữ liệu liên quan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  handleDeleteAssignment();
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
                  'Xóa bài tập'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AuthGuard>
  );
} 