'use client';

import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
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
import { toast } from '@/components/ui/use-toast';
import { SubjectDTO, SubjectService } from '@/lib/api/resource';

interface DeleteSubjectDialogProps {
  subject: SubjectDTO | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubjectDeleted: () => void;
}

export function DeleteSubjectDialog({
  subject,
  open,
  onOpenChange,
  onSubjectDeleted
}: DeleteSubjectDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!subject) return;

    try {
      setIsDeleting(true);
      await SubjectService.deleteSubject(subject.subjectId);
      toast({
        title: 'Thành công',
        description: 'Xóa môn học thành công',
      });
      onOpenChange(false);
      onSubjectDeleted();
    } catch (error: any) {
      console.error('Error deleting subject:', error);
      toast({
        title: 'Lỗi',
        description: error.message || 'Xóa môn học thất bại. Vui lòng thử lại.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa môn học</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa môn học &quot;{subject?.subjectName}&quot;? 
            Hành động này không thể hoàn tác và có thể ảnh hưởng đến các tài nguyên liên quan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xóa...
              </>
            ) : (
              'Xóa môn học'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 