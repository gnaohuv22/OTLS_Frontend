'use client';

import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { 
  Pencil, 
  Trash2, 
  MoreVertical, 
  Pin, 
  PinOff, 
  Save, 
  X 
} from 'lucide-react';
import { AnnouncementCardProps } from '../types';
import { CommentSection } from './comment-section';

// Update the props interface to include students and teacher
interface EnhancedAnnouncementCardProps extends AnnouncementCardProps {
  students: Array<{
    id: string;
    name: string;
    avatar: string | null;
    email?: string;
  }>;
  teacher?: {
    id: string;
    name: string;
    avatar?: string | null;
    email?: string;
  };
}

export function AnnouncementCard({
  announcement,
  role,
  userData,
  formatDate,
  onUpdate,
  onDelete,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
  onTogglePin,
  students,
  teacher
}: EnhancedAnnouncementCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: announcement.title,
    content: announcement.content,
    isImportant: announcement.isImportant,
    isPinned: announcement.isPinned
  });

  const handleStartEdit = () => {
    setEditForm({
      title: announcement.title,
      content: announcement.content,
      isImportant: announcement.isImportant,
      isPinned: announcement.isPinned
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({
      title: announcement.title,
      content: announcement.content,
      isImportant: announcement.isImportant,
      isPinned: announcement.isPinned
    });
  };

  const handleSaveEdit = () => {
    if (!editForm.title.trim() || !editForm.content.trim()) {
      return;
    }

    const updatedAnnouncement = {
      ...announcement,
      title: editForm.title,
      content: editForm.content,
      isImportant: editForm.isImportant,
      isPinned: editForm.isPinned,
      isEdited: true,
      editedAt: new Date().toISOString()
    };

    onUpdate(updatedAnnouncement);
    setIsEditing(false);
  };

  const handleDelete = () => {
    onDelete(announcement.id);
  };

  const handleTogglePin = () => {
    onTogglePin(announcement.id, !announcement.isPinned);
  };

  const canEdit = role === 'Teacher' && announcement.authorId === userData.id;
  const canDelete = role === 'Teacher' && announcement.authorId === userData.id;
  const canPin = role === 'Teacher';

  return (
    <Card className={`${announcement.isImportant ? "border-l-4 border-l-destructive" : ""} ${announcement.isPinned ? "border-t-2 border-t-blue-500" : ""}`}>
      {isEditing ? (
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-announcement-title">Tiêu đề</Label>
              <Input
                id="edit-announcement-title"
                placeholder="Nhập tiêu đề"
                value={editForm.title}
                onChange={(e) => setEditForm({
                  ...editForm,
                  title: e.target.value
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-announcement-content">Nội dung</Label>
              <Textarea
                id="edit-announcement-content"
                placeholder="Nhập nội dung thông báo hoặc thảo luận"
                rows={5}
                value={editForm.content}
                onChange={(e) => setEditForm({
                  ...editForm,
                  content: e.target.value
                })}
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="edit-is-important" 
                  checked={editForm.isImportant}
                  onCheckedChange={(checked) => setEditForm({
                    ...editForm,
                    isImportant: checked === true
                  })}
                />
                <Label htmlFor="edit-is-important">Đánh dấu là thông báo quan trọng</Label>
              </div>
              {canPin && (
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="edit-is-pinned" 
                    checked={editForm.isPinned}
                    onCheckedChange={(checked) => setEditForm({
                      ...editForm,
                      isPinned: checked === true
                    })}
                  />
                  <Label htmlFor="edit-is-pinned">Ghim thông báo lên đầu</Label>
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={handleCancelEdit}
                className="w-full sm:w-auto"
              >
                <X className="h-4 w-4 mr-2" />
                Hủy
              </Button>
              <Button 
                onClick={handleSaveEdit}
                className="w-full sm:w-auto"
                disabled={!editForm.title.trim() || !editForm.content.trim()}
              >
                <Save className="h-4 w-4 mr-2" />
                Lưu thay đổi
              </Button>
            </div>
          </div>
        </CardContent>
      ) : (
        <>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <CardTitle className="flex items-center gap-2 flex-wrap">
                {announcement.title}
                {announcement.isImportant && (
                  <Badge variant="destructive">Quan trọng</Badge>
                )}
                {announcement.isPinned && (
                  <Badge variant="secondary" className="gap-1">
                    <Pin className="h-3 w-3" />
                    Đã ghim
                  </Badge>
                )}
                {announcement.isEdited && (
                  <Badge variant="outline" className="text-xs">
                    Đã chỉnh sửa
                  </Badge>
                )}
              </CardTitle>
              <div className="flex items-center gap-2 justify-between sm:justify-end">
                <span className="text-sm text-muted-foreground">
                  {formatDate(announcement.date)}
                  {announcement.isEdited && announcement.editedAt && (
                    <span className="block text-xs">
                      (Sửa: {formatDate(announcement.editedAt)})
                    </span>
                  )}
                </span>
                {(canEdit || canDelete || canPin) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {canPin && (
                        <>
                          <DropdownMenuItem onClick={handleTogglePin}>
                            {announcement.isPinned ? (
                              <>
                                <PinOff className="h-4 w-4 mr-2" />
                                Bỏ ghim
                              </>
                            ) : (
                              <>
                                <Pin className="h-4 w-4 mr-2" />
                                Ghim thông báo
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      {canEdit && (
                        <DropdownMenuItem onClick={handleStartEdit}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                      )}
                      {canDelete && (
                        <DropdownMenuItem 
                          onClick={handleDelete}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Xóa
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
            <CardDescription>
              Đăng bởi: {announcement.author} ({announcement.authorRole === 'Student' ? 'Học sinh' : 'Giáo viên'})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line">{announcement.content}</p>
          </CardContent>
        </>
      )}
      
      {!isEditing && (
        <CardFooter>
          <CommentSection 
            announcementId={announcement.id}
            comments={announcement.comments} 
            userData={userData}
            formatDate={formatDate} 
            onAddComment={onAddComment}
            onUpdateComment={onUpdateComment}
            onDeleteComment={onDeleteComment}
            students={students}
            teacher={teacher}
          />
        </CardFooter>
      )}
    </Card>
  );
} 