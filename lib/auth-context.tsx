'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { UserDTO, ApiResponse } from './api/auth';
import { secureCookie } from './api/auth';
import Cookies from 'js-cookie';
import { api } from './api/client';
import { useRouter } from 'next/navigation';

// Định nghĩa các interface để tránh lỗi TypeScript
interface UserProfileResponse {
  data: UserDTO;
}

interface RefreshTokenResponse {
  token: string;
}

type UserRole = 'Student' | 'Teacher' | 'Parent' | 'Admin' | null;

// Thêm type cho dữ liệu phiên làm việc
interface SessionData {
  deviceId: string;
  lastActivity: number;
  ipAddress?: string;
  userAgent?: string;
}

// Mở rộng AuthContextType
interface AuthContextType {
  role: UserRole;
  isAuthenticated: boolean | null;
  userData: UserDTO | null;
  user: UserDTO | null; // Alias to userData for compatibility
  setRole: (role: UserRole) => void;
  login: (userData: UserDTO, token: string, role: UserRole) => void;
  logout: () => void;
  refreshAccessToken: () => Promise<boolean>;
  updateActivity: () => void; // Thêm phương thức cập nhật hoạt động
}

// Tạo context ban đầu
const AuthContext = createContext<AuthContextType>({
  role: null,
  isAuthenticated: false,
  userData: null,
  user: null, // Add user alias
  setRole: () => {},
  login: () => {},
  logout: () => {},
  refreshAccessToken: async () => false,
  updateActivity: () => {},
});

export const useAuth = () => useContext(AuthContext);

// Thêm function kiểm tra token JWT hết hạn
const isJwtTokenExpired = (token: string): boolean => {
  if (!token) return true;

  try {
    // Giải mã phần payload của JWT (phần thứ 2 sau khi phân tách theo dấu chấm)
    const base64Payload = token.split('.')[1];
    const payload = JSON.parse(atob(base64Payload));
    
    // Lấy thời gian hết hạn từ payload
    const exp = payload.exp * 1000; // Chuyển đổi từ giây sang mili giây
    
    // Token sẽ được coi là hết hạn trước 5 phút để đảm bảo làm mới kịp thời
    const currentTime = Date.now();
    const expirationBuffer = 5 * 60 * 1000; // 5 phút
    
    return currentTime > exp - expirationBuffer;
  } catch (error) {
    console.error('Lỗi khi kiểm tra thời hạn JWT:', error);
    return true; // Coi là hết hạn nếu có lỗi xảy ra
  }
};

