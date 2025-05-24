# Hooks và Components đã tối ưu với Debounce

Tài liệu này mô tả các hooks và components đã được tối ưu để giảm re-render không cần thiết, đặc biệt là khi người dùng nhập liệu vào các trường form.

## Hooks

### useDebounce

Hook cơ bản để debounce một giá trị, trả về giá trị đã được debounce sau một khoảng thời gian nhất định.

```tsx
import { useDebounce } from '@/lib/hooks/use-debounce';

function MyComponent() {
  const [value, setValue] = useState('');
  const debouncedValue = useDebounce(value, 500); // 500ms là độ trễ mặc định

  useEffect(() => {
    // Chỉ chạy khi debouncedValue thay đổi
    console.log('Debounced value changed:', debouncedValue);
  }, [debouncedValue]);

  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder="Nhập để tìm kiếm"
    />
  );
}
```

### useDebounceValue

Hook tiện ích mở rộng từ useDebounce, trả về cả giá trị hiện tại, giá trị đã debounce và hàm setter.

```tsx
import { useDebounceValue } from '@/lib/hooks/use-debounce';

function MyComponent() {
  const [value, debouncedValue, setValue] = useDebounceValue('', 500);

  useEffect(() => {
    // Chỉ chạy khi debouncedValue thay đổi
    console.log('Debounced value changed:', debouncedValue);
  }, [debouncedValue]);

  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder="Nhập để tìm kiếm"
    />
  );
}
```

### useFormField

Hook để quản lý trường form với khả năng debounce và validation.

```tsx
import { useFormField } from '@/lib/hooks/use-form-field';

function MyFormField() {
  const field = useFormField('', {
    validate: (value) => !value ? 'Trường này là bắt buộc' : undefined,
    validateOnChange: false, // Chỉ validate khi submit
    debounceDelay: 300
  });

  return (
    <div>
      <label>Tên của bạn:</label>
      <input
        value={field.value}
        onChange={(e) => field.setValue(e.target.value)}
      />
      {field.hasError && <p className="error">{field.error}</p>}
      <button onClick={() => field.validate()}>Kiểm tra</button>
    </div>
  );
}
```

### useOptimizedForm

Hook quản lý form với nhiều trường, tự động debounce và validation.

```tsx
import { useOptimizedForm } from '@/lib/hooks/use-optimized-form';
import { FormControl } from '@/components/ui/form-control';

function MyForm() {
  const { fields, handleSubmit, formState } = useOptimizedForm({
    fields: {
      name: {
        initialValue: '',
        validate: (value) => !value ? 'Tên không được để trống' : undefined
      },
      email: {
        initialValue: '',
        validate: (value) => !value.includes('@') ? 'Email không hợp lệ' : undefined
      }
    },
    onSubmit: (values) => {
      console.log('Form submitted:', values);
    }
  });

  return (
    <form onSubmit={handleSubmit}>
      <FormControl
        id="name"
        label="Tên"
        value={fields.name.value}
        onValueChange={fields.name.setValue}
        error={fields.name.error}
        required
      />
      <FormControl
        id="email"
        label="Email"
        type="email"
        value={fields.email.value}
        onValueChange={fields.email.setValue}
        error={fields.email.error}
        required
      />
      <button 
        type="submit" 
        disabled={formState.isSubmitting || formState.hasErrors}
      >
        {formState.isSubmitting ? 'Đang xử lý...' : 'Gửi'}
      </button>
    </form>
  );
}
```

## Components

### DebounceInput

Component input với khả năng debounce giá trị, mở rộng từ component Input chuẩn.

```tsx
import { DebounceInput } from '@/components/ui/debounce-input';

function MyComponent() {
  const [value, setValue] = useState('');

  return (
    <DebounceInput
      value={value}
      onValueChange={setValue} // Chỉ được gọi sau khi người dùng dừng nhập
      onChange={(e) => console.log('Đang nhập:', e.target.value)} // Được gọi ngay lập tức
      debounceDelay={500}
      placeholder="Nhập nội dung..."
    />
  );
}
```

