import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import Cookies from 'js-cookie';
import { secureCookie } from './auth';

// Lấy URL từ biến môi trường
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Xác định URL cơ sở mặc định nếu không có biến môi trường
const API_BASE_URL = API_URL || 'https://localhost:5000';

// Biến theo dõi số lượng lỗi 401 liên tiếp
let consecutive401Count = 0;
const MAX_CONSECUTIVE_401 = 3; // Ngưỡng tối đa cho lỗi liên tiếp

// Tạo instance axios với URL cơ sở
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 30000, // 30 giây
  withCredentials: true // Quan trọng: Đảm bảo cookies được gửi với mọi request
});

// Biến để theo dõi các request đang chờ refresh token
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

// Hàm để thêm request vào hàng đợi
const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

// Hàm để thực hiện tất cả request đang chờ với token mới
const onTokenRefreshed = (newToken: string) => {
  refreshSubscribers.forEach(callback => callback(newToken));
  refreshSubscribers = [];
};

// Hàm để xử lý khi refresh token thất bại
const onTokenRefreshFailed = () => {
  refreshSubscribers = [];
};

// Cập nhật hoạt động của người dùng sau mỗi request
const updateUserActivity = () => {
  secureCookie.updateLastActivity();
};

// // Phát hiện hành vi đáng ngờ dựa trên mẫu request
// const detectSuspiciousRequestPattern = (config: AxiosRequestConfig): boolean => {
//   // Thực hiện các kiểm tra hành vi đáng ngờ ở đây
//   // (Đây chỉ là một ví dụ đơn giản)
  
//   // Phát hiện nhiều request API liên tiếp quá nhanh
//   const now = Date.now();
//   const lastRequestTime = parseInt(localStorage.getItem('lastApiRequestTime') || '0');
//   const timeSinceLastRequest = now - lastRequestTime;
  
//   localStorage.setItem('lastApiRequestTime', now.toString());
  
//   // Nếu thời gian giữa các request quá nhỏ (< 50ms) và không phải là request tài nguyên tĩnh
//   // thì có thể là bot hoặc script tự động
//   const MIN_HUMAN_REQUEST_INTERVAL = 50; // 50ms
  
//   if (
//     lastRequestTime > 0 &&
//     timeSinceLastRequest < MIN_HUMAN_REQUEST_INTERVAL &&
//     !config.url?.includes('/static/') &&
//     !config.url?.includes('/assets/')
//   ) {
//     // Tăng số đếm request đáng ngờ
//     const suspiciousCount = parseInt(localStorage.getItem('suspiciousRequestCount') || '0') + 1;
//     localStorage.setItem('suspiciousRequestCount', suspiciousCount.toString());
    
//     // Nếu có quá nhiều request đáng ngờ liên tiếp
//     if (suspiciousCount > 10) {
//       console.warn('Phát hiện mẫu request đáng ngờ');
//       localStorage.setItem('suspiciousRequestCount', '0');
//       return true;
//     }
//   } else {
//     // Reset số đếm nếu request có vẻ bình thường
//     localStorage.setItem('suspiciousRequestCount', '0');
//   }
  
//   return false;
// };

