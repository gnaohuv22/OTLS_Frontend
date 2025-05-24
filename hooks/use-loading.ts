'use client';

import { create } from 'zustand';

type LoadingStore = {
  /**
   * Trạng thái loading toàn cục
   */
  isLoading: boolean;
  
  /**
   * Đếm số lượng request đang hoạt động để giúp quản lý trạng thái loading
   * cho nhiều request đồng thời
   */
  activeRequests: number;
  
  /**
   * Bắt đầu trạng thái loading
   */
  startLoading: () => void;
  
  /**
   * Kết thúc trạng thái loading
   */
  stopLoading: () => void;
  
  /**
   * Bắt đầu theo dõi một request mới
   * @returns hàm để kết thúc request
   */
  trackRequest: () => () => void;
};

/**
 * Store toàn cục dùng để quản lý trạng thái loading
 */
export const useLoadingStore = create<LoadingStore>((set: any) => ({
  isLoading: false,
  activeRequests: 0,
  
  startLoading: () => set({ isLoading: true }),
  
  stopLoading: () => set({ isLoading: false }),
  
  trackRequest: () => {
    set((state: LoadingStore) => ({ 
      activeRequests: state.activeRequests + 1,
      isLoading: true 
    }));
    
    return () => {
      set((state: LoadingStore) => {
        const newCount = Math.max(0, state.activeRequests - 1);
        return { 
          activeRequests: newCount,
          // Chỉ tắt loading khi không còn request nào đang hoạt động
          isLoading: newCount > 0
        };
      });
    };
  }
}));

/**
 * Hook cung cấp các hàm để quản lý trạng thái loading
 * Ví dụ sử dụng:
 * ```tsx
 * const { startLoading, stopLoading, withLoading } = useLoading();
 * 
 * // Sử dụng trực tiếp
 * const handleClick = async () => {
 *   startLoading();
 *   try {
 *     await fetchData();
 *   } finally {
 *     stopLoading();
 *   }
 * };
 * 
 * // Hoặc dùng hàm withLoading cho gọn hơn
 * const handleSubmit = withLoading(async () => {
 *   await saveData();
 * });
 * ```
 */
export function useLoading() {
  const { startLoading, stopLoading, trackRequest } = useLoadingStore();
  
  /**
   * Bọc một hàm async với trạng thái loading
   */
  const withLoading = <T extends (...args: any[]) => Promise<any>>(fn: T) => {
    return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
      const endTracking = trackRequest();
      try {
        return await fn(...args) as ReturnType<T>;
      } finally {
        endTracking();
      }
    };
  };
  
  return {
    startLoading,
    stopLoading,
    withLoading,
    trackRequest
  };
}

export default useLoading; 