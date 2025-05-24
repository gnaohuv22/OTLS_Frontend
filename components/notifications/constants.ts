import { FileText, Users, Award, Calendar, Info, MessageCircle, Bell, LucideIcon } from 'lucide-react';
import { Notification } from './types';

/**
 * Mapping các icon cho từng loại thông báo
 */
export const NOTIFICATION_ICONS: Record<string, LucideIcon> = {
  assignment: FileText,
  submission: Users,
  grade: Award,
  class: Calendar,
  system: Info,
  message: MessageCircle,
  default: Bell,
};

/**
 * Dữ liệu mẫu cho notifications của giáo viên
 */
export const TEACHER_NOTIFICATIONS: Notification[] = [
  { id: 1, type: 'assignment', title: 'Bài tập đã được gửi', message: 'Bài tập "Phép cộng và phép trừ" đã được gửi đến lớp 5A.', date: '25/03/2024', time: '14:30', isRead: false },
  { id: 2, type: 'submission', title: 'Học sinh nộp bài tập', message: '15 học sinh đã nộp bài tập "Bài tập về ngữ pháp".', date: '24/03/2024', time: '10:15', isRead: true },
  { id: 3, type: 'class', title: 'Nhắc nhở lịch dạy', message: 'Lớp Toán 5A sẽ diễn ra vào lúc 15:30 hôm nay.', date: '24/03/2024', time: '08:00', isRead: true },
  { id: 4, type: 'system', title: 'Cập nhật hệ thống', message: 'Hệ thống sẽ bảo trì vào ngày 30/03/2024 từ 22:00 đến 24:00.', date: '23/03/2024', time: '16:45', isRead: true },
  { id: 5, type: 'message', title: 'Tin nhắn mới', message: 'Phụ huynh của học sinh Nguyễn Văn A đã gửi tin nhắn cho bạn.', date: '22/03/2024', time: '09:30', isRead: false }
];

/**
 * Dữ liệu mẫu cho notifications của học sinh
 */
export const STUDENT_NOTIFICATIONS: Notification[] = [
  { id: 1, type: 'assignment', title: 'Bài tập mới', message: 'Bạn có bài tập mới "Phép cộng và phép trừ" từ thầy Nguyễn Văn A.', date: '25/03/2024', time: '14:30', isRead: false },
  { id: 2, type: 'grade', title: 'Điểm số mới', message: 'Bạn đã được 9/10 điểm cho bài tập "Bài tập về ngữ pháp".', date: '24/03/2024', time: '15:20', isRead: true },
  { id: 3, type: 'class', title: 'Nhắc nhở lịch học', message: 'Lớp Toán sẽ diễn ra vào lúc 15:30 hôm nay.', date: '24/03/2024', time: '08:00', isRead: true },
  { id: 4, type: 'system', title: 'Cập nhật hệ thống', message: 'Hệ thống sẽ bảo trì vào ngày 30/03/2024 từ 22:00 đến 24:00.', date: '23/03/2024', time: '16:45', isRead: true },
  { id: 5, type: 'message', title: 'Thông báo từ giáo viên', message: 'Giáo viên Trần Thị B đã gửi thông báo cho cả lớp.', date: '22/03/2024', time: '14:10', isRead: false }
];

/**
 * Các config cụ thể cho từng role
 */
export const TEACHER_CONFIG = {
  initialNotifications: TEACHER_NOTIFICATIONS,
  title: "Thông báo Giáo viên",
  description: "Quản lý và xem tất cả thông báo của bạn",
  assignmentTypes: ['assignment', 'submission'],
  classTypes: ['class'],
  emptyMessages: {
    unread: "Không có thông báo chưa đọc",
    assignments: "Không có thông báo về bài tập hoặc nộp bài",
    classes: "Không có thông báo về lớp học",
  }
};

export const STUDENT_CONFIG = {
  initialNotifications: STUDENT_NOTIFICATIONS,
  title: "Thông báo Học sinh",
  description: "Xem tất cả thông báo học tập của bạn",
  assignmentTypes: ['assignment', 'grade'],
  classTypes: ['class'],
  emptyMessages: {
    unread: "Không có thông báo chưa đọc",
    assignments: "Không có thông báo về bài tập hoặc điểm số",
    classes: "Không có thông báo về lớp học",
  }
};

/**
 * Animation variants cho Framer Motion
 */
export const ANIMATION_VARIANTS = {
  fadeInUp: {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  },
  itemVariants: {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.2 } }
  },
  staggerContainer: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }
}; 