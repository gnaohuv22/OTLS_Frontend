'use client';

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { SubjectDTO, SubjectService } from '@/lib/api/resource';

interface EditSubjectDialogProps {
  subject: SubjectDTO | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubjectUpdated: () => void;
}

export function EditSubjectDialog({ 
  subject, 
  open, 
  onOpenChange, 
  onSubjectUpdated 
}: EditSubjectDialogProps) {
  const [subjectName, setSubjectName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Update subject name when the subject prop changes
  useEffect(() => {
    if (subject) {
      setSubjectName(subject.subjectName);
    }
  }, [subject]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !subjectName.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Tên môn học không được để trống',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await SubjectService.editSubject(subject.subjectId, subjectName);
      toast({
        title: 'Thành công',
        description: 'Cập nhật môn học thành công',
      });
      onOpenChange(false);
      onSubjectUpdated();
    } catch (error: any) {
      console.error('Error editing subject:', error);
      toast({
        title: 'Lỗi',
        description: error.message || 'Cập nhật môn học thất bại. Vui lòng thử lại.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chỉnh sửa môn học</DialogTitle>
          <DialogDescription>
            Cập nhật tên môn học
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editName" className="text-right">
                Tên môn học
              </Label>
              <Input
                id="editName"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                className="col-span-3"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting || !subjectName.trim()}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang cập nhật...
                </>
              ) : (
                'Cập nhật'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 