'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { ClassroomService, AddClassScheduleRequest, ClassSchedule } from '@/lib/api/classes';
import { Trash2 } from 'lucide-react';

export interface ScheduleModalProp {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  classId: string;
  classSchedules: ClassSchedule[];
  onSchedulesUpdated: (updatedSchedules: ClassSchedule[]) => void;
}

export function ScheduleModal({ 
  isOpen, 
  setIsOpen, 
  classId,
  classSchedules,
  onSchedulesUpdated
}: ScheduleModalProp) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State cho form thêm lịch học mới
  const [newSchedule, setNewSchedule] = useState({
    dayOfWeek: '1', // Mặc định là thứ 2
    startTime: '08:00',
    endTime: '09:30'
  });
  
  // Xử lý thay đổi ngày trong tuần
  const handleDayChange = (value: string) => {
    setNewSchedule(prev => ({ ...prev, dayOfWeek: value }));
  };
  
  // Xử lý thay đổi giờ bắt đầu
  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewSchedule(prev => ({ ...prev, startTime: e.target.value }));
  };
  
  // Xử lý thay đổi giờ kết thúc
  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewSchedule(prev => ({ ...prev, endTime: e.target.value }));
  };
  
  // Xử lý thêm lịch học mới
  const handleAddSchedule = async () => {
    try {
      setIsSubmitting(true);
      
      // Kiểm tra thời gian hợp lệ
      if (newSchedule.startTime >= newSchedule.endTime) {
        toast({
          variant: 'destructive',
          title: 'Thời gian không hợp lệ',
          description: 'Thời gian kết thúc phải sau thời gian bắt đầu.'
        });
        return;
      }
      
      // Tạo request data
      const scheduleData: AddClassScheduleRequest = {
        dayOfWeek: parseInt(newSchedule.dayOfWeek),
        startTime: `${newSchedule.startTime}:00`,
        endTime: `${newSchedule.endTime}:00`,
        classroomId: classId
      };
      
      // Gọi API để thêm lịch học mới
      const result = await ClassroomService.addClassSchedule(scheduleData);
      
      // Lấy lại danh sách lịch học cập nhật
      const updatedSchedules = await ClassroomService.getSchedulesByClassroomId(classId);
      
      // Cập nhật UI
      onSchedulesUpdated(updatedSchedules);
      
      toast({
        title: 'Thành công',
        description: 'Đã thêm lịch học mới'
      });
      
      // Reset form
      setNewSchedule({
        dayOfWeek: '1',
        startTime: '08:00',
        endTime: '09:30'
      });
      
    } catch (error: any) {
      console.error('Lỗi khi thêm lịch học:', error);
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: error.message || 'Không thể thêm lịch học'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Xử lý xóa lịch học
  const handleDeleteSchedule = async (scheduleId: string) => {
    try {
      setIsSubmitting(true);
      
      // Gọi API để xóa lịch học
      await ClassroomService.deleteClassSchedule(scheduleId);
      
      // Lấy lại danh sách lịch học cập nhật
      const updatedSchedules = await ClassroomService.getSchedulesByClassroomId(classId);
      
      // Cập nhật UI
      onSchedulesUpdated(updatedSchedules);
      
      toast({
        title: 'Thành công',
        description: 'Đã xóa lịch học'
      });
    } catch (error: any) {
      console.error('Lỗi khi xóa lịch học:', error);
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: error.message || 'Không thể xóa lịch học'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Map tên ngày trong tuần
  const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Quản lý lịch học</DialogTitle>
          <DialogDescription>
            Thêm hoặc xóa lịch học cho lớp này
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <h3 className="font-medium text-sm">Thêm lịch học mới</h3>
          
          <div className="grid grid-cols-12 gap-2">
            {/* Chọn ngày trong tuần */}
            <div className="col-span-4">
              <Label htmlFor="day-of-week" className="sr-only">Ngày</Label>
              <Select value={newSchedule.dayOfWeek} onValueChange={handleDayChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn ngày" />
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
            
            {/* Thời gian bắt đầu */}
            <div className="col-span-3">
              <Label htmlFor="start-time" className="sr-only">Giờ bắt đầu</Label>
              <Input 
                id="start-time" 
                type="time" 
                value={newSchedule.startTime} 
                onChange={handleStartTimeChange}
              />
            </div>
            
            {/* Thời gian kết thúc */}
            <div className="col-span-3">
              <Label htmlFor="end-time" className="sr-only">Giờ kết thúc</Label>
              <Input 
                id="end-time" 
                type="time" 
                value={newSchedule.endTime} 
                onChange={handleEndTimeChange}
              />
            </div>
            
            {/* Nút thêm */}
            <div className="col-span-2">
              <Button 
                type="button" 
                onClick={handleAddSchedule} 
                disabled={isSubmitting}
                className="w-full"
              >
                Thêm
              </Button>
            </div>
          </div>
          
          {/* Danh sách lịch học hiện tại */}
          <div className="mt-4">
            <h3 className="font-medium text-sm mb-2">Lịch học hiện tại</h3>
            
            {classSchedules.length > 0 ? (
              <div className="space-y-2 max-h-[300px] overflow-auto">
                {classSchedules.map((schedule) => (
                  <div 
                    key={schedule.classScheduleId} 
                    className="flex justify-between items-center p-2 border rounded-md"
                  >
                    <div>
                      <span className="font-medium">{dayNames[schedule.dayOfWeek]}</span>
                      <span className="mx-2">|</span>
                      <span>{schedule.startTime.substring(0, 5)} - {schedule.endTime.substring(0, 5)}</span>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteSchedule(schedule.classScheduleId)} 
                      disabled={isSubmitting}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground text-sm">
                Chưa có lịch học nào được thiết lập
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setIsOpen(false)}
          >
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 