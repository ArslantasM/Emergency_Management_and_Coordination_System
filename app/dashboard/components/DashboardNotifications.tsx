"use client";

import React, { useState, useEffect } from 'react';
import { Card, List, Badge, Avatar, Typography, Button, Space, Alert, Spin, Empty } from 'antd';
import { 
  BellOutlined, 
  WarningOutlined, 
  InfoCircleOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  DatabaseOutlined,
  ToolOutlined,
  FileTextOutlined,
  HeartOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/tr';

dayjs.extend(relativeTime);
dayjs.locale('tr');

const { Title, Text } = Typography;

// Bildirim türleri
enum NotificationType {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  SUCCESS = 'success',
}

// Bildirim kaynakları
enum NotificationSource {
  EQUIPMENT = 'equipment',
  INVENTORY = 'inventory',
  TASK = 'task',
  VOLUNTEER = 'volunteer',
  PERSONNEL = 'personnel',
  SYSTEM = 'system',
}

// Bildirim durumu
enum NotificationStatus {
  read = 'read',
  UNREAD = 'unread',
  ARCHIVED = 'archived',
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  source: NotificationSource;
  status: NotificationStatus;
  createdAt: string;
  link?: string;
  action?: string;
}

interface DashboardNotificationsProps {
  limit?: number;
}

const DashboardNotifications: React.FC<DashboardNotificationsProps> = ({ limit = 5 }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();

  // Bildirimleri API'den getir
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/notifications?limit=${limit}`);
        
        if (!response.ok) {
          throw new Error('Bildirimler alınamadı');
        }
        
        const data = await response.json();
        
        // API'den gelen verileri UI formatına dönüştür
        const formattedNotifications = (data.notifications || []).map((item: any) => ({
          id: item.id || '',
          title: item.title || 'Başlık Yok',
          message: item.message || 'Açıklama Yok',
          type: (item.type && typeof item.type === 'string' ? item.type.toLowerCase() : 'info') as NotificationType,
          source: (item.source && typeof item.source === 'string' ? item.source.toLowerCase() : 'system') as NotificationSource,
          status: (item.status && typeof item.status === 'string' ? item.status.toLowerCase() : 'unread') as NotificationStatus,
          createdAt: item.createdAt || new Date().toISOString(),
          link: item.link || null,
          action: item.action || null
        }));
        
        setNotifications(formattedNotifications);
        setUnreadCount(data.unreadCount);
      } catch (error) {
        console.error('Bildirimler yüklenirken hata:', error);
        setError('Bildirimler yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [limit]);

  // Bildirim ikonunu ve rengini belirleme
  const getNotificationIcon = (type: NotificationType, source: NotificationSource) => {
    if (type === NotificationType.WARNING) return <WarningOutlined style={{ color: '#faad14' }} />;
    if (type === NotificationType.ERROR) return <CloseCircleOutlined style={{ color: '#f5222d' }} />;
    if (type === NotificationType.SUCCESS) return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
    
    // Kaynak tipine göre bildirim ikonları
    if (source === NotificationSource.INVENTORY) return <DatabaseOutlined style={{ color: '#1890ff' }} />;
    if (source === NotificationSource.EQUIPMENT) return <ToolOutlined style={{ color: '#1890ff' }} />;
    if (source === NotificationSource.TASK) return <FileTextOutlined style={{ color: '#1890ff' }} />;
    if (source === NotificationSource.VOLUNTEER) return <HeartOutlined style={{ color: '#1890ff' }} />;
    if (source === NotificationSource.PERSONNEL) return <TeamOutlined style={{ color: '#1890ff' }} />;
    
    return <InfoCircleOutlined style={{ color: '#1890ff' }} />;
  };

  // Bildirim tipine göre renk belirleme
  const getNotificationColor = (type: NotificationType) => {
    switch (type) {
      case NotificationType.WARNING:
        return '#faad14';
      case NotificationType.ERROR:
        return '#f5222d';
      case NotificationType.SUCCESS:
        return '#52c41a';
      case NotificationType.INFO:
      default:
        return '#1890ff';
    }
  };

  // Kaynak tipine göre etiket
  const getSourceTag = (source: NotificationSource) => {
    const sourceLabels = {
      [NotificationSource.INVENTORY]: 'Envanter',
      [NotificationSource.EQUIPMENT]: 'Ekipman',
      [NotificationSource.TASK]: 'Görev',
      [NotificationSource.VOLUNTEER]: 'Gönüllü',
      [NotificationSource.PERSONNEL]: 'Personel',
      [NotificationSource.SYSTEM]: 'Sistem',
    };
    
    return (
      <Badge 
        text={sourceLabels[source]} 
        color="blue" 
        style={{ fontSize: '12px' }}
      />
    );
  };

  // Bildirime tıklama
  const handleNotificationClick = (notification: Notification) => {
    if (notification.link) {
      router.push(notification.link);
    }
  };

  // Tüm bildirimleri görüntüle
  const handleViewAllNotifications = () => {
    router.push('/dashboard/notifications');
  };

  // Bildirim render
  const renderNotificationItem = (notification: Notification) => {
    const isUnread = notification.status === NotificationStatus.UNREAD;
    const notificationIcon = getNotificationIcon(notification.type, notification.source);

    return (
      <List.Item
        key={notification.id}
        style={{
          backgroundColor: isUnread ? '#f6ffed' : 'transparent',
          borderLeft: isUnread ? `3px solid ${getNotificationColor(notification.type)}` : 'none',
          padding: '12px',
          cursor: notification.link ? 'pointer' : 'default',
          borderRadius: '4px',
          marginBottom: '8px'
        }}
        onClick={() => handleNotificationClick(notification)}
        actions={[
          <Button 
            key="view"
            type="text" 
            size="small" 
            icon={<EyeOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleNotificationClick(notification);
            }}
          >
            Görüntüle
          </Button>
        ]}
      >
        <List.Item.Meta
          avatar={
            <Badge dot={isUnread} color={getNotificationColor(notification.type)}>
              <Avatar icon={notificationIcon} style={{ backgroundColor: 'white' }} />
            </Badge>
          }
          title={
            <Space>
              <Text strong={isUnread} style={{ fontSize: '14px' }}>
                {notification.title}
              </Text>
              {getSourceTag(notification.source)}
              {isUnread && <Badge status="processing" color={getNotificationColor(notification.type)} />}
            </Space>
          }
          description={
            <div>
              <Text type="secondary" style={{ fontSize: '13px' }}>
                {notification.message}
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                <ClockCircleOutlined /> {dayjs(notification.createdAt).fromNow()}
              </Text>
            </div>
          }
        />
      </List.Item>
    );
  };

  // Yükleniyor durumu
  if (loading) {
    return (
      <Card>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  // Hata durumu
  if (error) {
    return (
      <Card>
        <Alert
          message="Hata"
          description={error}
          type="error"
          showIcon
        />
      </Card>
    );
  }

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>
          <BellOutlined /> Son Bildirimler
          {unreadCount > 0 && (
            <Badge 
              count={unreadCount} 
              style={{ marginLeft: 8 }}
              overflowCount={99}
            />
          )}
        </Title>
        <Button 
          type="link" 
          size="small"
          onClick={handleViewAllNotifications}
        >
          Tümünü Gör
        </Button>
      </div>

      {unreadCount > 0 && (
        <Alert
          message={`${unreadCount} okunmamış bildiriminiz var`}
          type="info"
          showIcon
          style={{ marginBottom: 16, fontSize: '13px' }}
          banner
        />
      )}

      {notifications.length > 0 ? (
        <List
          itemLayout="horizontal"
          dataSource={notifications}
          renderItem={renderNotificationItem}
          split={false}
        />
      ) : (
        <Empty 
          description="Henüz bildirim yok" 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )}
    </Card>
  );
};

export default DashboardNotifications; 