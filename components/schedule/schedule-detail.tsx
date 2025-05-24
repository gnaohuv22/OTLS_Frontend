'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, MapPin, Video, Calendar as CalendarIcon, GiftIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ClassSchedule, UserRole, weekdays, fadeInUp, itemVariants, staggerContainer, getBadgeVariant, getScheduleTypeLabel } from './types';
import { EmptySchedule } from './empty-schedule';
import { formatDateToISOString } from './date-utils';

interface ScheduleDetailProps {
  selectedDate: Date;
  scheduleForSelectedDate: ClassSchedule[];
  role?: UserRole;
  holidays?: { date: string; name: string }[];
}

export function ScheduleDetail({ 
  selectedDate, 
  scheduleForSelectedDate,
  role,
  holidays = []
}: ScheduleDetailProps) {
  
  // Get formatted date string
  const formattedDate = useMemo(() => {
    const day = selectedDate.getDate().toString().padStart(2, '0');
    const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
    const weekday = weekdays[selectedDate.getDay()];
    return `${weekday}, ${day}/${month}/${selectedDate.getFullYear()}`;
  }, [selectedDate]);
  
  // Check if selected date has any holiday events
  const holidayEvents = useMemo(() => 
    scheduleForSelectedDate.filter(schedule => schedule.type === 'holiday' || schedule.isHoliday),
  [scheduleForSelectedDate]);
  
  // Get non-holiday events
  const regularEvents = useMemo(() => 
    scheduleForSelectedDate.filter(schedule => schedule.type !== 'holiday' && !schedule.isHoliday),
  [scheduleForSelectedDate]);
  
  // Format ngày tương tự như trong isDateInHolidayRange() 
  // để đảm bảo nhất quán khi so sánh
  const selectedDateStr = useMemo(() => {
    // Sử dụng hàm chung để đảm bảo nhất quán
    return formatDateToISOString(selectedDate);
  }, [selectedDate]);
  
  const currentHoliday = useMemo(() => 
    holidays.find(h => h.date === selectedDateStr),
  [holidays, selectedDateStr]);
  
  const isSelectedDateHoliday = useMemo(() => 
    Boolean(currentHoliday || holidayEvents.length > 0),
  [currentHoliday, holidayEvents]);
  
  return (
    <motion.div variants={fadeInUp}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            Lịch học ngày {formattedDate}
            {isSelectedDateHoliday && (
              <Badge variant="secondary" className="ml-2">Ngày nghỉ</Badge>
            )}
          </CardTitle>
          <CardDescription>
            {scheduleForSelectedDate.length 
              ? `Có ${scheduleForSelectedDate.length} sự kiện trong ngày hôm nay`
              : isSelectedDateHoliday 
                ? 'Ngày nghỉ lễ' 
                : 'Không có sự kiện nào trong ngày này'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AnimatePresence>
            {scheduleForSelectedDate.length > 0 ? (
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                className="space-y-4"
              >
                {/* Render holiday events first if any */}
                {holidayEvents.length > 0 && (
                  <>
                    {holidayEvents.map((schedule, index) => (
                      <HolidayItem key={`holiday-${schedule.id}`} schedule={schedule} index={index} />
                    ))}
                    {regularEvents.length > 0 && (
                      <div className="my-4 border-t pt-4">
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">
                          Lịch học trong ngày nghỉ lễ
                        </h3>
                      </div>
                    )}
                  </>
                )}
                
                {/* Render regular events */}
                {regularEvents.map((schedule, index) => (
                  <ScheduleItem 
                    key={`regular-${schedule.id}`} 
                    schedule={schedule} 
                    role={role} 
                    index={holidayEvents.length + index} 
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <EmptySchedule 
                  isHoliday={isSelectedDateHoliday} 
                  holidayName={currentHoliday?.name} 
                />
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Holiday Item Component
interface HolidayItemProps {
  schedule: ClassSchedule;
  index: number;
}

export function HolidayItem({ schedule, index }: HolidayItemProps) {
  return (
    <motion.div
      variants={itemVariants}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
    >
      <div className="rounded-lg border border-secondary p-4 bg-secondary/10 transition-all duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <GiftIcon className="mr-2 h-5 w-5 text-secondary" />
            <div>
              <h3 className="font-medium">{schedule.subject}</h3>
              <p className="text-sm text-muted-foreground">{schedule.topic}</p>
            </div>
          </div>
          <Badge variant="secondary">Ngày lễ</Badge>
        </div>
        
        {schedule.startTime && schedule.endTime && (
          <div className="mt-3 flex items-center text-sm text-muted-foreground">
            <Clock className="mr-1 h-4 w-4" />
            <span>{schedule.startTime.substring(0, 5)} - {schedule.endTime.substring(0, 5)}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Schedule Item Component
interface ScheduleItemProps {
  schedule: ClassSchedule;
  role?: UserRole;
  index: number;
}

export function ScheduleItem({ schedule, role, index }: ScheduleItemProps) {
  return (
    <motion.div
      variants={itemVariants}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
    >
      <div className="rounded-lg border p-4 hover:bg-accent/30 transition-all duration-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0">
          <div>
            <div className="flex items-center">
              <h3 className="font-medium">{schedule.subject}</h3>
              <Badge variant={getBadgeVariant(schedule.type)} className="ml-2">
                {getScheduleTypeLabel(schedule.type)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{schedule.topic}</p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="text-sm flex items-center">
              <Clock className="mr-1 h-4 w-4" />
              <span>{schedule.startTime.substring(0, 5)} - {schedule.endTime.substring(0, 5)}</span>
            </div>
            {role === 'Teacher' && schedule.type !== 'exam' && (
              <Link href={`/classes/${schedule.classId}/meeting`}>
                <Button variant="outline" size="sm" className="transition-all duration-200 hover:shadow-md">
                  <Video className="mr-1 h-4 w-4" />
                  Bắt đầu
                </Button>
              </Link>
            )}
            {role === 'Student' && schedule.type !== 'exam' && (
              <Link href={`/classes/${schedule.classId}/meeting`}>
                <Button variant="outline" size="sm" className="transition-all duration-200 hover:shadow-md">
                  <Video className="mr-1 h-4 w-4" />
                  Tham gia
                </Button>
              </Link>
            )}
          </div>
        </div>
        
        <div className="mt-3 flex flex-col sm:flex-row justify-between">
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="mr-1 h-4 w-4" />
            <span>{schedule.location}</span>
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground mt-1 sm:mt-0">
            <span className="mr-1">Giáo viên:</span>
            <span className="font-medium">{schedule.teacher}</span>
          </div>
        </div>
        
        <div className="mt-3 flex justify-end">
          <Link href={`/classes/${schedule.classId}`}>
            <Button variant="link" size="sm" className="transition-colors duration-200">
              Chi tiết lớp học
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
} 