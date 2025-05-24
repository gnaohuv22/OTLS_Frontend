/**
 * Tiện ích xử lý ngày tháng một cách nhất quán cho toàn bộ ứng dụng
 * Tập trung tất cả các hàm xử lý ngày tháng ở đây để đảm bảo tính nhất quán
 */

import { Holiday } from './types';

// Các hằng số cần thiết
const VIETNAM_TIMEZONE_OFFSET = 7 * 60 * 60 * 1000; // UTC+7 tính bằng ms

/**
 * Ánh xạ giữa dayOfWeek của API và JavaScript
 * API: 0=Chủ nhật, 1=Thứ 2, ..., 6=Thứ 7
 * JS: 0=Chủ nhật, 1=Thứ 2, ..., 6=Thứ 7
 */
export const API_TO_JS_DAY: Record<number, number> = {
  0: 0, 
  1: 1,
  2: 2, 
  3: 3, 
  4: 4,
  5: 5, 
  6: 6,
};

/**
 * Hàm chuyển đổi đối tượng Date sang múi giờ Việt Nam (UTC+7)
 * @param date Đối tượng Date cần chuyển đổi
 * @returns Đối tượng Date mới với múi giờ Việt Nam
 */
export function toVietnamTime(date: Date): Date {
  // Tạo bản sao để tránh thay đổi bản gốc
  const clonedDate = new Date(date);
  
  // Lấy thời gian UTC tính bằng ms
  const utcTime = clonedDate.getTime() + (clonedDate.getTimezoneOffset() * 60000);
  
  // Thêm độ lệch múi giờ Việt Nam (+7 giờ)
  return new Date(utcTime + VIETNAM_TIMEZONE_OFFSET);
}

/**
 * Format đối tượng Date thành chuỗi YYYY-MM-DD
 * Sử dụng cách thống nhất không phụ thuộc vào timezone
 * @param date Đối tượng Date cần format
 * @returns Chuỗi định dạng YYYY-MM-DD
 */
export function formatDateToISOString(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Chuẩn hóa chuỗi ngày ISO hoặc có timezone thành YYYY-MM-DD
 * Xử lý đặc biệt chuỗi ISO với timezone 'Z' (UTC)
 * @param dateString Chuỗi ngày từ API
 * @returns Chuỗi định dạng YYYY-MM-DD đã chuẩn hóa
 */
export function normalizeISODateString(dateString: string): string {
  if (!dateString) return '';
  
  // Nếu là định dạng ISO có 'Z' (UTC) như "2025-04-30T00:00:00.000Z"
  if (dateString.includes('T') && dateString.endsWith('Z')) {
    // Tạo đối tượng Date từ chuỗi ISO
    const date = new Date(dateString);
    
    // Lấy các thành phần ngày theo UTC để tránh lệch múi giờ
    const year = date.getUTCFullYear();
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = date.getUTCDate().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }
  
  // Nếu là định dạng ISO không có 'Z'
  if (dateString.includes('T')) {
    return dateString.split('T')[0];
  }
  
  // Nếu chỉ là chuỗi YYYY-MM-DD
  return dateString;
}

/**
 * Kiểm tra xem một ngày có phải ngày hôm nay không
 * @param date Đối tượng Date cần kiểm tra
 * @returns true nếu là ngày hôm nay, false nếu không phải
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
}

/**
 * Lấy ngày từ dayOfWeek của API, ánh xạ đúng sang getDay của JavaScript
 * @param apiDayOfWeek Ngày trong tuần từ API (0=Thứ 2, 1=Thứ 3, ..., 6=Chủ nhật)
 * @param baseDate Ngày cơ sở để tính toán, mặc định là ngày hiện tại
 * @returns Đối tượng Date của ngày phù hợp với dayOfWeek
 */
export function getDateFromApiDayOfWeek(apiDayOfWeek: number, baseDate: Date = new Date()): Date {
  // Tạo bản sao để không thay đổi baseDate
  const targetDate = new Date(baseDate);
  
  // Lấy ngày trong tuần hiện tại (0-6)
  const currentJSDay = targetDate.getDay();
  
  // Chuyển từ dayOfWeek của API sang getDay của JavaScript
  const targetJSDay = API_TO_JS_DAY[apiDayOfWeek];
  
  // Tính số ngày cần thêm/bớt
  let dayDiff = targetJSDay - currentJSDay;
  
  // Nếu ngày đích ở tuần sau (đã qua trong tuần này)
  if (dayDiff < 0) {
    dayDiff += 7;
  }
  
  // Đặt thành ngày mới
  targetDate.setDate(targetDate.getDate() + dayDiff);
  
  // Đặt giờ về 00:00:00
  targetDate.setHours(0, 0, 0, 0);
  
  return targetDate;
}

/**
 * Kiểm tra xem một ngày có nằm trong danh sách ngày nghỉ không
 * @param date Đối tượng Date cần kiểm tra
 * @param holidays Danh sách các ngày nghỉ
 * @returns true nếu là ngày nghỉ, false nếu không phải
 */
export function isHoliday(date: Date, holidays: Holiday[]): boolean {
  const dateString = formatDateToISOString(date);
  return holidays.some(h => h.date === dateString);
}

/**
 * Tạo phạm vi ngày từ startDate đến endDate
 * @param startDate Ngày bắt đầu
 * @param endDate Ngày kết thúc
 * @returns Mảng các đối tượng Date trong phạm vi
 */
export function getDateRange(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
}

/**
 * Xử lý ngày lễ từ API tạo thành các đối tượng Holiday đã chuẩn hóa
 * Hỗ trợ cả ngày lễ đơn lẻ và kỳ nghỉ nhiều ngày
 * @param apiHoliday Đối tượng ngày lễ từ API
 * @returns Mảng các đối tượng Holiday đã chuẩn hóa
 */
export function processApiHoliday(apiHoliday: any): Holiday[] {
  const holidays: Holiday[] = [];
  
  if (!apiHoliday.startDate) {
    console.error('Thiếu startDate trong dữ liệu holiday:', apiHoliday);
    return [];
  }
  
  try {
    // Chuẩn hóa startDate
    const startDateStr = normalizeISODateString(apiHoliday.startDate);
    
    // Xử lý endDate nếu có
    let endDateStr: string | null = null;
    if (apiHoliday.endDate) {
      endDateStr = normalizeISODateString(apiHoliday.endDate);
    }
    
    // Nếu là kỳ nghỉ nhiều ngày
    if (endDateStr && endDateStr !== startDateStr) {
      // Tạo đối tượng Date từ chuỗi đã chuẩn hóa
      // Thêm 'T12:00:00' để tránh vấn đề với DST
      const start = new Date(`${startDateStr}T12:00:00`);
      const end = new Date(`${endDateStr}T12:00:00`);
      
      // Tạo danh sách các ngày trong khoảng thời gian
      const dateRange = getDateRange(start, end);
      
      // Tạo các đối tượng Holiday cho từng ngày
      return dateRange.map(date => {
        const dateStr = formatDateToISOString(date);
        return {
          id: `holiday_${apiHoliday.id || Math.random()}_${dateStr}`,
          name: apiHoliday.name,
          description: apiHoliday.description || '',
          date: dateStr,
          isAllDay: true
        };
      });
    } else {
      // Nếu là ngày lễ đơn
      holidays.push({
        id: apiHoliday.id || String(Math.random()),
        name: apiHoliday.name,
        description: apiHoliday.description || '',
        date: startDateStr,
        isAllDay: true
      });
    }
  } catch (err) {
    console.error('Lỗi khi xử lý ngày lễ:', err, apiHoliday);
  }
  
  return holidays;
} 