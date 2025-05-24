'use client';

import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Mic, MicOff, Video, VideoOff } from 'lucide-react';

interface DeviceControlProps {
  isMicEnabled: boolean;
  setIsMicEnabled: (enabled: boolean) => void;
  isCameraEnabled: boolean;
  setCameraEnabled: (enabled: boolean) => void;
}

export function DeviceControl({
  isMicEnabled,
  setIsMicEnabled,
  isCameraEnabled,
  setCameraEnabled
}: DeviceControlProps) {
  return (
    <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
      <div className="flex items-center justify-between p-4 border rounded-md flex-1">
        <div className="space-y-0.5">
          <Label htmlFor="microphone">Microphone</Label>
          <p className="text-sm text-muted-foreground">
            {isMicEnabled ? 'Đã bật' : 'Đã tắt'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {isMicEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          <Switch
            id="microphone"
            checked={isMicEnabled}
            onCheckedChange={setIsMicEnabled}
          />
        </div>
      </div>
      <div className="flex items-center justify-between p-4 border rounded-md flex-1">
        <div className="space-y-0.5">
          <Label htmlFor="camera">Camera</Label>
          <p className="text-sm text-muted-foreground">
            {isCameraEnabled ? 'Đã bật' : 'Đã tắt'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {isCameraEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          <Switch
            id="camera"
            checked={isCameraEnabled}
            onCheckedChange={setCameraEnabled}
          />
        </div>
      </div>
    </div>
  );
} 