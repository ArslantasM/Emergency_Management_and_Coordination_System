"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { notification } from 'antd';
import { 
  useNotificationStore, 
  type Notification, 
  fetchNotificationsFromServer, 
  setupNotificationSocket, 
  startNotificationPolling,
  retryFailedNotifications
} from '../lib/notifications';

// NotificationContext'in tipi
interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  showNotification: (notif: Notification) => void;
}

// Context oluşturma
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Context kullanımı için hook
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification hook\'u bir NotificationProvider içinde kullanılmalıdır');
  }
  return context;
};

// NotificationProvider bileşeni
export const NotificationProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { data: session, status } = useSession();
  const [initialized, setInitialized] = useState(false);
  
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    removeNotification, 
    clearNotifications,
    updateNotifications,
    addNotification
  } = useNotificationStore();
  
  // Kullanıcı oturumu açıldığında bildirimleri yükle
  useEffect(() => {
    if (status === 'authenticated' && session?.user && !initialized) {
      const userId = session.user.id as string;
      
      // Bildirimleri sunucudan al
      fetchNotificationsFromServer(userId)
        .then(notifications => {
          updateNotifications(notifications);
        })
        .catch(error => {
          console.error('Bildirimler yüklenemedi:', error);
        });
      
      // WebSocket bağlantısı kur
      setupNotificationSocket(userId);
      
      // Bildirim polling'i başlat
      const stopPolling = startNotificationPolling(userId);
      
      // Başarısız bildirimleri tekrar göndermeyi dene
      retryFailedNotifications();
      
      setInitialized(true);
      
      // Temizleme
      return () => {
        stopPolling();
      };
    }
  }, [status, session, initialized, updateNotifications]);
  
  // Bildirimi Ant Design notification bileşeni ile gösterme
  const showNotification = (notif: Notification) => {
    // Bildirim tipine göre doğrudan fonksiyonları çağır
    const options = {
      message: notif.title,
      description: notif.message,
      duration: notif.priority === 'high' ? 0 : 4.5,
      placement: 'topRight' as 'topRight',
      onClick: () => {
        // Bildirimi okundu olarak işaretle
        markAsRead(notif.id);
        
        // Bildirime bağlı bir link varsa, yönlendir
        if (notif.link && typeof window !== 'undefined') {
          window.location.href = notif.link;
        }
      }
    };
    
    if (notif.type === 'emergency') {
      notification.error(options);
    } else if (notif.type === 'warning') {
      notification.warning(options);
    } else if (notif.type === 'message') {
      notification.success(options);
    } else if (notif.type === 'task') {
      notification.info(options);
    } else {
      notification.info(options);
    }
  };
  
  // Yeni bildirim geldiğinde göster
  useEffect(() => {
    // Son bildirimi bul
    const lastNotification = notifications[0];
    
    // Eğer yeni bildirim varsa ve okunmamışsa göster
    if (lastNotification && !lastNotification.read && initialized) {
      showNotification(lastNotification);
    }
  }, [notifications, initialized]);
  
  // Context değeri
  const contextValue: NotificationContextType = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearNotifications,
    showNotification
  };
  
  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider; 