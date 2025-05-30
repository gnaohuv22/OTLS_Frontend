'use client';

import React, { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, Trash2, Calendar } from 'lucide-react';
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
import { format, parseISO } from 'date-fns';

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
  isSubmitting?: boolean;
}

function ClassFormModalComponent({
  isOpen,
  onOpenChange,
  onSubmitClass,
  classDetail,
  rawSchedules,
  mode = 'create',
  isSubmitting: externalIsSubmitting
}: ClassFormModalProps) {
  const { toast } = useToast();
  const { userData } = useAuth();
  const [isLocalSubmitting, setIsLocalSubmitting] = useState(false);
  const isSubmitting = externalIsSubmitting !== undefined ? externalIsSubmitting : isLocalSubmitting;
  const [subjects, setSubjects] = useState<SubjectDTO[]>([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
  
  // Form state
  const [className, setClassName] = useState('');
  const [classSubject, setClassSubject] = useState('');
  const [classDesc, setClassDesc] = useState('');
  const [classSchedules, setClassSchedules] = useState<ScheduleItem[]>([
    { id: crypto.randomUUID(), dayOfWeek: 1, startTime: '08:00', endTime: '09:30', isNew: true }
  ]);
  // Thêm state cho endDate
  const [endDate, setEndDate] = useState<string | undefined>(undefined);

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
      setClassSubject(classDetail.subject || '');

      // Extract description (exclude the subject line)
      const descLines = classDetail.description?.split('\n').filter(line => !line.startsWith('Môn học:'));
      setClassDesc(descLines ? descLines.join('\n').trim() : '');
      
      // Set endDate if available
      setEndDate(classDetail.endDate || undefined);
      
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

  // Cập nhật startDate để xử lý thời gian đúng khi so sánh
  const isEndDateValid = () => {
    if (!endDate) return true; // Không có endDate là hợp lệ
    
    const startDateToCompare = classDetail?.startDate 
      ? classDetail.startDate 
      : new Date().toISOString().split('T')[0];

    return endDate > startDateToCompare;
  };

  // Xử lý thay đổi endDate từ input date
  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      const date = new Date(e.target.value);
      date.setUTCHours(0, 0, 0, 0); // Set time to 02:00:00 UTC
      setEndDate(date.toISOString());
    } else {
      setEndDate(undefined);
    }
  };

  // Định dạng endDate để hiển thị trong input date
  const formatEndDateForInput = () => {
    if (!endDate) return '';
    return endDate.split('T')[0]; // Lấy phần YYYY-MM-DD từ chuỗi ISO
  }

  // Reset form
  const resetForm = () => {
    setClassName('');
    setClassSubject('');
    setClassSchedules([
      { id: crypto.randomUUID(), dayOfWeek: 1, startTime: '08:00', endTime: '09:30', isNew: true }
    ]);
    setClassDesc('');
    setEndDate(undefined);
    setIsLocalSubmitting(false);
  };

  // Xử lý đóng form
  const handleClose = () => {
    if (mode === 'create') {
      resetForm();
    }
    onOpenChange(false);
  };

  // Lưu hoặc cập nhật lịch học - tối ưu để không xóa hết rồi tạo lại
  const saveSchedules = async (classroomId: string, isEdit: boolean = false) => {
    try {
      // Nếu đang tạo mới lớp học, chỉ cần thêm tất cả lịch học
      if (!isEdit) {
        const savedSchedules: ClassSchedule[] = [];
        
        // Thêm từng lịch học mới
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
      }
      
      // Nếu đang chỉnh sửa, thực hiện so sánh và chỉ cập nhật những thay đổi
      // Lấy danh sách lịch học hiện tại
      const existingSchedules = await ClassroomService.getSchedulesByClassroomId(classroomId);
      
      // Danh sách lịch học cuối cùng để trả về
      let finalSchedules: ClassSchedule[] = [];
      
      // Phân loại các lịch học thành: cần thêm mới, cần xóa, cần cập nhật
      
      // 1. Xác định các lịch học cần xóa (có trong existingSchedules nhưng không có trong classSchedules)
      const schedulesToDelete = existingSchedules.filter(existing => {
        // Không tìm thấy lịch tương ứng trong lịch mới
        return !classSchedules.some(newSchedule => {
          // Nếu newSchedule có classScheduleId (trường hợp đã lưu trước đó)
          if ('classScheduleId' in newSchedule) {
            return newSchedule.classScheduleId === existing.classScheduleId;
          }
          
          // Với lịch mới, kiểm tra trùng khớp về ngày và giờ
          return (
            newSchedule.dayOfWeek === existing.dayOfWeek &&
            newSchedule.startTime + ':00' === existing.startTime && 
            newSchedule.endTime + ':00' === existing.endTime
          );
        });
      });
      
      // 2. Xóa các lịch không còn sử dụng
      for (const scheduleToDelete of schedulesToDelete) {
        await ClassroomService.deleteClassSchedule(scheduleToDelete.classScheduleId);
      }
      
      // 3. Xử lý từng lịch trong danh sách mới
      for (const newSchedule of classSchedules) {
        // Chuẩn bị dữ liệu chung
        const scheduleData = {
          dayOfWeek: newSchedule.dayOfWeek,
          startTime: newSchedule.startTime + ':00',
          endTime: newSchedule.endTime + ':00',
          classroomId: classroomId
        };
        
        // Trường hợp 1: Lịch đã tồn tại và cần cập nhật
        if ('classScheduleId' in newSchedule && typeof newSchedule.classScheduleId === 'string') {
          // Tìm lịch tương ứng trong existingSchedules
          const existingSchedule = existingSchedules.find(
            s => s.classScheduleId === newSchedule.classScheduleId
          );
          
          // Nếu tìm thấy và có sự thay đổi, cập nhật
          if (existingSchedule && (
            existingSchedule.dayOfWeek !== newSchedule.dayOfWeek ||
            existingSchedule.startTime !== scheduleData.startTime ||
            existingSchedule.endTime !== scheduleData.endTime
          )) {
            // Cập nhật lịch học
            const updatedSchedule = await ClassroomService.updateClassSchedule({
              ...scheduleData,
              classScheduleId: newSchedule.classScheduleId
            });
            finalSchedules.push(updatedSchedule);
          } else if (existingSchedule) {
            // Không có thay đổi, giữ nguyên
            finalSchedules.push(existingSchedule);
          }
        } 
        // Trường hợp 2: Lịch mới hoàn toàn, cần thêm
        else {
          // Kiểm tra xem lịch này đã tồn tại về mặt nội dung chưa (trùng ngày và giờ)
          const existingMatch = existingSchedules.find(
            s => s.dayOfWeek === scheduleData.dayOfWeek && 
                s.startTime === scheduleData.startTime && 
                s.endTime === scheduleData.endTime
          );
          
          if (existingMatch) {
            // Lịch đã tồn tại về mặt nội dung, không cần thêm
            finalSchedules.push(existingMatch);
          } else {
            // Lịch hoàn toàn mới, thêm vào
            const savedSchedule = await ClassroomService.addClassSchedule(scheduleData);
            finalSchedules.push(savedSchedule);
          }
        }
      }
      
      return finalSchedules;
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

    // Kiểm tra ngày kết thúc
    if (endDate && !isEndDateValid()) {
      toast({
        variant: 'destructive',
        title: 'Ngày kết thúc không hợp lệ',
        description: 'Ngày kết thúc phải sau ngày bắt đầu lớp học.',
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

    if (externalIsSubmitting === undefined) {
      setIsLocalSubmitting(true);
    }

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
          startDate: new Date().toISOString(), // Sử dụng định dạng ISO đầy đủ
          endDate: endDate,
          isOnlineMeeting: 'Inactive' // Mặc định là Inactive
        };

        console.log('classroomData', classroomData);
        
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
          userId: userData.userID,
          startDate: classDetail.startDate,
          endDate: endDate
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
        endDate: endDate, // Đưa endDate vào dữ liệu trả về
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
      if (externalIsSubmitting === undefined) {
        setIsLocalSubmitting(false);
      }
    }
  };

  // Format startDate để hiển thị (nếu có)
  const formattedStartDate = classDetail?.startDate 
    ? format(parseISO(classDetail.startDate), 'dd/MM/yyyy')
    : 'Ngày hiện tại';

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

            {/* Thêm trường ngày kết thúc */}
            {mode === 'edit' && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 }}
                className="space-y-2"
              >
                <div className="flex justify-between">
                  <Label htmlFor="end-date" className="font-medium">
                    Ngày kết thúc (tùy chọn)
                  </Label>
                  {endDate && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setEndDate(undefined)} 
                      className="h-6 px-2 text-xs"
                      disabled={isSubmitting}
                      type="button"
                    >
                      Xóa
                    </Button>
                  )}
                </div>
                
                <div className="relative flex">
                  <Input
                    id="end-date"
                    type="date"
                    value={formatEndDateForInput()}
                    onChange={handleEndDateChange}
                    min={classDetail?.startDate ? new Date(classDetail.startDate).toISOString().split('T')[0] : ''}
                    className="w-full"
                    disabled={isSubmitting}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                
                {endDate && !isEndDateValid() && (
                  <p className="text-sm text-destructive">
                    Ngày kết thúc phải sau ngày bắt đầu ({formattedStartDate})
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Nếu không chọn ngày kết thúc, lớp học sẽ hoạt động vô thời hạn
                </p>
              </motion.div>
            )}

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
              disabled={isSubmitting}
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