"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CheckIcon, LaptopIcon, MoonIcon, SaveIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { PageHeader } from "@/components/ui/page-header";
import { Separator } from "@/components/ui/separator";
import { AuthGuard } from "@/components/auth/auth-guard";

export default function SettingsPage() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  
  // User preferences state
  const [fontSize, setFontSize] = useState<string>("normal");
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [animationsEnabled, setAnimationsEnabled] = useState<boolean>(true);
  const [autoSave, setAutoSave] = useState<boolean>(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [colorblindMode, setColorblindMode] = useState<boolean>(false);
  
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
      
      setHighContrast(savedHighContrast);
      setAnimationsEnabled(savedAnimations);
      setAutoSave(savedAutoSave);
      setNotificationsEnabled(savedNotifications);
      setColorblindMode(savedColorblindMode);
      
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
    }
  }, []);
  
  // Handle font size change
  const handleFontSizeChange = (value: string) => {
    setFontSize(value);
    localStorage.setItem("otls_font_size", value);
    
    // Apply font size to document
    document.documentElement.classList.remove("text-sm", "text-base", "text-lg");
    document.documentElement.classList.add(`text-${value}`);

    window.location.reload();
  };
  
  // Handle theme change
  const handleThemeChange = (value: string) => {
    setTheme(value);
    
    toast({
      title: "Giao diện đã thay đổi",
      description: "Thay đổi giao diện sẽ được lưu vào trình duyệt của bạn.",
    });
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
    
    toast({
      title: checked ? "Đã bật hiệu ứng chuyển động" : "Đã tắt hiệu ứng chuyển động",
    });
  };
  
  // Handle auto save change
  const handleAutoSaveChange = (checked: boolean) => {
    setAutoSave(checked);
    localStorage.setItem("otls_auto_save", checked.toString());
    
    toast({
      title: checked ? "Đã bật tự động lưu" : "Đã tắt tự động lưu",
      description: "Thiết lập này áp dụng cho các bài tập và bài kiểm tra.",
    });
  };
  
  // Handle notifications change
  const handleNotificationsChange = (checked: boolean) => {
    setNotificationsEnabled(checked);
    localStorage.setItem("otls_notifications_enabled", checked.toString());
    
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
    
    toast({
      title: checked ? "Đã bật chế độ màu dành cho người khiếm thị màu" : "Đã tắt chế độ màu dành cho người khiếm thị màu",
    });
  };
  
  // Save all settings
  const saveAllSettings = () => {
    // Settings are saved individually as they change
    toast({
      title: "Đã lưu tất cả cài đặt",
      description: "Các cài đặt của bạn đã được lưu thành công.",
    });
  };
  
  // Reset all settings to default
  const resetAllSettings = () => {
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
    
    toast({
      title: "Đã khôi phục cài đặt mặc định",
      description: "Tất cả cài đặt đã được đặt lại về giá trị mặc định.",
    });
  };
  
  return (
    <AuthGuard>
      <div className="container py-6 space-y-6">
        <PageHeader
          heading="Cài đặt hệ thống"
          description="Tùy chỉnh giao diện và các thiết lập cá nhân"
        />

        <Tabs defaultValue="appearance" className="w-full">
          <TabsList className="w-full md:w-auto grid grid-cols-2 md:grid-cols-3 gap-1">
            <TabsTrigger value="appearance">Giao diện</TabsTrigger>
            <TabsTrigger value="accessibility">Trợ năng</TabsTrigger>
            <TabsTrigger value="preferences">Tùy chọn</TabsTrigger>
          </TabsList>
          
          {/* Appearance tab */}
          <TabsContent value="appearance" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Giao diện hiển thị</CardTitle>
                <CardDescription>
                  Tùy chỉnh giao diện hiển thị của ứng dụng
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Theme selection */}
                <div className="space-y-2">
                  <Label htmlFor="theme">Chế độ màu</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button 
                      variant={theme === "light" ? "default" : "outline"} 
                      className="justify-start"
                      onClick={() => handleThemeChange("light")}
                    >
                      <SunIcon className="mr-2 h-4 w-4" />
                      Sáng
                      {theme === "light" && <CheckIcon className="ml-auto h-4 w-4" />}
                    </Button>
                    <Button 
                      variant={theme === "dark" ? "default" : "outline"} 
                      className="justify-start"
                      onClick={() => handleThemeChange("dark")}
                    >
                      <MoonIcon className="mr-2 h-4 w-4" />
                      Tối
                      {theme === "dark" && <CheckIcon className="ml-auto h-4 w-4" />}
                    </Button>
                    <Button 
                      variant={theme === "system" ? "default" : "outline"} 
                      className="justify-start"
                      onClick={() => handleThemeChange("system")}
                    >
                      <LaptopIcon className="mr-2 h-4 w-4" />
                      Hệ thống
                      {theme === "system" && <CheckIcon className="ml-auto h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                {/* Font size */}
                <div className="space-y-2">
                  <Label htmlFor="font-size">Cỡ chữ</Label>
                  <RadioGroup id="font-size" value={fontSize} onValueChange={handleFontSizeChange} className="grid grid-cols-3 gap-4">
                    <div>
                      <RadioGroupItem value="small" id="small" className="peer sr-only" />
                      <Label
                        htmlFor="small"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <span className="text-sm mb-1">Nhỏ</span>
                        <span className="text-xs">A</span>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="normal" id="normal" className="peer sr-only" />
                      <Label
                        htmlFor="normal"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <span className="text-sm mb-1">Vừa</span>
                        <span className="text-sm">A</span>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="large" id="large" className="peer sr-only" />
                      <Label
                        htmlFor="large"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
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
            <Card>
              <CardHeader>
                <CardTitle>Tùy chọn trợ năng</CardTitle>
                <CardDescription>
                  Điều chỉnh các tùy chọn giúp cải thiện khả năng tiếp cận
                </CardDescription>
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
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Preferences tab */}
          <TabsContent value="preferences" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Thiết lập cá nhân</CardTitle>
                <CardDescription>
                  Tùy chỉnh trải nghiệm sử dụng
                </CardDescription>
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
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={resetAllSettings}>
                  Khôi phục mặc định
                </Button>
                <Button onClick={saveAllSettings}>
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