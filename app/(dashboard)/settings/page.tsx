"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CheckIcon, LaptopIcon, MoonIcon, SaveIcon, SunIcon, RotateCcwIcon, SparklesIcon, KeyboardIcon, VolumeXIcon, Volume2Icon, PaintbrushIcon, TreesIcon, CodeIcon, MountainIcon, ZapIcon, SunsetIcon, LockIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { PageHeader } from "@/components/ui/page-header";
import { Separator } from "@/components/ui/separator";
import { AuthGuard } from "@/components/auth/auth-guard";

// Theme definitions with metadata
const THEMES = [
  {
    value: "light",
    name: "Sáng",
    description: "Giao diện sáng cổ điển",
    icon: SunIcon,
    className: "bg-white border-gray-200 text-gray-900",
    preview: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
    type: "light" // Theme type for adaptive text color
  },
  {
    value: "dark", 
    name: "Tối",
    description: "Giao diện tối dễ nhìn",
    icon: MoonIcon,
    className: "bg-gray-900 border-gray-700 text-gray-100",
    preview: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
    type: "dark"
  },
  {
    value: "dusk",
    name: "Hoàng hôn",
    description: "Ánh hoàng hôn ấm áp",
    icon: SunsetIcon,
    className: "bg-purple-900 border-purple-700 text-purple-100",
    preview: "linear-gradient(135deg, #ff5e4d 0%, #ff9a00 25%, #8a2be2 60%, #191970 100%)",
    type: "dark"
  },
  {
    value: "cyberpunk-neon",
    name: "Cyberpunk Neon",
    description: "Tương lai rực rỡ",
    icon: ZapIcon,
    className: "bg-blue-950 border-cyan-500 text-cyan-100",
    preview: "linear-gradient(135deg, #030712 0%, #1e1b4b 50%, #581c87 100%)",
    type: "dark"
  },
  {
    value: "minimal-glacier",
    name: "Băng tuyết",
    description: "Tối giản như băng tuyết",
    icon: MountainIcon,
    className: "bg-blue-50 border-blue-200 text-blue-900",
    preview: "linear-gradient(135deg, #ffffff 0%, #f0f9ff 25%, #dbeafe 50%, #bae6fd 75%, #a3e7f0 100%)",
    type: "light"
  },
  {
    value: "forest-zen",
    name: "Rừng thiền",
    description: "Yên bình như rừng xanh",
    icon: TreesIcon,
    className: "bg-green-800 border-green-600 text-green-100",
    preview: "linear-gradient(135deg, #365314 0%, #166534 100%)",
    type: "dark"
  },
  {
    value: "mono-code",
    name: "Mono Code",
    description: "Terminal cho dev",
    icon: CodeIcon,
    className: "bg-gray-900 border-green-400 text-green-400 font-mono",
    preview: "linear-gradient(135deg, #1e1e1e 0%, #0d1117 100%)",
    type: "dark"
  },
  {
    value: "vietnamese-heritage",
    name: "Di sản Việt Nam",
    description: "Văn hóa truyền thống",
    icon: SparklesIcon,
    className: "bg-amber-50 border-amber-200 text-amber-900",
    preview: "linear-gradient(135deg, #fefbe9 0%, #f8d89f 100%)",
    type: "light"
  },
  {
    value: "deep-ocean",
    name: "Đại dương sâu",
    description: "Khám phá biển xanh",
    icon: MountainIcon,
    className: "bg-blue-950 border-blue-700 text-blue-100",
    preview: "linear-gradient(135deg, #0c2941 0%, #082032 50%, #061621 100%)",
    type: "dark"
  }
];

// Khai báo interface cho bubble để sử dụng trong Deep Ocean theme
interface Bubble {
  id: string;
  size: number;
  duration: number;
  x: number;
}

