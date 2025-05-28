"use client";

import { useEffect, useState } from "react";

export function StarryNightProvider({ children }: { children: React.ReactNode }) {
  const [isStarryNightActive, setIsStarryNightActive] = useState(false);

  useEffect(() => {
    // Check localStorage for starry night setting on component mount
    const checkStarryNightSetting = () => {
      if (typeof window !== "undefined") {
        const savedStarryNight = localStorage.getItem("otls_starry_night") === "true";
        setIsStarryNightActive(savedStarryNight);
        
        // Use requestAnimationFrame to avoid layout conflicts
        requestAnimationFrame(() => {
          if (savedStarryNight) {
            // Apply starry night theme globally only if not already applied
            if (!document.documentElement.classList.contains("starry-night")) {
              document.documentElement.classList.add("starry-night");
            }
            
            // Remove any existing moon elements first to prevent duplicates
            const existingMoons = document.querySelectorAll('.moon');
            existingMoons.forEach(moon => {
              if (moon.parentNode) {
                moon.parentNode.removeChild(moon);
              }
            });
            
            // Add moon element if starry night is active
            const moon = document.createElement('div');
            moon.className = 'moon';
            moon.style.transition = 'opacity 0.4s ease-in-out';
            moon.style.opacity = '0';
            document.body.appendChild(moon);
            
            // Fade in moon
            setTimeout(() => {
              moon.style.opacity = '1';
            }, 100);
          } else {
            // Remove starry night theme
            document.documentElement.classList.remove("starry-night");
            
            // Fade out and remove moon elements
            const moons = document.querySelectorAll('.moon');
            moons.forEach(moon => {
              if (moon instanceof HTMLElement) {
                moon.style.transition = 'opacity 0.4s ease-in-out';
                moon.style.opacity = '0';
                setTimeout(() => {
                  if (moon.parentNode) {
                    moon.parentNode.removeChild(moon);
                  }
                }, 400);
              }
            });
          }
        });
      }
    };

    // Initial check with delay to prevent conflicts with SSR
    const timeoutId = setTimeout(checkStarryNightSetting, 100);

    // Listen for storage changes from other tabs/windows
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "otls_starry_night") {
        // Debounce storage changes
        setTimeout(checkStarryNightSetting, 50);
      }
    };

    // Listen for custom events from the settings page
    const handleStarryNightToggle = () => {
      // Debounce toggle events
      setTimeout(checkStarryNightSetting, 50);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('starryNightToggle', handleStarryNightToggle);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('starryNightToggle', handleStarryNightToggle);
    };
  }, []);

  // Clean up moon when component unmounts
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") {
        const moons = document.querySelectorAll('.moon');
        moons.forEach(moon => {
          if (moon instanceof HTMLElement) {
            moon.style.transition = 'opacity 0.2s ease-out';
            moon.style.opacity = '0';
            setTimeout(() => {
              if (moon.parentNode) {
                moon.parentNode.removeChild(moon);
              }
            }, 200);
          }
        });
      }
    };
  }, []);

  return <>{children}</>;
} 