'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthGuard } from '@/components/auth/auth-guard';
import { useAuth } from '@/lib/auth-context';
import { ClassroomService, Classroom } from '@/lib/api/classes';
import {
  AdminClassList,
  AdminClassHeader,
  AdminClassFilters,
  AdminCreateClassDialog
} from '@/components/admin/classes';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

export default function AdminClassesPage() {
  const { toast } = useToast();
  const { userData, role } = useAuth();
  const router = useRouter();

  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [filteredClassrooms, setFilteredClassrooms] = useState<Classroom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Kiểm tra quyền truy cập
  useEffect(() => {
    if (role !== 'Admin') {
      toast({
        title: 'Quyền truy cập bị từ chối',
        description: 'Bạn không có quyền truy cập vào trang quản lý lớp học.',
        variant: 'destructive',
      });
      router.push('/dashboard');
    }
  }, [role, router, toast]);

  // Lấy danh sách lớp học từ API
  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        setIsLoading(true);
        const data = await ClassroomService.getAllClassrooms();
        setClassrooms(data);
        setFilteredClassrooms(data);
      } catch (error: any) {
        if (error.status === 404) {
          setClassrooms([]);
          setFilteredClassrooms([]);
        } else {
          toast({
            title: 'Không thể tải danh sách lớp học',
            description: error.message || 'Đã xảy ra lỗi khi tải danh sách lớp học.',
            variant: 'destructive',
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchClassrooms();
  }, [toast]);

  // Lọc lớp học dựa trên từ khóa tìm kiếm và bộ lọc
  useEffect(() => {
    const filterClassrooms = () => {
      let result = [...classrooms];

      // Lọc theo từ khóa tìm kiếm
      if (searchTerm) {
        result = result.filter(
          classroom =>
            classroom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            classroom.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Lọc theo trạng thái
      if (statusFilter !== 'all') {
        result = result.filter(classroom => classroom.isOnlineMeeting === statusFilter);
      }

      setFilteredClassrooms(result);
    };

    filterClassrooms();
  }, [searchTerm, statusFilter, classrooms]);

  // Xử lý tìm kiếm
  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  // Xử lý thay đổi bộ lọc
  const handleFilterChange = (status: string) => {
    setStatusFilter(status);
  };

  // Xử lý xóa lớp học
  const handleDeleteClass = async (classroomId: string) => {
    try {
      await ClassroomService.deleteClassroom(classroomId);

      // Cập nhật lại danh sách lớp học
      setClassrooms(prevClassrooms =>
        prevClassrooms.filter(classroom => classroom.classroomId !== classroomId)
      );

      toast({
        title: 'Xóa lớp học thành công',
        description: 'Lớp học đã được xóa thành công.',
      });
    } catch (error: any) {
      toast({
        title: 'Không thể xóa lớp học',
        description: error.message || 'Đã xảy ra lỗi khi xóa lớp học.',
        variant: 'destructive',
      });
    }
  };

  // Xử lý tạo lớp học mới
  const handleCreateClass = (classData: any) => {
    try {
      // Thêm lớp học mới vào danh sách (sử dụng trực tiếp dữ liệu nhận được từ dialog)
      setClassrooms(prevClassrooms => [classData, ...prevClassrooms]);

      toast({
        title: 'Tạo lớp học thành công',
        description: `Lớp học "${classData.name}" đã được tạo thành công.`,
      });

      // Đóng modal
      setShowCreateModal(false);
    } catch (error: any) {
      toast({
        title: 'Không thể tạo lớp học',
        description: error.message || 'Đã xảy ra lỗi khi tạo lớp học mới.',
        variant: 'destructive',
      });
    }
  };

  return (
    <AuthGuard>
      <div className="container mx-auto py-6 space-y-6">
        <AdminClassHeader
          setShowCreateModal={setShowCreateModal}
        />

        <AdminClassFilters
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          onSearch={handleSearch}
          onFilterChange={handleFilterChange}
        />

        {isLoading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-lg">Đang tải danh sách lớp học...</span>
          </div>
        ) : (
          <AdminClassList
            classrooms={filteredClassrooms}
            onDeleteClass={handleDeleteClass}
          />
        )}

        <AdminCreateClassDialog
          isOpen={showCreateModal}
          onOpenChange={setShowCreateModal}
          onCreateClass={handleCreateClass}
        />
      </div>
    </AuthGuard>
  );
} 