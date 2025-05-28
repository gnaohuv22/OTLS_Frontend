import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, CheckSquare, Video, FileText, Users, BarChart2, Settings } from 'lucide-react';
import { ClassTabNavProps } from './types';
import { memo } from 'react';

function ClassTabNavComponent({ activeTab, handleTabChange, role, isMeetingActive }: ClassTabNavProps) {
  // Định nghĩa style chung cho tất cả các tab
  const commonTabClass = "text-xs sm:text-sm px-1 sm:px-3 h-9 sm:h-10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm";
  
  return (
    <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full gap-1 bg-muted/50 p-1 h-auto">
      <TabsTrigger value="announcements" className={commonTabClass}>
        <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
        <span className="truncate">Thông báo</span>
      </TabsTrigger>
      <TabsTrigger value="assignments" className={commonTabClass}>
        <CheckSquare className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
        <span className="truncate">Bài tập</span>
      </TabsTrigger>
      <TabsTrigger value="meeting" className={`${commonTabClass} relative`}>
        <Video className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
        <span className="truncate">Lớp trực tuyến</span>
        {isMeetingActive && (
          <span className="absolute -top-1 -right-1 flex h-2 w-2 sm:h-3 sm:w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 sm:h-3 sm:w-3 bg-green-500"></span>
          </span>
        )}
      </TabsTrigger>
      <TabsTrigger value="materials" className={commonTabClass}>
        <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
        <span className="truncate">Tài liệu</span>
      </TabsTrigger>
      <TabsTrigger value="students" className={commonTabClass}>
        <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
        <span className="truncate">Học sinh</span>
      </TabsTrigger>
      <TabsTrigger value="settings" className={commonTabClass}>
        <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
        <span className="truncate">Cài đặt</span>
      </TabsTrigger>
    </TabsList>
  );
}
 
export const ClassTabNav = memo(ClassTabNavComponent); 