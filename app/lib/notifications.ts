// Bildirim yönetimi için servis
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Bildirim türleri
export type NotificationType = 
  | 'emergency' 
  | 'task' 
  | 'system' 
  | 'message' 
  | 'warning'
  | 'info';

// Bildirim prioritesi
export type NotificationPriority = 'high' | 'medium' | 'low';

// Bildirim özellikleri
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  createdAt: string;
  read: boolean;
  userId?: string;
  link?: string;
  data?: any;
}

// Bildirim durumu
interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  // Bildirim ekleme
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  // Bildirim okundu olarak işaretleme
  markAsRead: (id: string) => void;
  // Tüm bildirimleri okundu olarak işaretleme
  markAllAsRead: () => void;
  // Bildirimleri silme
  removeNotification: (id: string) => void;
  // Bildirimleri temizleme
  clearNotifications: () => void;
  // Bildirimleri güncelleme (sunucudan)
  updateNotifications: (notifications: Notification[]) => void;
}

// Zustand store oluşturma (local storage'da persistans için)
export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      
      // Bildirim ekleme
      addNotification: (notification) => {
        const id = Math.random().toString(36).substring(2, 15);
        const createdAt = new Date().toISOString();
        
        // Backend entegrasyonu: Bildirimi sunucuya kaydetme
        sendNotificationToServer({
          ...notification,
          id,
          createdAt,
          read: false
        });
        
        set((state) => {
          const notifications = [
            {
              id,
              createdAt,
              read: false,
              ...notification
            },
            ...state.notifications
          ];
          return {
            notifications,
            unreadCount: state.unreadCount + 1
          };
        });
      },
      
      // Bildirim okundu olarak işaretleme
      markAsRead: (id) => {
        // Backend entegrasyonu: Bildirim okundu durumunu sunucuya kaydetme
        updateNotificationOnServer(id, { read: true });
        
        set((state) => {
          const notifications = state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          );
          const unreadCount = notifications.filter((n) => !n.read).length;
          return { notifications, unreadCount };
        });
      },
      
      // Tüm bildirimleri okundu olarak işaretleme 
      markAllAsRead: () => {
        // Backend entegrasyonu: Tüm bildirimleri okundu olarak sunucuda güncelleme
        updateAllNotificationsOnServer(get().notifications.map(n => n.id));
        
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0
        }));
      },
      
      // Bildirim silme
      removeNotification: (id) => {
        // Backend entegrasyonu: Bildirimi sunucudan silme
        deleteNotificationFromServer(id);
        
        set((state) => {
          const notifications = state.notifications.filter((n) => n.id !== id);
          const unreadCount = notifications.filter((n) => !n.read).length;
          return { notifications, unreadCount };
        });
      },
      
      // Tüm bildirimleri temizleme
      clearNotifications: () => {
        // Backend entegrasyonu: Tüm bildirimleri sunucudan silme
        deleteAllNotificationsFromServer();
        
        set({ notifications: [], unreadCount: 0 });
      },
      
      // Bildirimleri sunucudan güncelleme
      updateNotifications: (notifications) => {
        const unreadCount = notifications.filter((n) => !n.read).length;
        set({ notifications, unreadCount });
      }
    }),
    {
      name: 'notification-storage', // local storage'da kaydedilecek isim
      partialize: (state) => ({ notifications: state.notifications }) // sadece bildirimleri sakla
    }
  )
);

// ----------------- BACKEND İNTEGRASYON FONKSİYONLARI -----------------

// Bildirimi sunucuya gönderme
async function sendNotificationToServer(notification: Notification): Promise<void> {
  try {
    // Uygulamanın geliştirme aşamasında olduğu için gerçek bir API çağrısı yapmıyoruz
    // API çağrısı örneği
    if (process.env.NODE_ENV === 'production') {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notification)
      });
    } else {
      // Geliştirme modunda konsola yazdır
      console.log('[DEV] Bildirim sunucuya gönderildi:', notification);
    }
  } catch (error) {
    console.error('Bildirim sunucuya gönderilemedi:', error);
    // Hata durumunda bildirimi sakla ve daha sonra tekrar göndermeyi dene
    saveFailedNotificationToQueue(notification);
  }
}

