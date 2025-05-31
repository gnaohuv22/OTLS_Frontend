"use client";

import { useEffect, useState } from "react";

export function ClaudeThemeProvider({ children }: { children: React.ReactNode }) {
  const [isClaudeThemeActive, setIsClaudeThemeActive] = useState(false);

  useEffect(() => {
    // Check localStorage for Claude theme setting on component mount
    const checkClaudeThemeSetting = () => {
      if (typeof window !== "undefined") {
        const currentTheme = localStorage.getItem("theme");
        const isClaudeActive = currentTheme === "claude-theme";
        setIsClaudeThemeActive(isClaudeActive);
        
        // Use requestAnimationFrame to avoid layout conflicts
        requestAnimationFrame(() => {
          // Make sure the claude-theme class is applied or removed properly
          if (isClaudeActive) {
            if (!document.documentElement.classList.contains("claude-theme")) {
              document.documentElement.classList.add("claude-theme");
            }
          } else {
            document.documentElement.classList.remove("claude-theme");
          }
        });
      }
    };

    // Initial check with delay to prevent conflicts with SSR
    const timeoutId = setTimeout(checkClaudeThemeSetting, 100);

    // Listen for storage changes from other tabs/windows
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "theme") {
        // Debounce storage changes
        setTimeout(checkClaudeThemeSetting, 50);
      }
    };

    // Listen for custom events from the settings page
    const handleThemeChange = (event: CustomEvent) => {
      // Debounce theme change events
      setTimeout(checkClaudeThemeSetting, 50);
      
      // If theme is changing to something other than light, dark, or claude-theme
      if (event.detail && event.detail.theme) {
        const newTheme = event.detail.theme;
        if (newTheme !== 'claude-theme' && newTheme !== 'light' && newTheme !== 'dark') {
          // Force cleanup of claude-theme
          document.documentElement.classList.remove("claude-theme");
          if (localStorage.getItem("theme") === "claude-theme") {
            localStorage.setItem("theme", "light");
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('themeChange', handleThemeChange as EventListener);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('themeChange', handleThemeChange as EventListener);
    };
  }, []);

  return <>{children}</>;
} 