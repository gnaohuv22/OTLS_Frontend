# Hướng dẫn Testing cho dự án OTLS

Tài liệu này cung cấp hướng dẫn chi tiết về cách viết, chạy và quản lý tests trong dự án Online Teaching and Learning Solution (OTLS).

## Cài đặt

Đảm bảo bạn đã cài đặt đầy đủ các dependencies:

```bash
npm install
```

## Chạy Tests

Dự án có sẵn các scripts để chạy tests:

- Chạy tất cả tests:

  ```bash
  npm test
  ```

- Chạy tests ở chế độ watch (tự động chạy lại khi có thay đổi):

  ```bash
  npm run test:watch
  ```

- Chạy tests với báo cáo coverage:

  ```bash
  npm run test:coverage
  ```

- Chạy tests cho module auth:

  ```bash
  npm run test:auth
  ```

## Cấu trúc Tests

Dự án sử dụng cấu trúc thư mục sau cho tests:

- Thư mục `__tests__` bên trong mỗi module chứa các test files cho module đó
- Mỗi file test được đặt tên theo định dạng `*.test.tsx` hoặc `*.spec.tsx`

Ví dụ:

```
app/
  ├── (auth)/
  │     ├── __tests__/
  │     │     ├── login.test.tsx
  │     │     └── register.test.tsx
  │     ├── login/
  │     └── register/
  └── ...
```

## Nguyên tắc viết Test

1. **Bao phủ các case quan trọng**:
   - Kiểm tra rendering UI đúng
   - Kiểm tra validation form
   - Kiểm tra xử lý sự kiện
   - Kiểm tra gọi API và xử lý responses
   - Kiểm tra xử lý lỗi

2. **Đặt tên test rõ ràng**:

   ```typescript
   test('Hiển thị thông báo lỗi khi đăng nhập thất bại', async () => {
     // ...
   });
   ```

3. **Sử dụng mocks hợp lý**:

   ```typescript
   jest.mock('@/lib/api/auth', () => ({
     AuthService: {
       login: jest.fn()
     }
   }));
   ```

4. **Test cả các trường hợp bình thường và ngoại lệ**:
   - Luồng đăng nhập thành công
   - Xử lý lỗi mạng
   - Xử lý lỗi server

## Coverage Guidelines

- **Mục tiêu coverage**: 80% trở lên cho code frontend
- **Ưu tiên**:
  1. Components UI chung (vì được sử dụng nhiều)
  2. Logic nghiệp vụ phức tạp
  3. Components giàu tương tác với người dùng

## Debugging Tests

Khi tests thất bại, kiểm tra:

1. **Các mock đúng cách**:
   - Mock có trả về đúng giá trị không?
   - Mock có được reset giữa các tests không?

2. **DOM selectors**:
   - Sử dụng `screen.debug()` để xem DOM hiện tại
   - Kiểm tra xem các selectors có đúng không

3. **Async operations**:
   - Đảm bảo sử dụng `waitFor` hoặc `findByXXX` cho các operations async

## Các Thư viện Testing Chính

- **Jest**: Testing framework
- **React Testing Library**: Thư viện test React components
- **@testing-library/jest-dom**: Custom matchers cho Jest

## Best Practices

1. **Tập trung vào hành vi, không phải triển khai**:
   - Test những gì người dùng thấy/tương tác
   - Tránh test implementation details

2. **Duy trì tests độc lập**:
   - Mỗi test không nên phụ thuộc vào kết quả của test khác
   - Sử dụng `beforeEach` để reset state

3. **Đặt tên biến rõ ràng**:

   ```typescript
   const submitButton = screen.getByRole('button', { name: /đăng nhập/i });
   expect(submitButton).toBeInTheDocument();
   ```

4. **Sử dụng các role và accessibility attributes**:
   - Ưu tiên `getByRole` thay vì `getByTestId`
   - Giúp test gần với trải nghiệm người dùng thực tế hơn

```
