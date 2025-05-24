'use client';

import dynamic from 'next/dynamic';

const JitsiMeeting = dynamic(
  () => import('@/lib/api/jitsi-meeting'),
  { ssr: false }
);

interface JitsiMeetingContainerProps {
  roomName: string;
  classId: string;
  userName: string;
  startWithAudioMuted: boolean;
  startWithVideoMuted: boolean;
}

export function JitsiMeetingContainer({
  roomName,
  classId,
  userName,
  startWithAudioMuted,
  startWithVideoMuted
}: JitsiMeetingContainerProps) {
  return (
    <div className="w-full h-[calc(100vh-4rem)]">
      <JitsiMeeting 
        roomName={roomName}
        classId={classId}
        userName={userName}
        startWithAudioMuted={startWithAudioMuted}
        startWithVideoMuted={startWithVideoMuted}
      />
    </div>
  );
} 