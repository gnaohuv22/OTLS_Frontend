'use client';

import React, { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, Trash2 } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { 
  ClassroomService, 
  AddClassroomRequest, 
  UpdateClassroomRequest,
  AddClassScheduleRequest,
  ClassSchedule 
} from '@/lib/api/classes';
import { SubjectService, SubjectDTO } from '@/lib/api/resource';
import { useAuth } from '@/lib/auth-context';
import { ClassDetail } from '../types';
import { DebounceInput } from '@/components/ui/debounce-input';
import { DebounceTextarea } from '@/components/ui/debounce-textarea';

// Interface cho lịch học
interface ScheduleItem {
  id: string | number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isNew?: boolean;
  day?: string; // For compatibility with edit modal format
}

// Map chuyển đổi từ số sang tên ngày trong tuần
const DAY_OF_WEEK_MAP: Record<number, string> = {
  0: 'Chủ nhật',
  1: 'Thứ 2',
  2: 'Thứ 3',
  3: 'Thứ 4',
  4: 'Thứ 5',
  5: 'Thứ 6',
  6: 'Thứ 7'
};

// Map chuyển đổi từ tên ngày sang số
const DAY_NAME_TO_NUMBER: Record<string, number> = {
  'Chủ nhật': 0,
  'Thứ 2': 1,
  'Thứ 3': 2,
  'Thứ 4': 3,
  'Thứ 5': 4,
  'Thứ 6': 5,
  'Thứ 7': 6
};

export interface ClassFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitClass: (classData: any) => Promise<void>;
  classDetail?: ClassDetail;
  rawSchedules?: ClassSchedule[];
  mode: 'create' | 'edit';
}

