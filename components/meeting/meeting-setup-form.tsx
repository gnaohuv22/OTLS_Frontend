'use client';

import { 
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Video } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DeviceControl } from './device-control';

interface MeetingSetupFormProps {
  userName: string;
  setUserName: (name: string) => void;
  isMicEnabled: boolean;
  setIsMicEnabled: (enabled: boolean) => void;
  isCameraEnabled: boolean;
  setCameraEnabled: (enabled: boolean) => void;
  onJoinMeeting: () => void;
  onLeaveConfirmation: () => void;
  className?: string;
  classDetail: {
    name: string;
    subject: string;
    teacher: string;
  };
}

export function MeetingSetupForm({
  userName,
  setUserName,
  isMicEnabled,
  setIsMicEnabled,
  isCameraEnabled,
  setCameraEnabled,
  onJoinMeeting,
  onLeaveConfirmation,
  classDetail
}: MeetingSetupFormProps) {
  return (
    <div className="max-w-3xl mx-auto">
      <Card className="w-full">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Tham gia lớp học trực tuyến
          </CardTitle>
          <CardDescription className="text-center">
            {classDetail.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Thông báo</AlertTitle>
            <AlertDescription>
              Bạn sắp tham gia vào lớp học trực tuyến. Vui lòng xác nhận thông tin và cài đặt thiết bị.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Tên hiển thị</Label>
              <Input
                id="username"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Nhập tên của bạn"
              />
              <p className="text-sm text-muted-foreground">
                Tên này sẽ hiển thị cho mọi người trong lớp học trực tuyến
              </p>
            </div>
            
            <div className="space-y-4 pt-4">
              <h3 className="font-medium">Cài đặt thiết bị</h3>
              <DeviceControl 
                isMicEnabled={isMicEnabled}
                setIsMicEnabled={setIsMicEnabled}
                isCameraEnabled={isCameraEnabled}
                setCameraEnabled={setCameraEnabled}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-3">
          <Button 
            variant="outline" 
            onClick={onLeaveConfirmation}
            className="w-full sm:w-auto"
          >
            Quay lại lớp học
          </Button>
          <Button 
            onClick={onJoinMeeting} 
            className="w-full sm:w-auto"
          >
            <Video className="mr-2 h-4 w-4" />
            Tham gia ngay
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 