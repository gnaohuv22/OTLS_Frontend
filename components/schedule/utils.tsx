'use client';

import { ClassSchedule } from './types';
import { Classroom } from '@/lib/api/classes';
import { 
  toVietnamTime, 
  formatDateToISOString, 
  API_TO_JS_DAY
} from './date-utils';

/**
 * Lấy danh sách ngày có lịch trong khoảng thời gian
 * @param fromDate Ngày bắt đầu
 * @param days Số ngày cần lấy
 * @param classSchedules Danh sách lịch học
 * @returns Mảng các ngày có lịch học
 */
export function getUpcomingDates(fromDate: Date, days: number, classSchedules: Record<string, ClassSchedule[]>): string[] {
  const dates: string[] = [];
  const startDate = toVietnamTime(new Date(fromDate));
  startDate.setHours(0, 0, 0, 0);
  
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = formatDateToISOString(date);
    
    if (classSchedules[dateStr] && classSchedules[dateStr].length > 0) {
      dates.push(dateStr);
    }
  }
  
  return dates;
}

/**
 * Chuyển đổi API schedule sang định dạng ứng dụng
 * @param apiSchedules Lịch học từ API
 * @param classroom Thông tin lớp học
 * @param startDate Ngày bắt đầu tính lịch (mặc định là ngày hiện tại)
 * @param endDate Ngày kết thúc tính lịch (mặc định là 2 tháng sau ngày bắt đầu)
 * @returns Lịch học chuyển đổi
 */
export function mapApiSchedulesToAppSchedules(
  apiSchedules: any[], 
  classroom: Classroom,
  startDate?: Date,
  endDate?: Date
): ClassSchedule[] {
  const schedulesForDifferentDates: ClassSchedule[] = [];
  
  // Tính toán ngày bắt đầu dựa trên input và startDate của lớp học
  const today = toVietnamTime(new Date());
  let classStartDate = classroom.startDate ? new Date(classroom.startDate) : null;
  
  // Nếu ngày bắt đầu của lớp học lớn hơn ngày hiện tại, sử dụng ngày bắt đầu của lớp học
  if (classStartDate && classStartDate > today) {
    startDate = classStartDate;
  }
  // Nếu ngày bắt đầu của lớp học nhỏ hơn ngày hiện tại, sử dụng ngày hiện tại
  else if (classStartDate && classStartDate < today) {
    // Nếu startDate được cung cấp, sử dụng max giữa startDate và ngày hiện tại
    if (startDate) {
      startDate = startDate < today ? today : startDate;
    } else {
      startDate = today;
    }
  }
  
  // Nếu không cung cấp ngày bắt đầu, sử dụng ngày hiện tại
  const dateStart = startDate ? toVietnamTime(new Date(startDate)) : toVietnamTime(new Date());
  dateStart.setHours(0, 0, 0, 0);
  
  // Xử lý ngày kết thúc
  let dateEnd;
  // Nếu lớp học có endDate, ưu tiên sử dụng endDate của lớp học
  if (classroom.endDate) {
    const classEndDate = new Date(classroom.endDate);
    // Nếu endDate được cung cấp, sử dụng min của endDate và classEndDate
    if (endDate) {
      dateEnd = endDate > classEndDate ? classEndDate : endDate;
    } else {
      dateEnd = classEndDate;
    }
  } else {
    // Nếu không có endDate của lớp học, sử dụng endDate được cung cấp hoặc mặc định 2 tháng
    dateEnd = endDate ? toVietnamTime(new Date(endDate)) : toVietnamTime(new Date(dateStart));
    if (!endDate) {
      dateEnd.setMonth(dateStart.getMonth() + 2);
    }
  }
  
  dateEnd.setHours(23, 59, 59, 999);
  
  apiSchedules.forEach(apiSchedule => {
    // Lịch dựa trên dayOfWeek sẽ lặp lại hàng tuần
    // Ta sẽ tạo các lịch học cho các tuần từ thời điểm bắt đầu đến thời điểm kết thúc
    let currentDate = new Date(dateStart);
    
    while (currentDate <= dateEnd) {
      // Sử dụng ánh xạ chính xác từ dayOfWeek API sang ngày trong tuần JavaScript
      const jsDayOfWeek = API_TO_JS_DAY[apiSchedule.dayOfWeek];
      
      if (currentDate.getDay() === jsDayOfWeek) {
        // Xác định loại lịch học
        const scheduleType: 'lecture' | 'practice' | 'exam' | 'meeting' = 
          classroom.isOnlineMeeting === 'Active' ? 'meeting' : 'lecture';
        
        // Tạo bản sao ngày hiện tại để tránh tham chiếu
        const scheduleDate = new Date(currentDate);
        // Sử dụng định dạng ngày chuẩn hóa
        const dateStr = formatDateToISOString(scheduleDate);
        
        schedulesForDifferentDates.push({
          id: `${apiSchedule.classScheduleId}_${dateStr}`,
          subject: classroom.name,
          topic: classroom.description || 'Không có chủ đề',
          startTime: apiSchedule.startTime.substring(0, 5),
          endTime: apiSchedule.endTime.substring(0, 5),
          teacher: classroom.users?.fullName || 'Không có thông tin',
          location: 'Online',
          type: scheduleType,
          classId: classroom.classroomId,
          dayOfWeek: apiSchedule.dayOfWeek,
          dateString: dateStr
        });
      }
      
      // Tăng ngày lên 1 để tiếp tục vòng lặp
      currentDate.setDate(currentDate.getDate() + 1);
    }
  });
  
  return schedulesForDifferentDates;
}

/**
 * Lấy danh sách các lịch học sắp tới
 * @param maxSchedules Số tiết học tối đa cần lấy
 * @param classSchedules Danh sách tất cả lịch học
 * @returns Danh sách lịch học sắp tới, giới hạn theo số tiết học
 */
export function getUpcomingSchedules(maxSchedules = 4, classSchedules: Record<string, ClassSchedule[]>): ClassSchedule[] {
  const today = toVietnamTime(new Date());
  today.setHours(0, 0, 0, 0);
  
  const upcomingEvents: ClassSchedule[] = [];
  
  // Số ngày tương lai để kiểm tra (tối đa 30 ngày)
  // Đảm bảo sẽ có đủ dữ liệu để chọn maxSchedules tiết học
  const maxDaysToCheck = 30;
  
  for (let i = 0; i < maxDaysToCheck; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const dateStr = formatDateToISOString(date);
    
    if (classSchedules[dateStr]) {
      upcomingEvents.push(...classSchedules[dateStr]);
      
      // Nếu đã đủ số lịch cần lấy và không phải ngày hiện tại, dừng vòng lặp
      if (upcomingEvents.length >= maxSchedules && i > 0) {
        break;
      }
    }
  }
  
  // Sắp xếp theo ngày và giờ
  const sortedEvents = upcomingEvents.sort((a, b) => {
    // So sánh ngày trước
    const dateA = a.dateString || '';
    const dateB = b.dateString || '';
    if (dateA !== dateB) {
      return dateA.localeCompare(dateB);
    }
    // Nếu cùng ngày, so sánh giờ
    return a.startTime.localeCompare(b.startTime);
  });
  
  // Giới hạn số lịch học trả về
  return sortedEvents.slice(0, maxSchedules);
} 