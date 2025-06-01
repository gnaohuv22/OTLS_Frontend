"use client";

import { useEffect } from "react";

export function FontSizeInitializer() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Load font size from localStorage
      const savedFontSize = localStorage.getItem("otls_font_size");
      
      if (savedFontSize) {
        // Define font sizes in pixels based on selection
        const fontSizes = {
          small: '14px',
          normal: '16px',
          large: '18px'
        };
        
        // Apply font size directly using CSS custom property
        document.documentElement.style.setProperty(
          '--base-font-size', 
          fontSizes[savedFontSize as keyof typeof fontSizes] || '16px'
        );
        
        // Apply the class for additional styling
        document.documentElement.classList.remove("text-sm", "text-base", "text-lg");
        document.documentElement.classList.add(`text-${savedFontSize}`);
      } else {
        // Set default font size if none is saved
        document.documentElement.style.setProperty('--base-font-size', '16px');
        document.documentElement.classList.add("text-normal");
      }
    }
  }, []);

  // This component doesn't render anything
  return null;
} 