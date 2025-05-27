import { 
  createUserWithEmailAndPassword, 
  sendEmailVerification, 
  onAuthStateChanged,
  User,
  signOut,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '@/lib/firebase/config';

// Temporary storage for OTP codes (in production, use Firebase Firestore or backend)
const otpStorage = new Map<string, { code: string; timestamp: number; email: string }>();

/**
 * Tạo mã OTP 6 số ngẫu nhiên
 */
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Gửi email OTP tùy chỉnh cho quên mật khẩu
 * @param email Email của người dùng
 * @returns Promise với kết quả gửi email
 */
export async function sendCustomOTPEmail(email: string): Promise<{ success: boolean; message: string }> {
  try {
    console.log('[Firebase Auth] Đang gửi OTP email tùy chỉnh cho:', email);
    
    // Tạo mã OTP
    const otp = generateOTP();
    const timestamp = Date.now();
    
    // Lưu OTP vào storage (5 phút hết hạn)
    otpStorage.set(email, { code: otp, timestamp, email });
    
    // TODO: Thay thế bằng Firebase Functions hoặc email service thực tế
    // Hiện tại sử dụng Firebase password reset email làm demo
    await sendPasswordResetEmail(auth, email, {
      url: `${window.location.origin}/reset-password`,
      handleCodeInApp: false
    });
    
    // Log OTP cho development (xóa trong production)
    console.log(`[DEBUG] OTP cho ${email}: ${otp}`);
    
    // Simulate sending custom email with OTP
    // In production, you would use Firebase Functions or email service
    console.log('[Firebase Auth] Email OTP đã được gửi (simulated)');
    
    return {
      success: true,
      message: `Mã OTP đã được gửi đến ${email}. Mã OTP của bạn là: ${otp} (chỉ hiển thị trong development)`
    };
    
  } catch (error: any) {
    console.error('[Firebase Auth] Lỗi khi gửi OTP email:', error);
    
    let errorMessage = 'Có lỗi xảy ra khi gửi email OTP';
    
    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = 'Không tìm thấy tài khoản với email này';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Email không hợp lệ';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Quá nhiều yêu cầu. Vui lòng thử lại sau';
        break;
      case 'auth/network-request-failed':
        errorMessage = 'Lỗi kết nối mạng. Vui lòng thử lại';
        break;
      default:
        errorMessage = error.message || errorMessage;
    }
    
    return {
      success: false,
      message: errorMessage
    };
  }
}

/**
 * Xác thực mã OTP tùy chỉnh
 * @param email Email của người dùng
 * @param otp Mã OTP người dùng nhập
 * @returns Promise với kết quả xác thực
 */
export async function verifyCustomOTP(email: string, otp: string): Promise<{ success: boolean; message: string }> {
  try {
    console.log('[Firebase Auth] Đang xác thực OTP cho email:', email);
    
    const storedData = otpStorage.get(email);
    
    if (!storedData) {
      return {
        success: false,
        message: 'Không tìm thấy mã OTP cho email này. Vui lòng yêu cầu gửi lại'
      };
    }
    
    // Kiểm tra thời hạn (5 phút)
    const currentTime = Date.now();
    const otpAge = currentTime - storedData.timestamp;
    const fiveMinutes = 5 * 60 * 1000; // 5 phút
    
    if (otpAge > fiveMinutes) {
      otpStorage.delete(email);
      return {
        success: false,
        message: 'Mã OTP đã hết hạn. Vui lòng yêu cầu gửi lại'
      };
    }
    
    // Kiểm tra mã OTP
    if (storedData.code !== otp) {
      return {
        success: false,
        message: 'Mã OTP không chính xác. Vui lòng thử lại'
      };
    }
    
    // Xóa OTP sau khi xác thực thành công
    otpStorage.delete(email);
    
    console.log('[Firebase Auth] OTP xác thực thành công');
    
    return {
      success: true,
      message: 'Xác thực OTP thành công'
    };
    
  } catch (error: any) {
    console.error('[Firebase Auth] Lỗi khi xác thực OTP:', error);
    
    return {
      success: false,
      message: error.message || 'Có lỗi xảy ra khi xác thực OTP'
    };
  }
}

/**
 * Gửi lại mã OTP tùy chỉnh
 * @param email Email của người dùng
 * @returns Promise với kết quả gửi lại
 */
