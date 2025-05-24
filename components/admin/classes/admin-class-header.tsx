'use client';

import { motion } from 'framer-motion';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminClassHeaderProps {
  setShowCreateModal: (show: boolean) => void;
}

export function AdminClassHeader({ setShowCreateModal }: AdminClassHeaderProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
    >
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Quản lý lớp học</h1>
        <p className="text-muted-foreground">
          Quản lý tất cả lớp học trong hệ thống OTLS
        </p>
      </div>
      
      <Button 
        onClick={() => setShowCreateModal(true)}
        className="inline-flex items-center"
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        Tạo lớp học mới
      </Button>
    </motion.div>
  );
} 