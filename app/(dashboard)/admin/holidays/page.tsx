import { Metadata } from 'next';
import HolidayManagement from '@/components/admin/holidays/holiday-management';

export const metadata: Metadata = {
  title: 'Quản lý ngày nghỉ lễ | OTLS Admin',
  description: 'Quản lý danh sách ngày nghỉ lễ trong hệ thống OTLS',
};

export default function HolidaysPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight">Quản lý ngày nghỉ lễ</h2>
        <p className="text-muted-foreground">
          Quản lý các ngày nghỉ lễ trong hệ thống. Các ngày nghỉ lễ sẽ được hiển thị trong lịch và ảnh hưởng đến lịch học.
        </p>
      </div>
      <HolidayManagement />
    </div>
  );
} 