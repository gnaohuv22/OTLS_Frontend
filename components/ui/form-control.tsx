import React, { forwardRef, memo } from 'react';
import { DebounceInput, DebounceInputProps } from '@/components/ui/debounce-input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export interface FormControlProps extends Omit<DebounceInputProps, 'onValueChange'> {
  /**
   * Label cho field
   */
  label?: string;
  
  /**
   * Id cho field - cũng được sử dụng để liên kết với label
   */
  id: string;
  
  /**
   * Callback được gọi khi giá trị thay đổi sau thời gian debounce
   */
  onValueChange?: (value: string) => void;
  
  /**
   * Thông báo lỗi
   */
  error?: string;
  
  /**
   * Nội dung mô tả
   */
  description?: React.ReactNode;
  
  /**
   * Field có bắt buộc hay không
   */
  required?: boolean;
  
  /**
   * Wrapper className
   */
  containerClassName?: string;
}

/**
 * Component FormControl cung cấp giao diện đồng nhất cho các trường dữ liệu,
 * bao gồm label, input với debounce và thông báo lỗi.
 */
export const FormControl = memo(
  forwardRef<HTMLInputElement, FormControlProps>((
    {
      label,
      id,
      error,
      description,
      required,
      className,
      containerClassName,
      onValueChange,
      ...props
    }, 
    ref
  ) => {
    return (
      <div className={cn("space-y-2", containerClassName)}>
        {label && (
          <Label 
            htmlFor={id} 
            className="text-sm font-medium"
          >
            {label} {required && <span className="text-destructive">*</span>}
          </Label>
        )}
        
        <DebounceInput
          id={id}
          ref={ref}
          className={cn(
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
          onValueChange={onValueChange}
          {...props}
        />
        
        {description && !error && (
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        )}
        
        {error && (
          <p className="text-sm font-medium text-destructive">
            {error}
          </p>
        )}
      </div>
    );
  })
);

FormControl.displayName = 'FormControl'; 