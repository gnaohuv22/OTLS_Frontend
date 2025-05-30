// Common types
export type UserRole = 'Teacher' | 'Student' | 'Parent' | 'Admin' | null | undefined;

// Class related types
export interface ClassDetail {
  id: string;
  classroomId: string;
  name: string;
  description: string;
  subject?: string;
  schedule?: string;
  time?: string;
  grade?: string;
  teacher?: string;
  teacherId?: string;
  students?: Student[] | any[];
  totalStudents?: number;
  status?: 'active' | 'inactive';
  startDate?: string; // Ngày bắt đầu lớp học
  endDate?: string | null; // Ngày kết thúc lớp học (nullable)
  userId?: string; // ID của giáo viên quản lý lớp
  isOnlineMeeting?: 'Active' | 'Inactive'; // Trạng thái meeting
  isOnlineMeetingActive?: boolean; // Trạng thái active của meeting
  meetingId?: string;
  nextClass?: string; // Thời gian buổi học tiếp theo
  announcements?: Announcement[];
  assignments?: Assignment[];
  materials?: Material[];
}

// Announcement related types (Updated for API compatibility)
export interface Announcement {
  id: string; // Changed from number to string for API compatibility
  title: string;
  content: string;
  date: string;
  isImportant: boolean;
  author: string;
  authorRole: string;
  authorId: string; // Added for API integration
  classroomId: string; // Added for API integration
  comments: AnnouncementComment[]; // Updated type name
  isPinned: boolean; // Added for pinning feature
  isEdited: boolean; // Added for edit tracking
  editedAt?: string; // Added for edit timestamp
  createdAt: string; // Added for API compatibility
  updatedAt: string; // Added for API compatibility
}

export interface AnnouncementComment {
  id: string; // Changed from number to string for API compatibility
  content: string;
  date: string;
  author: string;
  authorRole: string;
  authorId: string; // Added for API integration
  announcementId: string; // Added for API integration
  parentCommentId?: string; // Added for nested comments/replies
  mentions?: string[]; // Added for user tagging
  isEdited: boolean; // Added for edit tracking
  editedAt?: string; // Added for edit timestamp
  createdAt: string; // Added for API compatibility
  updatedAt: string; // Added for API compatibility
}

// Legacy interface for backward compatibility (can be removed later)
export interface Comment {
  id: number;
  content: string;
  date: string;
  author: string;
  authorRole: string;
}

