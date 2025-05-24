'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/auth-context';

// Import API services
import { ClassroomService, Classroom } from '@/lib/api/classes';

// Import utils và data
import { filterClasses, sortClasses } from '@/lib/utils/class-utils';
import { ClassItem } from '@/components/classes/class-card';

export const useClassData = (searchTerm: string, sortConfig: string) => {
  // Separate original classes from filtered/displayed classes to avoid circular dependency
  const [originalClasses, setOriginalClasses] = useState<ClassItem[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<ClassItem[]>([]);
  const [actualClasses, setActualClasses] = useState<Classroom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentFilters, setCurrentFilters] = useState<any>({});
  const { role, userData } = useAuth();
  const { toast } = useToast();

  // Fetch lớp học từ API khi component được mount
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setIsLoading(true);
        if (!userData?.userID) return;

        // Lấy danh sách lớp học dựa theo vai trò người dùng
        let classrooms: Classroom[] = [];
        
        try {
          if (role === 'Teacher') {
            console.log('Fetching classrooms for teacher with ID:', userData.userID);
            classrooms = await ClassroomService.getClassroomsByTeacherId(userData.userID);
            console.log('Teacher classrooms fetched:', classrooms.length);
          } else if (role === 'Student') {
            console.log('Fetching classrooms for student with ID:', userData.userID);
            classrooms = await ClassroomService.getClassroomsByStudentId(userData.userID);
            console.log('Student classrooms fetched:', classrooms.length);
          } else {
            // Nếu vai trò không phải Teacher hoặc Student, hiển thị danh sách trống
            setActualClasses([]);
            setOriginalClasses([]);
            setFilteredClasses([]);
            setIsLoading(false);
            return;
          }
        } catch (apiError) {
          console.error('Error fetching classrooms:', apiError);
          classrooms = []; // Default to empty array on error
        }
        
        // Set the actual classrooms state
        setActualClasses(classrooms);
        
        // If no classrooms, set empty filtered classes and return early
        if (classrooms.length === 0) {
          setOriginalClasses([]);
          setFilteredClasses([]);
          setIsLoading(false);
          return;
        }
        
        try {
          // Collect promises for fetching schedules
          const schedulePromises = classrooms.map(classroom => {
            return ClassroomService.getSchedulesByClassroomId(classroom.classroomId)
              .catch(error => {
                console.error(`Error fetching schedules for classroom ${classroom.name}:`, error);
                return []; // Return empty array on error for this classroom
              });
          });
          
          // Wait for all schedule promises to complete
          const scheduleResults = await Promise.all(schedulePromises);
          
          // Map classrooms to the UI display format
          const formattedClasses = classrooms.map((classroom, index) => {
            // Get schedules for this classroom
            const schedules = scheduleResults[index] || [];
            
            // Format schedule display
            const dayNames = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
            const formattedSchedule = schedules.length > 0 
              ? Array.from(new Set(schedules.map(s => dayNames[s.dayOfWeek]))).join(', ')
              : 'Chưa có lịch học';
              
            const formattedTime = schedules.length > 0 
              ? Array.from(new Set(schedules.map(s => 
                  `${s.startTime.substring(0, 5)}-${s.endTime.substring(0, 5)}`
                ))).join(', ')
              : 'Chưa có thời gian học';
            
            // Create UI item with teacher information
            const classItem: ClassItem = {
              id: Number(classroom.classroomId.split('-')[0]) || Math.floor(Math.random() * 1000),
              name: classroom.name,
              subject: classroom.description.split('\n')[0].replace('Môn học: ', '') || 'Chưa xác định',
              teacher: role === 'Teacher' ? userData.fullName || 'Giáo viên' : 'Giáo viên',
              schedule: formattedSchedule,
              time: formattedTime,
              totalStudents: 0, // Will be updated after loading student list
              status: classroom.isOnlineMeeting === 'Active' ? 'active' : 'inactive',
              classroomId: classroom.classroomId
            };

            // For Student role, add teacher information if available
            if (role === 'Student') {
              // Check if classroom has teacher property (from StudentClassroomsResponse)
              const classroomWithTeacher = classroom as any;
              if (classroomWithTeacher.teacher) {
                classItem.teacherInfo = classroomWithTeacher.teacher;
                classItem.teacher = classroomWithTeacher.teacher.fullName || 'Giáo viên';
              }
            }
            
            return classItem;
          });
          
          // Set original classes (unfiltered)
          setOriginalClasses(formattedClasses);
          
          // Apply initial sorting and filtering
          const sortedClasses = sortClasses(formattedClasses, sortConfig);
          setFilteredClasses(sortedClasses);
        } catch (scheduleError) {
          console.error('Error processing classroom schedules:', scheduleError);
          // Set filtered classes to empty array on error
          setOriginalClasses([]);
          setFilteredClasses([]);
        }
      } catch (error: any) {
        console.error('Error in fetchClasses:', error);
        
        // Set empty arrays for both actual and filtered classes
        setActualClasses([]);
        setOriginalClasses([]);
        setFilteredClasses([]);
        
        // Only show error toast if it's not a 404 error
        if (error.response && error.response.status !== 404) {
          toast({
            variant: 'destructive',
            title: 'Lỗi',
            description: error.message || 'Không thể tải danh sách lớp học',
          });
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchClasses();
  }, [userData?.userID, userData?.fullName, role, toast, sortConfig]);

  // Apply filtering and sorting when original classes, search term, filters, or sort config changes
  const processedClasses = useMemo(() => {
    if (originalClasses.length === 0) return [];
    
    // Start with original classes
    let result = [...originalClasses];
    
    // Apply search filter
    if (searchTerm) {
      result = filterClasses(result, { search: searchTerm });
    }
    
    // Apply other filters
    if (Object.keys(currentFilters).length > 0) {
      result = filterClasses(result, currentFilters);
    }
    
    // Apply sorting
    result = sortClasses(result, sortConfig);
    
    return result;
  }, [originalClasses, searchTerm, currentFilters, sortConfig]);

  // Update filtered classes when processed classes change
  useEffect(() => {
    setFilteredClasses(processedClasses);
  }, [processedClasses]);

  // Stable callback functions
  const handleSearch = useCallback((value: string) => {
    // Search is handled through searchTerm prop and useMemo
  }, []);

  const handleFilterChange = useCallback((filters: any) => {
    setCurrentFilters(filters);
  }, []);

  const handleSortChange = useCallback((sort: string) => {
    // Sort is handled through sortConfig prop and useMemo
  }, []);

  const handleJoinClass = async (code: string): Promise<void> => {
    toast({
      title: 'Tính năng đang phát triển',
      description: 'Tính năng này đang được phát triển, vui lòng yêu cầu giáo viên thêm bạn vào lớp.',
    });
  };

  const handleCreateClass = useCallback(async (formData: any) => {
    try {
      // Lớp học đã được tạo thông qua API trong ClassFormModal
      // Ở đây chỉ cần cập nhật UI bằng cách reload dữ liệu
      
      // Reload lại danh sách lớp học từ API
      if (userData?.userID) {
        try {
          console.log('Reloading classrooms for teacher after creating class ID:', userData.userID);
          const classrooms = await ClassroomService.getClassroomsByTeacherId(userData.userID);
          console.log('Teacher classrooms fetched after create:', classrooms.length);
          
          // Set actual classrooms state
          setActualClasses(classrooms);
          
          // If no classrooms, set empty arrays and return early
          if (classrooms.length === 0) {
            console.log('No classrooms found after create');
            setOriginalClasses([]);
            setFilteredClasses([]);
            toast({
              title: 'Đã tạo lớp học mới',
              description: `Lớp ${formData.name} đã được tạo thành công, nhưng không thể tải danh sách lớp học.`,
            });
            return;
          }
          
          try {
            // Collect promises for fetching schedules
            const schedulePromises = classrooms.map(classroom => {
              return ClassroomService.getSchedulesByClassroomId(classroom.classroomId)
                .catch(error => {
                  console.error(`Error fetching schedules for classroom ${classroom.name} after create:`, error);
                  return []; // Return empty array on error for this classroom
                });
            });
            
            // Wait for all schedule promises to complete
            const scheduleResults = await Promise.all(schedulePromises);
            
            // Map classrooms to the UI display format
            const formattedClasses = classrooms.map((classroom, index) => {
              // Get schedules for this classroom
              const schedules = scheduleResults[index] || [];
              
              // Format schedule display
              const dayNames = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
              const formattedSchedule = schedules.length > 0 
                ? Array.from(new Set(schedules.map(s => dayNames[s.dayOfWeek]))).join(', ')
                : 'Chưa có lịch học';
                
              const formattedTime = schedules.length > 0 
                ? Array.from(new Set(schedules.map(s => 
                    `${s.startTime.substring(0, 5)}-${s.endTime.substring(0, 5)}`
                  ))).join(', ')
                : 'Chưa có thời gian học';
              
              // Create UI item with teacher information
              const classItem: ClassItem = {
                id: Number(classroom.classroomId.split('-')[0]) || Math.floor(Math.random() * 1000),
                name: classroom.name,
                subject: classroom.description.split('\n')[0].replace('Môn học: ', '') || 'Chưa xác định',
                teacher: userData.fullName || 'Giáo viên',
                schedule: formattedSchedule,
                time: formattedTime,
                totalStudents: 0,
                status: classroom.isOnlineMeeting === 'Active' ? 'active' : 'inactive',
                classroomId: classroom.classroomId
              };

              // For Student role, add teacher information if available
              if (role === 'Student') {
                const classroomWithTeacher = classroom as any;
                if (classroomWithTeacher.teacher) {
                  classItem.teacherInfo = classroomWithTeacher.teacher;
                  classItem.teacher = classroomWithTeacher.teacher.fullName || 'Không xác định';
                }
              }
              
              return classItem;
            });
            
            // Update original classes (this will trigger re-filtering via useMemo)
            setOriginalClasses(formattedClasses);
          } catch (scheduleError) {
            console.error('Error processing classroom schedules after create:', scheduleError);
            setOriginalClasses([]);
            setFilteredClasses([]);
          }
        } catch (apiError) {
          console.error('Error fetching teacher classrooms after create:', apiError);
          setActualClasses([]);
          setOriginalClasses([]);
          setFilteredClasses([]);
        }
      }

      toast({
        title: 'Đã tạo lớp học mới',
        description: `Lớp ${formData.name} đã được tạo thành công`,
      });
    } catch (error: any) {
      console.error('Error creating class:', error);
      
      // Only show error toast if it's not a 404 error
      if (!error.response || error.response.status !== 404) {
        toast({
          variant: 'destructive',
          title: 'Lỗi',
          description: error.message || 'Không thể tạo lớp học',
        });
      }
    }
  }, [userData?.userID, userData?.fullName, role, toast]);

  return {
    filteredClasses,
    isLoading,
    handleSearch,
    handleFilterChange,
    handleSortChange,
    handleJoinClass,
    handleCreateClass
  };
}; 