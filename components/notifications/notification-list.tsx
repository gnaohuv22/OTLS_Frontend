import React, { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnimatePresence } from 'framer-motion';
import { NotificationListProps } from './types';
import NotificationsHeader from './notifications-header';
import NotificationTabContent from './notification-tab-content';

/**
 * Component hiển thị danh sách thông báo với các tab lọc
 */
const NotificationList: React.FC<NotificationListProps> = ({
  initialNotifications,
  title,
  description,
  assignmentTypes,
  classTypes,
  emptyMessages,
}) => {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [activeTab, setActiveTab] = useState('all');

  // Đánh dấu một thông báo đã đọc
  const markAsRead = useCallback((id: number) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id && !notification.isRead // Chỉ cập nhật nếu chưa đọc
          ? { ...notification, isRead: true }
          : notification
      )
    );
  }, []);

  // Đánh dấu tất cả thông báo đã đọc
  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.isRead ? notification : { ...notification, isRead: true }
      )
    );
  }, []);

  // Lọc các thông báo theo loại
  const unreadNotifications = useMemo(() => 
    notifications.filter(n => !n.isRead), 
    [notifications]
  );
  
  const assignmentNotifications = useMemo(() => 
    notifications.filter(n => assignmentTypes.includes(n.type)), 
    [notifications, assignmentTypes]
  );
  
  const classNotifications = useMemo(() => 
    notifications.filter(n => classTypes.includes(n.type)), 
    [notifications, classTypes]
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="container mx-auto py-6"
    >
      <NotificationsHeader
        title={title}
        description={description}
        unreadCount={unreadNotifications.length}
        onMarkAllAsRead={markAllAsRead}
      />

      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <TabsList className="mb-4 flex-wrap transition-all duration-300">
          <TabsTrigger value="all" className="transition-all duration-200">
            Tất cả ({notifications.length})
          </TabsTrigger>
          <TabsTrigger value="unread" className="transition-all duration-200">
            Chưa đọc ({unreadNotifications.length})
          </TabsTrigger>
          <TabsTrigger value="assignments" className="transition-all duration-200">
            Bài tập ({assignmentNotifications.length})
          </TabsTrigger>
          <TabsTrigger value="classes" className="transition-all duration-200">
            Lớp học ({classNotifications.length})
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <TabsContent key="tab-all" value="all" className="space-y-4">
            <NotificationTabContent 
              notifications={notifications}
              emptyMessage="Không có thông báo nào."
              onMarkAsRead={markAsRead}
            />
          </TabsContent>

          <TabsContent key="tab-unread" value="unread" className="space-y-4">
            <NotificationTabContent 
              notifications={unreadNotifications}
              emptyMessage={emptyMessages.unread}
              onMarkAsRead={markAsRead}
            />
          </TabsContent>

          <TabsContent key="tab-assignments" value="assignments" className="space-y-4">
            <NotificationTabContent 
              notifications={assignmentNotifications}
              emptyMessage={emptyMessages.assignments}
              onMarkAsRead={markAsRead}
            />
          </TabsContent>

          <TabsContent key="tab-classes" value="classes" className="space-y-4">
            <NotificationTabContent 
              notifications={classNotifications}
              emptyMessage={emptyMessages.classes}
              onMarkAsRead={markAsRead}
            />
          </TabsContent>
        </AnimatePresence>
      </Tabs>
    </motion.div>
  );
};

export default NotificationList; 