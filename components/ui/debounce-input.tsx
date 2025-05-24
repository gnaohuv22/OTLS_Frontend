import * as React from 'react';
import { useCallback, memo, useState, useEffect, useRef } from 'react';
import { Input, InputProps } from '@/components/ui/input';
import { useDebounce } from '@/lib/hooks/use-debounce';

export interface DebounceInputProps extends Omit<InputProps, 'onChange'> {
  /**
   * Callback được gọi sau khi giá trị đã debounce
   */
  onValueChange?: (value: string) => void;
  
  /**
   * Callback gốc cho sự kiện onChange (kích hoạt ngay lập tức, không debounce) 
   */
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  
  /**
   * Thời gian delay debounce tính bằng milliseconds
   * @default 500
   */
  debounceDelay?: number;
  
  /**
   * Giá trị ban đầu của input
   */
  value?: string;
}

/**
 * Component DebounceInput giúp tối ưu hiệu suất bằng cách giảm thiểu số lần re-render
 * khi người dùng nhập liệu. Component chỉ gọi onValueChange sau khi người dùng
 * đã dừng nhập trong khoảng thời gian debounceDelay.
 */
export const DebounceInput = memo(
  React.forwardRef<HTMLInputElement, DebounceInputProps>(
    ({ 
      value: propValue = '', 
      onValueChange, 
      onChange,
      debounceDelay = 500,
      ...props 
    }, ref) => {
      const internalRef = useRef<HTMLInputElement>(null);
      const isUserTypingRef = useRef(false);
      const combinedRef = useCallback((node: HTMLInputElement) => {
        internalRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      }, [ref]);
      
      // State để theo dõi giá trị hiện tại của input
      const [value, setValue] = useState<string>(propValue);
      
      // Áp dụng debounce cho giá trị
      const debouncedValue = useDebounce<string>(value, debounceDelay);
      
      // Debug - log component's re-render
      const renderCountRef = useRef(0);
      useEffect(() => {
        renderCountRef.current += 1;
      });
      
      // Cập nhật state từ props khi propValue thay đổi từ bên ngoài
      // ONLY sync from props when the user is not actively typing
      useEffect(() => {
        if (propValue !== value && !isUserTypingRef.current) {
          setValue(propValue);
        }
      }, [propValue, value]);
      
      // Gọi callback khi debouncedValue thay đổi
      useEffect(() => {
        if (onValueChange && debouncedValue !== propValue) {
          // Reset the typing flag after debounce period completes
          isUserTypingRef.current = false;
          onValueChange(debouncedValue);
        }
      }, [debouncedValue, onValueChange, propValue]);
      
      // Xử lý sự kiện onChange của input - ensure input is working
      const handleChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
          const newValue = event.target.value;
          // Set the typing flag when the user makes a change
          isUserTypingRef.current = true;
          setValue(newValue);
          onChange?.(event);
        },
        [onChange]
      );
      
      // Clean up the typing flag when component unmounts
      useEffect(() => {
        return () => {
          isUserTypingRef.current = false;
        };
      }, []);
      
      return (
        <Input
          {...props}
          ref={combinedRef}
          value={value}
          onChange={handleChange}
        />
      );
    }
  )
);

DebounceInput.displayName = 'DebounceInput'; 