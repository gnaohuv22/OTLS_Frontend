'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AuthGuard } from '@/components/auth/auth-guard';
import { useAuth } from '@/lib/auth-context';
import { AssignmentService, AssignmentDetails, SubmissionsByAssignmentResponse } from '@/lib/api/assignment';
import { Loader2, ChevronLeft, Save, Trash2, Users, Clock, FileText, Calendar, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { usePagination } from '@/hooks/use-pagination';
import { PaginationControls } from '@/components/common/pagination-controls';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdminAssignmentDetailPage() {
  const { toast } = useToast();
  const { userData, role } = useAuth();
  const router = useRouter();
  const params = useParams();
  const assignmentId = params.id as string;
  
  const [assignment, setAssignment] = useState<AssignmentDetails | null>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // State cho form chỉnh sửa
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [textContent, setTextContent] = useState('');
  const [maxPoints, setMaxPoints] = useState(100);
  const [allowLateSubmissions, setAllowLateSubmissions] = useState(false);
  const [dueDate, setDueDate] = useState('');
  
  // State cho dialog xóa
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Pagination for submissions
  const submissionsPagination = usePagination({
    data: submissions,
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
  
  // Lấy thông tin bài tập
  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        setIsLoading(true);
        const response = await AssignmentService.getAssignmentById(assignmentId);
        if (response.isValid && response.data) {
          const assignmentData = response.data;
          setAssignment(assignmentData);
          
          // Cập nhật state form
          setTitle(assignmentData.title);
          setDescription(assignmentData.description);
          setTextContent(assignmentData.textContent);
          setMaxPoints(assignmentData.maxPoints);
          setAllowLateSubmissions(assignmentData.allowLateSubmissions);
          setDueDate(assignmentData.dueDate.split('T')[0]); // Chỉ lấy phần date
        }
      } catch (error: any) {
        if (error.status === 404) {
          router.push('/admin/assignments');
        } else {
          console.error('Lỗi khi lấy thông tin bài tập:', error);
          toast({
          title: 'Không thể tải thông tin bài tập',
          description: error.message || 'Đã xảy ra lỗi khi tải thông tin bài tập.',
          variant: 'destructive',
          });
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    if (assignmentId) {
      fetchAssignment();
    }
  }, [assignmentId, router, toast]);
  
  // Lấy danh sách submissions
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setIsLoadingSubmissions(true);
        const response = await AssignmentService.getSubmissionsByAssignmentId(assignmentId);
        if (response.isValid && response.data) {
          // The API returns submissions with userDTO nested inside each submission
          setSubmissions(response.data.submissions || []);
        }
      } catch (error: any) {
        if (error.status === 404) {
          setSubmissions([]);
        } else {
          toast({
            title: 'Không thể tải danh sách bài nộp',
          description: error.message || 'Đã xảy ra lỗi khi tải danh sách bài nộp.',
            variant: 'destructive',
          });
        }
      } finally {
        setIsLoadingSubmissions(false);
      }
    };
    
    if (assignmentId) {
      fetchSubmissions();
    }
  }, [assignmentId, toast]);
  
  // Xử lý lưu thông tin
  const handleSave = async () => {
    try {
      if (!assignment) return;
      
      setIsSaving(true);
      
      // Tạo dữ liệu cập nhật
      const updateData = {
        assignmentId: assignment.assignmentId,
        userId: assignment.user?.userID || '',
        subjectId: assignment.subject?.subjectId || '',
        title,
        description,
        classIds: assignment.classes?.map(c => c.classroomId) || [],
        dueDate: new Date(dueDate).toISOString(),
        maxPoints,
        allowLateSubmissions,
        assignmentType: assignment.assignmentType,
        textContent,
        timer: assignment.timer
      };
      
      // Gọi API cập nhật
      const response = await AssignmentService.updateAssignment(updateData);
      
      if (response.isValid && response.data) {
        // Cập nhật state
        setAssignment(response.data);
        
        toast({
          title: 'Cập nhật thành công',
          description: 'Thông tin bài tập đã được cập nhật thành công.',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Không thể cập nhật bài tập',
        description: error.message || 'Đã xảy ra lỗi khi cập nhật thông tin bài tập.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Xử lý xóa bài tập
  const handleDelete = async () => {
    try {
      if (!assignment) return;
      
      setIsDeleting(true);
      
      // Gọi API xóa bài tập
      await AssignmentService.deleteAssignment(assignment.assignmentId);
      
      toast({
        title: 'Xóa bài tập thành công',
        description: 'Bài tập đã được xóa thành công.',
      });
      
      // Chuyển về trang danh sách bài tập
      router.push('/admin/assignments');
    } catch (error: any) {
      toast({
        title: 'Không thể xóa bài tập',
        description: error.message || 'Đã xảy ra lỗi khi xóa bài tập.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
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
  
  // Format submission status
  const getSubmissionStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'submitted':
        return { label: 'Đã nộp', variant: 'default' as const };
      case 'graded':
        return { label: 'Đã chấm', variant: 'secondary' as const };
      case 'late':
        return { label: 'Nộp muộn', variant: 'destructive' as const };
      default:
        return { label: status, variant: 'outline' as const };
    }
  };
  
  return (
    <AuthGuard>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={() => router.push('/admin/assignments')}
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
              Xóa bài tập
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
            <span>Đang tải thông tin bài tập...</span>
          </div>
        ) : assignment ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="general">Thông tin chung</TabsTrigger>
                  <TabsTrigger value="content">Nội dung</TabsTrigger>
                  <TabsTrigger value="submissions">Bài nộp ({submissions.length})</TabsTrigger>
                </TabsList>
                
                <TabsContent value="general" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Thông tin bài tập</CardTitle>
                      <CardDescription>
                        Chỉnh sửa thông tin cơ bản của bài tập
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Tiêu đề bài tập</Label>
                        <Input
                          id="title"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="Nhập tiêu đề bài tập..."
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="description">Mô tả</Label>
                        <Textarea
                          id="description"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Nhập mô tả bài tập..."
                          rows={4}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="maxPoints">Điểm tối đa</Label>
                          <Input
                            id="maxPoints"
                            type="number"
                            value={maxPoints}
                            onChange={(e) => setMaxPoints(parseInt(e.target.value) || 0)}
                            min="0"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="dueDate">Hạn nộp</Label>
                          <Input
                            id="dueDate"
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="allowLate">Cho phép nộp muộn</Label>
                        <Select 
                          value={allowLateSubmissions.toString()} 
                          onValueChange={(value) => setAllowLateSubmissions(value === 'true')}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Có</SelectItem>
                            <SelectItem value="false">Không</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="content" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Nội dung bài tập</CardTitle>
                      <CardDescription>
                        Chỉnh sửa nội dung chi tiết của bài tập
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Label htmlFor="textContent">Nội dung</Label>
                        <Textarea
                          id="textContent"
                          value={textContent}
                          onChange={(e) => setTextContent(e.target.value)}
                          placeholder="Nhập nội dung bài tập..."
                          rows={10}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="submissions" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Quản lý bài nộp</CardTitle>
                      <CardDescription>
                        Xem và quản lý danh sách bài nộp của học sinh cho bài tập này
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isLoadingSubmissions ? (
                        <div className="flex justify-center items-center py-12">
                          <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
                          <span>Đang tải danh sách bài nộp...</span>
                        </div>
                      ) : submissions.length > 0 ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-primary">{submissions.length}</div>
                              <div className="text-sm text-muted-foreground">Tổng bài nộp</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-600">
                                {submissions.filter(s => s.status === 'graded').length}
                              </div>
                              <div className="text-sm text-muted-foreground">Đã chấm điểm</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-orange-600">
                                {submissions.filter(s => s.status === 'submitted').length}
                              </div>
                              <div className="text-sm text-muted-foreground">Chờ chấm điểm</div>
                            </div>
                          </div>
                          
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Học sinh</TableHead>
                                <TableHead>Thời gian nộp</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead>Điểm số</TableHead>
                                <TableHead>Phản hồi</TableHead>
                                <TableHead className="text-right">Hành động</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {submissionsPagination.paginatedData.map((submission) => {
                                const statusBadge = getSubmissionStatusBadge(submission.status);
                                return (
                                  <TableRow key={submission.submissionId}>
                                    <TableCell>
                                      <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 flex items-center justify-center bg-primary/10 rounded-full text-primary text-sm font-semibold">
                                          {submission.userDTO?.fullName?.charAt(0) || submission.userDTO?.userName?.charAt(0) || 'S'}
                                        </div>
                                        <div>
                                          <div className="font-medium">{submission.userDTO?.fullName || submission.userDTO?.userName}</div>
                                          <div className="text-sm text-muted-foreground">{submission.userDTO?.email}</div>
                                        </div>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <div className="text-sm">
                                        {formatDate(submission.submittedAt)}
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <Badge variant={statusBadge.variant}>
                                        {statusBadge.label}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>
                                      <div className="font-medium">
                                        {submission.grade !== null ? `${submission.grade}/${maxPoints}` : 'Chưa chấm'}
                                      </div>
                                    </TableCell>
                                    <TableCell className="max-w-[200px]">
                                      <div className="text-sm text-muted-foreground truncate">
                                        {submission.feedback || 'Chưa có phản hồi'}
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <div className="flex justify-end gap-2">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => router.push(`/admin/assignments/${assignmentId}/submissions/${submission.submissionId}/grade`)}
                                        >
                                          {submission.status === 'graded' ? 'Xem điểm' : 'Chấm điểm'}
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => {
                                            // Open submission detail modal or navigate to detail page
                                            toast({
                                              title: 'Xem chi tiết bài nộp',
                                              description: 'Chức năng xem chi tiết bài nộp sẽ được triển khai.',
                                            });
                                          }}
                                        >
                                          Chi tiết
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                          
                          <PaginationControls
                            currentPage={submissionsPagination.currentPage}
                            totalPages={submissionsPagination.totalPages}
                            totalItems={submissionsPagination.totalItems}
                            itemsPerPage={submissionsPagination.itemsPerPage}
                            hasNextPage={submissionsPagination.hasNextPage}
                            hasPreviousPage={submissionsPagination.hasPreviousPage}
                            onPageChange={submissionsPagination.goToPage}
                            onItemsPerPageChange={submissionsPagination.setItemsPerPage}
                          />
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                          <h3 className="mt-2 text-sm font-semibold">Chưa có bài nộp</h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Chưa có học sinh nào nộp bài tập này.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tổng quan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">Trạng thái</p>
                    <div className="flex items-center mt-1">
                      <Badge variant={getAssignmentStatus(assignment.dueDate).variant}>
                        {getAssignmentStatus(assignment.dueDate).label}
                      </Badge>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <p className="text-sm font-medium">Loại bài tập</p>
                    <p className="text-sm text-muted-foreground">
                      {assignment.assignmentType === 'Quiz' ? 'Trắc nghiệm' : 'Tự luận'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">Môn học</p>
                    <p className="text-sm text-muted-foreground">
                      {assignment.subject?.subjectName || 'Không xác định'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">Ngày tạo</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(assignment.createdAt)}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">Lần cập nhật cuối</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(assignment.updatedAt)}
                    </p>
                  </div>

                  {assignment.user && (
                    <div className="pt-2 border-t">
                      <p className="text-sm font-medium mb-2">Người tạo</p>
                      <div className="flex items-start space-x-3 bg-muted/50 p-3 rounded-md">
                        <div className="w-10 h-10 flex items-center justify-center bg-primary/10 rounded-full overflow-hidden text-primary">
                          {assignment.user.avatar ? (
                            <img 
                              src={assignment.user.avatar} 
                              alt={assignment.user.fullName} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-lg font-bold">
                              {assignment.user.fullName?.charAt(0) || assignment.user.userName?.charAt(0) || 'T'}
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{assignment.user.fullName}</p>
                          <p className="text-xs text-muted-foreground">{assignment.user.email}</p>
                          <p className="text-xs text-muted-foreground mt-1">SĐT: {assignment.user.phoneNumber}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {assignment.classes && assignment.classes.length > 0 && (
                    <div className="pt-2 border-t">
                      <p className="text-sm font-medium mb-2">Lớp học ({assignment.classes.length})</p>
                      <div className="space-y-2">
                        {assignment.classes.map((classroom) => (
                          <div key={classroom.classroomId} className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{classroom.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="flex justify-center py-12">
            <p>Không tìm thấy thông tin bài tập.</p>
          </div>
        )}
      </div>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa bài tập &quot;{assignment?.title}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Mọi dữ liệu liên quan đến bài tập này sẽ bị xóa vĩnh viễn.
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
                'Xóa bài tập'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AuthGuard>
  );
} 