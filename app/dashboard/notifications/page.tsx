"use client";

import { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Tabs,
  List,
  Badge,
  Tag,
  Button,
  Space,
  Dropdown,
  Menu,
  Row,
  Col,
  Statistic,
  Alert,
  Timeline,
  Empty,
  Divider,
  Avatar,
  Spin
} from 'antd';
import {
  BellOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  ClockCircleOutlined,
  ToolOutlined,
  FilterOutlined,
  DeleteOutlined,
  CheckOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  TeamOutlined,
  HeartOutlined,
  MoreOutlined,
  SyncOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.locale('tr');
dayjs.extend(relativeTime);

const { Title, Text, Paragraph } = Typography;

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

// Bildirim veri tipi
interface Notification {
  id: string;
  title: string;
  description: string;
  type: NotificationType;
  source: NotificationSource;
  status: NotificationStatus;
  createdAt: string;
  link?: string;
  action?: string;
}

// Demo bildirim verileri
const notificationsData: Notification[] = [
  {
    id: '1',
    title: 'Düşük Stok Uyarısı: N95 Maske',
    description: 'N95 Maske stok seviyesi 50 adete düştü (minimum: 100)',
    type: NotificationType.WARNING,
    source: NotificationSource.INVENTORY,
    status: NotificationStatus.UNREAD,
    createdAt: dayjs().subtract(2, 'hour').format(),
    link: '/dashboard/inventory',
    action: 'Stok Ekle'
  },
  {
    id: '2',
    title: 'Ekipman Bakım Zamanı',
    description: 'Jeneratör X5000 için planlanan bakım tarihi geldi',
    type: NotificationType.INFO,
    source: NotificationSource.EQUIPMENT,
    status: NotificationStatus.UNREAD,
    createdAt: dayjs().subtract(1, 'day').format(),
    link: '/dashboard/equipment',
    action: 'Bakım Planla'
  },
  {
    id: '3',
    title: 'Son Kullanma Tarihi Yaklaşıyor',
    description: 'Hazır Gıda Paketi ürünü için son kullanma tarihi 30 gün içinde',
    type: NotificationType.WARNING,
    source: NotificationSource.INVENTORY,
    status: NotificationStatus.UNREAD,
    createdAt: dayjs().subtract(3, 'day').format(),
    link: '/dashboard/inventory',
  },
  {
    id: '4',
    title: 'Gecikmiş Görev',
    description: 'Afet bölgesi değerlendirme raporu teslim tarihi geçti',
    type: NotificationType.ERROR,
    source: NotificationSource.TASK,
    status: NotificationStatus.UNREAD,
    createdAt: dayjs().subtract(5, 'day').format(),
    link: '/dashboard/tasks',
    action: 'Göreve Git'
  },
  {
    id: '5',
    title: 'Yeni Eğitim İçeriği',
    description: 'Gönüllüler için yeni bir eğitim videosu eklendi: İlk Yardım Temel Eğitimi',
    type: NotificationType.SUCCESS,
    source: NotificationSource.VOLUNTEER,
    status: NotificationStatus.READ,
    createdAt: dayjs().subtract(7, 'day').format(),
    link: '/dashboard/volunteers/training',
    action: 'İçeriği Gör'
  },
  {
    id: '6',
    title: 'Ekipman Arızası Bildirimi',
    description: 'Taktik Telsiz Seti arıza bildirimi yapıldı',
    type: NotificationType.ERROR,
    source: NotificationSource.EQUIPMENT,
    status: NotificationStatus.READ,
    createdAt: dayjs().subtract(10, 'day').format(),
    link: '/dashboard/equipment',
    action: 'Arıza Kaydını Gör'
  },
  {
    id: '7',
    title: 'Yeni Görev Atandı',
    description: 'Size yeni bir görev atandı: Saha ekibi koordinasyonu',
    type: NotificationType.INFO,
    source: NotificationSource.TASK,
    status: NotificationStatus.UNREAD,
    createdAt: dayjs().subtract(12, 'hour').format(),
    link: '/dashboard/tasks',
    action: 'Göreve Git'
  },
  {
    id: '8',
    title: 'İzin Talebi Onaylandı',
    description: 'Mehmet Demir için izin talebi onaylandı: 15-20 Kasım 2023',
    type: NotificationType.SUCCESS,
    source: NotificationSource.PERSONNEL,
    status: NotificationStatus.READ,
    createdAt: dayjs().subtract(2, 'day').format(),
    link: '/dashboard/personnel',
  },
  {
    id: '9',
    title: 'Sistem Bakımı Planlandı',
    description: 'Sistem bakımı nedeniyle platform 24 Kasım 02:00-05:00 saatleri arasında hizmet vermeyecektir',
    type: NotificationType.INFO,
    source: NotificationSource.SYSTEM,
    status: NotificationStatus.UNREAD,
    createdAt: dayjs().subtract(1, 'day').format(),
  },
  {
    id: '10',
    title: 'Yeni Gönüllü Başvurusu',
    description: '5 yeni gönüllü başvurusu değerlendirme bekliyor',
    type: NotificationType.INFO,
    source: NotificationSource.VOLUNTEER,
    status: NotificationStatus.UNREAD,
    createdAt: dayjs().subtract(6, 'hour').format(),
    link: '/dashboard/volunteers',
    action: 'Başvuruları İncele'
  }
];

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedSource, setSelectedSource] = useState<string | null>(null);

  // Bildirim istatistikleri
  const stats = {
    all: notifications.length,
    unread: notifications.filter(n => n.status === NotificationStatus.UNREAD).length,
    inventory: notifications.filter(n => n.source === NotificationSource.INVENTORY).length,
    equipment: notifications.filter(n => n.source === NotificationSource.EQUIPMENT).length,
    tasks: notifications.filter(n => n.source === NotificationSource.TASK).length,
    volunteer: notifications.filter(n => n.source === NotificationSource.VOLUNTEER).length,
    personnel: notifications.filter(n => n.source === NotificationSource.PERSONNEL).length,
    system: notifications.filter(n => n.source === NotificationSource.SYSTEM).length,
    warning: notifications.filter(n => n.type === NotificationType.WARNING).length,
    error: notifications.filter(n => n.type === NotificationType.ERROR).length,
  };

  // Bildirimleri filtrele
  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'all') {
      return notification.status !== NotificationStatus.ARCHIVED;
    } else if (activeTab === 'unread') {
      return notification.status === NotificationStatus.UNREAD;
    } else if (activeTab === 'inventory') {
      return notification.source === NotificationSource.INVENTORY && notification.status !== NotificationStatus.ARCHIVED;
    } else if (activeTab === 'equipment') {
      return notification.source === NotificationSource.EQUIPMENT && notification.status !== NotificationStatus.ARCHIVED;
    } else if (activeTab === 'tasks') {
      return notification.source === NotificationSource.TASK && notification.status !== NotificationStatus.ARCHIVED;
    } else if (activeTab === 'archived') {
      return notification.status === NotificationStatus.ARCHIVED;
    }
    return true;
  }).filter(notification => {
    if (selectedSource) {
      return notification.source === selectedSource;
    }
    return true;
  });

  // Bildirim durumunu güncelle
  const updateNotificationStatus = async (id: string, status: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, status }),
      });
      
      if (!response.ok) {
        throw new Error('Bildirim güncellenemedi');
      }
      
      // Başarılı olduğunda local state'i güncelle
      setNotifications(
        notifications.map(notification =>
          notification.id === id
            ? { ...notification, status: status.toLowerCase() as NotificationStatus }
            : notification
        )
      );
    } catch (error) {
      console.error('Bildirim güncellenirken hata:', error);
      setError('Bildirim güncellenirken bir hata oluştu');
    }
  };

  // Bildirim işlemleri
  const markAsRead = (id: string) => {
    updateNotificationStatus(id, 'read');
  };

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => n.status === NotificationStatus.UNREAD);
    
    for (const notification of unreadNotifications) {
      await updateNotificationStatus(notification.id, 'read');
    }
  };

  const archiveNotification = (id: string) => {
    updateNotificationStatus(id, 'archived');
  };

  const deleteNotification = (id: string) => {
    updateNotificationStatus(id, 'archived');
  };

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

  const getSourceTag = (source: NotificationSource) => {
    const sourceLabels: Record<NotificationSource, string> = {
      [NotificationSource.INVENTORY]: 'Envanter',
      [NotificationSource.EQUIPMENT]: 'Ekipman',
      [NotificationSource.TASK]: 'Görev',
      [NotificationSource.VOLUNTEER]: 'Gönüllü',
      [NotificationSource.PERSONNEL]: 'Personel',
      [NotificationSource.SYSTEM]: 'Sistem',
    };

    const sourceColors: Record<NotificationSource, string> = {
      [NotificationSource.INVENTORY]: 'blue',
      [NotificationSource.EQUIPMENT]: 'purple',
      [NotificationSource.TASK]: 'cyan',
      [NotificationSource.VOLUNTEER]: 'magenta',
      [NotificationSource.PERSONNEL]: 'green',
      [NotificationSource.SYSTEM]: 'orange',
    };

    return <Tag color={sourceColors[source]}>{sourceLabels[source]}</Tag>;
  };

  // Bildirim öğesi render
  const renderNotificationItem = (notification: Notification) => {
    const notificationIcon = getNotificationIcon(notification.type, notification.source);
    const isUnread = notification.status === NotificationStatus.UNREAD;

    return (
      <List.Item
        style={{ 
          backgroundColor: isUnread ? '#f0f8ff' : 'white', 
          padding: '12px', 
          borderLeft: `3px solid ${getNotificationColor(notification.type)}` 
        }}
        actions={[
          notification.action && (
            <Button type="link" href={notification.link}>
              {notification.action}
            </Button>
          ),
          <Dropdown 
            menu={{
              items: [
                {
                  key: "1",
                  icon: <CheckOutlined />,
                  label: "Okundu olarak işaretle",
                  onClick: () => markAsRead(notification.id)
                },
                {
                  key: "2",
                  icon: <DeleteOutlined />,
                  label: "Arşivle",
                  onClick: () => archiveNotification(notification.id)
                },
                {
                  key: "3", 
                  icon: <DeleteOutlined />,
                  label: "Sil",
                  danger: true,
                  onClick: () => deleteNotification(notification.id)
                }
              ]
            }}
            trigger={['click']}
          >
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
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
              <Text strong={isUnread}>{notification.title}</Text>
              {getSourceTag(notification.source)}
              {isUnread && <Badge status="processing" color={getNotificationColor(notification.type)} />}
            </Space>
          }
          description={
            <div>
              <Paragraph>{notification.description}</Paragraph>
              <Text type="secondary">
                <ClockCircleOutlined /> {dayjs(notification.createdAt).fromNow()}
              </Text>
            </div>
          }
        />
      </List.Item>
    );
  };

  // Kategorilere göre bildirim sayılarını hesaplama
  useEffect(() => {
    // Her yeni bildirim güncellemesinde bildirim sayılarını hesapla
    const unreadCount = notifications.filter(n => n.status === NotificationStatus.UNREAD).length;
    
    // Global bildirim sayısını güncellemek için bir event yayınla
    // Bu, diğer bileşenlerin bildirim sayısını güncellemek için dinleyebileceği bir event
    const event = new CustomEvent('notificationCountUpdated', { 
      detail: { count: unreadCount } 
    });
    window.dispatchEvent(event);
  }, [notifications]);

  // Bildirimleri önem sırasına göre sırala
  const sortNotifications = (a: Notification, b: Notification) => {
    // Önce okunmamış bildirimleri göster
    if (a.status === NotificationStatus.UNREAD && b.status !== NotificationStatus.UNREAD) {
      return -1;
    }
    if (a.status !== NotificationStatus.UNREAD && b.status === NotificationStatus.UNREAD) {
      return 1;
    }
    
    // Sonra öncelik sırasına göre: ERROR > WARNING > INFO > SUCCESS
    const priorityOrder = {
      [NotificationType.ERROR]: 0,
      [NotificationType.WARNING]: 1,
      [NotificationType.INFO]: 2,
      [NotificationType.SUCCESS]: 3,
    };
    
    if (priorityOrder[a.type] !== priorityOrder[b.type]) {
      return priorityOrder[a.type] - priorityOrder[b.type];
    }
    
    // Son olarak, tarihe göre sırala (en yeniden en eskiye)
    return dayjs(b.createdAt).unix() - dayjs(a.createdAt).unix();
  };

  // API'den bildirimleri getir
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let url = '/api/notifications?';
        
        if (activeTab === 'unread') {
          url += 'status=unread&';
        } else if (activeTab !== 'all' && activeTab !== 'archived') {
          url += `source=${activeTab.toUpperCase()}&`;
        } else if (activeTab === 'archived') {
          url += 'status=archived&';
        }
        
        if (selectedSource) {
          url += `source=${selectedSource.toUpperCase()}&`;
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Bildirimler alınamadı');
        }
        
        const data = await response.json();
        
        // API'den gelen verileri güvenli şekilde kontrol et ve UI formatına dönüştür
        const formattedNotifications = (data.notifications || []).map((item: any) => ({
          id: item.id || '',
          title: item.title || 'Başlık Yok',
          description: item.message || item.description || 'Açıklama Yok',
          type: (item.type && typeof item.type === 'string' ? item.type.toLowerCase() : 'info') as NotificationType,
          source: (item.source && typeof item.source === 'string' ? item.source.toLowerCase() : 'system') as NotificationSource,
          status: (item.status && typeof item.status === 'string' ? item.status.toLowerCase() : 'unread') as NotificationStatus,
          createdAt: item.createdAt || new Date().toISOString(),
          link: item.link || null,
          action: item.action || null
        }));
        
        setNotifications(formattedNotifications);
      } catch (error) {
        console.error('Bildirimler yüklenirken hata:', error);
        setError('Bildirimler yüklenirken bir hata oluştu');
        // Hata durumunda demo verileri kullan
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [activeTab, selectedSource]);

  // Yükleniyor durumu
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }
  
  // Hata durumu
  if (error) {
    return (
      <Alert
        message="Hata"
        description={error}
        type="error"
        showIcon
        action={
          <Button onClick={() => window.location.reload()}>
            Sayfayı Yenile
          </Button>
        }
      />
    );
  }

  return (
    <div className="notifications-page">
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Title level={2}>
            <BellOutlined /> Bildirimler
          </Title>
          <Space>
            <Button 
              onClick={markAllAsRead} 
              icon={<CheckOutlined />}
              disabled={stats.unread === 0}
            >
              Tümünü Okundu İşaretle
            </Button>
            <Button icon={<SyncOutlined />}>Yenile</Button>
            <Dropdown 
              menu={{
                items: [
                  {
                    key: "1",
                    label: "Tüm Kaynaklar",
                    onClick: () => setSelectedSource(null)
                  },
                  {
                    type: "divider"
                  },
                  {
                    key: "2",
                    label: "Envanter",
                    onClick: () => setSelectedSource(NotificationSource.INVENTORY)
                  },
                  {
                    key: "3",
                    label: "Ekipman",
                    onClick: () => setSelectedSource(NotificationSource.EQUIPMENT)
                  },
                  {
                    key: "4",
                    label: "Görevler",
                    onClick: () => setSelectedSource(NotificationSource.TASK)
                  },
                  {
                    key: "5",
                    label: "Gönüllüler",
                    onClick: () => setSelectedSource(NotificationSource.VOLUNTEER)
                  },
                  {
                    key: "6",
                    label: "Personel",
                    onClick: () => setSelectedSource(NotificationSource.PERSONNEL)
                  },
                  {
                    key: "7",
                    label: "Sistem",
                    onClick: () => setSelectedSource(NotificationSource.SYSTEM)
                  }
                ]
              }}
              trigger={['click']}
            >
              <Button icon={<FilterOutlined />}>
                Filtrele {selectedSource && <Tag color="blue">{selectedSource}</Tag>}
              </Button>
            </Dropdown>
          </Space>
        </div>

        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card>
              <Statistic 
                title="Toplam Bildirim" 
                value={stats.all} 
                valueStyle={{ color: '#1890ff' }} 
                prefix={<BellOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card>
              <Statistic 
                title="Okunmamış" 
                value={stats.unread} 
                valueStyle={{ color: '#52c41a' }}
                prefix={<Badge status="processing" />} 
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card>
              <Statistic 
                title="Uyarılar" 
                value={stats.warning + stats.error} 
                valueStyle={{ color: '#faad14' }}
                prefix={<WarningOutlined />} 
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card>
              <Statistic 
                title="Acil Bildirimler" 
                value={stats.error} 
                valueStyle={{ color: '#f5222d' }}
                prefix={<CloseCircleOutlined />} 
              />
            </Card>
          </Col>
        </Row>

        <Divider />

        {stats.unread > 0 && (
          <Alert
            message={`${stats.unread} okunmamış bildiriminiz var`}
            type="info"
            showIcon
            action={
              <Button size="small" type="link" onClick={markAllAsRead}>
                Tümünü Okundu İşaretle
              </Button>
            }
            style={{ marginBottom: 16 }}
          />
        )}

        <Tabs 
          activeKey={activeTab}
          onChange={setActiveTab}
          tabBarExtraContent={
            <Text type="secondary">
              {filteredNotifications.length} bildirim gösteriliyor
            </Text>
          }
          items={[
            {
              key: "all",
              label: <Badge count={stats.all} overflowCount={99}>Tümü</Badge>
            },
            {
              key: "unread",
              label: <Badge count={stats.unread} overflowCount={99}>Okunmamış</Badge>
            },
            {
              key: "inventory",
              label: <Badge count={stats.inventory} overflowCount={99}>Envanter</Badge>
            },
            {
              key: "equipment",
              label: <Badge count={stats.equipment} overflowCount={99}>Ekipman</Badge>
            },
            {
              key: "tasks",
              label: <Badge count={stats.tasks} overflowCount={99}>Görevler</Badge>
            },
            {
              key: "archived",
              label: "Arşiv"
            }
          ]}
        />

        {filteredNotifications.length > 0 ? (
          <List
            itemLayout="horizontal"
            dataSource={filteredNotifications}
            renderItem={renderNotificationItem}
            pagination={filteredNotifications.length > 10 ? { pageSize: 10 } : false}
          />
        ) : (
          <Empty description="Bildirim bulunamadı" />
        )}
      </Card>
    </div>
  );
};

export default NotificationsPage; 