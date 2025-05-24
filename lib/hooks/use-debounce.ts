import { useState, useEffect } from 'react';

/**
 * Hook để debounce giá trị, giúp giảm thiểu re-render không cần thiết
 * @param value Giá trị cần debounce
 * @param delay Thời gian trễ tính bằng milliseconds (mặc định 500ms)
 * @returns Giá trị sau khi đã được debounce
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Đặt timeout để cập nhật giá trị debounced sau thời gian delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Xóa timeout nếu giá trị thay đổi
    // Điều này đảm bảo chúng ta không cập nhật debouncedValue
    // nếu giá trị thay đổi trong khoảng thời gian delay
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook để lưu trữ và debounce giá trị input
 * @param initialValue Giá trị ban đầu
 * @param delay Thời gian trễ tính bằng milliseconds (mặc định 500ms)
 * @returns Một tuple chứa [giá trị hiện tại, giá trị đã debounce, hàm setter]
 */
export function useDebounceValue<T>(
  initialValue: T,
  delay: number = 500
): [T, T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(initialValue);
  const debouncedValue = useDebounce<T>(value, delay);

  return [value, debouncedValue, setValue];
} 