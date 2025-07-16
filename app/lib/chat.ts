import { v4 as uuidv4 } from 'uuid';
import { 
  ChatMessage, 
  ChatRoom, 
  ChatRoomType, 
  MessageStatus, 
  ChatParticipant,
  ChatFilter,
  ChatNotification
} from '../types/chat';
import { UserRole } from '../types/user';
import { logInfo, logError, logWarning } from './logger';
import { LogCategory } from '../types/log';

// Demo verileri (gerçek uygulamada veritabanında saklanır)
let chatRooms: ChatRoom[] = [];
let chatMessages: ChatMessage[] = [];
let chatNotifications: ChatNotification[] = [];

// Yeni mesaj oluşturma
export const createMessage = (
  roomId: string, 
  senderId: string, 
  senderName: string,
  senderRole: string,
  content: string,
  options?: {
    isSystemMessage?: boolean;
    replyTo?: string;
    attachments?: any[];
    mentions?: string[];
    senderImage?: string;
  }
): ChatMessage => {
  const message: ChatMessage = {
    id: uuidv4(),
    roomId,
    senderId,
    senderName,
    senderRole,
    senderImage: options?.senderImage,
    content,
    timestamp: new Date(),
    status: MessageStatus.SENT,
    isSystemMessage: options?.isSystemMessage || false,
    attachments: options?.attachments || [],
    reactions: [],
    mentions: options?.mentions || [],
    replyTo: options?.replyTo,
    isEdited: false,
    isDeleted: false
  };

  // Mesajları ekle
  chatMessages.push(message);
  
  // Son mesajı güncelle
  const roomIndex = chatRooms.findIndex(room => room.id === roomId);
  if (roomIndex !== -1) {
    chatRooms[roomIndex].lastMessage = message;
    chatRooms[roomIndex].updatedAt = new Date();

    // Tüm katılımcılar için okunmamış mesaj ayarla
    chatRooms[roomIndex].participants.forEach(participant => {
      // Gönderen hariç diğer katılımcılar için
      if (participant.userId !== senderId) {
        participant.hasUnreadMessages = true;
        participant.unreadCount += 1;
        
        // Bildirim oluştur
        createNotification(participant.userId, roomId, message.id, message.content, message.senderName);
      }
    });
  }
  
  // Log ekle
  logInfo(LogCategory.CHAT, `Yeni mesaj gönderildi: ${content.substring(0, 30)}${content.length > 30 ? '...' : ''}`, {
    userId: senderId,
    userName: senderName,
    userRole: senderRole,
    relatedEntityId: roomId,
    relatedEntityType: 'chatroom',
    data: { messageId: message.id, roomId }
  });
  
  return message;
};

// Oda oluşturma
export const createRoom = (
  name: string,
  type: ChatRoomType,
  createdBy: string,
  participants: ChatParticipant[],
  options?: {
    description?: string;
    icon?: string;
    isEncrypted?: boolean;
    metadata?: Record<string, any>;
  }
): ChatRoom => {
  const room: ChatRoom = {
    id: uuidv4(),
    name,
    type,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy,
    participants,
    isArchived: false,
    description: options?.description,
    icon: options?.icon,
    isEncrypted: options?.isEncrypted || false,
    metadata: options?.metadata
  };
  
  chatRooms.push(room);
  
  // Log oluştur
  logInfo(LogCategory.CHAT, `Yeni sohbet odası oluşturuldu: ${name}`, {
    userId: createdBy,
    userName: participants.find(p => p.userId === createdBy)?.userName || 'Sistem',
    userRole: participants.find(p => p.userId === createdBy)?.userRole || 'system',
    relatedEntityId: room.id,
    relatedEntityType: 'chatroom',
    data: { roomType: type, participantCount: participants.length }
  });
  
  return room;
};

// Bildirim oluşturma
const createNotification = (
  userId: string,
  roomId: string,
  messageId: string,
  content: string,
  senderName: string
): ChatNotification => {
  const notification: ChatNotification = {
    id: uuidv4(),
    userId,
    roomId,
    messageId,
    content: content.length > 50 ? `${content.substring(0, 50)}...` : content,
    senderName,
    isRead: false,
    timestamp: new Date()
  };
  
  chatNotifications.push(notification);
  return notification;
};

