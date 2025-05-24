import { Badge } from '@/components/ui/badge';
import { ClassDetailHeaderProps } from './types';
import { memo } from 'react';

// Helper function
const getNextClassStatus = (nextClass: string) => {
  const now = new Date();
  const next = new Date(nextClass);
  const diffHours = (next.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (diffHours < 0) return { text: 'Đã kết thúc', color: 'text-gray-500' };
  if (diffHours <= 24) return { text: 'Sắp diễn ra', color: 'text-green-500' };
  return { text: 'Sắp tới', color: 'text-blue-500' };
};

function ClassDetailHeaderComponent({ classDetail }: ClassDetailHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="space-y-1">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{classDetail.name}</h2>
        <p className="text-muted-foreground">{classDetail.description}</p>
      </div>
      <Badge variant="outline" className={getNextClassStatus(classDetail.nextClass).color}>
        {getNextClassStatus(classDetail.nextClass).text}
      </Badge>
    </div>
  );
}

export const ClassDetailHeader = memo(ClassDetailHeaderComponent); 