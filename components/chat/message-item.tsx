import React, { useState } from 'react';
import Image from 'next/image';
import { Download, Maximize2, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { formatFileSize, formatMessageDate, formatTime, isSameDay, isImage } from './utils';
import { getFileIcon } from './file-icons';
import { Message, User } from './types';

interface MessageItemProps {
  message: Message;
  isCurrentUser: boolean;
  sender: User;
  prevMessage?: Message;
}

const MessageItem: React.FC<MessageItemProps> = ({ 
  message, 
  isCurrentUser, 
  sender, 
  prevMessage 
}) => {
  const [showImagePreview, setShowImagePreview] = useState<string | null>(null);
  const [imageLoadingState, setImageLoadingState] = useState<Record<string, boolean>>({});
  
  // Kiểm tra xem tin nhắn này có phải là tin nhắn đầu tiên của ngày mới không
  const isNewDay = prevMessage ? 
    !isSameDay(new Date(message.timestamp), new Date(prevMessage.timestamp)) : 
    true;
  
  // Kiểm tra xem tin nhắn này có cách tin nhắn trước đó hơn 1 giờ không
  const isTimeGap = prevMessage ? 
    (new Date(message.timestamp).getTime() - new Date(prevMessage.timestamp).getTime() > 3600000) : 
    false;
  
  // Kiểm tra xem tin nhắn trước đó có phải của cùng người gửi không
  const isSameSender = prevMessage ? 
    prevMessage.senderId === message.senderId : 
    false;
  
  // Xử lý sự kiện image load
  const handleImageLoad = (attachmentId: string) => {
    setImageLoadingState(prev => ({
      ...prev,
      [attachmentId]: false
    }));
  };

  // Xử lý sự kiện image error
  const handleImageError = (attachmentId: string) => {
    setImageLoadingState(prev => ({
      ...prev,
      [attachmentId]: false
    }));
  };
  
  return (
    <>
      {/* Hiển thị ngăn cách ngày nếu là ngày mới */}
      {isNewDay && (
        <div className="flex justify-center my-4">
          <div className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
            {formatMessageDate(message.timestamp)}
          </div>
        </div>
      )}
      
      {/* Hiển thị ngăn cách thời gian nếu cách nhau hơn 1 giờ */}
      {!isNewDay && isTimeGap && (
        <div className="flex justify-center my-3">
          <div className="bg-muted/50 px-2 py-0.5 rounded-full text-xs text-muted-foreground">
            {formatTime(message.timestamp)}
          </div>
        </div>
      )}
      
      <div 
        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-2 group transition-opacity duration-200 animate-in fade-in slide-in-from-bottom-2`}
      >
        {/* Avatar - chỉ hiển thị nếu không phải người hiện tại và không phải là tin nhắn cùng người gửi liên tiếp */}
        {!isCurrentUser && (!isSameSender || isTimeGap) && (
          <Avatar className="h-8 w-8 mr-2 flex-shrink-0 self-end mb-1">
            <AvatarImage src={sender.avatar} alt={sender.name} />
            <AvatarFallback>{sender.name.charAt(0)}</AvatarFallback>
          </Avatar>
        )}
        
        {/* Khoảng trống để canh lề khi không hiển thị avatar */}
        {!isCurrentUser && isSameSender && !isTimeGap && (
          <div className="w-8 mr-2 flex-shrink-0"></div>
        )}
        
        <div className={`max-w-xs ${isCurrentUser ? 'mr-2' : 'ml-0'}`}>
          {/* Hiển thị tên người gửi nếu đây không phải là tin nhắn của chính mình và là tin nhắn đầu tiên hoặc sau khoảng thời gian */}
          {!isCurrentUser && (!isSameSender || isTimeGap) && (
            <div className="text-xs text-muted-foreground mb-1 ml-1">{sender.name}</div>
          )}
          
          <div className={`px-3 py-2 rounded-lg break-words ${
            isCurrentUser 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted'
          }`}>
            {message.content}
            
            {/* Hiển thị file đính kèm */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="mt-2 space-y-2">
                {message.attachments.map((attachment) => (
                  <div key={attachment.id}>
                    {isImage(attachment.type) ? (
                      <div className="mt-2">
                        <div 
                          className="relative group rounded overflow-hidden"
                          style={{ 
                            minHeight: imageLoadingState[attachment.id] !== false ? '120px' : 'auto',
                            backgroundColor: 'transparent'
                          }}
                        >
                          {imageLoadingState[attachment.id] !== false && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="animate-pulse w-6 h-6 rounded-full bg-primary/20"></div>
                            </div>
                          )}
                          <div 
                            className="max-w-full cursor-pointer hover:opacity-90 transition-opacity relative"
                            onClick={() => setShowImagePreview(attachment.url)}
                          >
                            <Image 
                              src={attachment.url}
                              alt={attachment.name}
                              width={300}
                              height={200}
                              className="rounded object-contain max-w-full"
                              style={{ 
                                objectFit: 'contain', 
                                maxWidth: '100%', 
                                height: 'auto',
                                opacity: imageLoadingState[attachment.id] !== false ? 0 : 1
                              }}
                              onLoad={() => handleImageLoad(attachment.id)}
                              onError={() => handleImageError(attachment.id)}
                              priority={true}
                            />
                          </div>
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex gap-1">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7 bg-background/80 backdrop-blur-sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowImagePreview(attachment.url);
                                }}
                                aria-label="Xem ảnh phóng to"
                                title="Xem ảnh phóng to"
                              >
                                <Maximize2 className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7 bg-background/80 backdrop-blur-sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(attachment.url, '_blank');
                                }}
                                aria-label="Tải xuống ảnh"
                                title="Tải xuống ảnh"
                              >
                                <Download className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {attachment.name} ({formatFileSize(attachment.size)})
                        </div>
                      </div>
                    ) : (
                      <div 
                        className={`flex items-center p-2 rounded transition-colors ${
                          isCurrentUser 
                            ? 'bg-background hover:bg-background/90 text-foreground border border-border/30' 
                            : 'bg-background hover:bg-background/90 text-foreground border border-border/30'
                        }`}
                      >
                        <div className={`p-2 rounded ${
                          isCurrentUser 
                            ? 'bg-primary/10' 
                            : 'bg-primary/10'
                        }`}>
                          {getFileIcon(attachment.type)}
                        </div>
                        <div className="ml-2 flex-1 min-w-0">
                          <div className="text-xs font-medium truncate">
                            {attachment.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatFileSize(attachment.size)}
                          </div>
                        </div>
                        <a 
                          href={attachment.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-xs hover:underline ml-2 text-primary"
                          download={attachment.name}
                        >
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="h-7 text-xs"
                          >
                            <Download className="h-3.5 w-3.5 mr-1" />
                            Tải xuống
                          </Button>
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="text-xs text-muted-foreground mt-1 px-1">
            {formatTime(message.timestamp)}
          </div>
        </div>
        
        {/* Avatar cho tin nhắn của người dùng hiện tại */}
        {isCurrentUser && (!isSameSender || isTimeGap) && (
          <Avatar className="h-8 w-8 ml-2 flex-shrink-0 self-end mb-1">
            <AvatarImage src={sender.avatar} alt={sender.name} />
            <AvatarFallback>{sender.name.charAt(0)}</AvatarFallback>
          </Avatar>
        )}
        
        {/* Khoảng trống để canh lề khi không hiển thị avatar */}
        {isCurrentUser && isSameSender && !isTimeGap && (
          <div className="w-8 ml-2 flex-shrink-0"></div>
        )}
      </div>
      
      {/* Dialog để xem ảnh phóng to */}
      {showImagePreview && (
        <Dialog open={!!showImagePreview} onOpenChange={() => setShowImagePreview(null)}>
          <DialogContent className="max-w-4xl p-0 overflow-hidden bg-background/95 backdrop-blur-sm border border-border/50">
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="relative w-full max-h-[80vh]">
                <Image 
                  src={showImagePreview}
                  alt="Xem trước ảnh"
                  width={1200}
                  height={800}
                  className="object-contain mx-auto"
                  style={{ maxHeight: '80vh', width: 'auto' }}
                  priority={true}
                />
              </div>
              <div className="absolute top-2 right-2 flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => window.open(showImagePreview, '_blank')}
                  aria-label="Tải xuống ảnh"
                  title="Tải xuống ảnh"
                  className="bg-background/80 backdrop-blur-sm"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowImagePreview(null)}
                  aria-label="Đóng ảnh xem trước"
                  title="Đóng ảnh xem trước"
                  className="bg-background/80 backdrop-blur-sm"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default MessageItem; 