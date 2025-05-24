import { api } from './client';
import { ApiResponse } from './auth';
import axios from 'axios';

// Sử dụng URL riêng cho Holiday API
const HOLIDAY_API_URL = process.env.NEXT_PUBLIC_HOLIDAY_API_URL || 'https://holiday-api-ruby.vercel.app';

// Tạo instance axios riêng cho Holiday API
const holidayApi = axios.create({
  baseURL: HOLIDAY_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 30000
});

/**
 * Interface cho đối tượng Holiday
 */
export interface Holiday {
  id?: string;
  name: string;
  description?: string;
  startDate: string;
  endDate?: string;
  isRecurring?: boolean;
  type?: 'static' | 'dynamic';
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Type để giúp xử lý cả dữ liệu trực tiếp hoặc dạng wrapped
type HolidayResponseData = Holiday[] | ApiResponse<Holiday[]> | any;

/**
 * Service quản lý các API liên quan đến Holiday
 */
export const HolidayService = {
  /**
   * Lấy tất cả ngày nghỉ
   * @returns Danh sách ngày nghỉ
   */
  getAllHolidays: async (): Promise<Holiday[]> => {
    try {
      const response = await holidayApi.get<HolidayResponseData>('/api/holidays');
      
      // Check if the response is an array directly
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      // Check if the response has our standard ApiResponse format
      if (response.data?.isValid && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      
      // If response is an object that contains holidays data in a non-standard format
      // Try to detect common patterns (for future API compatibility)
      if (response.data && typeof response.data === 'object') {
        // Check if the response object has a property that contains an array of holidays
        for (const key in response.data) {
          if (Array.isArray(response.data[key])) {
            const possibleHolidays = response.data[key];
            // Verify this looks like an array of holiday objects
            if (possibleHolidays.length > 0 && 
                possibleHolidays[0].name && 
                possibleHolidays[0].startDate) {
              console.log(`Found holidays array in response.data.${key}`);
              return possibleHolidays;
            }
          }
        }
      }
      
      console.error('API Response invalid:', response.data);
      return []; // Trả về mảng trống nếu không có dữ liệu hợp lệ
    } catch (error: any) {
      console.error('Lỗi khi lấy danh sách ngày nghỉ:', error);
      throw new Error(error.message || 'Không thể lấy danh sách ngày nghỉ');
    }
  },

  /**
   * Lấy danh sách ngày nghỉ cho một năm cụ thể
   * @param year Năm cần lấy danh sách ngày nghỉ
   * @returns Danh sách ngày nghỉ của năm được chỉ định
   */
  getHolidaysForYear: async (year: number): Promise<Holiday[]> => {
    try {
      const response = await holidayApi.get<HolidayResponseData>(`/api/holidays?year=${year}`);
      
      // Check if the response is an array directly
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      // Check if the response has our standard ApiResponse format
      if (response.data?.isValid && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      
      // If response is an object that contains holidays data in a non-standard format
      if (response.data && typeof response.data === 'object') {
        // Similar pattern detection as in getAllHolidays
        for (const key in response.data) {
          if (Array.isArray(response.data[key])) {
            const possibleHolidays = response.data[key];
            if (possibleHolidays.length > 0 && 
                possibleHolidays[0].name && 
                possibleHolidays[0].startDate) {
              return possibleHolidays;
            }
          }
        }
      }
      
      return []; // Trả về mảng trống nếu không có dữ liệu hợp lệ
    } catch (error: any) {
      console.error(`Lỗi khi lấy danh sách ngày nghỉ cho năm ${year}:`, error);
      
      // Nếu lỗi 400, trả về mảng trống thay vì throw error
      if (error.response && error.response.status === 400) {
        return [];
      }
      
      throw new Error(error.message || `Không thể lấy danh sách ngày nghỉ cho năm ${year}`);
    }
  },

  /**
   * Lấy danh sách ngày nghỉ sắp tới
   * @returns Danh sách ngày nghỉ sắp tới
   */
  getUpcomingHolidays: async (): Promise<Holiday[]> => {
    try {
      const response = await holidayApi.get<HolidayResponseData>('/api/holidays/upcoming');
      
      // Check if the response is an array directly
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      // Check if the response has our standard ApiResponse format
      if (response.data?.isValid && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      
      // Similar pattern detection as in getAllHolidays
      if (response.data && typeof response.data === 'object') {
        for (const key in response.data) {
          if (Array.isArray(response.data[key])) {
            const possibleHolidays = response.data[key];
            if (possibleHolidays.length > 0 && 
                possibleHolidays[0].name && 
                possibleHolidays[0].startDate) {
              return possibleHolidays;
            }
          }
        }
      }
      
      return []; // Trả về mảng trống nếu không có dữ liệu hợp lệ
    } catch (error: any) {
      console.error('Lỗi khi lấy danh sách ngày nghỉ sắp tới:', error);
      throw new Error(error.message || 'Không thể lấy danh sách ngày nghỉ sắp tới');
    }
  },

  /**
   * Lấy danh sách ngày nghỉ trong khoảng thời gian
   * @param startDate Ngày bắt đầu (định dạng YYYY-MM-DD)
   * @param endDate Ngày kết thúc (định dạng YYYY-MM-DD)
   * @returns Danh sách ngày nghỉ trong khoảng thời gian
   */
  getHolidaysInRange: async (startDate: string, endDate: string): Promise<Holiday[]> => {
    try {
      const response = await holidayApi.get<HolidayResponseData>(
        `/api/holidays/in-range?start=${startDate}&end=${endDate}`
      );
      
      // Check if the response is an array directly
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      // Check if the response has our standard ApiResponse format
      if (response.data?.isValid && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      
      // Similar pattern detection as in getAllHolidays
      if (response.data && typeof response.data === 'object') {
        for (const key in response.data) {
          if (Array.isArray(response.data[key])) {
            const possibleHolidays = response.data[key];
            if (possibleHolidays.length > 0 && 
                possibleHolidays[0].name && 
                possibleHolidays[0].startDate) {
              return possibleHolidays;
            }
          }
        }
      }
      
      return []; // Trả về mảng trống nếu không có dữ liệu hợp lệ
    } catch (error: any) {
      console.error('Lỗi khi lấy danh sách ngày nghỉ trong khoảng thời gian:', error);
      
      // Nếu lỗi 400, trả về mảng trống thay vì throw error
      if (error.response && error.response.status === 400) {
        return [];
      }
      
      throw new Error(error.message || 'Không thể lấy danh sách ngày nghỉ trong khoảng thời gian');
    }
  },

  /**
   * Thêm ngày nghỉ mới
   * @param holidayData Thông tin ngày nghỉ mới
   * @returns Thông tin ngày nghỉ đã được tạo
   */
  createHoliday: async (holidayData: Holiday): Promise<Holiday> => {
    try {
      // Đảm bảo type mặc định là 'dynamic' cho admin
      const requestData = {
        ...holidayData,
        type: holidayData.type || 'dynamic'
      };
      
      const response = await holidayApi.post('/api/holidays', requestData);
      
      // Check if the response data is a direct Holiday object by checking its fields
      if (response.data && typeof response.data === 'object' && 
          'name' in response.data && 'startDate' in response.data) {
        return response.data as Holiday;
      }
      
      // Check if the response has our standard ApiResponse format
      if (response.data && typeof response.data === 'object' && 
          'isValid' in response.data && response.data.isValid && 
          'data' in response.data && response.data.data) {
        return response.data.data as Holiday;
      }
      
      console.error('API Response invalid for create holiday:', response.data);
      throw new Error('Không thể tạo ngày nghỉ mới - Phản hồi API không hợp lệ');
    } catch (error: any) {
      console.error('Lỗi khi tạo ngày nghỉ mới:', error);
      throw new Error(error.message || 'Không thể tạo ngày nghỉ mới');
    }
  },

  /**
   * Import ngày nghỉ tĩnh
   * @returns Kết quả import
   */
  importStaticHolidays: async (): Promise<{ totalAdded: number, totalSkipped: number }> => {
    try {
      const response = await holidayApi.post('/api/holidays/import-static');
      
      // Check if the response has our standard ApiResponse format
      if (response.data && typeof response.data === 'object' && 
          'isValid' in response.data && response.data.isValid && 
          'data' in response.data && response.data.data) {
        return {
          totalAdded: response.data.data.totalAdded || 0,
          totalSkipped: response.data.data.totalSkipped || 0
        };
      }
      
      // Check for direct response format
      if (response.data && typeof response.data === 'object') {
        // Try to find totalAdded and totalSkipped in the response
        if ('totalAdded' in response.data && 'totalSkipped' in response.data) {
          return {
            totalAdded: response.data.totalAdded || 0,
            totalSkipped: response.data.totalSkipped || 0
          };
        }
        
        // Check if there's a results array we can count
        if ('results' in response.data && Array.isArray(response.data.results)) {
          const added = response.data.results.filter((r: any) => r.status === 'added').length;
          const skipped = response.data.results.filter((r: any) => r.status === 'skipped').length;
          return { totalAdded: added, totalSkipped: skipped };
        }
      }
      
      console.error('API Response invalid for import holidays:', response.data);
      return { totalAdded: 0, totalSkipped: 0 }; // Default response
    } catch (error: any) {
      console.error('Lỗi khi import ngày nghỉ tĩnh:', error);
      throw new Error(error.message || 'Không thể import ngày nghỉ tĩnh');
    }
  },

  /**
   * Lấy thông tin chi tiết của một ngày nghỉ
   * @param id ID của ngày nghỉ
   * @returns Thông tin chi tiết của ngày nghỉ
   */
  getHolidayById: async (id: string): Promise<Holiday> => {
    try {
      const response = await holidayApi.get(`/api/holidays/${id}`);
      
      // Check if the response data is a Holiday object directly by checking properties
      if (response.data && typeof response.data === 'object' && 
          'name' in response.data && 'startDate' in response.data) {
        return response.data as Holiday;
      }
      
      // Check if the response has our standard ApiResponse format
      if (response.data && typeof response.data === 'object' && 
          'isValid' in response.data && response.data.isValid && 
          'data' in response.data && response.data.data) {
        return response.data.data as Holiday;
      }
      
      console.error('API Response invalid for get holiday by ID:', response.data);
      throw new Error('Không thể lấy thông tin ngày nghỉ - Phản hồi API không hợp lệ');
    } catch (error: any) {
      console.error('Lỗi khi lấy thông tin ngày nghỉ:', error);
      throw new Error(error.message || 'Không thể lấy thông tin ngày nghỉ');
    }
  },

  /**
   * Cập nhật thông tin ngày nghỉ
   * @param id ID của ngày nghỉ
   * @param holidayData Thông tin ngày nghỉ cần cập nhật
   * @returns Thông tin ngày nghỉ đã cập nhật
   */
  updateHoliday: async (id: string, holidayData: Holiday): Promise<Holiday> => {
    try {
      const response = await holidayApi.put(`/api/holidays/${id}`, holidayData);
      
      // Check if the response data is a Holiday object directly by checking properties
      if (response.data && typeof response.data === 'object' && 
          'name' in response.data && 'startDate' in response.data) {
        return response.data as Holiday;
      }
      
      // Check if the response has our standard ApiResponse format
      if (response.data && typeof response.data === 'object' && 
          'isValid' in response.data && response.data.isValid && 
          'data' in response.data && response.data.data) {
        return response.data.data as Holiday;
      }
      
      console.error('API Response invalid for update holiday:', response.data);
      throw new Error('Không thể cập nhật thông tin ngày nghỉ - Phản hồi API không hợp lệ');
    } catch (error: any) {
      console.error('Lỗi khi cập nhật thông tin ngày nghỉ:', error);
      throw new Error(error.message || 'Không thể cập nhật thông tin ngày nghỉ');
    }
  },

  /**
   * Xóa một ngày nghỉ
   * @param id ID của ngày nghỉ cần xóa
   * @returns Kết quả xóa
   */
  deleteHoliday: async (id: string): Promise<boolean> => {
    try {
      const response = await holidayApi.delete(`/api/holidays/${id}`);
      
      // Check if the response has our standard ApiResponse format
      if (response.data?.isValid) {
        return true;
      }
      
      // Check for direct response format - often delete just returns a success message or status
      if (response.data && typeof response.data === 'object') {
        // Look for any indication of success
        if (response.data.success === true || 
            response.status === 200 || 
            response.status === 204) {
          return true;
        }
      }
      
      // If we made it here without error and got a 2xx status code, assume success
      if (response.status >= 200 && response.status < 300) {
        return true;
      }
      
      console.error('API Response invalid for delete holiday:', response.data);
      throw new Error('Không thể xóa ngày nghỉ - Phản hồi API không hợp lệ');
    } catch (error: any) {
      console.error('Lỗi khi xóa ngày nghỉ:', error);
      throw new Error(error.message || 'Không thể xóa ngày nghỉ');
    }
  }
};

export default HolidayService; 