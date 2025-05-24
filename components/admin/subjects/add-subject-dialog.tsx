'use client';

import React, { useState } from 'react';
import { Loader2, Plus } from 'lucide-react';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { SubjectService } from '@/lib/api/resource';

interface AddSubjectDialogProps {
  onSubjectAdded: () => void;
}

export function AddSubjectDialog({ onSubjectAdded }: AddSubjectDialogProps) {
  const [open, setOpen] = useState(false);
  const [subjectName, setSubjectName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Tên môn học không được để trống',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await SubjectService.addSubject(subjectName);
      toast({
        title: 'Thành công',
        description: 'Thêm môn học mới thành công',
      });
      setSubjectName('');
      setOpen(false);
      onSubjectAdded();
    } catch (error: any) {
      console.error('Error adding subject:', error);
      toast({
        title: 'Lỗi',
        description: error.message || 'Thêm môn học thất bại. Vui lòng thử lại.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Thêm môn học
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thêm môn học mới</DialogTitle>
          <DialogDescription>
            Nhập tên môn học mới để thêm vào hệ thống
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Tên môn học
              </Label>
              <Input
                id="name"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                className="col-span-3"
                placeholder="Nhập tên môn học"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting || !subjectName.trim()}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang thêm...
                </>
              ) : (
                'Thêm môn học'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 