// Mesaj okundu olarak işaretleme
export const markMessagesAsRead = (userId: string, roomId: string): void => {
  const room = chatRooms.find(room => room.id === roomId);
  if (!room) return;
  
  // Katılımcı bilgisini güncelle
  const participant = room.participants.find(p => p.userId === userId);
  if (participant) {
    participant.hasUnreadMessages = false;
    participant.unreadCount = 0;
    participant.lastSeen = new Date();
  }
  
  // İlgili bildirimleri okundu olarak işaretle
  chatNotifications.forEach(notification => {
    if (notification.userId === userId && notification.roomId === roomId) {
      notification.isRead = true;
    }
  });
  
  // Log ekle
  logInfo(LogCategory.CHAT, `Mesajlar okundu: ${room.name}`, {
    userId,
    userName: participant?.userName || 'Bilinmeyen Kullanıcı',
    userRole: participant?.userRole || 'unknown',
    relatedEntityId: roomId,
    relatedEntityType: 'chatroom'
  });
};

// Odaya katılımcı ekleme
export const addParticipantToRoom = (
  roomId: string,
  userId: string,
  userName: string,
  userRole: string,
  userImage?: string,
  isAdmin: boolean = false
): boolean => {
  const roomIndex = chatRooms.findIndex(room => room.id === roomId);
  if (roomIndex === -1) {
    logError(LogCategory.CHAT, `Oda bulunamadı: ${roomId}`);
    return false;
  }
  
  // Zaten ekli mi kontrol et
  if (chatRooms[roomIndex].participants.some(p => p.userId === userId)) {
    logWarning(LogCategory.CHAT, `Kullanıcı zaten odada: ${userName} (${userId})`);
    return false;
  }
  
  // Katılımcı ekle
  const participant: ChatParticipant = {
    userId,
    userName,
    userRole,
    userImage,
    joinedAt: new Date(),
    isAdmin,
    hasUnreadMessages: true,
    unreadCount: 0,
    status: 'online'
  };
  
  chatRooms[roomIndex].participants.push(participant);
  
  // Sistem mesajı oluştur
  createMessage(
    roomId,
    'system',
    'Sistem',
    'system',
    `${userName} sohbete katıldı.`,
    { isSystemMessage: true }
  );
  
  // Log ekle
  logInfo(LogCategory.CHAT, `Kullanıcı sohbete katıldı: ${userName}`, {
    userId,
    userName,
    userRole,
    relatedEntityId: roomId,
    relatedEntityType: 'chatroom'
  });
  
  return true;
};

// Katılımcı çıkarma
export const removeParticipantFromRoom = (roomId: string, userId: string): boolean => {
  const roomIndex = chatRooms.findIndex(room => room.id === roomId);
  if (roomIndex === -1) return false;
  
  const room = chatRooms[roomIndex];
  const participant = room.participants.find(p => p.userId === userId);
  if (!participant) return false;
  
  // Katılımcıyı çıkar
  chatRooms[roomIndex].participants = room.participants.filter(p => p.userId !== userId);
  
  // Sistem mesajı oluştur
  createMessage(
    roomId,
    'system',
    'Sistem',
    'system',
    `${participant.userName} sohbetten ayrıldı.`,
    { isSystemMessage: true }
  );
  
  // Log ekle
  logInfo(LogCategory.CHAT, `Kullanıcı sohbetten çıkarıldı: ${participant.userName}`, {
    userId,
    userName: participant.userName,
    userRole: participant.userRole,
    relatedEntityId: roomId,
    relatedEntityType: 'chatroom'
  });
  
  return true;
};

// Odayı arşivle
export const archiveRoom = (roomId: string): boolean => {
  const roomIndex = chatRooms.findIndex(room => room.id === roomId);
  if (roomIndex === -1) return false;
  
  chatRooms[roomIndex].isArchived = true;
  
  // Log ekle
  logInfo(LogCategory.CHAT, `Sohbet odası arşivlendi: ${chatRooms[roomIndex].name}`, {
    relatedEntityId: roomId,
    relatedEntityType: 'chatroom'
  });
  
  return true;
};

// Mesajı sil (aslında "deleted" olarak işaretle)
export const deleteMessage = (messageId: string, userId: string): boolean => {
  const messageIndex = chatMessages.findIndex(message => message.id === messageId);
  if (messageIndex === -1) return false;
  
  // Sadece gönderen veya admin silebilir
  if (chatMessages[messageIndex].senderId !== userId && 
      !chatMessages[messageIndex].isSystemMessage) {
    logWarning(LogCategory.CHAT, `Yetkisiz mesaj silme girişimi: ${messageId}`, {
      userId,
      relatedEntityId: messageId,
      relatedEntityType: 'message'
    });
    return false;
  }
  
  chatMessages[messageIndex].isDeleted = true;
  chatMessages[messageIndex].content = "Bu mesaj silindi";
  
  // Log ekle
  logInfo(LogCategory.CHAT, `Mesaj silindi: ${messageId}`, {
    userId,
    relatedEntityId: messageId,
    relatedEntityType: 'message'
  });
  
  return true;
};

