'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    CheckSquare, GraduationCap, BarChart3, Users2, Video, Plus, LucideIcon, AlertCircle
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
  ClassroomStudent 
} from '@/lib/api/classes';
import { format, isToday, parseISO, isTomorrow, addDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import { getAssignmentsByClassId, getSubmissionsByAssignmentId } from '@/lib/api/assignment';
import { UserService } from '@/lib/api/user';
import { HolidayService } from '@/lib/api/holidays';

// --- Types ---
interface TeacherUpcomingClass {
    id: string;
    subject: string;
    topic: string;
    time: string;
    date: string;
    students: number;
}

interface TeacherPendingAssignment {
    id: string;
    subject: string;
    title: string;
    dueDate: string;
    classId: string;
    className: string;
    submitted: number;
    total: number;
}

interface RecentActivity {
    id: string;
    type: 'assignment' | 'class' | 'material'; 
    description: string;
    time: string;
    class: string;
}

interface ClassPerformance {
    id: string;
    name: string;
    avgScore: number;
    attendance: number;
    submissions: number;
    students: number;
}

// --- Reusable Components ---
interface OverviewStatCardProps {
    title: string;
    value: string | number;
    description: string;
    icon: LucideIcon;
}

const OverviewStatCard: React.FC<OverviewStatCardProps> = React.memo(({ title, value, description, icon: Icon }) => (
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
));
OverviewStatCard.displayName = 'OverviewStatCard';

// Teacher Upcoming Class Item
interface TeacherUpcomingClassItemProps {
    classInfo: TeacherUpcomingClass;
}
const TeacherUpcomingClassItem: React.FC<TeacherUpcomingClassItemProps> = React.memo(({ classInfo }) => {
    return (
        <div className="flex flex-col space-y-2 rounded-lg border p-3">
            <div className="flex items-center justify-between">
                <h4 className="font-semibold">{classInfo.subject}</h4>
                <Badge variant="outline">{classInfo.time}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{classInfo.topic}</p>
            <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{classInfo.students} học sinh</span>
                <span className="text-muted-foreground">{classInfo.date}</span>
            </div>
            <Link href={`/classes/${classInfo.id}/meeting`}>
                <Button size="sm" className="w-full gap-2">
                    <Video className="h-4 w-4" />
                    Bắt đầu học
                </Button>
            </Link>
        </div>
    );
});
TeacherUpcomingClassItem.displayName = 'TeacherUpcomingClassItem';

// Teacher Pending Assignment Item
interface TeacherPendingAssignmentItemProps {
    assignment: TeacherPendingAssignment;
}
const TeacherPendingAssignmentItem: React.FC<TeacherPendingAssignmentItemProps> = React.memo(({ assignment }) => {
    const submissionProgress = assignment.total > 0 ? (assignment.submitted / assignment.total) * 100 : 0;
    return (
        <div className="flex flex-col space-y-2 rounded-lg border p-3">
            <div className="flex items-center justify-between">
                <h4 className="font-semibold">{assignment.subject}</h4>
                <Badge variant="secondary">{assignment.className}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{assignment.title}</p>
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Đã nộp: {assignment.submitted}/{assignment.total}</span>
                    <span className="text-muted-foreground">Hạn nộp: {assignment.dueDate}</span>
                </div>
                <Progress value={submissionProgress} className="h-2" />
            </div>
            <Link href={`/assignments/${assignment.id}`}>
                <Button size="sm" variant="outline" className="w-full">Chấm bài</Button>
            </Link>
        </div>
    );
});
TeacherPendingAssignmentItem.displayName = 'TeacherPendingAssignmentItem';

// Recent Activity Item
interface RecentActivityItemProps {
    activity: RecentActivity;
}
const RecentActivityItem: React.FC<RecentActivityItemProps> = React.memo(({ activity }) => {
    return (
        <div className="flex flex-col space-y-1 rounded-lg border p-3">
            <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">{activity.class}</h4>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
            </div>
            <p className="text-sm text-muted-foreground">{activity.description}</p>
        </div>
    );
});
RecentActivityItem.displayName = 'RecentActivityItem';

// Class Performance Item
interface ClassPerformanceItemProps {
    classData: ClassPerformance;
}
const ClassPerformanceItem: React.FC<ClassPerformanceItemProps> = React.memo(({ classData }) => {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h4 className="font-medium">{classData.name} <span className="text-sm font-normal text-muted-foreground">({classData.students} học sinh)</span></h4>
                <span className="font-medium text-sm">Điểm TB: {classData.avgScore}</span>
            </div>
            <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                    <span>Đi học đầy đủ</span>
                    <span>{classData.attendance}%</span>
                </div>
                <Progress value={classData.attendance} className="h-2" />
                <div className="flex items-center justify-between text-sm">
                    <span>Hoàn thành bài tập</span>
                    <span>{classData.submissions}%</span>
                </div>
                <Progress value={classData.submissions} className="h-2" />
            </div>
            <Link href={`/classes/${classData.id}/performance`}>
                <Button size="sm" variant="link" className="p-0 h-auto">Xem chi tiết</Button>
            </Link>
        </div>
    );
});
ClassPerformanceItem.displayName = 'ClassPerformanceItem';

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

