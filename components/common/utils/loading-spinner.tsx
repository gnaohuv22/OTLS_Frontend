'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useLoadingStore } from '@/hooks/use-loading';

/**
 * Custom hook theo dõi trạng thái loading khi chuyển trang
 */
export function useNavigationLoading() {
  const [isNavigating, setIsNavigating] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPathRef = useRef('');
  const { isLoading: isGlobalLoading } = useLoadingStore();

  // Cập nhật ref khi path thay đổi
  useEffect(() => {
    currentPathRef.current = pathname + searchParams.toString();
  }, [pathname, searchParams]);

  // Bắt đầu loading khi người dùng bắt đầu điều hướng
  const startNavigating = useCallback(() => {
    setIsNavigating(true);
  }, []);

  // Kết thúc loading khi navigation hoàn tất
  const stopNavigating = useCallback(() => {
    // Thêm một chút delay để tránh flickering nếu navigation quá nhanh
    setTimeout(() => {
      setIsNavigating(false);
    }, 300);
  }, []);

  // Theo dõi click trên các link
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      
      if (anchor && 
          anchor.href && 
          anchor.href.startsWith(window.location.origin) && 
          !anchor.target && // Loại trừ các link mở tab mới
          !anchor.hasAttribute('download') && // Loại trừ các link download
          !e.ctrlKey && !e.metaKey && !e.shiftKey) { // Loại trừ các click modifier
          
        // Kiểm tra nếu link này trỏ đến trang hiện tại thì không trigger loading
        const hrefWithoutOrigin = anchor.href.replace(window.location.origin, '');
        const currentPath = pathname + searchParams.toString();
        
        // So sánh URL đích với URL hiện tại, nếu giống nhau thì không hiển thị loading
        if (hrefWithoutOrigin === currentPath || 
            // Kiểm tra trường hợp có dấu "/" ở cuối URL
            (hrefWithoutOrigin + '/') === currentPath || 
            hrefWithoutOrigin === (currentPath + '/')) {
          // Không hiển thị loading khi nhấn vào link của trang hiện tại
          return;
        }
        
        startNavigating();
      }
    };

    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [startNavigating, pathname, searchParams]);

  // Theo dõi các sự kiện navigation của trình duyệt
  useEffect(() => {
    window.addEventListener('beforeunload', startNavigating);
    window.addEventListener('popstate', startNavigating);
    
    return () => {
      window.removeEventListener('beforeunload', startNavigating);
      window.removeEventListener('popstate', startNavigating);
    };
  }, [startNavigating]);

  // Dừng loading khi path thay đổi (navigation hoàn tất)
  useEffect(() => {
    stopNavigating();
  }, [pathname, searchParams, stopNavigating]);

  // Trả về true nếu đang navigation HOẶC có loading từ global state
  return { isLoading: isNavigating || isGlobalLoading };
}

/**
 * Component spinner hiển thị khi đang chuyển trang.
 * Các tính năng:
 * - Hiển thị overlay mờ toàn màn hình
 * - Hiển thị spinner ở giữa
 * - Chuyển động mượt mà (fade in/out)
 * - Hoạt động cho cả navigation và API requests
 */
export function LoadingSpinner() {
  const { isLoading } = useNavigationLoading();

  if (!isLoading) return null;

  return (
    <div 
      className={cn(
        "fixed inset-0 z-[9999] bg-background/70 backdrop-blur-sm",
        "flex items-center justify-center",
        "transition-opacity duration-300 ease-in-out",
        "animate-in fade-in"
      )}
      aria-busy="true"
      aria-live="polite"
    >
      {/* Container vuông cho spinner (tỉ lệ 1:1) */}
      <div className="bg-background/80 rounded-lg shadow-lg flex items-center justify-center w-40 h-40 p-0">
        <div className="relative flex flex-col items-center justify-center">
          <svg
            className="animate-spin h-20 w-20 text-primary"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="mt-4 text-sm font-medium text-foreground">Đang tải...</p>
        </div>
      </div>
    </div>
  );
} 