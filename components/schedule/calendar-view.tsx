'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ChevronDown, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from '@/components/ui/badge';
import { months, years, weekdays, fadeInUp, itemVariants, staggerContainer, MonthData, UserRole } from './types';
import * as dateUtils from './date-utils';

interface CalendarViewProps {
  currentMonth: Date;
  selectedDate: Date;
  monthData: MonthData;
  hasSchedule: (date: Date) => boolean;
  isToday: (date: Date) => boolean;
  prevMonth: () => void;
  nextMonth: () => void;
  handleMonthChange: (month: string) => void;
  handleYearChange: (year: string) => void;
  selectDate: (date: Date) => void;
  role?: UserRole;
  isHoliday?: (date: Date) => boolean;
}

export function CalendarView({
  currentMonth,
  selectedDate,
  monthData,
  hasSchedule,
  isToday,
  prevMonth,
  nextMonth,
  handleMonthChange,
  handleYearChange,
  selectDate,
  role,
  isHoliday = () => false // Default implementation until holiday service is integrated
}: CalendarViewProps) {
  
  // Đảm bảo tất cả các so sánh ngày đều dùng múi giờ Việt Nam
  const vietnamSelectedDate = dateUtils.toVietnamTime(selectedDate);
  
  // Format tháng rút gọn
  const getMonthDisplay = (monthIndex: number) => {
    // Chuyển từ "Tháng 10" thành "T10" để tiết kiệm không gian
    return `T${monthIndex + 1}`;
  };
  
  // Tính toán số tuần trong tháng
  const weeksInMonth = Math.ceil((monthData.startDay + monthData.daysInMonth) / 7);
  
  // Render calendar grid
  const calendarGrid = useMemo(() => {
    const weeks = [];
    const daysInPrevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0).getDate();
    let dayCount = 1;
    let nextMonthDay = 1; // Theo dõi ngày của tháng sau
    
    // Generate weeks
    for (let weekIndex = 0; weekIndex < weeksInMonth; weekIndex++) {
      const days = [];
      
      // Generate days for each week
      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const dayPosition = weekIndex * 7 + dayIndex;
        const prevMonthDay = daysInPrevMonth - monthData.startDay + dayIndex + 1;
        const isCurrentMonth = dayPosition >= monthData.startDay && dayCount <= monthData.daysInMonth;
        
        let date: Date;
        let displayDay: number; // Ngày hiển thị trên lịch
        
        if (isCurrentMonth) {
          // Ngày trong tháng hiện tại
          date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dayCount);
          displayDay = dayCount++;
        } else if (dayPosition < monthData.startDay) {
          // Ngày từ tháng trước
          date = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, prevMonthDay);
          displayDay = prevMonthDay;
        } else {
          // Ngày từ tháng sau
          date = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, nextMonthDay);
          displayDay = nextMonthDay++;
        }
        
        // Kiểm tra trạng thái của ngày
        const isCurrentDay = isToday(date);
        const hasEvent = hasSchedule(date);
        const isHolidayDate = isHoliday(date);
        
        // Kiểm tra ngày được chọn, chuyển đổi sang múi giờ Việt Nam trước khi so sánh
        const dateInVietnamTZ = dateUtils.toVietnamTime(date);
        const isSelected = 
          dateInVietnamTZ.getDate() === vietnamSelectedDate.getDate() &&
          dateInVietnamTZ.getMonth() === vietnamSelectedDate.getMonth() &&
          dateInVietnamTZ.getFullYear() === vietnamSelectedDate.getFullYear();
        
        days.push(
          <motion.div
            key={`day-${weekIndex}-${dayIndex}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: isCurrentMonth ? 1 : 0.3 }}
            transition={{ duration: 0.2, delay: (weekIndex * 7 + dayIndex) * 0.01 }}
          >
            <button
              className={`w-full h-11 rounded-md flex flex-col items-center justify-center transition-all duration-200 relative
                ${isSelected ? 'bg-primary text-primary-foreground' : ''}
                ${isCurrentDay && !isSelected ? 'ring-2 ring-primary' : ''}
                ${isHolidayDate && !isSelected ? 'bg-secondary/20 hover:bg-secondary/30' : ''}
                ${hasEvent && !isSelected && !isCurrentDay && !isHolidayDate ? 'hover:bg-primary/10' : 'hover:bg-muted'}`}
              onClick={() => selectDate(date)}
            >
              <span className={`text-sm font-medium 
                ${hasEvent && !isSelected && !isHolidayDate ? 'font-semibold' : ''}
                ${isHolidayDate && !isSelected ? 'text-secondary-foreground' : ''}`}>
                {displayDay}
              </span>
              
              {/* Visual indicators */}
              <div className="flex justify-center gap-0.5 absolute -bottom-1">
                {/* Chỉ hiển thị chấm lịch học nếu không phải ngày nghỉ */}
                {hasEvent && !isHolidayDate && !isSelected && (
                  <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                )}
                {isHolidayDate && !isSelected && (
                  <div className="w-2 h-1.5 rounded-sm bg-secondary"></div>
                )}
              </div>
            </button>
          </motion.div>
        );
      }
      
      // Add week row to the calendar
      weeks.push(
        <div key={`week-${weekIndex}`} className="grid grid-cols-7 gap-1">
          {days}
        </div>
      );
    }
    
    return weeks;
  }, [currentMonth, monthData, weeksInMonth, hasSchedule, isToday, isHoliday, selectDate, vietnamSelectedDate]);
  
  return (
    <motion.div variants={fadeInUp}>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              <span>Lịch {role === 'Teacher' ? 'giảng dạy' : 'học tập'}</span>
            </div>
          </CardTitle>
          <div className="flex items-center justify-between mt-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={prevMonth}
              className="p-1 rounded-full hover:bg-muted"
            >
              <ChevronLeft className="h-5 w-5" />
            </motion.button>
            
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="transition-colors duration-200">
                    {months[currentMonth.getMonth()]}
                    <ChevronDown className="ml-1 h-3 w-3 text-muted-foreground" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <div className="grid grid-cols-3 gap-1 p-2">
                    {months.map((month, i) => (
                      <Button
                        key={month}
                        variant={currentMonth.getMonth() === i ? "default" : "ghost"}
                        className="transition-colors duration-200"
                        onClick={() => handleMonthChange(month)}
                        size="sm"
                      >
                        {getMonthDisplay(i)}
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="transition-colors duration-200">
                    {currentMonth.getFullYear()}
                    <ChevronDown className="ml-1 h-3 w-3 text-muted-foreground" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <div className="grid grid-cols-3 gap-1 p-2">
                    {years.map((year) => (
                      <Button
                        key={year}
                        variant={currentMonth.getFullYear() === year ? "default" : "ghost"}
                        className="transition-colors duration-200"
                        onClick={() => handleYearChange(year.toString())}
                        size="sm"
                      >
                        {year}
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={nextMonth}
              className="p-1 rounded-full hover:bg-muted"
            >
              <ChevronRight className="h-5 w-5" />
            </motion.button>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {weekdays.map((day) => (
              <div key={day} className="text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar grid */}
          <motion.div 
            variants={staggerContainer}
            className="space-y-1"
          >
            {calendarGrid}
          </motion.div>
          
          {/* Legend for indicators */}
          <div className="mt-4 flex justify-end gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
              <span>Có lịch học</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-1.5 rounded-sm bg-secondary"></div>
              <span>Ngày nghỉ</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
} 