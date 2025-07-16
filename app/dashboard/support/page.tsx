"use client";

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, List, Avatar, Badge, Input, Button, Tabs, Typography, Divider, Space, Tag, Empty } from 'antd';
import { 
  SendOutlined, 
  UserOutlined, 
  TeamOutlined, 
  PhoneOutlined, 
  VideoCameraOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PushpinOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;

// Demo verisi - Canlı destek konuşmaları
const conversations = [
  {
    id: 1,
    user: {
      id: 101,
      name: 'Ahmet Yılmaz',
      avatar: 'https://i.pravatar.cc/150?img=1',
      role: 'Vatandaş',
      status: 'online',
      location: 'İstanbul, Kadıköy'
    },
    lastMessage: 'Mahallemizde bir elektrik direği devrildi, acil yardım gerekiyor.',
    unread: 3,
    timestamp: '14:30',
    tags: ['acil', 'elektrik'],
    pinned: true
  },
  {
    id: 2,
    user: {
      id: 102,
      name: 'Ayşe Demir',
      avatar: 'https://i.pravatar.cc/150?img=5',
      role: 'Vatandaş',
      status: 'online',
      location: 'Ankara, Çankaya'
    },
    lastMessage: 'Sel nedeniyle binalar su altında kaldı.',
    unread: 2,
    timestamp: '14:15',
    tags: ['sel', 'acil yardım'],
    pinned: false
  },
  {
    id: 3,
    user: {
      id: 103,
      name: 'Mehmet Kaya',
      avatar: 'https://i.pravatar.cc/150?img=3',
      role: 'İtfaiye',
      status: 'away',
      location: 'İzmir, Konak'
    },
    lastMessage: 'Ekiplerin konumu hakkında bilgi verebilir misiniz?',
    unread: 0,
    timestamp: '13:45',
    tags: ['itfaiye', 'yangın'],
    pinned: false
  },
  {
    id: 4,
    user: {
      id: 104,
      name: 'Fatma Şahin',
      avatar: 'https://i.pravatar.cc/150?img=4',
      role: 'Vatandaş',
      status: 'offline',
      location: 'Bursa, Nilüfer'
    },
    lastMessage: 'Deprem sonrası binamızda çatlaklar oluştu.',
    unread: 0,
    timestamp: 'Dün',
    tags: ['deprem', 'bina'],
    pinned: false
  },
  {
    id: 5,
    user: {
      id: 105,
      name: 'Ali Öztürk',
      avatar: 'https://i.pravatar.cc/150?img=7',
      role: 'Sağlık Ekibi',
      status: 'online',
      location: 'Antalya, Merkez'
    },
    lastMessage: 'Ambulans ekibi bölgeye ulaştı.',
    unread: 1,
    timestamp: 'Dün',
    tags: ['sağlık', 'ambulans'],
    pinned: false
  }
];

// Aktif konuşma mesajları
const activeConversationMessages = [
  { id: 1, sender: 'user', text: 'Mahallemizde bir elektrik direği devrildi, acil yardım gerekiyor.', time: '14:30' },
  { id: 2, sender: 'operator', text: 'Konum bilgisi alabilir miyim?', time: '14:31' },
  { id: 3, sender: 'user', text: 'Atatürk Mahallesi, Gül Sokak No:12 önünde.', time: '14:32' },
  { id: 4, sender: 'operator', text: 'Ekiplerimizi yönlendiriyoruz, lütfen güvenli bir mesafede bekleyiniz.', time: '14:33' },
  { id: 5, sender: 'user', text: 'Teşekkür ederim. Direğin üzerinde elektrik kabloları var, tehlikeli olabilir.', time: '14:34' },
  { id: 6, sender: 'operator', text: 'Elektrik ekibini de bilgilendirdik. Bölgeye en yakın ekip 10 dakika içinde orada olacak.', time: '14:35' },
  { id: 7, sender: 'user', text: 'Tamam, bekliyorum.', time: '14:36' },
  { id: 8, sender: 'operator', text: 'Şu anda çevrede yaralı veya mahsur kalan var mı?', time: '14:38' },
  { id: 9, sender: 'user', text: 'Hayır, şu an için yok. Yoldan geçen araçlar için tehlikeli olabilir.', time: '14:39' },
  { id: 10, sender: 'operator', text: 'Trafik ekibini de bilgilendirdik. Bölgeye yönlendiriyorlar.', time: '14:40' }
];

// Kullanıcı durumu badge'i
const getStatusBadge = (status: string) => {
  switch(status) {
    case 'online':
      return <Badge status="success" text="Çevrimiçi" />;
    case 'away':
      return <Badge status="warning" text="Uzakta" />;
    case 'offline':
      return <Badge status="default" text="Çevrimdışı" />;
    default:
      return <Badge status="processing" text="Bilinmiyor" />;
  }
};

// Sayfanın ana bileşeni
const SupportPage: React.FC = () => {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState('active');
  const [activeConversation, setActiveConversation] = useState(conversations[0]);
  const [newMessage, setNewMessage] = useState('');
  
  // Oturum yükleniyor durumu
  if (status === "loading") {
    return <div>Yükleniyor...</div>;
  }
  
  // Kullanıcı bilgisi
  const user = session?.user;
  
  const handleSendMessage = () => {
    if (newMessage.trim() === '') return;
    
    // Gerçek bir uygulamada burada mesaj gönderme işlemi yapılır
    console.log('Gönderilen mesaj:', newMessage);
    setNewMessage('');
  };
  
  const renderChatList = () => {
    const filteredConversations = activeTab === 'active'
      ? conversations.filter(c => c.user.status !== 'offline')
      : conversations;
      
    const sortedConversations = [...filteredConversations].sort((a, b) => {
      // Önce sabitlenmiş olanlar
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      
      // Sonra okunmamış mesajlar
      if (a.unread > 0 && b.unread === 0) return -1;
      if (a.unread === 0 && b.unread > 0) return 1;
      
      // En son gelen mesajlar en üstte
      return 0;
    });
    
    if (sortedConversations.length === 0) {
      return <Empty description="Konuşma bulunamadı" />;
    }
    
    return (
      <List
        dataSource={sortedConversations}
        renderItem={conversation => (
          <List.Item 
            key={conversation.id}
            onClick={() => setActiveConversation(conversation)}
            className={`cursor-pointer hover:bg-gray-50 p-2 ${activeConversation.id === conversation.id ? 'bg-blue-50' : ''}`}
          >
            <List.Item.Meta
              avatar={
                <Badge count={conversation.unread} size="small">
                  <Avatar src={conversation.user.avatar} size="large" />
                </Badge>
              }
              title={
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{conversation.user.name}</span>
                    {conversation.pinned && <PushpinOutlined className="text-blue-500" />}
                  </div>
                  <Text type="secondary" className="text-xs">{conversation.timestamp}</Text>
                </div>
              }
              description={
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Tag color="blue">{conversation.user.role}</Tag>
                    <Text type="secondary" className="text-xs truncate">{conversation.user.location}</Text>
                  </div>
                  <div className="truncate">{conversation.lastMessage}</div>
                  <div className="mt-1">
                    {conversation.tags.map(tag => (
                      <Tag key={tag} className="mr-1">{tag}</Tag>
                    ))}
                  </div>
                </div>
              }
            />
          </List.Item>
        )}
      />
    );
  };
  
  const renderChatWindow = () => {
    if (!activeConversation) {
      return <Empty description="Lütfen bir konuşma seçin" />;
    }
    
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Avatar src={activeConversation.user.avatar} size="large" />
              <div>
                <div className="flex items-center gap-2">
                  <Title level={5} className="mb-0">{activeConversation.user.name}</Title>
                  <Tag color="blue">{activeConversation.user.role}</Tag>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(activeConversation.user.status)}
                  <Text type="secondary" className="text-xs">{activeConversation.user.location}</Text>
                </div>
              </div>
            </div>
            <Space>
              <Button type="text" icon={<PhoneOutlined />} />
              <Button type="text" icon={<VideoCameraOutlined />} />
              <Button type="text" icon={<PushpinOutlined />} />
            </Space>
          </div>
        </div>
        
        <div className="flex-grow p-4 overflow-auto">
          {activeConversationMessages.map(message => (
            <div
              key={message.id}
              className={`mb-4 max-w-3/4 ${message.sender === 'operator' ? 'ml-auto' : ''}`}
            >
              <div className={`p-3 rounded-lg ${message.sender === 'operator' ? 'bg-blue-100 text-right' : 'bg-gray-100'}`}>
                <div className="text-sm">{message.text}</div>
                <div className="text-xs text-gray-500 mt-1">{message.time}</div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-4 border-t">
          <div className="flex items-end">
            <TextArea
              placeholder="Mesajınızı yazın..."
              autoSize={{ minRows: 2, maxRows: 4 }}
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              className="flex-grow"
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSendMessage}
              className="ml-2"
            >
              Gönder
            </Button>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>Canlı Destek</Title>
        <Space>
          <Button icon={<SyncOutlined />}>Yenile</Button>
          <Button icon={<CheckCircleOutlined />} type="primary">Okundu İşaretle</Button>
          <Button icon={<CloseCircleOutlined />} danger>Kapat</Button>
        </Space>
      </div>
      
      <div className="flex h-[calc(100vh-200px)]">
        <div className="w-1/3 border-r">
          <div className="p-4 border-b">
            <ChatTabs activeTab={activeTab} setActiveTab={setActiveTab} />
            <Input 
              placeholder="Ara..." 
              prefix={<UserOutlined />} 
              className="mt-4"
            />
          </div>
          <div className="overflow-auto h-[calc(100%-100px)]">
            {renderChatList()}
          </div>
        </div>
        
        <div className="w-2/3">
          {renderChatWindow()}
        </div>
      </div>
    </div>
  );
};

// Chat listesi alanı
const ChatTabs = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: string) => void }) => {
  return (
    <Tabs 
      activeKey={activeTab}
      onChange={setActiveTab}
      className="mb-0"
      items={[
        {
          key: 'active',
          label: 'Aktif Konuşmalar'
        },
        {
          key: 'all',
          label: 'Tüm Konuşmalar'
        },
        {
          key: 'archive',
          label: 'Arşiv'
        }
      ]}
    />
  );
};

export default SupportPage; 