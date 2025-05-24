'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ClassroomService } from './classes';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface JitsiMeetingProps {
  roomName: string;
  classId: string;
  userName?: string;
  startWithAudioMuted?: boolean;
  startWithVideoMuted?: boolean;
}

type JitsiMeetExternalAPI = any;

declare global {
  interface Window {
    JitsiMeetExternalAPI: JitsiMeetExternalAPI;
  }
}

const JITSI_APP_ID = process.env.NEXT_PUBLIC_JITSI_APP_ID;
// Khoảng thời gian kiểm tra trạng thái lớp học (ms)
const CHECK_CLASSROOM_INTERVAL = 5000; 

const JitsiMeeting: React.FC<JitsiMeetingProps> = ({ 
  roomName, 
  classId, 
  userName,
  startWithAudioMuted = true,
  startWithVideoMuted = false 
}) => {
  const router = useRouter();
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const jitsiApiRef = useRef<any>(null);
  const [showEndedDialog, setShowEndedDialog] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Kiểm tra trạng thái lớp học
  const checkClassroomStatus = useCallback(async () => {
    try {
      const classroom = await ClassroomService.getClassroomById(classId);
      console.log(`[Meeting Status Check] Class ${classId} status: ${classroom.isOnlineMeeting}`);
      
      // Cải thiện xác thực điều kiện kết thúc
      if (classroom.isOnlineMeeting !== 'Active') {
        console.log(`[Meeting Status Check] Meeting ended by teacher: ${classroom.isOnlineMeeting}`);
        
        // Hiển thị dialog thông báo
        setShowEndedDialog(true);
        
        // Dừng jitsi meeting nếu API đang hoạt động
        if (jitsiApiRef.current) {
          try {
            jitsiApiRef.current.executeCommand('hangup');
          } catch (e) {
            console.error('Error hanging up Jitsi meeting:', e);
          }
        }
        
        // Chuyển hướng về trang lớp học sau 3 giây
        setTimeout(() => {
          router.push(`/classes/${classId}`);
        }, 3000);
        
        // Xóa interval để không kiểm tra nữa
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    } catch (error) {
      console.error('Error checking classroom status:', error);
    }
  }, [classId, router, jitsiApiRef]);

  useEffect(() => {
    let api: any = null;

    const loadJitsiScript = () => {
      if (typeof window.JitsiMeetExternalAPI !== 'undefined') {
        initJitsi();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://8x8.vc/${JITSI_APP_ID}/external_api.js`;
      script.async = true;
      script.onload = initJitsi;
      document.body.appendChild(script);

      return () => {
        if (script && script.parentNode) {
          script.parentNode.removeChild(script);
        }
      };
    };

    const initJitsi = () => {
      if (!jitsiContainerRef.current) return;

      // Tính toán chiều cao của container
      const windowHeight = window.innerHeight;
      const containerHeight = windowHeight;

      // Cập nhật style cho container
      jitsiContainerRef.current.style.height = `${containerHeight}px`;

      const domain = '8x8.vc';
      const options = {
        roomName: `${JITSI_APP_ID}/${roomName}`,
        width: '100%',
        height: '100%',
        parentNode: jitsiContainerRef.current,
        configOverwrite: {
          prejoinPageEnabled: false,
          startWithAudioMuted: startWithAudioMuted,
          startWithVideoMuted: startWithVideoMuted,
          disableDeepLinking: true,
          chromeExtensionBanner: false,
          defaultLanguage: 'vi',
          enableClosePage: true,
          disableProfile: true,
          readOnlyName: true,
          notifications: [],
          subject: roomName.replace(/-/g, ' '),
          toolbarButtons: [
            'microphone', 'camera', 'desktop', 'fullscreen',
            'fodeviceselection', 'hangup', 'chat', 'raisehand',
            'videoquality', 'filmstrip', 'tileview', 'settings',
            'select-background', 'toggle-camera'
          ],
        },
        interfaceConfigOverwrite: {
          SETTINGS_SECTIONS: ['devices', 'language', 'moderator', 'profile', 'sounds', 'more'],
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          DEFAULT_REMOTE_DISPLAY_NAME: userName,
          TOOLBAR_ALWAYS_VISIBLE: true,
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
          HIDE_INVITE_MORE_HEADER: true,
          MOBILE_APP_PROMO: false,
          SUPPORT_URL: false,
          PROVIDER_NAME: 'OTLS',
          LANG_DETECTION: false,
          DEFAULT_LANGUAGE: 'vi',
          SHOW_CHROME_EXTENSION_BANNER: false,
        },
        userInfo: {
          displayName: userName,
        },
        devices: {
          audioInput: true,
          audioOutput: true,
          videoInput: true,
        },
      };

      try {
        // Đảm bảo chỉ có một instance của API
        if (jitsiApiRef.current) {
          jitsiApiRef.current.dispose();
        }

        api = new window.JitsiMeetExternalAPI(domain, options);
        jitsiApiRef.current = api;

        api.addEventListeners({
          readyToClose: handleClose,
          participantLeft: handleParticipantLeft,
          participantJoined: handleParticipantJoined,
          videoConferenceJoined: handleVideoConferenceJoined,
          videoConferenceLeft: handleVideoConferenceLeft,
          hangup: handleHangup,
        });

        // Xử lý lỗi kết nối
        api.addEventListener('videoConferenceJoined', () => {
          console.log('Connection established');
          
          if (!intervalRef.current) {
            // Bắt đầu kiểm tra trạng thái lớp học định kỳ khi kết nối được thiết lập
            intervalRef.current = setInterval(checkClassroomStatus, CHECK_CLASSROOM_INTERVAL);
          }
        });

        api.addEventListener('connectionFailed', () => {
          console.error('Connection failed');
          // Chuyển hướng về trang lớp học khi kết nối thất bại
          router.push(`/classes/${classId}`);
        });

      } catch (error) {
        console.error('Error initializing Jitsi:', error);
        router.push(`/classes/${classId}`);
      }
    };

    const handleClose = () => {
      // console.log('Meeting closed');
      router.push(`/classes/${classId}`);
    };

    const handleHangup = () => {
      // console.log('Call hung up');
      router.push(`/classes/${classId}`);
    };

    const handleParticipantLeft = (participant: any) => {
      console.log('Participant left:', participant);
    };

    const handleParticipantJoined = (participant: any) => {
      console.log('Participant joined:', participant);
    };

    const handleVideoConferenceJoined = (participant: any) => {
      console.log('Video conference joined:', participant);
    };

    const handleVideoConferenceLeft = () => {
      console.log('Video conference left');
      router.push(`/classes/${classId}`);
    };

    // Thêm event listener cho window resize
    const handleResize = () => {
      if (jitsiContainerRef.current) {
        jitsiContainerRef.current.style.height = `${window.innerHeight}px`;
      }
    };

    window.addEventListener('resize', handleResize);
    loadJitsiScript();

    // Cleanup function
    return () => {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
        jitsiApiRef.current = null;
      }
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      window.removeEventListener('resize', handleResize);
    };
  }, [roomName, classId, router, userName, startWithAudioMuted, startWithVideoMuted, checkClassroomStatus]);

  return (
    <div className="w-full h-screen">
      <div 
        ref={jitsiContainerRef} 
        id="jitsi-container" 
        className="w-full"
        style={{ height: '100vh' }}
      />
      
      {/* Dialog thông báo lớp học đã kết thúc */}
      <Dialog open={showEndedDialog} onOpenChange={setShowEndedDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Lớp học đã kết thúc</DialogTitle>
            <DialogDescription>
              Lớp học đã được giáo viên kết thúc. Bạn sẽ được quay về trang lớp học trong 3 giây.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JitsiMeeting; 