// Arama
export const searchMessages = (filter: ChatFilter): ChatMessage[] => {
  let result = [...chatMessages];
  
  // Arama terimi filtresi
  if (filter.searchTerm) {
    const term = filter.searchTerm.toLowerCase();
    result = result.filter(message => 
      message.content.toLowerCase().includes(term) || 
      message.senderName.toLowerCase().includes(term)
    );
  }
  
  // Oda tipi filtresi
  if (filter.roomTypes && filter.roomTypes.length > 0) {
    const roomIds = chatRooms
      .filter(room => filter.roomTypes!.includes(room.type))
      .map(room => room.id);
    
    result = result.filter(message => roomIds.includes(message.roomId));
  }
  
  // Katılımcı filtresi
  if (filter.participants && filter.participants.length > 0) {
    const roomIds = chatRooms
      .filter(room => room.participants.some(p => filter.participants!.includes(p.userId)))
      .map(room => room.id);
    
    result = result.filter(message => roomIds.includes(message.roomId));
  }
  
  // Tarih aralığı filtresi
  if (filter.dateRange) {
    result = result.filter(message => 
      message.timestamp >= filter.dateRange!.start &&
      message.timestamp <= filter.dateRange!.end
    );
  }
  
  return result;
};

// Kullanıcı için tüm odaları getir
export const getRoomsForUser = (userId: string): ChatRoom[] => {
  return chatRooms
    .filter(room => room.participants.some(p => p.userId === userId) && !room.isArchived)
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
};

// Belirli odadaki mesajları getir
export const getMessagesForRoom = (roomId: string): ChatMessage[] => {
  return chatMessages
    .filter(message => message.roomId === roomId)
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
};

