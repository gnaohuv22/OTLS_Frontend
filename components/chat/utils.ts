// Hàm định dạng kích thước file
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// Kiểm tra xem attachment có phải là hình ảnh không
export const isImage = (type: string): boolean => {
  return type.startsWith('image/');
};

// Hàm kiểm tra xem hai ngày có cùng ngày không
export function isSameDay(date1: Date, date2: Date): boolean {
  return date1.getDate() === date2.getDate() && 
         date1.getMonth() === date2.getMonth() && 
         date1.getFullYear() === date2.getFullYear();
}

// Hàm định dạng thời gian (giờ:phút)
export function formatTime(timestamp: Date): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

// Hàm định dạng ngày tháng (Hôm nay, Hôm qua, hoặc ngày/tháng/năm)
export function formatMessageDate(timestamp: Date): string {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (isSameDay(date, today)) {
    return 'Hôm nay';
  } else if (isSameDay(date, yesterday)) {
    return 'Hôm qua';
  } else {
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
} 