'use client';

import { AuthGuard } from '@/components/auth/auth-guard';
import { ClassPage } from '@/components/classes/class-page';

export default function ClassesPage() {
  return (
    <AuthGuard>
      <ClassPage />
    </AuthGuard>
  );
}