export default function SettingsPage() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  // Konami code state for Starry Night unlock
  const [konamiSequence, setKonamiSequence] = useState<string[]>([]);
  const [isStarryNightUnlocked, setIsStarryNightUnlocked] = useState(false);
  const [showKonamiHint, setShowKonamiHint] = useState(false);
  const konamiCode = useMemo(() => ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'], []);

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

  // State cho Deep Ocean theme
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const bubblesRef = useRef<Bubble[]>([]);
  const bubbleIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Play sound effect function
  const playSound = useCallback((type: 'click' | 'success' | 'easter' | 'switch' | 'konami' | 'unlock') => {
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
        case 'konami':
          // Konami code beep
          oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
          gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.1);
          break;
        case 'unlock':
          // Unlock success sound - more elaborate
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(261.63, audioContext.currentTime); // C4
          oscillator.frequency.setValueAtTime(329.63, audioContext.currentTime + 0.1); // E4
          oscillator.frequency.setValueAtTime(392.00, audioContext.currentTime + 0.2); // G4
          oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime + 0.3); // C5
          gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6);
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.6);
          break;
      }
    } catch (error) {
      // Fallback: silent operation if audio context fails
      console.log('Audio not available');
    }
  }, [soundEffects, animationsEnabled]);

  // Function to create ocean bubbles
  const createBubbles = useCallback(() => {
    if (!animationsEnabled) return;
    
    // Clear any existing bubbles first
    const existingBubbles = document.querySelectorAll('.bubble');
    existingBubbles.forEach(bubble => bubble.remove());
    
    // Clear existing interval
    if (bubbleIntervalRef.current) {
      clearInterval(bubbleIntervalRef.current);
      bubbleIntervalRef.current = null;
    }
    
    // Initialize bubbles array
    const newBubbles: Bubble[] = [];
    for (let i = 0; i < 15; i++) {
      newBubbles.push({
        id: `bubble-${i}`,
        size: Math.random() * 20 + 5, // 5-25px
        duration: Math.random() * 10 + 10, // 10-20s
        x: Math.random() * 100 // 0-100% of viewport width
      });
    }
    
    bubblesRef.current = newBubbles;
    setBubbles(newBubbles);
    
    // Create and append bubble elements
    newBubbles.forEach(bubble => {
      const bubbleEl = document.createElement('div');
      bubbleEl.className = 'bubble';
      bubbleEl.id = bubble.id;
      bubbleEl.style.width = `${bubble.size}px`;
      bubbleEl.style.height = `${bubble.size}px`;
      bubbleEl.style.left = `${bubble.x}%`;
      bubbleEl.style.bottom = `-${bubble.size}px`;
      bubbleEl.style.animationDuration = `${bubble.duration}s`;
      document.body.appendChild(bubbleEl);
    });
    
    // Set interval to continuously create new bubbles
    bubbleIntervalRef.current = setInterval(() => {
      if (document.documentElement.classList.contains('deep-ocean')) {
        const newBubble = {
          id: `bubble-${Date.now()}`,
          size: Math.random() * 20 + 5,
          duration: Math.random() * 10 + 10,
          x: Math.random() * 100
        };
        
        const bubbleEl = document.createElement('div');
        bubbleEl.className = 'bubble';
        bubbleEl.id = newBubble.id;
        bubbleEl.style.width = `${newBubble.size}px`;
        bubbleEl.style.height = `${newBubble.size}px`;
        bubbleEl.style.left = `${newBubble.x}%`;
        bubbleEl.style.bottom = `-${newBubble.size}px`;
        bubbleEl.style.animationDuration = `${newBubble.duration}s`;
        document.body.appendChild(bubbleEl);
        
        // Remove bubble after animation completes
        setTimeout(() => {
          if (bubbleEl.parentNode) {
            bubbleEl.parentNode.removeChild(bubbleEl);
          }
        }, newBubble.duration * 1000);
      }
    }, 2000);
    
  }, [animationsEnabled]);

  // Clean up bubbles when theme changes
  const cleanupBubbles = useCallback(() => {
    if (bubbleIntervalRef.current) {
      clearInterval(bubbleIntervalRef.current);
      bubbleIntervalRef.current = null;
    }
    
    const bubbles = document.querySelectorAll('.bubble');
    bubbles.forEach(bubble => {
      if (bubble.parentNode) {
        bubble.parentNode.removeChild(bubble);
      }
    });
  }, []);

  // Setup Vietnamese Heritage theme effects
  const setupVietnameseHeritage = useCallback(() => {
    // Add page container for theme decorations if it doesn't exist
    if (!document.querySelector('.page-container')) {
      const pageContainer = document.createElement('div');
      pageContainer.className = 'page-container';
      
      // Wrap all content in the main container
      const appContent = document.querySelector('main');
      if (appContent && appContent.parentNode) {
        appContent.parentNode.insertBefore(pageContainer, appContent);
        pageContainer.appendChild(appContent);
      }
    }
  }, []);

  // Cleanup Vietnamese Heritage theme effects
  const cleanupVietnameseHeritage = useCallback(() => {
    // Remove page container if it exists
    const pageContainer = document.querySelector('.page-container');
    if (pageContainer && pageContainer.parentNode) {
      const appContent = pageContainer.querySelector('main');
      if (appContent && pageContainer.parentNode) {
        pageContainer.parentNode.insertBefore(appContent, pageContainer);
        pageContainer.parentNode.removeChild(pageContainer);
      }
    }
  }, []);

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
      const savedStarryNightUnlocked = localStorage.getItem("otls_starry_night_unlocked") === "true";

      setHighContrast(savedHighContrast);
      setAnimationsEnabled(savedAnimations);
      setAutoSave(savedAutoSave);
      setNotificationsEnabled(savedNotifications);
      setColorblindMode(savedColorblindMode);
      setSoundEffects(savedSoundEffects);
      setIsStarryNight(savedStarryNight);
      setIsStarryNightUnlocked(savedStarryNightUnlocked);

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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupBubbles();
    };
  }, [cleanupBubbles]);

  // Function to remove all theme classes from document
  const removeAllThemeClasses = useCallback(() => {
    const themeClasses = [
      'light', 'dark', 'dusk', 'cyberpunk-neon', 'minimal-glacier', 
      'forest-zen', 'mono-code', 'starry-night', 'vietnamese-heritage', 'deep-ocean'
    ];
    
    themeClasses.forEach(themeClass => {
      document.documentElement.classList.remove(themeClass);
    });
  }, []);

  // Function to apply theme class to document with smooth transition
  const applyThemeClass = useCallback((themeValue: string) => {
    // Create transition overlay to prevent flickering
    const overlay = document.createElement('div');
    overlay.className = 'theme-transition-overlay active';
    document.body.appendChild(overlay);
    
    // Remove all existing theme classes first
    removeAllThemeClasses();
    
    // Handle special case for deep ocean theme
    if (themeValue === 'deep-ocean') {
      cleanupBubbles();
      cleanupVietnameseHeritage();
      setTimeout(() => createBubbles(), 100);
    } else if (themeValue === 'vietnamese-heritage') {
      cleanupBubbles();
      setTimeout(() => setupVietnameseHeritage(), 100);
    } else {
      cleanupBubbles();
      cleanupVietnameseHeritage();
    }
    
    // Small delay to ensure clean state before applying new theme
    setTimeout(() => {
      // Add the new theme class
      if (themeValue !== 'system') {
        document.documentElement.classList.add(themeValue);
      }
      
      // Remove overlay after transition
      setTimeout(() => {
        overlay.classList.remove('active');
        setTimeout(() => {
          if (overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
          }
        }, 200);
      }, 100);
    }, 50);
  }, [removeAllThemeClasses, cleanupBubbles, createBubbles, setupVietnameseHeritage, cleanupVietnameseHeritage]);

  // Unlock Starry Night theme
  const unlockStarryNight = useCallback(() => {
    setIsStarryNightUnlocked(true);
    localStorage.setItem("otls_starry_night_unlocked", "true");
    
    playSound('unlock');

    toast({
      title: "🌟 Chúc mừng! Starry Night đã được mở khóa! 🌟",
      description: "Bạn đã nhập đúng Konami Code! Giờ đây bạn có thể sử dụng theme bí mật Starry Night. ✨",
      duration: 6000,
    });
  }, [playSound, toast]);

  // Konami code listener
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isStarryNightUnlocked) return; // Already unlocked

      setKonamiSequence(prev => {
        const newSequence = [...prev, event.code];
        
        // Check if current sequence matches the beginning of konami code
        const isValidSequence = konamiCode.slice(0, newSequence.length).every((key, index) => key === newSequence[index]);
        
        if (!isValidSequence) {
          // Reset if sequence is wrong
          return [];
        }

        // Play feedback sound for correct key
        playSound('konami');

        // Check if complete sequence is entered
        if (newSequence.length === konamiCode.length) {
          // Use setTimeout to avoid updating during render
          setTimeout(() => {
            unlockStarryNight();
          }, 0);
          return [];
        }

        // Show hint after 5 correct keys
        if (newSequence.length === 5) {
          setShowKonamiHint(true);
          setTimeout(() => setShowKonamiHint(false), 3000);
        }

        return newSequence;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isStarryNightUnlocked, playSound, konamiCode, unlockStarryNight]);

  // Activate starry night easter egg
  const activateStarryNight = useCallback(() => {
    setTheme("starry-night");
    applyThemeClass("starry-night");
    setIsStarryNight(true);
    localStorage.setItem("otls_starry_night", "true");

    // Emit custom event to notify global provider
    window.dispatchEvent(new CustomEvent('starryNightToggle'));

    playSound('easter');

    toast({
      title: "🌟 Bầu trời sao đã thống trị nơi này 🌟",
      description: "Tận hưởng màn đêm lung linh của mình nhé. ✨",
      duration: 5000,
    });
  }, [setTheme, applyThemeClass, playSound, toast]);

  // Deactivate starry night
  const deactivateStarryNight = useCallback(() => {
    setIsStarryNight(false);
    localStorage.setItem("otls_starry_night", "false");

    // Emit custom event to notify global provider
    window.dispatchEvent(new CustomEvent('starryNightToggle'));

    // Switch to dark theme when deactivating starry night
    setTheme("dark");
    applyThemeClass("dark");

    toast({
      title: "Chế độ Starry Night đã tắt",
      description: "Trở lại chế độ bình thường",
    });
  }, [setTheme, applyThemeClass, toast]);

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

  // Handle theme change with optimized synchronization
  const handleThemeChange = useCallback((value: string) => {
    // Handle special starry night theme
    if (value === "starry-night") {
      activateStarryNight();
      return;
    }

    // Deactivate starry night if switching to another theme
    if (isStarryNight) {
      setIsStarryNight(false);
      localStorage.setItem("otls_starry_night", "false");
      // Emit custom event to notify global provider
      window.dispatchEvent(new CustomEvent('starryNightToggle'));
    }

    // Apply the new theme with transition
    setTheme(value);
    applyThemeClass(value);
    playSound('switch');

    // Special notifications for new themes
    if (value === 'vietnamese-heritage') {
      toast({
        title: "🇻🇳 Đã kích hoạt chủ đề Di sản Việt Nam",
        description: "Cảm nhận vẻ đẹp truyền thống trong không gian hiện đại",
        duration: 3000,
      });
    }
  }, [playSound, setTheme, isStarryNight, activateStarryNight, applyThemeClass, toast]);

  // Effect to handle theme class application when theme changes
  useEffect(() => {
    if (theme && theme !== "starry-night") {
      applyThemeClass(theme);
    }
  }, [theme, applyThemeClass]);

  // Effect to handle initial theme setup
  useEffect(() => {
    if (typeof window !== "undefined" && theme) {
      // Apply the current theme class on mount
      if (isStarryNight) {
        applyThemeClass("starry-night");
      } else {
        applyThemeClass(theme);
        
        // Initialize theme-specific effects
        if (theme === 'deep-ocean') {
          setTimeout(() => createBubbles(), 500);
        } else if (theme === 'vietnamese-heritage') {
          setTimeout(() => setupVietnameseHeritage(), 500);
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount - we want this to run once

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
        setTheme("light");
        applyThemeClass("light");
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
    setTheme("light");
    applyThemeClass("light");

    // Cleanup any theme-specific effects
    cleanupBubbles();
    cleanupVietnameseHeritage();

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
  }, [
    setTheme, 
    applyThemeClass, 
    cleanupBubbles, 
    cleanupVietnameseHeritage, 
    setFontSize, 
    setHighContrast, 
    setAnimationsEnabled, 
    setAutoSave, 
    setNotificationsEnabled, 
    setColorblindMode, 
    setSoundEffects, 
    setIsStarryNight, 
    setSystemClickCount, 
    playSound, 
    toast
  ]);

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
            handleThemeChange("dusk");
            break;
          case '4':
            event.preventDefault();
            handleThemeChange("cyberpunk-neon");
            break;
          case '5':
            event.preventDefault();
            handleThemeChange("minimal-glacier");
            break;
          case '6':
            event.preventDefault();
            handleThemeChange("forest-zen");
            break;
          case '7':
            event.preventDefault();
            handleThemeChange("mono-code");
            break;
          case '8':
            event.preventDefault();
            handleThemeChange("vietnamese-heritage");
            break;
          case '9':
            event.preventDefault();
            handleThemeChange("deep-ocean");
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
          description="Tùy chỉnh giao diện và các thiết lập cá nhân hóa"
        />

        {/* Konami code hint for unlocking Starry Night */}
        {!isStarryNightUnlocked && (
          <Card className="border-dashed border-muted-foreground/30 bg-muted/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-center">
                <div className="flex-1">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <LockIcon className="h-5 w-5" />
                    <span className="text-sm font-medium">Theme bí mật đang chờ được mở khóa...</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Thử nhập một chuỗi phím huyền thoại để khám phá điều bất ngờ! 🎮
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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
                <div><kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+1</kbd> - Theme Sáng</div>
                <div><kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+2</kbd> - Theme Tối</div>
                <div><kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+3</kbd> - Hoàng hôn</div>
                <div><kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+4</kbd> - Cyberpunk Neon</div>
                <div><kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+5</kbd> - Băng tuyết</div>
                <div><kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+6</kbd> - Rừng thiền</div>
                <div><kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+7</kbd> - Mono Code</div>
                <div><kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+8</kbd> - Di sản Việt Nam</div>
                <div><kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+9</kbd> - Đại dương sâu</div>
                <div><kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+K</kbd> - Hiện/ẩn phím tắt</div>
                <div><kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+S</kbd> - Lưu tất cả</div>
                <div><kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+R</kbd> - Reset tất cả</div>
              </div>
              <div className="mt-4 p-3 bg-secondary/50 rounded-lg">
                <p className="text-muted-foreground text-xs">
                  🎮 <strong>Bí mật:</strong> Thử nhập Konami Code (↑↑↓↓←→←→BA) để mở khóa theme đặc biệt!
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="appearance" className="w-full">
          <TabsList className="w-full h-auto p-1 bg-muted rounded-lg">
            {/* Mobile: Stacked layout */}
            <div className="flex flex-col sm:hidden w-full gap-1">
              <TabsTrigger
                value="appearance"
                className="w-full justify-start text-sm px-4 py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Giao diện
              </TabsTrigger>
              <TabsTrigger
                value="accessibility"
                className="w-full justify-start text-sm px-4 py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Trợ năng
              </TabsTrigger>
              <TabsTrigger
                value="preferences"
                className="w-full justify-start text-sm px-4 py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Tùy chọn
              </TabsTrigger>
            </div>

            {/* Desktop: Original grid layout */}
            <div className="hidden sm:grid sm:grid-cols-3 sm:gap-1 sm:w-full">
              <TabsTrigger
                value="appearance"
                className="text-sm px-3 h-10 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Giao diện
              </TabsTrigger>
              <TabsTrigger
                value="accessibility"
                className="text-sm px-3 h-10 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Trợ năng
              </TabsTrigger>
              <TabsTrigger
                value="preferences"
                className="text-sm px-3 h-10 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Tùy chọn
              </TabsTrigger>
            </div>
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

                  {/* Main theme grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                    {THEMES.map((themeItem) => {
                      const IconComponent = themeItem.icon;
                      const isActive = theme === themeItem.value;
                      const isHovering = previewTheme === themeItem.value;
                      
                      // Determine text color based on theme type and hover state
                      const getTextColor = () => {
                        if (isHovering) {
                          return themeItem.type === 'light' ? 'text-gray-900' : 'text-white';
                        }
                        return isActive 
                          ? (themeItem.type === 'light' ? 'text-gray-900' : 'text-white')
                          : '';
                      };
                      
                      return (
                        <Button
                          key={themeItem.value}
                          variant={isActive ? "default" : "outline"}
                          className={`h-16 p-3 flex flex-col items-center justify-center theme-button transition-all duration-300 hover:scale-105 relative overflow-hidden ${getTextColor()}`}
                          onClick={() => handleThemeChange(themeItem.value)}
                          onMouseEnter={() => handleThemePreview(themeItem.value)}
                          onMouseLeave={clearThemePreview}
                          data-theme={themeItem.value}
                          style={{
                            background: (isHovering || isActive) ? themeItem.preview : undefined,
                            color: isHovering ? (themeItem.type === 'light' ? '#1f2937' : '#ffffff') : undefined
                          }}
                        >
                          <IconComponent className="h-5 w-5 mb-1" />
                          <span className="text-xs font-medium text-center">{themeItem.name}</span>
                          {isActive && (
                            <CheckIcon className="absolute top-1 right-1 h-4 w-4" />
                          )}
                        </Button>
                      );
                    })}
                  </div>

                  {/* Starry Night theme (unlockable) */}
                  <div className="mt-6 pt-4 border-t">
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-sm font-medium">Chế độ đặc biệt</Label>
                      {!isStarryNightUnlocked && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <LockIcon className="h-3 w-3" />
                          Cần mở khóa
                        </div>
                      )}
                    </div>
                    
                    {isStarryNightUnlocked ? (
                      <Button
                        variant={theme === "starry-night" ? "default" : "outline"}
                        className="w-full h-16 p-3 flex flex-col items-center justify-center theme-button transition-all duration-300 hover:scale-105 relative overflow-hidden"
                        onClick={() => handleThemeChange("starry-night")}
                        onMouseEnter={() => handleThemePreview("starry-night")}
                        onMouseLeave={clearThemePreview}
                        data-theme="starry-night"
                        style={{
                          background: "linear-gradient(135deg, #1e1b4b 0%, #581c87 50%, #0c0a09 100%)",
                          color: "#ffd700"
                        }}
                      >
                        <SparklesIcon className="h-5 w-5 mb-1" />
                        <span className="text-xs font-medium">✨ Starry Night ✨</span>
                        {theme === "starry-night" && (
                          <CheckIcon className="absolute top-1 right-1 h-4 w-4" />
                        )}
                      </Button>
                    ) : (
                      <div className="w-full h-16 p-3 flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/20 rounded-md bg-muted/10">
                        <LockIcon className="h-5 w-5 mb-1 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Theme bí mật</span>
                      </div>
                    )}
                  </div>

                  {/* Konami code hint */}
                  {showKonamiHint && (
                    <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-lg text-sm">
                      <div className="flex items-center gap-2 text-primary">
                        <KeyboardIcon className="h-4 w-4" />
                        <span className="font-medium">Gần rồi!</span>
                      </div>
                      <p className="text-muted-foreground mt-1">
                        Tiếp tục nhập sequence để mở khóa theme bí mật...
                      </p>
                    </div>
                  )}

                  {/* Progress indicator for Konami code */}
                  {konamiSequence.length > 0 && !isStarryNightUnlocked && (
                    <div className="mt-4 p-2 bg-secondary rounded-lg">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="flex gap-1">
                          {konamiCode.map((_, index) => (
                            <div
                              key={index}
                              className={`w-2 h-2 rounded-full ${
                                index < konamiSequence.length ? 'bg-primary' : 'bg-muted-foreground/30'
                              }`}
                            />
                          ))}
                        </div>
                        <span>{konamiSequence.length}/{konamiCode.length}</span>
                      </div>
                    </div>
                  )}
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
                        <span className="text-sm">A</span>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="normal" id="normal" className="peer sr-only" />
                      <Label
                        htmlFor="normal"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary transition-all duration-200 hover:scale-105 cursor-pointer"
                      >
                        <span className="text-sm mb-1">Vừa</span>
                        <span className="text-base">A</span>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="large" id="large" className="peer sr-only" />
                      <Label
                        htmlFor="large"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary transition-all duration-200 hover:scale-105 cursor-pointer"
                      >
                        <span className="text-sm mb-1">Lớn</span>
                        <span className="text-xl">A</span>
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
                      Điều chỉnh các tùy chọn giúp cải thiện khả năng tiếp cận. Điều chỉnh có thể không hoạt động đúng cách với một số tùy chọn giao diện.
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
    </AuthGuard >
  );
} 