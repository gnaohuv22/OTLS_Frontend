'use client';

import React, { useState } from 'react';
import { Upload, AlertCircle, Loader2 } from 'lucide-react';
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
import { SubjectDTO } from '@/lib/api/resource';
import { DebounceInput } from '@/components/ui/debounce-input';
import { DebounceTextarea } from '@/components/ui/debounce-textarea';

interface ResourceUploadDialogProps {
  onUpload?: (resourceData: any) => void;
  subjects?: SubjectDTO[];
  isUploading?: boolean;
}

export function ResourceUploadDialog({ 
  onUpload, 
  subjects = [],
  isUploading = false
}: ResourceUploadDialogProps) {
  const [open, setOpen] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('Intermediate');
  const [fileSizeError, setFileSizeError] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setFileSizeError(`Tệp quá lớn (${(file.size / (1024 * 1024)).toFixed(2)}MB). Kích thước tối đa là 50MB.`);
        event.target.value = '';
        setSelectedFile(null);
        return;
      } else {
        setFileSizeError(null);
        setSelectedFile(file);
      }
    }
  };

  const handleThumbnailUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!selectedFile) return;
    
    // Create a clean resource data object with all required fields
    const resourceData = {
      title,
      description,
      file: selectedFile,
      thumbnailFile: thumbnailFile,
      subjectId: selectedSubjectId, // Important: Send the subjectId correctly
      difficulty: selectedDifficulty,
    };
    
    // Call the onUpload callback if provided
    if (onUpload) {
      onUpload(resourceData);
    }
    
    // Don't close dialog or reset form immediately if isUploading is true
    // The parent component should handle closing the dialog after successful upload
    if (!isUploading) {
      resetForm();
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setThumbnailFile(null);
    setFileSizeError(null);
    setTitle('');
    setDescription('');
    setOpen(false);
  };

  const handleCancel = () => {
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="transition-all duration-200 hover:shadow-md">
          <Upload className="mr-2 h-4 w-4" />
          Tải lên tài nguyên
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Tải lên tài nguyên mới</DialogTitle>
          <DialogDescription>
            Chia sẻ tài liệu học tập của bạn với cộng đồng.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right" htmlFor="title">
              Tiêu đề <span className="text-red-500">*</span>
            </Label>
            <DebounceInput
              id="title"
              name="title"
              className="col-span-3"
              required
              value={title}
              onValueChange={setTitle}
              debounceDelay={500}
            />
          </div>
          {subjects.length > 0 && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right" htmlFor="subjectId">
                Môn học <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={selectedSubjectId} 
                onValueChange={setSelectedSubjectId}
                required
              >
                <SelectTrigger className="col-span-3" id="subjectId">
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
              Độ khó <span className="text-red-500">*</span>
            </Label>
            <Select 
              value={selectedDifficulty} 
              onValueChange={setSelectedDifficulty}
              required
            >
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
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right" htmlFor="description">
              Mô tả
            </Label>
            <DebounceTextarea
              id="description"
              name="description"
              className="col-span-3"
              value={description}
              onValueChange={setDescription}
              debounceDelay={500}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right" htmlFor="file">
              Tệp <span className="text-red-500">*</span>
            </Label>
            <div className="col-span-3">
              <Input 
                type="file" 
                id="file" 
                name="file" 
                onChange={handleFileUpload} 
                required 
              />
              <div className="text-xs text-muted-foreground mt-1">
                Kích thước tối đa: 50MB
              </div>
              {fileSizeError && (
                <Alert variant="destructive" className="mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {fileSizeError}
                  </AlertDescription>
                </Alert>
              )}
              {selectedFile && !fileSizeError && (
                <div className="text-xs text-muted-foreground mt-1">
                  Đã chọn: {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)}MB)
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right" htmlFor="thumbnailFile">
              Ảnh bìa
            </Label>
            <div className="col-span-3">
              <Input 
                type="file" 
                id="thumbnailFile" 
                name="thumbnailFile" 
                accept="image/*"
                onChange={handleThumbnailUpload} 
              />
              <div className="text-xs text-muted-foreground mt-1">
                Ảnh đại diện cho tài nguyên (không bắt buộc)
              </div>
              {thumbnailFile && (
                <div className="text-xs mt-1">
                  Đã chọn: {thumbnailFile.name}
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-between pt-2">
            <Button variant="outline" type="button" onClick={handleCancel} disabled={isUploading}>
              Hủy
            </Button>
            <Button type="submit" disabled={!!fileSizeError || isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang tải lên...
                </>
              ) : (
                'Tải lên'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 