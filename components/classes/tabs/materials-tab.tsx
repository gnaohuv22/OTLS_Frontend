import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, Download, Pencil, Trash2, FileText, FileImage, FileVideo, FileAudio, FileArchive, File } from 'lucide-react';
import { MaterialsTabProps } from '../types';
import { ClassroomService, Resource, ClassroomMaterialRequest } from '@/lib/api/classes';
import { SubjectService } from '@/lib/api/resource';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/auth-context';
import Image from 'next/image';

interface SubjectDTO {
  subjectId: string;
  subjectName: string;
}

export function MaterialsTab({ classDetail, role, formatDate }: MaterialsTabProps) {
  const { toast } = useToast();
  const { userData } = useAuth();
  const [materials, setMaterials] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subjects, setSubjects] = useState<SubjectDTO[]>([]);
  const [editingMaterial, setEditingMaterial] = useState<Resource | null>(null);
  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState<Resource | null>(null);

  // Form refs
  const titleRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const resourceFileRef = useRef<HTMLInputElement>(null);
  const thumbnailFileRef = useRef<HTMLInputElement>(null);
  
  // Form state
  const [formState, setFormState] = useState({
    title: '',
    description: '',
    subjectId: '',
    difficultyLevel: 'Beginner' as 'Beginner' | 'Intermediate' | 'Advanced',
  });

  // Fetch materials and subjects from API
  useEffect(() => {
    const fetchData = async () => {
      if (!classDetail?.classroomId) return;
      
      try {
        setIsLoading(true);
        
        // Fetch materials
        const materialsResponse = await ClassroomService.getMaterialsByClassroomId(classDetail.classroomId);
        if (materialsResponse && materialsResponse.resourceDTOs) {
          console.log('Materials loaded:', materialsResponse.resourceDTOs.length);
          setMaterials(materialsResponse.resourceDTOs);
        } else {
          setMaterials([]);
        }
        
        // Fetch subjects
        const subjectsResponse = await SubjectService.getAllSubjects();
        if (subjectsResponse) {
          setSubjects(subjectsResponse);
        }
      } catch (error: any) {
        if (error.status === 404) {
          setMaterials([]);
          setSubjects([]);
        } else {
          toast({
            title: 'Lỗi',
          description: 'Không thể tải danh sách tài liệu',
            variant: 'destructive',
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [classDetail?.classroomId, toast]);

  // Reset form
  const resetForm = () => {
    setFormState({
      title: '',
      description: '',
      subjectId: '',
      difficultyLevel: 'Beginner',
    });
    setEditingMaterial(null);
  };

  // Open form dialog for new material
  const handleAddNewMaterial = () => {
    resetForm();
    setDialogOpen(true);
  };

  // Open form dialog for editing
  const handleEditMaterial = (material: Resource) => {
    setEditingMaterial(material);
    setFormState({
      title: material.title,
      description: material.description,
      subjectId: material.subjectDTO?.subjectId || '',
      difficultyLevel: material.difficultyLevel as any,
    });
    setDialogOpen(true);
  };

  // Handle form submission (add or edit)
  const handleSubmit = async () => {
    if (!classDetail?.classroomId || !userData?.userID) {
      toast({
        title: 'Lỗi',
        description: 'Thiếu thông tin lớp học hoặc người dùng',
        variant: 'destructive',
      });
      return;
    }

    if (!formState.title || !formState.description || !formState.subjectId) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng điền đầy đủ thông tin',
        variant: 'destructive',
      });
      return;
    }

    // For new materials, both files are required
    if (!editingMaterial && !resourceFileRef.current?.files?.[0]) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng tải lên tài liệu học tập',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Create material data object with required fields
      const materialData: ClassroomMaterialRequest = {
        classroomId: classDetail.classroomId,
        userId: userData.userID,
        title: formState.title,
        description: formState.description,
        metaData: JSON.stringify({ viewCount: 0, downloadCount: 0 }),
        difficultyLevel: formState.difficultyLevel,
        subjectId: formState.subjectId,
        thumbnailFile: thumbnailFileRef.current?.files?.[0] as File,
        resourceFile: resourceFileRef.current?.files?.[0] as File,
      };

      console.log("Material data properties:", Object.keys(materialData));
      
      // For updates, add the resourceId
      if (editingMaterial) {
        materialData.resourceId = editingMaterial.resourceId;
        
        // For update, files are optional
        // The API method will handle setting the files if they exist
        
        await ClassroomService.updateMaterial(materialData);
        toast({
          title: 'Thành công',
          description: 'Cập nhật tài liệu thành công',
        });
      } else {
        // For adding new material
        await ClassroomService.addMaterial(materialData);
        toast({
          title: 'Thành công',
          description: 'Thêm tài liệu mới thành công',
        });
      }

      // Refresh material list
      const materialsResponse = await ClassroomService.getMaterialsByClassroomId(classDetail.classroomId);
      if (materialsResponse && materialsResponse.resourceDTOs) {
        setMaterials(materialsResponse.resourceDTOs);
      }

      // Close dialog and reset form
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error submitting material:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể lưu tài liệu. Vui lòng thử lại sau.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = (material: Resource) => {
    setMaterialToDelete(material);
    setConfirmDeleteDialogOpen(true);
  };

  // Delete material
  const handleDeleteMaterial = async () => {
    if (!materialToDelete || !classDetail?.classroomId) return;

    try {
      setIsSubmitting(true);
      await ClassroomService.deleteMaterial(classDetail.classroomId, materialToDelete.resourceId);
      
      // Update materials list
      setMaterials(prev => prev.filter(m => m.resourceId !== materialToDelete.resourceId));
      
      toast({
        title: 'Thành công',
        description: 'Xóa tài liệu thành công',
      });
    } catch (error) {
      console.error('Error deleting material:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa tài liệu. Vui lòng thử lại sau.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
      setConfirmDeleteDialogOpen(false);
      setMaterialToDelete(null);
    }
  };

  // Get icon based on resource type
  const getResourceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'text':
        return <FileText className="h-5 w-5" />;
      case 'image':
        return <FileImage className="h-5 w-5" />;
      case 'video':
        return <FileVideo className="h-5 w-5" />;
      case 'audio':
        return <FileAudio className="h-5 w-5" />;
      case 'zip':
      case 'archive':
        return <FileArchive className="h-5 w-5" />;
      default:
        return <File className="h-5 w-5" />;
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <h3 className="text-lg font-semibold">Tài liệu học tập</h3>
          {role === 'Teacher' && (
            <Button className="gap-2 w-full sm:w-auto" disabled>
              <PlusCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Thêm tài liệu mới</span>
              <span className="sm:hidden">Thêm tài liệu</span>
            </Button>
          )}
        </div>
        
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-4" />
              <Skeleton className="h-10 w-1/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <h3 className="text-lg font-semibold">Tài liệu học tập</h3>
        {role === 'Teacher' && (
          <Button 
            className="gap-2 w-full sm:w-auto"
            onClick={handleAddNewMaterial}
          >
            <PlusCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Thêm tài liệu mới</span>
            <span className="sm:hidden">Thêm tài liệu</span>
          </Button>
        )}
      </div>
      
      {materials.map((material) => (
        <Card key={material.resourceId} className="overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {material.thumbnailUrl && (
              <div className="w-full md:w-40 h-40 relative">
                <img 
                  src={material.thumbnailUrl} 
                  alt={material.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <CardTitle className="text-base sm:text-lg">{material.title}</CardTitle>
                  <div className="flex flex-wrap gap-2">
                    <Badge>{material.resourceType}</Badge>
                    <Badge variant="outline">{material.difficultyLevel}</Badge>
                    {material.subjectDTO && (
                      <Badge variant="secondary">{material.subjectDTO.subjectName}</Badge>
                    )}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 text-sm text-muted-foreground">
                  <span>Ngày đăng: {formatDate(material.createdAt)}</span>
                  <span className="hidden sm:inline">•</span>
                  <span>Kích thước: {formatFileSize(material.resourceSize)}</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">{material.description}</p>
                <div className="flex justify-between mt-4 pt-4 border-t border-gray-100">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    asChild
                  >
                    <a href={`${material.resourceUrl}`} target="_blank" rel="noopener noreferrer">
                      Xem chi tiết
                    </a>
                  </Button>
                  
                  <div className="flex space-x-2">
                    {(role === 'Teacher' || role === 'Admin') && (
                      <>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={(e) => {
                            e.preventDefault();
                            handleEditMaterial(material);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive hover:text-destructive/90"
                          onClick={(e) => {
                            e.preventDefault();
                            handleDeleteConfirm(material);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    
                    <Button
                      size="icon"
                      variant="ghost"
                      asChild
                    >
                      <a 
                        href={material.resourceUrl} 
                        download={material.title}
                        onClick={(e) => e.stopPropagation()}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </div>
          </div>
        </Card>
      ))}
      
      {materials.length === 0 && (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              Hiện tại chưa có tài liệu nào trong lớp học này.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Material Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-full max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingMaterial ? 'Chỉnh sửa tài liệu' : 'Thêm tài liệu mới'}</DialogTitle>
            <DialogDescription>
              {editingMaterial 
                ? 'Cập nhật thông tin tài liệu học tập cho lớp học này.' 
                : 'Tải lên tài liệu học tập cho lớp học này.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="material-title">Tiêu đề tài liệu</Label>
              <Input 
                id="material-title" 
                placeholder="Nhập tiêu đề tài liệu" 
                ref={titleRef}
                value={formState.title}
                onChange={(e) => setFormState({...formState, title: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="material-description">Mô tả</Label>
              <Textarea 
                id="material-description" 
                placeholder="Nhập mô tả về tài liệu"
                ref={descriptionRef}
                value={formState.description}
                onChange={(e) => setFormState({...formState, description: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="material-subject">Môn học</Label>
              <Select 
                value={formState.subjectId} 
                onValueChange={(value) => setFormState({...formState, subjectId: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn môn học" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.subjectId} value={subject.subjectId}>
                      {subject.subjectName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="material-difficulty">Độ khó</Label>
              <Select 
                value={formState.difficultyLevel} 
                onValueChange={(value: any) => setFormState({...formState, difficultyLevel: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn độ khó" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Cơ bản</SelectItem>
                  <SelectItem value="Intermediate">Trung bình</SelectItem>
                  <SelectItem value="Advanced">Nâng cao</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="material-file">Tài liệu {!editingMaterial && '(Bắt buộc)'}</Label>
              <div className="border rounded p-2">
                <Input 
                  id="material-file" 
                  type="file" 
                  ref={resourceFileRef}
                />
              </div>
              {editingMaterial && (
                <p className="text-xs text-muted-foreground">
                  Để trống nếu không muốn thay đổi tài liệu hiện tại.
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="material-thumbnail">Hình thu nhỏ {false && '(Bắt buộc)'}</Label>
              <div className="border rounded p-2">
                <Input 
                  id="material-thumbnail" 
                  type="file" 
                  accept="image/*" 
                  ref={thumbnailFileRef}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Hình thu nhỏ là tùy chọn, để trống nếu không muốn thêm hình.
              </p>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              type="button" 
              variant="outline" 
              className="w-full sm:w-auto"
              onClick={() => setDialogOpen(false)}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button 
              type="button" 
              className="w-full sm:w-auto"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting 
                ? 'Đang xử lý...' 
                : editingMaterial 
                  ? 'Cập nhật' 
                  : 'Tải lên'
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm delete dialog */}
      <Dialog open={confirmDeleteDialogOpen} onOpenChange={setConfirmDeleteDialogOpen}>
        <DialogContent className="w-full max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa tài liệu</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa tài liệu này? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              type="button" 
              variant="outline" 
              className="w-full sm:w-auto"
              onClick={() => setConfirmDeleteDialogOpen(false)}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button 
              type="button" 
              variant="destructive"
              className="w-full sm:w-auto"
              onClick={handleDeleteMaterial}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Đang xử lý...' : 'Xóa tài liệu'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 