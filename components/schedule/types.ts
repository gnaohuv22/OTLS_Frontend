// Interface và constants cho các component Schedule
import { Classroom } from '@/lib/api/classes';

export type UserRole = 'Teacher' | 'Student' | 'Parent' | 'Admin' | null | undefined;

export interface ClassSchedule {
  id: string;
  subject: string;
  topic: string;
  startTime: string;
  endTime: string;
  teacher: string;
  location: string;
  type: 'lecture' | 'practice' | 'exam' | 'meeting' | 'holiday';
  classId: string;
  dayOfWeek?: number;
  dateString?: string;
  isHoliday?: boolean;
}

export interface Holiday {
  id: string;
  name: string;
  description?: string;
  date: string; // ISO format date string
  isAllDay: boolean;
  startTime?: string; // Optional for partial day holidays
  endTime?: string; // Optional for partial day holidays
}

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  hasSchedule: boolean;
  isHoliday?: boolean;
}

export interface MonthData {
  firstDay: Date;
  lastDay: Date;
  daysInMonth: number;
  startDay: number;
}

// Animation variants
export const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

export const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2 } }
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Tên các tháng và ngày trong tuần
export const months = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
];

// Sửa lỗi thứ trong tuần - Mảng bắt đầu từ 0 (Chủ nhật)
export const weekdays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

// Tạo danh sách năm cho select
export const years = Array.from(
  { length: 10 }, 
  (_, i) => new Date().getFullYear() - 5 + i
);

// Hàm tiện ích để xác định loại badge
export const getBadgeVariant = (type: string) => {
  switch (type) {
    case 'lecture':
      return 'default';
    case 'practice':
      return 'secondary';
    case 'exam':
      return 'destructive';
    case 'meeting':
      return 'outline';
    case 'holiday':
      return 'secondary'; // Dùng mã màu khác để phân biệt ngày lễ
    default:
      return 'outline';
  }
};

// Hàm tiện ích để lấy nhãn cho từng loại lịch
export const getScheduleTypeLabel = (type: string) => {
  switch (type) {
    case 'lecture':
      return 'Lý thuyết';
    case 'practice':
      return 'Thực hành';
    case 'exam':
      return 'Kiểm tra';
    case 'meeting':
      return 'Học trực tuyến';
    case 'holiday':
      return 'Ngày lễ';
    default:
      return 'Khác';
  }
}; 