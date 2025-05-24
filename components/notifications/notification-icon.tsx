import React from 'react';
import { NOTIFICATION_ICONS } from './constants';
import { NotificationIconProps } from './types';

/**
 * Component hiển thị icon tương ứng với loại thông báo
 */
const NotificationIcon: React.FC<NotificationIconProps> = ({ type, className }) => {
  const IconComponent = NOTIFICATION_ICONS[type] || NOTIFICATION_ICONS.default;
  
  // Xác định màu sắc dựa trên loại thông báo
  const getColorClass = () => {
    switch (type) {
      case 'assignment':
        return 'text-blue-500';
      case 'submission':
        return 'text-teal-500';
      case 'grade':
        return 'text-green-500';
      case 'class':
        return 'text-purple-500';
      case 'system':
        return 'text-amber-500';
      case 'message':
        return 'text-pink-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <IconComponent className={`h-5 w-5 ${getColorClass()} ${className || ''}`} />
  );
};

export default NotificationIcon; 