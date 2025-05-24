import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TransitionProps {
  children: ReactNode;
  className?: string;
  show?: boolean;
  type?: 'fade' | 'slide' | 'scale' | 'slideUp';
  delay?: number;
  duration?: number;
  once?: boolean;
}

export function Transition({
  children,
  className,
  show = true,
  type = 'fade',
  delay = 0,
  duration = 0.3,
  once = false,
}: TransitionProps) {
  // Các hiệu ứng khác nhau
  const variants = {
    fade: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
      exit: { opacity: 0 }
    },
    slide: {
      hidden: { x: -20, opacity: 0 },
      visible: { x: 0, opacity: 1 },
      exit: { x: 20, opacity: 0 }
    },
    slideUp: {
      hidden: { y: 20, opacity: 0 },
      visible: { y: 0, opacity: 1 },
      exit: { y: -20, opacity: 0 }
    },
    scale: {
      hidden: { scale: 0.9, opacity: 0 },
      visible: { scale: 1, opacity: 1 },
      exit: { scale: 0.9, opacity: 0 }
    }
  };

  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div
          className={cn(className)}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={variants[type]}
          transition={{
            duration: duration,
            delay: delay,
            ease: "easeInOut",
          }}
          {...(once ? { viewport: { once: true } } : {})}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function PageTransition({ children, className }: { children: ReactNode, className?: string }) {
  return (
    <Transition type="fade" duration={0.5} className={className}>
      {children}
    </Transition>
  );
}

export function TabTransition({ 
  children, 
  className,
  type = 'slideUp',
  duration = 0.2
}: { 
  children: ReactNode, 
  className?: string,
  type?: 'fade' | 'slide' | 'scale' | 'slideUp',
  duration?: number
}) {
  return (
    <Transition type={type} duration={duration} className={className}>
      {children}
    </Transition>
  );
} 