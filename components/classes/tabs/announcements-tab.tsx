'use client';

import { AnnouncementsTabProps } from '../types';
import { AnnouncementManager } from '../announcements/announcement-manager';

// Hàm mặc định để format ngày khi không có formatDate
const defaultFormatDate = (dateString: string | undefined) => {
  if (!dateString) return 'Không có thông tin';
  return new Date(dateString).toLocaleDateString('vi-VN');
};

export function AnnouncementsTab({ 
  classDetail, 
  role, 
  userData, 
  formatDate,
  teacher
}: AnnouncementsTabProps) {
  // Tạo hàm format phù hợp với kiểu dữ liệu yêu cầu
  const safeFormatDate = formatDate 
    ? ((date: string | undefined) => formatDate(date as string)) 
    : defaultFormatDate;
    
  return (
    <div className="space-y-6">
      <AnnouncementManager
        classroomId={classDetail.classroomId}
        userData={userData}
        role={role}
        formatDate={safeFormatDate}
        students={classDetail.students}
        teacher={teacher}
      />
    </div>
  );
} 