import React, { ReactNode } from 'react';
import { PageTransition } from '@/components/ui/transition';
import { cn } from '@/lib/utils';

interface AnimatedPageWrapperProps {
  children: ReactNode;
  className?: string;
}

export function AnimatedPageWrapper({ children, className }: AnimatedPageWrapperProps) {
  return (
    <PageTransition className={cn('w-full', className)}>
      {children}
    </PageTransition>
  );
} 