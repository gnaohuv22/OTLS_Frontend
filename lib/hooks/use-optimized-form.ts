import { useState, useCallback, useMemo } from 'react';
import { useFormField, ValidationFn } from './use-form-field';

type FieldConfig = {
  initialValue?: string;
  validate?: ValidationFn;
  validateOnChange?: boolean;
  debounceDelay?: number;
  onChange?: (value: string) => void;
};

type FormConfig<T extends Record<string, FieldConfig>> = {
  fields: T;
  onSubmit?: (values: Record<keyof T, string>) => void | Promise<void>;
};

/**
 * Hook quản lý form tối ưu với khả năng debounce input và validation khi submit
 * 
 * @example
 * ```tsx
 * const { fields, handleSubmit, formState } = useOptimizedForm({
 *   fields: {
 *     name: {
 *       initialValue: '',
 *       validate: (value) => value ? undefined : 'Tên không được để trống'
 *     },
 *     email: {
 *       initialValue: '',
 *       validate: (value) => value.includes('@') ? undefined : 'Email không hợp lệ'
 *     }
 *   },
 *   onSubmit: (values) => {
 *     console.log(values);
 *   }
 * });
 * 
 * return (
 *   <form onSubmit={handleSubmit}>
 *     <FormControl
 *       id="name"
 *       label="Tên"
 *       value={fields.name.value}
 *       onValueChange={fields.name.setValue}
 *       error={fields.name.error}
 *       required
 *     />
 *     <Button type="submit">Gửi</Button>
 *   </form>
 * );
 * ```
 */
export function useOptimizedForm<T extends Record<string, FieldConfig>>(
  config: FormConfig<T>
) {
  const { fields: fieldConfigs, onSubmit } = config;
  
  // State lưu giá trị đã submit
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);
  
  // Pre-process field configs outside of useMemo
  const fieldConfigsArray = useMemo(() => 
    Object.entries(fieldConfigs).map(([name, config]) => ({
      name,
      initialValue: config.initialValue || '',
      validate: config.validate,
      validateOnChange: config.validateOnChange || false,
      debounceDelay: config.debounceDelay || 500,
      onChange: config.onChange
    })),
  [fieldConfigs]);
  
  // Create form fields for all possible positions (up to 6)
  // Always create all field hooks, but only use the ones we need
  const field0 = useFormField(
    fieldConfigsArray[0]?.initialValue || '',
    {
      validate: fieldConfigsArray[0]?.validate,
      validateOnChange: fieldConfigsArray[0]?.validateOnChange,
      debounceDelay: fieldConfigsArray[0]?.debounceDelay,
      onChange: fieldConfigsArray[0]?.onChange
    }
  );
  
  const field1 = useFormField(
    fieldConfigsArray[1]?.initialValue || '',
    {
      validate: fieldConfigsArray[1]?.validate,
      validateOnChange: fieldConfigsArray[1]?.validateOnChange,
      debounceDelay: fieldConfigsArray[1]?.debounceDelay,
      onChange: fieldConfigsArray[1]?.onChange
    }
  );
  
  const field2 = useFormField(
    fieldConfigsArray[2]?.initialValue || '',
    {
      validate: fieldConfigsArray[2]?.validate,
      validateOnChange: fieldConfigsArray[2]?.validateOnChange,
      debounceDelay: fieldConfigsArray[2]?.debounceDelay,
      onChange: fieldConfigsArray[2]?.onChange
    }
  );
  
  const field3 = useFormField(
    fieldConfigsArray[3]?.initialValue || '',
    {
      validate: fieldConfigsArray[3]?.validate,
      validateOnChange: fieldConfigsArray[3]?.validateOnChange,
      debounceDelay: fieldConfigsArray[3]?.debounceDelay,
      onChange: fieldConfigsArray[3]?.onChange
    }
  );
  
  const field4 = useFormField(
    fieldConfigsArray[4]?.initialValue || '',
    {
      validate: fieldConfigsArray[4]?.validate,
      validateOnChange: fieldConfigsArray[4]?.validateOnChange,
      debounceDelay: fieldConfigsArray[4]?.debounceDelay,
      onChange: fieldConfigsArray[4]?.onChange
    }
  );
  
  const field5 = useFormField(
    fieldConfigsArray[5]?.initialValue || '',
    {
      validate: fieldConfigsArray[5]?.validate,
      validateOnChange: fieldConfigsArray[5]?.validateOnChange,
      debounceDelay: fieldConfigsArray[5]?.debounceDelay,
      onChange: fieldConfigsArray[5]?.onChange
    }
  );
  
  // Map field names to their respective field hooks
  const fields = useMemo(() => {
    const fieldEntries = fieldConfigsArray.map((config, index) => {
      let field;
      switch (index) {
        case 0: field = field0; break;
        case 1: field = field1; break;
        case 2: field = field2; break;
        case 3: field = field3; break;
        case 4: field = field4; break;
        case 5: field = field5; break;
        default: return [config.name, null]; // Fallback for more than 6 fields
      }
      
      return [config.name, field];
    });
    
    return Object.fromEntries(
      fieldEntries.filter(([_, field]) => field !== null)
    ) as Record<keyof T, ReturnType<typeof useFormField>>;
  }, [fieldConfigsArray, field0, field1, field2, field3, field4, field5]);
  
  // Xử lý submit form
  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }
      
      // Đánh dấu đã submit và tăng submitCount
      setIsSubmitting(true);
      setSubmitCount(prev => prev + 1);
      
      // Validate tất cả các field
      const isValid = Object.values(fields).every(field => field.validate());
      
      // Nếu form hợp lệ, gọi callback onSubmit với giá trị đã debounce
      if (isValid && onSubmit) {
        const values = Object.entries(fields).reduce<Record<string, string>>(
          (acc, [name, field]) => {
            acc[name] = field.debouncedValue;
            return acc;
          }, 
          {}
        ) as Record<keyof T, string>;
        
        try {
          await onSubmit(values);
        } catch (error) {
          console.error('Form submission error:', error);
        }
      }
      
      setIsSubmitting(false);
    }, 
    [fields, onSubmit]
  );
  
  // Reset toàn bộ form
  const resetForm = useCallback(() => {
    Object.values(fields).forEach(field => field.reset());
  }, [fields]);
  
  // Kiểm tra form có lỗi không
  const hasErrors = useMemo(() => {
    return Object.values(fields).some(field => field.hasError);
  }, [fields]);
  
  // Trạng thái form
  const formState = useMemo(() => {
    return {
      isSubmitting,
      submitCount,
      hasErrors,
      isDirty: Object.values(fields).some(
        field => field.debouncedValue !== field.value
      )
    };
  }, [isSubmitting, submitCount, hasErrors, fields]);
  
  return {
    fields,
    handleSubmit,
    resetForm,
    formState
  };
} 