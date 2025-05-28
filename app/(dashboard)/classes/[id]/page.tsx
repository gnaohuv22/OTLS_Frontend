'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Tabs } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { AuthGuard } from '@/components/auth/auth-guard';
import { StudentAuthGuard } from '@/components/auth/student-auth-guard';
import { useAuth } from '@/lib/auth-context';
import { ClassroomService, ClassSchedule } from '@/lib/api/classes';

// Import các component đã refactor
import {
  ClassDetailHeader,
  ClassInfoCards,
  ClassTabNav,
  AnnouncementsTab,
  AssignmentsTab,
  OnlineMeetingTab,
  MaterialsTab,
  StudentsTab,
  SettingsTab,
  AddStudentModal,
  ScheduleModal,
  Announcement,
  ClassDetail,
  CustomTabsContent,
  AnimatedPageWrapper
} from '@/components/classes';

import { ClassFormModal } from '@/components/classes/modals/class-form-modal';

// Cấu trúc cơ bản của class detail, sẽ được điền bởi API
const emptyClassDetail: ClassDetail = {
  id: '',
  name: '',
  subject: '',
  teacher: '',
  schedule: '',
  time: '',
  totalStudents: 0,
  currentUnit: '',
  nextClass: new Date().toISOString(),
  status: 'inactive',
  description: '',
  announcements: [], // Thông báo sẽ được quản lý bởi AnnouncementManager
  assignments: [],
  materials: [],
  students: [],
  isOnlineMeetingActive: false,
  meetingId: 'ae-minh-cu-the-thoi-he-he',
  classroomId: ''
};