export async function resendCustomOTP(email: string): Promise<{ success: boolean; message: string }> {
  try {
    // Xóa OTP cũ nếu có
    otpStorage.delete(email);
    
    // Gửi OTP mới
    return await sendCustomOTPEmail(email);
    
  } catch (error: any) {
    console.error('[Firebase Auth] Lỗi khi gửi lại OTP:', error);
    
    return {
      success: false,
      message: error.message || 'Có lỗi xảy ra khi gửi lại OTP'
    };
  }
}

/**
 * Tạo tài khoản Firebase và gửi email xác thực
 * @param email Email của người dùng
 * @param password Mật khẩu
 * @returns Object chứa thông tin user và kết quả
 */
export async function createUserAndSendVerification(email: string, password: string) {
  try {
    console.log('[Firebase Auth] Đang tạo tài khoản cho email:', email);
    
    // Tạo user với email và password
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log('[Firebase Auth] Tài khoản Firebase đã được tạo:', user.uid);
    
    // Gửi email xác thực
    await sendEmailVerification(user, {
      url: `${window.location.origin}/login`, // URL redirect sau khi verify
      handleCodeInApp: false
    });
    
    console.log('[Firebase Auth] Email xác thực đã được gửi');
    
    return {
      success: true,
      user: user,
      uid: user.uid,
      email: user.email
    };
    
  } catch (error: any) {
    console.error('[Firebase Auth] Lỗi khi tạo tài khoản:', error);
    
    // Xử lý các lỗi Firebase cụ thể
    let errorMessage = 'Có lỗi xảy ra khi tạo tài khoản';
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = 'Email này đã được sử dụng cho tài khoản khác';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Email không hợp lệ';
        break;
      case 'auth/weak-password':
        errorMessage = 'Mật khẩu quá yếu';
        break;
      case 'auth/network-request-failed':
        errorMessage = 'Lỗi kết nối mạng. Vui lòng thử lại';
        break;
      default:
        errorMessage = error.message || errorMessage;
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Kiểm tra trạng thái xác thực email của user hiện tại
 * @returns Promise<boolean> true nếu email đã được xác thực
 */
export function checkEmailVerification(): Promise<boolean> {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe(); // Cleanup listener
      if (user) {
        console.log('[Firebase Auth] Checking email verification status:', user.emailVerified);
        resolve(user.emailVerified);
      } else {
        console.log('[Firebase Auth] Không có user đăng nhập');
        resolve(false);
      }
    });
  });
}

/**
 * Lấy thông tin user hiện tại
 * @returns User object hoặc null
 */
export function getCurrentUser(): Promise<User | null> {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe(); // Cleanup listener
      resolve(user);
    });
  });
}

/**
 * Gửi lại email xác thực cho user hiện tại
 * @returns Promise<boolean> true nếu gửi thành công
 */
export async function resendEmailVerification(): Promise<{ success: boolean; message: string }> {
  try {
    const user = auth.currentUser;
    
    if (!user) {
      return {
        success: false,
        message: 'Không tìm thấy thông tin người dùng'
      };
    }
    
    if (user.emailVerified) {
      return {
        success: false,
        message: 'Email đã được xác thực rồi'
      };
    }
    
    await sendEmailVerification(user, {
      url: `${window.location.origin}/login`,
      handleCodeInApp: false
    });
    
    console.log('[Firebase Auth] Email xác thực đã được gửi lại');
    
    return {
      success: true,
      message: 'Email xác thực đã được gửi lại'
    };
    
  } catch (error: any) {
    console.error('[Firebase Auth] Lỗi khi gửi lại email xác thực:', error);
    
    return {
      success: false,
      message: error.message || 'Có lỗi xảy ra khi gửi email'
    };
  }
}

/**
 * Đăng xuất user khỏi Firebase Auth
 */
export async function signOutUser(): Promise<void> {
  try {
    await signOut(auth);
    console.log('[Firebase Auth] Đã đăng xuất thành công');
  } catch (error) {
    console.error('[Firebase Auth] Lỗi khi đăng xuất:', error);
    throw error;
  }
}

/**
 * Lắng nghe thay đổi trạng thái xác thực email
 * @param callback Callback function được gọi khi trạng thái thay đổi
 * @returns Unsubscribe function
 */
export function onEmailVerificationChange(callback: (isVerified: boolean, user: User | null) => void) {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      callback(user.emailVerified, user);
    } else {
      callback(false, null);
    }
  });
} 