// Tạo ID thiết bị duy nhất
const generateDeviceId = (): string => {
  // Kiểm tra nếu chạy trên client-side
  if (typeof window === 'undefined') {
    return 'ssr-device-id';
  }
  
  // Kiểm tra nếu đã có device ID
  const existingDeviceId = localStorage.getItem('device_id');
  if (existingDeviceId) {
    return existingDeviceId;
  }
  
  // Tạo device ID mới
  const newDeviceId = Math.random().toString(36).substring(2, 15) + 
                     Math.random().toString(36).substring(2, 15);
  localStorage.setItem('device_id', newDeviceId);
  return newDeviceId;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRole] = useState<UserRole>(null);
  const [userData, setUserData] = useState<UserDTO | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const router = useRouter();

  // Cập nhật thời gian hoạt động
  const updateActivity = () => {
    if (!isAuthenticated) return;
    
    secureCookie.updateLastActivity();
    
    // Cập nhật dữ liệu phiên
    if (sessionData) {
      setSessionData({
        ...sessionData,
        lastActivity: Date.now()
      });
    }
  };
  
  // Cải tiến phương thức đăng xuất 
  const logout = useCallback(async () => {
    try {
      // Cập nhật state
      setRole(null);
      setUserData(null);
      setIsAuthenticated(false);
      setSessionData(null);
      
      // Xóa tất cả dữ liệu phiên
      secureCookie.clearSessionInfo();
      
      // Xóa role cookie
      Cookies.remove('role', { path: '/' });
      
      // Gọi API đăng xuất
      try {
        // await api.post('/auth/logout');
      } catch (error) {
        console.error('Lỗi khi gọi API đăng xuất:', error);
      }
      
      return true;
    } catch (error) {
      console.error('Lỗi đăng xuất:', error);
      return false;
    }
  }, []);

  // Lắng nghe sự kiện cập nhật dữ liệu người dùng từ các component khác
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleUserDataUpdate = (event: any) => {
      const { userData: updatedUserData } = event.detail;
      if (updatedUserData) {
        
        // Cập nhật state trong context
        setUserData(updatedUserData);
        
        // Cập nhật localStorage
        try {
          localStorage.setItem('userData', JSON.stringify(updatedUserData));
        } catch (error) {
          console.error('Lỗi khi lưu userData mới vào localStorage:', error);
        }
      }
    };

    // Đăng ký lắng nghe sự kiện
    window.addEventListener('user-data-update', handleUserDataUpdate);

    // Hủy đăng ký khi component unmount
    return () => {
      window.removeEventListener('user-data-update', handleUserDataUpdate);
    };
  }, []);

  // Lắng nghe sự kiện cập nhật avatar
  useEffect(() => {
    if (typeof window === 'undefined' || !userData) return;

    const handleAvatarUpdate = (event: any) => {
      const { userId, avatarUrl } = event.detail;
      
      // Chỉ cập nhật nếu userId khớp với người dùng hiện tại
      if (userId === userData.userID && avatarUrl) {
        // Cập nhật userData với avatar mới
        const updatedUserData = {
          ...userData,
          avatar: avatarUrl
        };
        
        // Cập nhật state trong context
        setUserData(updatedUserData);
        
        // Cập nhật localStorage
        try {
          localStorage.setItem('userData', JSON.stringify(updatedUserData));
        } catch (error) {
          console.error('Lỗi khi lưu userData mới với avatar vào localStorage:', error);
        }
      }
    };

    // Đăng ký lắng nghe sự kiện cập nhật avatar
    window.addEventListener('avatar-updated', handleAvatarUpdate);

    // Hủy đăng ký khi component unmount
    return () => {
      window.removeEventListener('avatar-updated', handleAvatarUpdate);
    };
  }, [userData]);

  // Chức năng kiểm tra trạng thái khi khởi tạo
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Kiểm tra nếu đang chạy trên server-side
        if (typeof window === 'undefined') {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }
        
        // Kiểm tra các dữ liệu phiên từ localStorage và cookie
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const storedRole = localStorage.getItem('roleName') as UserRole;
        const storedUserId = localStorage.getItem('userId');
        const hasCookie = !!Cookies.get('token');
        const hasSessionCookie = !!Cookies.get('auth_session'); 
        
        // Tạo ID thiết bị nếu chưa có
        const deviceId = generateDeviceId();
        
        // Thiết lập dữ liệu phiên
        setSessionData({
          deviceId,
          lastActivity: Date.now(),
          userAgent: navigator.userAgent
        });
        
        if (hasCookie && hasSessionCookie && isLoggedIn && storedRole && storedUserId) {
          // Kiểm tra hành vi đáng ngờ
          if (secureCookie.detectSuspiciousActivity()) {
            console.warn('Phát hiện hành vi đáng ngờ, đăng xuất người dùng');
            await logout();
            router.push('/login?suspicious=true');
            return;
          }
          
          // Thiết lập thông tin đăng nhập
          setRole(storedRole);
          setIsAuthenticated(true);
          
          // Đảm bảo role cookie được thiết lập cho middleware
          if (!Cookies.get('role') && storedRole) {
            Cookies.set('role', storedRole, {
              expires: 7,
              path: '/',
              secure: window.location.protocol === 'https:',
              sameSite: 'strict'
            });
          }
          
          // Đảm bảo dữ liệu người dùng được khôi phục từ localStorage ngay lập tức
          let parsedUserData: UserDTO | null = null;
          const cachedUserData = localStorage.getItem('userData');
          
          if (cachedUserData && cachedUserData !== "undefined" && cachedUserData !== "null") {
            try {
              parsedUserData = JSON.parse(cachedUserData);
              if (parsedUserData) {
                setUserData(parsedUserData);
              }
            } catch (error) {
              console.error('Lỗi khi parse userData từ localStorage:', error);
              // Xóa dữ liệu không hợp lệ
              localStorage.removeItem('userData');
            }
          }
          
          // Sau đó mới thử lấy dữ liệu người dùng từ API để cập nhật
          try {
            // Thử lấy dữ liệu người dùng từ API
            const userDataResponse = await api.get<ApiResponse<UserProfileResponse>>(`/user/get-user-by-id/${storedUserId}`);
            
            if (userDataResponse.data?.isValid && userDataResponse.data?.data?.data) {
              const freshUserData = userDataResponse.data.data.data;
              
              // Đảm bảo trường avatar không bị trống
              if (!freshUserData.avatar) {
                freshUserData.avatar = '/avatars/default.png';
              }
              
              setUserData(freshUserData);
              
              // Cập nhật lại cache trong localStorage
              if (freshUserData) {
                try {
                  localStorage.setItem('userData', JSON.stringify(freshUserData));
                } catch (error) {
                  console.error('Lỗi khi lưu userData mới vào localStorage:', error);
                }
              }
            }
          } catch (error) {
            console.error('Không thể lấy thông tin người dùng từ API, sử dụng dữ liệu từ cache', error);
            // Đã khôi phục dữ liệu từ localStorage ở trên rồi, không cần làm gì thêm
          }
          
          // Cập nhật thời gian hoạt động
          secureCookie.updateLastActivity();
        } else {
          // Nếu không có thông tin xác thực, đảm bảo đăng xuất
          setIsAuthenticated(false);
          secureCookie.clearSessionInfo();
        }
      } catch (error) {
        console.error('Lỗi khi khởi tạo thông tin xác thực', error);
        setIsAuthenticated(false);
        secureCookie.clearSessionInfo();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [router, logout]);

  // Cải tiến phương thức đăng nhập
  const login = async (newUserData: UserDTO, token: string, newRole: UserRole) => {
    if (newRole && token && newUserData) {
      try {
        // Kiểm tra nếu đang chạy trên server-side
        if (typeof window === 'undefined') {
          return false;
        }
        
        // Đảm bảo trường avatar không bị trống
        if (!newUserData.avatar) {
          newUserData.avatar = '/avatars/default.png';
        }
        
        // Cập nhật state
        setRole(newRole);
        setUserData(newUserData);
        setIsAuthenticated(true);
        
        // Thiết lập dữ liệu phiên mới
        const deviceId = generateDeviceId();
        const sessionInfo = {
          deviceId,
          lastActivity: Date.now(),
          userAgent: navigator.userAgent
        };
        
        setSessionData(sessionInfo);
        
        // Lưu thông tin phiên vào localStorage và cookies
        secureCookie.set('token', token, { 
          expires: 7, 
          path: '/', 
          secure: window.location.protocol === 'https:',
          sameSite: 'strict'
        });
        
        // Lưu role vào cookie để middleware có thể đọc
        Cookies.set('role', newRole, {
          expires: 7,
          path: '/',
          secure: window.location.protocol === 'https:',
          sameSite: 'strict'
        });
        
        // Lưu userData vào localStorage - đảm bảo giá trị luôn hợp lệ
        if (newUserData) {
          try {
            localStorage.setItem('userData', JSON.stringify(newUserData));
          } catch (error) {
            console.error('Lỗi khi lưu userData vào localStorage:', error);
          }
        }
        
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('roleName', newRole);
        localStorage.setItem('userId', newUserData.userID);
        secureCookie.updateLastActivity();
        
        return true;
      } catch (error) {
        console.error('Lỗi đăng nhập:', error);
        return false;
      }
    }
    return false;
  };

  // Kiểm tra hoạt động đáng ngờ định kỳ
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const checkSuspiciousActivity = () => {
      if (secureCookie.detectSuspiciousActivity()) {
        console.warn('Phát hiện hành vi đáng ngờ, đăng xuất người dùng');
        logout().then(() => {
          router.push('/login?suspicious=true');
        });
      }
    };
    
    // Kiểm tra mỗi 5 phút
    const activityCheckInterval = setInterval(checkSuspiciousActivity, 5 * 60 * 1000);
    
    return () => clearInterval(activityCheckInterval);
  }, [isAuthenticated, router, logout]);

  // Thêm phương thức làm mới token
  const refreshAccessToken = useCallback(async (): Promise<boolean> => {
    try {
      // Kiểm tra nếu đang chạy trên server-side
      if (typeof window === 'undefined') {
        return false;
      }
      
      // Lấy thông tin cần thiết cho refresh token
      const storedUserId = localStorage.getItem('userId');
      const currentToken = Cookies.get('token');
      
      // Kiểm tra xem có đủ thông tin để refresh không
      if (!storedUserId || !currentToken) {
        console.error('Thiếu thông tin để làm mới token (userId hoặc token)');
        await logout();
        return false;
      }
      
      // Gọi endpoint làm mới token với format mới
      const response = await api.post<ApiResponse<{token: string}>>('/auth/refresh-token', {
        token: currentToken,
        userId: storedUserId
      });
      
      // Kiểm tra kết quả từ API
      if (response.data?.isValid && response.data?.data) {
        const { token } = response.data.data;
        
        // Cập nhật token mới vào cookie
        Cookies.set('token', token, {
          expires: 7,
          path: '/',
          secure: window.location.protocol === 'https:',
          sameSite: 'strict'
        });
        
        return true;
      }
      
      // Nếu refresh token thất bại, đăng xuất người dùng
      console.error('Làm mới token thất bại: Token không hợp lệ');
      await logout();
      return false;
    } catch (error) {
      console.error('Lỗi làm mới token:', error);
      await logout();
      return false;
    }
  }, [logout]);

  // Kiểm tra định kỳ và làm mới token
  useEffect(() => {
    if (!isAuthenticated) return;
    
    // Kiểm tra token hết hạn ngay khi khởi tạo
    const checkTokenExpiration = async () => {
      const token = Cookies.get('token');
      
      if (token && isJwtTokenExpired(token)) {
        await refreshAccessToken();
      }
    };
    
    // Kiểm tra ngay khi component được mount
    checkTokenExpiration();
    
    // Làm mới token mỗi 20 phút
    const tokenRefreshInterval = setInterval(() => {
      const token = Cookies.get('token');
      
      if (token && isJwtTokenExpired(token)) {
        refreshAccessToken().catch(console.error);
      }
    }, 20 * 60 * 1000);
    
    return () => clearInterval(tokenRefreshInterval);
  }, [isAuthenticated, refreshAccessToken, logout]);

  if (isLoading) {
    return null; // hoặc hiển thị loading spinner
  }

  return (
    <AuthContext.Provider
      value={{
        role,
        isAuthenticated,
        userData,
        user: userData, // Add user alias
        setRole,
        login,
        logout,
        refreshAccessToken,
        updateActivity,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 