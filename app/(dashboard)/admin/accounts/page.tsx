'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { UserPlus, UserX } from "lucide-react";
import { UserService, UserInformation, UpdateUserRequest, ChangeStatusUserRequest, AddUserRequest } from '@/lib/api/user';
import {
  UserDetailView,
  UserEditForm,
  UserFilters,
  UserTable
} from '@/components/admin/accounts';

export default function AccountsPage() {
  const [users, setUsers] = useState<UserInformation[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserInformation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserInformation | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { toast } = useToast();

  // Lấy danh sách người dùng từ API
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const userList = await UserService.getAllUsers();
      // Thêm id cho tương thích với UI
      const formattedUsers = userList.map(user => ({
        ...user,
        id: user.userID, // Tạo id từ userID cho tương thích với UI hiện tại
      }));
      setUsers(formattedUsers);
    } catch (error: any) {
      console.error('Lỗi khi lấy danh sách người dùng:', error);
      toast({
        title: "Lỗi khi tải dữ liệu",
        description: error.message || "Không thể lấy danh sách người dùng, vui lòng thử lại sau.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
  
  // Lọc dữ liệu người dùng theo bộ lọc
  useEffect(() => {
    if (users.length === 0) return;
    
    const result = users.filter((user) => {
      // Tìm kiếm theo tên hoặc email
      const matchesSearch = (user.fullName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.userName.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Lọc theo vai trò 
      const matchesRole = roleFilter === 'all' || user.roleName === roleFilter;
      
      // Lọc theo trạng thái
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && user.status === 'Active') ||
        (statusFilter === 'inactive' && user.status === 'Inactive') ||
        (statusFilter === 'pending' && user.status === 'Pending') ||
        (statusFilter === 'banned' && user.status === 'Bannned');
        
      return matchesSearch && matchesRole && matchesStatus;
    });
    
    setFilteredUsers(result);
  }, [users, searchTerm, roleFilter, statusFilter]);

  // Handlers
  const handleAddUser = () => {
    setSelectedUser(null);
    setIsEditDialogOpen(true);
  };

  const handleViewUser = (user: UserInformation) => {
    setSelectedUser(user);
    setIsViewDialogOpen(true);
  };

  const handleEditUser = (user: UserInformation) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const handleDeleteUser = (user: UserInformation) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleChangeUserStatus = async (user: UserInformation, newStatus: 'Active' | 'Inactive' | 'Pending' | 'Bannned') => {
    if (!user.userID) return;
    
    setIsSubmitting(true);
    try {
      const request: ChangeStatusUserRequest = {
        userId: user.userID,
        statusUser: newStatus
      };
      
      // Log dữ liệu gửi đi để debug
      console.log('Dữ liệu gửi đi:', JSON.stringify(request));
      
      await UserService.changeStatusUser(request);
      
      // Cập nhật trạng thái người dùng trong state
      const updatedUsers = users.map(u => 
        u.userID === user.userID ? { ...u, status: newStatus } : u
      );
      setUsers(updatedUsers);
      
      toast({
        title: "Đã cập nhật trạng thái",
        description: `Tài khoản ${user.fullName || user.userName} đã được ${newStatus === 'Active' ? 'kích hoạt' : 'khóa'} thành công.`,
      });
    } catch (error: any) {
      console.error('Lỗi khi thay đổi trạng thái người dùng:', error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể thay đổi trạng thái người dùng, vui lòng thử lại sau.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;
    
    setIsSubmitting(true);
    try {
      // Gọi API xóa người dùng
      await UserService.deleteUser(selectedUser.userID);
      
      // Xóa user khỏi danh sách trong state
      const updatedUsers = users.filter(user => user.userID !== selectedUser.userID);
      setUsers(updatedUsers);
      
      // Hiển thị thông báo
      toast({
        title: "Đã xóa tài khoản",
        description: `Tài khoản ${selectedUser.fullName || selectedUser.userName} đã được xóa thành công.`,
      });
      
      setIsDeleteDialogOpen(false);
    } catch (error: any) {
      console.error('Lỗi khi xóa người dùng:', error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa tài khoản, vui lòng thử lại sau.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveUserChanges = async (formData: any) => {
    setIsSubmitting(true);
    
    try {
      if (selectedUser) {
        // Cập nhật user hiện có
        const updateData: UpdateUserRequest = {
          userID: selectedUser.userID,
          username: formData.username,
          phoneNumber: formData.phoneNumber,
          fullname: formData.fullname,
          email: formData.email,
          gender: formData.gender,
          dateOfBirth: formData.dateOfBirth,
          status: formData.status,
          avatar: formData.avatar || ''
        };
        
        // Cần log để debug
        console.log('Dữ liệu gửi đi khi cập nhật:', JSON.stringify(updateData));
        
        await UserService.updateUser(updateData);
        
        // Lưu role hiện tại để kiểm tra sau khi cập nhật
        const originalRole = selectedUser.roleName;
        const newRole = formData.roleName;
        
        // Cập nhật user trong state
        const updatedUsers = users.map(user => 
          user.userID === selectedUser.userID 
            ? { 
                ...user, 
                userName: formData.username,
                fullName: formData.fullname, 
                email: formData.email,
                phoneNumber: formData.phoneNumber,
                gender: formData.gender,
                dateOfBirth: formData.dateOfBirth,
                status: formData.status,
                roleName: formData.roleName, // Cập nhật role trong state
                avatar: formData.avatar || user.avatar
              } 
            : user
        );
        setUsers(updatedUsers);
        
        toast({
          title: "Đã cập nhật tài khoản",
          description: `Tài khoản ${formData.fullname} đã được cập nhật thành công.`,
        });
      } else {
        // Thêm mới user
        const addData: AddUserRequest = {
          username: formData.username,
          phoneNumber: formData.phoneNumber,
          fullname: formData.fullname,
          email: formData.email,
          password: formData.password,
          gender: formData.gender,
          dateOfBirth: formData.dateOfBirth,
          roleName: formData.roleName,
          status: formData.status,
          avatar: formData.avatar || '' // Mặc định là rỗng nếu không có
        };
        
        console.log('Dữ liệu gửi đi khi thêm mới:', JSON.stringify(addData));
        
        const newUser = await UserService.addUser(addData);
        
        // Thêm user mới vào state
        setUsers(prevUsers => [
          {
            ...newUser,
            id: newUser.userID // Thêm id cho tương thích với UI
          },
          ...prevUsers
        ]);
        
        toast({
          title: "Đã thêm tài khoản mới",
          description: `Tài khoản ${formData.fullname} đã được tạo thành công.`,
        });
      }
    } catch (error: any) {
      console.error('Lỗi khi thao tác với người dùng:', error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể thực hiện thao tác, vui lòng thử lại sau.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
      setIsEditDialogOpen(false);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setRoleFilter('all');
    setStatusFilter('all');
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý tài khoản</h1>
          <p className="text-muted-foreground">
            Quản lý và theo dõi tất cả tài khoản người dùng trên nền tảng
          </p>
        </div>
        <Button className="gap-1" onClick={handleAddUser}>
          <UserPlus className="h-4 w-4" />
          <span>Thêm người dùng</span>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Danh sách tài khoản</CardTitle>
          <CardDescription>
            Tổng cộng có {filteredUsers.length} tài khoản {searchTerm || roleFilter !== 'all' || statusFilter !== 'all' ? '(đã lọc)' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Bộ lọc */}
          <UserFilters 
            searchTerm={searchTerm}
            roleFilter={roleFilter}
            statusFilter={statusFilter}
            onSearchChange={setSearchTerm}
            onRoleFilterChange={setRoleFilter}
            onStatusFilterChange={setStatusFilter}
            onReset={resetFilters}
            onExport={() => console.log('Export feature not implemented yet')}
          />
          
          {/* Bảng dữ liệu */}
          {isLoading ? (
            <div className="space-y-3">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="h-12 bg-muted/20 animate-pulse rounded-md" />
              ))}
            </div>
          ) : (
            <UserTable
              users={filteredUsers}
              isSubmitting={isSubmitting}
              onViewUser={handleViewUser}
              onEditUser={handleEditUser}
              onChangeStatus={handleChangeUserStatus}
              onDeleteUser={handleDeleteUser}
            />
          )}
        </CardContent>
      </Card>
      
      {/* View User Detail Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Thông tin chi tiết tài khoản</DialogTitle>
            <DialogDescription>
              Xem thông tin chi tiết của người dùng
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && <UserDetailView user={selectedUser} />}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Đóng
            </Button>
            <Button onClick={() => {
              setIsViewDialogOpen(false);
              setIsEditDialogOpen(true);
            }}>
              Chỉnh sửa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{selectedUser ? 'Chỉnh sửa tài khoản' : 'Thêm tài khoản mới'}</DialogTitle>
            <DialogDescription>
              {selectedUser 
                ? 'Cập nhật thông tin tài khoản người dùng' 
                : 'Nhập thông tin để tạo tài khoản mới'}
            </DialogDescription>
          </DialogHeader>
          <UserEditForm 
            user={selectedUser} 
            isSubmitting={isSubmitting} 
            onSave={saveUserChanges} 
            onCancel={() => setIsEditDialogOpen(false)} 
          />
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa tài khoản</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa tài khoản của <span className="font-semibold">{selectedUser?.fullName || selectedUser?.userName}</span>? 
              Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete} 
              className="gap-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <UserX className="h-4 w-4" />
                  <span>Xóa tài khoản</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 