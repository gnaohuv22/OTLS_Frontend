import { UserInformation } from "@/lib/api/user";
import { UserStatusBadge } from "./user-status-badge";
import { UserRoleBadge } from "./user-role-badge";

interface UserDetailViewProps {
  user: UserInformation;
}

// Hàm format ngày tháng
const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return 'Chưa cập nhật';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Kiểm tra date có hợp lệ không
    
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch (error) {
    console.warn('Lỗi format ngày:', dateString, error);
    return dateString;
  }
};

// Hàm format ngày tháng chỉ ngày (không có giờ)
const formatDateOnly = (dateString: string | null | undefined) => {
  if (!dateString) return 'Chưa cập nhật';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Kiểm tra date có hợp lệ không
    
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  } catch (error) {
    console.warn('Lỗi format ngày:', dateString, error);
    return dateString;
  }
};

export function UserDetailView({ user }: UserDetailViewProps) {
  const fullName = user.fullName || '';
  const userName = user.userName || '';
  const avatarInitial = (fullName[0] || userName[0] || '').toUpperCase();
  const dateOfBirth = user.dateOfBirth || '';
  
  return (
    <div className="space-y-4">
      <div className="flex justify-center mb-4">
        <div className="relative h-24 w-24 rounded-full overflow-hidden border">
          {user.avatar ? (
            <img src={user.avatar} alt={fullName || userName} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-primary/10 flex items-center justify-center">
              <span className="text-xl font-semibold text-primary">
                {avatarInitial}
              </span>
            </div>
          )}
        </div>
      </div>
      
      <div className="grid gap-2 border-b pb-2">
        <p className="text-sm text-muted-foreground">Thông tin cơ bản</p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="font-medium">Họ và tên</div>
          <div>{fullName || '(Chưa cập nhật)'}</div>
          
          <div className="font-medium">Tên đăng nhập</div>
          <div>{userName}</div>
          
          <div className="font-medium">Email</div>
          <div>{user.email}</div>
          
          <div className="font-medium">Số điện thoại</div>
          <div>{user.phoneNumber || '(Chưa cập nhật)'}</div>
        </div>
      </div>
      
      <div className="grid gap-2 border-b pb-2">
        <p className="text-sm text-muted-foreground">Thông tin cá nhân</p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="font-medium">Giới tính</div>
          <div>{user.gender || '(Chưa cập nhật)'}</div>
          
          <div className="font-medium">Tuổi</div>
          <div>{user.age || '(Chưa cập nhật)'}</div>
          
          <div className="font-medium">Ngày sinh</div>
          <div>
            {dateOfBirth 
              ? formatDateOnly(dateOfBirth)
              : '(Chưa cập nhật)'}
          </div>
        </div>
      </div>
      
      <div className="grid gap-2">
        <p className="text-sm text-muted-foreground">Thông tin tài khoản</p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="font-medium">ID</div>
          <div className="truncate">{user.userID}</div>
          
          <div className="font-medium">Vai trò</div>
          <div>
            <UserRoleBadge role={user.roleName} />
          </div>
          
          <div className="font-medium">Trạng thái</div>
          <div>
            <UserStatusBadge status={user.status} />
          </div>
          
          <div className="font-medium">Ngày tạo tài khoản</div>
          <div>{formatDate(user.createdAt)}</div>
          
          <div className="font-medium">Cập nhật lần cuối</div>
          <div>{formatDate(user.updatedAt)}</div>
          
        </div>
      </div>
      
      <div className="pt-2 text-xs text-muted-foreground">
        <p>//TODO: Hiển thị nhiều thông tin hơn trong hệ thống (lớp học, bài tập, etc, role dependent)</p>
      </div>
    </div>
  );
} 