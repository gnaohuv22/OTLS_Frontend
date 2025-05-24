import { api } from './client';
import { ApiResponse } from './auth';

export interface UserInformation {
  userID: string;
  userName: string;
  phoneNumber: string;
  fullName: string | null;
  email: string;
  gender: string;
  age: string;
  dateOfBirth: string;
  avatar: string | null;
  status: string;
  roleName: string;
  
  // Các trường bổ sung cần cho UI
  id?: string; // Dùng cho tương thích với UI hiện tại
  lastActive?: string | null; // Thời gian hoạt động cuối
  createdAt?: string; // Ngày tạo tài khoản
  updatedAt?: string; // Ngày cập nhật tài khoản
}

export interface UpdateUserRequest {
  userID: string;
  username?: string;
  phoneNumber?: string;
  fullname?: string;
  email?: string;
  gender?: string;
  dateOfBirth?: string;
  avatar?: string;
  status?: string;
}

export interface AddUserRequest {
  username: string;
  phoneNumber: string;
  fullname: string;
  email: string;
  password: string;
  gender: string;
  dateOfBirth: string;
  avatar?: string;
  roleName: string;
  status: string;
}

export interface ChangeStatusUserRequest {
  userId: string;
  statusUser: 'Active' | 'Inactive' | 'Pending' | 'Bannned';
}

export interface CheckPhoneNumberAndUsernameRequest {
  phoneNumber: string;
  userName: string;
}

/**
 * Service quản lý các API liên quan đến User
 */
