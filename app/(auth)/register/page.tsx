'use client';

import { RegisterForm } from '@/components/form/register-form';
import { AuthLayout } from '@/components/common/layout/auth-layout';

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Đăng ký tài khoản"
      description="Nhập thông tin để tạo tài khoản học trực tuyến"
      maxWidth="4xl"
    >
      <RegisterForm />
    </AuthLayout>
  );
}