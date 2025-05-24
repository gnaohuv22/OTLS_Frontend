'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckSquare, FileText, GraduationCap, BarChart3, Clock, ScrollText, Users2, Video, LucideIcon, AlertCircle
} from 'lucide-react';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { 
  ClassroomService, 
  Classroom, 
  ClassSchedule,
  ClassroomTeacher 
} from '@/lib/api/classes';
import { 
  getAssignmentsByClassId, 
  getSubmissionsByUserId
} from '@/lib/api/assignment';
import { format, parseISO, isAfter } from 'date-fns';
import { vi } from 'date-fns/locale';

// Định nghĩa SubmissionType đầy đủ từ dữ liệu API
type SubmissionType = {
  submissionId: string;
  assignmentId: string;
  submittedAt: string;
  status: string;
  grade: number;
  feedback: string;
  answers: Record<string, string>;
  textContent: string;
  isDelete: boolean;
  createdAt: string;
  updatedAt: string;
};

// --- Types ---
interface UpcomingClass {
  id: string;
  subject: string;
  topic: string;
  time: string;
  date: string;
  teacher: string;
}

interface PendingAssignment {
  id: string;
  subject: string;
  title: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed';
  progress: number;
}

interface CourseProgressData {
  id: string;
  subject: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
}

// --- Reusable Components ---

// Overview Stat Card
interface OverviewStatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
}

const OverviewStatCard: React.FC<OverviewStatCardProps> = React.memo(({ title, value, description, icon: Icon }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
});
OverviewStatCard.displayName = 'OverviewStatCard';

// Upcoming Class Item
interface UpcomingClassItemProps {
  classItem: UpcomingClass;
}
const UpcomingClassItem: React.FC<UpcomingClassItemProps> = React.memo(({ classItem }) => {
  return (
    <div className="flex flex-col space-y-2 rounded-lg border p-3">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">{classItem.subject}</h4>
        <Badge variant="outline">{classItem.date}</Badge>
      </div>
      <p className="text-sm text-muted-foreground">{classItem.topic}</p>
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3 text-muted-foreground" />
          <span>{classItem.time}</span>
        </div>
        <div className="flex items-center gap-1">
          <Users2 className="h-3 w-3 text-muted-foreground" />
          <span>{classItem.teacher}</span>
        </div>
      </div>
      <div className="flex justify-between pt-2">
        <Link href={`/classes/${classItem.id}/materials`}>
          <Button variant="outline" size="sm" className="w-full gap-1 mr-1">
            <FileText className="h-3 w-3" />
            Tài liệu
          </Button>
        </Link>
        <Link href={`/classes/${classItem.id}/meeting`}>
          <Button size="sm" className="w-full gap-1 ml-1">
            <Video className="h-3 w-3" />
            Tham gia
          </Button>
        </Link>
      </div>
    </div>
  );
});
UpcomingClassItem.displayName = 'UpcomingClassItem';

// Pending Assignment Item
interface PendingAssignmentItemProps {
  assignment: PendingAssignment;
}
const PendingAssignmentItem: React.FC<PendingAssignmentItemProps> = React.memo(({ assignment }) => {
  const getStatusBadgeVariant = (status: PendingAssignment['status']): "secondary" | "outline" => {
    return status === 'completed' || status === 'in-progress' ? "secondary" : "outline";
  };

  const getStatusText = (status: PendingAssignment['status']): string => {
    if (status === 'completed') return 'Đã hoàn thành';
    if (status === 'in-progress') return 'Đang thực hiện';
    return 'Chưa bắt đầu';
  };

  const getButtonText = (status: PendingAssignment['status']): string => {
    return status === 'completed' ? 'Xem lại' : 'Làm bài tập';
  };

  const getButtonVariant = (status: PendingAssignment['status']): "outline" | "default" => {
    return status === 'completed' ? "outline" : "default";
  };

  return (
    <div className="flex flex-col space-y-2 rounded-lg border p-3">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">{assignment.subject}</h4>
        <Badge variant={getStatusBadgeVariant(assignment.status)}>
          {getStatusText(assignment.status)}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground">{assignment.title}</p>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Tiến độ</span>
          <span className="text-muted-foreground">Hạn nộp: {assignment.dueDate}</span>
        </div>
        <Progress value={assignment.progress} className="h-2" />
      </div>
      <Link href={`/assignments/${assignment.id}`}>
        <Button size="sm" variant={getButtonVariant(assignment.status)} className="w-full">
          {getButtonText(assignment.status)}
        </Button>
      </Link>
    </div>
  );
});
PendingAssignmentItem.displayName = 'PendingAssignmentItem';

