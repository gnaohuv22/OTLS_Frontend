import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ANIMATION_VARIANTS } from './constants';
import { NotificationItemProps } from './types';
import NotificationIcon from './notification-icon';

/**
 * Component hiển thị một thông báo
 */
const NotificationItem: React.FC<NotificationItemProps> = React.memo(({ notification, onMarkAsRead, index }) => {
  return (
    <motion.div
      variants={ANIMATION_VARIANTS.itemVariants}
      initial="hidden"
      animate="show"
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
    >
      <Card
        key={notification.id}
        className={cn(
          "cursor-pointer hover:bg-muted/50 transition-all duration-200",
          !notification.isRead && "border-l-4 border-l-primary"
        )}
        onClick={() => onMarkAsRead(notification.id)}
      >
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="mt-1">
              <NotificationIcon type={notification.type} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1 gap-2">
                <h3 className="font-semibold">{notification.title}</h3>
                <div className="flex items-center text-sm text-muted-foreground flex-shrink-0">
                  <Clock className="mr-1 h-3 w-3" />
                  {notification.date} {notification.time}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{notification.message}</p>
            </div>
            {!notification.isRead && (
              <motion.div 
                className="h-2 w-2 rounded-full bg-primary mt-1 flex-shrink-0" 
                aria-label="Unread"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

NotificationItem.displayName = 'NotificationItem';

export default NotificationItem; 