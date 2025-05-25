'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LoaderIcon, Send, X } from 'lucide-react';
import { AnnouncementService } from '@/lib/api/announcement';
import { NewAnnouncementFormProps } from '../types';

export function NewAnnouncementForm({
  classroomId,
  userData,
  onCreateSuccess,
  onCreateError
}: NewAnnouncementFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    isImportant: false,
    isPinned: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    // Validate form data
    if (!formData.title.trim() || !formData.content.trim()) {
      onCreateError('Vui lòng nhập đầy đủ tiêu đề và nội dung');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const newAnnouncement = await AnnouncementService.createAnnouncement({
        title: formData.title.trim(),
        content: formData.content.trim(),
        isImportant: formData.isImportant,
        authorId: userData.id,
        classroomId,
        isPinned: formData.isPinned
      });

      // Reset form after successful creation
      setFormData({
        title: '',
        content: '',
        isImportant: false,
        isPinned: false
      });

      onCreateSuccess(newAnnouncement);
    } catch (error: any) {
      console.error('Lỗi khi tạo thông báo:', error);
      onCreateError(error.message || 'Không thể tạo thông báo');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      title: '',
      content: '',
      isImportant: false,
      isPinned: false
    });
  };

  const isFormValid = formData.title.trim() && formData.content.trim();

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Tạo thông báo mới</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="announcement-title">Tiêu đề</Label>
            <Input
              id="announcement-title"
              placeholder="Nhập tiêu đề thông báo"
              value={formData.title}
              onChange={(e) => setFormData({
                ...formData, 
                title: e.target.value
              })}
              disabled={isSubmitting}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="announcement-content">Nội dung</Label>
            <Textarea
              id="announcement-content"
              placeholder="Nhập nội dung thông báo hoặc thảo luận"
              rows={5}
              value={formData.content}
              onChange={(e) => setFormData({
                ...formData, 
                content: e.target.value
              })}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="is-important" 
                checked={formData.isImportant}
                onCheckedChange={(checked) => setFormData({
                  ...formData, 
                  isImportant: checked === true
                })}
                disabled={isSubmitting}
              />
              <Label htmlFor="is-important">Đánh dấu là thông báo quan trọng</Label>
            </div>

            {userData.role === 'Teacher' && (
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="is-pinned" 
                  checked={formData.isPinned}
                  onCheckedChange={(checked) => setFormData({
                    ...formData, 
                    isPinned: checked === true
                  })}
                  disabled={isSubmitting}
                />
                <Label htmlFor="is-pinned">Ghim thông báo lên đầu</Label>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={handleCancel}
              className="w-full sm:w-auto"
              disabled={isSubmitting}
            >
              <X className="h-4 w-4 mr-2" />
              Hủy
            </Button>
            <Button 
              onClick={handleSubmit}
              className="w-full sm:w-auto"
              disabled={!isFormValid || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <LoaderIcon className="h-4 w-4 mr-2 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Đăng thông báo
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 