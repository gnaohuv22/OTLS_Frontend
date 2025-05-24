'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Classroom } from '@/lib/api/classes';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Pencil,
  Trash2,
  MoreVertical,
  Eye,
  UserPlus,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface AdminClassListProps {
  classrooms: Classroom[];
  onDeleteClass: (classroomId: string) => Promise<void>;
}

export function AdminClassList({
  classrooms,
  onDeleteClass,
}: AdminClassListProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleViewClass = (classroomId: string) => {
    router.push(`/admin/classes/${classroomId}`);
  };

  const handleEditClass = (classroomId: string) => {
    router.push(`/admin/classes/${classroomId}`);
  };

  const handleManageStudents = (classroomId: string) => {
    router.push(`/admin/classes/${classroomId}/students`);
  };

  const openDeleteDialog = (classroom: Classroom) => {
    setSelectedClassroom(classroom);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedClassroom) return;
    
    try {
      setIsDeleting(true);
      await onDeleteClass(selectedClassroom.classroomId);
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setSelectedClassroom(null);
    }
  };

  // Định dạng ngày tháng
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch (error) {
      return 'Không xác định';
    }
  };

  // Lấy môn học từ mô tả
  const getSubjectFromDescription = (description: string) => {
    try {
      const subjectMatch = description.match(/Môn học: (.*?)(\n|$)/);
      return subjectMatch ? subjectMatch[1] : 'Chưa xác định';
    } catch (error) {
      return 'Chưa xác định';
    }
  };

  return (
    <div className="space-y-6">
      {classrooms.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">Không tìm thấy lớp học nào.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {classrooms.map((classroom, index) => (
            <motion.div
              key={classroom.classroomId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="truncate">{classroom.name}</CardTitle>
                      <CardDescription className="truncate">
                        {getSubjectFromDescription(classroom.description)}
                      </CardDescription>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewClass(classroom.classroomId)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Xem chi tiết
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditClass(classroom.classroomId)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleManageStudents(classroom.classroomId)}>
                          <UserPlus className="mr-2 h-4 w-4" />
                          Quản lý học sinh
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => openDeleteDialog(classroom)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Xóa lớp học
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <Badge 
                    className={classroom.isOnlineMeeting === 'Active' ? 'bg-green-500' : 'bg-gray-500'}
                  >
                    {classroom.isOnlineMeeting === 'Active' ? 'Hoạt động' : 'Không hoạt động'}
                  </Badge>
                </CardHeader>
                
                <CardContent className="space-y-2 text-sm">
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-muted-foreground col-span-1">Giáo viên:</span>
                    <span className="col-span-2">
                      {classroom.users?.fullName}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-muted-foreground col-span-1">Mô tả:</span>
                    <span className="col-span-2">
                      {classroom.description}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-muted-foreground col-span-1">Ngày tạo:</span>
                    <span className="col-span-2">{formatDate(classroom.createdAt)}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-muted-foreground col-span-1">Cập nhật:</span>
                    <span className="col-span-2">{formatDate(classroom.updatedAt)}</span>
                  </div>
                </CardContent>
                
                <CardFooter className="flex justify-between pt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewClass(classroom.classroomId)}
                    className="w-full"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Xem chi tiết
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa lớp học này?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Lớp học{" "}
              <strong>{selectedClassroom?.name}</strong> sẽ bị xóa vĩnh viễn khỏi hệ thống
              cùng với tất cả dữ liệu liên quan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Đang xóa..." : "Xóa lớp học"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 