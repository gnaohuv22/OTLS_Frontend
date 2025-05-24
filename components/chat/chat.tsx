import React, { useState, useEffect, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from '@/lib/auth-context';
import Image from "next/image";
import { 
  Send, 
  User,
  ArrowLeft, 
  Plus, 
  Search, 
  X, 
  MessageSquare, 
  Paperclip,
  MessageSquarePlus
} from 'lucide-react';

import { mockUsers, mockConversations } from './mock-data';
import { User as UserType, Message, Conversation, Attachment } from './types';
import { formatFileSize, isImage } from './utils';
import { getFileIcon } from './file-icons';
import MessageItem from './message-item';
import ConversationList from './conversation-list';
import NewChatDialog from './new-chat-dialog';
import ConversationInfo from './conversation-info';

const Chat: React.FC = () => {
  const [activeConversation, setActiveConversation] = useState<string>('');
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [newMessage, setNewMessage] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<UserType[]>([]);
  const [showNewChat, setShowNewChat] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [activeConvTransition, setActiveConvTransition] = useState<boolean>(false);
  
  // Lấy thông tin người dùng từ useAuth
  const { userData, role } = useAuth();
  
  // Giả lập user hiện tại (trong thực tế sẽ lấy từ authentication)
  const currentUser = {
    ...mockUsers[0],
    name: userData?.fullName || mockUsers[0].name
  };
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversations, activeConversation]);

  // Thêm hiệu ứng chuyển đổi khi chuyển cuộc trò chuyện
  useEffect(() => {
    if (activeConversation) {
      setActiveConvTransition(true);
      const timer = setTimeout(() => {
        setActiveConvTransition(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [activeConversation]);
  
  // Thiết lập xử lý kéo thả file
  useEffect(() => {
    const dropZone = dropZoneRef.current;
    if (!dropZone) return;
    
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };
    
    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    };
    
    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      
      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        handleFiles(Array.from(e.dataTransfer.files));
      }
    };
    
    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('dragleave', handleDragLeave);
    dropZone.addEventListener('drop', handleDrop);
    
    return () => {
      dropZone.removeEventListener('dragover', handleDragOver);
      dropZone.removeEventListener('dragleave', handleDragLeave);
      dropZone.removeEventListener('drop', handleDrop);
    };
  }, []);
  
  const handleSendMessage = () => {
    if ((!newMessage.trim() && selectedFiles.length === 0) || !activeConversation) return;
    
    const attachments: Attachment[] = [];
    
    // Trong thực tế, đây là nơi bạn sẽ upload các file lên server và nhận URL 
    // Đây chỉ là giả lập
    if (selectedFiles.length > 0) {
      selectedFiles.forEach((file, index) => {
        const attachment: Attachment = {
          id: `file${Date.now()}_${index}`,
          name: file.name,
          type: file.type,
          size: file.size,
          url: URL.createObjectURL(file) // Trong thực tế, sẽ là URL từ server
        };
        
        // Tạo URL xem trước cho hình ảnh
        if (file.type.startsWith('image/')) {
          attachment.previewUrl = URL.createObjectURL(file);
        }
        
        attachments.push(attachment);
      });
    }
    
    const updatedConversations = conversations.map(conv => {
      if (conv.id === activeConversation) {
        return {
          ...conv,
          messages: [
            ...conv.messages,
            {
              id: `msg${Date.now()}`,
              senderId: currentUser.id,
              content: newMessage.trim(),
              timestamp: new Date(),
              attachments: attachments.length > 0 ? attachments : undefined
            }
          ]
        };
      }
      return conv;
    });
    
    setConversations(updatedConversations);
    setNewMessage('');
    setSelectedFiles([]);
    setUploadProgress(0);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleSelectUser = (user: UserType) => {
    // Chỉ cho phép chọn 1 người
    setSelectedUsers([user]);
    
    // Kiểm tra xem đã có cuộc trò chuyện với người này chưa
    const existingConversation = conversations.find(conv => 
      conv.participants.some(p => p.id === user.id) && 
      conv.participants.some(p => p.id === currentUser.id)
    );
    
    // Nếu đã có cuộc trò chuyện, chọn nó và đóng dialog
    if (existingConversation) {
      setActiveConversation(existingConversation.id);
      setShowNewChat(false);
    }
  };
  
  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter(user => user.id !== userId));
  };
  
  const handleCreateNewChat = (groupName?: string) => {
    if (selectedUsers.length === 0) return;
    
    // Kiểm tra nếu là cuộc trò chuyện 1-1 thì xem đã tồn tại chưa
    if (selectedUsers.length === 1) {
      const existingConversation = conversations.find(conv => 
        conv.participants.some(p => p.id === selectedUsers[0].id) &&
        conv.participants.some(p => p.id === currentUser.id)
      );
      
      if (existingConversation) {
        // Nếu đã tồn tại, chỉ active cuộc trò chuyện đó
        setActiveConversation(existingConversation.id);
        setSelectedUsers([]);
        setShowNewChat(false);
        return;
      }
    }
    
    const newConversation: Conversation = {
      id: `conv${Date.now()}`,
      participants: [...selectedUsers, currentUser],
      messages: []
    };
    
    setConversations([newConversation, ...conversations]);
    setActiveConversation(newConversation.id);
    setSelectedUsers([]);
    setShowNewChat(false);
  };

  // Xử lý việc chọn file từ input hoặc kéo thả
  const handleFiles = (files: File[]) => {
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    const ALLOWED_FILE_TYPES = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', // Hình ảnh
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // Tài liệu
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // Excel
      'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', // PowerPoint
      'text/plain', 'text/csv' // Text, CSV
    ];
    
    // Kiểm tra kích thước và loại file
    const validFiles = files.filter(file => {
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "Lỗi upload file",
          description: `File ${file.name} vượt quá 10MB`,
          variant: "destructive"
        });
        return false;
      }
      
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        toast({
          title: "Loại file không được hỗ trợ",
          description: `File ${file.name} có định dạng không được hỗ trợ`,
          variant: "destructive"
        });
        return false;
      }
      
      return true;
    });
    
    if (validFiles.length > 0) {
      // Giả lập việc upload file
      setIsUploading(true);
      const timer = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(timer);
            setIsUploading(false);
            return 100;
          }
          return prev + 5;
        });
      }, 100);
      
      setSelectedFiles(prev => [...prev, ...validFiles]);
    }
  };
  
  // Xử lý việc chọn file từ input
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
    
    // Reset input để có thể chọn lại cùng file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Xử lý việc xóa file đã chọn
  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const activeConv = conversations.find(conv => conv.id === activeConversation);
  const availableUsers = mockUsers.filter(user => 
    user.id !== currentUser.id && 
    !selectedUsers.some(selected => selected.id === user.id)
  );
  
  return (
    <div className="h-[calc(95vh-4rem)] flex flex-col md:flex-row overflow-hidden">
      <div className={`w-full md:w-80 border-r flex-shrink-0 overflow-hidden transition-all duration-300 ${
        isMobileView && activeConversation ? 'hidden' : 'block'
      }`}>
        <div className="p-4 h-full flex flex-col">
          <NewChatDialog
            users={availableUsers}
            onSelectUser={handleSelectUser}
            selectedUsers={selectedUsers}
            onRemoveUser={handleRemoveUser}
            onCreateChat={handleCreateNewChat}
          />
          <div className="mt-4 flex-1 overflow-auto">
            <ConversationList
              conversations={conversations}
              activeConversation={activeConversation}
              setActiveConversation={setActiveConversation}
              currentUser={currentUser}
              isMobileView={isMobileView}
            />
          </div>
        </div>
      </div>
      
      <div 
        className={`flex-1 flex flex-col h-full overflow-hidden transition-all duration-300 ${
          isMobileView && !activeConversation ? 'hidden' : 'block'
        } ${activeConversation ? 'animate-in fade-in duration-300' : ''} ${
          activeConvTransition ? 'opacity-90 scale-[0.99]' : 'opacity-100 scale-100'
        }`}
      >
        {activeConv ? (
          <>
            <div className="border-b p-4 flex items-center flex-shrink-0">
              {isMobileView && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="mr-2"
                  onClick={() => setActiveConversation('')}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <div className="flex-1 flex items-center">
                <div className="relative">
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage 
                      src={activeConv.participants.find(p => p.id !== currentUser.id)?.avatar} 
                      alt={activeConv.participants.find(p => p.id !== currentUser.id)?.name || ''} 
                    />
                    <AvatarFallback>
                      {activeConv.participants.find(p => p.id !== currentUser.id)?.name?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <span 
                    className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${
                      activeConv.participants.find(p => p.id !== currentUser.id)?.status === 'online' 
                        ? 'bg-green-500' 
                        : activeConv.participants.find(p => p.id !== currentUser.id)?.status === 'away' 
                          ? 'bg-yellow-500' 
                          : 'bg-gray-400'
                    }`}
                  ></span>
                </div>
                <div>
                  <h2 className="font-semibold">
                    {activeConv.participants.find(p => p.id !== currentUser.id)?.name}
                  </h2>
                  <p className="text-xs text-muted-foreground flex items-center">
                    <span className={`h-2 w-2 rounded-full mr-1.5 ${
                      activeConv.participants.find(p => p.id !== currentUser.id)?.status === 'online' 
                        ? 'bg-green-500' 
                        : activeConv.participants.find(p => p.id !== currentUser.id)?.status === 'away' 
                          ? 'bg-yellow-500' 
                          : 'bg-gray-400'
                    }`}></span>
                    {activeConv.participants.find(p => p.id !== currentUser.id)?.status === 'online' 
                      ? 'Đang hoạt động' 
                      : activeConv.participants.find(p => p.id !== currentUser.id)?.status === 'away' 
                        ? 'Đang rời đi'
                        : 'Ngoại tuyến'}
                  </p>
                </div>
              </div>
              <ConversationInfo conversation={activeConv} currentUser={currentUser} />
            </div>
            
            <div 
              ref={dropZoneRef}
              className={`flex-1 overflow-hidden ${isDragging ? 'bg-accent/20' : ''}`}
            >
              {isDragging && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
                  <div className="text-center space-y-2">
                    <Paperclip className="h-10 w-10 mx-auto text-primary" />
                    <h3 className="font-medium">Thả file để đính kèm</h3>
                    <p className="text-sm text-muted-foreground">
                      Hỗ trợ hình ảnh và tài liệu (PDF, Word, Excel, PowerPoint, TXT, CSV)
                    </p>
                  </div>
                </div>
              )}
              
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  {activeConv.messages.map((message, index) => {
                    const sender = activeConv.participants.find(p => p.id === message.senderId);
                    const prevMessage = index > 0 ? activeConv.messages[index - 1] : undefined;
                    
                    return sender ? (
                      <MessageItem
                        key={message.id}
                        message={message}
                        isCurrentUser={message.senderId === currentUser.id}
                        sender={sender}
                        prevMessage={prevMessage}
                      />
                    ) : null;
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </div>
            
            {/* Hiển thị file đã chọn */}
            {selectedFiles.length > 0 && (
              <div className="border-t p-2 flex-shrink-0">
                <div className="text-xs font-medium mb-2">File đính kèm:</div>
                <div className="flex flex-wrap gap-2 max-h-[100px] overflow-y-auto">
                  {selectedFiles.map((file, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1 pl-2 pr-1 py-1">
                      {file.type.startsWith('image/') && (
                        <div className="w-4 h-4 mr-1 rounded overflow-hidden bg-muted">
                          <Image 
                            src={URL.createObjectURL(file)} 
                            alt={file.name} 
                            width={16} 
                            height={16} 
                            className="object-cover" 
                          />
                        </div>
                      )}
                      {!file.type.startsWith('image/') && getFileIcon(file.type)}
                      <span className="truncate max-w-[120px] text-xs">{file.name}</span>
                      <span className="text-xs text-muted-foreground ml-1">({formatFileSize(file.size)})</span>
                      <button
                        className="hover:text-destructive ml-1"
                        onClick={() => handleRemoveFile(index)}
                        aria-label={`Xóa file ${file.name}`}
                        title={`Xóa file ${file.name}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                {isUploading && (
                  <Progress value={uploadProgress} className="h-1 mt-1" />
                )}
              </div>
            )}
            
            <div className="border-t p-4 flex-shrink-0">
              <div className="flex space-x-2">
                <Input
                  placeholder="Nhập tin nhắn..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  aria-label="Đính kèm file"
                  title="Đính kèm file"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
                  aria-label="Chọn file đính kèm"
                  title="Chọn file đính kèm"
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() && selectedFiles.length === 0}
                  aria-label="Gửi tin nhắn"
                  title="Gửi tin nhắn"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Giới hạn file: 10MB. Chỉ hỗ trợ hình ảnh và tài liệu. Kéo thả file vào khung chat để đính kèm.
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-2">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="font-medium">Chưa có cuộc trò chuyện nào được chọn</h3>
              <p className="text-sm text-muted-foreground">
                Chọn một cuộc trò chuyện từ danh sách bên trái hoặc tạo cuộc trò chuyện mới
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat; 