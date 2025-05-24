import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { ANIMATION_VARIANTS } from './constants';
import { EmptyStateProps } from './types';

/**
 * Component hiển thị trạng thái trống khi không có thông báo
 */
const EmptyState: React.FC<EmptyStateProps> = ({ message }) => {
  return (
    <motion.div 
      variants={ANIMATION_VARIANTS.fadeInUp} 
      initial="hidden" 
      animate="show"
    >
      <Card>
        <CardContent className="p-5 text-center">
          <p className="text-muted-foreground">{message}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default EmptyState; 