// Kullanıcı için tüm bildirimleri getir
export const getNotificationsForUser = (userId: string): ChatNotification[] => {
  return chatNotifications
    .filter(notification => notification.userId === userId && !notification.isRead)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

// Kullanıcı durumunu güncelle
export const updateUserStatus = (userId: string, status: 'online' | 'away' | 'offline'): void => {
  chatRooms.forEach(room => {
    const participant = room.participants.find(p => p.userId === userId);
    if (participant) {
      participant.status = status;
      if (status === 'online' || status === 'away') {
        participant.lastSeen = new Date();
      }
    }
  });
  
  logInfo(LogCategory.CHAT, `Kullanıcı durumu güncellendi: ${status}`, {
    userId,
    data: { status }
  });
};

// Demo sohbet odaları oluştur
export const createDemoRooms = (): void => {
  if (chatRooms.length > 0) return; // Zaten oluşturulduysa tekrar oluşturma
  
  // Demo kullanıcılar
  const users = [
    { id: '1', name: 'Admin Kullanıcı', role: UserRole.ADMIN, image: '/avatars/admin.png' },
    { id: '2', name: 'Yönetici Kullanıcı', role: UserRole.MANAGER, image: '/avatars/manager.png' },
    { id: '3', name: 'Personel Kullanıcı', role: UserRole.PERSONNEL, image: '/avatars/personnel.png' },
    { id: '4', name: 'Vatandaş Kullanıcı', role: UserRole.USER, image: '/avatars/user.png' },
  ];
  
  // Katılımcı listesi oluştur
  const createParticipants = (userIds: string[]): ChatParticipant[] => {
    return userIds.map(userId => {
      const user = users.find(u => u.id === userId);
      if (!user) throw new Error(`Kullanıcı bulunamadı: ${userId}`);
      
      return {
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        userImage: user.image,
        joinedAt: new Date(),
        isAdmin: user.role === UserRole.ADMIN || user.role === UserRole.MANAGER,
        hasUnreadMessages: false,
        unreadCount: 0,
        status: Math.random() > 0.3 ? 'online' : 'offline',
        lastSeen: new Date()
      };
    });
  };
  
  // Acil durum kanalı
  const emergencyRoom = createRoom(
    'Acil Durum Koordinasyon',
    ChatRoomType.EMERGENCY,
    '1', // Admin oluşturdu
    createParticipants(['1', '2', '3']), // Admin, Yönetici, Personel
    {
      description: 'Acil durum koordinasyonu için resmi kanal',
      icon: '🚨',
      metadata: {
        priority: 'high',
        region: 'Genel'
      }
    }
  );
  
  // Duyuru kanalı
  const announcementRoom = createRoom(
    'Resmi Duyurular',
    ChatRoomType.ANNOUNCEMENT,
    '1', // Admin oluşturdu
    createParticipants(['1', '2', '3', '4']), // Tüm kullanıcılar
    {
      description: 'Resmi duyurular ve bilgilendirmeler',
      icon: '📢',
      metadata: {
        allowReplies: false
      }
    }
  );
  
  // Personel grubu
  const personnelRoom = createRoom(
    'Personel Grubu',
    ChatRoomType.GROUP,
    '2', // Yönetici oluşturdu
    createParticipants(['1', '2', '3']), // Admin, Yönetici, Personel
    {
      description: 'Personel iletişim grubu',
      icon: '👥'
    }
  );
  
  // Bire bir görüşme
  const directRoom = createRoom(
    'Admin - Yönetici',
    ChatRoomType.DIRECT,
    '1', // Admin oluşturdu
    createParticipants(['1', '2']), // Admin, Yönetici
    {
      isEncrypted: true
    }
  );
  
  // Demo mesajlar ekle
  const emergencyMessages = [
    {
      sender: users[0], // Admin
      content: 'Dikkat! 5.2 büyüklüğünde deprem kaydedildi. Durum raporunu bekleyeceğiz.'
    },
    {
      sender: users[1], // Yönetici
      content: 'Tamam, ekipleri alarma geçiriyorum. Şu ana kadar 3 bildirim geldi.'
    },
    {
      sender: users[2], // Personel
      content: 'Sahada destek ekibimiz hazır. Koordinatları paylaşır mısınız?'
    },
    {
      sender: users[0], // Admin
      content: 'Koordinatlar: 40.712776, 30.221890 - Haritada işaretlendi. Tüm birimler bu noktaya doğru hareket etsin.'
    },
    {
      sender: users[1], // Yönetici
      content: 'Anlaşıldı. Tüm ekipler koordinatlara doğru harekete geçti.'
    }
  ];
  
  const announcementMessages = [
    {
      sender: users[0], // Admin
      content: 'Dikkat! Yarın saat 14:00\'da deprem tatbikatı yapılacaktır. Tüm personel hazırlıklı olsun.'
    },
    {
      sender: users[0], // Admin
      content: 'Hatırlatma: Tüm kullanıcılar acil durum toplanma alanlarını haritada görebilirler. Lütfen bölgenizdeki toplanma alanlarını kontrol edin.'
    }
  ];
  
  const personnelMessages = [
    {
      sender: users[1], // Yönetici
      content: 'Merhaba ekip, bugünkü vardiya planlaması için toplantımız saat 10:00\'da.'
    },
    {
      sender: users[2], // Personel
      content: 'Teşekkürler. Rapor hazırlığını tamamladım, toplantıda sunacağım.'
    },
    {
      sender: users[0], // Admin
      content: 'Yeni acil durum prosedürlerini de gözden geçirelim lütfen.'
    },
    {
      sender: users[1], // Yönetici
      content: 'Anlaşıldı. Toplantı gündemine ekledim.'
    }
  ];
  
  const directMessages = [
    {
      sender: users[0], // Admin
      content: 'Merhaba, son durum raporu hakkında konuşabilir miyiz?'
    },
    {
      sender: users[1], // Yönetici
      content: 'Elbette. Raporun son halini biraz önce sisteme yükledim.'
    },
    {
      sender: users[0], // Admin
      content: 'Harika, inceleyeceğim. Ayrıca ekip yönetimi konusunda bazı önerilerim var.'
    },
    {
      sender: users[1], // Yönetici
      content: 'Dinliyorum. Önerileriniz her zaman değerli.'
    }
  ];
  
  // Mesajları ekle
  const addMessages = (roomId: string, messages: { sender: any, content: string }[]) => {
    const timestamp = new Date();
    timestamp.setDate(timestamp.getDate() - 1); // 1 gün öncesinden başla
    
    messages.forEach((message, index) => {
      const messageTime = new Date(timestamp);
      messageTime.setMinutes(messageTime.getMinutes() + index * 15); // Her mesaj 15 dakika arayla
      
      const msg = createMessage(
        roomId,
        message.sender.id,
        message.sender.name,
        message.sender.role,
        message.content,
        {
          senderImage: message.sender.image
        }
      );
      
      // Zamanı güncelle (geçmiş mesajlar için)
      msg.timestamp = messageTime;
    });
  };
  
  // Mesajları ekle
  addMessages(emergencyRoom.id, emergencyMessages);
  addMessages(announcementRoom.id, announcementMessages);
  addMessages(personnelRoom.id, personnelMessages);
  addMessages(directRoom.id, directMessages);
  
  // Tüm mesajları zamana göre sırala
  chatMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  
  console.log('Demo sohbet odaları ve mesajlar oluşturuldu.');
}; 