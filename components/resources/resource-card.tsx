'use client'; // Resource Card Component

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit, Download, Eye, Trash2, MoreVertical, BookOpen, Calendar, User } from 'lucide-react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ResourceCardProps, itemVariants } from './types';
import { renderTypeIcon, renderDifficultyBadge, getTypeBadgeStyle } from './utils';
import { ResourceService, ResourceUtils } from '@/lib/api/resource';
import { FileViewer } from '@/lib/file-viewer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/lib/auth-context';
import { toast } from '@/components/ui/use-toast';
import { ResourceEditDialog } from './resource-edit-dialog';
import { useToast } from '@/components/ui/use-toast';

export const ResourceCard = React.memo(
  ({ resource, index, onDeleteResource, onEditResource, subjects }: ResourceCardProps) => {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const { toast } = useToast();
    const { user, role } = useAuth();
    
    // Kiểm tra xem người dùng hiện tại có phải là chủ sở hữu hoặc admin
    const canDelete = (user?.userID === resource.authorId) || role === 'Admin' || role === 'Teacher';
    const canEdit = canDelete;
    
    const handleDelete = async () => {
      if (!onDeleteResource) return;
      
      try {
        setIsDeleting(true);
        await onDeleteResource(resource.id);
        setIsDeleting(false);
        setIsDeleteDialogOpen(false);
      } catch (error) {
        console.error('Xóa tài nguyên thất bại:', error);
        setIsDeleting(false);
      }
    };

    // Xử lý chỉnh sửa tài nguyên
    const handleEdit = async (updatedData: any) => {
      if (!onEditResource) return;
      await onEditResource(updatedData);
    };

    // Xử lý tải xuống tài nguyên - tải trực tiếp thay vì mở trong tab mới
    const handleDownload = async () => {
      try {
        // Đảm bảo có ID tài nguyên
        if (!resource.id) {
          console.error('Thiếu ID tài nguyên');
          return;
        }
        
        // Lấy phần mở rộng file để phát hiện nếu là file .docx
        const fileExtension = resource.url.split('.').pop()?.toLowerCase();
        
        // Trích xuất metadata hiện tại
        const metaData = resource.metaData || '{}';
        let currentMetadata;
        try {
          currentMetadata = JSON.parse(metaData);
        } catch (e) {
          currentMetadata = {};
        }
        
        // Chỉ cập nhật số lượt tải, giữ nguyên các metadata khác
        const updatedMetadata = {
          ...currentMetadata,
          downloadCount: (currentMetadata.downloadCount || 0) + 1
        };
        
        // Tìm ID môn học từ tên môn học
        const matchingSubject = subjects?.find(s => s.subjectName === resource.subject);
        const subjectId = matchingSubject?.subjectId || '';
        
        // Tạo payload API đầy đủ với các trường cần thiết
        const payload = {
          resourceId: resource.id,
          metaData: JSON.stringify(updatedMetadata),
          // Chỉ bao gồm các trường này nếu API yêu cầu
          title: resource.title,
          description: resource.description,
          difficultyLevel: resource.difficulty,
          owner: resource.authorId,
          subjectId: subjectId
          // Không bao gồm thumbnailFile để tránh tải lên lại
        };
        
        // Debug: Hiển thị payload gửi đến API
        console.log('Tải xuống - Payload API:', payload);
        
        // Bắt đầu tải xuống ngay lập tức - không chờ cập nhật API
        FileViewer.downloadFile(resource.url, resource.title);
        
        // Cập nhật metadata tài nguyên trong nền mà không chờ hoàn thành
        ResourceService.editResource(payload).catch(error => {
          console.error('Không thể cập nhật số lượt tải:', error);
        });
      } catch (error) {
        console.error('Không thể tải xuống tài nguyên:', error);
        // Không cần hiển thị lỗi cho người dùng khi cập nhật metadata trong nền
      }
    };

    // Xử lý xem trước tài nguyên - sử dụng Office Online Viewer cho tài liệu Office
    const handlePreview = async () => {
      try {
        // Đảm bảo có ID tài nguyên
        if (!resource.id) {
          console.error('Thiếu ID tài nguyên');
          return;
        }
        
        // Trích xuất metadata hiện tại
        const metaData = resource.metaData || '{}';
        let currentMetadata;
        try {
          currentMetadata = JSON.parse(metaData);
        } catch (e) {
          currentMetadata = {};
        }
        
        // Chỉ cập nhật số lượt xem, giữ nguyên các metadata khác
        const updatedMetadata = {
          ...currentMetadata,
          viewCount: (currentMetadata.viewCount || 0) + 1
        };
        
        // Tìm ID môn học từ tên môn học
        const matchingSubject = subjects?.find(s => s.subjectName === resource.subject);
        const subjectId = matchingSubject?.subjectId || '';

        console.log('ID tác giả tài nguyên:', resource.authorId);
        
        // Tạo payload API đầy đủ với các trường cần thiết
        const payload = {
          resourceId: resource.id,
          metaData: JSON.stringify(updatedMetadata),
          // Chỉ bao gồm các trường này nếu API yêu cầu
          title: resource.title,
          description: resource.description,
          difficultyLevel: resource.difficulty,
          subjectId: subjectId,
          owner: resource.authorId
          // Không bao gồm thumbnailFile để tránh tải lên lại
        };
        
        // Debug: Hiển thị payload gửi đến API
        console.log('Xem trước - Payload API:', payload);
        
        // Lấy URL xem trước phù hợp dựa trên loại file và mở ngay lập tức
        const previewUrl = FileViewer.getPreviewUrl(resource.url);
        window.open(previewUrl, '_blank');
        
        // Cập nhật metadata tài nguyên trong nền mà không chờ hoàn thành
        // Điều này tránh các vấn đề về hiển thị spinner
        ResourceService.editResource(payload).catch(error => {
          console.error('Không thể cập nhật số lượt xem:', error);
        });
      } catch (error) {
        console.error('Không thể xem trước tài nguyên:', error);
        // Không cần hiển thị lỗi cho người dùng khi cập nhật metadata trong nền
      }
    };

    // Trích xuất metadata bổ sung
    const metadata = ResourceUtils.parseMetadata(resource.metaData || '{}');
    // Lấy ngày theo định dạng Tiếng Việt
    const uploadDate = new Date(resource.uploadDate).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return (
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="show"
        transition={{ delay: index * 0.05 }}
        whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
        className="h-full w-full"
      >
        <Card className="h-full overflow-hidden transition-all duration-200 hover:shadow-lg flex flex-col">
          <div className="relative h-40 overflow-hidden bg-muted">
            {resource.thumbnail ? (
              <Image
                src={resource.thumbnail}
                alt={resource.title}
                fill
                style={{ objectFit: 'cover' }}
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="transition-transform duration-300 hover:scale-105"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-r from-primary/20 to-secondary/20 flex items-center justify-center">
                <div className="h-16 w-16 text-primary/60">
                  {renderTypeIcon(resource.type, "h-16 w-16")}
                </div>
              </div>
            )}
            <div className="absolute top-2 right-2 z-10">
              {canDelete && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-7 w-7 rounded-full bg-white/90 backdrop-blur-sm transition-colors hover:bg-primary/20"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          {canEdit && (
                            <DropdownMenuItem 
                              onClick={() => setIsEditDialogOpen(true)}
                              className="cursor-pointer"
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Sửa tài nguyên
                            </DropdownMenuItem>
                          )}
                          {canDelete && onDeleteResource && (
                            <>
                              {canEdit && <DropdownMenuSeparator />}
                              <DropdownMenuItem 
                                className="cursor-pointer text-destructive focus:text-destructive"
                                onClick={() => setIsDeleteDialogOpen(true)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Xóa tài nguyên
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Tùy chọn</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
          <CardHeader className="p-4 pb-0 flex-none">
            <div className="flex items-start justify-between">
              <Badge
                variant="outline"
                className={getTypeBadgeStyle(resource.type)}
              >
                {renderTypeIcon(resource.type)}
                <span className="ml-1">{resource.typeName || resource.type}</span>
              </Badge>
              {renderDifficultyBadge(resource.difficulty)}
            </div>
            <CardTitle className="line-clamp-2 text-base h-12 mt-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>{resource.title}</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{resource.title}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2 flex-1">
            <div className="line-clamp-2 text-sm text-muted-foreground h-10 mb-2">
              {resource.description}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-auto">
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>{resource.authorName}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{uploadDate}</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-2">
              <div className="flex items-center gap-1">
                <Download className="h-3.5 w-3.5" />
                <span>{resource.downloadCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                <span>{resource.viewCount}</span>
              </div>
              {resource.subject && (
                <Badge variant="secondary" className="ml-auto text-xs">
                  <BookOpen className="h-3 w-3 mr-1" />
                  {resource.subject}
                </Badge>
              )}
              <div className="ml-auto text-xs">{resource.size}</div>
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-0 gap-2 flex-wrap flex-none">
            <Button 
              variant="default" 
              size="sm" 
              className="flex-1 transition-all duration-200"
              onClick={handleDownload}
            >
              <Download className="mr-1 h-4 w-4" />
              Tải xuống
            </Button>
            {resource.previewAvailable && (
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 transition-all duration-200"
                onClick={handlePreview}
              >
                <Eye className="mr-1 h-4 w-4" />
                Xem trước
              </Button>
            )}
          </CardFooter>
        </Card>
        
        {/* Edit Dialog */}
        {canEdit && (
          <ResourceEditDialog 
            resource={resource} 
            onEdit={handleEdit}
            subjects={subjects}
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
          />
        )}
        
        {/* Delete confirmation dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xóa tài nguyên này?</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn có chắc chắn muốn xóa tài nguyên "{resource.title}"? 
                Hành động này không thể hoàn tác.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete} 
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? 'Đang xóa...' : 'Xóa'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </motion.div>
    );
  }
);

ResourceCard.displayName = 'ResourceCard'; 