// Assignment related types
export interface Assignment {
  id?: number;
  assignmentId?: string;
  title: string;
  content?: string;
  description?: string;
  dueDate: string;
  status?: 'pending' | 'completed';
  isImportant?: boolean;
  maxPoints?: number;
  allowLateSubmissions?: boolean;
  assignmentType?: string;
  textContent?: string;
  isDelete?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Material related types
export interface Material {
  id: string;
  title: string;
  type: string;
  uploadDate: string;
  resourceId?: string;
  resourceType?: string;
  description?: string;
  resourceUrl?: string;
  thumbnailUrl?: string;
  difficultyLevel?: string;
  resourceSize?: number;
  subjectDTO?: {
    subjectId: string;
    subjectName: string;
  };
}

// Student related types
export interface Student {
  id: string;
  name: string;
  avatar: string | null;
  email?: string;
  studentDob?: string;
  joinedAt?: string;
  status?: string;
}

// User data for API calls
export interface UserData {
  id: string;
  name: string;
  role: UserRole;
  email?: string;
}

// Analytics related types
export interface ClassStatistics {
  assignments: {
    id: string;
    title: string;
    averageScore: number;
    completionRate: number;
  }[];
  students: {
    id: string;
    name: string;
    averageScore: number;
    completionRate: number;
    attendanceRate: number;
  }[];
  attendance: {
    average: number;
    lastMonth: number[];
  };
}

// Props interfaces for components
export interface ClassDetailHeaderProps {
  classDetail: ClassDetail;
}

export interface ClassInfoCardsProps {
  classDetail: ClassDetail;
  formatDate: (dateString: string | undefined) => string;
  getNextClassStatus: (nextClass: string | undefined) => { text: string; color: string };
}

export interface ClassTabNavProps {
  activeTab: string;
  handleTabChange: (value: string) => void;
  role: UserRole;
  isMeetingActive: boolean;
}

export interface AnnouncementCardProps {
  announcement: Announcement;
  role: UserRole;
  userData: UserData;
  formatDate: (dateString: string) => string;
  onUpdate: (updatedAnnouncement: Announcement) => void;
  onDelete: (announcementId: string) => void;
  onAddComment: (announcementId: string, comment: string, mentions?: string[], parentCommentId?: string) => void;
  onUpdateComment: (commentId: string, content: string, mentions?: string[]) => void;
  onDeleteComment: (commentId: string) => void;
  onTogglePin: (announcementId: string, isPinned: boolean) => void;
}

export interface NewAnnouncementFormProps {
  classroomId: string;
  userData: UserData;
  onCreateSuccess: (announcement: Announcement) => void;
  onCreateError: (error: string) => void;
}

export interface CommentSectionProps {
  announcementId: string;
  comments: AnnouncementComment[];
  userData: UserData;
  formatDate: (dateString: string) => string;
  onAddComment: (announcementId: string, comment: string, mentions?: string[], parentCommentId?: string) => void;
  onUpdateComment: (commentId: string, content: string, mentions?: string[]) => void;
  onDeleteComment: (commentId: string) => void;
  students: Student[]; // For user tagging suggestions
  teacher?: {
    id: string;
    name: string;
    avatar?: string | null;
    email?: string;
  }; // For teacher tagging
}

// Enhanced announcement management props
export interface AnnouncementManagerProps {
  classroomId: string;
  userData?: UserData;
  role: UserRole;
  formatDate: (dateString: string | undefined) => string;
  students: Student[] | undefined; // For user tagging
  teacher?: {
    id: string;
    name: string;
    avatar?: string | null;
    email?: string;
  }; // For teacher tagging
}

// User mention component props
export interface UserMentionProps {
  students: Student[];
  teacher?: {
    id: string;
    name: string;
    avatar?: string | null;
    email?: string;
  };
  currentUserId: string; // To exclude current user from mentions
  onMention: (userId: string, userName: string) => void;
  searchTerm: string;
}

// Tab component props (Updated)
export interface AnnouncementsTabProps {
  classDetail: ClassDetail;
  role?: UserRole;
  userData?: UserData;
  formatDate?: (dateString: string) => string;
  teacher?: {
    id: string;
    name: string;
    avatar?: string | null;
    email?: string;
  };
}

export interface AssignmentsTabProps {
  classDetail: ClassDetail;
  role?: UserRole;
  formatDate?: (dateString: string) => string;
  classId?: string;
}

export interface OnlineMeetingTabProps {
  classDetail: ClassDetail;
  role: UserRole;
  isMeetingActive: boolean;
  isLoadingMeeting?: boolean;
  startMeeting: () => void;
  endMeeting: () => void;
}

export interface MaterialsTabProps {
  classDetail: ClassDetail;
  role: UserRole;
  formatDate: (dateString: string) => string;
}

export interface StudentsTabProps {
  classDetail: ClassDetail;
  role: UserRole;
  setShowAddStudentModal: (show: boolean) => void;
}

export interface AnalyticsTabProps {
  classStatistics: ClassStatistics;
}

export interface SettingsTabProps {
  classDetail: ClassDetail;
  openEditClassModal: () => void;
}

export interface EditClassModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  classDetail: ClassDetail;
  editClassForm: {
    className: string;
    classSubject: string;
    classDescription: string;
    schedules: {
      day: string;
      time: string;
      id: number;
    }[];
  };
  setEditClassForm: (form: {
    className: string;
    classSubject: string;
    classDescription: string;
    schedules: {
      day: string;
      time: string;
      id: number;
    }[];
  }) => void;
  handleSaveClassInfo: () => void;
}

export interface AddStudentModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  newStudentEmail: string;
  setNewStudentEmail: (email: string) => void;
  studentsToAdd: string[];
  setStudentsToAdd: (students: string[]) => void;
  addStudentEmail: () => void;
  removeStudentEmail: (email: string) => void;
  handleInviteStudents: () => void;
  classroomId?: string;
}

export interface ScheduleModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  scheduleForm: {
    schedule: string;
    time: string;
    meetingLink: string;
  };
  setScheduleForm: (form: {
    schedule: string;
    time: string;
    meetingLink: string;
  }) => void;
  handleSaveSchedule: () => void;
}

export interface OverviewTabProps {
  classDetail: ClassDetail;
  role?: UserRole;
}

export interface MembersTabProps {
  classDetail: ClassDetail;
  role?: UserRole;
}

export interface ScheduleTabProps {
  classDetail: ClassDetail;
  role?: UserRole;
}

export interface ResourcesTabProps {
  classDetail: ClassDetail;
  role?: UserRole;
}

export interface EditScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (schedule: any) => void;
  existingSchedule?: any;
  error?: string;
}

export interface ScheduleFormProps {
  schedule: any;
  setSchedule: React.Dispatch<React.SetStateAction<any>>;
  handleAddSchedule: () => void;
  handleSaveSchedule: () => void;
} 