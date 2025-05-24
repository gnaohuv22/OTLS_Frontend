'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/auth-context';
import { MeetingSetupForm } from './meeting-setup-form';
import { JitsiMeetingContainer } from './jitsi-meeting-container';
import { ClassroomService } from '@/lib/api/classes';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

interface MeetingControllerProps {
  classId: string;
  classDetail: {
    name: string;
    subject: string;
    teacher: string;
  };
  initialUserName: string;
}

export function MeetingController({
  classId,
  classDetail,
  initialUserName
}: MeetingControllerProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { role, userData } = useAuth();
  
  // Tạo tên phòng meeting dựa trên tên lớp và ID lớp học (rút gọn)
  const formatRoomName = () => {
    // Loại bỏ dấu tiếng Việt và ký tự đặc biệt từ tên lớp học
    const formattedClassName = classDetail.name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")  // Loại bỏ dấu
      .replace(/[^\w\s]/g, "")          // Loại bỏ ký tự đặc biệt
      .replace(/\s+/g, "-")             // Thay khoảng trắng bằng dấu gạch ngang
      .toLowerCase();
    
    // Lấy 8 ký tự đầu tiên của ID lớp học (loại bỏ dấu gạch ngang)
    const shortId = classId.replace(/-/g, "").substring(0, 8);
    
    // Đảm bảo roomName không quá dài và không chứa ký tự đặc biệt
    return `${formattedClassName.substring(0, 20)}-${shortId}`.replace(/[^a-z0-9-]/g, "");
  };
  
  const roomName = formatRoomName();
  
  const [isJoining, setIsJoining] = useState(false);
  const [userName, setUserName] = useState(initialUserName);
  const [isMicEnabled, setIsMicEnabled] = useState(false);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const [isEndingMeeting, setIsEndingMeeting] = useState(false);
  
  const handleJoinMeeting = () => {
    if (!userName.trim()) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Vui lòng nhập tên của bạn để tham gia lớp học trực tuyến.",
      });
      return;
    }
    
    setIsJoining(true);
    
    toast({
      title: "Thành công",
      description: `Đang kết nối đến lớp học trực tuyến: ${classDetail.name}...`,
    });
  };
  
  const handleLeaveConfirmation = () => {
    if (confirm('Bạn có chắc chắn muốn rời khỏi trang chuẩn bị tham gia lớp học?')) {
      router.push(`/classes/${classId}`);
    }
  };

  const handleEndMeeting = async () => {
    if (role !== 'Teacher' && role !== 'Admin') {
      toast({
        variant: "destructive",
        title: "Không được phép",
        description: "Bạn không có quyền kết thúc buổi học trực tuyến này.",
      });
      return;
    }

    if (!confirm('Bạn có chắc chắn muốn kết thúc buổi học trực tuyến này cho tất cả học sinh?')) {
      return;
    }

    try {
      setIsEndingMeeting(true);
      
      // Cập nhật trạng thái isOnlineMeeting của lớp học thành Inactive
      const updatedClassroom = await ClassroomService.updateClassroomStatus(classId, 'Inactive');
      
      // Kiểm tra xem API đã cập nhật thành công chưa
      if (updatedClassroom.isOnlineMeeting !== 'Inactive') {
        throw new Error('Không thể cập nhật trạng thái lớp học, vui lòng thử lại.');
      }
      
      toast({
        title: "Thành công",
        description: "Đã kết thúc buổi học trực tuyến. Tất cả học sinh sẽ được thông báo và chuyển hướng về trang lớp học.",
      });
      
      // Chuyển hướng về trang lớp học
      router.push(`/classes/${classId}`);
    } catch (error: any) {
      console.error('Lỗi khi kết thúc buổi học:', error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error.message || "Không thể kết thúc buổi học trực tuyến.",
      });
    } finally {
      setIsEndingMeeting(false);
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      {!isJoining ? (
        <MeetingSetupForm
          userName={userName}
          setUserName={setUserName}
          isMicEnabled={isMicEnabled}
          setIsMicEnabled={setIsMicEnabled}
          isCameraEnabled={isCameraEnabled}
          setCameraEnabled={setIsCameraEnabled}
          onJoinMeeting={handleJoinMeeting}
          onLeaveConfirmation={handleLeaveConfirmation}
          classDetail={classDetail}
        />
      ) : (
        <div className="relative">
          {(role === 'Teacher' || role === 'Admin') && (
            <div className="absolute top-2 right-2 z-10">
              <Button 
                variant="destructive" 
                onClick={handleEndMeeting}
                disabled={isEndingMeeting}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                {isEndingMeeting ? 'Đang kết thúc...' : 'Kết thúc buổi học'}
              </Button>
            </div>
          )}
          <JitsiMeetingContainer
            roomName={roomName} 
            classId={classId} 
            userName={userName}
            startWithAudioMuted={!isMicEnabled}
            startWithVideoMuted={!isCameraEnabled}
          />
        </div>
      )}
    </div>
  );
} 