import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Conversation, User } from './types';
import { formatTime } from './utils';

interface ConversationListProps {
  conversations: Conversation[];
  activeConversation: string;
  setActiveConversation: (id: string) => void;
  currentUser: User;
  isMobileView?: boolean;
}

const ConversationList: React.FC<ConversationListProps> = ({ 
  conversations, 
  activeConversation, 
  setActiveConversation,
  currentUser,
  isMobileView = false
}) => {
  return (
    <div className="space-y-2">
      {conversations.map((conversation) => {
        const lastMessage = conversation.messages[conversation.messages.length - 1];
        const sender = lastMessage ? conversation.participants.find(p => p.id === lastMessage.senderId) : null;
        const otherUser = conversation.participants.find(p => p.id !== currentUser.id);
        
        return (
          <div
            key={conversation.id}
            className={`flex items-center space-x-4 p-3 rounded-lg cursor-pointer hover:bg-accent transition-colors duration-200 ${
              activeConversation === conversation.id ? 'bg-accent' : ''
            }`}
            onClick={() => setActiveConversation(conversation.id)}
          >
            <div className="relative">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={otherUser?.avatar}
                  alt={otherUser?.name || ''}
                />
                <AvatarFallback>
                  {otherUser?.name?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
              <span 
                className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${
                  otherUser?.status === 'online' 
                    ? 'bg-green-500' 
                    : otherUser?.status === 'away' 
                      ? 'bg-yellow-500' 
                      : 'bg-gray-400'
                }`}
              ></span>
            </div>
            
            <div className="flex-1 overflow-hidden">
              <div className="flex justify-between items-center">
                <span className="font-medium truncate">
                  {otherUser?.name}
                </span>
                {lastMessage && (
                  <span className="text-xs text-muted-foreground">
                    {formatTime(lastMessage.timestamp)}
                  </span>
                )}
              </div>
              {lastMessage && (
                <div className="text-sm text-muted-foreground truncate">
                  {sender?.id === currentUser.id ? 'Bạn: ' : ''}
                  {lastMessage.content}
                  {lastMessage.attachments && lastMessage.attachments.length > 0 && (
                    <span className="text-xs ml-1 text-primary">
                      {lastMessage.attachments.length > 1 
                        ? ` [${lastMessage.attachments.length} files]` 
                        : ' [1 file]'}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ConversationList; 