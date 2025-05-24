"use client";

import { FC, useEffect, useState, useRef } from 'react';
import { AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface CautionSystemProps {
  isActive: boolean;
  maxCautions: number;
  onMaxCautionsReached: () => void;
  assignmentId: string;
  isExam?: boolean;
}

/**
 * Placeholder for the anti-tab-switching system
 * TODO: Implement a new system to prevent tab switching during assignments in the future
 */
export const CautionSystem: FC<CautionSystemProps> = ({
  isActive = true,
  maxCautions = 3,
  onMaxCautionsReached,
  assignmentId,
  isExam = false
}) => {
  const [cautions, setCautions] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>('');
  const { toast } = useToast();
  const fullscreenTimeout = useRef<NodeJS.Timeout | null>(null);
  const isExamMode = isExam;

  // Function to enter fullscreen mode
  const enterFullscreen = () => {
    try {
      const element = document.documentElement;
      if (element.requestFullscreen) {
        element.requestFullscreen();
      // @ts-ignore
      } else if (element.mozRequestFullScreen) {
        // @ts-ignore
        element.mozRequestFullScreen();
      // @ts-ignore
      } else if (element.webkitRequestFullscreen) {
        // @ts-ignore
        element.webkitRequestFullscreen();
      // @ts-ignore
      } else if (element.msRequestFullscreen) {
        // @ts-ignore
        element.msRequestFullscreen();
      }
    } catch (error) {
      console.error("Error requesting fullscreen:", error);
    }
  };

  // Function to exit fullscreen mode
  const exitFullscreen = () => {
    try {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      // @ts-ignore
      } else if (document.mozCancelFullScreen) {
        // @ts-ignore
        document.mozCancelFullScreen();
      // @ts-ignore
      } else if (document.webkitExitFullscreen) {
        // @ts-ignore
        document.webkitExitFullscreen();
      // @ts-ignore
      } else if (document.msExitFullscreen) {
        // @ts-ignore
        document.msExitFullscreen();
      }
    } catch (error) {
      console.error("Error exiting fullscreen:", error);
    }
  };

  // Initialize fullscreen mode when the component mounts
  useEffect(() => {
    if (!isActive || !isExamMode) return;
    
    // Function to issue a caution - moved inside useEffect
    const issueCaution = (message: string) => {
      if (!isActive || !isExamMode) return;
      
      setCautions(prev => {
        const newCount = prev + 1;
        
        if (newCount >= maxCautions) {
          // Maximum cautions reached, trigger callback
          onMaxCautionsReached();
          return newCount;
        }
        
        // Show alert for this caution
        setAlertMessage(message);
        setShowAlert(true);
        
        // Hide alert after 5 seconds
        setTimeout(() => {
          setShowAlert(false);
        }, 5000);
        
        // Show toast notification
        toast({
          variant: "destructive",
          title: `Cảnh báo (${newCount}/${maxCautions})`,
          description: message,
        });
        
        return newCount;
      });
    };
    
    // Automatically enter fullscreen mode
    enterFullscreen();
    
    // Check if we are in fullscreen mode
    const checkFullscreen = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        // @ts-ignore
        document.mozFullScreenElement ||
        // @ts-ignore
        document.webkitFullscreenElement ||
        // @ts-ignore
        document.msFullscreenElement
      );
      
      setIsFullscreen(isCurrentlyFullscreen);
      
      // If we're not in fullscreen mode, request it again with a caution
      if (!isCurrentlyFullscreen) {
        if (fullscreenTimeout.current) {
          clearTimeout(fullscreenTimeout.current);
        }
        
        fullscreenTimeout.current = setTimeout(() => {
          issueCaution("Bạn đã thoát khỏi chế độ toàn màn hình. Vui lòng không làm điều này trong khi làm bài thi.");
          enterFullscreen();
        }, 1000);
      }
    };
    
    // Track fullscreen change events
    document.addEventListener('fullscreenchange', checkFullscreen);
    document.addEventListener('mozfullscreenchange', checkFullscreen);
    document.addEventListener('webkitfullscreenchange', checkFullscreen);
    document.addEventListener('msfullscreenchange', checkFullscreen);
    
    // Track visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible' && isActive) {
        issueCaution("Bạn đã chuyển sang cửa sổ khác. Vui lòng không làm điều này trong khi làm bài thi.");
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Track blur events
    const handleBlur = () => {
      if (isActive) {
        issueCaution("Bạn đã chuyển sang cửa sổ khác. Vui lòng không làm điều này trong khi làm bài thi.");
      }
    };
    
    window.addEventListener('blur', handleBlur);
    
    // Clean up event listeners
    return () => {
      document.removeEventListener('fullscreenchange', checkFullscreen);
      document.removeEventListener('mozfullscreenchange', checkFullscreen);
      document.removeEventListener('webkitfullscreenchange', checkFullscreen);
      document.removeEventListener('msfullscreenchange', checkFullscreen);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      
      // Exit fullscreen when component unmounts
      if (isFullscreen) {
        exitFullscreen();
      }
      
      if (fullscreenTimeout.current) {
        clearTimeout(fullscreenTimeout.current);
      }
    };
  }, [isActive, isExamMode, isFullscreen, maxCautions, onMaxCautionsReached, toast]);
  
  // Don't render anything visually in normal mode
  if (!isExamMode) return null;
  
  return (
    <>
      {showAlert && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Cảnh báo ({cautions}/{maxCautions})</AlertTitle>
          <AlertDescription>
            {alertMessage}
          </AlertDescription>
        </Alert>
      )}
      
      {!isFullscreen && isExamMode && (
        <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
          <div className="bg-card p-6 rounded-lg shadow-lg max-w-md w-full space-y-4">
            <AlertTitle className="text-xl font-bold text-center">Chú ý</AlertTitle>
            <AlertDescription className="text-center">
              Bài thi yêu cầu chế độ toàn màn hình. 
              Vui lòng nhấn nút bên dưới để tiếp tục làm bài thi.
            </AlertDescription>
            <div className="flex justify-center">
              <button 
                onClick={enterFullscreen}
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded"
              >
                Vào chế độ toàn màn hình
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}; 