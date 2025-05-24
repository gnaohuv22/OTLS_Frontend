'use client';

import React, { useState, useEffect } from 'react';
import { Edit, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Resource } from './types';
import { ResourceService, SubjectDTO } from '@/lib/api/resource';
import { DebounceInput } from '@/components/ui/debounce-input';
import { DebounceTextarea } from '@/components/ui/debounce-textarea';

interface ResourceEditDialogProps {
  resource: Resource;
  onEdit?: (updatedResource: any) => Promise<void>;
  subjects?: SubjectDTO[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ResourceEditDialog({ 
  resource, 
  onEdit, 
  subjects = [],
  open: controlledOpen,
  onOpenChange: setControlledOpen
}: ResourceEditDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  
  // Use either controlled or uncontrolled state
  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
  const setOpen = setControlledOpen || setUncontrolledOpen;
  
  const [title, setTitle] = useState(resource.title);
  const [description, setDescription] = useState(resource.description);
  const [difficulty, setDifficulty] = useState<string>(resource.difficulty.charAt(0).toUpperCase() + resource.difficulty.slice(1));
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [subjectId, setSubjectId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Find the current subject ID when the dialog opens
  useEffect(() => {
    if (open && subjects.length > 0) {
      const currentSubject = subjects.find(s => s.subjectName === resource.subject);
      if (currentSubject) {
        setSubjectId(currentSubject.subjectId);
      }
    }
  }, [open, resource.subject, subjects]);

  const handleThumbnailUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!onEdit) return;
    
    try {
      setIsSubmitting(true);
      
      // Process thumbnail if provided
      let processedThumbnail = thumbnailFile;
      if (thumbnailFile) {
        try {
          processedThumbnail = await ResourceService.processThumbnail(thumbnailFile);
        } catch (error) {
          console.error('Error processing thumbnail:', error);
          // Continue with the original file if processing fails
        }
      }
      
      console.log('Resource authorId:', resource.authorId);
      // Prepare the update data - keeping the same metadata to preserve view/download counts
      await onEdit({
        resourceId: resource.id,
        title,
        description,
        difficultyLevel: difficulty,
        thumbnailFile: processedThumbnail,
        owner: resource.authorId,
        subjectId: subjectId || undefined
      });
      
      setIsSubmitting(false);
      setOpen(false);
    } catch (error) {
      console.error('Failed to update resource:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!setControlledOpen && (
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4 mr-1" />
            Chỉnh sửa
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa tài nguyên</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin tài nguyên của bạn.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right" htmlFor="title">
              Tiêu đề
            </Label>
            <DebounceInput 
              id="title" 
              value={title}
              onValueChange={(value) => setTitle(value)}
              className="col-span-3" 
              required
              debounceDelay={500}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right" htmlFor="description">
              Mô tả
            </Label>
            <DebounceTextarea 
              id="description" 
              value={description}
              onValueChange={(value) => setDescription(value)}
              className="col-span-3"
              debounceDelay={500}
            />
          </div>
          {subjects.length > 0 && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right" htmlFor="subject">
                Môn học
              </Label>
              <Select value={subjectId} onValueChange={setSubjectId}>
                <SelectTrigger className="col-span-3" id="subject">
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
          )}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right" htmlFor="difficulty">
              Độ khó
            </Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger className="col-span-3" id="difficulty">
                <SelectValue placeholder="Chọn độ khó" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Beginner">Cơ bản</SelectItem>
                <SelectItem value="Intermediate">Trung bình</SelectItem>
                <SelectItem value="Advanced">Nâng cao</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right" htmlFor="thumbnail">
              Ảnh bìa
            </Label>
            <div className="col-span-3">
              <Input
                type="file"
                id="thumbnail"
                accept="image/*"
                onChange={handleThumbnailUpload}
              />
              {thumbnailFile && (
                <div className="text-xs text-muted-foreground mt-1">
                  Đã chọn: {thumbnailFile.name}
                </div>
              )}
              {resource.thumbnail && !thumbnailFile && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-10 h-10 overflow-hidden rounded border">
                    <img
                      src={resource.thumbnail}
                      alt="Thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">Ảnh bìa hiện tại</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-between pt-2">
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang cập nhật...
                </>
              ) : (
                'Cập nhật'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 