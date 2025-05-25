import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, CheckSquare, Video, FileText, Users, BarChart2, Settings } from 'lucide-react';
import { ClassTabNavProps } from './types';
import { memo } from 'react';

function ClassTabNavComponent({ activeTab, handleTabChange, role, isMeetingActive }: ClassTabNavProps) {
  // Tính toán số lượng tab để phân chia grid
  const tabCount = role === 'Teacher' ? 6 : 6;
  
  // Định nghĩa style chung cho tất cả các tab, loại bỏ min-width
  const commonTabClass = "text-xs sm:text-sm px-1 sm:px-3";
  
  return (
    <TabsList className="grid grid-cols-6 w-full gap-1" style={{ gridTemplateColumns: `repeat(${tabCount}, 1fr)` }}>
      <TabsTrigger value="announcements" className={commonTabClass}>
        <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
        <span className="truncate">Thông báo</span>
      </TabsTrigger>
      <TabsTrigger value="assignments" className={commonTabClass}>
        <CheckSquare className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
        <span className="truncate">Bài tập</span>
      </TabsTrigger>
      <TabsTrigger value="meeting" className={`${commonTabClass} relative`}>
        <Video className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
        <span className="truncate">Lớp trực tuyến</span>
        {isMeetingActive && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
        )}
      </TabsTrigger>
      <TabsTrigger value="materials" className={commonTabClass}>
        <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
        <span className="truncate">Tài liệu</span>
      </TabsTrigger>
      <TabsTrigger value="students" className={commonTabClass}>
        <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
        <span className="truncate">Học sinh</span>
      </TabsTrigger>
      <TabsTrigger value="settings" className={commonTabClass}>
        <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
        <span className="truncate">Cài đặt</span>
      </TabsTrigger>
    </TabsList>
  );
}
 
export const ClassTabNav = memo(ClassTabNavComponent); 