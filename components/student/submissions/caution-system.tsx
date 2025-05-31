"use client";

import { FC, useEffect, useState, useRef, useCallback } from 'react';
import { AlertCircle, Wifi, MonitorX, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface SecuritySystemProps {
  isActive: boolean;
  assignmentId: string;
  isExam?: boolean;
}

/**
 * Simplified security system for assignments and exams
 * Enforces fullscreen mode and prevents key combinations
 */
export const CautionSystem: FC<SecuritySystemProps> = ({
  isActive = true,
  assignmentId,
  isExam = false
}) => {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [showSetupScreen, setShowSetupScreen] = useState<boolean>(isExam);
  const [showPermissionPrompt, setShowPermissionPrompt] = useState<boolean>(false);
  
  const { toast } = useToast();
  const fullscreenRequestInProgress = useRef<boolean>(false);
  const permissionDeniedRef = useRef<boolean>(false);
  const permissionCheckedRef = useRef<boolean>(false);
  const isEdgeBrowser = useRef<boolean>(false);
  const isFirstRender = useRef(true);
  const lastAlertTime = useRef<number>(0);
  const isTinyMCEInteraction = useRef<boolean>(false);

  // Check if browser is Microsoft Edge
  useEffect(() => {
    isEdgeBrowser.current = 
      typeof window !== 'undefined' && 
      (navigator.userAgent.indexOf("Edge") > -1 || 
       navigator.userAgent.indexOf("Edg") > -1);
  }, []);

  // Show alert message with debouncing
  const showAlertMessage = useCallback((message: string) => {
    const now = Date.now();
    // Only show a new alert if more than 3 seconds have passed since the last one
    if (now - lastAlertTime.current > 3000) {
      setAlertMessage(message);
      setShowAlert(true);
      lastAlertTime.current = now;
      
      // Auto-hide alert after 5 seconds
      setTimeout(() => {
        setShowAlert(false);
      }, 5000);
      
      // Also show toast for better visibility
      toast({
        variant: "destructive",
        title: "Cảnh báo",
        description: message,
      });
    }
  }, [toast]);

  // Function to check permissions using the Permissions API
  const checkPermissions = useCallback(async (): Promise<boolean> => {
    try {
      if (navigator.permissions && navigator.permissions.query) {
        const windowManagementResult = await navigator.permissions.query({
          name: 'window-management' as any
        }).catch(() => ({ state: 'denied' as PermissionState }));
        
        const fullscreenResult = await navigator.permissions.query({
          name: 'fullscreen' as any
        }).catch(() => ({ state: 'denied' as PermissionState }));

        if (windowManagementResult.state === 'granted' || fullscreenResult.state === 'granted') {
          permissionCheckedRef.current = true;
          return true;
        } else if (windowManagementResult.state === 'prompt' || fullscreenResult.state === 'prompt') {
          setShowPermissionPrompt(true);
          return false;
        } else {
          permissionDeniedRef.current = true;
          return false;
        }
      }
      
      return false;
    } catch (error) {
      console.error("Error checking permissions:", error);
      return false;
    }
  }, []);

  // Check if document is in fullscreen mode
  const checkFullscreen = useCallback((): boolean => {
    // Special case for Microsoft Edge
    if (isEdgeBrowser.current) {
      const isFullscreenByDimensions = 
        window.innerWidth === window.screen.width && 
        window.innerHeight === window.screen.height;
      
      if (isFullscreenByDimensions) {
        return true;
      }
    }
    
    // Standard fullscreen check for all browsers
    const isCurrentlyFullscreen = !!(
      document.fullscreenElement ||
      // @ts-ignore
      document.mozFullScreenElement ||
      // @ts-ignore
      document.webkitFullscreenElement ||
      // @ts-ignore
      document.msFullscreenElement
    );
    
    return isCurrentlyFullscreen;
  }, []);

  // Function to enter fullscreen mode
  const enterFullscreen = useCallback(async (): Promise<boolean> => {
    try {
      // Don't attempt fullscreen if permission was previously denied or a request is already in progress
      if (permissionDeniedRef.current || fullscreenRequestInProgress.current) return false;
      
      fullscreenRequestInProgress.current = true;
      
      if (!permissionCheckedRef.current) {
        const hasPermission = await checkPermissions();
        if (!hasPermission && showPermissionPrompt) {
          fullscreenRequestInProgress.current = false;
          return false;
        }
      }
      
      const element = document.documentElement;
      
      // Edge-specific fullscreen handling
      if (isEdgeBrowser.current) {
        try {
          if (element.requestFullscreen) {
            await element.requestFullscreen({ navigationUI: 'hide' as any });
            setTimeout(() => {
              fullscreenRequestInProgress.current = false;
              const isCurrentlyFullscreen = checkFullscreen();
              setIsFullscreen(isCurrentlyFullscreen);
            }, 1000);
            return true;
          }
        } catch (edgeError) {
          console.error("Edge fullscreen error:", edgeError);
          fullscreenRequestInProgress.current = false;
        }
      }
      
      // Standard fullscreen methods
      if (element.requestFullscreen) {
        try {
          await element.requestFullscreen();
          setTimeout(() => {
            fullscreenRequestInProgress.current = false;
            const isCurrentlyFullscreen = checkFullscreen();
            setIsFullscreen(isCurrentlyFullscreen);
          }, 1000);
          return true;
        } catch (error) {
          console.error("Fullscreen request failed:", error);
          permissionDeniedRef.current = true;
          fullscreenRequestInProgress.current = false;
          return false;
        }
      // @ts-ignore - Handle vendor prefixes
      } else if (element.mozRequestFullScreen) {
        try {
          // @ts-ignore
          await element.mozRequestFullScreen();
          setTimeout(() => {
            fullscreenRequestInProgress.current = false;
            const isCurrentlyFullscreen = checkFullscreen();
            setIsFullscreen(isCurrentlyFullscreen);
          }, 1000);
          return true;
        } catch (error) {
          console.error("Fullscreen request failed:", error);
          permissionDeniedRef.current = true;
          fullscreenRequestInProgress.current = false;
          return false;
        }
      // @ts-ignore
      } else if (element.webkitRequestFullscreen) {
        try {
          // @ts-ignore
          await element.webkitRequestFullscreen();
          setTimeout(() => {
            fullscreenRequestInProgress.current = false;
            const isCurrentlyFullscreen = checkFullscreen();
            setIsFullscreen(isCurrentlyFullscreen);
          }, 1000);
          return true;
        } catch (error) {
          console.error("Fullscreen request failed:", error);
          permissionDeniedRef.current = true;
          fullscreenRequestInProgress.current = false;
          return false;
        }
      // @ts-ignore
      } else if (element.msRequestFullscreen) {
        try {
          // @ts-ignore
          await element.msRequestFullscreen();
          setTimeout(() => {
            fullscreenRequestInProgress.current = false;
            const isCurrentlyFullscreen = checkFullscreen();
            setIsFullscreen(isCurrentlyFullscreen);
          }, 1000);
          return true;
        } catch (error) {
          console.error("Fullscreen request failed:", error);
          permissionDeniedRef.current = true;
          fullscreenRequestInProgress.current = false;
          return false;
        }
      }
      
      permissionDeniedRef.current = true;
      fullscreenRequestInProgress.current = false;
      return false;
    } catch (error) {
      console.error("Error requesting fullscreen:", error);
      permissionDeniedRef.current = true;
      fullscreenRequestInProgress.current = false;
      return false;
    }
  }, [checkPermissions, showPermissionPrompt, checkFullscreen]);

  // Update fullscreen state periodically
  useEffect(() => {
    if (!isActive || !isExam) return;
    
    const updateFullscreenState = () => {
      const isCurrentlyFullscreen = checkFullscreen();
      setIsFullscreen(isCurrentlyFullscreen);
    };
    
    updateFullscreenState();
    
    const intervalId = setInterval(updateFullscreenState, 1000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [isActive, isExam, checkFullscreen]);

  // Check if element is a text input or TinyMCE element
  const isEditableElement = useCallback((element: Element | null): boolean => {
    if (!element) return false;
    
    try {
      // Check if element is an input, textarea, or has contentEditable attribute
      if (
        element.tagName === 'INPUT' ||
        element.tagName === 'TEXTAREA' ||
        element.getAttribute('contenteditable') === 'true'
      ) {
        return true;
      }
      
      // Check if element is inside a TinyMCE iframe
      if (element.tagName === 'HTML' || element.tagName === 'BODY') {
        try {
          // @ts-ignore - Check if parent window has TinyMCE
          const isInTinyMCEFrame = element.ownerDocument?.defaultView?.frameElement?.id?.includes('tiny_');
          if (isInTinyMCEFrame) return true;
        } catch (e) {
          // Ignore cross-origin errors
        }
      }
      
      // Check class name for TinyMCE patterns
      if (element.className && typeof element.className === 'string') {
        const className = element.className;
        if (className.includes('tox') || 
            className.includes('mce') || 
            className.includes('tinymce')) {
          return true;
        }
      }
      
      // Check ID for TinyMCE patterns
      if (element.id) {
        const id = element.id;
        if (id.includes('tiny_') || 
            id.includes('mce_') || 
            id.includes('tinymce')) {
          return true;
        }
      }
      
      // Check for TinyMCE data attributes
      for (const attr of element.getAttributeNames()) {
        if (attr.startsWith('data-mce-')) {
          return true;
        }
      }
      
      // Recursively check parent elements (but limit depth to avoid performance issues)
      let depth = 0;
      let parent = element.parentElement;
      while (parent && depth < 10) {
        if (parent.id?.includes('tiny_') || 
            parent.id?.includes('mce_') || 
            parent.className?.includes('tox') ||
            parent.className?.includes('mce') ||
            parent.hasAttribute('data-mce-id')) {
          return true;
        }
        parent = parent.parentElement;
        depth++;
      }
      
      return false;
    } catch (error) {
      console.error("Error in isEditableElement:", error);
      return false;
    }
  }, []);

  // Detect TinyMCE interaction
  useEffect(() => {
    if (!isActive || !isExam) return;
    
    const handleFocusIn = (e: FocusEvent) => {
      try {
        if (isEditableElement(e.target as Element)) {
          isTinyMCEInteraction.current = true;
        }
      } catch (error) {
        console.error("Error in focus-in handler:", error);
      }
    };
    
    const handleFocusOut = (e: FocusEvent) => {
      try {
        if (isEditableElement(e.target as Element)) {
          const isStillInEditable = isEditableElement(e.relatedTarget as Element);
          
          if (!isStillInEditable) {
            setTimeout(() => {
              isTinyMCEInteraction.current = false;
            }, 500);
          }
        }
      } catch (error) {
        console.error("Error in focus-out handler:", error);
      }
    };
    
    document.addEventListener('focusin', handleFocusIn, true);
    document.addEventListener('focusout', handleFocusOut, true);
    
    return () => {
      document.removeEventListener('focusin', handleFocusIn, true);
      document.removeEventListener('focusout', handleFocusOut, true);
    };
  }, [isActive, isExam, isEditableElement]);

  // Handle fullscreen change
  useEffect(() => {
    if (!isActive || !isExam) return;
    
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = checkFullscreen();
      setIsFullscreen(isCurrentlyFullscreen);
      
      // If we're not in fullscreen mode and not showing setup screen
      if (!isCurrentlyFullscreen && !showSetupScreen && !permissionDeniedRef.current && !fullscreenRequestInProgress.current) {
        showAlertMessage("Bạn đã thoát khỏi chế độ toàn màn hình. Vui lòng quay lại chế độ toàn màn hình để tiếp tục.");
        // Try to enter fullscreen again
        setTimeout(() => {
          enterFullscreen();
        }, 1000);
      }
    };
    
    // Track fullscreen change events
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, [isActive, isExam, showSetupScreen, checkFullscreen, enterFullscreen, showAlertMessage]);

  // Block forbidden key combinations and prevent text selection
  useEffect(() => {
    if (!isActive || !isExam) return;
    
    // Block key combinations
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if we're in an editable element
      if (isTinyMCEInteraction.current) return;
      
      // Common screenshot key combinations
      const isScreenshotCombo = (
        e.key === 'PrintScreen' ||
        (e.metaKey && e.shiftKey && (e.key === '3' || e.key === '4')) ||
        (e.shiftKey && e.key === 'S' && e.getModifierState('Meta'))
      );
      
      // Enhanced list of forbidden key combinations
      const isForbiddenCombo = (
        isScreenshotCombo ||
        (e.altKey && e.key === 'Tab') || // Alt+Tab
        (e.ctrlKey && e.key === 'Tab') || // Ctrl+Tab
        (e.ctrlKey && e.altKey && e.key === 'Delete') || // Ctrl+Alt+Del
        e.getModifierState('Meta') || // Windows key
        (e.altKey && e.key === 'F4') || // Alt+F4
        (e.ctrlKey && e.shiftKey && e.key === 'Escape') || // Ctrl+Shift+Esc
        (e.ctrlKey && e.key === 'w') || // Ctrl+W
        (e.key === 'Escape') || // Esc
        (e.key === 'F11') || // F11
        (e.key === 'F12') // F12
      );
      
      // Block copy/paste outside editable elements
      const isCopyPaste = (
        (e.ctrlKey && e.key === 'c') || // Ctrl+C
        (e.ctrlKey && e.key === 'v') || // Ctrl+V
        (e.ctrlKey && e.key === 'x')    // Ctrl+X
      );
      
      if (isForbiddenCombo) {
        e.preventDefault();
        showAlertMessage("Phím tắt này không được phép trong quá trình làm bài.");
        return false;
      }
      
      if (isCopyPaste && !isEditableElement(document.activeElement as Element)) {
        e.preventDefault();
        showAlertMessage("Không được phép sao chép hoặc dán nội dung ngoài vùng soạn thảo.");
        return false;
      }
    };
    
    // Prevent context menu
    const handleContextMenu = (e: MouseEvent) => {
      // Allow context menu in editable elements
      if (isEditableElement(e.target as Element)) return;
      
      e.preventDefault();
      showAlertMessage("Không được phép sử dụng menu chuột phải trong quá trình làm bài.");
      return false;
    };
    
    // Prevent selection on non-editable elements
    const handleSelectStart = (e: Event) => {
      // Allow selection in editable elements
      if (isEditableElement(e.target as Element)) return;
      
      e.preventDefault();
      return false;
    };
    
    // Prevent copy-paste operations outside of editable elements
    const handleCopy = (e: ClipboardEvent) => {
      if (!isEditableElement(e.target as Element)) {
        e.preventDefault();
        showAlertMessage("Không được phép sao chép nội dung bài thi.");
        return false;
      }
    };
    
    const handlePaste = (e: ClipboardEvent) => {
      if (!isEditableElement(e.target as Element)) {
        e.preventDefault();
        showAlertMessage("Không được phép dán nội dung trong bài thi.");
        return false;
      }
    };
    
    // Track visibility change (tab switching)
    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible') {
        showAlertMessage("Bạn đã chuyển sang cửa sổ khác. Vui lòng không làm điều này trong khi làm bài thi.");
      }
    };
    
    // Track online status
    const handleOnlineStatusChange = () => {
      setIsOnline(navigator.onLine);
    };
    
    // Add all event listeners
    document.addEventListener('keydown', handleKeyDown, { capture: true });
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('selectstart', handleSelectStart);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', handleOnlineStatusChange);
    
    // Clean up event listeners
    return () => {
      document.removeEventListener('keydown', handleKeyDown, { capture: true });
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('selectstart', handleSelectStart);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', handleOnlineStatusChange);
    };
  }, [isActive, isExam, isEditableElement, showAlertMessage]);
  
  // Handle permission request
  const handleRequestPermission = useCallback(async () => {
    try {
      const result = await enterFullscreen();
      if (result) {
        setShowPermissionPrompt(false);
        permissionCheckedRef.current = true;
        toast({
          title: "Đã kích hoạt chế độ toàn màn hình",
          description: "Bạn có thể tiếp tục làm bài thi",
        });
      } else {
        permissionDeniedRef.current = true;
        toast({
          variant: "destructive",
          title: "Không thể kích hoạt chế độ toàn màn hình",
          description: "Vui lòng kiểm tra cài đặt quyền truy cập của trình duyệt",
        });
      }
    } catch (error) {
      console.error("Error requesting permission:", error);
      permissionDeniedRef.current = true;
    }
  }, [enterFullscreen, toast]);
  
  // Handle system check
  const handleSystemCheck = useCallback(() => {
    const isFullscreenActive = checkFullscreen();
    
    if (!isFullscreenActive) {
      toast({
        variant: "destructive",
        title: "Kiểm tra hệ thống thất bại",
        description: "Vui lòng kích hoạt chế độ toàn màn hình để tiếp tục.",
      });
    } else {
      setShowSetupScreen(false);
      toast({
        title: "Kiểm tra hệ thống thành công",
        description: "Bạn có thể bắt đầu làm bài thi.",
      });
    }
  }, [checkFullscreen, toast]);

  // Handle fullscreen button click
  const handleFullscreenRequest = useCallback(async () => {
    const result = await enterFullscreen();
    if (result) {
      permissionDeniedRef.current = false;
      setTimeout(checkFullscreen, 500);
    } else {
      setShowPermissionPrompt(true);
    }
  }, [enterFullscreen, checkFullscreen]);

  // Initial setup
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      
      if (isActive && isExam) {
        setTimeout(() => {
          const isFullscreenActive = checkFullscreen();
          setIsFullscreen(isFullscreenActive);
          
          if (!isFullscreenActive) {
            enterFullscreen();
          }
        }, 1000);
      }
    }
  }, [isActive, isExam, checkFullscreen, enterFullscreen]);
  
  // Function to exit fullscreen mode
  const exitFullscreen = useCallback((): boolean => {
    try {
      // Don't attempt to exit if document is not active
      if (!document || !document.fullscreenElement && 
          // @ts-ignore
          !document.mozFullScreenElement && 
          // @ts-ignore
          !document.webkitFullscreenElement && 
          // @ts-ignore
          !document.msFullscreenElement) {
        return false;
      }
      
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(error => {
          console.error("Exit fullscreen failed:", error);
          return false;
        });
      // @ts-ignore
      } else if (document.mozCancelFullScreen) {
        // @ts-ignore
        document.mozCancelFullScreen().catch(error => {
          console.error("Exit fullscreen failed:", error);
          return false;
        });
      // @ts-ignore
      } else if (document.webkitExitFullscreen) {
        // @ts-ignore
        document.webkitExitFullscreen().catch(error => {
          console.error("Exit fullscreen failed:", error);
          return false;
        });
      // @ts-ignore
      } else if (document.msExitFullscreen) {
        // @ts-ignore
        document.msExitFullscreen().catch(error => {
          console.error("Exit fullscreen failed:", error);
          return false;
        });
      }
      return true;
    } catch (error) {
      console.error("Error exiting fullscreen:", error);
      return false;
    }
  }, []);
  
  // Don't render anything visually in normal mode
  if (!isExam) return null;
  
  // Show permission request prompt
  if (showPermissionPrompt) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/90 backdrop-blur-sm z-50">
        <div className="bg-card p-6 rounded-lg shadow-lg max-w-md w-full space-y-6">
          <div className="text-center space-y-2">
            <AlertTriangle className="h-12 w-12 mx-auto text-amber-500" />
            <AlertTitle className="text-2xl font-bold">Yêu cầu quyền truy cập</AlertTitle>
            <AlertDescription>
              Để đảm bảo tính bảo mật của bài thi, trình duyệt cần được cấp quyền toàn màn hình. 
              Vui lòng cho phép quyền truy cập khi trình duyệt hiển thị thông báo.
            </AlertDescription>
          </div>
          
          <div className="space-y-4">
            <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-md text-amber-800 dark:text-amber-200 text-sm">
              <p className="font-medium">Lưu ý:</p>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>Nếu trình duyệt không hiển thị thông báo, hãy kiểm tra cài đặt quyền truy cập của trình duyệt</li>
                <li>Bạn có thể cần phải làm mới trang sau khi cấp quyền</li>
                <li>Nếu bạn sử dụng Microsoft Edge, vui lòng kiểm tra cài đặt quyền "Toàn màn hình" trong phần bảo mật</li>
              </ul>
            </div>
            
            <div className="flex justify-between">
              <Button 
                onClick={() => window.history.back()} 
                className="border border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Hủy bỏ
              </Button>
              <Button 
                onClick={handleRequestPermission} 
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Cấp quyền và tiếp tục
              </Button>
            </div>
            
            <div className="flex justify-center mt-2">
              <Button 
                onClick={() => setShowPermissionPrompt(false)}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 bg-transparent"
              >
                Tiếp tục mà không cấp quyền
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Show the setup screen for initial checks
  if (showSetupScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/90 backdrop-blur-sm z-50">
        <div className="bg-card p-6 rounded-lg shadow-lg max-w-md w-full space-y-6">
          <div className="text-center space-y-2">
            <AlertTriangle className="h-12 w-12 mx-auto text-amber-500" />
            <AlertTitle className="text-2xl font-bold">Kiểm tra hệ thống</AlertTitle>
            <AlertDescription>
              Trước khi bắt đầu bài thi, chúng tôi cần kiểm tra hệ thống của bạn 
              để đảm bảo môi trường thi an toàn.
            </AlertDescription>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-medium">Yêu cầu kỹ thuật:</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <div className={`p-1.5 rounded-full ${
                  isFullscreen ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                }`}>
                  <MonitorX className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Chế độ toàn màn hình</p>
                  <p className="text-sm text-muted-foreground">
                    {isFullscreen ? 'Chế độ toàn màn hình đang hoạt động' : 'Cần kích hoạt chế độ toàn màn hình'}
                  </p>
                </div>
                <div>
                  {isFullscreen ? (
                    <div className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs">Đạt</div>
                  ) : (
                    <div className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs">Lỗi</div>
                  )}
                </div>
              </li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>Bằng việc tiếp tục, bạn đồng ý với:</p>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>Không sử dụng phần mềm hỗ trợ gian lận</li>
                <li>Không sử dụng thiết bị khác trong quá trình làm bài</li>
                <li>Không thoát khỏi màn hình đang làm bài</li>
                <li>Không sử dụng trình duyệt ẩn danh hoặc có plugin hỗ trợ</li>
              </ul>
            </div>
            
            <div className="flex justify-between">
              <Button 
                onClick={() => window.history.back()} 
                className="border border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Hủy bỏ
              </Button>
              <Button 
                onClick={handleSystemCheck} 
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Kiểm tra và tiếp tục
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <>
      {showAlert && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Cảnh báo</AlertTitle>
          <AlertDescription>
            {alertMessage}
          </AlertDescription>
        </Alert>
      )}
      
      {!isOnline && (
        <Alert variant="destructive" className="mb-4">
          <Wifi className="h-4 w-4" />
          <AlertTitle>Mất kết nối internet</AlertTitle>
          <AlertDescription>
            Vui lòng kiểm tra kết nối internet của bạn để tiếp tục làm bài.
          </AlertDescription>
        </Alert>
      )}
      
      {!isFullscreen && isExam && (
        <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
          <div className="bg-card p-6 rounded-lg shadow-lg max-w-md w-full space-y-4">
            <AlertTitle className="text-xl font-bold text-center">Chú ý</AlertTitle>
            <AlertDescription className="text-center">
              Bài thi yêu cầu chế độ toàn màn hình. 
              Vui lòng nhấn nút bên dưới để tiếp tục làm bài thi.
              {permissionDeniedRef.current && (
                <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-950 rounded text-amber-600 dark:text-amber-400 text-sm">
                  Trình duyệt của bạn đã từ chối quyền sử dụng chế độ toàn màn hình. 
                  Vui lòng kiểm tra quyền truy cập và cài đặt của trình duyệt.
                </div>
              )}
            </AlertDescription>
            <div className="flex justify-center">
              <Button 
                onClick={handleFullscreenRequest}
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded"
              >
                Vào chế độ toàn màn hình
              </Button>
            </div>
            {permissionDeniedRef.current && (
              <div className="flex justify-center mt-2">
                <Button 
                  onClick={() => setShowSetupScreen(false)}
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 bg-transparent"
                >
                  Tiếp tục mà không dùng toàn màn hình
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

// Export a utility function to exit fullscreen that can be called from outside
export const exitFullscreenMode = (): void => {
  try {
    if (document.fullscreenElement ||
        // @ts-ignore
        document.mozFullScreenElement ||
        // @ts-ignore
        document.webkitFullscreenElement ||
        // @ts-ignore
        document.msFullscreenElement) {
      
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
    }
  } catch (error) {
    console.error("Error exiting fullscreen mode:", error);
  }
}; 