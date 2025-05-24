'use client';

import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import React from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Khôi phục theme từ localStorage (client-side)
  const savedTheme = typeof window !== 'undefined' ? localStorage.getItem('theme') : 'light';
  const defaultTheme = savedTheme || 'light';

  if (!mounted) {
    return <div className="invisible">{children}</div>;
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme={defaultTheme}
      enableSystem={false}
      disableTransitionOnChange={false}
      storageKey="theme" // Lưu tự động bằng key này vào localStorage
    >
      <TooltipProvider>
        {children}
      </TooltipProvider>
    </ThemeProvider>
  );
} 