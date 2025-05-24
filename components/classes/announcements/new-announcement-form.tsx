import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { NewAnnouncementFormProps } from '../types';

export function NewAnnouncementForm({
  newAnnouncement,
  setNewAnnouncement,
  handleCreateAnnouncement,
  resetNewAnnouncementForm
}: NewAnnouncementFormProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Tạo thông báo mới</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="announcement-title">Tiêu đề</Label>
            <Input
              id="announcement-title"
              placeholder="Nhập tiêu đề"
              value={newAnnouncement.title}
              onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="announcement-content">Nội dung</Label>
            <Textarea
              id="announcement-content"
              placeholder="Nhập nội dung thông báo hoặc thảo luận"
              rows={5}
              value={newAnnouncement.content}
              onChange={(e) => setNewAnnouncement({...newAnnouncement, content: e.target.value})}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="is-important" 
              checked={newAnnouncement.isImportant}
              onCheckedChange={(checked) => 
                setNewAnnouncement({...newAnnouncement, isImportant: checked === true})
              }
            />
            <Label htmlFor="is-important">Đánh dấu là thông báo quan trọng</Label>
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={resetNewAnnouncementForm}
              className="w-full sm:w-auto"
            >
              Hủy
            </Button>
            <Button 
              onClick={handleCreateAnnouncement}
              className="w-full sm:w-auto"
            >
              Đăng thông báo
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 