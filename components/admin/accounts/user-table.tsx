import { UserInformation } from "@/lib/api/user";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Edit2,
  Eye,
  Lock,
  Shield,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { UserStatusBadge } from "./user-status-badge";
import { UserRoleBadge } from "./user-role-badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React from "react";

interface UserTableProps {
  users: UserInformation[];
  isSubmitting: boolean;
  onViewUser: (user: UserInformation) => void;
  onEditUser: (user: UserInformation) => void;
  onChangeStatus: (user: UserInformation, newStatus: 'Active' | 'Inactive' | 'Pending' | 'Bannned') => void;
  onDeleteUser: (user: UserInformation) => void;
}

// Hàm helper định dạng ngày tháng nếu file utils không tồn tại
const formatDateFallback = (dateString: string | null | undefined) => {
  if (!dateString) return 'Chưa cập nhật';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.warn('Ngày không hợp lệ:', dateString);
      return 'Định dạng không hợp lệ';
    }
    
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  } catch (error) {
    console.warn('Lỗi format ngày:', dateString, error);
    return 'Lỗi định dạng';
  }
};

export function UserTable({
  users,
  isSubmitting,
  onViewUser,
  onEditUser,
  onChangeStatus,
  onDeleteUser
}: UserTableProps) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(10);
  const [totalPages, setTotalPages] = React.useState(1);
  const [paginatedUsers, setPaginatedUsers] = React.useState<UserInformation[]>([]);
  
  // Cập nhật phân trang khi users, currentPage hoặc itemsPerPage thay đổi
  React.useEffect(() => {
    // Tính tổng số trang
    const totalPages = Math.max(1, Math.ceil(users.length / itemsPerPage));
    setTotalPages(totalPages);
    
    // Đảm bảo trang hiện tại không vượt quá tổng số trang
    const validCurrentPage = Math.min(currentPage, totalPages);
    if (validCurrentPage !== currentPage) {
      setCurrentPage(validCurrentPage);
    }
    
    // Tính toán danh sách người dùng cho trang hiện tại
    const startIndex = (validCurrentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, users.length);
    setPaginatedUsers(users.slice(startIndex, endIndex));
  }, [users, currentPage, itemsPerPage]);

  // Xử lý thay đổi số lượng bản ghi mỗi trang
  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1); // Reset về trang đầu tiên khi thay đổi số lượng hiển thị
  };

  // Đi đến trang trước
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Đi đến trang sau
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="space-y-2">
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Họ và tên</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Cập nhật lần cuối</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Không tìm thấy tài khoản nào phù hợp
                </TableCell>
              </TableRow>
            ) : (
              paginatedUsers.map((user) => (
                <TableRow key={user.id || user.userID}>
                  <TableCell>{user.fullName || user.userName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <UserRoleBadge role={user.roleName} />
                  </TableCell>
                  <TableCell>
                    <UserStatusBadge status={user.status} />
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {formatDateFallback(user.updatedAt)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {user.createdAt ? formatDateFallback(user.createdAt) : '-'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Mở menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onViewUser(user)} className="gap-2">
                          <Eye className="h-4 w-4" /> Xem chi tiết
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEditUser(user)} className="gap-2">
                          <Edit2 className="h-4 w-4" /> Chỉnh sửa
                        </DropdownMenuItem>
                        {user.status === 'Bannned' ? (
                          <DropdownMenuItem 
                            onClick={() => onChangeStatus(user, 'Active')} 
                            className="gap-2"
                            disabled={isSubmitting}
                          >
                            <Shield className="h-4 w-4" /> Mở khóa
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem 
                            onClick={() => onChangeStatus(user, 'Bannned')} 
                            className="gap-2"
                            disabled={isSubmitting}
                          >
                            <Lock className="h-4 w-4" /> Khóa
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => onDeleteUser(user)} 
                          className="text-red-600 focus:text-red-600 gap-2"
                        >
                          <Trash2 className="h-4 w-4" /> Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Điều khiển phân trang */}
      {users.length > 0 && (
        <div className="flex justify-between items-center pt-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Hiển thị</span>
            <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={itemsPerPage.toString()} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span>bản ghi mỗi trang</span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm px-2">
              Trang {currentPage} / {totalPages}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 