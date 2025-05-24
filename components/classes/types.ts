// Common types
export type UserRole = 'Teacher' | 'Student' | 'Parent' | 'Admin' | null;

// Class related types
export interface ClassDetail {
  id: string;
  name: string;
  subject: string;
  teacher: string;
  schedule: string;
  time: string;
  totalStudents: number;
  currentUnit: string;
  nextClass: string;
  status: string;
  description: string;
  announcements: Announcement[];
  assignments: Assignment[];
  materials: Material[];
  students: Student[];
  isOnlineMeetingActive: boolean;
  meetingId: string;
  classroomId: string;
}

// Announcement related types
export interface Announcement {
  id: number;
  title: string;
  content: string;
  date: string;
  isImportant: boolean;
  author: string;
  authorRole: string;
  comments: Comment[];
}

export interface Comment {
  id: number;
  content: string;
  date: string;
  author: string;
  authorRole: string;
}

// Assignment related types
export interface Assignment {
  id: number;
  title: string;
  content: string;
  dueDate: string;
  status: 'pending' | 'completed';
  isImportant: boolean;
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
  formatDate: (dateString: string) => string;
  getNextClassStatus: (nextClass: string) => { text: string; color: string };
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
  userData?: any;
  formatDate: (dateString: string) => string;
  handleStartEditAnnouncement: (announcement: Announcement) => void;
  handleDeleteAnnouncement: (id: number) => void;
  onAddComment: (announcementId: number, comment: string) => void;
  isEditing: boolean;
  editingAnnouncement?: {
    title: string;
    content: string;
    isImportant: boolean;
  };
  setEditingAnnouncement?: (value: {
    title: string;
    content: string;
    isImportant: boolean;
  }) => void;
  handleCancelEditAnnouncement: () => void;
  handleSaveEditAnnouncement: () => void;
}

export interface NewAnnouncementFormProps {
  newAnnouncement: {
    title: string;
    content: string;
    isImportant: boolean;
  };
  setNewAnnouncement: (value: {
    title: string;
    content: string;
    isImportant: boolean;
  }) => void;
  handleCreateAnnouncement: () => void;
  resetNewAnnouncementForm: () => void;
}

export interface CommentSectionProps {
  comments: Comment[];
  formatDate: (dateString: string) => string;
  onAddComment: (comment: string) => void;
}

// Tab component props
export interface AnnouncementsTabProps {
  classDetail: ClassDetail;
  role: UserRole;
  userData?: any;
  formatDate: (dateString: string) => string;
}

export interface AssignmentsTabProps {
  classDetail: ClassDetail;
  role: UserRole;
  formatDate: (dateString: string) => string;
  classId: string | string[];
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
  role?: UserRole;
}

// Modal component props
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