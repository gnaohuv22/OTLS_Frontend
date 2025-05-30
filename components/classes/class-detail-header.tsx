import { Badge } from '@/components/ui/badge';
import { ClassDetailHeaderProps } from './types';
import { memo } from 'react';

// Helper function
const getNextClassStatus = (nextClass: string | undefined) => {
  // Nếu nextClass không tồn tại, coi như đã kết thúc
  if (!nextClass) return { text: 'Không xác định', color: 'text-gray-500' };
  
  const now = new Date();
  const next = new Date(nextClass);
  const diffHours = (next.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (diffHours < 0) return { text: 'Đã kết thúc', color: 'text-gray-500' };
  if (diffHours <= 24) return { text: 'Sắp diễn ra', color: 'text-green-500' };
  return { text: 'Sắp tới', color: 'text-blue-500' };
};

function ClassDetailHeaderComponent({ classDetail }: ClassDetailHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      <div className="space-y-0.5 sm:space-y-1 max-w-full sm:max-w-[70%]">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight line-clamp-2">{classDetail.name}</h2>
        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{classDetail.description}</p>
      </div>
      <Badge variant="outline" className={`${getNextClassStatus(classDetail.nextClass).color} whitespace-nowrap mt-1 sm:mt-0 text-xs sm:text-sm`}>
        {getNextClassStatus(classDetail.nextClass).text}
      </Badge>
    </div>
  );
}

export const ClassDetailHeader = memo(ClassDetailHeaderComponent); 