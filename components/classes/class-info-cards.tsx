import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { ClassInfoCardsProps } from './types';
import { memo } from 'react';

function ClassInfoCardsComponent({ classDetail, formatDate, getNextClassStatus }: ClassInfoCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            <div className="flex items-center">
              <BookOpen className="mr-2 h-4 w-4 text-muted-foreground" />
              Môn học
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{classDetail.subject}</div>
          <p className="text-xs text-muted-foreground">
            Đang học: {classDetail.currentUnit || 'Chưa có thông tin'}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            <div className="flex items-center">
              <Users className="mr-2 h-4 w-4 text-muted-foreground" />
              Học sinh
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{classDetail.totalStudents}</div>
          <p className="text-xs text-muted-foreground">
            Trong lớp học
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            <div className="flex items-center">
              <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
              Lịch học
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold truncate">
            {classDetail.schedule || 'Chưa có lịch học'}
          </div>
          <p className="text-xs text-muted-foreground">
            {classDetail.time || 'Vui lòng thiết lập lịch học'}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
              Buổi học tiếp theo
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {classDetail.schedule ? (
            <>
              <div className="text-2xl font-bold">
                {formatDate(classDetail.nextClass).split(',')[0]}
              </div>
              <div className="flex items-center">
                <span className={`text-xs ${getNextClassStatus(classDetail.nextClass).color}`}>
                  • {getNextClassStatus(classDetail.nextClass).text}
                </span>
                <span className="text-xs text-muted-foreground ml-1">
                  {formatDate(classDetail.nextClass).split(',')[1]}
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="text-xl font-medium text-amber-500">Chưa có lịch học</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
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