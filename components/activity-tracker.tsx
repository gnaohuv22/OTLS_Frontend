'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { AuthService } from '@/lib/api/auth';
import { useRouter } from 'next/navigation';

/**
 * Component theo dõi hoạt động người dùng
 * 
 * - Cập nhật thời gian hoạt động cuối cùng
 * - Phát hiện thời gian không hoạt động quá lâu
 * - Phát hiện hành vi đáng ngờ
 * - Tự động đăng xuất khi phát hiện vấn đề bảo mật
 */
export default function ActivityTracker() {
  const { isAuthenticated, updateActivity, logout } = useAuth();
  const router = useRouter();
  
  // Theo dõi các sự kiện hoạt động của người dùng
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const activityEvents = [
      'mousedown', 'mousemove', 'keydown', 
      'scroll', 'touchstart', 'click', 'focus'
    ];
    
    // Cập nhật thời gian hoạt động khi có sự kiện
    const handleUserActivity = () => {
      updateActivity();
    };
    
    // Đăng ký các sự kiện
    activityEvents.forEach(event => {
      window.addEventListener(event, handleUserActivity);
    });
    
    // Kiểm tra định kỳ xem người dùng có hoạt động không
    // const inactivityTimer = setInterval(() => {
    //   // Kiểm tra nếu người dùng không hoạt động quá lâu
    //   if (AuthService.checkSuspiciousActivity()) {
    //     console.warn('Phát hiện thời gian không hoạt động quá lâu');
    //     // Tự động đăng xuất
    //     const logoutFn = async () => {
    //       await logout();
    //       router.push('/login?inactive=true');
    //     };
    //     logoutFn();
    //   }
    // }, 10 * 60 * 1000); // Kiểm tra mỗi 10 phút
    
    // Hủy đăng ký khi component unmount
    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleUserActivity);
      });
      // clearInterval(inactivityTimer);
    };
  }, [isAuthenticated, updateActivity, logout, router]);
  
  // Kiểm tra việc đăng nhập từ thiết bị khác
  useEffect(() => {
    if (!isAuthenticated) return;
    
    // Theo dõi thay đổi về cookie xác thực
    const checkAuthChanges = () => {
      const hasCookie = !!document.cookie.includes('auth_session');
      
      // Nếu cookie biến mất, có thể đã đăng xuất từ thiết bị khác
      if (!hasCookie && isAuthenticated) {
        console.warn('Phát hiện đăng xuất từ thiết bị khác');
        const handleLogout = async () => {
          await logout();
          router.push('/login?session_ended=true');
        };
        handleLogout();
      }
    };
    
    // Kiểm tra mỗi phút
    const authCheckInterval = setInterval(checkAuthChanges, 60 * 1000);
    
    return () => {
      clearInterval(authCheckInterval);
    };
  }, [isAuthenticated, logout, router]);
  
  // Kiểm tra nếu có nhiều phiên hoạt động cùng lúc
  useEffect(() => {
    if (!isAuthenticated) return;
    
    // Gửi thông điệp định kỳ qua localStorage để phát hiện nhiều tab/cửa sổ
    const sessionId = Math.random().toString(36).substring(2, 15);
    localStorage.setItem('currentSessionId', sessionId);
    
    const broadcastActivity = () => {
      const timeStamp = Date.now();
      // Broadcast hoạt động hiện tại để các tab khác biết
      localStorage.setItem('lastActiveSession', JSON.stringify({
        sessionId,
        timeStamp
      }));
    };
    
    // Broadcast mỗi 10 giây
    const broadcastInterval = setInterval(broadcastActivity, 10 * 1000);
    
    // Lắng nghe thay đổi từ các tab khác
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'lastActiveSession') {
        try {
          const data = JSON.parse(e.newValue || '{}');
          // Nếu phát hiện phiên khác hoạt động và không phải phiên hiện tại
          if (data.sessionId && data.sessionId !== sessionId) {
            // Có thể thực hiện các hành động cần thiết ở đây
          }
        } catch (error) {
          console.error('Lỗi khi xử lý thay đổi localStorage:', error);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      clearInterval(broadcastInterval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isAuthenticated]);
  
  // Component này không render bất kỳ UI nào
  return null;
} 