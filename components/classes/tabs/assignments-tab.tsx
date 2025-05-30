'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { AssignmentsTabProps, Assignment } from '../types';
import { ClassroomService } from '@/lib/api/classes';
import { useToast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

// Hàm mặc định để format ngày khi không có formatDate
const defaultFormatDate = (dateString: string | undefined) => {
  if (!dateString) return 'Không xác định';
  return new Date(dateString).toLocaleDateString('vi-VN');
};

export function AssignmentsTab({ classDetail, role, formatDate, classId }: AssignmentsTabProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [visibleAssignments, setVisibleAssignments] = useState(3);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Tạo hàm format phù hợp với kiểu dữ liệu yêu cầu
  const safeFormatDate = formatDate 
    ? ((date: string | undefined) => formatDate(date as string)) 
    : defaultFormatDate;
    
  // Fetch assignments from the API
  useEffect(() => {
    const fetchAssignments = async () => {
      if (!classDetail?.classroomId) return;
      
      try {
        setIsLoading(true);
        const result = await ClassroomService.getAssignmentsByClassroomId(classDetail.classroomId);
        if (result && result.assignments) {
          console.log('Assignments loaded:', result.assignments.length);
          setAssignments(result.assignments);
        } else {
          setAssignments([]);
        }
      } catch (error: any) {
        if (error.status === 404) {
          setAssignments([]);
        } else {
          console.error('Error fetching assignments:', error);
          toast({
            title: 'Lỗi',
          description: 'Không thể tải danh sách bài tập',
          variant: 'destructive',
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignments();
  }, [classDetail?.classroomId, toast]);

  const loadMoreAssignments = () => {
    setVisibleAssignments(prev => Math.min(prev + 3, assignments.length));
  };

  const now = new Date();
  const activeAssignments = assignments
    .filter(a => new Date(a.dueDate) >= now && !a.isDelete);
  const completedAssignments = assignments
    .filter(a => new Date(a.dueDate) < now && !a.isDelete);

  // Render loading skeletons
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <h1 className="text-2xl font-bold">Bài tập</h1>
          {role === 'Teacher' && (
            <Button variant="default" className="gap-2" disabled>
              <Plus className="h-4 w-4" />
              Tạo bài tập
            </Button>
          )}
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-4" />
                <Skeleton className="h-10 w-1/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <h1 className="text-2xl font-bold">Bài tập</h1>
        {role === 'Teacher' && (
          <Button 
            variant="default" 
            className="gap-2"
            onClick={() => router.push(`/assignments/create?classId=${classId}`)}
          >
            <Plus className="h-4 w-4" />
            Tạo bài tập
          </Button>
        )}
      </div>
      
      <div className="space-y-4">
        {activeAssignments.length > 0 && (
          <>
            <h2 className="text-lg font-semibold">Bài tập đang thực hiện</h2>
            {activeAssignments.slice(0, visibleAssignments).map((assignment) => (
              <Card key={assignment.assignmentId}>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <CardTitle className="flex items-center gap-2 flex-wrap">
                      {assignment.title}
                      <Badge variant="outline">{assignment.assignmentType}</Badge>
                    </CardTitle>
                    <Badge>
                      {assignment.maxPoints} điểm
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Hạn nộp: {safeFormatDate(assignment.dueDate)}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">{assignment.description}</p>
                  {role === 'Student' ? (
                    <Button 
                      className="w-full sm:w-auto"
                      onClick={() => router.push(`/assignments/${assignment.assignmentId}`)}
                    >
                      Nộp bài
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="w-full sm:w-auto" 
                      onClick={() => router.push(`/assignments/${assignment.assignmentId}`)}
                    >
                      Xem chi tiết
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </>
        )}

        {completedAssignments.length > 0 && (
          <>
            <h2 className="text-lg font-semibold mt-6">Bài tập đã hoàn thành</h2>
            {completedAssignments.slice(0, visibleAssignments).map((assignment) => (
              <Card key={assignment.assignmentId}>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <CardTitle className="flex items-center gap-2">
                      {assignment.title}
                      <Badge variant="outline">{assignment.assignmentType}</Badge>
                    </CardTitle>
                    <Badge variant="secondary">
                      {assignment.maxPoints} điểm
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Đã hết hạn: {safeFormatDate(assignment.dueDate)}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">{assignment.description}</p>
                  <Button 
                    variant="outline" 
                    className="w-full sm:w-auto"
                    onClick={() => router.push(`/assignments/${assignment.assignmentId}`)}
                  >
                    Xem chi tiết
                  </Button>
                </CardContent>
              </Card>
            ))}
          </>
        )}

        {activeAssignments.length === 0 && completedAssignments.length === 0 && (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">
                Hiện tại chưa có bài tập nào trong lớp học này.
              </p>
            </CardContent>
          </Card>
        )}

        {visibleAssignments < assignments.length && (
          <div className="flex justify-center mt-4">
            <Button variant="outline" onClick={loadMoreAssignments}>
              Xem thêm bài tập
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 