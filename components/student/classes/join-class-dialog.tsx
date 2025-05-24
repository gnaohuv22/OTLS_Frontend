'use client';

import React from 'react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface JoinClassDialogProps {
  onJoinClass: (code: string) => Promise<void>;
}

export function JoinClassDialog({ onJoinClass }: JoinClassDialogProps) {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Vui lòng nhập mã lớp học",
      });
      return;
    }

    setIsLoading(true);
    try {
      await onJoinClass(code);
      toast({
        title: "Thành công",
        description: "Bạn đã tham gia lớp học thành công",
      });
      setOpen(false);
      setCode('');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tham gia lớp học. Vui lòng kiểm tra lại mã lớp.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Tham gia lớp học
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tham gia lớp học</DialogTitle>
          <DialogDescription>
            Nhập mã lớp học để tham gia. Mã này được cung cấp bởi giáo viên của bạn.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="class-code">Mã lớp học</Label>
            <Input
              id="class-code"
              placeholder="Ví dụ: ABC123"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Đang xử lý..." : "Tham gia"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 