// --- Main Teacher Dashboard Component ---
export function TeacherDashboard() {
    const { userData } = useAuth();
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [upcomingClasses, setUpcomingClasses] = useState<TeacherUpcomingClass[]>([]);
    const [pendingAssignments, setPendingAssignments] = useState<TeacherPendingAssignment[]>([]);
    const [classPerformance, setClassPerformance] = useState<ClassPerformance[]>([]);
    const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [holidays, setHolidays] = useState<any[]>([]);
    const [totalStudents, setTotalStudents] = useState<number>(0);

    // Helper function to get relative time string
    const getRelativeTime = useCallback((date: Date): string => {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        
        if (diffMins < 60) {
            return `${diffMins} phút trước`;
        } else if (diffMins < 24 * 60) {
            const diffHours = Math.floor(diffMins / 60);
            return `${diffHours} giờ trước`;
        } else {
            const diffDays = Math.floor(diffMins / (60 * 24));
            return `${diffDays} ngày trước`;
        }
    }, []);

    // Helper function to generate recent activities
    const generateRecentActivities = useCallback((
        classroom: Classroom,
        assignments: any[],
        schedules: ClassSchedule[],
        recentActivitiesList: RecentActivity[]
    ) => {
        // Sort assignments by createdAt date (newest first)
        const sortedAssignments = [...assignments].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        // Take the most recent assignment (if any)
        if (sortedAssignments.length > 0) {
            const recentAssignment = sortedAssignments[0];
            const createdAt = parseISO(recentAssignment.createdAt);
            
            recentActivitiesList.push({
                id: `assignment-${recentAssignment.assignmentId}-${classroom.classroomId}-${Date.now()}`,
                type: 'assignment',
                description: `Đã đăng bài tập mới "${recentAssignment.title}"`,
                time: getRelativeTime(createdAt),
                class: classroom.name
            });
        }
        
        // Add a recent class activity if there was a recent schedule
        if (schedules.length > 0) {
            recentActivitiesList.push({
                id: `class-${classroom.classroomId}-${Date.now()}`,
                type: 'class',
                description: `Lớp học "${classroom.name}" đã được cập nhật lịch học`,
                time: 'Gần đây',
                class: classroom.name
            });
        }
    }, [getRelativeTime]);

    // Process classroom data to create dashboard components
    const processClassroomData = useCallback(async (teacherClassrooms: Classroom[]) => {
        try {
            if (!teacherClassrooms.length) return;

            // Initialize empty arrays for various dashboard components
            const upcomingClassesList: TeacherUpcomingClass[] = [];
            const pendingAssignmentsList: TeacherPendingAssignment[] = [];
            const classPerformanceList: ClassPerformance[] = [];
            const recentActivitiesList: RecentActivity[] = [];
            let totalStudentsCount = 0;

            // Process each classroom
            for (const classroom of teacherClassrooms) {
                // 1. Get classroom schedules
                const schedules = await ClassroomService.getSchedulesByClassroomId(classroom.classroomId);
                
                // 2. Get classroom students
                const students = await ClassroomService.getStudentsByClassroomId(classroom.classroomId);
                totalStudentsCount += students.length;
                
                // 3. Get assignments for this classroom
                const assignmentsResponse = await getAssignmentsByClassId(classroom.classroomId);
                const assignments = assignmentsResponse.data?.assignments || [];
                
                // 4. Process schedules to find upcoming classes
                processSchedules(classroom, schedules, students, upcomingClassesList);
                
                // 5. Process assignments to find pending ones
                processAssignments(classroom, assignments, students, pendingAssignmentsList);
                
                // 6. Calculate class performance metrics
                processClassPerformance(classroom, students, assignments, classPerformanceList);
                
                // 7. Generate recent activities based on assignments and schedules
                generateRecentActivities(classroom, assignments, schedules, recentActivitiesList);
            }

            // Update state with processed data
            setUpcomingClasses(upcomingClassesList);
            setPendingAssignments(pendingAssignmentsList);
            setClassPerformance(classPerformanceList);
            setRecentActivities(recentActivitiesList);
            setTotalStudents(totalStudentsCount);

        } catch (err: any) {
            console.error('Error processing classroom data:', err);
        }
    }, [
        setUpcomingClasses,
        setPendingAssignments,
        setClassPerformance,
        setRecentActivities,
        setTotalStudents,
        generateRecentActivities
    ]);

    // Fetch teacher's classrooms and data
    useEffect(() => {
        const fetchTeacherData = async () => {
            if (!userData?.userID) return;

            try {
                setLoading(true);
                // Fetch classrooms where this user is a teacher
                const teacherClassrooms = await ClassroomService.getClassroomsByTeacherId(userData.userID);
                setClassrooms(teacherClassrooms);

                // Fetch holidays (for schedule planning)
                const upcomingHolidays = await HolidayService.getUpcomingHolidays();
                setHolidays(upcomingHolidays);

                // Process the data for dashboard components
                await processClassroomData(teacherClassrooms);
            } catch (err: any) {
                console.error('Error fetching teacher data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchTeacherData();
    }, [userData?.userID, processClassroomData]);

    // Helper function to process schedules and create upcoming classes
    const processSchedules = (
        classroom: Classroom,
        schedules: ClassSchedule[],
        students: ClassroomStudent[],
        upcomingClassesList: TeacherUpcomingClass[]
    ) => {
        // Get today's day of week (0-6, where 0 is Sunday)
        const today = new Date().getDay();
        const tomorrow = (today + 1) % 7;
        
        // Find today's and tomorrow's schedules
        schedules.forEach(schedule => {
            const scheduleDay = schedule.dayOfWeek;
            // Check if schedule is for today or tomorrow
            if (scheduleDay === today || scheduleDay === tomorrow) {
                const date = scheduleDay === today ? 'Hôm nay' : 'Ngày mai';
                upcomingClassesList.push({
                    id: classroom.classroomId,
                    subject: classroom.name,
                    topic: classroom.description || 'Chương trình học',
                    time: `${schedule.startTime} - ${schedule.endTime}`,
                    date,
                    students: students.length
                });
            }
        });
    };

    // Helper function to process assignments
    const processAssignments = async (
        classroom: Classroom,
        assignments: any[],
        students: ClassroomStudent[],
        pendingAssignmentsList: TeacherPendingAssignment[]
    ) => {
        // Find assignments that are pending (due date in the future)
        const now = new Date();
        
        for (const assignment of assignments) {
            const dueDate = parseISO(assignment.dueDate);
            if (dueDate > now) {
                // Get actual submission data for this assignment
                try {
                    const submissionsResponse = await getSubmissionsByAssignmentId(assignment.assignmentId);
                    const submissions = submissionsResponse.data?.submissions || [];
                    
                    // Count how many students have submitted this assignment
                    const submittedCount = submissions.length;
                    
                    pendingAssignmentsList.push({
                        id: assignment.assignmentId,
                        subject: assignment.title,
                        title: assignment.description,
                        dueDate: format(dueDate, 'dd/MM/yyyy'),
                        classId: classroom.classroomId,
                        className: classroom.name,
                        submitted: submittedCount,
                        total: students.length
                    });
                } catch (err) {
                    console.error(`Error fetching submissions for assignment ${assignment.assignmentId}:`, err);
                    // Fall back to adding the assignment without submission data
                    pendingAssignmentsList.push({
                        id: assignment.assignmentId,
                        subject: assignment.title,
                        title: assignment.description,
                        dueDate: format(dueDate, 'dd/MM/yyyy'),
                        classId: classroom.classroomId,
                        className: classroom.name,
                        submitted: 0,
                        total: students.length
                    });
                }
            }
        }
    };

    // Helper function to calculate class performance metrics
    const processClassPerformance = async (
        classroom: Classroom,
        students: ClassroomStudent[],
        assignments: any[],
        classPerformanceList: ClassPerformance[]
    ) => {
        try {
            let totalGrade = 0;
            let totalSubmissions = 0;
            let gradedSubmissionCount = 0;
            
            // Get all submissions for this classroom's assignments
            for (const assignment of assignments) {
                try {
                    const submissionsResponse = await getSubmissionsByAssignmentId(assignment.assignmentId);
                    const submissions = submissionsResponse.data?.submissions || [];
                    
                    // Count submissions and calculate average grade
                    submissions.forEach((submission: any) => {
                        totalSubmissions++;
                        if (submission.grade > 0) {
                            totalGrade += submission.grade;
                            gradedSubmissionCount++;
                        }
                    });
                } catch (err) {
                    console.error(`Error fetching submissions for assignment ${assignment.assignmentId}:`, err);
                }
            }
            
            // Calculate performance metrics
            const avgScore = gradedSubmissionCount > 0 
                ? parseFloat((totalGrade / gradedSubmissionCount).toFixed(1)) 
                : 0;
                
            // Calculate submission rate (percentage of possible submissions that were made)
            const possibleSubmissions = students.length * assignments.length;
            const submissionRate = possibleSubmissions > 0 
                ? Math.floor((totalSubmissions / possibleSubmissions) * 100) 
                : 0;
                
            // Simulate attendance rate (since we don't have actual attendance data)
            // In a real implementation, you would fetch this from an attendance API
            const attendance = Math.floor(85 + Math.random() * 15);
            
            classPerformanceList.push({
                id: classroom.classroomId,
                name: classroom.name,
                avgScore: avgScore,
                attendance: attendance,
                submissions: submissionRate,
                students: students.length
            });
        } catch (err) {
            console.error(`Error processing performance for classroom ${classroom.classroomId}:`, err);
            // Fall back to simulated data
            classPerformanceList.push({
                id: classroom.classroomId,
                name: classroom.name,
                avgScore: 0,
                attendance: 0,
                submissions: 0,
                students: students.length
            });
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Calculate overview stats
    const todayClassesCount = upcomingClasses.filter(c => c.date === 'Hôm nay').length;
    const weekClassesCount = classrooms.length; // Assuming each classroom has at least one session per week
    const pendingAssignmentsCount = pendingAssignments.length;
    
    // For average score, we'll use the average of all class performance scores
    const avgScore = classPerformance.length > 0
        ? parseFloat((classPerformance.reduce((sum, c) => sum + c.avgScore, 0) / classPerformance.length).toFixed(1))
        : 0;

    const overviewStatsData = [
        { 
            title: "Lớp học hôm nay", 
            value: todayClassesCount, 
            description: `${weekClassesCount} lớp trong tuần này`, 
            icon: GraduationCap 
        },
        { 
            title: "Bài tập cần chấm", 
            value: pendingAssignmentsCount, 
            description: "Đang chờ học sinh nộp bài", 
            icon: CheckSquare 
        },
        { 
            title: "Tổng số học sinh", 
            value: totalStudents, 
            description: `Trong ${classrooms.length} lớp`, 
            icon: Users2 
        },
        { 
            title: "Điểm trung bình", 
            value: avgScore, 
            description: "Trung bình các lớp", 
            icon: BarChart3 
        },
    ];

    // Render dashboard
    return (
        <div className="space-y-6">
            {/* Header Action Button */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold">Bảng điều khiển Giáo viên</h1>
                <Link href="/assignments/create">
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Tạo bài tập mới
                    </Button>
                </Link>
            </div>

            {/* Overview Section */}
            <Card className="col-span-full">
                <CardHeader>
                    <CardTitle>Tổng quan</CardTitle>
                    <CardDescription>
                        Chào mừng {userData?.fullName || 'giáo viên'} quay trở lại! Đây là tổng quan các hoạt động giảng dạy của bạn.
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

            {/* Upcoming Classes & Pending Assignments */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Upcoming Classes */}
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>Lớp học sắp diễn ra</CardTitle>
                        <CardDescription>Các lớp học sắp tới của bạn</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {upcomingClasses.length > 0 ? (
                                upcomingClasses.slice(0, 3).map((classItem) => (
                                    <TeacherUpcomingClassItem
                                        key={`${classItem.id}-${classItem.time}`}
                                        classInfo={classItem}
                                    />
                                ))
                            ) : (
                                <EmptyState message="Không có lớp học nào trong 2 ngày tới" />
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Pending Assignments */}
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>Bài tập chờ chấm</CardTitle>
                        <CardDescription>Các bài tập cần chấm điểm</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {pendingAssignments.length > 0 ? (
                                pendingAssignments.slice(0, 3).map((assignment) => (
                                    <TeacherPendingAssignmentItem
                                        key={assignment.id}
                                        assignment={assignment}
                                    />
                                ))
                            ) : (
                                <EmptyState message="Không có bài tập nào đang chờ chấm" />
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Class Performance & Recent Activity */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Class Performance */}
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>Hiệu suất lớp học</CardTitle>
                        <CardDescription>Tình hình học tập của các lớp bạn dạy</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {classPerformance.length > 0 ? (
                                classPerformance.slice(0, 3).map((classData) => (
                                    <ClassPerformanceItem
                                        key={classData.id}
                                        classData={classData}
                                    />
                                ))
                            ) : (
                                <EmptyState message="Chưa có dữ liệu hiệu suất lớp học" />
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>Hoạt động gần đây</CardTitle>
                        <CardDescription>Các hoạt động gần đây của bạn</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentActivities.length > 0 ? (
                                recentActivities.slice(0, 5).map((activity) => (
                                    <RecentActivityItem
                                        key={activity.id}
                                        activity={activity}
                                    />
                                ))
                            ) : (
                                <EmptyState message="Chưa có hoạt động gần đây" />
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}