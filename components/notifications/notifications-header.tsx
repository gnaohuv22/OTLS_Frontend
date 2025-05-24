import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { NotificationsHeaderProps } from './types';

/**
 * Component hiển thị phần header của trang thông báo
 */
const NotificationsHeader: React.FC<NotificationsHeaderProps> = ({
  title,
  description,
  unreadCount,
  onMarkAllAsRead
}) => {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <motion.div 
        initial={{ x: -20, opacity: 0 }} 
        animate={{ x: 0, opacity: 1 }} 
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </motion.div>
      
      <motion.div 
        initial={{ x: 20, opacity: 0 }} 
        animate={{ x: 0, opacity: 1 }} 
        transition={{ duration: 0.3 }}
      >
        <Button 
          variant="outline" 
          onClick={onMarkAllAsRead} 
          disabled={unreadCount === 0}
          className="transition-all duration-200 hover:shadow-md"
        >
          Đánh dấu tất cả đã đọc
        </Button>
      </motion.div>
    </div>
  );
};

export default NotificationsHeader; 