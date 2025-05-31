"use client";

import { useEffect, useState, useRef } from "react";

// Define bubble interface
interface Bubble {
  id: string;
  size: number;
  duration: number;
  x: number;
}

export function DeepOceanProvider({ children }: { children: React.ReactNode }) {
  const [isDeepOceanActive, setIsDeepOceanActive] = useState(false);
  const bubblesRef = useRef<Bubble[]>([]);
  const bubbleIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Function to create ocean bubbles
  const createBubbles = () => {
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
  };

  // Cleanup bubbles
  const cleanupBubbles = () => {
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
  };

  useEffect(() => {
    // Check localStorage for deep ocean setting on component mount
    const checkDeepOceanSetting = () => {
      if (typeof window !== "undefined") {
        // Check if the current theme is deep-ocean
        const currentTheme = localStorage.getItem("theme");
        const isDeepOcean = currentTheme === "deep-ocean";
        
        setIsDeepOceanActive(isDeepOcean);
        
        // Use requestAnimationFrame to avoid layout conflicts
        requestAnimationFrame(() => {
          if (isDeepOcean) {
            // Create bubbles if not already created
            createBubbles();
          } else {
            // Clean up bubbles if the theme is not deep-ocean
            cleanupBubbles();
          }
        });
      }
    };

    // Initial check with delay to prevent conflicts with SSR
    const timeoutId = setTimeout(checkDeepOceanSetting, 100);

    // Listen for storage changes from other tabs/windows
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "theme") {
        // Debounce storage changes
        setTimeout(checkDeepOceanSetting, 50);
      }
    };

    // Listen for custom events from the settings page
    const handleThemeChange = (event: Event) => {
      // Debounce theme change events
      setTimeout(checkDeepOceanSetting, 50);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('themeChange', handleThemeChange);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('themeChange', handleThemeChange);
      cleanupBubbles();
    };
  }, []);

  return <>{children}</>;
} 