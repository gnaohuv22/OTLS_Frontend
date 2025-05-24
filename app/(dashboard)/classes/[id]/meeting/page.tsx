'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { MeetingController } from '@/components/meeting';
import { ClassroomService, Classroom } from '@/lib/api/classes';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function MeetingPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { role, userData } = useAuth();
  const classId = params.id as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [classDetail, setClassDetail] = useState<Classroom | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Thiết lập tên người dùng ban đầu dựa trên dữ liệu người dùng
  const initialUserName = userData?.fullName || (role === 'Teacher' ? 'Giáo viên' : 'Học sinh');

  useEffect(() => {
    const fetchClassroomData = async () => {
      try {
        setIsLoading(true);
        const classData = await ClassroomService.getClassroomById(classId);
        
        // Kiểm tra xem lớp có đang trong trạng thái meeting không
        if (classData.isOnlineMeeting !== 'Active') {
          toast({
            title: "Lớp học không hoạt động",
            description: "Lớp học này chưa bắt đầu buổi học trực tuyến.",
            variant: "destructive"
          });
          router.push(`/classes/${classId}`);
          return;
        }
        
        setClassDetail(classData);
      } catch (error: any) {
        console.error('Lỗi khi lấy thông tin lớp học:', error);
        setError(error.message || 'Không thể tải thông tin lớp học');
        toast({
          title: "Lỗi",
          description: error.message || 'Không thể tải thông tin lớp học',
          variant: "destructive"
        });
        router.push(`/classes/${classId}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClassroomData();
  }, [classId, router, toast]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-lg">Đang tải thông tin lớp học...</p>
      </div>
    );
  }

  if (error || !classDetail) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <p className="text-lg text-red-500">
          {error || "Không thể tải thông tin lớp học"}
        </p>
      </div>
    );
  }

  // Lấy thông tin môn học từ phần mô tả
  let subject = 'Chưa xác định';
  const subjectMatch = classDetail.description.match(/Môn học: (.*?)(\n|$)/);
  if (subjectMatch) {
    subject = subjectMatch[1];
  }

  const formattedClassDetail = {
    name: classDetail.name,
    subject: subject,
    teacher: classDetail.userId, // Ideally, we would fetch teacher's name
  };

  return (
    <MeetingController
      classId={classId}
      classDetail={formattedClassDetail}
      initialUserName={initialUserName}
    />
  );
} 