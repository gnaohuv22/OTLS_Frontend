import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { ClassInfoCardsProps } from './types';
import { memo } from 'react';

function ClassInfoCardsComponent({ classDetail, formatDate, getNextClassStatus }: ClassInfoCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
      <Card className="overflow-hidden">
        <CardHeader className="pb-1 sm:pb-2 p-3 sm:p-4">
          <CardTitle className="text-xs sm:text-sm font-medium">
            <div className="flex items-center">
              <BookOpen className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              Môn học
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 pt-0">
          <div className="text-base sm:text-xl md:text-2xl font-bold truncate">{classDetail.subject}</div>
          <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
            Đang học: {classDetail.currentUnit || 'Chưa có thông tin'}
          </p>
        </CardContent>
      </Card>
      
      <Card className="overflow-hidden">
        <CardHeader className="pb-1 sm:pb-2 p-3 sm:p-4">
          <CardTitle className="text-xs sm:text-sm font-medium">
            <div className="flex items-center">
              <Users className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              Học sinh
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 pt-0">
          <div className="text-base sm:text-xl md:text-2xl font-bold">{classDetail.totalStudents}</div>
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            Trong lớp học
          </p>
        </CardContent>
      </Card>
      
      <Card className="overflow-hidden">
        <CardHeader className="pb-1 sm:pb-2 p-3 sm:p-4">
          <CardTitle className="text-xs sm:text-sm font-medium">
            <div className="flex items-center">
              <Calendar className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              Lịch học
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 pt-0">
          <div className="text-base sm:text-xl md:text-2xl font-bold truncate">
            {classDetail.schedule || 'Chưa có lịch học'}
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
            {classDetail.time || 'Vui lòng thiết lập lịch học'}
          </p>
        </CardContent>
      </Card>
      
      <Card className="overflow-hidden">
        <CardHeader className="pb-1 sm:pb-2 p-3 sm:p-4">
          <CardTitle className="text-xs sm:text-sm font-medium">
            <div className="flex items-center">
              <Clock className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              Buổi học tiếp theo
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 pt-0">
          {classDetail.schedule ? (
            <>
              <div className="text-base sm:text-xl md:text-2xl font-bold truncate">
                {formatDate(classDetail.nextClass).split(',')[0]}
              </div>
              <div className="flex items-center">
                <span className={`text-[10px] sm:text-xs ${getNextClassStatus(classDetail.nextClass).color}`}>
                  • {getNextClassStatus(classDetail.nextClass).text}
                </span>
                <span className="text-[10px] sm:text-xs text-muted-foreground ml-1 truncate">
                  {formatDate(classDetail.nextClass).split(',')[1]}
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="text-sm sm:text-base md:text-xl font-medium text-amber-500">Chưa có lịch học</div>
              <div className="flex items-center text-[10px] sm:text-xs text-muted-foreground mt-1">
                <AlertTriangle className="h-3 w-3 mr-1 text-amber-500" />
                <span>Hãy thiết lập lịch học</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export const ClassInfoCards = memo(ClassInfoCardsComponent); 