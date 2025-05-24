import { Badge } from "@/components/ui/badge";

interface UserRoleBadgeProps {
  role?: string;
}

// Xác định màu sắc dựa trên vai trò người dùng
const getRoleColor = (role: string) => {
  switch (role) {
    case 'Admin':
      return 'bg-red-100 text-red-800';
    case 'Teacher':
      return 'bg-blue-100 text-blue-800';
    case 'Student':
      return 'bg-green-100 text-green-800';
    case 'Parent':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Chuyển đổi từ role code sang text hiển thị nếu cần
const getRoleText = (role: string) => {
  switch (role) {
    case 'Admin':
      return 'Admin';
    case 'Teacher':
      return 'Giáo viên';
    case 'Student':
      return 'Học sinh';
    case 'Parent':
      return 'Phụ huynh';
    default:
      return role;
  }
};

export function UserRoleBadge({ role = 'Chưa có vai trò' }: UserRoleBadgeProps) {
  return (
    <Badge variant="outline" className={getRoleColor(role)}>
      {getRoleText(role)}
    </Badge>
  );
} 