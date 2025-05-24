import { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';
import { CommentSectionProps } from '../types';

export function CommentSection({ comments, formatDate, onAddComment }: CommentSectionProps) {
  const [commentText, setCommentText] = useState('');
  const [isActive, setIsActive] = useState(false);

  const handleSubmit = () => {
    if (commentText.trim()) {
      onAddComment(commentText);
      setCommentText('');
    }
  };

  return (
    <div className="mt-6 w-full">
      {comments.length > 0 && (
        <>
          <Separator className="my-4" />
          <h4 className="text-sm font-medium mb-4">Bình luận ({comments.length})</h4>
          <div className="space-y-4 w-full">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3 w-full">
                <Avatar>
                  <AvatarFallback>{comment.author.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 w-full">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">{comment.author}</span>
                    <Badge variant="outline" className="text-xs">
                      {comment.authorRole === 'Teacher' ? 'Giáo viên' : 'Học sinh'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(comment.date)}
                    </span>
                  </div>
                  <p className="text-sm mt-1">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {isActive ? (
        <div className="w-full space-y-2 mt-4">
          <Textarea
            placeholder="Viết bình luận của bạn..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="w-full"
          />
          <div className="flex flex-col sm:flex-row justify-end gap-2 w-full">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsActive(false)}
              className="w-full sm:w-auto"
            >
              Hủy
            </Button>
            <Button 
              size="sm"
              onClick={handleSubmit}
              className="gap-1 w-full sm:w-auto"
            >
              <Send className="h-3.5 w-3.5" />
              Gửi
            </Button>
          </div>
        </div>
      ) : (
        <Button 
          variant="ghost" 
          className="w-full justify-start text-primary mt-2"
          onClick={() => setIsActive(true)}
        >
          <Send className="h-4 w-4 mr-2" />
          {comments.length > 0 
            ? `Xem và trả lời (${comments.length})` 
            : 'Viết bình luận'
          }
        </Button>
      )}
    </div>
  );
} 