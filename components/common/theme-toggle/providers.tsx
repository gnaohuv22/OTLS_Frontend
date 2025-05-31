'use client';

import { ThemeProvider } from 'next-themes';
import { useState, useEffect } from 'react';
import { TooltipProvider } from "@/components/ui/tooltip";
import React from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Listen for theme changes via storage event
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'theme' && typeof window !== 'undefined') {
        // Emit a custom event for theme change
        window.dispatchEvent(new CustomEvent('themeChange', { 
          detail: { theme: event.newValue } 
        }));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Also monitor when the theme actually changes in this tab
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class' && mutation.target === document.documentElement) {
          const theme = document.documentElement.classList.contains('dark') ? 'dark' : 
                       document.documentElement.classList.contains('light') ? 'light' : 
                       document.documentElement.classList.contains('deep-ocean') ? 'deep-ocean' :
                       document.documentElement.classList.contains('starry-night') ? 'starry-night' :
                       document.documentElement.classList.contains('dusk') ? 'dusk' :
                       document.documentElement.classList.contains('cyberpunk-neon') ? 'cyberpunk-neon' :
                       document.documentElement.classList.contains('minimal-glacier') ? 'minimal-glacier' :
                       document.documentElement.classList.contains('forest-zen') ? 'forest-zen' :
                       document.documentElement.classList.contains('mono-code') ? 'mono-code' :
                       document.documentElement.classList.contains('vietnamese-heritage') ? 'vietnamese-heritage' : 'system';
          
          window.dispatchEvent(new CustomEvent('themeChange', { 
            detail: { theme } 
          }));
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  // Khôi phục theme từ localStorage (client-side)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Xử lý trường hợp đặc biệt cho starry-night
      const savedStarryNight = localStorage.getItem("otls_starry_night") === "true";
      
      if (savedStarryNight) {
        // Override theme nếu chế độ starry night được kích hoạt
        localStorage.setItem("theme", "starry-night");
      }
    }
  }, []);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem={false}
      disableTransitionOnChange={false}
      storageKey="theme" // Lưu tự động bằng key này vào localStorage
    >
      <TooltipProvider>
        {mounted && children}
      </TooltipProvider>
    </ThemeProvider>
  );
} 