export const UserService = {
  /**
   * Upload avatar của người dùng
   * @param userId ID của người dùng
   * @param file File hình ảnh
   * @returns URL của avatar đã upload
   */
  uploadAvatar: async (userId: string, file: File): Promise<string> => {
    try {
      // Tạo form data để gửi file
      const formData = new FormData();
      formData.append('avatar', file);

      // Gọi API upload avatar
      const response = await api.post<ApiResponse<string>>(
        `/user/upload-avatar/${userId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'accept': 'text/plain'
          },
        }
      );

      // Kiểm tra kết quả từ API
      if (response.data?.isValid && response.data.data) {
        const newAvatarUrl = response.data.data;
        
        // Phát sự kiện avatar đã được cập nhật
        if (typeof window !== 'undefined') {
          const avatarUpdateEvent = new CustomEvent('avatar-updated', { 
            detail: { 
              userId,
              avatarUrl: newAvatarUrl 
            } 
          });
          window.dispatchEvent(avatarUpdateEvent);
        }
        
        return newAvatarUrl; // Trả về URL avatar
      }

      throw new Error(response.data?.message || 'Không thể tải lên avatar');
    } catch (error: any) {
      console.error('Lỗi khi upload avatar:', error);
      throw new Error(error.message || 'Không thể tải lên avatar');
    }
  },

  /**
   * Lấy thông tin người dùng theo ID
   * @param userId ID của người dùng
   * @returns Thông tin người dùng
   */
  getUserById: async (userId: string) => {
    try {
      const response = await api.get<ApiResponse<any>>(`/user/get-user-by-id/${userId}`);
      
      if (response.data?.isValid && response.data.data) {
        const userData = response.data.data;
        // Đảm bảo trường avatar không bị trống
        if (!userData.avatar) {
          userData.avatar = '/avatars/default.png';
        }
        
        return userData;
      }
      
      console.error('API Response invalid:', response.data);
      throw new Error(response.data?.message || 'Không thể lấy thông tin người dùng');
    } catch (error: any) {
      console.error('Lỗi khi lấy thông tin người dùng:', error);
      throw new Error(error.message || 'Không thể lấy thông tin người dùng');
    }
  },

  /**
   * Lấy danh sách toàn bộ người dùng trong hệ thống
   * @returns Danh sách người dùng
   */
  getAllUsers: async (): Promise<UserInformation[]> => {
    try {
      const response = await api.get<ApiResponse<UserInformation[]>>('/user/get-all-users');
      
      if (response.data?.isValid && response.data.data) {
        return response.data.data;
      }
      
      console.error('API Response invalid:', response.data);
      throw new Error(response.data?.message || 'Không thể lấy danh sách người dùng');
    } catch (error: any) {
      console.error('Lỗi khi lấy danh sách người dùng:', error);
      throw new Error(error.message || 'Không thể lấy danh sách người dùng');
    }
  },

  /**
   * Cập nhật thông tin người dùng (endpoint /user/update-user)
   * @param userData Thông tin người dùng cần cập nhật
   * @returns Kết quả cập nhật (boolean)
   */
  updateUser: async (userData: UpdateUserRequest): Promise<boolean> => {
    try {
      // Sử dụng trực tiếp userData theo chuẩn API mới
      console.log('Dữ liệu gửi đi từ service:', JSON.stringify(userData));
      
      const response = await api.put<ApiResponse<boolean>>('/user/update-user', userData);
      
      if (response.data?.isValid) {
        return true;
      }
      
      throw new Error(response.data?.message || 'Không thể cập nhật thông tin người dùng');
    } catch (error: any) {
      console.error('Lỗi khi cập nhật thông tin người dùng:', error);
      throw new Error(error.message || 'Không thể cập nhật thông tin người dùng');
    }
  },

  /**
   * Thay đổi trạng thái người dùng
   * @param request Thông tin request bao gồm userId và statusUser
   * @returns Kết quả cập nhật (boolean)
   */
  changeStatusUser: async (request: ChangeStatusUserRequest): Promise<boolean> => {
    try {
      // Đảm bảo dữ liệu gửi đi đúng định dạng
      const requestData = {
        userId: request.userId,
        statusUser: request.statusUser
      };
      
      console.log('Dữ liệu gửi đi từ service:', JSON.stringify(requestData));
      
      const response = await api.post<ApiResponse<boolean>>('/user/change-status-user', requestData);
      
      if (response.data?.isValid) {
        return true;
      }
      
      throw new Error(response.data?.message || 'Không thể thay đổi trạng thái người dùng');
    } catch (error: any) {
      console.error('Lỗi khi thay đổi trạng thái người dùng:', error);
      throw new Error(error.message || 'Không thể thay đổi trạng thái người dùng');
    }
  },

  /**
   * Xóa người dùng (đánh dấu isDeleted)
   * @param userId ID của người dùng cần xóa
   * @returns Kết quả xóa (boolean)
   */
  deleteUser: async (userId: string): Promise<boolean> => {
    try {
      console.log('Xóa người dùng với ID:', userId);
      
      const response = await api.delete<ApiResponse<boolean>>(`/user/delete-user/${userId}`);
      
      if (response.data?.isValid && response.data.data) {
        return true;
      }
      
      throw new Error(response.data?.message || 'Không thể xóa người dùng');
    } catch (error: any) {
      console.error('Lỗi khi xóa người dùng:', error);
      throw new Error(error.message || 'Không thể xóa người dùng');
    }
  },

  /**
   * Thêm người dùng mới từ trang Admin
   * @param userData Thông tin người dùng mới
   * @returns Kết quả thêm người dùng (UserInformation)
   */
  addUser: async (userData: AddUserRequest): Promise<UserInformation> => {
    try {
      console.log('Dữ liệu gửi đi từ service addUser:', JSON.stringify(userData));
      
      const response = await api.post<ApiResponse<UserInformation>>('/user/add-user', userData);
      
      if (response.data?.isValid && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data?.message || 'Không thể thêm người dùng mới');
    } catch (error: any) {
      console.error('Lỗi khi thêm người dùng mới:', error);
      throw new Error(error.message || 'Không thể thêm người dùng mới');
    }
  },

  /**
   * Kiểm tra số điện thoại và username
   * @param request Thông tin request chứa phoneNumber và userName
   * @returns Thông tin user nếu tồn tại
   */
  checkPhoneNumberAndUsername: async (request: CheckPhoneNumberAndUsernameRequest): Promise<UserInformation> => {
    try {
      console.log('[Debug] Kiểm tra số điện thoại và username:', JSON.stringify(request));
      
      const response = await api.post<ApiResponse<UserInformation>>(
        '/auth/check-phonenumber-and-username', 
        request
      );
      
      if (response.data?.isValid && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data?.message || 'Không tìm thấy thông tin người dùng');
    } catch (error: any) {
      console.error('Lỗi khi kiểm tra số điện thoại và username:', error);
      throw new Error(error.message || 'Không thể kiểm tra thông tin người dùng');
    }
  },
}; 