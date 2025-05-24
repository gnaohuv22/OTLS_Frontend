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
        
        if (savedStarryNight) {
          // Apply starry night theme globally
          document.documentElement.classList.add("starry-night");
          
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
          document.body.appendChild(moon);
        } else {
          // Remove starry night theme
          document.documentElement.classList.remove("starry-night");
          
          // Remove any existing moon elements
          const moons = document.querySelectorAll('.moon');
          moons.forEach(moon => {
            if (moon.parentNode) {
              moon.parentNode.removeChild(moon);
            }
          });
        }
      }
    };

    // Initial check
    checkStarryNightSetting();

    // Listen for storage changes from other tabs/windows
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "otls_starry_night") {
        checkStarryNightSetting();
      }
    };

    // Listen for custom events from the settings page
    const handleStarryNightToggle = () => {
      checkStarryNightSetting();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('starryNightToggle', handleStarryNightToggle);

    return () => {
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
          if (moon.parentNode) {
            moon.parentNode.removeChild(moon);
          }
        });
      }
    };
  }, []);

  return <>{children}</>;
} 