// Bildirim güncelleme
async function updateNotificationOnServer(id: string, update: Partial<Notification>): Promise<void> {
  try {
    // API çağrısı örneği
    if (process.env.NODE_ENV === 'production') {
      await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(update)
      });
    } else {
      console.log('[DEV] Bildirim güncellendi:', id, update);
    }
  } catch (error) {
    console.error('Bildirim sunucuda güncellenemedi:', error);
  }
}

// Tüm bildirimleri okundu olarak işaretleme
async function updateAllNotificationsOnServer(ids: string[]): Promise<void> {
  try {
    // API çağrısı örneği
    if (process.env.NODE_ENV === 'production') {
      await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ids })
      });
    } else {
      console.log('[DEV] Tüm bildirimler okundu olarak işaretlendi');
    }
  } catch (error) {
    console.error('Bildirimler sunucuda güncellenemedi:', error);
  }
}

// Bildirim silme
async function deleteNotificationFromServer(id: string): Promise<void> {
  try {
    // API çağrısı örneği
    if (process.env.NODE_ENV === 'production') {
      await fetch(`/api/notifications/${id}`, {
        method: 'DELETE'
      });
    } else {
      console.log('[DEV] Bildirim silindi:', id);
    }
  } catch (error) {
    console.error('Bildirim sunucudan silinemedi:', error);
  }
}

// Tüm bildirimleri silme
async function deleteAllNotificationsFromServer(): Promise<void> {
  try {
    // API çağrısı örneği
    if (process.env.NODE_ENV === 'production') {
      await fetch('/api/notifications', {
        method: 'DELETE'
      });
    } else {
      console.log('[DEV] Tüm bildirimler silindi');
    }
  } catch (error) {
    console.error('Bildirimler sunucudan silinemedi:', error);
  }
}

// Gönderilemeyen bildirimleri kuyrukta sakla
function saveFailedNotificationToQueue(notification: Notification): void {
  // IndexedDB veya localStorage kullanarak sakla
  if (typeof window !== 'undefined') {
    const queue = JSON.parse(localStorage.getItem('failed-notifications') || '[]');
    queue.push(notification);
    localStorage.setItem('failed-notifications', JSON.stringify(queue));
  }
}

// Gönderilemeyen bildirimleri tekrar gönderme işlemi (örneğin uygulama başladığında)
export async function retryFailedNotifications(): Promise<void> {
  if (typeof window === 'undefined') return;
  
  const queue = JSON.parse(localStorage.getItem('failed-notifications') || '[]');
  if (queue.length === 0) return;
  
  const failedAgain: Notification[] = [];
  
  for (const notification of queue) {
    try {
      await sendNotificationToServer(notification);
    } catch (error) {
      failedAgain.push(notification);
    }
  }
  
  // Başarısız olanları tekrar sakla
  localStorage.setItem('failed-notifications', JSON.stringify(failedAgain));
}

// Bildirimleri sunucudan çekme
export async function fetchNotificationsFromServer(userId?: string): Promise<Notification[]> {
  try {
    // API çağrısı örneği
    if (process.env.NODE_ENV === 'production') {
      const url = userId ? `/api/notifications?userId=${userId}` : '/api/notifications';
      const response = await fetch(url);
      const data = await response.json();
      return data.notifications;
    } else {
      // Geliştirme modunda demo veriler
      return getDemoNotifications(userId);
    }
  } catch (error) {
    console.error('Bildirimler sunucudan alınamadı:', error);
    return [];
  }
}

