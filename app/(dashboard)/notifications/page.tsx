'use client';

import React from 'react';
import { AuthGuard } from '@/components/auth/auth-guard';
import { RoleBasedContent } from '@/components/auth/role-based-content';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { NotificationList, TEACHER_CONFIG, STUDENT_CONFIG } from '@/components/notifications';

/**
 * Trang hiển thị thông báo cho người dùng
 * Hiển thị khác nhau dựa vào role (giáo viên/học sinh)
 */
export default function NotificationsPage() {
  return (
    <AuthGuard>
      <RoleBasedContent
        teacherContent={<NotificationList {...TEACHER_CONFIG} />}
        studentContent={<NotificationList {...STUDENT_CONFIG} />}
        fallbackContent={
          <div className="container mx-auto py-6">
            <Card>
              <CardHeader>
                <CardTitle>Không có quyền truy cập</CardTitle>
                <CardDescription>
                  Vui lòng đăng nhập để xem thông báo.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        }
      />
    </AuthGuard>
  );
}