### FormControl

Component kết hợp label, input và error message, sử dụng DebounceInput bên trong.

```tsx
import { FormControl } from '@/components/ui/form-control';

function MyComponent() {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  return (
    <FormControl
      id="username"
      label="Tên đăng nhập"
      value={value}
      onValueChange={setValue}
      error={error}
      description="Tên đăng nhập chỉ chứa các ký tự a-z, 0-9"
      required
    />
  );
}
```

## Hướng dẫn sử dụng với Form trong ứng dụng

### Form đơn giản

```tsx
import { useState } from 'react';
import { FormControl } from '@/components/ui/form-control';
import { Button } from '@/components/ui/button';

function SimpleForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: Record<string, string> = {};
    if (!username) newErrors.username = 'Tên đăng nhập không được để trống';
    if (!password) newErrors.password = 'Mật khẩu không được để trống';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Submit form
    console.log('Form submitted:', { username, password });
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormControl
        id="username"
        label="Tên đăng nhập"
        value={username}
        onValueChange={setUsername}
        error={errors.username}
        required
      />
      
      <FormControl
        id="password"
        label="Mật khẩu"
        type="password"
        value={password}
        onValueChange={setPassword}
        error={errors.password}
        required
      />
      
      <Button type="submit">Đăng nhập</Button>
    </form>
  );
}
```

### Form phức tạp với useOptimizedForm

```tsx
import { useOptimizedForm } from '@/lib/hooks/use-optimized-form';
import { FormControl } from '@/components/ui/form-control';
import { Button } from '@/components/ui/button';

function ComplexForm() {
  const { fields, handleSubmit, formState, resetForm } = useOptimizedForm({
    fields: {
      name: {
        initialValue: '',
        validate: (value) => !value ? 'Tên không được để trống' : undefined
      },
      email: {
        initialValue: '',
        validate: (value) => {
          if (!value) return 'Email không được để trống';
          if (!value.includes('@')) return 'Email không hợp lệ';
          return undefined;
        }
      },
      phone: {
        initialValue: '',
        validate: (value) => {
          if (value && !/^[0-9]{10}$/.test(value)) {
            return 'Số điện thoại phải có 10 chữ số';
          }
          return undefined;
        }
      }
    },
    onSubmit: async (values) => {
      // Gửi dữ liệu form lên server
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Form submitted:', values);
      resetForm();
    }
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormControl
        id="name"
        label="Họ và tên"
        value={fields.name.value}
        onValueChange={fields.name.setValue}
        error={fields.name.error}
        required
      />
      
      <FormControl
        id="email"
        label="Email"
        type="email"
        value={fields.email.value}
        onValueChange={fields.email.setValue}
        error={fields.email.error}
        required
      />
      
      <FormControl
        id="phone"
        label="Số điện thoại"
        value={fields.phone.value}
        onValueChange={fields.phone.setValue}
        error={fields.phone.error}
      />
      
      <div className="flex justify-end gap-2">
        <Button 
          type="button"
          variant="outline"
          onClick={resetForm}
          disabled={formState.isSubmitting}
        >
          Nhập lại
        </Button>
        
        <Button 
          type="submit" 
          disabled={formState.isSubmitting}
        >
          {formState.isSubmitting ? 'Đang xử lý...' : 'Gửi'}
        </Button>
      </div>
    </form>
  );
}
```

## Lưu ý quan trọng

1. Luôn sử dụng `onValueChange` thay vì `onChange` khi sử dụng DebounceInput hoặc FormControl để nhận giá trị đã được debounce.

2. Các component đã được tối ưu sử dụng `memo` để tránh re-render không cần thiết. Hãy đảm bảo rằng bạn không truyền các functions mới được tạo mỗi lần render.

3. Các hooks và components này được thiết kế để validate sau khi submit, không validate realtime. Nếu muốn validate realtime, hãy đặt `validateOnChange: true` khi sử dụng hooks.

4. Tất cả các hooks và components đều hỗ trợ TypeScript đầy đủ. 