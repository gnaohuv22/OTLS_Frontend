import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AnnouncementCardProps } from '../types';
import { CommentSection } from './comment-section';

export function AnnouncementCard({
  announcement,
  role,
  userData,
  formatDate,
  handleStartEditAnnouncement,
  handleDeleteAnnouncement,
  onAddComment,
  isEditing,
  editingAnnouncement,
  setEditingAnnouncement,
  handleCancelEditAnnouncement,
  handleSaveEditAnnouncement
}: AnnouncementCardProps) {
  
  const handleCommentSubmit = (comment: string) => {
    onAddComment(announcement.id, comment);
  };

  return (
    <Card className={announcement.isImportant ? "border-l-4 border-l-destructive" : ""}>
      {isEditing && editingAnnouncement && setEditingAnnouncement ? (
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-announcement-title">Tiêu đề</Label>
              <Input
                id="edit-announcement-title"
                placeholder="Nhập tiêu đề"
                value={editingAnnouncement.title}
                onChange={(e) => setEditingAnnouncement({
                  ...editingAnnouncement,
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
                value={editingAnnouncement.content}
                onChange={(e) => setEditingAnnouncement({
                  ...editingAnnouncement,
                  content: e.target.value
                })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="edit-is-important" 
                checked={editingAnnouncement.isImportant}
                onCheckedChange={(checked) => 
                  setEditingAnnouncement({
                    ...editingAnnouncement,
                    isImportant: checked === true
                  })
                }
              />
              <Label htmlFor="edit-is-important">Đánh dấu là thông báo quan trọng</Label>
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={handleCancelEditAnnouncement}
                className="w-full sm:w-auto"
              >
                Hủy
              </Button>
              <Button 
                onClick={handleSaveEditAnnouncement}
                className="w-full sm:w-auto"
              >
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
              </CardTitle>
              <div className="flex items-center gap-2 justify-between sm:justify-end">
                <span className="text-sm text-muted-foreground">
                  {formatDate(announcement.date)}
                </span>
                {role === 'Teacher' && announcement.authorRole === 'Teacher' && (
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8" 
                      onClick={() => handleStartEditAnnouncement(announcement)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil">
                        <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                        <path d="m15 5 4 4"/>
                      </svg>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive" 
                      onClick={() => handleDeleteAnnouncement(announcement.id)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2">
                        <path d="M3 6h18"/>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                        <line x1="10" x2="10" y1="11" y2="17"/>
                        <line x1="14" x2="14" y1="11" y2="17"/>
                      </svg>
                    </Button>
                  </div>
                )}
              </div>
            </div>
            <CardDescription>
              Đăng bởi: {announcement.author} ({announcement.authorRole === 'Teacher' ? 'Giáo viên' : 'Học sinh'})
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
            comments={announcement.comments} 
            formatDate={formatDate} 
            onAddComment={handleCommentSubmit} 
          />
        </CardFooter>
      )}
    </Card>
  );
} 