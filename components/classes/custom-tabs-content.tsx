import React, { ReactNode } from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { TabTransition } from '@/components/ui/transition';
import { cn } from '@/lib/utils';

interface CustomTabsContentProps {
  value: string;
  children: ReactNode;
  className?: string;
  transitionType?: 'fade' | 'slide' | 'scale' | 'slideUp';
  transitionDuration?: number;
}

export function CustomTabsContent({
  value,
  children,
  className,
  transitionType = 'slideUp',
  transitionDuration = 0.3
}: CustomTabsContentProps) {
  return (
    <TabsContent
      value={value}
      className={cn("outline-none relative", className)}
    >
      <div className="animate-in fade-in-50 slide-in-from-bottom-2 duration-300 ease-in-out">
        <TabTransition 
          type={transitionType}
          duration={transitionDuration}
        >
          {children}
        </TabTransition>
      </div>
    </TabsContent>
  );
} 