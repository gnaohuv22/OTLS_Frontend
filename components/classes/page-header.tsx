'use client';

import { motion } from 'framer-motion';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RoleBasedContent } from '@/components/auth/role-based-content';
import { JoinClassDialog } from '@/components/student/classes/join-class-dialog';

// Animation variants
const headerAnimation = {
  initial: { opacity: 0, y: -10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
};

interface PageHeaderProps {
  newClassOpen: boolean;
  setNewClassOpen: (isOpen: boolean) => void;
  onJoinClass: (code: string) => Promise<void>;
}

export function PageHeader({ newClassOpen, setNewClassOpen, onJoinClass }: PageHeaderProps) {
  return (
    <motion.div 
      initial={headerAnimation.initial}
      animate={headerAnimation.animate}
      transition={headerAnimation.transition}
      className="flex items-center justify-between"
    >
      <div className="space-y-1">
        <h2 className="text-3xl font-bold tracking-tight">Lớp học của tôi</h2>
        <p className="text-muted-foreground">
          Quản lý và theo dõi các lớp học của bạn
        </p>
      </div>
      
      <RoleBasedContent
        teacherContent={
          <Button 
            className="gap-2 transition-all duration-200 hover:shadow-md"
            onClick={() => setNewClassOpen(true)}
          >
            <PlusCircle className="h-4 w-4" />
            Tạo lớp học mới
          </Button>
        }
        studentContent={
          <JoinClassDialog onJoinClass={onJoinClass} />
        }
      />
    </motion.div>
  );
} 