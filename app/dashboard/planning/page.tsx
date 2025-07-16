"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Card, 
  Typography, 
  Input, 
  Button, 
  Space, 
  Tabs, 
  List, 
  Tag, 
  Avatar, 
  App,
  Spin,
  Tooltip,
  Alert,
  Badge,
  Switch,
  Empty,
  Divider
} from 'antd';
import { 
  TeamOutlined, 
  SaveOutlined, 
  SendOutlined, 
  FileTextOutlined,
  InfoCircleOutlined,
  ShareAltOutlined,
  UserOutlined,
  LinkOutlined,
  DisconnectOutlined,
  MessageOutlined,
  PhoneOutlined,
  VideoCameraOutlined,
  UserAddOutlined,
  SettingOutlined
} from '@ant-design/icons';
import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import { UserRole } from '../../types/user';
import { io, Socket } from 'socket.io-client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const { Title, Text } = Typography;
const { TextArea } = Input;

// 3D Mapbox bileşenini dinamik olarak yükle
const MapboxPlanningComponent = dynamic(
  () => import('../../components/Map/MapboxPlanningComponent'),
  { 
    ssr: false,
    loading: () => <div style={{ height: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Spin size="large" /></div>
  }
);

// Görev Grubu arayüzü
interface TaskGroup {
  id: string;
  name: string;
  description: string;
  members: GroupMember[];
  created: Date;
  tasks: string[];
  department?: string;
}

// Grup üyesi arayüzü
interface GroupMember {
  id: string;
  name: string;
  role: UserRole;
  image?: string;
  status: 'online' | 'offline' | 'away';
}

// Plan arayüzü
interface PlanData {
  id: string;
  title: string;
  description: string;
  groupId: string;
  mapData: any;
  created: Date;
  lastModified: Date;
  createdBy: string;
  notes: string;
}

// Gerçek zamanlı harita paylaşımı için kullanıcı bileşeni
interface CollaborationUser {
  id: string;
  name: string;
  color: string;
  lastActive: Date;
  role?: string;
}

// Sohbet mesajı arayüzü
interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: Date;
  isSystem?: boolean;
}

// Demo grup verileri - Backup'tan alınan veriler
const demoGroups: TaskGroup[] = [
  {
    id: '1',
    name: 'Arama Kurtarma Ekibi',
    description: 'Arama kurtarma operasyonlarını yürüten ekip',
    members: [
      { id: '1', name: 'Admin Kullanıcı', role: UserRole.ADMIN, status: 'online', image: '/avatars/admin.png' },
      { id: '2', name: 'Yönetici Kullanıcı', role: UserRole.MANAGER, status: 'online', image: '/avatars/manager.png' },
      { id: '3', name: 'Personel Kullanıcı', role: UserRole.PERSONNEL, status: 'offline', image: '/avatars/personnel.png' },
    ],
    created: new Date('2023-05-10'),
    tasks: ['1', '2', '3'],
    department: 'search-rescue'
  },
  {
    id: '2',
    name: 'İlk Yardım Ekibi',
    description: 'Sağlık hizmetleri sunan ekip',
    members: [
      { id: '2', name: 'Yönetici Kullanıcı', role: UserRole.MANAGER, status: 'online', image: '/avatars/manager.png' },
      { id: '3', name: 'Personel Kullanıcı', role: UserRole.PERSONNEL, status: 'away', image: '/avatars/personnel.png' },
    ],
    created: new Date('2023-04-15'),
    tasks: ['4', '5'],
    department: 'medical'
  },
  {
    id: '3',
    name: 'Lojistik Ekibi',
    description: 'Malzeme ve ekipman tedariki ile ilgilenen ekip',
    members: [
      { id: '1', name: 'Admin Kullanıcı', role: UserRole.ADMIN, status: 'away', image: '/avatars/admin.png' },
      { id: '3', name: 'Personel Kullanıcı', role: UserRole.PERSONNEL, status: 'online', image: '/avatars/personnel.png' },
    ],
    created: new Date('2023-03-22'),
    tasks: ['6', '7', '8'],
    department: 'logistics'
  },
];

// Demo plan verileri - Backup'tan alınan veriler
const demoPlans: PlanData[] = [
  {
    id: '1',
    title: 'Deprem Bölgesi Tahliye Planı',
    description: 'Deprem sonrası bölge tahliye operasyonu planı',
    groupId: '1',
    mapData: { 
      type: 'FeatureCollection', 
      features: []
    },
    created: new Date('2023-05-15'),
    lastModified: new Date('2023-05-17'),
    createdBy: '1',
    notes: 'Bu plan, deprem sonrası bölgede yapılacak tahliye operasyonlarını içerir. Öncelikli alanlar haritada işaretlenmiştir.'
  },
  {
    id: '2',
    title: 'Sel Bölgesi Yardım Planı',
    description: 'Sel bölgesine ilk yardım ekiplerinin yerleştirilmesi',
    groupId: '2',
    mapData: { 
      type: 'FeatureCollection', 
      features: []
    },
    created: new Date('2023-04-20'),
    lastModified: new Date('2023-04-22'),
    createdBy: '2',
    notes: 'Sel bölgesinde ilk yardım istasyonlarının konumları ve personel dağılımları haritada gösterilmiştir.'
  },
];

const PlanningPage = () => {
  const { notification } = App.useApp();
  const { data: session, status } = useSession();
  const [selectedGroup, setSelectedGroup] = useState<TaskGroup | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PlanData | null>(null);
  const [mapData, setMapData] = useState<any>(null);
  const [notes, setNotes] = useState<string>('');
  const [planTitle, setPlanTitle] = useState<string>('');
  const [planDescription, setPlanDescription] = useState<string>('');
  const [tabKey, setTabKey] = useState<string>('drawing');
  const [showMap, setShowMap] = useState<boolean>(true);
  
  // Gerçek zamanlı işbirliği için state'ler
  const [isCollaborating, setIsCollaborating] = useState<boolean>(false);
  const [collaborators, setCollaborators] = useState<CollaborationUser[]>([]);
  const [shareSessionId, setShareSessionId] = useState<string>('');
  const socketRef = useRef<Socket | null>(null);
  
  // Konferans chat için state'ler
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Conference States
  const [isCallModalVisible, setIsCallModalVisible] = useState<boolean>(false);
  const [isInviteModalVisible, setIsInviteModalVisible] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState<boolean>(true);
  const [isSettingsDrawerVisible, setIsSettingsDrawerVisible] = useState<boolean>(false);
  
  const queryClient = useQueryClient();
  
  // API'den görev gruplarını çekme - Demo veriler kullanılıyor
  const { data: groups = demoGroups, isLoading: isGroupsLoading } = useQuery({
    queryKey: ['taskGroups'],
    queryFn: async () => {
      return demoGroups;
    },
    onError: (error) => {
      console.error('Görev grupları çekilirken hata:', error);
      notification.error({ message: 'Görev grupları yüklenirken bir hata oluştu' });
    }
  });
  
  // Grup ID'sine göre planları çekme - Demo veriler kullanılıyor
  const { data: plans = [], isLoading: isPlansLoading } = useQuery({
    queryKey: ['plans', selectedGroup?.id],
    queryFn: async () => {
      if (!selectedGroup?.id) return [];
      return demoPlans.filter(plan => plan.groupId === selectedGroup.id);
    },
    enabled: !!selectedGroup?.id,
    onError: (error) => {
      console.error('Planlar çekilirken hata:', error);
      notification.error({ message: 'Planlar yüklenirken bir hata oluştu' });
    }
  });

  // Plan oluşturma mutation
  const createPlanMutation = useMutation({
    mutationFn: async (planData: any) => {
      const newPlan: PlanData = {
        id: `plan-${Date.now()}`,
        title: planData.title,
        description: planData.description,
        groupId: planData.group_id,
        mapData: planData.mapData,
        created: new Date(),
        lastModified: new Date(),
        createdBy: session?.user?.id || 'unknown',
        notes: planData.notes
      };
      return newPlan;
    },
    onSuccess: (newPlan) => {
      queryClient.invalidateQueries({ queryKey: ['plans', selectedGroup?.id] });
      setSelectedPlan(newPlan);
      notification.success({ message: 'Plan başarıyla oluşturuldu!' });
    },
    onError: () => {
      notification.error({ message: 'Plan oluşturulurken bir hata oluştu' });
    }
  });

  // Plan güncelleme mutation
  const updatePlanMutation = useMutation({
    mutationFn: async (planData: any) => {
      return planData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans', selectedGroup?.id] });
      notification.success({ message: 'Plan başarıyla güncellendi!' });
    },
    onError: () => {
      notification.error({ message: 'Plan güncellenirken bir hata oluştu' });
    }
  });

  // Socket.io bağlantısı ve gerçek zamanlı işbirliği
  useEffect(() => {
    if (isCollaborating && selectedPlan && session?.user?.id) {
      const sessionId = `plan-${selectedPlan.id}-${Date.now()}`;
      setShareSessionId(sessionId);
      
      // Demo işbirlikçi ekle
      const demoCollaborators: CollaborationUser[] = [
        {
          id: 'user-1',
          name: 'Demo Kullanıcı 1',
          color: '#ff4d4f',
          lastActive: new Date(),
          role: 'Yönetici'
        },
        {
          id: 'user-2', 
          name: 'Demo Kullanıcı 2',
          color: '#52c41a',
          lastActive: new Date(),
          role: 'Personel'
        }
      ];
      
      setCollaborators(demoCollaborators);
      addSystemMessage('Gerçek zamanlı işbirliği başlatıldı. Harita değişikliklerini herkes anında görecek.');
      notification.success({ message: 'Gerçek zamanlı paylaşım başlatıldı!' });

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
        }
      };
    }
  }, [isCollaborating, selectedPlan, session?.user?.id]);
  
  // Harita verisi değiştiğinde çalışacak fonksiyon
  const handleMapDataChange = (data: any) => {
    setMapData(data);
    
    if (isCollaborating && socketRef.current) {
      console.log('Harita verisi paylaşıldı:', data);
      notification.info({ message: 'Harita değişikliği diğer kullanıcılarla paylaşıldı' });
      
      if (selectedPlan) {
        updatePlanMutation.mutate({
          id: selectedPlan.id,
          mapData: data
        });
      }
    }
  };
  
  // Gerçek zamanlı paylaşımı başlat/durdur
  const toggleCollaboration = (active: boolean) => {
    setIsCollaborating(active);
    
    if (!active) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setShareSessionId('');
      setCollaborators([]);
      notification.info({ message: 'Gerçek zamanlı paylaşım durduruldu' });
    }
  };
  
  // Paylaşım bağlantısını kopyala
  const copyShareLink = () => {
    if (shareSessionId) {
      const shareUrl = `${window.location.origin}/dashboard/planning?session=${shareSessionId}`;
      navigator.clipboard.writeText(shareUrl);
      notification.success({ message: 'Paylaşım bağlantısı kopyalandı!' });
    }
  };
  
  // Plan değiştiğinde çalışacak fonksiyon
  const handlePlanChange = (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (plan) {
      setSelectedPlan(plan);
      setNotes(plan.notes || '');
      setPlanTitle(plan.title);
      setPlanDescription(plan.description || '');
      setMapData(plan.mapData || { type: 'FeatureCollection', features: [] });
    }
  };
  
  // Yeni plan oluştur
  const handleCreatePlan = () => {
    if (!selectedGroup || !planTitle.trim()) {
      notification.error({ message: 'Lütfen bir grup seçin ve plan başlığı girin' });
      return;
    }
    
    const newPlanData = {
      title: planTitle,
      description: planDescription,
      group_id: selectedGroup.id,
      mapData: mapData || { type: 'FeatureCollection', features: [] },
      notes: notes
    };
    
    createPlanMutation.mutate(newPlanData);
  };
  
  // Planı güncelle
  const handleUpdatePlan = () => {
    if (!selectedPlan) return;
    
    const updatedPlanData = {
      id: selectedPlan.id,
      title: planTitle,
      description: planDescription,
      mapData: mapData,
      notes: notes
    };
    
    updatePlanMutation.mutate(updatedPlanData);
  };
  
  // Planı paylaş
  const handleSharePlan = () => {
    if (!selectedPlan || !selectedGroup) return;
    notification.success({ message: `Plan "${selectedPlan.title}" ${selectedGroup.members.length} kişi ile paylaşıldı` });
  };
  
  // Durum renkleri
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'online': return 'green';
      case 'offline': return 'red';
      case 'away': return 'orange';
      default: return 'default';
    }
  };
  
  // Görev grubu seçme işlevi
  const handleGroupSelect = (group: TaskGroup) => {
    setSelectedGroup(group);
  };
  
  // Görev grubu departman bilgisi
  const renderGroupDepartment = (group: TaskGroup) => {
    let color = 'blue';
    let label = 'Diğer';
    
    if (!group.department) return null;
    
    switch(group.department) {
      case 'search-rescue':
        color = 'red';
        label = 'Arama Kurtarma';
        break;
      case 'medical':
        color = 'green';
        label = 'Sağlık';
        break;
      case 'logistics':
        color = 'purple';
        label = 'Lojistik';
        break;
      case 'security':
        color = 'orange';
        label = 'Güvenlik';
        break;
      case 'infrastructure':
        color = 'cyan';
        label = 'Altyapı';
        break;
    }
    
    return <Tag color={color}>{label}</Tag>;
  };
  
  // Mesaj gönderme fonksiyonu
  const sendMessage = () => {
    if (!newMessage.trim() || !session?.user) return;
    
    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: session.user.id || 'unknown',
      senderName: session.user.name || 'Anonim Kullanıcı',
      text: newMessage.trim(),
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, message]);
    setNewMessage('');
    
    setTimeout(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    }, 100);
  };

  // Sistem mesajı ekleme 
  const addSystemMessage = (text: string) => {
    if (!showNotifications) return;
    
    const systemMessage: ChatMessage = {
      id: `sys-${Date.now()}`,
      senderId: 'system',
      senderName: 'Sistem',
      text: text,
      timestamp: new Date(),
      isSystem: true
    };
    
    setChatMessages(prev => [...prev, systemMessage]);
    
    setTimeout(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    }, 100);
  };

  // İşbirlikçileri render et
  const renderCollaborators = () => {
    if (!isCollaborating || collaborators.length === 0) return null;
    
    return (
      <div style={{ marginBottom: '16px' }}>
        <Text strong>Aktif Katılımcılar ({collaborators.length}):</Text>
        <div style={{ marginTop: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {collaborators.map(user => (
            <Tooltip key={user.id} title={`${user.name} - ${user.role} - Son aktif: ${user.lastActive.toLocaleTimeString()}`}>
              <Badge status="success" dot>
                <Avatar 
                  style={{ backgroundColor: user.color }}
                  size="small"
                >
                  {user.name.charAt(0).toUpperCase()}
                </Avatar>
              </Badge>
            </Tooltip>
          ))}
        </div>
      </div>
    );
  };

  // Chat mesajlarını render et
  const renderChatMessages = () => {
    return (
      <div>
        <div 
          ref={chatContainerRef}
          style={{ 
            height: '300px', 
            overflowY: 'auto', 
            border: '1px solid #d9d9d9', 
            borderRadius: '4px',
            padding: '10px',
            marginBottom: '10px'
          }}
        >
          {isCallModalVisible && (
            <Alert
              message="Görüntülü konferans görüşmesi aktif"
              type="success"
              icon={<VideoCameraOutlined />}
              action={
                <Space>
                  <Button size="small" type="primary" onClick={() => setIsCallModalVisible(true)}>
                    Katıl
                  </Button>
                </Space>
              }
              style={{ marginBottom: '10px' }}
            />
          )}
          
          {chatMessages.length > 0 ? (
            <>
              {chatMessages.map((msg, index) => (
                <div 
                  key={index} 
                  style={{ 
                    textAlign: msg.senderId === session?.user?.id ? 'right' : 'left',
                    marginBottom: '10px'
                  }}
                >
                  <div style={{ display: 'inline-block', maxWidth: '80%' }}>
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#888',
                      marginBottom: '2px'
                    }}>
                      {msg.senderId === session?.user?.id ? 'Siz' : msg.senderName} - {new Date(msg.timestamp).toLocaleTimeString()}
                    </div>
                    <div style={{ 
                      backgroundColor: msg.senderId === session?.user?.id ? '#1890ff' : msg.isSystem ? '#f0f0f0' : '#f0f0f0', 
                      color: msg.senderId === session?.user?.id ? 'white' : 'black',
                      padding: '8px 12px',
                      borderRadius: '12px',
                      display: 'inline-block',
                      wordBreak: 'break-word'
                    }}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <Empty 
              description={
                isCollaborating 
                  ? "Henüz mesaj yok. İlk mesajı gönder!" 
                  : "Mesaj göndermek için önce işbirliği modunu aktif edin."
              } 
            />
          )}
        </div>
        
        <Space.Compact style={{ width: '100%' }}>
          <Input 
            placeholder="Mesajınızı yazın..."
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onPressEnter={sendMessage}
            disabled={!isCollaborating}
          />
          <Button 
            type="primary" 
            icon={<SendOutlined />} 
            onClick={sendMessage}
            disabled={!isCollaborating}
          >
            Gönder
          </Button>
        </Space.Compact>
      </div>
    );
  };

  // Görüntülü konferans arayüzü
  const renderCallInterface = () => {
    return (
      <div>
        {isCollaborating ? (
          <div>
            <Space style={{ marginBottom: '16px', width: '100%', justifyContent: 'space-between' }}>
              <Button 
                type="primary"
                icon={<PhoneOutlined />}
                onClick={() => setIsCallModalVisible(true)}
              >
                Konferansa Başla
              </Button>
              <Button 
                icon={<UserAddOutlined />}
                onClick={() => setIsInviteModalVisible(true)}
              >
                Davet Et
              </Button>
            </Space>
            
            <Alert
              message="Görüntülü Konferans Bilgileri"
              description={
                <>
                  <p>
                    Planlama toplantısı için görüntülü konferans oluşturabilir ve diğer katılımcıları davet edebilirsiniz.
                  </p>
                  <p>
                    <strong>Katılımcılar:</strong> {collaborators.length} aktif kullanıcı
                  </p>
                </>
              }
              type="info"
              icon={<InfoCircleOutlined />}
              showIcon
            />
          </div>
        ) : (
          <Alert
            message="Görüntülü Konferans için İşbirliği Modu"
            description="Görüntülü konferans başlatmak için önce gerçek zamanlı işbirliği modunu aktif etmeniz gerekmektedir."
            type="warning"
            showIcon
            action={
              <Button 
                size="small" 
                type="primary"
                onClick={() => toggleCollaboration(true)}
              >
                İşbirliği Modunu Aç
              </Button>
            }
          />
        )}
        
        {/* Görüntülü konferans modunda kullanıcı listesi */}
        {isCollaborating && (
          <div style={{ marginTop: '16px' }}>
            <Text strong>Aktif Katılımcılar</Text>
            <List
              dataSource={collaborators}
              renderItem={user => (
                <List.Item
                  actions={[
                    <Button 
                      key="call" 
                      icon={<PhoneOutlined />}
                      size="small"
                      type="text"
                      onClick={() => console.log('Call user', user.id)}
                    />,
                    <Button 
                      key="video" 
                      icon={<VideoCameraOutlined />}
                      size="small"
                      type="text"
                      onClick={() => console.log('Video call user', user.id)}
                    />
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Badge status="success" dot>
                        <Avatar icon={<UserOutlined />} />
                      </Badge>
                    }
                    title={user.name}
                    description={
                      <Tag color={getStatusColor('online')}>
                        Çevrimiçi
                      </Tag>
                    }
                  />
                </List.Item>
              )}
            />
          </div>
        )}
      </div>
    );
  };

  // Yükleniyor durumu
  if (status === 'loading') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large">
          <div style={{ padding: '20px' }}>Yükleniyor...</div>
        </Spin>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', height: '100vh', overflow: 'hidden' }}>
      <div style={{ marginBottom: '20px' }}>
        <Title level={2}>🎯 Operasyon Planlama ve 3D Harita Çizimi</Title>
        <Text type="secondary">
          Görev grupları ile işbirliği yaparak 3D harita üzerinde operasyon planları oluşturun, gerçek zamanlı paylaşım yapın ve konferans görüşmeleri düzenleyin.
        </Text>
      </div>

      <div style={{ display: 'flex', gap: '20px', height: 'calc(100vh - 120px)' }}>
        {/* Sol taraf - Gruplar ve planlar */}
        <div style={{ width: '300px', overflowY: 'auto' }}>
          <Card title="🏢 Görev Grupları" size="small">
            {isGroupsLoading ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <Spin />
              </div>
            ) : (
              <>
                <List
                  size="small"
                  dataSource={groups}
                  renderItem={(group) => (
                    <List.Item 
                      key={group.id}
                      onClick={() => handleGroupSelect(group)}
                      style={{ 
                        cursor: 'pointer', 
                        backgroundColor: selectedGroup?.id === group.id ? '#f0f5ff' : 'transparent',
                        padding: '8px',
                        borderRadius: '4px'
                      }}
                    >
                      <List.Item.Meta
                        avatar={<Avatar icon={<TeamOutlined />} />}
                        title={
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>{group.name}</span>
                            {renderGroupDepartment(group)}
                          </div>
                        }
                        description={
                          <Space>
                            <Text type="secondary">{group.members.length} üye</Text>
                            <Tag color="blue">{group.tasks.length} görev</Tag>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              </>
            )}
          </Card>
          
          {selectedGroup && (
            <>
              <Divider style={{ margin: '16px 0' }} />
              
              <Card title="👥 Grup Üyeleri" size="small">
                <List
                  size="small"
                  dataSource={selectedGroup.members}
                  renderItem={(member) => (
                    <List.Item key={member.id}>
                      <List.Item.Meta
                        avatar={<Avatar src={member.image} icon={!member.image ? <UserOutlined /> : undefined} />}
                        title={
                          <Space>
                            {member.name}
                            <Tag color={getStatusColor(member.status)}>
                              {member.status === 'online' ? 'Çevrimiçi' : 
                               member.status === 'offline' ? 'Çevrimdışı' : 'Uzakta'}
                            </Tag>
                          </Space>
                        }
                        description={
                          <Tag color="blue">
                            {member.role === UserRole.ADMIN ? 'Admin' : 
                             member.role === UserRole.MANAGER ? 'Yönetici' : 'Personel'}
                          </Tag>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
              
              <Divider style={{ margin: '16px 0' }} />
              
              <Card title="📋 Planlar" size="small" extra={
                <Button type="primary" size="small" onClick={handleCreatePlan}>
                  Yeni Plan
                </Button>
              }>
                {plans.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <Text type="secondary">Bu grup için henüz plan oluşturulmamış</Text>
                  </div>
                ) : (
                  <List
                    size="small"
                    dataSource={plans}
                    renderItem={(plan) => (
                      <List.Item 
                        key={plan.id}
                        onClick={() => handlePlanChange(plan.id)}
                        style={{ 
                          cursor: 'pointer', 
                          backgroundColor: selectedPlan?.id === plan.id ? '#f0f5ff' : 'transparent',
                          padding: '8px',
                          borderRadius: '4px'
                        }}
                      >
                        <List.Item.Meta
                          avatar={<Avatar icon={<FileTextOutlined />} />}
                          title={plan.title}
                          description={
                            <Text type="secondary">
                              Son güncelleme: {new Date(plan.lastModified).toLocaleDateString()}
                            </Text>
                          }
                        />
                      </List.Item>
                    )}
                  />
                )}
              </Card>
            </>
          )}
        </div>
        
        {/* Sağ taraf - Harita ve plan detayları */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {selectedGroup ? (
            <Card 
              style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
              styles={{ body: { flex: 1, display: 'flex', flexDirection: 'column' } }}
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Input 
                    placeholder="Plan Başlığı" 
                    value={planTitle} 
                    onChange={(e) => setPlanTitle(e.target.value)}
                    style={{ width: '300px' }}
                    disabled={!selectedGroup}
                  />
                  <Space>
                    <Button 
                      type="primary" 
                      icon={<SaveOutlined />} 
                      onClick={selectedPlan ? handleUpdatePlan : handleCreatePlan}
                      disabled={!selectedGroup || !planTitle.trim()}
                    >
                      {selectedPlan ? 'Güncelle' : 'Oluştur'}
                    </Button>
                    {selectedPlan && (
                      <>
                        <Button 
                          icon={<ShareAltOutlined />} 
                          onClick={handleSharePlan}
                        >
                          Paylaş
                        </Button>
                        <Button
                          icon={<SettingOutlined />}
                          onClick={() => setIsSettingsDrawerVisible(true)}
                        >
                          Ayarlar
                        </Button>
                      </>
                    )}
                  </Space>
                </div>
              }
            >
              <Input.TextArea 
                placeholder="Plan açıklaması..." 
                value={planDescription}
                onChange={(e) => setPlanDescription(e.target.value)}
                rows={2}
                style={{ marginBottom: '16px' }}
                disabled={!selectedGroup}
              />
              
              {/* Gerçek zamanlı işbirliği kontrolleri */}
              {selectedPlan && (
                <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Space align="center">
                    <Text strong>🔗 Gerçek Zamanlı İşbirliği:</Text>
                    <Switch 
                      checked={isCollaborating} 
                      onChange={toggleCollaboration} 
                      checkedChildren={<LinkOutlined />} 
                      unCheckedChildren={<DisconnectOutlined />}
                    />
                    {isCollaborating && (
                      <Badge status="processing" text="Aktif" />
                    )}
                  </Space>
                  {isCollaborating && shareSessionId && (
                    <Button 
                      type="dashed" 
                      icon={<ShareAltOutlined />} 
                      onClick={copyShareLink}
                    >
                      Paylaşım Bağlantısı
                    </Button>
                  )}
                </div>
              )}
              
              {/* Bağlı kullanıcılar */}
              {renderCollaborators()}
              
              <div style={{ flex: 1 }}>
                <Tabs 
                  activeKey={tabKey}
                  onChange={setTabKey}
                  style={{ height: '100%' }}
                  items={[
                    {
                      key: "drawing",
                      label: "🗺️ 3D Harita Çizimi",
                      children: (
                        <div style={{ height: '500px' }}>
                          <div style={{ height: '400px', marginBottom: '16px', position: 'relative' }}>
                            {showMap && (
                              <MapboxPlanningComponent
                                center={[35.2433, 38.9637]}
                                zoom={6}
                                onLocationSelect={(coordinates) => console.log('Konum seçildi:', coordinates)}
                                onGpxLoad={(data) => console.log('GPX yüklendi:', data)}
                                onMapDataChange={handleMapDataChange}
                                height="400px"
                                enableDrawing={true}
                              />
                            )}
                          </div>
                          
                          <Alert
                            message={isCollaborating ? "✅ Gerçek Zamanlı İşbirliği Aktif" : "🎨 3D Harita Çizim Araçları"}
                            description={
                              isCollaborating 
                                ? "Harita üzerinde yaptığınız tüm değişiklikler diğer katılımcılarla anında paylaşılıyor. Diğer kullanıcıların değişiklikleri de sizin ekranınızda görünecek."
                                : "3D Mapbox haritası üzerinde çizim araçlarını kullanarak bölgeler, yollar, noktalar işaretleyebilirsiniz. GPX dosyaları yükleyebilir ve 3D terrain görünümünü kullanabilirsiniz."
                            }
                            type={isCollaborating ? "success" : "info"}
                            showIcon
                            icon={isCollaborating ? <LinkOutlined /> : <InfoCircleOutlined />}
                          />
                        </div>
                      )
                    },
                    {
                      key: "notes",
                      label: "📝 Operasyon Notları",
                      children: (
                        <TextArea 
                          placeholder="Operasyon notları ve detaylar..." 
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          rows={15}
                          disabled={!selectedGroup}
                        />
                      )
                    },
                    {
                      key: "chat",
                      label: (
                        <span>
                          <MessageOutlined /> 💬 Konferans Chat
                          {isCollaborating && chatMessages.length > 0 && (
                            <Badge count={chatMessages.length} offset={[5, -5]} size="small" />
                          )}
                        </span>
                      ),
                      children: renderChatMessages()
                    },
                    {
                      key: "call",
                      label: (
                        <span>
                          <PhoneOutlined /> 📹 Görüntülü Konferans
                        </span>
                      ),
                      children: renderCallInterface()
                    }
                  ]}
                />
              </div>
            </Card>
          ) : (
            <Card style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Empty 
                description="🚀 Başlamak için sol taraftan bir görev grubu seçin" 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlanningPage; 