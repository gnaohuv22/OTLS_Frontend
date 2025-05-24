import * as React from 'react';
import { useCallback, memo, useState, useEffect, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { useDebounce } from '@/lib/hooks/use-debounce';

export interface DebounceTextareaProps extends Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>, 
  'onChange'
> {
  /**
   * Callback được gọi sau khi giá trị đã debounce
   */
  onValueChange?: (value: string) => void;
  
  /**
   * Callback gốc cho sự kiện onChange (kích hoạt ngay lập tức, không debounce) 
   */
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
  
  /**
   * Thời gian delay debounce tính bằng milliseconds
   * @default 500
   */
  debounceDelay?: number;
  
  /**
   * Giá trị ban đầu của textarea
   */
  value?: string;
}

/**
 * Component DebounceTextarea giúp tối ưu hiệu suất bằng cách giảm thiểu số lần re-render
 * khi người dùng nhập liệu trên textarea. Component chỉ gọi onValueChange sau khi người dùng
 * đã dừng nhập trong khoảng thời gian debounceDelay.
 */
export const DebounceTextarea = memo(
  React.forwardRef<HTMLTextAreaElement, DebounceTextareaProps>(
    ({ 
      value: propValue = '', 
      onValueChange, 
      onChange,
      debounceDelay = 500,
      ...props 
    }, ref) => {
      // Use a ref to track if the component is focused
      const isFocusedRef = useRef(false);
      const textareaRef = useRef<HTMLTextAreaElement | null>(null);
      const combinedRef = React.useMemo(() => {
        return (node: HTMLTextAreaElement) => {
          textareaRef.current = node;
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        };
      }, [ref]);
      
      // State để theo dõi giá trị hiện tại của textarea
      const [value, setValue] = useState<string>(propValue);
      
      // Áp dụng debounce cho giá trị
      const debouncedValue = useDebounce<string>(value, debounceDelay);
      
      // Only sync from prop to state when not focused
      useEffect(() => {
        if (!isFocusedRef.current && propValue !== value) {
          console.log('Syncing from prop to state:', { propValue, value });
          setValue(propValue);
        }
      }, [propValue, value]);
      
      // Extract props for use in callbacks
      const { onFocus, onBlur } = props;
      
      // Gọi callback khi debouncedValue thay đổi
      useEffect(() => {
        if (onValueChange && debouncedValue !== propValue && debouncedValue !== '') {
          console.log('Debounced value changed, calling onValueChange:', debouncedValue);
          onValueChange(debouncedValue);
        }
      }, [debouncedValue, onValueChange, propValue]);
      
      // Track focus state
      const handleFocus = useCallback((e: React.FocusEvent<HTMLTextAreaElement>) => {
        isFocusedRef.current = true;
        if (onFocus) {
          onFocus(e);
        }
      }, [onFocus]);
      
      const handleBlur = useCallback((e: React.FocusEvent<HTMLTextAreaElement>) => {
        isFocusedRef.current = false;
        if (onBlur) {
          onBlur(e);
        }
        
        // Force sync on blur if values differ
        if (value !== propValue && onValueChange) {
          console.log('Force sync on blur:', value);
          onValueChange(value);
        }
      }, [value, propValue, onValueChange, onBlur]);
      
      // Xử lý sự kiện onChange của textarea
      const handleChange = useCallback(
        (event: React.ChangeEvent<HTMLTextAreaElement>) => {
          const newValue = event.target.value;
          console.log('TextArea onChange:', { newValue, oldValue: value });
          setValue(newValue);
          onChange?.(event);
        },
        [onChange, value]
      );
      
      return (
        <Textarea
          {...props}
          ref={combinedRef}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      );
    }
  )
);

DebounceTextarea.displayName = 'DebounceTextarea'; 