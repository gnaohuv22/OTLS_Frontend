'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AuthGuard } from '@/components/auth/auth-guard';
import { useAuth } from '@/lib/auth-context';
import { ResourceService, ResourceDTO } from '@/lib/api/resource';
import { Loader2, ChevronLeft, Save, Trash2, Download, Eye, FileText, Calendar, User, Link } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

export default function AdminResourceDetailPage() {
  const { toast } = useToast();
  const { userData, role } = useAuth();
  const router = useRouter();
  const params = useParams();
  const resourceId = params.id as string;
  
  const [resource, setResource] = useState<ResourceDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // State cho form chỉnh sửa
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [metaData, setMetaData] = useState('');
  const [difficultyLevel, setDifficultyLevel] = useState('Beginner');
  const [status, setStatus] = useState('Active');
  
  // State cho dialog xóa
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
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
  
  // Lấy thông tin tài nguyên
  useEffect(() => {
    const fetchResource = async () => {
      try {
        setIsLoading(true);
        // Note: This assumes there's a getResourceById function in ResourceService
        // Since it's not in the current API, we'll need to find the resource from the list
        const allResources = await ResourceService.getAllResources();
        const foundResource = allResources.find(r => r.resourceId === resourceId);
        
        if (foundResource) {
          setResource(foundResource);
          
          // Cập nhật state form
          setTitle(foundResource.title);
          setDescription(foundResource.description);
          setMetaData(foundResource.metaData);
          setDifficultyLevel(foundResource.difficultyLevel);
          setStatus(foundResource.status);
        } else {
          throw new Error('Không tìm thấy tài nguyên');
        }
      } catch (error: any) {
        console.error('Lỗi khi lấy thông tin tài nguyên:', error);
        toast({
          title: 'Không thể tải thông tin tài nguyên',
          description: error.message || 'Đã xảy ra lỗi khi tải thông tin tài nguyên.',
          variant: 'destructive',
        });
        router.push('/admin/resources');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (resourceId) {
      fetchResource();
    }
  }, [resourceId, router, toast]);
  
  // Xử lý lưu thông tin
  const handleSave = async () => {
    try {
      if (!resource) return;
      
      setIsSaving(true);
      
      // Tạo dữ liệu cập nhật
      const updateData = {
        resourceId: resource.resourceId,
        title,
        description,
        metaData,
        difficultyLevel,
        owner: resource.owner,
        subjectId: resource.subjectDTO?.subjectId || ''
      };
      
      // Gọi API cập nhật
      const updatedResource = await ResourceService.editResource(updateData);
      
      // Cập nhật state
      setResource(updatedResource);
      
      toast({
        title: 'Cập nhật thành công',
        description: 'Thông tin tài nguyên đã được cập nhật thành công.',
      });
    } catch (error: any) {
      toast({
        title: 'Không thể cập nhật tài nguyên',
        description: error.message || 'Đã xảy ra lỗi khi cập nhật thông tin tài nguyên.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Xử lý xóa tài nguyên
  const handleDelete = async () => {
    try {
      if (!resource) return;
      
      setIsDeleting(true);
      
      // Gọi API xóa tài nguyên
      await ResourceService.deleteResource(resource.resourceId);
      
      toast({
        title: 'Xóa tài nguyên thành công',
        description: 'Tài nguyên đã được xóa thành công.',
      });
      
      // Chuyển về trang danh sách tài nguyên
      router.push('/admin/resources');
    } catch (error: any) {
      toast({
        title: 'Không thể xóa tài nguyên',
        description: error.message || 'Đã xảy ra lỗi khi xóa tài nguyên.',
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
          <Button 
            variant="outline" 
            onClick={() => router.push('/admin/resources')}
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
              Xóa tài nguyên
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
            <span>Đang tải thông tin tài nguyên...</span>
          </div>
        ) : resource ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin tài nguyên</CardTitle>
                  <CardDescription>
                    Chỉnh sửa thông tin cơ bản của tài nguyên
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Tiêu đề tài nguyên</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Nhập tiêu đề tài nguyên..."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Mô tả</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Nhập mô tả tài nguyên..."
                      rows={4}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="metaData">Thông tin bổ sung</Label>
                    <Textarea
                      id="metaData"
                      value={metaData}
                      onChange={(e) => setMetaData(e.target.value)}
                      placeholder="Nhập thông tin bổ sung..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="difficultyLevel">Độ khó</Label>
                      <Select value={difficultyLevel} onValueChange={setDifficultyLevel}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Beginner">Cơ bản</SelectItem>
                          <SelectItem value="Intermediate">Trung bình</SelectItem>
                          <SelectItem value="Advanced">Nâng cao</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="status">Trạng thái</Label>
                      <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Active">Hoạt động</SelectItem>
                          <SelectItem value="Inactive">Không hoạt động</SelectItem>
                          <SelectItem value="Draft">Bản nháp</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Preview tài nguyên</CardTitle>
                  <CardDescription>
                    Xem trước và truy cập tài nguyên
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {resource.thumbnailUrl && (
                    <div className="space-y-2">
                      <Label>Hình ảnh đại diện</Label>
                      <div className="border rounded-lg p-4">
                        <img
                          src={resource.thumbnailUrl}
                          alt={resource.title}
                          className="max-w-full h-auto max-h-64 mx-auto rounded"
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      onClick={() => window.open(resource.resourceUrl, '_blank')}
                      className="flex-1"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Xem tài nguyên
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = resource.resourceUrl;
                        link.download = resource.title;
                        link.click();
                      }}
                      className="flex-1"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Tải xuống
                    </Button>
                  </div>
                  
                  <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                    <div className="flex items-center gap-2">
                      <Link className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">URL:</span>
                    </div>
                    <p className="text-sm text-muted-foreground break-all">
                      {resource.resourceUrl}
                    </p>
                  </div>
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
                    <p className="text-sm font-medium">Trạng thái</p>
                    <div className="flex items-center mt-1">
                      <Badge variant={getStatusBadgeVariant(resource.status)}>
                        {resource.status === 'Active' && 'Hoạt động'}
                        {resource.status === 'Inactive' && 'Không hoạt động'}
                        {resource.status === 'Draft' && 'Bản nháp'}
                      </Badge>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <p className="text-sm font-medium">Loại tài nguyên</p>
                    <p className="text-sm text-muted-foreground">
                      {resource.resourceType}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">Độ khó</p>
                    <div className="flex items-center mt-1">
                      <Badge variant={getDifficultyBadgeVariant(resource.difficultyLevel)}>
                        {resource.difficultyLevel === 'Beginner' && 'Cơ bản'}
                        {resource.difficultyLevel === 'Intermediate' && 'Trung bình'}
                        {resource.difficultyLevel === 'Advanced' && 'Nâng cao'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">Kích thước</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(resource.resourceSize)}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">Môn học</p>
                    <p className="text-sm text-muted-foreground">
                      {resource.subjectDTO?.subjectName || 'Không xác định'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">Ngày tạo</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(resource.createdAt)}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">Lần cập nhật cuối</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(resource.updatedAt)}
                    </p>
                  </div>

                  {resource.userDTO && (
                    <div className="pt-2 border-t">
                      <p className="text-sm font-medium mb-2">Người tạo</p>
                      <div className="flex items-start space-x-3 bg-muted/50 p-3 rounded-md">
                        <div className="w-10 h-10 flex items-center justify-center bg-primary/10 rounded-full overflow-hidden text-primary">
                          {resource.userDTO.avatar ? (
                            <img 
                              src={resource.userDTO.avatar} 
                              alt={resource.userDTO.fullName} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-lg font-bold">
                              {resource.userDTO.fullName?.charAt(0) || resource.userDTO.userName?.charAt(0) || 'U'}
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{resource.userDTO.fullName}</p>
                          <p className="text-xs text-muted-foreground">{resource.userDTO.email}</p>
                          <p className="text-xs text-muted-foreground mt-1">SĐT: {resource.userDTO.phoneNumber}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="flex justify-center py-12">
            <p>Không tìm thấy thông tin tài nguyên.</p>
          </div>
        )}
      </div>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa tài nguyên &quot;{resource?.title}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Mọi dữ liệu liên quan đến tài nguyên này sẽ bị xóa vĩnh viễn.
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
                'Xóa tài nguyên'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AuthGuard>
  );
} 