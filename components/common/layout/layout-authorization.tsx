'use client';

import { Sidebar } from "@/components/common/layout/sidebar";
import { Header } from "@/components/common/layout/header";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { role, isAuthenticated } = useAuth();
  
  // Kiểm tra nếu đường dẫn hiện tại là trang public
  const isPublicPage = pathname === "/" || // Splash screen
                      pathname === "/login" || // Login page
                      pathname === "/register" || // Register page
                      pathname === "/verify-phone" || // Verify phone
                      pathname === "/forbidden" || // Forbidden page
                      pathname === "/forgot-password" || // Forgot password page
                      pathname?.startsWith("/auth") || // Other auth pages
                      pathname?.includes("/(marketing)"); // Marketing pages

  // Xác định padding dựa trên role
  const layoutPadding = role === 'Parent' ? '' : 'sm:pl-14 md:pl-14 lg:pl-14';

  // Nếu là trang public hoặc chưa đăng nhập, không hiển thị header và sidebar
  if (isPublicPage || !isAuthenticated) {
    return (
      <div className="min-h-screen w-full">
        {children}
      </div>
    );
  }

  // Các trang yêu cầu đăng nhập sẽ hiển thị sidebar và header
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      {role !== 'Parent' && <Sidebar />}
      <div className={`flex flex-col ${layoutPadding}`}>
        <Header />
        <main className="grid flex-1 items-start gap-2 p-4 sm:px-6 md:gap-4">
          {children}
        </main>
      </div>
    </div>
  );
} 