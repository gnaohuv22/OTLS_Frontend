'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { ClassroomService } from '@/lib/api/classes';
import HolidayService from '@/lib/api/holidays';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Import các component đã tách
import {
  ScheduleOverview,
  CalendarView,
  ScheduleDetail,
  ClassSchedule,
  Holiday,
  fadeInUp,
  getUpcomingSchedules,
  mapApiSchedulesToAppSchedules,
} from '@/components/schedule';

// Import các hàm tiện ích mới từ date-utils
import {
  toVietnamTime,
  formatDateToISOString,
  processApiHoliday,
  isHoliday as isDateInHolidayPeriod
} from '@/components/schedule/date-utils';

// Component chính
export default function Schedule() {
  const { role, userData } = useAuth();
  const { toast } = useToast();
  const [currentMonth, setCurrentMonth] = useState(() => toVietnamTime(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => toVietnamTime(new Date()));
  const [scheduleForSelectedDate, setScheduleForSelectedDate] = useState<ClassSchedule[]>([]);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [classSchedules, setClassSchedules] = useState<Record<string, ClassSchedule[]>>({});
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [upcomingCount, setUpcomingCount] = useState<number>(4); // Mặc định hiển thị 4 lịch học sắp tới
  
  // Dùng refs để lưu trữ các giá trị mà không cần trigger re-render khi chúng thay đổi
  const holidaysProcessed = useRef(false);
  const schedulesRef = useRef(classSchedules);

  // Add a new ref to track if we're currently fetching
  const isFetchingRef = useRef(false);

  // Cập nhật ref khi classSchedules thay đổi
  useEffect(() => {
    schedulesRef.current = classSchedules;
  }, [classSchedules]);

  // Fetch lớp học và lịch học
  const fetchClassroomsAndSchedules = useCallback(async () => {
    // Prevent concurrent fetches
    if (isFetchingRef.current) return;
    
    try {
      // Set loading and fetching flags
      setIsLoading(true);
      isFetchingRef.current = true;
      
      let userClassrooms: any[] = [];
      
      // Lấy danh sách lớp học dựa trên vai trò
      if (role === 'Teacher' && userData?.userID) {
        userClassrooms = await ClassroomService.getClassroomsByTeacherId(userData.userID);
      } else if (role === 'Student' && userData?.userID) {
        userClassrooms = await ClassroomService.getClassroomsByStudentId(userData.userID);
      } else {
        // Nếu không có vai trò hoặc userID phù hợp, hiển thị danh sách trống
        setClassrooms([]);
        setClassSchedules({});
        setIsLoading(false);
        isFetchingRef.current = false;
        return;
      }
      
      setClassrooms(userClassrooms);
      
      // Lấy lịch học cho tất cả lớp học bằng API mới
      if (userClassrooms.length > 0) {
        // Tạo danh sách ID lớp học
        const classroomIds = userClassrooms.map(classroom => classroom.classroomId);
        
        // Gọi API mới để lấy lịch học cho tất cả lớp cùng lúc
        const schedulesResponse = await ClassroomService.getSchedulesByClassroomIds(classroomIds);
        
        // Xử lý response và ánh xạ lịch học
        const schedulesMap: Record<string, ClassSchedule[]> = {};
        
        schedulesResponse.forEach(classroomSchedule => {
          // Tìm thông tin lớp học tương ứng
          const classroom = userClassrooms.find(c => c.classroomId === classroomSchedule.classroomId);
          
          if (classroom && classroomSchedule.scheduleInfo) {
            // Chuyển đổi từ định dạng API sang định dạng ứng dụng
            const appSchedules = mapApiSchedulesToAppSchedules(classroomSchedule.scheduleInfo, classroom);
            
            // Thêm lịch học vào map theo ngày
            appSchedules.forEach(schedule => {
              if (schedule.dateString) {
                if (!schedulesMap[schedule.dateString]) {
                  schedulesMap[schedule.dateString] = [];
                }
                schedulesMap[schedule.dateString].push(schedule);
              }
            });
          }
        });
        
        // Cập nhật state
        setClassSchedules(schedulesMap);
      }
    } catch (error: any) {
      if (error.status === 404) {
        setClassrooms([]);
        setClassSchedules({});
      } else {
        toast({
          title: "Lỗi",
          description: "Không thể tải dữ liệu lịch học. Vui lòng thử lại sau.",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [role, userData, toast]);
  
  // Fetch lớp học và lịch học khi component mount
  useEffect(() => {
    fetchClassroomsAndSchedules();
  }, [fetchClassroomsAndSchedules]);

  // Fetch dữ liệu ngày lễ
  const fetchHolidays = useCallback(async () => {
    try {
      // Lấy năm hiện tại và năm tiếp theo để hiển thị ngày lễ liên tục
      const currentYear = new Date().getFullYear();
      const apiHolidays = await HolidayService.getHolidaysForYear(currentYear);
      const nextYearHolidays = await HolidayService.getHolidaysForYear(currentYear + 1);
      
      // Kết hợp danh sách ngày lễ
      const allHolidays = [...apiHolidays, ...nextYearHolidays];

      // Chuyển đổi định dạng ngày lễ từ API sang định dạng sử dụng trong component
      // Sử dụng hàm mới để xử lý đúng timezone và kỳ nghỉ kéo dài nhiều ngày
      let formattedHolidays: Holiday[] = [];
      
      allHolidays.forEach(holiday => {
        const processedHolidays = processApiHoliday(holiday);
        formattedHolidays = [...formattedHolidays, ...processedHolidays];
      });
      
      setHolidays(formattedHolidays);
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu ngày lễ:', error);
    }
  }, []);

  useEffect(() => {
    fetchHolidays();
  }, [fetchHolidays]);

  // Thêm ngày lễ vào danh sách lịch học để hiển thị
  useEffect(() => {
    // Chỉ xử lý khi có dữ liệu holiday và chưa được xử lý trước đó
    if (holidays.length > 0 && !holidaysProcessed.current) {
      holidaysProcessed.current = true;
      
      // Tạo một bản sao của schedulesMap hiện tại
      const updatedSchedulesMap = { ...schedulesRef.current };
      let hasChanges = false;
      
      // Duyệt qua từng ngày lễ để thêm vào lịch
      holidays.forEach(holiday => {
        const dateString = holiday.date;
        
        // Tạo một lịch mới cho ngày lễ
        const holidaySchedule: ClassSchedule = {
          id: `holiday_${holiday.id}`,
          subject: 'Ngày lễ',
          topic: holiday.name,
          startTime: '00:00',
          endTime: '23:59',
          teacher: '',
          location: '',
          type: 'holiday',
          classId: '',
          dateString,
          isHoliday: true
        };
        
        // Thêm vào danh sách lịch cho ngày này
        if (!updatedSchedulesMap[dateString]) {
          updatedSchedulesMap[dateString] = [];
        }
        
        // Kiểm tra xem đã thêm ngày lễ này chưa
        const holidayExists = updatedSchedulesMap[dateString].some(
          schedule => schedule.isHoliday && schedule.topic === holiday.name
        );
        
        if (!holidayExists) {
          updatedSchedulesMap[dateString] = [
            holidaySchedule,
            ...updatedSchedulesMap[dateString]
          ];
          hasChanges = true;
        }
      });
      
      // Chỉ cập nhật state nếu có thay đổi
      if (hasChanges) {
        setClassSchedules(updatedSchedulesMap);
      }
    }
  }, [holidays]); // Removed classSchedules from dependency array

  // Chuyển đổi mảng holidays thành định dạng đơn giản hơn để truyền vào component
  const holidayDates = useMemo(() => 
    holidays.map(holiday => ({
      date: holiday.date, // date đã được xử lý đúng trong processApiHoliday
      name: holiday.name
    })),
  [holidays]);

  // Các giá trị memoized để tránh tính toán lại
  const monthData = useMemo(() => {
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    return {
      firstDay: firstDayOfMonth,
      lastDay: lastDayOfMonth,
      daysInMonth: lastDayOfMonth.getDate(),
      startDay: firstDayOfMonth.getDay()
    };
  }, [currentMonth]);

  // Danh sách ngày có lịch trong tháng hiện tại
  const datesWithScheduleInCurrentMonth = useMemo(() => {
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    
    // Trích xuất tất cả các ngày trong tháng hiện tại có lịch
    return Object.keys(classSchedules).filter(dateStr => {
      const date = new Date(dateStr);
      return date >= firstDayOfMonth && date <= lastDayOfMonth;
    });
  }, [classSchedules, currentMonth]);
  
  // Kiểm tra nếu một ngày có lịch học (memoized)
  const hasSchedule = useCallback((date: Date) => {
    // Format date to YYYY-MM-DD without timezone conversion
    const dateString = formatDateToISOString(date);
    
    return classSchedules[dateString] && classSchedules[dateString].length > 0;
  }, [classSchedules]);

  // Kiểm tra xem một ngày có phải là ngày lễ (memoized)
  const isHoliday = useCallback((date: Date) => {
    // Sử dụng hàm mới để kiểm tra ngày lễ với xử lý đúng timezone
    return isDateInHolidayPeriod(date, holidays);
  }, [holidays]);

  // Lấy lịch sắp tới với số lượng tùy chỉnh, bỏ qua các ngày nghỉ lễ
  const upcomingSchedules = useMemo(() => {
    // Lọc ra lịch học, bỏ qua các ngày nằm trong khoảng nghỉ lễ
    const filteredSchedules = { ...classSchedules };
    
    // Lọc bỏ các lịch học trong các ngày nghỉ
    Object.keys(filteredSchedules).forEach(dateStr => {
      const date = new Date(dateStr);
      // Nếu ngày này nằm trong khoảng nghỉ lễ, loại bỏ tất cả lịch học thông thường
      if (isHoliday(date)) {
        // Giữ lại chỉ các sự kiện kiểu holiday
        filteredSchedules[dateStr] = filteredSchedules[dateStr].filter(
          schedule => schedule.type === 'holiday' || schedule.isHoliday
        );
      }
    });
    
    return getUpcomingSchedules(upcomingCount, filteredSchedules);
  }, [classSchedules, upcomingCount, isHoliday]);

  // Kiểm tra xem một ngày có phải là ngày hôm nay - không phụ thuộc vào state nên có thể tránh re-render
  const isToday = useCallback((date: Date) => {
    const today = toVietnamTime(new Date());
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }, []);

  // Callback handlers
  const prevMonth = useCallback(() => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(newMonth.getMonth() - 1);
      return newMonth;
    });
  }, []);

  const nextMonth = useCallback(() => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(newMonth.getMonth() + 1);
      return newMonth;
    });
  }, []);

  const handleMonthChange = useCallback((month: string) => {
    // Trích xuất tháng từ chuỗi "Tháng X"
    const monthIndex = parseInt(month.replace('Tháng ', ''), 10) - 1;
    if (!isNaN(monthIndex) && monthIndex >= 0 && monthIndex < 12) {
      setCurrentMonth(prev => new Date(prev.getFullYear(), monthIndex, 1));
    }
  }, []);

  const handleYearChange = useCallback((year: string) => {
    setCurrentMonth(prev => new Date(parseInt(year), prev.getMonth(), 1));
  }, []);

  const selectDate = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  // Cập nhật lịch học khi ngày được chọn thay đổi
  useEffect(() => {
    // Format date to YYYY-MM-DD without timezone conversion
    // để đảm bảo nhất quán khi tìm kiếm lịch trong classSchedules
    const dateString = formatDateToISOString(selectedDate);
    
    let schedules = classSchedules[dateString] || [];
    
    // Kiểm tra nếu ngày đang chọn là ngày nghỉ
    if (isHoliday(selectedDate)) {
      // Lọc ra chỉ những sự kiện ngày lễ
      schedules = schedules.filter(schedule => schedule.type === 'holiday' || schedule.isHoliday);
    }
    
    setScheduleForSelectedDate(schedules);
  }, [selectedDate, classSchedules, isHoliday]);

  // Hàm refresh lịch học thủ công
  const refreshSchedules = useCallback(() => {
    fetchClassroomsAndSchedules();
  }, [fetchClassroomsAndSchedules]);

  // Xử lý thay đổi số lượng lịch học hiển thị
  const handleUpcomingCountChange = useCallback((value: string) => {
    setUpcomingCount(parseInt(value, 10));
  }, []);

  // Memoize các component con để tránh re-render không cần thiết
  const scheduleOverviewMemo = useMemo(() => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Lịch học sắp tới</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Số tiết hiển thị:</span>
          <Select 
            value={upcomingCount.toString()} 
            onValueChange={handleUpcomingCountChange}
          >
            <SelectTrigger className="w-[80px]">
              <SelectValue placeholder="4" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2">2</SelectItem>
              <SelectItem value="4">4</SelectItem>
              <SelectItem value="8">8</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <ScheduleOverview 
        upcomingSchedules={upcomingSchedules} 
        role={role} 
        onSelectDate={(date) => {
          setSelectedDate(new Date(date));
        }}
        maxSchedules={upcomingCount}
      />
    </div>
  ), [upcomingSchedules, role, upcomingCount, handleUpcomingCountChange]);

  const calendarViewMemo = useMemo(() => (
    <CalendarView 
      currentMonth={currentMonth}
      selectedDate={selectedDate}
      monthData={monthData}
      hasSchedule={hasSchedule}
      isToday={isToday}
      isHoliday={isHoliday}
      prevMonth={prevMonth}
      nextMonth={nextMonth}
      handleMonthChange={handleMonthChange}
      handleYearChange={handleYearChange}
      selectDate={selectDate}
      role={role}
    />
  ), [currentMonth, selectedDate, monthData, hasSchedule, isHoliday, role, isToday, prevMonth, nextMonth, handleMonthChange, handleYearChange, selectDate]);

  const scheduleDetailMemo = useMemo(() => (
    <ScheduleDetail 
      selectedDate={selectedDate} 
      scheduleForSelectedDate={scheduleForSelectedDate}
      role={role}
      holidays={holidayDates}
    />
  ), [selectedDate, scheduleForSelectedDate, role, holidayDates]);

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={fadeInUp}
      className="space-y-4"
    >
      <div className="mx-auto max-w-7xl">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Đang tải dữ liệu lịch học...</p>
            </div>
          </div>
        ) : (
          <>
            {/* At a Glance Overview */}
            {scheduleOverviewMemo}
            
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4 mt-4">
              {/* Calendar View */}
              <div className="md:col-span-1">
                {calendarViewMemo}
              </div>
              
              {/* Schedule Detail */}
              <div className="md:col-span-2 lg:col-span-3">
                {scheduleDetailMemo}
              </div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}