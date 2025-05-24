import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SettingsTabProps } from '../types';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Trash2 } from 'lucide-react';
import { UserRole } from '../types';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { ClassroomService } from '@/lib/api/classes';
import { useAuth } from '@/lib/auth-context';

interface DeleteClassConfirmationProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  confirmText: string;
  setConfirmText: (text: string) => void;
  handleDeleteClass: () => Promise<void>;
  className: string;
  isDeleting: boolean;
}

function DeleteClassConfirmation({ isOpen, setIsOpen, confirmText, setConfirmText, handleDeleteClass, className, isDeleting }: DeleteClassConfirmationProps) {
  const requiredText = "XÓA LỚP HỌC";
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="w-full max-w-md">
        <DialogHeader>
          <DialogTitle className="text-destructive flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Xác nhận xóa lớp học
          </DialogTitle>
          <DialogDescription>
            Hành động này không thể hoàn tác. Lớp học <strong>{className}</strong> sẽ bị xóa vĩnh viễn cùng tất cả tài liệu, bài tập và thông báo.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Để xác nhận, nhập "{requiredText}" vào ô bên dưới:</Label>
            <div 
              className="p-2 bg-muted rounded font-bold text-sm select-none"
              onCopy={(e) => e.preventDefault()}
              onCut={(e) => e.preventDefault()}
            >
              {requiredText}
            </div>
            <Input 
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Nhập xác nhận..."
              className="mt-2"
            />
          </div>
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={() => setIsOpen(false)}
            className="w-full sm:w-auto"
            disabled={isDeleting}
          >
            Hủy
          </Button>
          <Button 
            variant="destructive" 
            disabled={confirmText !== requiredText || isDeleting}
            onClick={handleDeleteClass}
            className="w-full sm:w-auto"
          >
            {isDeleting ? "Đang xóa..." : "Xóa lớp học"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface LeaveClassConfirmationProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  confirmText: string;
  setConfirmText: (text: string) => void;
  handleLeaveClass: () => Promise<void>;
  isLeaving: boolean;
}

function LeaveClassConfirmation({ isOpen, setIsOpen, confirmText, setConfirmText, handleLeaveClass, isLeaving }: LeaveClassConfirmationProps) {
  const requiredText = "TÔI MUỐN RỜI KHỎI LỚP";
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="w-full max-w-md">
        <DialogHeader>
          <DialogTitle className="text-destructive flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Xác nhận rời khỏi lớp học
          </DialogTitle>
          <DialogDescription>
            Hành động này không thể hoàn tác. Bạn sẽ mất quyền truy cập vào tất cả tài liệu, bài tập và thông báo của lớp.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Để xác nhận, nhập "{requiredText}" vào ô bên dưới:</Label>
            <div 
              className="p-2 bg-muted rounded font-bold text-sm select-none"
              onCopy={(e) => e.preventDefault()}
              onCut={(e) => e.preventDefault()}
            >
              {requiredText}
            </div>
            <Input 
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Nhập xác nhận..."
              className="mt-2"
            />
          </div>
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={() => setIsOpen(false)}
            className="w-full sm:w-auto"
            disabled={isLeaving}
          >
            Hủy
          </Button>
          <Button 
            variant="destructive" 
            disabled={confirmText !== requiredText || isLeaving}
            onClick={handleLeaveClass}
            className="w-full sm:w-auto"
          >
            {isLeaving ? "Đang rời khỏi..." : "Rời khỏi lớp"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function SettingsTab({ classDetail, openEditClassModal, role = 'Student' }: SettingsTabProps & { role?: UserRole }) {
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [confirmLeaveText, setConfirmLeaveText] = useState('');
  const [confirmDeleteText, setConfirmDeleteText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const handleLeaveClass = async () => {
    try {
      setIsLeaving(true);
      
      // Kiểm tra xem có thông tin người dùng và lớp học không
      if (!user?.userID) {
        throw new Error('Không tìm thấy thông tin người dùng');
      }
      
      if (!classDetail.classroomId) {
        throw new Error('Không tìm thấy thông tin lớp học');
      }
      
      // Gọi API rời khỏi lớp học
      await ClassroomService.unenrollStudent(classDetail.classroomId, user.userID);
      
      toast({
        title: "Rời khỏi lớp học thành công",
        description: `Bạn đã rời khỏi lớp học ${classDetail.name} thành công. Bạn có thể tham gia lại lớp học bất kì lúc nào bằng cách yêu cầu giáo viên thêm bạn vào lớp.`,
        variant: "default"
      });
      
      setShowLeaveConfirmation(false);
      
      // Chuyển hướng về trang classes
      setTimeout(() => {
        router.push('/classes');
      }, 1000);
    } catch (error: any) {
      toast({
        title: "Lỗi khi rời khỏi lớp học",
        description: error.message || "Đã xảy ra lỗi khi rời khỏi lớp học. Vui lòng thử lại sau.",
        variant: "destructive"
      });
    } finally {
      setIsLeaving(false);
    }
  };

  const handleDeleteClass = async () => {
    try {
      setIsDeleting(true);
      
      // Kiểm tra xem classDetail có classroomId không
      if (!classDetail.classroomId) {
        throw new Error('Không tìm thấy thông tin lớp học');
      }
      
      // Gọi API xóa lớp học
      await ClassroomService.deleteClassroom(classDetail.classroomId);
      
      toast({
        title: "Xóa lớp học thành công",
        description: `Lớp học ${classDetail.name} đã được xóa thành công.`,
        variant: "default"
      });
      
      setShowDeleteConfirmation(false);
      
      // Chuyển hướng về trang danh sách lớp học
      setTimeout(() => {
        router.push('/classes');
      }, 1000);
    } catch (error: any) {
      toast({
        title: "Lỗi khi xóa lớp học",
        description: error.message || "Đã xảy ra lỗi khi xóa lớp học. Vui lòng thử lại sau.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Thông tin lớp học - hiển thị cho cả Teacher và Student */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Thông tin lớp học</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-4">
              <div className="font-medium text-muted-foreground">Tên lớp:</div>
              <div className="col-span-2">{classDetail.name}</div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="font-medium text-muted-foreground">Môn học:</div>
              <div className="col-span-2">{classDetail.subject}</div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="font-medium text-muted-foreground">Lịch học:</div>
              <div className="col-span-2">{classDetail.schedule}</div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="font-medium text-muted-foreground">Thời gian:</div>
              <div className="col-span-2">{classDetail.time}</div>
            </div>
          </div>
          
          {role === 'Teacher' && (
            <Button 
              variant="outline" 
              onClick={openEditClassModal} 
              className="w-full"
            >
              Chỉnh sửa thông tin
            </Button>
          )}
        </CardContent>
      </Card>
      
      {/* Phần quản lý lớp học - Hiển thị khác nhau cho Student và Teacher */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quản lý lớp học</CardTitle>
          <CardDescription>
            {role === 'Teacher' 
              ? 'Các hành động quản trị lớp học' 
              : 'Các hành động liên quan đến tham gia lớp học'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {role === 'Student' ? (
            <Button 
              variant="destructive" 
              onClick={() => setShowLeaveConfirmation(true)}
              className="w-full"
            >
              Rời khỏi lớp học
            </Button>
          ) : (
            <>
              <div className="space-y-2">
                <Button 
                  variant="destructive" 
                  onClick={() => setShowDeleteConfirmation(true)}
                  className="w-full"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Xóa lớp học
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Lưu ý: Hành động này không thể hoàn tác và sẽ xóa vĩnh viễn mọi dữ liệu của lớp.
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Modal xác nhận rời khỏi lớp */}
      <LeaveClassConfirmation 
        isOpen={showLeaveConfirmation}
        setIsOpen={setShowLeaveConfirmation}
        confirmText={confirmLeaveText}
        setConfirmText={setConfirmLeaveText}
        handleLeaveClass={handleLeaveClass}
        isLeaving={isLeaving}
      />

      {/* Modal xác nhận xóa lớp học */}
      <DeleteClassConfirmation 
        isOpen={showDeleteConfirmation}
        setIsOpen={setShowDeleteConfirmation}
        confirmText={confirmDeleteText}
        setConfirmText={setConfirmDeleteText}
        handleDeleteClass={handleDeleteClass}
        className={classDetail.name}
        isDeleting={isDeleting}
      />
    </div>
  );
} 