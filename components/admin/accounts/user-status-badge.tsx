import { Badge } from "@/components/ui/badge";

interface UserStatusBadgeProps {
  status: string;
}

// Xác định màu sắc dựa trên trạng thái người dùng
const getStatusColor = (status: string) => {
  switch (status) {
    case 'Active':
      return 'bg-green-100 text-green-800';
    case 'Inactive':
      return 'bg-gray-100 text-gray-800';
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'Bannned':
      return 'bg-red-100 text-red-800';
    case 'active': // Hỗ trợ tương thích ngược với UI cũ
      return 'bg-green-100 text-green-800';
    case 'inactive':
      return 'bg-gray-100 text-gray-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'locked':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Chuyển đổi trạng thái sang text hiển thị trên UI
const getStatusText = (status: string) => {
  switch (status) {
    case 'Active':
    case 'active':
      return 'Hoạt động';
    case 'Inactive':
    case 'inactive':
      return 'Không hoạt động';
    case 'Pending':
    case 'pending':
      return 'Chờ xác nhận';
    case 'Bannned':
    case 'locked':
      return 'Đã khóa';
    default:
      return status;
  }
};

export function UserStatusBadge({ status }: UserStatusBadgeProps) {
  return (
    <Badge variant="outline" className={getStatusColor(status)}>
      {getStatusText(status)}
    </Badge>
  );
} 