// Demo bildirimler (geliştirme ortamı için)
function getDemoNotifications(userId?: string): Notification[] {
  const now = new Date();
  
  return [
    {
      id: '1',
      title: 'Acil Durum: Deprem Uyarısı',
      message: 'İzmir bölgesinde 4.5 büyüklüğünde deprem kaydedildi. Ekiplere bilgi verildi.',
      type: 'emergency',
      priority: 'high',
      createdAt: new Date(now.getTime() - 1000 * 60 * 15).toISOString(), // 15 dakika önce
      read: false,
      userId: userId || 'all',
      link: '/dashboard/map'
    },
    {
      id: '2',
      title: 'Yeni Görev Atandı',
      message: 'Size "İzmir Deprem Bölgesi Durum Raporu" görevi atandı.',
      type: 'task',
      priority: 'medium',
      createdAt: new Date(now.getTime() - 1000 * 60 * 60).toISOString(), // 1 saat önce
      read: false,
      userId: userId || 'user1',
      link: '/dashboard/tasks'
    },
    {
      id: '3',
      title: 'Sistem Güncellemesi',
      message: 'Acil durum yönetim sistemi 2.5 sürümüne güncellendi. Yeni özellikler eklendi.',
      type: 'system',
      priority: 'low',
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 3).toISOString(), // 3 saat önce
      read: true,
      userId: 'all'
    },
    {
      id: '4',
      title: 'Hava Durumu Uyarısı',
      message: 'Karadeniz bölgesinde şiddetli yağış bekleniyor. Ekipler hazır durumda olmalı.',
      type: 'warning',
      priority: 'medium',
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 5).toISOString(), // 5 saat önce
      read: true,
      userId: 'all',
      link: '/dashboard/map'
    },
    {
      id: '5',
      title: 'Yeni Mesaj',
      message: 'Ahmet Yılmaz size yeni bir mesaj gönderdi: "Rapor ne zaman hazır olacak?"',
      type: 'message',
      priority: 'low',
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 8).toISOString(), // 8 saat önce
      read: true,
      userId: userId || 'user1',
      link: '/dashboard/chat'
    }
  ].filter(n => n.userId === 'all' || n.userId === userId);
}

// Websocket kurulumu (gerçek zamanlı bildirimler için)
export function setupNotificationSocket(userId: string): void {
  // WebSocket mevcut mu kontrol et
  if (typeof window === 'undefined' || !('WebSocket' in window)) return;
  
  // Geliştirme modunda Websocket bağlantısı yok
  if (process.env.NODE_ENV !== 'production') {
    console.log('[DEV] WebSocket bildirim sistemi simüle ediliyor');
    
    // Demo bildirim ekleme (her 30 saniyede bir)
    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // %30 olasılıkla
        const types: NotificationType[] = ['emergency', 'task', 'system', 'message', 'warning'];
        const priorities: NotificationPriority[] = ['high', 'medium', 'low'];
        const type = types[Math.floor(Math.random() * types.length)];
        const priority = priorities[Math.floor(Math.random() * priorities.length)];
        
        useNotificationStore.getState().addNotification({
          title: `Demo ${type.charAt(0).toUpperCase() + type.slice(1)} Bildirimi`,
          message: `Bu otomatik oluşturulan bir ${type} bildirimidir. Öncelik: ${priority}`,
          type,
          priority,
          userId
        });
      }
    }, 30000);
    
    // Temizleme
    return () => clearInterval(interval);
  }
  
  // Production ortamında gerçek WebSocket bağlantısı
  const socket = new WebSocket(process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'wss://api.example.com/notifications');
  
  socket.onopen = () => {
    console.log('WebSocket bağlantısı açıldı');
    // Kullanıcı kimliğini gönder
    socket.send(JSON.stringify({ type: 'auth', userId }));
  };
  
  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      
      if (data.type === 'notification') {
        // Yeni bildirim geldi
        useNotificationStore.getState().addNotification(data.notification);
      } else if (data.type === 'update') {
        // Bildirimleri sunucudan güncelle
        fetchNotificationsFromServer(userId).then((notifications) => {
          useNotificationStore.getState().updateNotifications(notifications);
        });
      }
    } catch (error) {
      console.error('WebSocket mesajı işlenemedi:', error);
    }
  };
  
  socket.onclose = () => {
    console.log('WebSocket bağlantısı kapandı');
    // Bağlantıyı yeniden kurmayı dene
    setTimeout(() => setupNotificationSocket(userId), 5000);
  };
  
  socket.onerror = (error) => {
    console.error('WebSocket hatası:', error);
  };
}

// Bir servisi simüle et: Bildirimleri belirli aralıklarla kontrol et ve güncelle
export function startNotificationPolling(userId: string, interval = 60000): () => void {
  // Geliştirme ortamında gerçek bir polling yapmıyoruz
  if (process.env.NODE_ENV !== 'production') {
    console.log('[DEV] Bildirim polling servisi simüle ediliyor');
    return () => {};
  }
  
  // Her interval'de bildirimleri güncelle
  const timerId = setInterval(() => {
    fetchNotificationsFromServer(userId).then((notifications) => {
      useNotificationStore.getState().updateNotifications(notifications);
    });
  }, interval);
  
  // Polling'i durdurmak için bu fonksiyonu döndür
  return () => clearInterval(timerId);
} 