// Interceptor xử lý request
apiClient.interceptors.request.use(
  (config) => {
    // Cập nhật thời gian hoạt động
    updateUserActivity();
    
    // // Kiểm tra hành vi đáng ngờ
    // if (detectSuspiciousRequestPattern(config)) {
    //   // Thực hiện các biện pháp bảo vệ (ví dụ: log, cảnh báo, hoặc từ chối request)
    //   console.warn('Phát hiện hành vi đáng ngờ trong request');
    //   // Có thể thêm logic xử lý ở đây
    // }
    
    // Thêm CSRF token nếu có (từ meta tag)
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }
    
    // Thêm device ID vào header
    const deviceId = localStorage.getItem('device_id');
    if (deviceId) {
      config.headers['X-Device-ID'] = deviceId;
    }
    
    // Thêm Authorization header nếu có token
    const token = Cookies.get('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Bỏ phần log thông tin nhạy cảm trong production
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Interceptor xử lý response
apiClient.interceptors.response.use(
  (response) => {
    // Reset số lượng lỗi 401 liên tiếp khi request thành công
    consecutive401Count = 0;
    
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[API Response Success] ${response.config.method?.toUpperCase()} ${response.config.url}`);
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;
    
    if (!originalRequest) {
      return Promise.reject(error);
    }
    
    // Xử lý lỗi 401 (Unauthorized) - Có thể do token hết hạn
    if (error.response?.status === 401) {
      // Tăng số lượng lỗi 401 liên tiếp
      consecutive401Count++;
      
      // Nếu có quá nhiều lỗi 401 liên tiếp, có thể là tấn công
      if (consecutive401Count >= MAX_CONSECUTIVE_401) {
        console.error('Phát hiện nhiều lỗi xác thực liên tiếp - có thể là tấn công');
        // Xóa toàn bộ thông tin xác thực
        secureCookie.clearSessionInfo();
        // Chuyển hướng đến trang đăng nhập với thông báo
        window.location.href = '/login?security=compromised';
        return Promise.reject(error);
      }
      
      // Kiểm tra nếu request này chưa được thử lại sau refresh token
      if (!originalRequest.headers['X-Retry-After-Refresh']) {
        // Chỉ refresh token một lần tại một thời điểm
        if (!isRefreshing) {
          isRefreshing = true;
          
          try {
            // Lấy thông tin cần thiết cho refresh token
            const storedUserId = localStorage.getItem('userId');
            const currentToken = Cookies.get('token');
            
            // Kiểm tra xem có đủ thông tin để refresh không
            if (!storedUserId || !currentToken) {
              throw new Error('Thiếu thông tin để làm mới token');
            }
            
            // Sử dụng API endpoint refresh token
            const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
              token: currentToken,
              userId: storedUserId
            }, {
              withCredentials: true // Đảm bảo cookies được gửi đi
            });
            
            // Kiểm tra response từ API
            if (!refreshResponse.data?.isValid || !refreshResponse.data?.data) {
              throw new Error('Refresh token không thành công');
            }
            
            // Lấy token mới từ response
            const { token: newToken, jwtToken } = refreshResponse.data.data;
            
            // Đánh dấu đã refresh xong
            isRefreshing = false;
            
            if (newToken) {
              // Reset số lượng lỗi 401 liên tiếp
              consecutive401Count = 0;
              
              // Cập nhật cookie với token mới
              Cookies.set('token', newToken, {
                expires: 7,
                path: '/',
                secure: window.location.protocol === 'https:',
                sameSite: 'strict'
              });
              
              // Lưu JWT token (nếu cần)
              localStorage.setItem('jwtToken', jwtToken);
              
              // Thông báo cho tất cả các subscriber rằng token đã được refresh
              onTokenRefreshed(newToken);
              
              // Thêm header để đánh dấu request này đã được thử lại sau khi refresh token
              originalRequest.headers['X-Retry-After-Refresh'] = 'true';
              
              // Thử lại request ban đầu
              return apiClient(originalRequest);
            } else {
              // Nếu không nhận được token mới, chuyển hướng đến trang đăng nhập
              window.location.href = '/login?tokenExpired=true';
              return Promise.reject(error);
            }
          } catch (refreshError) {
            // Nếu refresh token thất bại
            isRefreshing = false;
            onTokenRefreshFailed();
            
            // Xóa thông tin đăng nhập và chuyển hướng đến trang đăng nhập
            secureCookie.clearSessionInfo();
            
            window.location.href = '/login?tokenExpired=true';
            return Promise.reject(error);
          }
        } else {
          // Nếu đang refresh token, thêm request hiện tại vào hàng đợi
          return new Promise(resolve => {
            subscribeTokenRefresh(token => {
              // Thêm header để đánh dấu request này đã được thử lại sau khi refresh token
              originalRequest.headers['X-Retry-After-Refresh'] = 'true';
              resolve(apiClient(originalRequest));
            });
          });
        }
      } else {
        // Nếu đã thử refresh token nhưng vẫn bị lỗi 401
        // Xóa thông tin đăng nhập và chuyển hướng đến trang đăng nhập
        secureCookie.clearSessionInfo();
        window.location.href = '/login?authError=true';
        return Promise.reject(error);
      }
    } else {
      // Reset số lượng lỗi 401 liên tiếp nếu gặp lỗi khác
      consecutive401Count = 0;
    }
    
    // Xử lý các lỗi chung
    if (error.response) {
      console.error(`[API Response Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
        status: error.response.status
      });
      
      // Xử lý lỗi 403 (Forbidden)
      if (error.response.status === 403) {
        // Người dùng không có quyền truy cập tài nguyên này
        console.error('Không có quyền truy cập tài nguyên');
      }
      
      // Xử lý lỗi 500 (Server Error)
      if (error.response.status >= 500) {
        console.error('Lỗi máy chủ, vui lòng thử lại sau');
      }
    } else if (error.request) {
      console.error('[API No Response]', error.message);
    } else {
      console.error('[API Error]', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Các hàm tiện ích cho requests
export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => 
    apiClient.get<T>(url, config),
  
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => 
    apiClient.post<T>(url, data, config),
  
  put: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => 
    apiClient.put<T>(url, data, config),
  
  delete: <T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => 
    apiClient.delete<T>(url, config)
};

export default apiClient; 