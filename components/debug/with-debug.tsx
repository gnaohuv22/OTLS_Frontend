'use client';

import React from 'react';
import { DebugPanel } from './debug-panel';

interface WithDebugProps {
  children: React.ReactNode;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export function WithDebug({ children, position = 'bottom-right' }: WithDebugProps) {
  return (
    <>
      {children}
      {/* Only render in development mode */}
      {process.env.NODE_ENV !== 'production' && (
        <DebugPanel position={position} />
      )}
    </>
  );
} 