// Kiểu dữ liệu cho tin nhắn
export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  attachments?: Attachment[];
}

// Kiểu dữ liệu cho file đính kèm
export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  previewUrl?: string; // URL xem trước cho hình ảnh
}

// Kiểu dữ liệu cho người dùng
export interface User {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
  lastSeen?: Date;
  email: string;
  role: string;
}

// Kiểu dữ liệu cho cuộc trò chuyện
export interface Conversation {
  id: string;
  participants: User[];
  messages: Message[];
  name?: string;
} 