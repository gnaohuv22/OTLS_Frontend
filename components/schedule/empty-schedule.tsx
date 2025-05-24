'use client';

import { motion } from 'framer-motion';
import { Calendar, CalendarX } from 'lucide-react';

interface EmptyScheduleProps {
  isHoliday?: boolean;
  holidayName?: string;
}

export function EmptySchedule({ isHoliday, holidayName }: EmptyScheduleProps = {}) {
  return (
    <motion.div 
      className="text-center py-8"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-center mb-4">
        <motion.div 
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
        >
          {isHoliday ? 
            <Calendar className="h-12 w-12 text-secondary" /> : 
            <CalendarX className="h-12 w-12 text-muted-foreground" />
          }
        </motion.div>
      </div>
      <h3 className="font-medium mb-1">
        {isHoliday 
          ? `Hôm nay là ngày nghỉ${holidayName ? ': ' + holidayName : ''}` 
          : 'Không có lịch học'
        }
      </h3>
      <p className="text-muted-foreground text-sm">
        {isHoliday 
          ? 'Không có lịch học nào được lên kế hoạch trong ngày nghỉ này' 
          : 'Không có lịch học nào được lên kế hoạch cho ngày này'
        }
      </p>
    </motion.div>
  );
} 