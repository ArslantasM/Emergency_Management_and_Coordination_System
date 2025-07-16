export enum ChatRoomType {
  DIRECT = 'direct', // Bire bir mesajlaşma
  GROUP = 'group',   // Grup mesajlaşması
  EMERGENCY = 'emergency', // Acil durum kanalı
  ANNOUNCEMENT = 'announcement', // Duyuru kanalı
}

export enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  senderImage?: string;
  content: string;
  timestamp: Date;
  status: MessageStatus;
  isSystemMessage: boolean;
  attachments?: Attachment[];
  reactions?: MessageReaction[];
  mentions?: string[]; // Bahsedilen kullanıcı ID'leri
  replyTo?: string; // Yanıt verilen mesaj ID'si
  isEdited: boolean;
  isDeleted: boolean;
  metadata?: Record<string, any>;
}

export interface Attachment {
  id: string;
  type: 'image' | 'file' | 'audio' | 'video' | 'location';
  url: string;
  name: string;
  size?: number;
  mimeType?: string;
  thumbnailUrl?: string;
  metadata?: Record<string, any>;
}

export interface MessageReaction {
  emoji: string;
  userId: string;
  userName: string;
}

export interface ChatRoom {
  id: string;
  type: ChatRoomType;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  participants: ChatParticipant[];
  lastMessage?: ChatMessage;
  isArchived: boolean;
  metadata?: Record<string, any>;
  icon?: string;
  isEncrypted?: boolean;
}

export interface ChatParticipant {
  userId: string;
  userName: string;
  userRole: string;
  userImage?: string;
  joinedAt: Date;
  isAdmin: boolean;
  lastSeen?: Date;
  hasUnreadMessages: boolean;
  unreadCount: number;
  status: 'online' | 'away' | 'offline';
}

export interface ChatNotification {
  id: string;
  userId: string;
  roomId: string;
  messageId: string;
  content: string;
  senderName: string;
  isRead: boolean;
  timestamp: Date;
}

export interface ChatFilter {
  searchTerm?: string;
  roomTypes?: ChatRoomType[];
  participants?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  onlyUnread?: boolean;
} 