// Course Progress Item
interface CourseProgressItemProps {
  course: CourseProgressData;
}
const CourseProgressItem: React.FC<CourseProgressItemProps> = React.memo(({ course }) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">{course.subject}</h4>
        <span className="font-medium">{course.progress}%</span>
      </div>
      <div className="space-y-2">
        <Progress value={course.progress} className="h-2" />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Đã hoàn thành {course.completedLessons} / {course.totalLessons} bài học</span>
          <Link href={`/classes/${course.id}/progress`} className="text-primary hover:underline">
            Xem chi tiết
          </Link>
        </div>
      </div>
    </div>
  );
});
CourseProgressItem.displayName = 'CourseProgressItem';

// Error Display Component
interface ErrorDisplayProps {
  message: string;
}
const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message }) => (
  <div className="flex flex-col items-center justify-center p-6 bg-red-50 border border-red-200 rounded-lg">
    <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
    <p className="text-red-600 text-center">{message}</p>
  </div>
);

// Empty State Component
interface EmptyStateProps {
  message: string;
  icon?: LucideIcon;
}
const EmptyState: React.FC<EmptyStateProps> = ({ message, icon: Icon }) => (
  <div className="flex flex-col items-center justify-center p-6 bg-muted/20 border border-muted rounded-lg">
    {Icon && <Icon className="h-8 w-8 text-muted-foreground mb-2" />}
    <p className="text-muted-foreground text-center">{message}</p>
  </div>
);


