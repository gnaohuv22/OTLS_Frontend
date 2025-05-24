import { useState, useCallback, useEffect } from 'react';
import { useDebounceValue } from './use-debounce';

export type ValidationFn = (value: string) => string | undefined;

interface UseFormFieldOptions {
  /**
   * Thời gian delay cho debounce (ms)
   * @default 500
   */
  debounceDelay?: number;
  
  /**
   * Callback được gọi khi giá trị đã được debounce thay đổi
   */
  onChange?: (value: string) => void;
  
  /**
   * Hàm kiểm tra validation
   * Trả về undefined nếu giá trị hợp lệ, ngược lại trả về thông báo lỗi
   */
  validate?: ValidationFn;
  
  /**
   * Tự động validate sau mỗi lần giá trị debounced thay đổi
   * @default false
   */
  validateOnChange?: boolean;
}

/**
 * Hook giúp quản lý trường form với khả năng debounce và validation
 * Chỉ trigger validation khi submit hoặc khi cấu hình validateOnChange=true
 */
export function useFormField(
  initialValue: string = '',
  options: UseFormFieldOptions = {}
) {
  const {
    debounceDelay = 500,
    onChange,
    validate,
    validateOnChange = false,
  } = options;

  // Sử dụng debounce để giảm re-render
  const [value, debouncedValue, setValue] = useDebounceValue(
    initialValue,
    debounceDelay
  );
  
  // State lưu lỗi validation
  const [error, setError] = useState<string | undefined>(undefined);
  
  // State theo dõi đã submit hay chưa (để hiển thị lỗi)
  const [touched, setTouched] = useState(false);

  // Xử lý khi giá trị debounced thay đổi
  useEffect(() => {
    // Gọi callback onChange
    if (onChange) {
      onChange(debouncedValue);
    }
    
    // Validate nếu có yêu cầu validateOnChange hoặc đã touched
    if ((validateOnChange || touched) && validate) {
      setError(validate(debouncedValue));
    }
  }, [debouncedValue, onChange, validate, validateOnChange, touched]);

  // Hàm xử lý khi thay đổi giá trị
  const handleChange = useCallback((newValue: string) => {
    setValue(newValue);
  }, [setValue]);

  // Hàm validate thủ công (sử dụng khi submit)
  const validateField = useCallback(() => {
    setTouched(true);
    
    if (validate) {
      const validationError = validate(debouncedValue);
      setError(validationError);
      return !validationError;
    }
    
    return true;
  }, [debouncedValue, validate]);

  // Reset field
  const reset = useCallback(() => {
    setValue(initialValue);
    setError(undefined);
    setTouched(false);
  }, [initialValue, setValue]);

  return {
    value,                // Giá trị hiện tại (cập nhật ngay lập tức)
    debouncedValue,       // Giá trị sau debounce
    setValue: handleChange, // Setter
    error,                // Lỗi validation
    touched,              // Đánh dấu đã submit chưa
    setTouched,           // Setter cho touched
    validate: validateField, // Hàm validate thủ công
    reset,                // Reset về giá trị ban đầu
    hasError: !!error && touched // Helper kiểm tra có lỗi không
  };
} 