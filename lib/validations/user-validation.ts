'use client';

import * as z from "zod";

// Các tùy chọn giới tính
export const genderOptions = [
  { value: 'Male', label: 'Nam' },
  { value: 'Female', label: 'Nữ' },
  { value: 'Other', label: 'Khác' }
];

// Schema cho thông tin cá nhân khi đăng ký
export const registerFormSchema = z.object({
  fullname: z.string()
    .min(2, 'Họ tên phải có ít nhất 2 ký tự')
    .max(50, 'Họ tên không được vượt quá 50 ký tự'),
  username: z.string()
    .min(5, 'Tên đăng nhập phải có ít nhất 5 ký tự')
    .max(50, 'Tên đăng nhập không được vượt quá 50 ký tự')
    .regex(/^[a-zA-Z0-9_]+$/, 'Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới'),
  phoneNumber: z.string()
    .regex(/^(0[3|5|7|8|9])+([0-9]{8})$/, 'Số điện thoại không hợp lệ (VD: 0912345678)'),
  email: z.string()
    .min(1, 'Email là bắt buộc')
    .email('Email không hợp lệ'),
  password: z.string()
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
    .regex(/(?=.*[a-z])/, 'Mật khẩu phải chứa ít nhất 1 chữ thường')
    .regex(/(?=.*[A-Z])/, 'Mật khẩu phải chứa ít nhất 1 chữ hoa')
    .regex(/(?=.*\d)/, 'Mật khẩu phải chứa ít nhất 1 số')
    .regex(/(?=.*[@$!%*?&])/, 'Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (@$!%*?&)'),
  dateOfBirth: z.string()
    .refine(value => {
      if (!value) return false;
      const date = new Date(value);
      return !isNaN(date.getTime());
    }, {
      message: 'Ngày sinh không hợp lệ'
    })
    .refine(value => {
      const birthDate = new Date(value);
      const today = new Date();
      return birthDate <= today;
    }, {
      message: 'Ngày sinh không thể là ngày trong tương lai'
    })
    .refine(value => {
      const birthDate = new Date(value);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age >= 6 && age <= 20;
    }, {
      message: 'Học sinh phải từ 6 đến 20 tuổi'
    }),
  gender: z.enum(['Male', 'Female', 'Other'], {
    errorMap: () => ({ message: 'Vui lòng chọn giới tính' })
  }),
  avatar: z.string().optional().default('')
});

// Schema cho thông tin cá nhân trong trang profile
export const profileFormSchema = z.object({
  username: z.string()
    .min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự')
    .max(50, 'Tên đăng nhập không được vượt quá 50 ký tự'),
  fullName: z.string()
    .min(2, 'Họ tên phải có ít nhất 2 ký tự')
    .max(50, 'Họ tên không được vượt quá 50 ký tự'),
  phone: z.string()
    .regex(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/, 'Số điện thoại không hợp lệ'),
  email: z.string()
    .email('Email không hợp lệ')
    .optional()
    .or(z.literal('')),
  gender: z.enum(['Male', 'Female', 'Other'], {
    errorMap: () => ({ message: 'Vui lòng chọn giới tính' })
  }),
  dateOfBirth: z.string()
    .refine(value => {
      if (!value) return true; // Optional field
      const date = new Date(value);
      return !isNaN(date.getTime());
    }, {
      message: 'Ngày sinh không hợp lệ'
    })
    .refine(value => {
      if (!value) return true; // Optional field
      const birthDate = new Date(value);
      const today = new Date();
      return birthDate <= today;
    }, {
      message: 'Ngày sinh không thể là ngày trong tương lai'
    })
    .optional()
    .default(''),
  avatar: z.string().optional().default('')
});

// Schema cho đổi mật khẩu
export const passwordFormSchema = z.object({
  currentPassword: z.string()
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  newPassword: z.string()
    .min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số'),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

// Yêu cầu mật khẩu cho trang đăng ký
export const passwordRequirements = [
  { id: 'length', label: 'Ít nhất 8 ký tự', regex: /.{8,}/ },
  { id: 'lowercase', label: 'Ít nhất 1 chữ thường', regex: /[a-z]/ },
  { id: 'uppercase', label: 'Ít nhất 1 chữ hoa', regex: /[A-Z]/ },
  { id: 'number', label: 'Ít nhất 1 số', regex: /\d/ },
  { id: 'special', label: 'Ít nhất 1 ký tự đặc biệt', regex: /[@$!%*?&]/ }
];

// Hàm validate field chung cho cả hai form
export const validateUserField = (name: string, value: string, isStudent: boolean = true) => {
  const error = { message: '' };

  switch (name) {
    case 'fullname':
    case 'fullName':
      if (!value) {
        error.message = 'Vui lòng nhập họ và tên';
      } else if (value.length < 2) {
        error.message = 'Họ tên phải có ít nhất 2 ký tự';
      } else if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(value)) {
        error.message = 'Họ tên chỉ được chứa chữ cái và khoảng trắng';
      }
      break;

    case 'username':
      if (!value) {
        error.message = 'Vui lòng nhập tên đăng nhập';
      } else if (value.length < 5) {
        error.message = 'Tên đăng nhập phải có ít nhất 5 ký tự';
      } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
        error.message = 'Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới';
      }
      break;

    case 'phoneNumber':
    case 'phone':
      if (!value) {
        error.message = 'Vui lòng nhập số điện thoại';
      } else if (!/^(0[3|5|7|8|9])+([0-9]{8})$/.test(value)) {
        error.message = 'Số điện thoại không hợp lệ (VD: 0912345678)';
      }
      break;

    case 'email':
      // Email validation - required for registration
      if (!value) {
        error.message = 'Vui lòng nhập email';
      } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
        error.message = 'Email không hợp lệ';
      }
      break;

    case 'password':
      if (!value) {
        error.message = 'Vui lòng nhập mật khẩu';
      } else {
        if (value.length < 8) {
          error.message = 'Mật khẩu phải có ít nhất 8 ký tự';
        } else if (!/(?=.*[a-z])/.test(value)) {
          error.message = 'Mật khẩu phải chứa ít nhất 1 chữ thường';
        } else if (!/(?=.*[A-Z])/.test(value)) {
          error.message = 'Mật khẩu phải chứa ít nhất 1 chữ hoa';
        } else if (!/(?=.*\d)/.test(value)) {
          error.message = 'Mật khẩu phải chứa ít nhất 1 số';
        } else if (!/(?=.*[@$!%*?&])/.test(value)) {
          error.message = 'Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (@$!%*?&)';
        }
      }
      break;

    case 'dateOfBirth':
      if (!value) {
        error.message = 'Vui lòng chọn ngày sinh';
      } else {
        const birthDate = new Date(value);
        const today = new Date();
        
        if (isNaN(birthDate.getTime())) {
          error.message = 'Ngày sinh không hợp lệ';
          break;
        }

        if (birthDate > today) {
          error.message = 'Ngày sinh không thể là ngày trong tương lai';
          break;
        }

        if (isStudent) {
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }

          if (age < 6) {
            error.message = 'Học sinh phải từ 6 tuổi trở lên';
          } else if (age > 20) {
            error.message = 'Độ tuổi không hợp lệ cho học sinh';
          }
        }
      }
      break;

    case 'gender':
      if (!value) {
        error.message = 'Vui lòng chọn giới tính';
      }
      break;
  }

  return error.message;
}; 