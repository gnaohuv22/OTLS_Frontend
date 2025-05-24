'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { ClassroomService, AddClassroomRequest } from '@/lib/api/classes';
import { UserService, UserInformation } from '@/lib/api/user';
import { DebounceInput } from '@/components/ui/debounce-input';
import { DebounceTextarea } from '@/components/ui/debounce-textarea';
import { SubjectService, SubjectDTO } from '@/lib/api/resource';

interface AdminCreateClassDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateClass: (classData: any) => void; // Đã sửa kiểu hàm này từ Promise<void> thành void
}

export function AdminCreateClassDialog({
  isOpen,
  onOpenChange,
  onCreateClass
}: AdminCreateClassDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [className, setClassName] = useState('');
  const [classSubject, setClassSubject] = useState('');
  const [classDesc, setClassDesc] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [teachers, setTeachers] = useState<UserInformation[]>([]);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(false);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
  
  // Lấy danh sách giáo viên
  useEffect(() => {
    const fetchTeachers = async () => {
      if (!isOpen) return;
      
      try {
        setIsLoadingTeachers(true);
        const allUsers = await UserService.getAllUsers();
        
        // Lọc ra chỉ giữ lại giáo viên
        const teachersList = allUsers.filter(user => user.roleName === 'Teacher');
        setTeachers(teachersList);
      } catch (error: any) {
        console.error('Lỗi khi lấy danh sách giáo viên:', error);
        toast({
          variant: 'destructive',
          title: 'Lỗi',
          description: 'Không thể tải danh sách giáo viên. Vui lòng thử lại sau.',
        });
      } finally {
        setIsLoadingTeachers(false);
      }
    };
    
    fetchTeachers();
  }, [isOpen, toast]);

  // Fetch subjects when dialog opens
  useEffect(() => {
    const fetchSubjects = async () => {
      if (!isOpen) return;
      
      try {
        setIsLoadingSubjects(true);
        const subjectsList = await SubjectService.getAllSubjects();
        setSubjects(subjectsList.map((subject: SubjectDTO) => subject.subjectName));
      } catch (error: any) {
        console.error('Lỗi khi lấy danh sách môn học:', error);
        toast({
          variant: 'destructive',
          title: 'Lỗi',
          description: 'Không thể tải danh sách môn học. Vui lòng thử lại sau.',
        });
      } finally {
        setIsLoadingSubjects(false);
      }
    };
    
    fetchSubjects();
  }, [isOpen, toast]);

  // Reset form
  const resetForm = () => {
    setClassName('');
    setClassSubject('');
    setClassDesc('');
    setSelectedTeacherId('');
    setIsSubmitting(false);
  };

  // Xử lý đóng form
  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  // Xử lý submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!className || !classSubject || !selectedTeacherId) {
      toast({
        variant: 'destructive',
        title: 'Vui lòng điền đầy đủ thông tin',
        description: 'Tên lớp, môn học và giáo viên phụ trách là bắt buộc.',
      });
      return;
    }

    // Tránh submit nhiều lần
    if (isSubmitting) return;
    
    setIsSubmitting(true);

    try {
      // Tạo mô tả từ subject và description
      const fullDescription = classDesc 
        ? `Môn học: ${classSubject}\n\n${classDesc}`
        : `Môn học: ${classSubject}`;
      
      // Tạo dữ liệu cho API
      const classroomData: AddClassroomRequest = {
        name: className,
        description: fullDescription,
        userId: selectedTeacherId,
        isOnlineMeeting: 'Inactive' // Mặc định là Inactive
      };
      
      // Gọi API tạo lớp học
      const newClassroom = await ClassroomService.addClassroom(classroomData);
      
      // Tạo mã ngẫu nhiên cho lớp học (mock data)
      const classCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      // Thông báo thành công
      toast({
        title: 'Thành công',
        description: 'Lớp học đã được tạo thành công.',
      });
      
      // Gọi function onCreateClass để cập nhật UI (chỉ gọi sau khi API thành công)
      onCreateClass({
        ...newClassroom,
        subject: classSubject,
        code: classCode
      });
      
      // Reset form after successful submission
      resetForm();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: error.message || 'Đã xảy ra lỗi khi tạo lớp học. Vui lòng thử lại sau.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Tạo lớp học mới</DialogTitle>
          <DialogDescription>
            Tạo lớp học mới và chỉ định giáo viên phụ trách
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-2"
            >
              <Label htmlFor="name" className="font-medium">
                Tên lớp học <span className="text-red-500">*</span>
              </Label>
              <DebounceInput
                id="name"
                placeholder="Ví dụ: Toán học 5A"
                value={className}
                onValueChange={setClassName}
                required
                className="transition-all duration-200"
                debounceDelay={500}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-2"
            >
              <Label htmlFor="subject" className="font-medium">
                Môn học <span className="text-red-500">*</span>
              </Label>
              <Select
                value={classSubject}
                onValueChange={setClassSubject}
                required
                disabled={isLoadingSubjects}
              >
                <SelectTrigger className="transition-all duration-200">
                  <SelectValue placeholder={isLoadingSubjects ? "Đang tải..." : "Chọn môn học"} />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-2"
            >
              <Label htmlFor="teacher" className="font-medium">
                Giáo viên phụ trách <span className="text-red-500">*</span>
              </Label>
              <Select
                value={selectedTeacherId}
                onValueChange={setSelectedTeacherId}
                required
                disabled={isLoadingTeachers}
              >
                <SelectTrigger className="transition-all duration-200">
                  <SelectValue placeholder={isLoadingTeachers ? "Đang tải..." : "Chọn giáo viên"} />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.userID} value={teacher.userID}>
                      {teacher.fullName || teacher.userName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-2"
            >
              <Label htmlFor="description" className="font-medium">
                Mô tả lớp học
              </Label>
              <DebounceTextarea
                id="description"
                placeholder="Mô tả ngắn về lớp học này..."
                value={classDesc}
                onValueChange={setClassDesc}
                className="min-h-[80px] resize-y transition-all duration-200"
                debounceDelay={500}
              />
            </motion.div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="transition-all duration-200"
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isLoadingTeachers || isLoadingSubjects}
              className="transition-all duration-200"
            >
              {isSubmitting ? 'Đang tạo...' : 'Tạo lớp học'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 