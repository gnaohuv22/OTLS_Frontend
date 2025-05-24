'use client';

import { AuthGuard } from '@/components/auth/auth-guard';
import { RoleBasedContent } from '@/components/auth/role-based-content';
import { Profile } from '../../../components/common/card/profile-card';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProfilePage() {
  return (
    <AuthGuard>
      <RoleBasedContent
        teacherContent={<Profile />}
        studentContent={<Profile />}
        parentContent={<Profile />}
        adminContent={<Profile />}
        fallbackContent={
          <Card>
            <CardHeader>
              <CardTitle>Không có quyền truy cập</CardTitle>
              <CardDescription>
                Vui lòng đăng nhập để xem thông tin này.
              </CardDescription>
            </CardHeader>
          </Card>
        }
      />
    </AuthGuard>
  );
} 