"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CheckIcon, LaptopIcon, MoonIcon, SaveIcon, SunIcon, RotateCcwIcon, SparklesIcon, KeyboardIcon, VolumeXIcon, Volume2Icon } from "lucide-react";
import { useTheme } from "next-themes";
import { PageHeader } from "@/components/ui/page-header";
import { Separator } from "@/components/ui/separator";
import { AuthGuard } from "@/components/auth/auth-guard";

export default function SettingsPage() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  
  // Easter egg state
  const [systemClickCount, setSystemClickCount] = useState(0);
  const [isStarryNight, setIsStarryNight] = useState(false);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // User preferences state
  const [fontSize, setFontSize] = useState<string>("normal");
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [animationsEnabled, setAnimationsEnabled] = useState<boolean>(true);
  const [autoSave, setAutoSave] = useState<boolean>(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [colorblindMode, setColorblindMode] = useState<boolean>(false);
  const [soundEffects, setSoundEffects] = useState<boolean>(true);
  
  // Enhanced UX states
  const [previewTheme, setPreviewTheme] = useState<string | null>(null);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  
  // Play sound effect function
  const playSound = useCallback((type: 'click' | 'success' | 'easter' | 'switch') => {
    if (!soundEffects || !animationsEnabled) return;
    
    // Create audio context for web audio (more reliable than HTML5 audio)
    try {
      // Type-safe way to access webkitAudioContext
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Different sounds for different actions
      switch (type) {
        case 'click':
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.1);
          break;
        case 'success':
          oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
          oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
          oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
          gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.3);
          break;
        case 'easter':
          // Magic sparkle sound
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(1047, audioContext.currentTime + 0.5);
          gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.5);
          break;
        case 'switch':
          oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(400, audioContext.currentTime + 0.05);
          gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.1);
          break;
      }
    } catch (error) {
      // Fallback: silent operation if audio context fails
      console.log('Audio not available');
    }
  }, [soundEffects, animationsEnabled]);

  // Load preferences from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Load font size
      const savedFontSize = localStorage.getItem("otls_font_size");
      if (savedFontSize) {
        setFontSize(savedFontSize);
        // Apply font size to document
        document.documentElement.classList.remove("text-sm", "text-base", "text-lg");
        document.documentElement.classList.add(`text-${savedFontSize}`);
      }
      
      // Load other preferences
      const savedHighContrast = localStorage.getItem("otls_high_contrast") === "true";
      const savedAnimations = localStorage.getItem("otls_animations_enabled") !== "false"; // Default to true
      const savedAutoSave = localStorage.getItem("otls_auto_save") !== "false"; // Default to true
      const savedNotifications = localStorage.getItem("otls_notifications_enabled") !== "false"; // Default to true
      const savedColorblindMode = localStorage.getItem("otls_colorblind_mode") === "true";
      const savedSoundEffects = localStorage.getItem("otls_sound_effects") !== "false"; // Default to true
      const savedStarryNight = localStorage.getItem("otls_starry_night") === "true";
      
      setHighContrast(savedHighContrast);
      setAnimationsEnabled(savedAnimations);
      setAutoSave(savedAutoSave);
      setNotificationsEnabled(savedNotifications);
      setColorblindMode(savedColorblindMode);
      setSoundEffects(savedSoundEffects);
      setIsStarryNight(savedStarryNight);
      
      // Apply high contrast if enabled
      if (savedHighContrast) {
        document.documentElement.classList.add("high-contrast");
      } else {
        document.documentElement.classList.remove("high-contrast");
      }
      
      // Apply colorblind mode if enabled
      if (savedColorblindMode) {
        document.documentElement.classList.add("colorblind-mode");
      } else {
        document.documentElement.classList.remove("colorblind-mode");
      }
      
      // Starry night is now handled globally by StarryNightProvider
    }
  }, []);

  // Easter egg: Handle system button clicks
  const handleSystemClick = () => {
    playSound('click');
    
    // Clear existing timeout
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }
    
    const newClickCount = systemClickCount + 1;
    setSystemClickCount(newClickCount);
    
    // Reset counter after 3 seconds of no clicks
    clickTimeoutRef.current = setTimeout(() => {
      setSystemClickCount(0);
    }, 3000);
    
    // Easter egg activation
    if (newClickCount === 8) {
      activateStarryNight();
      setSystemClickCount(0);
    }
    
    // Regular system theme change
    handleThemeChange("system");
  };

  // Activate starry night easter egg
  const activateStarryNight = () => {
    setIsStarryNight(true);
    localStorage.setItem("otls_starry_night", "true");
    
    // Emit custom event to notify global provider
    window.dispatchEvent(new CustomEvent('starryNightToggle'));
    
    playSound('easter');
    
    // Add easter egg activation animation to the button
    const systemButton = document.querySelector('[data-theme="system"]');
    if (systemButton) {
      systemButton.classList.add('easter-egg-activated');
      setTimeout(() => {
        systemButton.classList.remove('easter-egg-activated');
      }, 1000);
    }
    
    toast({
      title: "🌟 Bầu trời sao đã thống trị nơi này 🌟",
      description: "Tận hưởng màn đêm lung linh của mình nhé. Hãy nhớ rằng màn đêm chỉ có thể được tắt bằng nút tắt chế độ Starry Night. ✨",
      duration: 5000,
    });
  };

  // Deactivate starry night
  const deactivateStarryNight = () => {
    setIsStarryNight(false);
    localStorage.setItem("otls_starry_night", "false");
    
    // Emit custom event to notify global provider
    window.dispatchEvent(new CustomEvent('starryNightToggle'));
    
    toast({
      title: "Chế độ Starry Night đã tắt",
      description: "Trở lại chế độ bình thường",
    });
  };
  
  // Handle font size change
  const handleFontSizeChange = (value: string) => {
    setFontSize(value);
    localStorage.setItem("otls_font_size", value);
    
    // Apply font size to document
    document.documentElement.classList.remove("text-sm", "text-base", "text-lg");
    document.documentElement.classList.add(`text-${value}`);

    playSound('switch');
    window.location.reload();
  };
  
  // Handle theme change
  const handleThemeChange = useCallback((value: string) => {
    setTheme(value);
    playSound('switch');
  }, [playSound, setTheme]);

  // Theme preview handlers
  const handleThemePreview = (themeValue: string) => {
    setPreviewTheme(themeValue);
  };

  const clearThemePreview = () => {
    setPreviewTheme(null);
  };
  
  // Handle high contrast change
  const handleHighContrastChange = (checked: boolean) => {
    setHighContrast(checked);
    localStorage.setItem("otls_high_contrast", checked.toString());
    
    // Apply high contrast if enabled
    if (checked) {
      document.documentElement.classList.add("high-contrast");
    } else {
      document.documentElement.classList.remove("high-contrast");
    }
    
    playSound('switch');
    
    toast({
      title: checked ? "Đã bật chế độ tương phản cao" : "Đã tắt chế độ tương phản cao",
    });
  };
  
  // Handle animations toggle
  const handleAnimationsChange = (checked: boolean) => {
    setAnimationsEnabled(checked);
    localStorage.setItem("otls_animations_enabled", checked.toString());
    
    // Apply animation settings
    if (!checked) {
      document.documentElement.classList.add("reduce-motion");
    } else {
      document.documentElement.classList.remove("reduce-motion");
    }
    
    playSound('switch');
    
    toast({
      title: checked ? "Đã bật hiệu ứng chuyển động" : "Đã tắt hiệu ứng chuyển động",
    });
  };
  
  // Handle auto save change
  const handleAutoSaveChange = (checked: boolean) => {
    setAutoSave(checked);
    localStorage.setItem("otls_auto_save", checked.toString());
    
    playSound('switch');
    
    toast({
      title: checked ? "Đã bật tự động lưu" : "Đã tắt tự động lưu",
      description: "Thiết lập này áp dụng cho các bài tập và bài kiểm tra.",
    });
  };
  
  // Handle notifications change
  const handleNotificationsChange = (checked: boolean) => {
    setNotificationsEnabled(checked);
    localStorage.setItem("otls_notifications_enabled", checked.toString());
    
    playSound('switch');
    
    toast({
      title: checked ? "Đã bật thông báo" : "Đã tắt thông báo",
    });
  };
  
  // Handle colorblind mode change
  const handleColorblindModeChange = (checked: boolean) => {
    setColorblindMode(checked);
    localStorage.setItem("otls_colorblind_mode", checked.toString());
    
    // Apply colorblind mode if enabled
    if (checked) {
      document.documentElement.classList.add("colorblind-mode");
    } else {
      document.documentElement.classList.remove("colorblind-mode");
    }
    
    playSound('switch');
    
    toast({
      title: checked ? "Đã bật chế độ màu dành cho người khiếm thị màu" : "Đã tắt chế độ màu dành cho người khiếm thị màu",
    });
  };

  // Handle sound effects change
  const handleSoundEffectsChange = (checked: boolean) => {
    setSoundEffects(checked);
    localStorage.setItem("otls_sound_effects", checked.toString());
    
    if (checked) {
      playSound('switch');
    }
    
    toast({
      title: checked ? "Đã bật hiệu ứng âm thanh" : "Đã tắt hiệu ứng âm thanh",
    });
  };
  
  // Save all settings
  const saveAllSettings = useCallback(() => {
    // Settings are saved individually as they change
    playSound('success');
    toast({
      title: "Đã lưu tất cả cài đặt",
      description: "Các cài đặt của bạn đã được lưu thành công.",
    });
  }, [playSound, toast]);
  
  // Reset individual section
  const resetSection = (section: 'appearance' | 'accessibility' | 'preferences') => {
    switch (section) {
      case 'appearance':
        setTheme("system");
        setFontSize("normal");
        localStorage.setItem("otls_font_size", "normal");
        document.documentElement.classList.remove("text-sm", "text-base", "text-lg");
        document.documentElement.classList.add("text-normal");
        break;
      case 'accessibility':
        setHighContrast(false);
        localStorage.setItem("otls_high_contrast", "false");
        document.documentElement.classList.remove("high-contrast");
        
        setAnimationsEnabled(true);
        localStorage.setItem("otls_animations_enabled", "true");
        document.documentElement.classList.remove("reduce-motion");
        
        setColorblindMode(false);
        localStorage.setItem("otls_colorblind_mode", "false");
        document.documentElement.classList.remove("colorblind-mode");
        break;
      case 'preferences':
        setAutoSave(true);
        localStorage.setItem("otls_auto_save", "true");
        
        setNotificationsEnabled(true);
        localStorage.setItem("otls_notifications_enabled", "true");
        
        setSoundEffects(true);
        localStorage.setItem("otls_sound_effects", "true");
        break;
    }
    
    playSound('success');
    toast({
      title: `Đã khôi phục ${section === 'appearance' ? 'giao diện' : section === 'accessibility' ? 'trợ năng' : 'tùy chọn'} về mặc định`,
    });
  };
  
  // Reset all settings to default
  const resetAllSettings = useCallback(() => {
    // Reset theme
    setTheme("system");
    
    // Reset font size
    setFontSize("normal");
    localStorage.setItem("otls_font_size", "normal");
    document.documentElement.classList.remove("text-sm", "text-base", "text-lg");
    document.documentElement.classList.add("text-normal");
    
    // Reset high contrast
    setHighContrast(false);
    localStorage.setItem("otls_high_contrast", "false");
    document.documentElement.classList.remove("high-contrast");
    
    // Reset animations
    setAnimationsEnabled(true);
    localStorage.setItem("otls_animations_enabled", "true");
    document.documentElement.classList.remove("reduce-motion");
    
    // Reset auto save
    setAutoSave(true);
    localStorage.setItem("otls_auto_save", "true");
    
    // Reset notifications
    setNotificationsEnabled(true);
    localStorage.setItem("otls_notifications_enabled", "true");
    
    // Reset colorblind mode
    setColorblindMode(false);
    localStorage.setItem("otls_colorblind_mode", "false");
    document.documentElement.classList.remove("colorblind-mode");
    
    // Reset sound effects
    setSoundEffects(true);
    localStorage.setItem("otls_sound_effects", "true");
    
    // Reset starry night
    setIsStarryNight(false);
    localStorage.setItem("otls_starry_night", "false");
    
    // Emit custom event to notify global provider
    window.dispatchEvent(new CustomEvent('starryNightToggle'));
    
    // Reset easter egg counter
    setSystemClickCount(0);
    
    playSound('success');
    
    toast({
      title: "Đã khôi phục cài đặt mặc định",
      description: "Tất cả cài đặt đã được đặt lại về giá trị mặc định.",
    });
  }, [setTheme, setFontSize, setHighContrast, setAnimationsEnabled, setAutoSave, setNotificationsEnabled, setColorblindMode, setSoundEffects, setIsStarryNight, setSystemClickCount, playSound, toast]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case '1':
            event.preventDefault();
            handleThemeChange("light");
            break;
          case '2':
            event.preventDefault();
            handleThemeChange("dark");
            break;
          case '3':
            event.preventDefault();
            handleThemeChange("system");
            break;
          case 'k':
            event.preventDefault();
            setShowKeyboardShortcuts(!showKeyboardShortcuts);
            break;
          case 's':
            event.preventDefault();
            saveAllSettings();
            break;
          case 'r':
            event.preventDefault();
            resetAllSettings();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showKeyboardShortcuts, handleThemeChange, resetAllSettings, saveAllSettings]);

  return (
    <AuthGuard>
      <div className="container py-6 space-y-6">
        <PageHeader
          heading="Cài đặt hệ thống"
          description="Tùy chỉnh giao diện và các thiết lập cá nhân"
        />

        {/* Keyboard shortcuts help */}
        {showKeyboardShortcuts && (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyboardIcon className="h-5 w-5" />
                Phím tắt
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div><kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+1</kbd> - Chế độ sáng</div>
                <div><kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+2</kbd> - Chế độ tối</div>
                <div><kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+3</kbd> - Theo hệ thống</div>
                <div><kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+K</kbd> - Hiện/ẩn phím tắt</div>
                <div><kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+S</kbd> - Lưu tất cả</div>
                <div><kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+R</kbd> - Reset tất cả</div>
              </div>
              <p className="text-muted-foreground mt-2">
                💡 <strong>Easter egg:</strong> Click "Hệ thống" 8 lần để mở khóa chế độ đặc biệt!
              </p>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="appearance" className="w-full">
          <TabsList className="w-full md:w-auto grid grid-cols-2 md:grid-cols-3 gap-1">
            <TabsTrigger value="appearance">Giao diện</TabsTrigger>
            <TabsTrigger value="accessibility">Trợ năng</TabsTrigger>
            <TabsTrigger value="preferences">Tùy chọn</TabsTrigger>
          </TabsList>
          
          {/* Appearance tab */}
          <TabsContent value="appearance" className="space-y-4 mt-4">
            <Card className="settings-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Giao diện hiển thị</CardTitle>
                    <CardDescription>
                      Tùy chỉnh giao diện hiển thị của ứng dụng
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => resetSection('appearance')}
                    className="shrink-0"
                  >
                    <RotateCcwIcon className="h-4 w-4 mr-1" />
                    Reset
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Theme selection */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="theme">Chế độ màu</Label>
                    {isStarryNight && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={deactivateStarryNight}
                        className="text-xs"
                      >
                        <SparklesIcon className="h-3 w-3 mr-1" />
                        Tắt Starry Night
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Button 
                      variant={theme === "light" ? "default" : "outline"} 
                      className="justify-start theme-button transition-all duration-300 hover:scale-105"
                      onClick={() => handleThemeChange("light")}
                      onMouseEnter={() => handleThemePreview("light")}
                      onMouseLeave={clearThemePreview}
                      data-theme="light"
                    >
                      <SunIcon className="mr-2 h-4 w-4" />
                      Sáng
                      {theme === "light" && <CheckIcon className="ml-auto h-4 w-4" />}
                    </Button>
                    <Button 
                      variant={theme === "dark" ? "default" : "outline"} 
                      className="justify-start theme-button transition-all duration-300 hover:scale-105"
                      onClick={() => handleThemeChange("dark")}
                      onMouseEnter={() => handleThemePreview("dark")}
                      onMouseLeave={clearThemePreview}
                      data-theme="dark"
                    >
                      <MoonIcon className="mr-2 h-4 w-4" />
                      Tối
                      {theme === "dark" && <CheckIcon className="ml-auto h-4 w-4" />}
                    </Button>
                    <Button 
                      variant={theme === "system" ? "default" : "outline"} 
                      className="justify-start theme-button transition-all duration-300 hover:scale-105 relative"
                      onClick={handleSystemClick}
                      onMouseEnter={() => handleThemePreview("system")}
                      onMouseLeave={clearThemePreview}
                      data-theme="system"
                    >
                      <LaptopIcon className="mr-2 h-4 w-4" />
                      Hệ thống
                      {theme === "system" && <CheckIcon className="ml-auto h-4 w-4" />}
                      {systemClickCount > 0 && systemClickCount < 8 && (
                        <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                          {systemClickCount}
                        </span>
                      )}
                    </Button>
                  </div>
                  {/* {previewTheme && (
                    <p className="text-xs text-muted-foreground">
                      Preview: {previewTheme === "light" ? "Chế độ sáng" : previewTheme === "dark" ? "Chế độ tối" : "Theo hệ thống"}
                    </p>
                  )} */}
                </div>
                
                {/* Font size */}
                <div className="space-y-2">
                  <Label htmlFor="font-size">Cỡ chữ</Label>
                  <RadioGroup id="font-size" value={fontSize} onValueChange={handleFontSizeChange} className="grid grid-cols-3 gap-4">
                    <div>
                      <RadioGroupItem value="small" id="small" className="peer sr-only" />
                      <Label
                        htmlFor="small"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary transition-all duration-200 hover:scale-105 cursor-pointer"
                      >
                        <span className="text-sm mb-1">Nhỏ</span>
                        <span className="text-xs">A</span>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="normal" id="normal" className="peer sr-only" />
                      <Label
                        htmlFor="normal"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary transition-all duration-200 hover:scale-105 cursor-pointer"
                      >
                        <span className="text-sm mb-1">Vừa</span>
                        <span className="text-sm">A</span>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="large" id="large" className="peer sr-only" />
                      <Label
                        htmlFor="large"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary transition-all duration-200 hover:scale-105 cursor-pointer"
                      >
                        <span className="text-sm mb-1">Lớn</span>
                        <span className="text-base">A</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Accessibility tab */}
          <TabsContent value="accessibility" className="space-y-4 mt-4">
            <Card className="settings-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Tùy chọn trợ năng</CardTitle>
                    <CardDescription>
                      Điều chỉnh các tùy chọn giúp cải thiện khả năng tiếp cận
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => resetSection('accessibility')}
                    className="shrink-0"
                  >
                    <RotateCcwIcon className="h-4 w-4 mr-1" />
                    Reset
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="high-contrast">Chế độ tương phản cao</Label>
                    <p className="text-sm text-muted-foreground">
                      Tăng tương phản để dễ đọc hơn
                    </p>
                  </div>
                  <Switch
                    id="high-contrast"
                    checked={highContrast}
                    onCheckedChange={handleHighContrastChange}
                    className="transition-all duration-200"
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="animations">Hiệu ứng chuyển động</Label>
                    <p className="text-sm text-muted-foreground">
                      Bật/tắt hiệu ứng và hoạt ảnh
                    </p>
                  </div>
                  <Switch
                    id="animations"
                    checked={animationsEnabled}
                    onCheckedChange={handleAnimationsChange}
                    className="transition-all duration-200"
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="colorblind-mode">Chế độ khiếm thị màu</Label>
                    <p className="text-sm text-muted-foreground">
                      Điều chỉnh màu sắc để dễ phân biệt hơn
                    </p>
                  </div>
                  <Switch
                    id="colorblind-mode"
                    checked={colorblindMode}
                    onCheckedChange={handleColorblindModeChange}
                    className="transition-all duration-200"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Preferences tab */}
          <TabsContent value="preferences" className="space-y-4 mt-4">
            <Card className="settings-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Thiết lập cá nhân</CardTitle>
                    <CardDescription>
                      Tùy chỉnh trải nghiệm sử dụng
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => resetSection('preferences')}
                    className="shrink-0"
                  >
                    <RotateCcwIcon className="h-4 w-4 mr-1" />
                    Reset
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-save">Tự động lưu bài làm</Label>
                    <p className="text-sm text-muted-foreground">
                      Tự động lưu bài làm trong khi làm bài tập
                    </p>
                  </div>
                  <Switch
                    id="auto-save"
                    checked={autoSave}
                    onCheckedChange={handleAutoSaveChange}
                    className="transition-all duration-200"
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="sound-effects">Hiệu ứng âm thanh</Label>
                    <p className="text-sm text-muted-foreground">
                      Phát âm thanh khi tương tác với giao diện
                    </p>
                  </div>
                  <Switch
                    id="sound-effects"
                    checked={soundEffects}
                    onCheckedChange={handleSoundEffectsChange}
                    className="transition-all duration-200"
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notifications">Thông báo (chưa hoạt động)</Label>
                    <p className="text-sm text-muted-foreground">
                      Nhận thông báo về các hoạt động trong hệ thống, sẽ được cập nhật trong tương lai
                    </p>
                  </div>
                  <Switch
                    id="notifications"
                    checked={false}
                    disabled={true}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="keyboard-shortcuts">Hiện phím tắt</Label>
                    <p className="text-sm text-muted-foreground">
                      Hiển thị bảng phím tắt để sử dụng nhanh
                    </p>
                  </div>
                  <Switch
                    id="keyboard-shortcuts"
                    checked={showKeyboardShortcuts}
                    onCheckedChange={setShowKeyboardShortcuts}
                    className="transition-all duration-200"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={resetAllSettings} className="transition-all duration-200 hover:scale-105">
                  <RotateCcwIcon className="mr-2 h-4 w-4" />
                  Khôi phục mặc định
                </Button>
                <Button onClick={saveAllSettings} className="transition-all duration-200 hover:scale-105">
                  <SaveIcon className="mr-2 h-4 w-4" />
                  Lưu tất cả cài đặt
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AuthGuard>
  );
} 