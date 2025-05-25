'use client';

import { AnnouncementsTabProps } from '../types';
import { AnnouncementManager } from '../announcements/announcement-manager';

export function AnnouncementsTab({ 
  classDetail, 
  role, 
  userData, 
  formatDate,
  teacher
}: AnnouncementsTabProps) {
  return (
    <div className="space-y-6">
      <AnnouncementManager
        classroomId={classDetail.classroomId}
        userData={userData}
        role={role}
        formatDate={formatDate}
        students={classDetail.students}
        teacher={teacher}
      />
    </div>
  );
} 