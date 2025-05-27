import { 
  createUserWithEmailAndPassword, 
  sendEmailVerification, 
  onAuthStateChanged,
  User,
  signOut
} from 'firebase/auth';
import { auth } from '@/lib/firebase/config';

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