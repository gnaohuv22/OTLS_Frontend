'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthGuard } from '@/components/auth/auth-guard';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Plus, Search, Filter, FileText, Calendar, Users, Download, Eye, Trash2 } from 'lucide-react';
import { ResourceService, ResourceDTO } from '@/lib/api/resource';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

export default function AdminResourcesPage() {
  const { toast } = useToast();
  const { userData, role } = useAuth();
  const router = useRouter();

  const [resources, setResources] = useState<ResourceDTO[]>([]);
  const [filteredResources, setFilteredResources] = useState<ResourceDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [resourceToDelete, setResourceToDelete] = useState<ResourceDTO | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Pagination hook
  const pagination = usePagination({
    data: filteredResources,
    itemsPerPage: 10,
  });

  // Kiểm tra quyền truy cập
  useEffect(() => {
    if (role !== 'Admin') {
      toast({
        title: 'Quyền truy cập bị từ chối',
        description: 'Bạn không có quyền truy cập vào trang quản lý tài nguyên.',
        variant: 'destructive',
      });
      router.push('/dashboard');
    }
  }, [role, router, toast]);

  // Lấy danh sách tài nguyên từ API
  useEffect(() => {
    const fetchResources = async () => {
      try {
        setIsLoading(true);
        const data = await ResourceService.getAllResources();
        setResources(data);
        setFilteredResources(data);
      } catch (error: any) {
        if (error.status === 404) {
          setResources([]);
          setFilteredResources([]);
        } else {
          toast({
            title: 'Không thể tải danh sách tài nguyên',
            description: error.message || 'Đã xảy ra lỗi khi tải danh sách tài nguyên.',
            variant: 'destructive',
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchResources();
  }, [toast]);

  // Lọc tài nguyên dựa trên từ khóa tìm kiếm và bộ lọc
  useEffect(() => {
    const filterResources = () => {
      let result = [...resources];

      // Lọc theo từ khóa tìm kiếm
      if (searchTerm) {
        result = result.filter(
          resource =>
            resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            resource.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Lọc theo môn học
      if (subjectFilter !== 'all') {
        result = result.filter(resource => resource.subjectDTO?.subjectId === subjectFilter);
      }

      // Lọc theo loại tài nguyên
      if (typeFilter !== 'all') {
        result = result.filter(resource => resource.resourceType === typeFilter);
      }

      // Lọc theo trạng thái
      if (statusFilter !== 'all') {
        result = result.filter(resource => resource.status === statusFilter);
      }

      setFilteredResources(result);
      // Reset to first page when filters change
      pagination.goToPage(1);
    };

    filterResources();
  }, [searchTerm, subjectFilter, typeFilter, statusFilter, resources, pagination]);

  // Xử lý xóa tài nguyên
  const handleDeleteResource = async () => {
    if (!resourceToDelete) return;

    try {
      setIsDeleting(true);
      await ResourceService.deleteResource(resourceToDelete.resourceId);

      // Cập nhật lại danh sách tài nguyên
      setResources(prevResources =>
        prevResources.filter(resource => resource.resourceId !== resourceToDelete.resourceId)
      );

      toast({
        title: 'Xóa tài nguyên thành công',
        description: 'Tài nguyên đã được xóa thành công.',
      });

      setIsDeleteDialogOpen(false);
      setResourceToDelete(null);
    } catch (error: any) {
      toast({
        title: 'Không thể xóa tài nguyên',
        description: error.message || 'Đã xảy ra lỗi khi xóa tài nguyên.',
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

  // Format kích thước file
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Lấy badge variant cho trạng thái
  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'default';
      case 'inactive':
        return 'secondary';
      case 'draft':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  // Lấy badge variant cho độ khó
  const getDifficultyBadgeVariant = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'default';
      case 'intermediate':
        return 'secondary';
      case 'advanced':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <AuthGuard>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Quản lý tài nguyên</h1>
            <p className="text-muted-foreground">
              Quản lý và theo dõi tất cả tài nguyên học tập trên nền tảng
            </p>
          </div>
          <Button onClick={() => router.push('/resources/create')}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm tài nguyên mới
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Danh sách tài nguyên</CardTitle>
            <CardDescription>
              Tổng cộng có {filteredResources.length} tài nguyên {searchTerm || subjectFilter !== 'all' || typeFilter !== 'all' || statusFilter !== 'all' ? '(đã lọc)' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Bộ lọc */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm tài nguyên..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>

              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger className="w-full lg:w-[180px]">
                  <SelectValue placeholder="Tất cả môn học" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả môn học</SelectItem>
                  {/* Sẽ được populate từ API subjects */}
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full lg:w-[180px]">
                  <SelectValue placeholder="Tất cả loại" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả loại</SelectItem>
                  <SelectItem value="document">Tài liệu</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="image">Hình ảnh</SelectItem>
                  <SelectItem value="audio">Âm thanh</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full lg:w-[180px]">
                  <SelectValue placeholder="Tất cả trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="Active">Hoạt động</SelectItem>
                  <SelectItem value="Inactive">Không hoạt động</SelectItem>
                  <SelectItem value="Draft">Bản nháp</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bảng dữ liệu */}
            {isLoading ? (
              <div className="flex justify-center items-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-lg">Đang tải danh sách tài nguyên...</span>
              </div>
            ) : pagination.paginatedData.length > 0 ? (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tài nguyên</TableHead>
                      <TableHead>Môn học</TableHead>
                      <TableHead>Người tạo</TableHead>
                      <TableHead>Loại</TableHead>
                      <TableHead>Độ khó</TableHead>
                      <TableHead>Kích thước</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Ngày tạo</TableHead>
                      <TableHead className="text-right">Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagination.paginatedData.map((resource) => (
                      <TableRow key={resource.resourceId}>
                        <TableCell className="font-medium">
                          <div className="flex items-start space-x-3">
                            {resource.thumbnailUrl && (
                              <img
                                src={resource.thumbnailUrl}
                                alt={resource.title}
                                className="w-10 h-10 rounded object-cover"
                              />
                            )}
                            <div className="flex-1">
                              <div className="font-medium">{resource.title}</div>
                              <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                                {resource.description}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {resource.subjectDTO?.subjectName || 'Không xác định'}
                        </TableCell>
                        <TableCell>
                          {resource.userDTO?.fullName || resource.userDTO?.userName || 'Không xác định'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {resource.resourceType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getDifficultyBadgeVariant(resource.difficultyLevel)}>
                            {resource.difficultyLevel === 'Beginner' && 'Cơ bản'}
                            {resource.difficultyLevel === 'Intermediate' && 'Trung bình'}
                            {resource.difficultyLevel === 'Advanced' && 'Nâng cao'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {formatFileSize(resource.resourceSize)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(resource.status)}>
                            {resource.status === 'Active' && 'Hoạt động'}
                            {resource.status === 'Inactive' && 'Không hoạt động'}
                            {resource.status === 'Draft' && 'Bản nháp'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                            {formatDate(resource.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/admin/resources/${resource.resourceId}`)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Xem
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(resource.resourceUrl, '_blank')}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Tải
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive border-destructive hover:bg-destructive/10"
                              onClick={() => {
                                setResourceToDelete(resource);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Xóa
                            </Button>
                          </div>
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
              <div className="text-center py-6">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">Không có tài nguyên</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {searchTerm || subjectFilter !== 'all' || typeFilter !== 'all' || statusFilter !== 'all'
                    ? 'Không tìm thấy tài nguyên phù hợp với bộ lọc.'
                    : 'Chưa có tài nguyên nào được tạo.'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog xác nhận xóa */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xác nhận xóa tài nguyên</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn có chắc chắn muốn xóa tài nguyên <strong>{resourceToDelete?.title}</strong>?
                Hành động này không thể hoàn tác và sẽ xóa tất cả dữ liệu liên quan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  handleDeleteResource();
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
                  'Xóa tài nguyên'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AuthGuard>
  );
} 