'use client';

import { motion } from 'framer-motion';
import { CalendarCheck, Clock, MapPin, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ClassSchedule, UserRole, fadeInUp, itemVariants, staggerContainer, getBadgeVariant, getScheduleTypeLabel } from './types';
import { toVietnamTime } from './date-utils';

interface ScheduleOverviewProps {
  upcomingSchedules: (ClassSchedule & { dateString?: string })[];
  role?: UserRole;
  onSelectDate: (dateString: string) => void;
  maxSchedules?: number; // Số tiết học tối đa hiển thị
}

export function ScheduleOverview({ upcomingSchedules, role, onSelectDate, maxSchedules = 4 }: ScheduleOverviewProps) {
  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    
    // Sử dụng múi giờ Việt Nam để so sánh ngày
    const date = new Date(dateString);
    const today = toVietnamTime(new Date());
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Chuẩn hóa về ngày bằng cách xóa phần thời gian
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);
    
    const todayOnly = new Date(today);
    todayOnly.setHours(0, 0, 0, 0);
    
    const tomorrowOnly = new Date(tomorrow);
    tomorrowOnly.setHours(0, 0, 0, 0);
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    
    if (dateOnly.getTime() === todayOnly.getTime()) {
      return "Hôm nay";
    } else if (dateOnly.getTime() === tomorrowOnly.getTime()) {
      return "Ngày mai";
    } else {
      return `${day}/${month}`;
    }
  };
  
  // Sắp xếp lịch học theo thời gian bắt đầu và ngày
  const sortedSchedules = [...upcomingSchedules]
    .sort((a, b) => {
      // So sánh ngày trước
      const dateA = a.dateString || '';
      const dateB = b.dateString || '';
      
      if (dateA !== dateB) {
        return dateA.localeCompare(dateB);
      }
      
      // Nếu cùng ngày, so sánh giờ bắt đầu
      return a.startTime.localeCompare(b.startTime);
    })
    // Giới hạn số lịch học hiển thị
    .slice(0, maxSchedules);
  
  // Chia lịch học thành 2 cột
  const leftColumnSchedules = sortedSchedules.filter((_, index) => index % 2 === 0);
  const rightColumnSchedules = sortedSchedules.filter((_, index) => index % 2 === 1);
  
  // Hàm render một lịch học
  const renderScheduleItem = (schedule: ClassSchedule & { dateString?: string }, index: number) => (
    <motion.div
      key={schedule.id}
      variants={itemVariants}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
    >
      <div className="rounded-lg border p-3 hover:bg-accent transition-colors duration-200 cursor-pointer h-full"
           onClick={() => schedule.dateString && onSelectDate(schedule.dateString)}>
        <div className="flex justify-between items-start mb-1">
          <div>
            <h3 className="font-medium">{schedule.subject}</h3>
            <p className="text-sm text-muted-foreground line-clamp-1">{schedule.topic}</p>
          </div>
          <div className="flex">
            <Badge variant={getBadgeVariant(schedule.type)} className="transition-colors duration-200">
              {getScheduleTypeLabel(schedule.type)}
            </Badge>
          </div>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="mr-1 h-4 w-4 flex-shrink-0" />
          <span className="truncate">
            {formatDate(schedule.dateString)}, {schedule.startTime.substring(0, 5)} - {schedule.endTime.substring(0, 5)}
          </span>
        </div>
        <div className="mt-1 flex items-center justify-between">
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="mr-1 h-4 w-4 flex-shrink-0" />
            <span className="truncate">{schedule.location}</span>
          </div>
          {role === 'Teacher' && (
            <Link href={`/classes/${schedule.classId}`}>
              <Button variant="outline" size="sm" className="transition-all duration-200 hover:shadow-sm">
                Chi tiết
              </Button>
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
  
  return (
    <motion.div variants={fadeInUp}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <CalendarCheck className="h-5 w-5 text-primary" />
            </motion.div>
            Lịch học sắp tới
          </CardTitle>
          <CardDescription>
            Danh sách các lịch học sắp diễn ra được sắp xếp theo thời gian
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedSchedules.length > 0 ? (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Cột trái */}
                <div className="space-y-3">
                  {leftColumnSchedules.map((schedule, index) => renderScheduleItem(schedule, index))}
                </div>
                
                {/* Cột phải */}
                <div className="space-y-3">
                  {rightColumnSchedules.map((schedule, index) => renderScheduleItem(schedule, index + leftColumnSchedules.length))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div variants={fadeInUp} className="text-center p-4">
              <div className="flex justify-center mb-2">
                <AlertCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">Không có lịch học nào trong thời gian tới</p>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
} 