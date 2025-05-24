import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Danh sách các trang public không cần xác thực
const publicPaths = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/verify-phone',
  '/forbidden', // Allow access to forbidden page
];

// Danh sách các trang người dùng đã đăng nhập không được truy cập
const authRedirectPaths = [
  '/login',
  '/register',
  '/forgot-password',
  '/verify-phone',
  '/'
];

// Danh sách các trang bảo vệ (yêu cầu xác thực)
const protectedPaths = [
  '/dashboard',
  '/profile',
  '/notifications',
  '/chat',
  '/resources',
  '/courses',
  '/assignments',
  '/assignments/create',
  '/classes',
  '/classes/[id]',
  '/classes/[id]/meeting',
  '/grades',
  '/schedule',
  '/admin',
  '/admin/accounts',
  '/admin/classes',
  '/admin/settings',
  '/admin/analytics',
  '/admin/reports',
  '/resources/[id]',
  '/admin/holidays',
  '/admin/subjects'
];

// Danh sách các trang chỉ dành cho Admin
const adminPaths = [
  '/admin',
  '/admin/accounts',
  '/admin/classes',
  '/admin/settings',
  '/admin/analytics',
  '/admin/reports',
  '/admin/holidays',
  '/admin/subjects'
];

// Kiểm tra xem đường dẫn có thuộc danh sách public hay không
const isPublicPath = (path: string) => {
  return publicPaths.some((publicPath) => path === publicPath || path.startsWith(`${publicPath}/`));
};

// Kiểm tra xem đường dẫn có thuộc danh sách cần chuyển hướng khi đã đăng nhập hay không
const isAuthRedirectPath = (path: string) => {
  return authRedirectPaths.some((redirectPath) => path === redirectPath || path.startsWith(`${redirectPath}/`));
};

// Kiểm tra xem đường dẫn có thuộc danh sách bảo vệ hay không
const isProtectedPath = (path: string) => {
  return protectedPaths.some((protectedPath) => path === protectedPath || path.startsWith(`${protectedPath}/`));
};

// Kiểm tra xem đường dẫn có thuộc danh sách chỉ dành cho Admin hay không
const isAdminPath = (path: string) => {
  // Check if path starts with /admin/
  return path.startsWith('/admin/') || path === '/admin';
};

// Các đường dẫn tĩnh không cần xử lý middleware
const staticPaths = [
  '/_next',
  '/favicon.ico',
  '/static',
  '/api',
  '/images',
];

// Kiểm tra nếu đường dẫn là tài nguyên tĩnh
const isStaticPath = (path: string) => {
  return staticPaths.some(staticPath => path.startsWith(staticPath));
};

// Hàm kiểm tra người dùng có quyền Admin không - đơn giản hóa
const isAdmin = (request: NextRequest): boolean => {
  // Kiểm tra cookie 'role' có giá trị là 'Admin' không
  const roleCookie = request.cookies.get('role')?.value;
  return roleCookie === 'Admin';
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Bỏ qua tài nguyên tĩnh
  if (isStaticPath(pathname)) {
    return NextResponse.next();
  }
  
  // Lấy token từ cookie
  const token = request.cookies.get('token')?.value || '';
  
  // Kiểm tra token có tồn tại không
  const hasToken = !!token;
  
  // Nếu đường dẫn là trang bảo vệ và không có token, chuyển hướng đến trang đăng nhập
  if (isProtectedPath(pathname) && !hasToken) {
    const url = new URL('/login', request.url);
    // Lưu đường dẫn hiện tại để sau khi đăng nhập có thể quay lại
    url.searchParams.set('returnUrl', pathname);
    // Thêm tham số authRequired để biết đây là chuyển hướng do người dùng chưa xác thực
    url.searchParams.set('authRequired', 'true');
    return NextResponse.redirect(url);
  }
  
  // Nếu đường dẫn là trang Admin và không phải là Admin, chuyển hướng đến trang forbidden
  if (isAdminPath(pathname) && hasToken && !isAdmin(request)) {
    const url = new URL('/forbidden', request.url);
    // Truyền thông tin về trang được yêu cầu và quyền cần thiết
    url.searchParams.set('from', pathname);
    url.searchParams.set('requiredRole', 'Admin');
    return NextResponse.redirect(url);
  }
  
  // Nếu đã đăng nhập và đang cố truy cập trang đăng nhập/đăng ký, chuyển hướng về dashboard
  if (hasToken && isAuthRedirectPath(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Nếu không có điều kiện nào ở trên, cho phép tiếp tục
  return NextResponse.next();
}

// Chỉ áp dụng middleware cho các trang cụ thể
export const config = {
  matcher: [
    // Loại trừ các tài nguyên tĩnh một cách rõ ràng
    '/((?!api|_next/static|_next/image|favicon.ico|static|images).*)',
  ],
};
