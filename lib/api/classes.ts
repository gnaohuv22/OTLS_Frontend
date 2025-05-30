import { api } from './client';
import { ApiResponse } from './auth';

/**
 * Interface cho thông tin giáo viên quản lý lớp học
 */
export interface ClassroomTeacher {
  userID: string;
  userName: string;
  phoneNumber: string;
  fullName: string;
  email: string;
  gender: string;
  age: string;
  dateOfBirth: string;
  avatar: string | null;
  roleName: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface cho thông tin cơ bản của lớp học
 */
export interface Classroom {
  classroomId: string;
  name: string;
  description: string;
  userId: string; // ID của giáo viên sở hữu lớp
  startDate: string;
  endDate: string | null;
  isOnlineMeeting: 'Active' | 'Inactive'; // Trạng thái lớp học
  createdAt: string;
  updatedAt: string;
  users?: ClassroomTeacher; // Thông tin chi tiết của giáo viên (có thể null nếu không được response trả về)
}

/**
 * Interface cho thông tin học sinh trong lớp học
 */
export interface ClassroomStudent {
  classroomId: string;
  studentId: string;
  studentUsername: string;
  studentName: string;
  studentDob: string;
  studentPhoneNumber: string;
  studentEmail: string;
  studentAvatar: string | null;
  studentGender: string;
  joinedAt: string;
  createdAt: string;
  updatedAt: string;
  status?: string; // Trạng thái của học sinh trong lớp học
}

// Define the structure of the new API response
interface ClassroomStudentsResponse {
  classroomId: string;
  joinedAt: string;
  createdAt: string;
  updatedAt: string;
  users: Array<{
    userID: string;
    userName: string;
    phoneNumber: string;
    fullName: string;
    email: string;
    gender: string;
    age: string;
    dateOfBirth: string;
    avatar: string | null;
    roleName: string | null;
    status: string;
    createdAt: string;
    updatedAt: string;
  }>;
}

/**
 * Interface cho request tạo lớp học mới
 */
export interface AddClassroomRequest {
  name: string;
  description: string;
  userId: string;
  startDate?: string; // Có thể để trống, backend sẽ tự điền
  endDate?: string; // Có thể để trống, backend sẽ tự điền
  isOnlineMeeting?: 'Active' | 'Inactive'; // Có thể để trống, mặc định là 'Inactive'
}

/**
 * Interface cho request cập nhật thông tin lớp học
 */
export interface UpdateClassroomRequest {
  classroomId: string;
  name: string;
  description: string;
  userId?: string; // Không thể thay đổi
  startDate?: string; // Không thể thay đổi
  endDate?: string; // Không thể thay đổi
  isOnlineMeeting?: 'Active' | 'Inactive'; // Không thể thay đổi
}

/**
 * Interface cho thông tin lịch học của lớp học
 */
export interface ClassSchedule {
  classScheduleId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  classroomId: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface cho request thêm lịch học mới
 */
export interface AddClassScheduleRequest {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  classroomId: string;
}

/**
 * Interface cho request cập nhật lịch học
 */
export interface UpdateClassScheduleRequest {
  classScheduleId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  classroomId: string;
}

/**
 * Interface cho response của API lấy lịch học theo danh sách lớp học
 */
export interface ClassroomScheduleResponse {
  classroomId: string;
  scheduleInfo: ClassSchedule[];
}

/**
 * Interface cho request lấy lịch học theo danh sách lớp học
 */
export interface GetSchedulesByClassroomIdsRequest {
  classroomId: string[];
}

/**
 * Interface cho request để thêm học sinh vào lớp học
 */
export interface EnrollStudentRequest {
  classroomId: string;
  studentId: string;
  joinedAt?: string; // Có thể để trống, backend sẽ tự điền
}

/**
 * Interface cho response khi thêm học sinh vào lớp học
 */
export interface EnrollStudentResponse {
  classroomId: string;
  joinedAt: string;
  createdAt: string;
  updatedAt: string;
  user: {
    userID: string;
    userName: string;
    phoneNumber: string;
    fullName: string;
    email: string;
    gender: string;
    age: string;
    dateOfBirth: string;
    avatar: string | null;
    roleName: string | null;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
}

/**
 * Interface cho response của API lấy danh sách lớp học theo ID học sinh
 */
export interface StudentClassroomsResponse {
  userDTO: {
    userID: string;
    userName: string;
    phoneNumber: string;
    fullName: string;
    email: string;
    gender: string;
    age: string;
    dateOfBirth: string;
    avatar: string | null;
    roleName: string | null;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
  classroomStudentDTOs: Classroom[];
}

/**
 * Interface for the response of getting classroom assignments
 */
export interface ClassroomAssignmentsResponse {
  baseClassDTO: Classroom;
  assignments: Assignment[];
}

/**
 * Interface for classroom assignment information
 */
export interface Assignment {
  assignmentId: string;
  title: string;
  description: string;
  dueDate: string;
  maxPoints: number;
  allowLateSubmissions: boolean;
  assignmentType: string;
  textContent: string;
  isDelete: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface for classroom resource information
 */
export interface Resource {
  resourceId: string;
  title: string;
  description: string;
  resourceType: string;
  resourceUrl: string;
  owner: string;
  metaData: string;
  resourceSize: number;
  thumbnailUrl: string;
  status: string;
  difficultyLevel: string;
  createdAt: string;
  updatedAt: string;
  subjectDTO: {
    subjectId: string;
    subjectName: string;
  };
}

/**
 * Interface for API response with classroom materials
 */
export interface ClassroomMaterialsResponse {
  responseClassroomDTO: Classroom;
  resourceDTOs: Resource[];
}

/**
 * Interface for adding or updating a classroom material
 */
export interface ClassroomMaterialRequest {
  resourceId?: string; // Required for update, not for add
  classroomId: string;
  userId: string;
  title: string;
  description: string;
  metaData: string;
  difficultyLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  thumbnailFile: File;
  resourceFile: File;
  subjectId: string;
}

/**
 * Interface for classroom material response after add/update
 */
export interface ClassroomMaterialResponseData {
  classroomId: string;
  addedAt: string;
  resourceDTO: Resource & {
    userDTO: {
      userID: string;
      userName: string;
      phoneNumber: string;
      fullName: string;
      email: string;
      gender: string;
      age: string;
      dateOfBirth: string;
      avatar: string | null;
      roleName: string | null;
      status: string;
      createdAt: string;
      updatedAt: string;
    };
  };
}

/**
 * Service quản lý các API liên quan đến Classroom
 */
export const ClassroomService = {
  /**
   * Lấy danh sách tất cả lớp học (dành cho Admin)
   * @returns Danh sách lớp học
   */
  getAllClassrooms: async (): Promise<Classroom[]> => {
    try {
      const response = await api.get<ApiResponse<Classroom[]>>('/classroom/get-alls');
      
      if (response.data?.isValid && response.data.data) {
        return response.data.data;
      }
      
      console.error('API Response invalid:', response.data);
      throw new Error(response.data?.message || 'Không thể lấy danh sách lớp học');
    } catch (error: any) {
      console.error('Lỗi khi lấy danh sách lớp học:', error);
      throw new Error(error.message || 'Không thể lấy danh sách lớp học');
    }
  },

  /**
   * Lấy danh sách lớp học theo ID giáo viên (dành cho giáo viên)
   * @param teacherId ID của giáo viên cần lấy danh sách lớp học
   * @returns Danh sách lớp học của giáo viên
   */
  getClassroomsByTeacherId: async (teacherId: string): Promise<Classroom[]> => {
    try {
      console.log(`Calling API to get classrooms for teacher: ${teacherId}`);
      const response = await api.get<ApiResponse<Classroom[]>>(
        `/classroom/get-list-classrooms-by-teacher-id/${teacherId}`
      );
      
      console.log(`Teacher API response status:`, response.status);
      
      if (response.data?.isValid && response.data.data) {
        // API trả về mảng các lớp học
        const classrooms = response.data.data;
        console.log(`Found ${classrooms.length} classrooms for teacher`);
        return classrooms;
      }
      
      console.error('Teacher classrooms API: Invalid response or missing data:', 
        JSON.stringify(response.data).substring(0, 200) + '...');
      return []; // Trả về mảng trống nếu không có dữ liệu hợp lệ
    } catch (error: any) {
      if (error.response) {
        console.error(`Teacher classrooms API error (${error.response.status}):`, 
          error.response.data || error.message);
        
        // Nếu lỗi 404, trả về mảng trống thay vì throw error - đây là trường hợp giáo viên chưa có lớp
        if (error.response.status === 404) {
          return [];
        }
      } else if (error.request) {
        console.error('Teacher classrooms API: No response received:', error.request);
      } else {
        console.error('Teacher classrooms API error:', error.message);
      }
      
      throw new Error(error.message || 'Không thể lấy danh sách lớp học của giáo viên');
    }
  },

  /**
   * Thêm lớp học mới
   * @param classroomData Thông tin lớp học mới
   * @returns Thông tin lớp học đã được tạo
   */
  addClassroom: async (classroomData: AddClassroomRequest): Promise<Classroom> => {
    try {
      // Thêm các giá trị mặc định nếu không được cung cấp
      const requestData: AddClassroomRequest = {
        ...classroomData,
        startDate: classroomData.startDate || new Date().toISOString(),
        isOnlineMeeting: classroomData.isOnlineMeeting || 'Inactive'
      };
      
      console.log('Dữ liệu gửi đi từ service addClassroom:', JSON.stringify(requestData));
      
      const response = await api.post<ApiResponse<Classroom>>(
        '/classroom/add-new-classroom', 
        requestData
      );
      
      if (response.data?.isValid && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data?.message || 'Không thể tạo lớp học mới');
    } catch (error: any) {
      console.error('Lỗi khi tạo lớp học mới:', error);
      throw new Error(error.message || 'Không thể tạo lớp học mới');
    }
  },

  /**
   * Cập nhật thông tin lớp học
   * @param classroomData Thông tin lớp học cần cập nhật
   * @returns Thông tin lớp học đã được cập nhật
   */
  updateClassroom: async (classroomData: UpdateClassroomRequest): Promise<Classroom> => {
    try {
      // Gửi các trường được phép cập nhật, bao gồm cả userId và endDate
      const requestData = {
        classroomId: classroomData.classroomId,
        name: classroomData.name,
        description: classroomData.description,
        userId: classroomData.userId,
        startDate: classroomData.startDate,
        endDate: classroomData.endDate // Thêm endDate vào request
      };
      
      console.log('Dữ liệu gửi đi từ service updateClassroom:', JSON.stringify(requestData));
      
      const response = await api.put<ApiResponse<Classroom>>(
        '/classroom/update-classroom', 
        requestData
      );
      
      if (response.data?.isValid && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data?.message || 'Không thể cập nhật thông tin lớp học');
    } catch (error: any) {
      console.error('Lỗi khi cập nhật thông tin lớp học:', error);
      throw new Error(error.message || 'Không thể cập nhật thông tin lớp học');
    }
  },

  /**
   * Cập nhật trạng thái meeting của lớp học
   * @param classroomId ID của lớp học
   * @param status Trạng thái meeting ('Active' hoặc 'Inactive')
   * @returns Thông tin lớp học đã được cập nhật
   */
  updateClassroomStatus: async (classroomId: string, status: 'Active' | 'Inactive'): Promise<Classroom> => {
    try {
      // Đầu tiên lấy thông tin hiện tại của lớp học
      const currentClassroom = await ClassroomService.getClassroomById(classroomId);
      
      // Chuẩn bị dữ liệu cập nhật, giữ nguyên name và description
      const updateData: UpdateClassroomRequest = {
        classroomId: classroomId,
        name: currentClassroom.name,
        description: currentClassroom.description,
        userId: currentClassroom.users?.userID,
        isOnlineMeeting: status
      };
      
      // Gọi API cập nhật
      const response = await api.put<ApiResponse<Classroom>>(
        '/classroom/update-classroom', 
        updateData
      );
      
      if (response.data?.isValid && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data?.message || `Không thể cập nhật trạng thái lớp học thành ${status}`);
    } catch (error: any) {
      console.error(`Lỗi khi cập nhật trạng thái lớp học thành ${status}:`, error);
      throw new Error(error.message || `Không thể cập nhật trạng thái lớp học thành ${status}`);
    }
  },

  /**
   * Xóa lớp học
   * @param classroomId ID của lớp học cần xóa
   * @returns Kết quả xóa (boolean)
   */
  deleteClassroom: async (classroomId: string): Promise<boolean> => {
    try {
      console.log('Xóa lớp học với ID:', classroomId);
      
      const response = await api.delete<ApiResponse<boolean>>(
        `/classroom/delete-classroom/${classroomId}`
      );
      
      if (response.data?.isValid && response.data.data) {
        return true;
      }
      
      throw new Error(response.data?.message || 'Không thể xóa lớp học');
    } catch (error: any) {
      console.error('Lỗi khi xóa lớp học:', error);
      throw new Error(error.message || 'Không thể xóa lớp học');
    }
  },

  /**
   * Lấy thông tin chi tiết của một lớp học
   * @param classroomId ID của lớp học cần lấy thông tin
   * @returns Thông tin chi tiết của lớp học
   */
  getClassroomById: async (classroomId: string): Promise<Classroom> => {
    try {
      const response = await api.get<ApiResponse<Classroom>>(
        `/classroom/get-classroom-by-id/${classroomId}`
      );
      
      if (response.data?.isValid && response.data.data) {
        // Đảm bảo trả về dữ liệu bao gồm thông tin giáo viên
        return response.data.data;
      }
      
      throw new Error(response.data?.message || 'Không thể lấy thông tin lớp học');
    } catch (error: any) {
      console.error('Lỗi khi lấy thông tin lớp học:', error);
      
      // Truyền lại lỗi 404 để component xử lý
      if (error.response && error.response.status === 404) {
        throw error;
      }
      
      throw new Error(error.message || 'Không thể lấy thông tin lớp học');
    }
  },

  /**
   * Lấy danh sách học sinh trong lớp học
   * @param classroomId ID của lớp học
   * @returns Danh sách học sinh trong lớp học
   */
  getStudentsByClassroomId: async (classroomId: string): Promise<ClassroomStudent[]> => {
    try {
      const response = await api.get<ApiResponse<ClassroomStudentsResponse | ClassroomStudent[]>>(
        `/classroom/get-students-by-classroom-id/${classroomId}`
      );
      
      // Kiểm tra dữ liệu trả về từ API
      if (response.data?.isValid && response.data.data) {
        // Nếu data chứa mảng users (API mới), chuyển đổi sang định dạng ClassroomStudent
        if ('users' in response.data.data && Array.isArray(response.data.data.users)) {
          const studentsData = response.data.data;
          return studentsData.users.map(user => ({
            classroomId: studentsData.classroomId,
            studentId: user.userID,
            studentUsername: user.userName,
            studentName: user.fullName,
            studentDob: user.dateOfBirth,
            studentPhoneNumber: user.phoneNumber,
            studentEmail: user.email,
            studentAvatar: user.avatar,
            studentGender: user.gender,
            joinedAt: studentsData.joinedAt || user.createdAt,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            status: user.status
          }));
        }
        
        // Nếu data là mảng trực tiếp (API cũ), trả về không thay đổi
        if (Array.isArray(response.data.data)) {
          return response.data.data;
        }
        
        // Trường hợp không có học sinh
        return [];
      }
      
      throw new Error(response.data?.message || 'Không thể lấy danh sách học sinh trong lớp học');
    } catch (error: any) {
      console.error('Lỗi khi lấy danh sách học sinh trong lớp học:', error);
      
      // Nếu lỗi 404, trả về mảng trống thay vì throw error
      if (error.response && error.response.status === 404) {
        return [];
      }
      
      throw new Error(error.message || 'Không thể lấy danh sách học sinh trong lớp học');
    }
  },

  /**
   * Lấy danh sách tất cả lịch học trong hệ thống
   * @returns Danh sách tất cả lịch học
   */
  getAllClassSchedules: async (): Promise<ClassSchedule[]> => {
    try {
      const response = await api.get<ApiResponse<ClassSchedule[]>>('/classroom/get-all-class-schedules');
      
      if (response.data?.isValid && response.data.data) {
        return response.data.data;
      }
      
      return []; // Trả về mảng trống nếu không có dữ liệu hợp lệ
    } catch (error: any) {
      console.error('Lỗi khi lấy danh sách lịch học:', error);
      
      // Nếu lỗi 404, trả về mảng trống thay vì throw error
      // 404 ở đây có nghĩa là không có lịch nào trong hệ thống, không phải lỗi thực sự
      if (error.response && error.response.status === 404) {
        return [];
      }
      
      throw new Error(error.message || 'Không thể lấy danh sách lịch học');
    }
  },

  /**
   * Lấy danh sách lịch học theo ID lớp học
   * @param classroomId ID của lớp học
   * @returns Danh sách lịch học của lớp học
   */
  getSchedulesByClassroomId: async (classroomId: string): Promise<ClassSchedule[]> => {
    try {
      const response = await api.get<ApiResponse<ClassSchedule[]>>(
        `/classroom/get-schedule-by-classroom-id/${classroomId}`
      );
      
      if (response.data?.isValid && response.data.data) {
        return response.data.data;
      }
      
      return []; // Trả về mảng trống nếu không có dữ liệu hợp lệ
    } catch (error: any) {
      console.error('Lỗi khi lấy danh sách lịch học của lớp học:', error);
      
      // Nếu lỗi 404, trả về mảng trống thay vì throw error
      // 404 ở đây có nghĩa là lớp học chưa có lịch, không phải lỗi thực sự
      if (error.response && error.response.status === 404) {
        return [];
      }
      
      throw new Error(error.message || 'Không thể lấy danh sách lịch học của lớp học');
    }
  },

  /**
   * Thêm lịch học mới
   * @param scheduleData Thông tin lịch học mới
   * @returns Thông tin lịch học đã được tạo
   */
  addClassSchedule: async (scheduleData: AddClassScheduleRequest): Promise<ClassSchedule> => {
    try {
      const response = await api.post<ApiResponse<ClassSchedule>>(
        '/classroom/add-schedule', 
        scheduleData
      );
      
      if (response.data?.isValid && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data?.message || 'Không thể tạo lịch học mới');
    } catch (error: any) {
      console.error('Lỗi khi tạo lịch học mới:', error);
      
      // Báo lỗi cụ thể nếu không thể thêm lịch học vì trùng lặp
      if (error.response && error.response.status === 400) {
        throw new Error('Lịch học này đã tồn tại hoặc thông tin không hợp lệ');
      }
      
      throw new Error(error.message || 'Không thể tạo lịch học mới');
    }
  },

  /**
   * Cập nhật thông tin lịch học
   * @param scheduleData Thông tin lịch học cần cập nhật
   * @returns Thông tin lịch học đã được cập nhật
   */
  updateClassSchedule: async (scheduleData: UpdateClassScheduleRequest): Promise<ClassSchedule> => {
    try {
      const response = await api.put<ApiResponse<ClassSchedule>>(
        '/classroom/update-schedule', 
        scheduleData
      );
      
      if (response.data?.isValid && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data?.message || 'Không thể cập nhật thông tin lịch học');
    } catch (error: any) {
      console.error('Lỗi khi cập nhật thông tin lịch học:', error);
      
      // Báo lỗi cụ thể nếu lịch học không tồn tại
      if (error.response && error.response.status === 404) {
        throw new Error('Lịch học không tồn tại hoặc đã bị xóa');
      }
      
      throw new Error(error.message || 'Không thể cập nhật thông tin lịch học');
    }
  },

  /**
   * Xóa lịch học
   * @param scheduleId ID của lịch học cần xóa
   * @returns Kết quả xóa (boolean)
   */
  deleteClassSchedule: async (scheduleId: string): Promise<boolean> => {
    try {
      const response = await api.delete<ApiResponse<boolean>>(
        `/classroom/delete-schedule/${scheduleId}`
      );
      
      if (response.data?.isValid && response.data.data) {
        return true;
      }
      
      throw new Error(response.data?.message || 'Không thể xóa lịch học');
    } catch (error: any) {
      console.error('Lỗi khi xóa lịch học:', error);
      throw new Error(error.message || 'Không thể xóa lịch học');
    }
  },

  /**
   * Lấy danh sách lịch học theo danh sách ID lớp học
   * @param classroomIds Danh sách ID của các lớp học
   * @returns Danh sách lịch học theo từng lớp học
   */
  getSchedulesByClassroomIds: async (classroomIds: string[]): Promise<ClassroomScheduleResponse[]> => {
    try {
      const requestData: GetSchedulesByClassroomIdsRequest = {
        classroomId: classroomIds
      };
      
      const response = await api.post<ApiResponse<ClassroomScheduleResponse[]>>(
        '/classroom/get-schedule-by-list-classroom-id',
        requestData
      );
      
      if (response.data?.isValid && response.data.data) {
        return response.data.data;
      }
      
      return []; // Trả về mảng trống nếu không có dữ liệu hợp lệ
    } catch (error: any) {
      console.error('Lỗi khi lấy danh sách lịch học theo danh sách lớp học:', error);
      
      // Nếu lỗi 404, trả về mảng trống thay vì throw error
      if (error.response && error.response.status === 404) {
        return [];
      }
      
      throw new Error(error.message || 'Không thể lấy danh sách lịch học theo danh sách lớp học');
    }
  },

  /**
   * Lấy danh sách lớp học theo ID học sinh (dành cho học sinh)
   * @param studentId ID của học sinh cần lấy danh sách lớp học
   * @returns Danh sách lớp học của học sinh
   */
  getClassroomsByStudentId: async (studentId: string): Promise<Classroom[]> => {
    try {
      console.log(`Calling API to get classrooms for student: ${studentId}`);
      const response = await api.get<ApiResponse<StudentClassroomsResponse>>(
        `/classroom/get-list-classrooms-by-studentId/${studentId}`
      );
      
      console.log(`Student API response:`, response.data);
      
      if (response.data?.isValid) {
        // Check if we have the expected structure with classroomStudentDTOs
        if (response.data.data && response.data.data.classroomStudentDTOs) {
          const classrooms = response.data.data.classroomStudentDTOs;
          console.log(`Found ${classrooms.length} classrooms in student response.data.classroomStudentDTOs`);
          return classrooms;
        }
        
        // Try to handle direct response structure (no nested data)
        // This is for compatibility with potential API structure changes
        const responseObj = response.data as any;
        if (responseObj.classroomStudentDTOs && Array.isArray(responseObj.classroomStudentDTOs)) {
          const classrooms = responseObj.classroomStudentDTOs;
          console.log(`Found ${classrooms.length} classrooms in response.classroomStudentDTOs`);
          return classrooms;
        }
        
        // Last resort: try to extract from data if it's an array
        if (responseObj.data && Array.isArray(responseObj.data)) {
          const classrooms = responseObj.data;
          console.log(`Found ${classrooms.length} classrooms in response.data array`);
          return classrooms;
        }
        
        console.warn('Student classrooms API: Valid response but unexpected structure:', 
          JSON.stringify(response.data).substring(0, 200) + '...');
        return [];
      }
      
      console.error('Student classrooms API: Invalid response:', 
        JSON.stringify(response.data).substring(0, 200) + '...');
      return [];
    } catch (error: any) {
      if (error.response) {
        console.error(`Student classrooms API error (${error.response.status}):`, 
          error.response.data || error.message);
        
        // Return empty array for 404 (no classrooms)
        if (error.response.status === 404) {
          return [];
        }
      } else if (error.request) {
        console.error('Student classrooms API: No response received:', error.request);
      } else {
        console.error('Student classrooms API error:', error.message);
      }
      
      throw new Error(error.message || 'Không thể lấy danh sách lớp học của học sinh');
    }
  },

  /**
   * Thêm học sinh vào lớp học
   * @param enrollData Thông tin học sinh cần thêm vào lớp học
   * @returns Thông tin học sinh đã được thêm vào lớp học
   */
  enrollStudent: async (enrollData: EnrollStudentRequest): Promise<EnrollStudentResponse> => {
    try {
      // Thêm timestamp hiện tại nếu không được cung cấp
      const requestData: EnrollStudentRequest = {
        ...enrollData,
        joinedAt: enrollData.joinedAt || new Date().toISOString()
      };
      
      const response = await api.post<ApiResponse<EnrollStudentResponse>>(
        '/classroom/enroll-student', 
        requestData
      );
      
      if (response.data?.isValid && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data?.message || 'Không thể thêm học sinh vào lớp học');
    } catch (error: any) {
      console.error('Lỗi khi thêm học sinh vào lớp học:', error);
      throw new Error(error.message || 'Không thể thêm học sinh vào lớp học');
    }
  },

  /**
   * Xóa học sinh khỏi lớp học
   * @param classroomId ID của lớp học
   * @param studentId ID của học sinh cần xóa khỏi lớp học
   * @returns Kết quả xóa (boolean)
   */
  unenrollStudent: async (classroomId: string, studentId: string): Promise<boolean> => {
    try {
      const response = await api.delete<ApiResponse<boolean>>(
        `/classroom/${classroomId}/unenroll-student/${studentId}`
      );
      
      if (response.data?.isValid && response.data.data) {
        return true;
      }
      
      throw new Error(response.data?.message || 'Không thể xóa học sinh khỏi lớp học');
    } catch (error: any) {
      console.error('Lỗi khi xóa học sinh khỏi lớp học:', error);
      throw new Error(error.message || 'Không thể xóa học sinh khỏi lớp học');
    }
  },

  /**
   * Get classroom assignments by classroom ID
   * @param classroomId ID of the classroom to get assignments for
   * @returns Promise with assignments data
   */
  getAssignmentsByClassroomId: async (classroomId: string): Promise<ClassroomAssignmentsResponse> => {
    try {
      console.log(`Calling API to get assignments for classroom: ${classroomId}`);
      const response = await api.get<ApiResponse<ClassroomAssignmentsResponse>>(
        `/assignment/get-assignments-by-classId/${classroomId}`
      );
      
      console.log(`Assignments API response status:`, response.status);
      
      if (response.data?.isValid && response.data.data) {
        return response.data.data;
      }
      
      console.error('Assignments API: Invalid response or missing data:', 
        JSON.stringify(response.data).substring(0, 200) + '...');
      throw new Error(response.data?.message || 'Failed to fetch assignments');
    } catch (error: any) {
      if (error.response) {
        console.error(`Assignments API error (${error.response.status}):`, 
          error.response.data || error.message);
        
        // Return empty object if 404
        if (error.response.status === 404) {
          return { baseClassDTO: {} as Classroom, assignments: [] };
        }
      } else if (error.request) {
        console.error('Assignments API: No response received:', error.request);
      } else {
        console.error('Assignments API error:', error.message);
      }
      
      throw new Error(error.message || 'Failed to fetch assignments');
    }
  },

  /**
   * Get classroom materials by classroom ID
   * @param classroomId ID of the classroom to get materials for
   * @returns Promise with materials data
   */
  getMaterialsByClassroomId: async (classroomId: string): Promise<ClassroomMaterialsResponse> => {
    try {
      console.log(`Calling API to get materials for classroom: ${classroomId}`);
      const response = await api.get<ApiResponse<ClassroomMaterialsResponse>>(
        `/classroom/get-materials-by-classroom-id/${classroomId}`
      );
      
      console.log(`Materials API response status:`, response.status);
      
      if (response.data?.isValid && response.data.data) {
        return response.data.data;
      }
      
      console.error('Materials API: Invalid response or missing data:', 
        JSON.stringify(response.data).substring(0, 200) + '...');
      throw new Error(response.data?.message || 'Failed to fetch materials');
    } catch (error: any) {
      if (error.response) {
        console.error(`Materials API error (${error.response.status}):`, 
          error.response.data || error.message);
        
        // Return empty object if 404
        if (error.response.status === 404) {
          return { responseClassroomDTO: {} as Classroom, resourceDTOs: [] };
        }
      } else if (error.request) {
        console.error('Materials API: No response received:', error.request);
      } else {
        console.error('Materials API error:', error.message);
      }
      
      throw new Error(error.message || 'Failed to fetch materials');
    }
  },

  /**
   * Add a new material to a classroom
   * @param materialData Material data to add
   * @returns Promise with added material data
   */
  addMaterial: async (materialData: ClassroomMaterialRequest): Promise<ClassroomMaterialResponseData> => {
    try {
      const formData = new FormData();
      
      // Explicitly append each field to FormData
      formData.append('classroomId', materialData.classroomId);
      formData.append('userId', materialData.userId);
      formData.append('title', materialData.title);
      formData.append('description', materialData.description);
      formData.append('metaData', materialData.metaData);
      formData.append('difficultyLevel', materialData.difficultyLevel);
      formData.append('subjectId', materialData.subjectId);
      
      // Add files if they exist
      if (materialData.thumbnailFile) {
        formData.append('thumbnailFile', materialData.thumbnailFile);
      }
      
      if (materialData.resourceFile) {
        formData.append('resourceFile', materialData.resourceFile);
      }
      
      const response = await api.post<ApiResponse<ClassroomMaterialResponseData>>(
        '/classroom/add-material',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      if (response.data?.isValid && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data?.message || 'Failed to add material');
    } catch (error: any) {
      console.error('Error adding classroom material:', error);
      throw new Error(error.message || 'Failed to add material');
    }
  },

  /**
   * Update an existing classroom material
   * @param materialData Material data to update
   * @returns Promise with updated material data
   */
  updateMaterial: async (materialData: ClassroomMaterialRequest): Promise<ClassroomMaterialResponseData> => {
    try {
      if (!materialData.resourceId) {
        throw new Error('Resource ID is required for update');
      }
      
      const formData = new FormData();
      
      // Explicitly append each field to FormData
      formData.append('resourceId', materialData.resourceId);
      formData.append('classroomId', materialData.classroomId);
      formData.append('userId', materialData.userId);
      formData.append('title', materialData.title);
      formData.append('description', materialData.description);
      formData.append('metaData', materialData.metaData);
      formData.append('difficultyLevel', materialData.difficultyLevel);
      formData.append('subjectId', materialData.subjectId);
      
      // Add files if they exist
      if (materialData.thumbnailFile) {
        formData.append('thumbnailFile', materialData.thumbnailFile);
      }
      
      if (materialData.resourceFile) {
        formData.append('resourceFile', materialData.resourceFile);
      }
      
      console.log('Updating classroom material:', materialData.title);
      
      const response = await api.put<ApiResponse<ClassroomMaterialResponseData>>(
        '/classroom/update-material',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      if (response.data?.isValid && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data?.message || 'Failed to update material');
    } catch (error: any) {
      console.error('Error updating classroom material:', error);
      throw new Error(error.message || 'Failed to update material');
    }
  },

  /**
   * Delete a material from a classroom
   * @param classroomId ID of the classroom
   * @param resourceId ID of the resource to delete
   * @returns Promise with boolean indicating success
   */
  deleteMaterial: async (classroomId: string, resourceId: string): Promise<boolean> => {
    try {
      console.log(`Deleting material ${resourceId} from classroom ${classroomId}`);
      
      const response = await api.delete<ApiResponse<boolean>>(
        `/classroom/${classroomId}/materials/${resourceId}`
      );
      
      if (response.data?.isValid && response.data.data) {
        return true;
      }
      
      throw new Error(response.data?.message || 'Failed to delete material');
    } catch (error: any) {
      console.error('Error deleting classroom material:', error);
      throw new Error(error.message || 'Failed to delete material');
    }
  }
};

/**
 * Export mặc định để sử dụng trong dự án
 */
export default ClassroomService; 