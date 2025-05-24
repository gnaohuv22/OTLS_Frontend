import { api } from './client';
import Cookies from 'js-cookie';

const API_URL = process.env.API_URL;

export interface RegisterRequest {
  email: string;
  password: string;
  phoneNumber: string;
  fullname: string;
  username?: string;
  dateOfBirth?: string;
  roleName: string;
  gender?: string;
  avatar?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface UserDTO {
  userID: string;
  userName: string;
  phoneNumber: string;
  fullName: string;
  email: string;
  gender: string;
  age: string;
  dateOfBirth: string;
  avatar: string | null;
  status: string;
}

export interface LoginResponseData {
  userDTO: UserDTO;
  token: string;
  roleName: string;
}

export interface ApiResponse<T> {
  code: number;
  message: string | null;
  errors: any | null;
  data: T;
  meta: any | null;
  isValid: boolean;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  userData?: UserDTO;
  token?: string;
  roleName?: string;
}

// Cập nhật helper quản lý cookie
const secureCookie = {
  /**
   * Đặt cookie bảo mật
   * @param name Tên cookie
   * @param value Giá trị cookie
   * @param options Tùy chọn bổ sung
   */
  set: (name: string, value: string, options: Cookies.CookieAttributes = {}) => {
    // Đảm bảo thiết lập Secure trong môi trường HTTPS
    const isSecure = window.location.protocol === 'https:';
    Cookies.set(name, value, {
      ...options,
      secure: isSecure,
      sameSite: 'strict'
    });
  },

  /**
   * Xóa cookie
   * @param name Tên cookie
   * @param options Tùy chọn bổ sung
   */
  remove: (name: string, options: Cookies.CookieAttributes = {}) => {
    Cookies.remove(name, options);
  },

  /**
   * Đặt thông tin phiên làm việc hiện tại
   * @param sessionInfo Thông tin phiên làm việc
   */
  setSessionInfo: (sessionInfo: { userId: string, roleName: string }) => {
    // Thông tin không nhạy cảm có thể được lưu trong localStorage
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userId', sessionInfo.userId);
    localStorage.setItem('roleName', sessionInfo.roleName);

    // Lưu trữ thời gian đăng nhập để theo dõi phiên
    localStorage.setItem('sessionStartTime', Date.now().toString());
  },

  /**
   * Xóa tất cả thông tin phiên làm việc
   */
  clearSessionInfo: () => {
    // Giữ lại log khi xóa phiên vì đây là hành động quan trọng về an ninh
    console.log('Đang xóa toàn bộ thông tin phiên làm việc...');
    try {
      // Xóa tất cả dữ liệu liên quan đến phiên trong localStorage
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userId');
      localStorage.removeItem('roleName');
      localStorage.removeItem('userData');
      localStorage.removeItem('sessionStartTime');
      localStorage.removeItem('lastActivity');

      // Xóa cookies
      secureCookie.remove('token', { path: '/' });
      secureCookie.remove('auth_session', { path: '/' });

    } catch (error) {
      console.error('Lỗi khi xóa thông tin phiên:', error);
    }
  },

  /**
   * Cập nhật thời gian hoạt động cuối cùng
   */
  updateLastActivity: () => {
    localStorage.setItem('lastActivity', Date.now().toString());
  },

  /**
   * Kiểm tra hành vi đáng ngờ
   * @returns true nếu phát hiện hành vi đáng ngờ
   */
  detectSuspiciousActivity: (): boolean => {
    // Thời gian không hoạt động tối đa cho phép (8 giờ)
    const MAX_INACTIVITY_TIME = 8 * 60 * 60 * 1000;

    const lastActivity = parseInt(localStorage.getItem('lastActivity') || '0');
    const currentTime = Date.now();

    // Kiểm tra nếu đã không hoạt động quá lâu
    if (lastActivity && (currentTime - lastActivity) > MAX_INACTIVITY_TIME) {
      console.warn('Phát hiện thời gian không hoạt động quá lâu');
      return true;
    }

    return false;
  }
};

export const AuthService = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    try {
      // Log chi tiết request trước khi gửi
      console.log('[API Debug] Register request data:', JSON.stringify(data, null, 2));
      console.log('[API Debug] Register API URL:', `${API_URL}/auth/register`);

      const response = await api.post('/auth/register', data);

      console.log('[API Debug] Register response success:', response.data);

      return {
        success: true,
        message: 'Đăng ký thành công!'
      };
    } catch (error: any) {
      console.error('Registration error:', error);

      // Xử lý chi tiết lỗi để debug
      if (error.response) {
        // Lỗi từ server với response code
        console.error('Error response status:', error.response.status);

        // Log chi tiết response data
        console.error('Error response data:', JSON.stringify(error.response.data, null, 2));

        // Xử lý lỗi dựa trên mã lỗi
        switch (error.response.status) {
          case 400:
            return {
              success: false,
              message: error.response.data?.message || 'Dữ liệu đăng ký không hợp lệ. Vui lòng kiểm tra lại.'
            };
          case 409:
            return {
              success: false,
              message: 'Email hoặc tên đăng nhập đã tồn tại. Vui lòng sử dụng thông tin khác.'
            };
          case 500:
            return {
              success: false,
              message: 'Lỗi máy chủ. Vui lòng thử lại sau.'
            };
          default:
            return {
              success: false,
              message: `Lỗi ${error.response.status}: ${error.response.statusText || 'Đăng ký thất bại'}`
            };
        }
      } else if (error.request) {
        // Không nhận được response
        console.error('No response received:', error.request);
        return {
          success: false,
          message: 'Không nhận được phản hồi từ máy chủ. Vui lòng thử lại sau.'
        };
      } else {
        // Lỗi khác
        console.error('Error message:', error.message);
        return {
          success: false,
          message: error.message || 'Đăng ký thất bại. Vui lòng thử lại sau.'
        };
      }
    }
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    try {
      // Gọi API đăng nhập
      const response = await api.post<ApiResponse<LoginResponseData>>('/auth/login', data);
      const responseData = response.data;

      if (responseData.isValid && responseData.data) {
        const { userDTO, token, roleName } = responseData.data;

        // Lưu thông tin phiên làm việc
        secureCookie.setSessionInfo({
          userId: userDTO.userID,
          roleName
        });

        // Lưu token vào cookie với các thiết lập bảo mật
        if (token) {
          secureCookie.set('token', token, {
            expires: 7,
            path: '/',
          });
        }

        // Lưu trữ thời gian hoạt động cuối cùng
        secureCookie.updateLastActivity();

        // Tạm thời lưu userData trong localStorage (sẽ loại bỏ sau khi API lấy profile được triển khai)
        localStorage.setItem('userData', JSON.stringify(userDTO));

        // Thiết lập cookie AUTH_SESSION chỉ để đánh dấu phiên làm việc
        secureCookie.set('auth_session', 'active', {
          expires: 7,
          path: '/'
        });

        return {
          success: true,
          message: 'Đăng nhập thành công!',
          userData: userDTO,
          token,
          roleName
        };
      } else {
        return {
          success: false,
          message: responseData.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.'
        };
      }
    } catch (error: any) {
      console.error('Login error:', error);

      // Cải thiện xử lý lỗi đăng nhập
      if (error.response) {
        const status = error.response.status;

        switch (status) {
          case 400:
            return {
              success: false,
              message: 'Tên đăng nhập hoặc mật khẩu không đúng định dạng.'
            };
          case 401:
            return {
              success: false,
              message: 'Tên đăng nhập hoặc mật khẩu không chính xác.'
            };
          case 403:
            return {
              success: false,
              message: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.'
            };
          case 429:
            return {
              success: false,
              message: 'Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau.'
            };
          default:
            return {
              success: false,
              message: 'Đăng nhập thất bại. Vui lòng thử lại sau.'
            };
        }
      }

      return {
        success: false,
        message: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.'
      };
    }
  },

  logout: async (): Promise<void> => {
    // Xóa tất cả thông tin phiên
    secureCookie.clearSessionInfo();
  },

  /**
   * Cập nhật thời gian hoạt động của người dùng
   */
  updateActivity: (): void => {
    secureCookie.updateLastActivity();
  },

  /**
   * Kiểm tra hành vi đáng ngờ
   * @returns true nếu phát hiện hành vi đáng ngờ
   */
  // checkSuspiciousActivity: (): boolean => {
  //   return secureCookie.detectSuspiciousActivity();
  // },

  // Thêm phương thức mới để kiểm tra tình trạng xác thực hiện tại
  checkAuthStatus: async (): Promise<AuthResponse> => {
    try {
      // Gọi API kiểm tra xác thực
      const response = await api.get<ApiResponse<{ userDTO: UserDTO, roleName: string }>>('/auth/status');

      if (response.data?.isValid && response.data.data) {
        return {
          success: true,
          userData: response.data.data.userDTO,
          roleName: response.data.data.roleName
        };
      }

      return {
        success: false,
        message: 'Không xác thực'
      };
    } catch (error) {
      console.error('Auth status check error:', error);
      return {
        success: false,
        message: 'Không thể kiểm tra trạng thái xác thực'
      };
    }
  },

  /**
   * Đổi mật khẩu người dùng
   * @param data Thông tin đổi mật khẩu
   * @returns Kết quả thao tác
   */
  changePassword: async (data: ChangePasswordRequest): Promise<AuthResponse> => {
    try {
      const response = await api.post<ApiResponse<boolean>>('/user/change-password', {
        oldPassword: data.oldPassword,
        newPassword: data.newPassword
      });

      if (response.data?.isValid) {
        return {
          success: true,
          message: 'Đổi mật khẩu thành công!'
        };
      }

      return {
        success: false,
        message: response.data?.message || 'Đổi mật khẩu thất bại!'
      };
    } catch (error: any) {
      console.error('Change password error:', error);

      if (error.response) {
        // Xử lý lỗi dựa trên mã lỗi
        switch (error.response.status) {
          case 400:
            return {
              success: false,
              message: error.response.data?.message || 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.'
            };
          case 401:
            return {
              success: false,
              message: 'Mật khẩu hiện tại không đúng.'
            };
          case 404:
            return {
              success: false,
              message: 'Không tìm thấy tài khoản.'
            };
          case 500:
            return {
              success: false,
              message: 'Lỗi máy chủ, vui lòng thử lại sau.'
            };
          default:
            return {
              success: false,
              message: `Lỗi ${error.response.status}: ${error.response.statusText || 'Đổi mật khẩu thất bại'}`
            };
        }
      }

      return {
        success: false,
        message: 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.'
      };
    }
  }
};

// Xuất secureCookie để có thể sử dụng ở các module khác
export { secureCookie }; 