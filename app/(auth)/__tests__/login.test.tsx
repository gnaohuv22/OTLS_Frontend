import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from '../login/page';
import { useAuth } from '@/lib/auth-context';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthService } from '@/lib/api/auth';
import { useToast } from "@/components/ui/use-toast";

// Mock các module cần thiết
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn()
}));

jest.mock('@/lib/auth-context', () => ({
  useAuth: jest.fn()
}));

jest.mock('@/lib/api/auth', () => ({
  AuthService: {
    login: jest.fn()
  }
}));

// Sửa mock toast để phản ánh cách sử dụng thực tế
jest.mock('@/components/ui/use-toast', () => {
  const toastFn = jest.fn();
  return {
    useToast: () => ({ toast: toastFn }),
    toast: toastFn
  };
});

describe('Trang đăng nhập', () => {
  // Thiết lập mocks trước mỗi test
  beforeEach(() => {
    // Mock router
    const pushMock = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push: pushMock
    });
    
    // Mock search params
    const getMock = jest.fn();
    (useSearchParams as jest.Mock).mockReturnValue({
      get: getMock
    });
    getMock.mockImplementation((param) => {
      if (param === 'returnUrl') return '/dashboard';
      if (param === 'authRequired') return null;
      return null;
    });
    
    // Mock auth context
    (useAuth as jest.Mock).mockReturnValue({
      login: jest.fn(),
      isAuthenticated: false
    });
    
    // Mock toast
    const toastMock = { toast: jest.fn() };
    (useToast as jest.Mock).mockReturnValue(toastMock);
  });

  test('Hiển thị form đăng nhập với các trường thông tin cần thiết', () => {
    render(<LoginPage />);
    
    // Kiểm tra các phần tử UI quan trọng
    expect(screen.getByRole('heading', { name: /đăng nhập/i })).toBeInTheDocument();
    expect(screen.getByLabelText('Tên đăng nhập')).toBeInTheDocument();
    expect(screen.getByLabelText('Mật khẩu')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /đăng nhập/i })).toBeInTheDocument();
    expect(screen.getByText('Đăng ký ngay')).toBeInTheDocument();
    expect(screen.getByText('Quên mật khẩu?')).toBeInTheDocument();
  });

  test('Hiển thị lỗi khi submit form với thông tin không hợp lệ', async () => {
    render(<LoginPage />);
    
    // Click nút đăng nhập mà không nhập thông tin
    fireEvent.click(screen.getByRole('button', { name: /đăng nhập/i }));
    
    // Kiểm tra thông báo lỗi
    expect(await screen.findByText('Vui lòng nhập tên đăng nhập')).toBeInTheDocument();
    expect(await screen.findByText('Vui lòng nhập mật khẩu')).toBeInTheDocument();
  });

  test('Gọi API đăng nhập với thông tin hợp lệ', async () => {
    // Setup mock cho AuthService.login
    (AuthService.login as jest.Mock).mockResolvedValue({
      success: true,
      userData: { id: '1', name: 'Test User' },
      token: 'test-token',
      roleName: 'Student'
    });

    render(<LoginPage />);
    
    // Nhập thông tin đăng nhập
    fireEvent.change(screen.getByLabelText('Tên đăng nhập'), {
      target: { value: 'testuser' }
    });
    fireEvent.change(screen.getByLabelText('Mật khẩu'), {
      target: { value: 'password123' }
    });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /đăng nhập/i }));
    
    // Kiểm tra API được gọi với đúng tham số
    await waitFor(() => {
      expect(AuthService.login).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'password123'
      });
    });
    
    // Kiểm tra hàm login từ context được gọi
    await waitFor(() => {
      expect(useAuth().login).toHaveBeenCalled();
    });
    
    // Kiểm tra redirect sau khi đăng nhập thành công
    await waitFor(() => {
      expect(useRouter().push).toHaveBeenCalledWith('/dashboard');
    });
  });

  test('Hiển thị thông báo lỗi khi đăng nhập thất bại', async () => {
    // Setup mock cho AuthService.login trả về lỗi
    (AuthService.login as jest.Mock).mockResolvedValue({
      success: false
    });

    render(<LoginPage />);
    
    // Nhập thông tin đăng nhập
    fireEvent.change(screen.getByLabelText('Tên đăng nhập'), {
      target: { value: 'wronguser' }
    });
    fireEvent.change(screen.getByLabelText('Mật khẩu'), {
      target: { value: 'wrongpass' }
    });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /đăng nhập/i }));
    
    // Không thể kiểm tra toast trực tiếp, nhưng có thể kiểm tra API được gọi
    await waitFor(() => {
      expect(AuthService.login).toHaveBeenCalledWith({
        username: 'wronguser',
        password: 'wrongpass'
      });
    });
    
    // Kiểm tra router.push không được gọi khi đăng nhập thất bại
    await waitFor(() => {
      expect(useRouter().push).not.toHaveBeenCalled();
    });
  });

  test('Kiểm tra chức năng hiện/ẩn mật khẩu', () => {
    render(<LoginPage />);
    
    // Mặc định mật khẩu được ẩn
    const passwordInput = screen.getByLabelText('Mật khẩu');
    expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Click vào nút show password
    fireEvent.click(screen.getByRole('button', { 
      name: '',  // Button không có text
    }));
    
    // Mật khẩu nên được hiện thị dưới dạng text
    expect(passwordInput).toHaveAttribute('type', 'text');
    
    // Click lại để ẩn mật khẩu
    fireEvent.click(screen.getByRole('button', { 
      name: '', 
    }));
    
    // Mật khẩu nên được ẩn lại
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('Chuyển hướng khi người dùng đã đăng nhập', () => {
    // Giả lập người dùng đã đăng nhập
    (useAuth as jest.Mock).mockReturnValue({
      login: jest.fn(),
      isAuthenticated: true
    });
    
    render(<LoginPage />);
    
    // Kiểm tra router.push được gọi để chuyển hướng
    expect(useRouter().push).toHaveBeenCalledWith('/dashboard');
  });

  test('Hiển thị thông báo lỗi khi gặp lỗi mạng', async () => {
    // Mock API ném ra lỗi Network
    (AuthService.login as jest.Mock).mockRejectedValue({ 
      message: 'Network Error' 
    });

    render(<LoginPage />);
    
    // Nhập thông tin đăng nhập
    fireEvent.change(screen.getByLabelText('Tên đăng nhập'), {
      target: { value: 'testuser' }
    });
    fireEvent.change(screen.getByLabelText('Mật khẩu'), {
      target: { value: 'password123' }
    });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /đăng nhập/i }));
    
    // Kiểm tra API được gọi
    await waitFor(() => {
      expect(AuthService.login).toHaveBeenCalled();
    });
    
    // Kiểm tra không chuyển hướng khi có lỗi mạng
    await waitFor(() => {
      expect(useRouter().push).not.toHaveBeenCalled();
    });
  });

  test('Kiểm tra tương tác với form đăng nhập', async () => {
    render(<LoginPage />);
    
    // Kiểm tra trạng thái ban đầu
    const usernameInput = screen.getByLabelText('Tên đăng nhập');
    const passwordInput = screen.getByLabelText('Mật khẩu');
    
    expect(usernameInput).toHaveValue('');
    expect(passwordInput).toHaveValue('');
    
    // Nhập và xóa giá trị
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    expect(usernameInput).toHaveValue('testuser');
    
    fireEvent.change(usernameInput, { target: { value: '' } });
    expect(usernameInput).toHaveValue('');
    
    // Kiểm tra tab index
    expect(usernameInput).toHaveAttribute('name', 'username');
    expect(passwordInput).toHaveAttribute('name', 'password');
  });

  test('Kiểm tra các link trên trang đăng nhập', () => {
    render(<LoginPage />);
    
    // Kiểm tra link đăng ký
    const registerLink = screen.getByText('Đăng ký ngay');
    expect(registerLink).toHaveAttribute('href', '/register');
    
    // Kiểm tra link quên mật khẩu
    const forgotPasswordLink = screen.getByText('Quên mật khẩu?');
    expect(forgotPasswordLink).toHaveAttribute('href', '/forgot-password');
  });

  test('Hiển thị toast thành công khi đăng nhập thành công', async () => {
    // Setup mock cho AuthService.login
    (AuthService.login as jest.Mock).mockResolvedValue({
      success: true,
      userData: { id: '1', name: 'Test User' },
      token: 'test-token',
      roleName: 'Student'
    });

    render(<LoginPage />);
    
    // Nhập thông tin đăng nhập
    fireEvent.change(screen.getByLabelText('Tên đăng nhập'), {
      target: { value: 'testuser' }
    });
    fireEvent.change(screen.getByLabelText('Mật khẩu'), {
      target: { value: 'password123' }
    });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /đăng nhập/i }));
    
    // Kiểm tra toast được gọi với thông báo thành công
    await waitFor(() => {
      expect(useToast().toast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.stringContaining("thành công")
        })
      );
    });
  });

  test('Hiển thị toast lỗi khi đăng nhập thất bại do server', async () => {
    // Setup mock cho AuthService.login ném lỗi response
    (AuthService.login as jest.Mock).mockRejectedValue({
      response: { status: 500 }
    });

    render(<LoginPage />);
    
    // Nhập thông tin đăng nhập
    fireEvent.change(screen.getByLabelText('Tên đăng nhập'), {
      target: { value: 'testuser' }
    });
    fireEvent.change(screen.getByLabelText('Mật khẩu'), {
      target: { value: 'password123' }
    });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /đăng nhập/i }));
    
    // Kiểm tra toast được gọi với thông báo lỗi
    await waitFor(() => {
      expect(useToast().toast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: "destructive"
        })
      );
    });
  });
}); 