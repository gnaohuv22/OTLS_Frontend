# OTLS - Giải pháp Dạy và Học Trực tuyến

<div align="center"><strong>Online Teaching and Learning Solution</strong></div>
<div align="center">Xây dựng trên nền tảng Next.js App Router</div>
<br />
<div align="center">
<a href="https://otls.vercel.app/">Demo</a>
</div>

## Tổng quan

OTLS (Online Teaching and Learning Solution) là một giải pháp toàn diện hỗ trợ việc dạy và học trực tuyến, chú trọng đến đối tượng học sinh tiểu học. Dự án này cung cấp một nền tảng thuận tiện để kết nối giáo viên, học sinh và phụ huynh, nhằm tạo ra môi trường học tập hiệu quả và tương tác.

### Công nghệ sử dụng

- Framework - [Next.js 15 (App Router)](https://nextjs.org)
- Ngôn ngữ - [TypeScript](https://www.typescriptlang.org)
- Xác thực - [NextAuth.js](https://next-auth.js.org)
- Quản lý trạng thái - [React Context](https://react.dev/reference/react/createContext)
- Xác thực OTP - [Twilio](https://www.twilio.com/)
- Triển khai - [Vercel](https://vercel.com)
- UI/UX - [Tailwind CSS](https://tailwindcss.com), [Shadcn UI](https://ui.shadcn.com/)
- Icons - [Lucide Icons](https://lucide.dev/)
- Hiệu ứng - [Framer Motion](https://www.framer.com/motion/)
- Định dạng - [Prettier](https://prettier.io)
- Trình soạn thảo - [TinyMCE](https://www.tiny.cloud/)
- Testing - [Jest](https://jestjs.io/), [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

## Tính năng chính

- **Hệ thống xác thực đa dạng**: Đăng nhập/đăng ký với 3 role (Giáo viên, Học sinh, Phụ huynh)
- **Xác thực hai yếu tố**: Bảo mật tài khoản với xác thực OTP qua Twilio
- **Quản lý lớp học**: Tạo, quản lý và tham gia các lớp học trực tuyến
- **Quản lý bài tập**:
  - Giáo viên: Tạo, giao, chấm điểm bài tập
  - Học sinh: Làm bài, nộp bài, xem kết quả
- **Loại bài tập đa dạng**: Trắc nghiệm, tự luận, nộp file
- **Thông báo thời gian thực**: Cập nhật thông báo cho người dùng
- **Lịch học trực tuyến**: Quản lý thời gian biểu và lịch học
- **Giao diện thích ứng**: Hoạt động tốt trên máy tính và thiết bị di động
- **Chế độ sáng/tối**: Tùy chỉnh giao diện theo sở thích

## Hướng dẫn cài đặt

### Yêu cầu

- Node.js 18.0.0 trở lên
- npm hoặc yarn

### Cài đặt

1. Clone repository:

```bash
git clone https://github.com/your-username/otls.git
cd otls
```

2. Cài đặt dependencies:

```bash
npm install
# hoặc
yarn install
```

3. Cấu hình biến môi trường:

- Tạo file `.env.local` từ file `.env.example`
- Cập nhật các giá trị trong file `.env.local`

```markdown
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Twilio Verify API
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_VERIFY_SID=your-twilio-verify-sid
```

4. Khởi chạy môi trường phát triển:

```bash
npm run dev
# hoặc
yarn dev
```

Ứng dụng sẽ chạy tại địa chỉ <http://localhost:3000>

## Testing

Dự án sử dụng Jest và React Testing Library để viết unit tests. Chi tiết hướng dẫn được cung cấp trong [TESTING.md](./TESTING.md).

### Chạy tests

```bash
# Chạy tất cả tests
npm test

# Chạy tests với chế độ watch
npm run test:watch

# Chạy tests và tạo báo cáo coverage
npm run test:coverage

# Chạy test riêng cho module auth
npm run test:auth
```

### Testing strategy

- Unit tests tập trung vào các component và logic riêng biệt
- Sử dụng mocks cho các service và API calls
- Tối ưu hóa coverage cho các module quan trọng như auth, forms và business logic

## Kiểm soát kiểu dữ liệu

Dự án sử dụng TypeScript để đảm bảo tính an toàn của kiểu dữ liệu. Chi tiết hướng dẫn về cách xử lý kiểu dữ liệu an toàn được cung cấp trong [docs/type-safety-guidelines.md](./docs/type-safety-guidelines.md).

### Các nguyên tắc chính

- Sử dụng các kỹ thuật xử lý null/undefined an toàn
- Định nghĩa kiểu dữ liệu rõ ràng cho tất cả các component
- Sử dụng TypeScript utility types khi cần thiết
- Import kiểu dữ liệu với từ khóa `type` để tránh xung đột

## Cấu trúc dự án

```markdown
/app                # Next.js App Router
  /(auth)           # Các trang xác thực
    /__tests__      # Tests cho module auth
  /(dashboard)      # Các trang dashboard sau khi đăng nhập
  /(marketing)      # Các trang landing và marketing
  /api              # API routes
/components         # React components
  /ui               # UI components (shadcn/ui)
  /auth             # Components liên quan đến xác thực
  /common           # Components dùng chung
/lib                # Utilities và helpers
  /api              # Client APIs
  /auth-context.tsx # Context xác thực
/docs               # Tài liệu hướng dẫn
/public             # Static assets
/styles             # Global styles
```

## Triển khai

Dự án có thể được triển khai dễ dàng trên Vercel:

1. Đẩy code lên GitHub repository
2. Kết nối repository với Vercel
3. Cấu hình các biến môi trường trên Vercel
4. Deploy
