import React from 'react';
import { motion } from 'framer-motion';
import { ANIMATION_VARIANTS } from './constants';
import { NotificationTabContentProps } from './types';
import NotificationItem from './notification-item';
import EmptyState from './empty-state';

/**
 * Component hiển thị nội dung của tab thông báo
 */
const NotificationTabContent: React.FC<NotificationTabContentProps> = ({ 
  notifications, 
  emptyMessage, 
  onMarkAsRead 
}) => {
  if (notifications.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <motion.div
      variants={ANIMATION_VARIANTS.staggerContainer}
      initial="hidden"
      animate="show"
      className="space-y-4"
    >
      {notifications.map((notification, index) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onMarkAsRead={onMarkAsRead}
          index={index}
        />
      ))}
    </motion.div>
  );
};

export default NotificationTabContent; 