// --- Main Student Dashboard Component ---
export function StudentDashboard() {
  const { userData } = useAuth();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [upcomingClasses, setUpcomingClasses] = useState<UpcomingClass[]>([]);
  const [pendingAssignments, setPendingAssignments] = useState<PendingAssignment[]>([]);
  const [courseProgress, setCourseProgress] = useState<CourseProgressData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submissions, setSubmissions] = useState<SubmissionType[]>([]);
  const [todayClassesCount, setTodayClassesCount] = useState<number>(0);
  const [pendingAssignmentsCount, setPendingAssignmentsCount] = useState<number>(0);
  const [averageProgress, setAverageProgress] = useState<number>(0);
  const [averageScore, setAverageScore] = useState<number>(0);

  // Process classroom data to populate dashboard
  const processClassroomData = useCallback(async (
    studentClassrooms: Classroom[], 
    userSubmissions: SubmissionType[]
  ) => {
    try {
      if (!studentClassrooms.length) return;

      const upcomingClassesList: UpcomingClass[] = [];
      const pendingAssignmentsList: PendingAssignment[] = [];
      const courseProgressList: CourseProgressData[] = [];
      let todayClassesCounter = 0;
      let totalCompletedLessons = 0;
      let totalLessons = 0;
      let pendingCounter = 0;
      let totalSubmissionGrades = 0;
      let submissionCount = 0;

      // Process each classroom
      for (const classroom of studentClassrooms) {
        // 1. Get classroom schedules
        const schedules = await ClassroomService.getSchedulesByClassroomId(classroom.classroomId);
        
        // 2. Process schedules to find upcoming classes
        const todaySchedules = processSchedules(classroom, schedules, upcomingClassesList);
        todayClassesCounter += todaySchedules;
        
        // 3. Get assignments for this classroom
        const assignmentsResponse = await getAssignmentsByClassId(classroom.classroomId);
        const assignments = assignmentsResponse.data?.assignments || [];
        
        // 4. Process assignments and match with student's submissions
        const pendingAssignmentsCount = processAssignments(
          classroom, 
          assignments, 
          userSubmissions, 
          pendingAssignmentsList
        );
        pendingCounter += pendingAssignmentsCount;
        
        // 5. Calculate course progress
        const progress = calculateCourseProgress(classroom, assignments, userSubmissions);
        courseProgressList.push(progress);
        
        // Track lesson completion for average calculation
        totalCompletedLessons += progress.completedLessons;
        totalLessons += progress.totalLessons;
        
        // Calculate grades from submissions for this classroom
        userSubmissions.forEach(submission => {
          // Check if submission belongs to an assignment in this classroom
          const matchingAssignment = assignments.find(a => a.assignmentId === submission.assignmentId);
          if (matchingAssignment && submission.grade > 0) {
            totalSubmissionGrades += submission.grade;
            submissionCount++;
          }
        });
      }

      // Update state with processed data
      setUpcomingClasses(upcomingClassesList);
      setPendingAssignments(pendingAssignmentsList);
      setCourseProgress(courseProgressList);
      
      // Update overview stats
      setTodayClassesCount(todayClassesCounter);
      setPendingAssignmentsCount(pendingCounter);
      
      // Calculate average progress
      const avgProgress = totalLessons > 0 
        ? Math.round((totalCompletedLessons / totalLessons) * 100) 
        : 0;
      setAverageProgress(avgProgress);
      
      // Calculate average score
      const avgScore = submissionCount > 0 
        ? parseFloat((totalSubmissionGrades / submissionCount).toFixed(1)) 
        : 0;
      setAverageScore(avgScore);

    } catch (err: any) {
      console.error('Error processing classroom data:', err);
    }
  }, [
    setUpcomingClasses,
    setPendingAssignments,
    setCourseProgress,
    setTodayClassesCount,
    setPendingAssignmentsCount,
    setAverageProgress,
    setAverageScore
  ]);

  // Fetch student's classrooms and data
  useEffect(() => {
    const fetchStudentData = async () => {
      if (!userData?.userID) return;

      try {
        setLoading(true);
        
        // 1. Fetch classrooms this student is enrolled in
        const studentClassrooms = await ClassroomService.getClassroomsByStudentId(userData.userID);
        setClassrooms(studentClassrooms);
        
        // 2. Fetch student's submissions for assignments
        const submissionsResponse = await getSubmissionsByUserId(userData.userID);
        const userSubmissions = submissionsResponse.data?.submissions || [];
        setSubmissions(userSubmissions);
        
        // Process data for dashboard components
        await processClassroomData(studentClassrooms, userSubmissions);
        
      } catch (err: any) {
        console.error('Error fetching student data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [userData?.userID, processClassroomData]);

  // Helper function to process schedules and create upcoming classes
  const processSchedules = (
    classroom: Classroom,
    schedules: ClassSchedule[],
    upcomingClassesList: UpcomingClass[]
  ): number => {
    // Get today's day of week (0-6, where 0 is Sunday)
    const today = new Date().getDay();
    const tomorrow = (today + 1) % 7;
    let todaySchedulesCount = 0;
    
    // Find today's and tomorrow's schedules
    schedules.forEach(schedule => {
      const scheduleDay = schedule.dayOfWeek;
      // Check if schedule is for today or tomorrow
      if (scheduleDay === today || scheduleDay === tomorrow) {
        const date = scheduleDay === today ? 'Hôm nay' : 'Ngày mai';
        
        // Count today's classes
        if (scheduleDay === today) {
          todaySchedulesCount++;
        }
        
        // Get teacher name (or use placeholder if not available)
        let teacherName = 'Giáo viên';
        if (classroom.users) {
          teacherName = classroom.users.fullName || classroom.users.userName;
        }
        
        upcomingClassesList.push({
          id: classroom.classroomId,
          subject: classroom.name,
          topic: classroom.description || 'Chương trình học',
          time: `${schedule.startTime} - ${schedule.endTime}`,
          date,
          teacher: teacherName
        });
      }
    });
    
    return todaySchedulesCount;
  };

  // Helper function to process assignments and match with submissions
  const processAssignments = (
    classroom: Classroom,
    assignments: any[],
    userSubmissions: SubmissionType[],
    pendingAssignmentsList: PendingAssignment[]
  ): number => {
    let pendingCount = 0;
    
    // Process each assignment
    assignments.forEach(assignment => {
      // Find matching submission for this assignment
      const submission = userSubmissions.find(s => s.assignmentId === assignment.assignmentId);
      
      // Determine assignment status and progress
      let status: 'pending' | 'in-progress' | 'completed' = 'pending';
      let progress = 0;
      
      if (submission) {
        // If there's a submission, check its status
        if (submission.status.toLowerCase() === 'completed') {
          status = 'completed';
          progress = 100;
        } else {
          status = 'in-progress';
          progress = 50; // Assume 50% progress if in-progress
        }
      } else {
        // If no submission, it's pending
        status = 'pending';
        progress = 0;
        pendingCount++; // Count pending assignments
      }
      
      // Get due date
      const dueDate = parseISO(assignment.dueDate);
      const formattedDueDate = format(dueDate, 'dd/MM/yyyy');
      
      // Only add to pending list if not completed
      if (status !== 'completed') {
        pendingAssignmentsList.push({
          id: assignment.assignmentId,
          subject: classroom.name,
          title: assignment.title,
          dueDate: formattedDueDate,
          status,
          progress
        });
      }
    });
    
    return pendingCount;
  };

  // Helper function to calculate course progress
  const calculateCourseProgress = (
    classroom: Classroom,
    assignments: any[],
    userSubmissions: SubmissionType[]
  ): CourseProgressData => {
    const totalLessons = assignments.length;
    let completedLessons = 0;
    
    // Count completed assignments
    assignments.forEach(assignment => {
      const submission = userSubmissions.find(s => s.assignmentId === assignment.assignmentId);
      if (submission && submission.status.toLowerCase() === 'completed') {
        completedLessons++;
      }
    });
    
    // Calculate progress percentage
    const progress = totalLessons > 0 
      ? Math.round((completedLessons / totalLessons) * 100) 
      : 0;
    
    return {
      id: classroom.classroomId,
      subject: classroom.name,
      progress,
      totalLessons,
      completedLessons
    };
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Empty state (no classrooms)
  if (classrooms.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Bảng điều khiển Học sinh</h1>
        <EmptyState 
          message="Bạn chưa được ghi danh vào lớp học nào. Vui lòng liên hệ giáo viên hoặc quản trị viên." 
          icon={GraduationCap} 
        />
      </div>
    );
  }

  // Create overview stats data
  const overviewStatsData = [
    { 
      title: "Lớp học hôm nay", 
      value: todayClassesCount, 
      description: `${classrooms.length} lớp đã đăng ký`, 
      icon: GraduationCap 
    },
    { 
      title: "Bài tập đang chờ", 
      value: pendingAssignmentsCount, 
      description: pendingAssignmentsCount > 0 ? "Cần hoàn thành sớm" : "Đã hoàn thành tất cả", 
      icon: CheckSquare 
    },
    { 
      title: "Tiến độ", 
      value: `${averageProgress}%`, 
      description: "Trung bình các khóa học", 
      icon: BarChart3 
    },
    { 
      title: "Điểm số", 
      value: averageScore, 
      description: "Điểm trung bình", 
      icon: ScrollText 
    },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Bảng điều khiển Học sinh</h1>
      
      {/* Overview Section */}
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Tổng quan</CardTitle>
          <CardDescription>
            Chào mừng {userData?.fullName || 'học sinh'} quay trở lại! Đây là tổng quan các hoạt động học tập của bạn.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {overviewStatsData.map((stat, index) => (
              <OverviewStatCard
                key={stat.title + index}
                title={stat.title}
                value={stat.value}
                description={stat.description}
                icon={stat.icon}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Classes & Assignments Section */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Upcoming Classes Card */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Lớp học sắp diễn ra</CardTitle>
            <CardDescription>Các lớp học trong 2 ngày tới</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingClasses.length > 0 ? (
                upcomingClasses.slice(0, 3).map((classItem, index) => (
                  <UpcomingClassItem
                    key={`${classItem.id}-${index}`}
                    classItem={classItem}
                  />
                ))
              ) : (
                <EmptyState message="Không có lớp học nào trong 2 ngày tới" icon={GraduationCap} />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pending Assignments Card */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Bài tập cần làm</CardTitle>
            <CardDescription>Các bài tập sắp đến hạn</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingAssignments.length > 0 ? (
                pendingAssignments.slice(0, 3).map((assignment, index) => (
                  <PendingAssignmentItem
                    key={`${assignment.id}-${index}`}
                    assignment={assignment}
                  />
                ))
              ) : (
                <EmptyState message="Không có bài tập nào đang chờ xử lý" icon={CheckSquare} />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Tiến độ khóa học</CardTitle>
          <CardDescription>Theo dõi tiến độ học tập của bạn</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {courseProgress.length > 0 ? (
              courseProgress.map((course, index) => (
                <CourseProgressItem
                  key={`${course.id}-${index}`}
                  course={course}
                />
              ))
            ) : (
              <EmptyState message="Chưa có dữ liệu tiến độ khóa học" icon={BarChart3} />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}