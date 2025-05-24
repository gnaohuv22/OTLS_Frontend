import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle } from 'lucide-react';
import { AnnouncementsTabProps, Announcement } from '../types';
import { AnnouncementCard } from '../announcements/announcement-card';
import { NewAnnouncementForm } from '../announcements/new-announcement-form';

export function AnnouncementsTab({ classDetail, role, userData, formatDate }: AnnouncementsTabProps) {
  const { toast } = useToast();
  const [visibleAnnouncements, setVisibleAnnouncements] = useState(5);
  const [showNewAnnouncementForm, setShowNewAnnouncementForm] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    isImportant: false
  });
  const [commentText, setCommentText] = useState('');
  const [activeAnnouncementId, setActiveAnnouncementId] = useState<number | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>(classDetail.announcements);
  
  // State để xử lý chỉnh sửa thông báo
  const [editingAnnouncementId, setEditingAnnouncementId] = useState<number | null>(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState({
    title: '',
    content: '',
    isImportant: false
  });

  // Sắp xếp thông báo: quan trọng & mới nhất lên đầu
  const sortedAnnouncements = [...announcements].sort((a, b) => {
    if (a.isImportant !== b.isImportant) return a.isImportant ? -1 : 1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const loadMoreAnnouncements = () => {
    setVisibleAnnouncements(prev => Math.min(prev + 5, announcements.length));
  };

  const resetNewAnnouncementForm = () => {
    setNewAnnouncement({
      title: '',
      content: '',
      isImportant: false
    });
    setShowNewAnnouncementForm(false);
  };

  // Hàm xử lý khi bắt đầu chỉnh sửa thông báo
  const handleStartEditAnnouncement = (announcement: Announcement) => {
    setEditingAnnouncementId(announcement.id);
    setEditingAnnouncement({
      title: announcement.title,
      content: announcement.content,
      isImportant: announcement.isImportant
    });
  };

  // Hàm hủy chỉnh sửa thông báo
  const handleCancelEditAnnouncement = () => {
    setEditingAnnouncementId(null);
    setEditingAnnouncement({
      title: '',
      content: '',
      isImportant: false
    });
  };

  // Hàm lưu thông báo đã chỉnh sửa
  const handleSaveEditAnnouncement = () => {
    if (!editingAnnouncement.title || !editingAnnouncement.content) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ tiêu đề và nội dung thông báo.",
      });
      return;
    }

    // Cập nhật thông báo trong danh sách
    setAnnouncements(prevAnnouncements => 
      prevAnnouncements.map(announcement => 
        announcement.id === editingAnnouncementId
          ? { 
              ...announcement, 
              title: editingAnnouncement.title,
              content: editingAnnouncement.content,
              isImportant: editingAnnouncement.isImportant
            }
          : announcement
      )
    );

    toast({
      title: "Thành công",
      description: "Đã cập nhật thông báo.",
    });

    handleCancelEditAnnouncement();
  };

  // Hàm xóa thông báo
  const handleDeleteAnnouncement = (announcementId: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa thông báo này?')) {
      setAnnouncements(prevAnnouncements => 
        prevAnnouncements.filter(a => a.id !== announcementId)
      );

      toast({
        title: "Thành công",
        description: "Đã xóa thông báo.",
      });
    }
  };

  const handleCreateAnnouncement = () => {
    if (!newAnnouncement.title || !newAnnouncement.content) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ tiêu đề và nội dung thông báo.",
      });
      return;
    }

    // Giả lập thêm thông báo mới
    const now = new Date();
    const newAnnouncementObj: Announcement = {
      id: announcements.length > 0 ? Math.max(...announcements.map(a => a.id)) + 1 : 1,
      title: newAnnouncement.title,
      content: newAnnouncement.content,
      date: now.toISOString(),
      isImportant: newAnnouncement.isImportant,
      author: userData?.fullName || (role === 'Teacher' ? 'Giáo viên' : 'Học sinh'),
      authorRole: role as string,
      comments: []
    };

    // Cập nhật danh sách thông báo
    setAnnouncements(prevAnnouncements => [newAnnouncementObj, ...prevAnnouncements]);

    toast({
      title: "Thành công",
      description: "Đã thêm thông báo mới.",
    });

    resetNewAnnouncementForm();
  };

  const handleAddComment = (announcementId: number, commentText: string) => {
    if (!commentText.trim()) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Vui lòng nhập nội dung bình luận.",
      });
      return;
    }

    // Giả lập thêm bình luận mới
    const now = new Date();
    const newComment = {
      id: Math.floor(Math.random() * 1000),
      content: commentText,
      date: now.toISOString(),
      author: userData?.fullName || (role === 'Teacher' ? 'Giáo viên' : 'Học sinh'),
      authorRole: role as string
    };

    // Cập nhật danh sách bình luận cho thông báo
    setAnnouncements(prevAnnouncements => 
      prevAnnouncements.map(announcement => 
        announcement.id === announcementId
          ? { ...announcement, comments: [...announcement.comments, newComment] }
          : announcement
      )
    );
    
    toast({
      title: "Thành công",
      description: "Đã thêm bình luận mới.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 pt-2">
        <h1 className="text-2xl font-bold tracking-tight">Thông báo lớp học</h1>
        {role === 'Teacher' && (
          <Button 
            onClick={() => setShowNewAnnouncementForm(prev => !prev)}
            className="gap-2 w-full sm:w-auto"
          >
            <PlusCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Tạo thông báo mới</span>
            <span className="sm:hidden">Thêm thông báo</span>
          </Button>
        )}
      </div>
      
      {showNewAnnouncementForm && (
        <NewAnnouncementForm
          newAnnouncement={newAnnouncement}
          setNewAnnouncement={setNewAnnouncement}
          handleCreateAnnouncement={handleCreateAnnouncement}
          resetNewAnnouncementForm={resetNewAnnouncementForm}
        />
      )}
      
      <div className="space-y-4">
        {sortedAnnouncements.slice(0, visibleAnnouncements).map((announcement) => (
          <AnnouncementCard
            key={announcement.id}
            announcement={announcement}
            role={role}
            userData={userData}
            formatDate={formatDate}
            handleStartEditAnnouncement={handleStartEditAnnouncement}
            handleDeleteAnnouncement={handleDeleteAnnouncement}
            onAddComment={handleAddComment}
            isEditing={editingAnnouncementId === announcement.id}
            editingAnnouncement={editingAnnouncementId === announcement.id ? editingAnnouncement : undefined}
            setEditingAnnouncement={editingAnnouncementId === announcement.id ? setEditingAnnouncement : undefined}
            handleCancelEditAnnouncement={handleCancelEditAnnouncement}
            handleSaveEditAnnouncement={handleSaveEditAnnouncement}
          />
        ))}

        {visibleAnnouncements < announcements.length && (
          <div className="flex justify-center mt-4">
            <Button variant="outline" onClick={loadMoreAnnouncements}>
              Xem thêm thông báo
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 