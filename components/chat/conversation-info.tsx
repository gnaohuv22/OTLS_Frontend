import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Conversation, User } from './types';

interface ConversationInfoProps {
  conversation: Conversation;
  currentUser: User;
}

const ConversationInfo: React.FC<ConversationInfoProps> = ({ 
  conversation, 
  currentUser 
}) => {
  const otherUser = conversation.participants.find(p => p.id !== currentUser.id);
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Thông tin cuộc trò chuyện">
          <AlertCircle className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Thông tin cuộc trò chuyện</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center py-4">
          <Avatar className="h-20 w-20 mb-4">
            <AvatarImage src={otherUser?.avatar} />
            <AvatarFallback>{otherUser?.name?.charAt(0) || '?'}</AvatarFallback>
          </Avatar>
          <h3 className="text-lg font-medium">{otherUser?.name}</h3>
          <p className="text-sm text-muted-foreground">{otherUser?.status === 'online' ? 'Đang hoạt động' : 'Không hoạt động'}</p>
        </div>
        
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Thông tin người dùng</h4>
            <div className="bg-muted p-3 rounded-md">
              <div className="flex justify-between py-1">
                <span className="text-sm text-muted-foreground">ID</span>
                <span className="text-sm font-medium">{otherUser?.id}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-sm text-muted-foreground">Trạng thái</span>
                <span className="text-sm font-medium flex items-center">
                  <span className={`h-2 w-2 rounded-full mr-2 ${
                    otherUser?.status === 'online' 
                      ? 'bg-green-500' 
                      : otherUser?.status === 'away' 
                        ? 'bg-yellow-500' 
                        : 'bg-gray-500'
                  }`}></span>
                  {otherUser?.status === 'online' 
                    ? 'Trực tuyến' 
                    : otherUser?.status === 'away' 
                      ? 'Đang rời đi' 
                      : 'Ngoại tuyến'}
                </span>
              </div>
              {otherUser?.lastSeen && (
                <div className="flex justify-between py-1">
                  <span className="text-sm text-muted-foreground">Hoạt động cuối</span>
                  <span className="text-sm font-medium">
                    {new Date(otherUser.lastSeen).toLocaleString('vi-VN')}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Thống kê cuộc trò chuyện</h4>
            <div className="bg-muted p-3 rounded-md">
              <div className="flex justify-between py-1">
                <span className="text-sm text-muted-foreground">Số tin nhắn</span>
                <span className="text-sm font-medium">{conversation.messages.length}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-sm text-muted-foreground">Bắt đầu</span>
                <span className="text-sm font-medium">
                  {conversation.messages.length > 0 
                    ? new Date(conversation.messages[0].timestamp).toLocaleDateString('vi-VN') 
                    : 'Chưa có tin nhắn'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-sm text-muted-foreground">Cuộc trò chuyện riêng tư</span>
                <span className="text-sm font-medium">Có</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConversationInfo; 