export default function ClassDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { role, userData: authUserData } = useAuth();
  const classId = params.id as string;

  // Các state quản lý dữ liệu và UI
  const [classDetail, setClassDetail] = useState<ClassDetail>(emptyClassDetail);
  const [activeTab, setActiveTab] = useState('announcements');
  const [isMeetingActive, setIsMeetingActive] = useState(false);
  const [isLoadingMeeting, setIsLoadingMeeting] = useState(false);
  
  // State cho các modal
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showEditClassModal, setShowEditClassModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  
  // State mới cho lịch học
  const [classSchedules, setClassSchedules] = useState<ClassSchedule[]>([]);
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(false);
  
  // Form state cho các modal
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [studentsToAdd, setStudentsToAdd] = useState<string[]>([]);
  const [editClassForm, setEditClassForm] = useState({
    className: '',
    classSubject: '',
    classDescription: '',
    schedules: [{
      day: '',
      time: '',
      id: 1
    }]
  });
  const [scheduleForm, setScheduleForm] = useState({
    schedule: '',
    time: '',
    meetingLink: ''
  });

  // State cho thông tin lớp học
  const [teacherInfo, setTeacherInfo] = useState<{
    id: string;
    name: string;
    avatar?: string | null;
    email?: string;
  } | undefined>(undefined);

  // User data for announcement system
  const userData = {
    id: authUserData?.userID || 'testify-resurrection',
    name: authUserData?.fullName || 'Testify',
    role: role
  };

  // Load dữ liệu từ API
  useEffect(() => {
    const fetchClassData = async () => {
      try {
        if (!classId) return;
        
        // Lấy thông tin lớp học từ API
        const classroomData = await ClassroomService.getClassroomById(classId);
        
        // Trích xuất thông tin giáo viên
        const teacherInfo = classroomData.users ? {
          id: classroomData.users.userID,
          name: classroomData.users.fullName,
          avatar: classroomData.users.avatar,
          email: classroomData.users.email
        } : undefined;
        
        // Lưu thông tin giáo viên vào state
        setTeacherInfo(teacherInfo);
        
        // Kiểm tra trạng thái buổi học trực tuyến
        setIsMeetingActive(classroomData.isOnlineMeeting === 'Active');
        
        // Lấy danh sách học sinh từ API
        const studentsData = await ClassroomService.getStudentsByClassroomId(classId as string);
        
        // Lấy lịch học của lớp
        setIsLoadingSchedules(true);
        const schedulesData = await ClassroomService.getSchedulesByClassroomId(classId as string);
        setClassSchedules(schedulesData);
        setIsLoadingSchedules(false);
        
        // Chuyển đổi dữ liệu học sinh sang định dạng phù hợp với UI
        const formattedStudents = Array.isArray(studentsData) 
          ? studentsData.map(student => ({
              id: student.studentId,
              name: student.studentName,
              avatar: student.studentAvatar || `/avatars/default-${student.studentGender === 'Male' ? 'male' : 'female'}.jpg`,
              email: student.studentEmail,
              joinedAt: student.joinedAt,
              studentDob: student.studentDob,
              status: student.status || 'Active' // Mặc định là Active nếu không có trạng thái
            }))
          : [];
        
        // Trích xuất thông tin từ mô tả
        let extractedSubject = 'Không xác định';
        const subjectMatch = classroomData.description.match(/Môn học: (.*?)(\n|$)/);
        if (subjectMatch) {
          extractedSubject = subjectMatch[1];
        }
        
        // Định dạng lịch học và tính thời gian buổi học tiếp theo
        const dayNames = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
        const formattedSchedule = schedulesData.length > 0 
          ? Array.from(new Set(schedulesData.map(s => dayNames[s.dayOfWeek]))).join(', ')
          : '';
        
        const formattedTime = schedulesData.length > 0 
          ? Array.from(new Set(schedulesData.map(s => 
              `${s.startTime.substring(0, 5)}-${s.endTime.substring(0, 5)}`
            ))).join(', ')
          : '';
        
        // Tính thời gian buổi học tiếp theo dựa trên lịch học
        let nextClassDate = new Date(); // Mặc định là ngày hiện tại
        
        if (schedulesData.length > 0) {
          const now = new Date();
          const currentDay = now.getDay(); // 0 = Chủ nhật, 1 = Thứ 2, ...
          const currentHour = now.getHours();
          const currentMinute = now.getMinutes();
          
          // Sắp xếp lịch học theo thứ tự ngày trong tuần
          const sortedSchedules = [...schedulesData].sort((a, b) => {
            if (a.dayOfWeek !== b.dayOfWeek) {
              return a.dayOfWeek - b.dayOfWeek;
            }
            return a.startTime.localeCompare(b.startTime);
          });
          
          // Tìm buổi học tiếp theo
          let foundNextClass = false;
          
          // Đầu tiên tìm trong tuần hiện tại
          for (const schedule of sortedSchedules) {
            const [scheduleHour, scheduleMinute] = schedule.startTime.split(':').map(Number);
            
            if (
              // Nếu là ngày trong tương lai trong tuần này
              (schedule.dayOfWeek > currentDay) ||
              // Hoặc là ngày hiện tại nhưng thời gian trong tương lai
              (schedule.dayOfWeek === currentDay && 
                (scheduleHour > currentHour || 
                  (scheduleHour === currentHour && scheduleMinute > currentMinute)))
            ) {
              // Tìm thấy buổi học tiếp theo trong tuần này
              const daysToAdd = (schedule.dayOfWeek - currentDay + 7) % 7;
              nextClassDate = new Date(now);
              nextClassDate.setDate(now.getDate() + daysToAdd);
              nextClassDate.setHours(scheduleHour, scheduleMinute, 0, 0);
              foundNextClass = true;
              break;
            }
          }
          
          // Nếu không tìm thấy trong tuần này, lấy buổi học đầu tiên của tuần sau
          if (!foundNextClass && sortedSchedules.length > 0) {
            const firstSchedule = sortedSchedules[0];
            const [scheduleHour, scheduleMinute] = firstSchedule.startTime.split(':').map(Number);
            
            // Tính số ngày cần thêm để đến ngày tương ứng trong tuần tới
            const daysToAdd = (firstSchedule.dayOfWeek - currentDay + 7) % 7;
            
            // Nếu là cùng ngày trong tuần, cộng thêm 7 ngày để lấy tuần sau
            const actualDaysToAdd = (daysToAdd === 0) ? 7 : daysToAdd;
            
            nextClassDate = new Date(now);
            nextClassDate.setDate(now.getDate() + actualDaysToAdd);
            nextClassDate.setHours(scheduleHour, scheduleMinute, 0, 0);
          }
        }
        
        // Cập nhật thông tin lớp học từ API
        setClassDetail({
          ...emptyClassDetail, // Giữ lại thông báo và các thông tin khác chưa có trong API
          id: classroomData.classroomId,
          name: classroomData.name,
          subject: extractedSubject,
          description: classroomData.description,
          status: classroomData.isOnlineMeeting === 'Active' ? 'active' : 'inactive',
          schedule: formattedSchedule,
          time: formattedTime,
          nextClass: nextClassDate.toISOString(),
          classroomId: classroomData.classroomId,
          totalStudents: formattedStudents.length,
          students: formattedStudents,
          isOnlineMeetingActive: classroomData.isOnlineMeeting === 'Active'
        });
        
        // Cập nhật form chỉnh sửa
        setEditClassForm({
          className: classroomData.name,
          classSubject: extractedSubject,
          classDescription: classroomData.description.replace(/Môn học: .*?(\n\n|$)/, ''),
          schedules: [
            {
              day: 'Đang cập nhật',
              time: 'Đang cập nhật',
              id: 1
            }
          ]
        });
        
      } catch (error: any) {
        console.error('Lỗi khi lấy thông tin lớp học:', error);
        toast({
          variant: 'destructive',
          title: 'Lỗi',
          description: error.message || 'Không thể tải thông tin lớp học',
        });
      }
    };
    
    fetchClassData();
  }, [classId, toast]);

  // Helper functions
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getNextClassStatus = (nextClass: string) => {
    const now = new Date();
    const next = new Date(nextClass);
    const diffHours = (next.getTime() - now.getTime()) / (1000 * 60 * 60);
    const diffMinutes = (next.getTime() - now.getTime()) / (1000 * 60);
    
    if (diffHours < 0) {
      return { text: 'Đã kết thúc', color: 'text-gray-500' };
    }
    
    if (diffMinutes <= 30) {
      return { text: 'Sắp bắt đầu', color: 'text-amber-600' };
    }
    
    if (diffHours <= 1) {
      return { text: 'Trong vòng 1 giờ', color: 'text-amber-500' };
    }
    
    if (diffHours <= 24) {
      return { text: 'Trong ngày hôm nay', color: 'text-green-600' };
    }
    
    if (diffHours <= 48) {
      return { text: 'Trong ngày mai', color: 'text-blue-600' };
    }
    
    const daysUntil = Math.floor(diffHours / 24);
    if (daysUntil <= 7) {
      return { text: `Trong ${daysUntil} ngày tới`, color: 'text-blue-500' };
    }
    
    return { text: 'Sắp tới', color: 'text-blue-400' };
  };

  // Handler functions cho tab
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Update URL with tab parameter without full page reload
    const url = new URL(window.location.href);
    url.searchParams.set('tab', value);
    window.history.pushState({}, '', url);
  };

  // Check for tab parameter in URL when component mounts
  useEffect(() => {
    // Extract tab from URL if present
    const url = new URL(window.location.href);
    const tabParam = url.searchParams.get('tab');
    
    // List of valid tabs
    const validTabs = [
      'announcements', 
      'assignments', 
      'meeting', 
      'schedule', 
      'materials', 
      'students', 
      'analytics', 
      'settings'
    ];
    
    // Set active tab if valid
    if (tabParam && validTabs.includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, []);

  // Handlers cho cuộc họp trực tuyến
  const startMeeting = async () => {
    try {
      if (!classDetail.classroomId) {
        throw new Error('Không tìm thấy thông tin lớp học');
      }
      
      setIsLoadingMeeting(true);
      
      // Gọi API để cập nhật trạng thái buổi học trực tuyến
      await ClassroomService.updateClassroomStatus(classDetail.classroomId, 'Active');
      
      // Cập nhật state local
      setIsMeetingActive(true);
      setClassDetail({
        ...classDetail,
        isOnlineMeetingActive: true,
        status: 'active'
      });
      
      toast({
        title: 'Đã bắt đầu buổi học trực tuyến',
        description: 'Học sinh có thể tham gia ngay bây giờ',
      });
      
    } catch (error: any) {
      console.error('Lỗi khi bắt đầu buổi học trực tuyến:', error);
      toast({
        variant: "destructive",
        title: 'Lỗi khi bắt đầu buổi học',
        description: error.message || 'Không thể bắt đầu buổi học trực tuyến',
      });
    } finally {
      setIsLoadingMeeting(false);
    }
  };

  const endMeeting = async () => {
    try {
      if (!classDetail.classroomId) {
        throw new Error('Không tìm thấy thông tin lớp học');
      }
      
      setIsLoadingMeeting(true);
      
      // Gọi API để cập nhật trạng thái buổi học trực tuyến
      await ClassroomService.updateClassroomStatus(classDetail.classroomId, 'Inactive');
      
      // Cập nhật state local
      setIsMeetingActive(false);
      setClassDetail({
        ...classDetail,
        isOnlineMeetingActive: false,
        status: 'inactive'
      });
      
      toast({
        title: 'Đã kết thúc buổi học trực tuyến',
        description: 'Buổi học trực tuyến đã kết thúc thành công',
      });
      
    } catch (error: any) {
      console.error('Lỗi khi kết thúc buổi học trực tuyến:', error);
      toast({
        variant: "destructive",
        title: 'Lỗi khi kết thúc buổi học',
        description: error.message || 'Không thể kết thúc buổi học trực tuyến',
      });
    } finally {
      setIsLoadingMeeting(false);
    }
  };

  // Handlers cho lớp học
  const addStudentEmail = () => {
    if (!newStudentEmail.trim()) return;
    
    if (newStudentEmail && !studentsToAdd.includes(newStudentEmail)) {
      setStudentsToAdd([...studentsToAdd, newStudentEmail]);
      setNewStudentEmail('');
    }
  };

  const removeStudentEmail = (email: string) => {
    setStudentsToAdd(studentsToAdd.filter(e => e !== email));
  };

  const handleInviteStudents = () => {
    // This function is no longer needed since we're using direct API calls in the modal component
    // It's kept for backward compatibility
    console.log('Using direct API calls for student enrollment now');
  };

  const openEditClassModal = () => {
    setShowEditClassModal(true);
  };

  const handleUpdateClass = async (formData: any) => {
    try {
      // Formdata already contains the updated classroom info from the API
      // Just need to update the UI state
      setClassDetail({
        ...classDetail,
        name: formData.name,
        subject: formData.subject,
        description: formData.description,
        schedule: formData.schedules?.map((s: any) => s.day).join(', ') || classDetail.schedule,
        time: formData.schedules?.map((s: any) => s.time).join(', ') || classDetail.time
      });
      
      toast({
        title: 'Cập nhật thành công',
        description: 'Thông tin lớp học đã được cập nhật thành công!',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: error.message || 'Không thể cập nhật thông tin lớp học',
      });
    }
  };

  const handleSaveSchedule = () => {
    // API call để cập nhật lịch học
    
    setClassDetail({
      ...classDetail,
      schedule: scheduleForm.schedule,
      time: scheduleForm.time
    });
    
    toast({
      title: 'Đã cập nhật lịch học',
      description: 'Lịch học đã được cập nhật thành công',
    });
    
    setShowScheduleModal(false);
  };

  // Hàm cập nhật danh sách lịch học
  const handleSchedulesUpdated = (updatedSchedules: ClassSchedule[]) => {
    setClassSchedules(updatedSchedules);
    
    // Định dạng lịch học
    const dayNames = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
    const formattedSchedule = updatedSchedules.length > 0 
      ? Array.from(new Set(updatedSchedules.map(s => dayNames[s.dayOfWeek]))).join(', ')
      : '';
    
    const formattedTime = updatedSchedules.length > 0 
      ? Array.from(new Set(updatedSchedules.map(s => 
          `${s.startTime.substring(0, 5)}-${s.endTime.substring(0, 5)}`
        ))).join(', ')
      : '';
    
    // Tính thời gian buổi học tiếp theo dựa trên lịch học
    let nextClassDate = new Date(); // Mặc định là ngày hiện tại
    
    if (updatedSchedules.length > 0) {
      const now = new Date();
      const currentDay = now.getDay(); // 0 = Chủ nhật, 1 = Thứ 2, ...
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      // Sắp xếp lịch học theo thứ tự ngày trong tuần
      const sortedSchedules = [...updatedSchedules].sort((a, b) => {
        if (a.dayOfWeek !== b.dayOfWeek) {
          return a.dayOfWeek - b.dayOfWeek;
        }
        return a.startTime.localeCompare(b.startTime);
      });
      
      // Tìm buổi học tiếp theo
      let foundNextClass = false;
      
      // Đầu tiên tìm trong tuần hiện tại
      for (const schedule of sortedSchedules) {
        const [scheduleHour, scheduleMinute] = schedule.startTime.split(':').map(Number);
        
        if (
          // Nếu là ngày trong tương lai trong tuần này
          (schedule.dayOfWeek > currentDay) ||
          // Hoặc là ngày hiện tại nhưng thời gian trong tương lai
          (schedule.dayOfWeek === currentDay && 
            (scheduleHour > currentHour || 
              (scheduleHour === currentHour && scheduleMinute > currentMinute)))
        ) {
          // Tìm thấy buổi học tiếp theo trong tuần này
          const daysToAdd = (schedule.dayOfWeek - currentDay + 7) % 7;
          nextClassDate = new Date(now);
          nextClassDate.setDate(now.getDate() + daysToAdd);
          nextClassDate.setHours(scheduleHour, scheduleMinute, 0, 0);
          foundNextClass = true;
          break;
        }
      }
      
      // Nếu không tìm thấy trong tuần này, lấy buổi học đầu tiên của tuần sau
      if (!foundNextClass && sortedSchedules.length > 0) {
        const firstSchedule = sortedSchedules[0];
        const [scheduleHour, scheduleMinute] = firstSchedule.startTime.split(':').map(Number);
        
        // Tính số ngày cần thêm để đến ngày tương ứng trong tuần tới
        const daysToAdd = (firstSchedule.dayOfWeek - currentDay + 7) % 7;
        
        // Nếu là cùng ngày trong tuần, cộng thêm 7 ngày để lấy tuần sau
        const actualDaysToAdd = (daysToAdd === 0) ? 7 : daysToAdd;
        
        nextClassDate = new Date(now);
        nextClassDate.setDate(now.getDate() + actualDaysToAdd);
        nextClassDate.setHours(scheduleHour, scheduleMinute, 0, 0);
      }
    }
    
    // Cập nhật state với thông tin mới
    setClassDetail({
      ...classDetail,
      schedule: formattedSchedule,
      time: formattedTime,
      nextClass: nextClassDate.toISOString()
    });
  };

  return (
    <AuthGuard>
      <StudentAuthGuard
        resourceType="class"
        resourceId={classId}
      >
        <AnimatedPageWrapper>
          <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6 max-w-full md:max-w-7xl">
            <ClassDetailHeader 
              classDetail={classDetail}
            />
            
            <ClassInfoCards 
              classDetail={classDetail}
              formatDate={formatDate}
              getNextClassStatus={getNextClassStatus}
            />
            
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <ClassTabNav 
                activeTab={activeTab} 
                handleTabChange={handleTabChange} 
                role={role}
                isMeetingActive={isMeetingActive} 
              />
              
              <CustomTabsContent value="announcements" className="pt-3 sm:pt-6" transitionType="fade">
                <AnnouncementsTab 
                  classDetail={classDetail}
                  role={role}
                  userData={userData}
                  formatDate={formatDate}
                  teacher={teacherInfo}
                />
              </CustomTabsContent>
              
              <CustomTabsContent value="assignments" className="pt-3 sm:pt-6 space-y-3 sm:space-y-4" transitionType="slide">
                <AssignmentsTab 
                  classDetail={classDetail}
                  role={role}
                  formatDate={formatDate}
                  classId={params.id as string}
                />
              </CustomTabsContent>
              
              <CustomTabsContent value="meeting" className="pt-3 sm:pt-6" transitionType="scale">
                <OnlineMeetingTab 
                  classDetail={classDetail}
                  role={role}
                  isMeetingActive={isMeetingActive}
                  isLoadingMeeting={isLoadingMeeting}
                  startMeeting={startMeeting}
                  endMeeting={endMeeting}
                />
              </CustomTabsContent>
              
              <CustomTabsContent value="schedule" className="pt-3 sm:pt-6" transitionType="slide">
                <ScheduleTab 
                  classSchedules={classSchedules}
                  isLoading={isLoadingSchedules}
                  classId={classId}
                  role={role}
                  onAddSchedule={() => setShowScheduleModal(true)}
                />
              </CustomTabsContent>
              
              <CustomTabsContent value="materials" className="pt-3 sm:pt-6" transitionType="slide">
                <MaterialsTab 
                  classDetail={classDetail}
                  role={role}
                  formatDate={formatDate}
                />
              </CustomTabsContent>
              
              <CustomTabsContent value="students" className="pt-3 sm:pt-6" transitionType="fade">
                <StudentsTab 
                  classDetail={classDetail}
                  role={role}
                  setShowAddStudentModal={setShowAddStudentModal}
                />
              </CustomTabsContent>
            
              <CustomTabsContent value="settings" className="pt-3 sm:pt-6" transitionType="slideUp">
                <SettingsTab 
                  classDetail={classDetail}
                  openEditClassModal={openEditClassModal}
                  role={role}
                />
              </CustomTabsContent>
            </Tabs>
            
            <AddStudentModal
              isOpen={showAddStudentModal}
              setIsOpen={setShowAddStudentModal}
              newStudentEmail={newStudentEmail}
              setNewStudentEmail={setNewStudentEmail}
              studentsToAdd={studentsToAdd}
              setStudentsToAdd={setStudentsToAdd}
              addStudentEmail={addStudentEmail}
              removeStudentEmail={removeStudentEmail}
              handleInviteStudents={handleInviteStudents}
              classroomId={classDetail.classroomId || classId} 
            />
            
            <ClassFormModal
              isOpen={showEditClassModal}
              onOpenChange={setShowEditClassModal}
              onSubmitClass={handleUpdateClass}
              classDetail={classDetail}
              rawSchedules={classSchedules}
              mode="edit"
            />
            
            <ScheduleModal
              isOpen={showScheduleModal}
              setIsOpen={setShowScheduleModal}
              classId={classId}
              classSchedules={classSchedules}
              onSchedulesUpdated={handleSchedulesUpdated}
            />
          </div>
        </AnimatedPageWrapper>
      </StudentAuthGuard>
    </AuthGuard>
  );
}

// Component mới hiển thị lịch học
function ScheduleTab({ 
  classSchedules, 
  isLoading, 
  classId, 
  role, 
  onAddSchedule 
}: { 
  classSchedules: ClassSchedule[],
  isLoading: boolean,
  classId: string,
  role: string | null | undefined,
  onAddSchedule: () => void
}) {
  // Map số ngày trong tuần sang tên ngày
  const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  
  // Sắp xếp lịch học theo thứ tự ngày trong tuần
  const sortedSchedules = [...classSchedules].sort((a, b) => {
    // Sắp xếp theo ngày trong tuần trước
    if (a.dayOfWeek !== b.dayOfWeek) {
      return a.dayOfWeek - b.dayOfWeek;
    }
    // Nếu cùng ngày, sắp xếp theo giờ bắt đầu
    return a.startTime.localeCompare(b.startTime);
  });
  
  // Tạo toast để hiển thị thông báo
  const { toast } = useToast();
  
  // Xử lý xóa lịch học
  const handleDeleteSchedule = async (scheduleId: string) => {
    try {
      await ClassroomService.deleteClassSchedule(scheduleId);
      // Cập nhật UI sau khi xóa
      toast({
        title: 'Thành công',
        description: 'Đã xóa lịch học',
      });
      // Gọi hàm để refresh lịch học từ component cha
      onAddSchedule();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: error.message || 'Không thể xóa lịch học',
      });
    }
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lịch học</CardTitle>
          <CardDescription>Đang tải lịch học...</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between items-center p-4 border rounded-lg">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Lịch học</CardTitle>
          <CardDescription>Quản lý lịch học của lớp</CardDescription>
        </div>
        {role === 'Teacher' && (
          <Button onClick={onAddSchedule} className="ml-auto">
            <Plus className="mr-2 h-4 w-4" />
            Thêm lịch học
          </Button>
        )}
      </CardHeader>
      <CardContent className="grid gap-4">
        {sortedSchedules.length > 0 ? (
          sortedSchedules.map((schedule) => (
            <div key={schedule.classScheduleId} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-lg hover:bg-accent/50 transition-all duration-200">
              <div className="flex items-center mb-2 md:mb-0">
                <Badge variant="outline" className="mr-2">
                  {dayNames[schedule.dayOfWeek]}
                </Badge>
                <span className="text-sm font-medium">
                  {schedule.startTime.substring(0, 5)} - {schedule.endTime.substring(0, 5)}
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-xs text-muted-foreground mr-4">
                  ID: {schedule.classScheduleId.substring(0, 8)}...
                </span>
                {role === 'Teacher' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteSchedule(schedule.classScheduleId)}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <div className="flex justify-center mb-4">
              <Calendar className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-1">Chưa có lịch học</h3>
            <p className="text-sm text-muted-foreground">
              {role === 'Teacher' 
                ? 'Hãy thiết lập lịch học cho lớp này bằng cách nhấn nút "Thêm lịch học"'
                : 'Lớp học này chưa có lịch học được thiết lập'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Components thêm
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Trash2, Calendar } from 'lucide-react';