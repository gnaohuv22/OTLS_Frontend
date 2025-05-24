import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Video, AlertCircle, Loader2 } from 'lucide-react';
import { OnlineMeetingTabProps } from '../types';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { useEffect, useState } from 'react';

export function OnlineMeetingTab({ 
  classDetail, 
  role, 
  isMeetingActive, 
  isLoadingMeeting = false,
  startMeeting, 
  endMeeting 
}: OnlineMeetingTabProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isJoining, setIsJoining] = useState(false);
  
  useEffect(() => {
    setIsJoining(false);
  }, [isMeetingActive]);
  
  const handleJoinMeeting = async () => {
    setIsJoining(true);
    
    try {
      if (!isMeetingActive) {
        toast({
          variant: "destructive",
          title: "Lớp học không khả dụng",
          description: "Lớp học trực tuyến đã kết thúc hoặc chưa được bắt đầu."
        });
        setIsJoining(false);
        return;
      }
      
      router.push(`/classes/${classDetail.id}/meeting`);
    } catch (error) {
      console.error('Lỗi khi tham gia lớp học:', error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tham gia lớp học trực tuyến. Vui lòng thử lại sau."
      });
      setIsJoining(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <CardTitle>Lớp học trực tuyến</CardTitle>
            <CardDescription>
              Tạo và tham gia lớp học trực tuyến
            </CardDescription>
          </div>
          {isMeetingActive && (
            <Badge className="bg-green-500 animate-pulse">Đang diễn ra</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isMeetingActive ? (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Thông báo</AlertTitle>
              <AlertDescription>
                Lớp học trực tuyến đang diễn ra. Bạn có thể tham gia ngay bây giờ.
              </AlertDescription>
            </Alert>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
              <div className="flex-1">
                <p className="text-muted-foreground">
                  {role === 'Teacher' 
                    ? 'Học sinh có thể tham gia lớp học trực tuyến bằng liên kết hoặc qua trang lớp học.' 
                    : 'Giáo viên đã bắt đầu lớp học trực tuyến. Bạn có thể tham gia ngay bây giờ.'}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  className="w-full sm:w-auto" 
                  onClick={handleJoinMeeting}
                  disabled={isJoining}
                >
                  {isJoining ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang tham gia...
                    </>
                  ) : (
                    <>
                      <Video className="mr-2 h-4 w-4" />
                      Tham gia lớp học
                    </>
                  )}
                </Button>
                {role === 'Teacher' && (
                  <Button 
                    variant="destructive" 
                    className="w-full sm:w-auto"
                    onClick={endMeeting}
                    disabled={isLoadingMeeting || isJoining}
                  >
                    {isLoadingMeeting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang kết thúc...
                      </>
                    ) : (
                      'Kết thúc lớp học'
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              {role === 'Teacher' 
                ? 'Hiện tại không có lớp học trực tuyến nào đang diễn ra. Bạn có thể tạo lớp học trực tuyến mới.' 
                : 'Hiện tại không có lớp học trực tuyến nào đang diễn ra. Vui lòng quay lại sau khi giáo viên đã bắt đầu.'}
            </p>
            {role === 'Teacher' && (
              <Button 
                className="w-full sm:w-auto"
                onClick={startMeeting}
                disabled={isLoadingMeeting}
              >
                {isLoadingMeeting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang khởi tạo...
                  </>
                ) : (
                  <>
                    <Video className="mr-2 h-4 w-4" />
                    Tạo lớp học trực tuyến
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </CardContent>
      {isMeetingActive && (
        <CardFooter>
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="mr-2 h-4 w-4" />
            <p>ID Lớp học: {classDetail.id}</p>
          </div>
        </CardFooter>
      )}
    </Card>
  );
} 