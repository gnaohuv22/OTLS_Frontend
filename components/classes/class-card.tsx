'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Calendar,
  Clock,
  Users,
  Video,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RoleBasedContent } from '@/components/auth/role-based-content';
import { ClassroomTeacher } from '@/lib/api/classes';

// Animation variants
const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2 } }
};

export interface ClassItem {
  id: number;
  name: string;
  subject: string;
  teacher: string;
  schedule: string;
  time: string;
  totalStudents: number;
  status: string;
  code?: string;
  classroomId: string;
  teacherInfo?: ClassroomTeacher;
}

interface ClassCardProps {
  classItem: ClassItem;
  index: number;
}

export function ClassCard({ classItem, index }: ClassCardProps) {
  // Trạng thái tiếp theo của lớp học
  const classStatus = {
    text: 'Đang hoạt động',
    color: 'bg-green-100 text-green-800 hover:bg-green-200'
  };

  // Set trạng thái dựa trên status từ API
  if (classItem.status === 'inactive') {
    classStatus.text = 'Không hoạt động';
    classStatus.color = 'bg-gray-100 text-gray-800 hover:bg-gray-200';
  } else if (classItem.status === 'scheduled') {
    classStatus.text = 'Đã lên lịch';
    classStatus.color = 'bg-blue-100 text-blue-800 hover:bg-blue-200';
  } else if (classItem.status === 'pending') {
    classStatus.text = 'Sắp diễn ra';
    classStatus.color = 'bg-orange-100 text-orange-800 hover:bg-orange-200';
  }
  
  return (
    <motion.div 
      variants={itemVariants}
      className="h-full"
    >
      <Card className="hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{classItem.name}</span>
            <Badge variant="outline" className={classStatus.color}>
              {classStatus.text}
            </Badge>
          </CardTitle>
          <CardDescription>{classItem.subject}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center text-sm">
              <Users className="h-4 w-4 mr-2 text-gray-400" />
              <div className="flex flex-col">
                <span>Giáo viên: {classItem.teacherInfo ? classItem.teacherInfo.fullName : classItem.teacher}</span>
                {classItem.teacherInfo && (
                  <span className="text-xs text-muted-foreground mt-0.5">
                    {classItem.teacherInfo.email}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center text-sm">
              <Calendar className="h-4 w-4 mr-2 text-gray-400" />
              <span>{classItem.schedule}</span>
            </div>
            <div className="flex items-center text-sm">
              <Clock className="h-4 w-4 mr-2 text-gray-400" />
              <span>{classItem.time}</span>
            </div>
            
            <div className="flex flex-col gap-2">
              <RoleBasedContent
                teacherContent={
                  <Link href={`/classes/${classItem.classroomId}?tab=meeting`} className="w-full">
                    <Button className="w-full gap-2 transition-all duration-200 hover:shadow-md">
                      <Video className="h-4 w-4" />
                      Bắt đầu học trực tuyến
                    </Button>
                  </Link>
                }
                studentContent={
                  classStatus.text === 'Sắp diễn ra' ? (
                    <Link href={`/classes/${classItem.classroomId}?tab=meeting`} className="w-full">
                      <Button className="w-full gap-2 transition-all duration-200 hover:shadow-md">
                        <Video className="h-4 w-4" />
                        Tham gia lớp học trực tuyến
                      </Button>
                    </Link>
                  ) : null
                }
              />
              <Link href={`/classes/${classItem.classroomId}`} className="w-full">
                <Button variant="outline" size="sm" className="w-full transition-all duration-200 hover:bg-muted/50">
                  Xem chi tiết
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
} 