function ClassFormModalComponent({
  isOpen,
  onOpenChange,
  onSubmitClass,
  classDetail,
  rawSchedules,
  mode = 'create'
}: ClassFormModalProps) {
  const { toast } = useToast();
  const { userData } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subjects, setSubjects] = useState<SubjectDTO[]>([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
  
  // Form state
  const [className, setClassName] = useState('');
  const [classSubject, setClassSubject] = useState('');
  const [classDesc, setClassDesc] = useState('');
  const [classSchedules, setClassSchedules] = useState<ScheduleItem[]>([
    { id: crypto.randomUUID(), dayOfWeek: 1, startTime: '08:00', endTime: '09:30', isNew: true }
  ]);

  // Load subjects from API
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setIsLoadingSubjects(true);
        const subjectsData = await SubjectService.getAllSubjects();
        setSubjects(subjectsData);
      } catch (error) {
        console.error('Error fetching subjects:', error);
        toast({
          variant: 'destructive',
          title: 'Lỗi',
          description: 'Không thể tải danh sách môn học.',
        });
      } finally {
        setIsLoadingSubjects(false);
      }
    };

    if (isOpen) {
      fetchSubjects();
    }
  }, [isOpen, toast]);

  // Initialize form with classDetail data if in edit mode
  useEffect(() => {
    if (mode === 'edit' && classDetail) {
      setClassName(classDetail.name);
      setClassSubject(classDetail.subject);
      
      // Extract description (exclude the subject line)
      const descLines = classDetail.description?.split('\n').filter(line => !line.startsWith('Môn học:'));
      setClassDesc(descLines ? descLines.join('\n').trim() : '');
      
      // Use raw schedule data instead of parsing formatted strings
      if (rawSchedules && rawSchedules.length > 0) {
        const scheduleItems: ScheduleItem[] = rawSchedules.map((schedule, index) => ({
          id: schedule.classScheduleId || (index + 1),
          dayOfWeek: schedule.dayOfWeek,
          startTime: schedule.startTime.substring(0, 5), // Remove seconds from time
          endTime: schedule.endTime.substring(0, 5), // Remove seconds from time
          day: DAY_OF_WEEK_MAP[schedule.dayOfWeek] || 'Không xác định'
        }));
        
        setClassSchedules(scheduleItems);
      } else {
        // Fallback to default schedule if no raw data available
        setClassSchedules([]);
      }
    } else {
      // Reset form for create mode
      resetForm();
    }
  }, [mode, classDetail, rawSchedules, isOpen]);

  // Thêm lịch học mới
  const addSchedule = () => {
    const newSchedule: ScheduleItem = { 
      id: crypto.randomUUID(), 
      dayOfWeek: 1, 
      startTime: '08:00', 
      endTime: '09:30',
      isNew: true
    };
    setClassSchedules([...classSchedules, newSchedule]);
  };

  // Xóa lịch học
  const removeSchedule = (id: string | number) => {
    if (classSchedules.length > 1) {
      setClassSchedules(classSchedules.filter(s => s.id !== id));
    } else {
      toast({
        variant: 'destructive',
        title: 'Không thể xóa',
        description: 'Lớp học phải có ít nhất một lịch học.',
      });
    }
  };

  // Cập nhật lịch học
  const updateSchedule = (id: string | number, field: 'dayOfWeek' | 'startTime' | 'endTime', value: string | number) => {
    const updatedSchedules = classSchedules.map(s =>
      s.id === id ? { ...s, [field]: value } : s
    );

    setClassSchedules(updatedSchedules);
  };

  // Enhanced schedule overlap checking algorithm
  const checkScheduleOverlap = (schedules: ScheduleItem[]) => {
    const validSchedules = schedules.filter(s => 
      s.dayOfWeek !== undefined && s.startTime && s.endTime && s.startTime < s.endTime
    );

    // Group schedules by day of week
    const schedulesByDay = validSchedules.reduce((acc, schedule) => {
      const day = schedule.dayOfWeek;
      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day].push(schedule);
      return acc;
    }, {} as Record<number, ScheduleItem[]>);

    // Check for overlaps within each day
    for (const [dayOfWeek, daySchedules] of Object.entries(schedulesByDay)) {
      if (daySchedules.length > 1) {
        // Sort schedules by start time for easier comparison
        const sortedSchedules = daySchedules.sort((a, b) => a.startTime.localeCompare(b.startTime));
        
        for (let i = 0; i < sortedSchedules.length - 1; i++) {
          const current = sortedSchedules[i];
          const next = sortedSchedules[i + 1];
          
          // Convert time strings to minutes for easier comparison
          const currentStart = timeToMinutes(current.startTime);
          const currentEnd = timeToMinutes(current.endTime);
          const nextStart = timeToMinutes(next.startTime);
          const nextEnd = timeToMinutes(next.endTime);
          
          // Check for overlap: current ends after next starts, or next starts before current ends
          if (currentEnd > nextStart) {
            const dayName = DAY_OF_WEEK_MAP[parseInt(dayOfWeek)];
            const timeRange = `${current.startTime}-${current.endTime} và ${next.startTime}-${next.endTime}`;
            return { day: dayName, timeRange };
          }
        }
      }
    }
    
    return null; // No overlaps found
  };

  // Helper function to convert time string (HH:MM) to minutes
  const timeToMinutes = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Reset form
  const resetForm = () => {
    setClassName('');
    setClassSubject('');
    setClassSchedules([
      { id: crypto.randomUUID(), dayOfWeek: 1, startTime: '08:00', endTime: '09:30', isNew: true }
    ]);
    setClassDesc('');
    setIsSubmitting(false);
  };

  // Xử lý đóng form
  const handleClose = () => {
    if (mode === 'create') {
      resetForm();
    }
    onOpenChange(false);
  };

  // Lưu hoặc cập nhật lịch học
  const saveSchedules = async (classroomId: string, isEdit: boolean = false) => {
    try {
      const savedSchedules: ClassSchedule[] = [];
      
      // Nếu đang edit, xóa tất cả lịch cũ và tạo lịch mới
      if (isEdit) {
        // Get existing schedules
        const existingSchedules = await ClassroomService.getSchedulesByClassroomId(classroomId);
        
        // Delete all existing schedules
        for (const schedule of existingSchedules) {
          await ClassroomService.deleteClassSchedule(schedule.classScheduleId);
        }
      }
      
      // Lưu từng lịch học
      for (const schedule of classSchedules) {
        const scheduleData: AddClassScheduleRequest = {
          dayOfWeek: schedule.dayOfWeek,
          startTime: schedule.startTime + ':00',
          endTime: schedule.endTime + ':00',
          classroomId: classroomId
        };
        
        const savedSchedule = await ClassroomService.addClassSchedule(scheduleData);
        savedSchedules.push(savedSchedule);
      }
      
      return savedSchedules;
    } catch (error: any) {
      console.error('Lỗi khi lưu lịch học:', error);
      throw new Error('Không thể lưu lịch học. ' + error.message);
    }
  };

  // Validate form
  const validateForm = () => {
    if (!className || !classSubject) {
      toast({
        variant: 'destructive',
        title: 'Vui lòng điền đầy đủ thông tin',
        description: 'Tên lớp và môn học là bắt buộc.',
      });
      return false;
    }

    // Kiểm tra lịch học hợp lệ
    for (const schedule of classSchedules) {
      if (!schedule.startTime || !schedule.endTime) {
        toast({
          variant: 'destructive',
          title: 'Lịch học không hợp lệ',
          description: 'Vui lòng điền đầy đủ thời gian bắt đầu và kết thúc cho mỗi lịch học.',
        });
        return false;
      }
      
      // Kiểm tra thời gian bắt đầu phải trước thời gian kết thúc
      if (schedule.startTime >= schedule.endTime) {
        toast({
          variant: 'destructive',
          title: 'Lịch học không hợp lệ',
          description: 'Thời gian bắt đầu phải trước thời gian kết thúc.',
        });
        return false;
      }
    }

    // Kiểm tra trùng lặp lịch học
    const conflictInfo = checkScheduleOverlap(classSchedules);
    if (conflictInfo) {
      toast({
        variant: 'destructive',
        title: 'Trùng lặp thời gian',
        description: `Lịch học bị trùng vào ${conflictInfo.day} từ ${conflictInfo.timeRange}. Vui lòng chọn thời gian khác.`,
      });
      return false;
    }

    return true;
  };

  // Xử lý submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Tạo mô tả từ subject và description
      const fullDescription = classDesc 
        ? `Môn học: ${classSubject}\n\n${classDesc}`
        : `Môn học: ${classSubject}`;
      
      if (!userData?.userID) {
        throw new Error('Không tìm thấy thông tin người dùng.');
      }
      
      let responseClassroom;
      let savedSchedules;
      
      if (mode === 'create') {
        // Create new classroom
        const classroomData: AddClassroomRequest = {
          name: className,
          description: fullDescription,
          userId: userData.userID,
          isOnlineMeeting: 'Inactive' // Mặc định là Inactive
        };
        
        // Call API to create classroom
        responseClassroom = await ClassroomService.addClassroom(classroomData);
        
        // Save schedules
        savedSchedules = await saveSchedules(responseClassroom.classroomId);
      } else if (mode === 'edit' && classDetail?.classroomId) {
        // Update existing classroom
        const classroomData: UpdateClassroomRequest = {
          classroomId: classDetail.classroomId,
          name: className,
          description: fullDescription,
          userId: userData.userID
        };
        
        // Call API to update classroom
        responseClassroom = await ClassroomService.updateClassroom(classroomData);
        
        // Update schedules
        savedSchedules = await saveSchedules(classDetail.classroomId, true);
      } else {
        throw new Error('Invalid operation mode or missing classroom ID');
      }
      
      // Prepare data for UI update
      const formattedData = {
        ...responseClassroom,
        subject: classSubject,
        schedules: savedSchedules.map(s => ({
          day: DAY_OF_WEEK_MAP[s.dayOfWeek],
          time: `${s.startTime.substring(0, 5)} - ${s.endTime.substring(0, 5)}`
        }))
      };
      
      // Call the callback function to update UI
      await onSubmitClass(formattedData);
      
      toast({
        title: mode === 'create' ? 'Thành công' : 'Cập nhật thành công',
        description: mode === 'create' 
          ? 'Lớp học đã được tạo thành công.' 
          : 'Thông tin lớp học đã được cập nhật thành công.',
      });
      
      // Reset form after successful submission
      if (mode === 'create') {
        resetForm();
      }
      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: error.message || `Đã xảy ra lỗi khi ${mode === 'create' ? 'tạo' : 'cập nhật'} lớp học. Vui lòng thử lại sau.`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const dialogTitle = mode === 'create' ? 'Tạo lớp học mới' : 'Chỉnh sửa thông tin lớp học';
  const dialogDescription = mode === 'create' 
    ? 'Điền thông tin để tạo lớp học mới cho học sinh'
    : `Cập nhật thông tin và lịch học cho lớp ${classDetail?.name}`;
  const submitButtonText = mode === 'create' 
    ? (isSubmitting ? 'Đang tạo...' : 'Tạo lớp học')
    : (isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi');

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>
            {dialogDescription}
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
              {mode === 'create' ? (
                <DebounceInput
                  id="name"
                  placeholder="Ví dụ: Toán học 5A"
                  value={className}
                  onValueChange={setClassName}
                  debounceDelay={500}
                  required
                  className="transition-all duration-200"
                />
              ) : (
                <Input 
                  id="name"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  required
                />
              )}
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
                  <SelectValue placeholder={isLoadingSubjects ? "Đang tải môn học..." : "Chọn môn học"} />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.subjectId} value={subject.subjectName}>
                      {subject.subjectName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <Label className="font-medium">
                  Lịch học <span className="text-red-500">*</span>
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1 transition-all duration-200 hover:shadow-sm"
                  onClick={addSchedule}
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  Thêm lịch
                </Button>
              </div>

              <AnimatePresence>
                {classSchedules.map((schedule) => (
                  <motion.div 
                    key={schedule.id.toString()} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2"
                  >
                    <div>
                      <Select
                        value={schedule.dayOfWeek.toString()}
                        onValueChange={(value) => updateSchedule(schedule.id, 'dayOfWeek', parseInt(value))}
                      >
                        <SelectTrigger className="transition-all duration-200">
                          <SelectValue placeholder="Ngày" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Thứ 2</SelectItem>
                          <SelectItem value="2">Thứ 3</SelectItem>
                          <SelectItem value="3">Thứ 4</SelectItem>
                          <SelectItem value="4">Thứ 5</SelectItem>
                          <SelectItem value="5">Thứ 6</SelectItem>
                          <SelectItem value="6">Thứ 7</SelectItem>
                          <SelectItem value="0">Chủ nhật</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="relative">
                      {mode === 'create' ? (
                        <DebounceInput
                          type="time"
                          value={schedule.startTime}
                          onValueChange={(value) => updateSchedule(schedule.id, 'startTime', value)}
                          className="transition-all duration-200"
                          debounceDelay={500}
                        />
                      ) : (
                        <Input
                          type="time"
                          value={schedule.startTime}
                          onChange={(e) => updateSchedule(schedule.id, 'startTime', e.target.value)}
                        />
                      )}
                    </div>
                    <div className="relative">
                      {mode === 'create' ? (
                        <DebounceInput
                          type="time"
                          value={schedule.endTime}
                          onValueChange={(value) => updateSchedule(schedule.id, 'endTime', value)}
                          className="transition-all duration-200"
                          debounceDelay={500}
                        />
                      ) : (
                        <Input
                          type="time"
                          value={schedule.endTime}
                          onChange={(e) => updateSchedule(schedule.id, 'endTime', e.target.value)}
                        />
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSchedule(schedule.id)}
                      className="transition-all duration-200 hover:bg-red-50 hover:text-red-500"
                      disabled={classSchedules.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
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
              {mode === 'create' ? (
                <DebounceTextarea
                  id="description"
                  placeholder="Mô tả ngắn về lớp học này..."
                  value={classDesc}
                  onValueChange={setClassDesc}
                  debounceDelay={500}
                  className="min-h-[80px] resize-y transition-all duration-200"
                />
              ) : (
                <Textarea 
                  id="description"
                  value={classDesc}
                  onChange={(e) => setClassDesc(e.target.value)}
                  rows={3}
                />
              )}
            </motion.div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="transition-all duration-200"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="transition-all duration-200"
            >
              {submitButtonText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export const ClassFormModal = memo(ClassFormModalComponent); 