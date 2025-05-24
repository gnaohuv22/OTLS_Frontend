// Types và interfaces cho notification system

/**
 * Định nghĩa cấu trúc dữ liệu cho một thông báo
 */
export interface Notification {
  id: number;
  type: string; // 'assignment' | 'submission' | 'class' | 'system' | 'message' | 'grade'
  title: string;
  message: string;
  date: string;
  time: string;
  isRead: boolean;
}

/**
 * Props cho EmptyState component
 */
export interface EmptyStateProps {
  message: string;
}

/**
 * Props cho NotificationItem component
 */
export interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: number) => void;
  index: number;
}

/**
 * Props cho NotificationIcon component
 */
export interface NotificationIconProps {
  type: string;
  className?: string;
}

/**
 * Props cho NotificationsHeader component
 */
export interface NotificationsHeaderProps {
  title: string;
  description: string;
  unreadCount: number;
  onMarkAllAsRead: () => void;
}

/**
 * Props cho NotificationList component
 */
export interface NotificationListProps {
  initialNotifications: Notification[];
  title: string;
  description: string;
  assignmentTypes: string[]; // e.g., ['assignment', 'submission'] or ['assignment', 'grade']
  classTypes: string[]; // e.g., ['class']
  emptyMessages: {
    unread: string;
    assignments: string;
    classes: string;
  };
}

/**
 * Props cho tab content
 */
export interface NotificationTabContentProps {
  notifications: Notification[];
  emptyMessage: string;
  onMarkAsRead: (id: number) => void;
}

/**
 * Config cho các role khác nhau
 */
export interface RoleNotificationConfig {
  initialNotifications: Notification[];
  title: string;
  description: string;
  assignmentTypes: string[];
  classTypes: string[];
  emptyMessages: {
    unread: string;
    assignments: string;
    classes: string;
  };
} 