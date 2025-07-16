"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Layout, 
  List, 
  Input, 
  Button, 
  Avatar, 
  Typography, 
  Divider, 
  Card, 
  Badge, 
  Tag, 
  Tooltip, 
  Dropdown, 
  Menu, 
  Empty, 
  Spin,
  Modal,
  Form,
  Select,
  Tabs
} from 'antd';
import {
  SendOutlined,
  UserOutlined,
  MoreOutlined,
  PlusOutlined,
  TeamOutlined,
  BellOutlined,
  MessageOutlined,
  WarningOutlined,
  SearchOutlined,
  DeleteOutlined,
  FileImageOutlined,
  LinkOutlined,
  SmileOutlined,
  FileOutlined,
  PaperClipOutlined,
  LockOutlined,
  SoundOutlined,
  VideoCameraOutlined,
  EnvironmentOutlined,
  GlobalOutlined
} from '@ant-design/icons';
import { useSession } from 'next-auth/react';
import { 
  createMessage, 
  getRoomsForUser, 
  getMessagesForRoom, 
  markMessagesAsRead, 
  createDemoRooms, 
  getNotificationsForUser,
  createRoom,
  addParticipantToRoom
} from '../../lib/chat';
import { 
  ChatMessage, 
  ChatRoom, 
  ChatRoomType, 
  MessageStatus, 
  ChatParticipant 
} from '../../types/chat';
import { UserRole } from '../../types/user';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Search } = Input;
const { Sider, Content } = Layout;

// Emoji picker karakterleri
const emojis = ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩", "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣", "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬", "🤯", "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓", "🤗", "🤔", "🤭", "🤫", "🤥", "😶", "😐", "😑", "😬", "🙄", "😯", "😦", "😧", "😮", "😲", "🥱", "😴", "🤤", "😪", "😵", "🤐", "🥴", "🤢", "🤮", "🤧", "😷", "🤒", "🤕"];

// Oda tipi simgeleri
const roomTypeIcons = {
  [ChatRoomType.DIRECT]: <MessageOutlined />,
  [ChatRoomType.GROUP]: <TeamOutlined />,
  [ChatRoomType.EMERGENCY]: <WarningOutlined />,
  [ChatRoomType.ANNOUNCEMENT]: <BellOutlined />,
};

// Oda tipi adları
const roomTypeNames = {
  [ChatRoomType.DIRECT]: 'Özel Mesaj',
  [ChatRoomType.GROUP]: 'Grup',
  [ChatRoomType.EMERGENCY]: 'Acil Durum',
  [ChatRoomType.ANNOUNCEMENT]: 'Duyuru',
};

// Oda tipi renkler - satır 276'daki hata için kullanılacak
const roomTypeColors: Record<ChatRoomType, string> = {
  [ChatRoomType.DIRECT]: '#1890ff',
  [ChatRoomType.GROUP]: '#52c41a',
  [ChatRoomType.EMERGENCY]: '#f5222d',
  [ChatRoomType.ANNOUNCEMENT]: '#722ed1'
};

const ChatPage = () => {
  const { data: session, status } = useSession();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [messageInput, setMessageInput] = useState<string>('');
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [showEmojis, setShowEmojis] = useState<boolean>(false);
  const [newRoomModalVisible, setNewRoomModalVisible] = useState<boolean>(false);
  const [newRoomForm] = Form.useForm();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  
  // Mesaj göndermek için input
  const messageInputRef = useRef<any>(null);

  // İlk yükleme
  useEffect(() => {
    const initializeChat = async () => {
      setLoading(true);
      
      // Demo odaları oluştur
      createDemoRooms();
      
      if (session?.user?.id) {
        // Kullanıcı odalarını al
        const userRooms = getRoomsForUser(session.user.id);
        setRooms(userRooms);
        
        // Bildirimleri al
        const userNotifications = getNotificationsForUser(session.user.id);
        setNotifications(userNotifications);
        
        // Varsayılan olarak ilk odayı seç (varsa)
        if (userRooms.length > 0) {
          setSelectedRoom(userRooms[0]);
          
          // Oda mesajlarını al
          const roomMessages = getMessagesForRoom(userRooms[0].id);
          setMessages(roomMessages);
          
          // Mesajları okundu olarak işaretle
          markMessagesAsRead(session.user.id, userRooms[0].id);
        }
      }
      
      setLoading(false);
    };
    
    if (status === 'authenticated') {
      initializeChat();
    }
  }, [status, session]);
  
  // Oda değiştiğinde mesajları güncelle ve okundu olarak işaretle
  useEffect(() => {
    if (selectedRoom && session?.user?.id) {
      const roomMessages = getMessagesForRoom(selectedRoom.id);
      setMessages(roomMessages);
      
      // Mesajları okundu olarak işaretle
      markMessagesAsRead(session.user.id, selectedRoom.id);
      
      // Odaları yeniden yükle (okunmamış mesaj sayısını güncellemek için)
      const updatedRooms = getRoomsForUser(session.user.id);
      setRooms(updatedRooms);
      
      // Bildirimleri güncelle
      const updatedNotifications = getNotificationsForUser(session.user.id);
      setNotifications(updatedNotifications);
    }
  }, [selectedRoom, session]);
  
  // Mesajlar güncellendiğinde sohbet penceresini en alta kaydır
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Mesaj gönder
  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedRoom || !session?.user) return;
    
    // Yeni mesaj oluştur
    const newMessage = createMessage(
      selectedRoom.id,
      session.user.id,
      session.user.name || 'Kullanıcı',
      session.user.role,
      messageInput,
      {
        senderImage: session.user.image || undefined,
      }
    );
    
    // Mesajları güncelle
    setMessages([...messages, newMessage]);
    
    // Input'u temizle
    setMessageInput('');
    
    // Emoji picker'ı kapat
    setShowEmojis(false);
    
    // Input'a odaklan
    messageInputRef.current?.focus();
  };
  
  // Enter tuşu ile mesaj gönder
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Emoji ekle
  const handleEmojiClick = (emoji: string) => {
    setMessageInput(prev => prev + emoji);
    messageInputRef.current?.focus();
  };
  
  // Oda seç
  const handleRoomSelect = (room: ChatRoom) => {
    setSelectedRoom(room);
  };
  
  // Yeni oda oluştur
  const handleCreateRoom = (values: any) => {
    if (!session?.user) return;
    
    const { roomName, roomType, participants } = values;
    
    // Katılımcıları oluştur
    const roomParticipants: ChatParticipant[] = [
      {
        userId: session.user.id,
        userName: session.user.name || 'Kullanıcı',
        userRole: session.user.role,
        userImage: session.user.image || undefined,
        joinedAt: new Date(),
        isAdmin: true,
        hasUnreadMessages: false,
        unreadCount: 0,
        status: 'online',
        lastSeen: new Date()
      }
    ];
    
    // Seçilen katılımcıları ekle
    participants.forEach((userId: string) => {
      // Demo kullanıcılar (gerçek uygulamada API'den alınır)
      const demoUsers = [
        { id: '1', name: 'Admin Kullanıcı', role: UserRole.ADMIN, image: '/avatars/admin.png' },
        { id: '2', name: 'Yönetici Kullanıcı', role: UserRole.MANAGER, image: '/avatars/manager.png' },
        { id: '3', name: 'Personel Kullanıcı', role: UserRole.PERSONNEL, image: '/avatars/personnel.png' },
        { id: '4', name: 'Vatandaş Kullanıcı', role: UserRole.USER, image: '/avatars/user.png' },
      ];
      
      const user = demoUsers.find(u => u.id === userId);
      if (user && user.id !== session.user.id) {
        roomParticipants.push({
          userId: user.id,
          userName: user.name,
          userRole: user.role,
          userImage: user.image,
          joinedAt: new Date(),
          isAdmin: false,
          hasUnreadMessages: true,
          unreadCount: 0,
          status: 'offline',
          lastSeen: new Date()
        });
      }
    });
    
    // Odayı oluştur
    const newRoom = createRoom(
      roomName,
      roomType,
      session.user.id,
      roomParticipants,
      {
        description: `${roomTypeNames[roomType as keyof typeof roomTypeNames]} - ${roomName}`,
        icon: roomType === ChatRoomType.EMERGENCY ? '🚨' : 
              roomType === ChatRoomType.ANNOUNCEMENT ? '📢' : 
              roomType === ChatRoomType.GROUP ? '👥' : '💬'
      }
    );
    
    // Odalar listesini güncelle
    setRooms(prevRooms => [newRoom, ...prevRooms]);
    
    // Yeni odayı seç
    setSelectedRoom(newRoom);
    
    // Modal'ı kapat ve formu temizle
    setNewRoomModalVisible(false);
    newRoomForm.resetFields();
  };
  
  // Odaları filtrele
  const filteredRooms = rooms.filter(room => 
    room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.participants.some(p => p.userName.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const tabItems = [
    {
      key: 'chats',
      label: 'Sohbetler',
      children: (
        <List
          dataSource={filteredRooms}
          renderItem={(room) => (
            <List.Item
              onClick={() => handleRoomSelect(room)}
              style={{
                cursor: 'pointer',
                backgroundColor: selectedRoom?.id === room.id ? '#f0f0f0' : 'transparent',
                padding: '8px 16px',
              }}
            >
              <List.Item.Meta
                avatar={
                  <Badge count={room.unreadCount} offset={[-5, 5]}>
                    <Avatar
                      icon={roomTypeIcons[room.type]}
                      style={{ backgroundColor: roomTypeColors[room.type] }}
                    />
                  </Badge>
                }
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{room.name}</span>
                    <Tag color={roomTypeColors[room.type]}>{roomTypeNames[room.type]}</Tag>
                  </div>
                }
                description={
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{room.lastMessage?.content || 'Henüz mesaj yok'}</span>
                    <span>{room.lastMessage?.timestamp ? dayjs(room.lastMessage.timestamp).format('HH:mm') : ''}</span>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )
    },
    {
      key: 'notifications',
      label: 'Bildirimler',
      children: (
        <List
          dataSource={notifications}
          renderItem={(notification) => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar icon={<BellOutlined />} />}
                title={notification.title}
                description={notification.content}
              />
            </List.Item>
          )}
        />
      )
    }
  ];
  
  // Yükleniyor durumu
  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" tip="Mesajlar yükleniyor...">
          <div className="p-16">Yükleniyor...</div>
        </Spin>
      </div>
    );
  }
  
  // Kimlik doğrulama kontrolü
  if (status === 'unauthenticated') {
    return (
      <div className="p-8">
        <Card>
          <Empty
            description={
              <Text strong>
                Bu sayfayı görüntülemek için giriş yapmalısınız.
              </Text>
            }
          />
        </Card>
      </div>
    );
  }
  
  return (
    <div className="chat-container">
      <Title level={2}>Mesajlaşma</Title>
      <Divider />
      
      <Layout className="chat-layout" style={{ background: '#fff', borderRadius: 8, overflow: 'hidden', height: 'calc(100vh - 250px)' }}>
        <Sider width={300} theme="light" style={{ borderRight: '1px solid #f0f0f0', overflow: 'auto' }}>
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <Title level={4} style={{ margin: 0 }}>Sohbetler</Title>
              <Tooltip title="Yeni Sohbet">
                <Button
                  type="primary"
                  shape="circle"
                  icon={<PlusOutlined />}
                  onClick={() => setNewRoomModalVisible(true)}
                />
              </Tooltip>
            </div>
            
            <Search
              placeholder="Sohbet ara..."
              onChange={e => setSearchTerm(e.target.value)}
              style={{ marginBottom: 16 }}
              allowClear
            />
            
            <Tabs items={tabItems} />
          </div>
        </Sider>
        
        <Content style={{ display: 'flex', flexDirection: 'column', padding: 0 }}>
          {selectedRoom ? (
            <>
              {/* Sohbet başlığı */}
              <div className="p-4 border-b" style={{ background: '#fafafa' }}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Avatar 
                      size="large" 
                      style={{ 
                        backgroundColor: selectedRoom.type === ChatRoomType.EMERGENCY ? '#f5222d' : 
                          selectedRoom.type === ChatRoomType.ANNOUNCEMENT ? '#fa8c16' : 
                          selectedRoom.type === ChatRoomType.GROUP ? '#1890ff' : '#52c41a' 
                      }}
                      icon={roomTypeIcons[selectedRoom.type]}
                    >
                      {selectedRoom.icon}
                    </Avatar>
                    <div className="ml-3">
                      <Title level={5} style={{ margin: 0 }}>{selectedRoom.name}</Title>
                      <div>
                        <Tag color={roomTypeColors[selectedRoom.type]} className="room-type-tag">
                          {roomTypeNames[selectedRoom.type]}
                        </Tag>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {selectedRoom.participants.length} katılımcı • 
                          {' '}
                          {selectedRoom.participants.filter(p => p.status === 'online').length} çevrimiçi
                        </Text>
                      </div>
                    </div>
                  </div>
                  
                  <Dropdown 
                    menu={{ 
                      items: [
                        { key: '1', label: 'Katılımcıları Görüntüle', icon: <TeamOutlined /> },
                        { key: '2', label: 'Sohbette Ara', icon: <SearchOutlined /> },
                        { key: '3', label: 'Bildirimleri Kapat', icon: <BellOutlined /> },
                        { key: '4', label: 'Sohbeti Arşivle', icon: <DeleteOutlined /> },
                      ] 
                    }} 
                    trigger={['click']}
                  >
                    <Button type="text" icon={<MoreOutlined />} />
                  </Dropdown>
                </div>
              </div>
              
              {/* Mesaj listesi */}
              <div 
                className="flex-1 p-4 overflow-auto"
                style={{ height: 'calc(100% - 140px)', overflowY: 'auto' }}
                ref={messageContainerRef}
              >
                {messages.length === 0 ? (
                  <Empty description="Henüz mesaj yok" />
                ) : (
                  <List
                    itemLayout="horizontal"
                    dataSource={messages}
                    renderItem={message => {
                      const isCurrentUser = message.senderId === session?.user.id;
                      const showAvatar = !isCurrentUser && !message.isSystemMessage;
                      
                      return (
                        <List.Item
                          style={{ 
                            padding: '8px 0',
                            display: 'flex',
                            justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
                          }}
                        >
                          {message.isSystemMessage ? (
                            <Card 
                              size="small" 
                              style={{ 
                                maxWidth: '80%', 
                                backgroundColor: '#f5f5f5',
                                borderRadius: 8,
                                margin: '0 auto',
                                textAlign: 'center'
                              }}
                            >
                              <Text type="secondary" italic>
                                {message.content}
                              </Text>
                            </Card>
                          ) : (
                            <div 
                              style={{ 
                                display: 'flex', 
                                flexDirection: isCurrentUser ? 'row-reverse' : 'row',
                                alignItems: 'flex-start'
                              }}
                            >
                              {showAvatar && (
                                <Avatar 
                                  src={message.senderImage} 
                                  icon={<UserOutlined />}
                                  style={{ marginRight: isCurrentUser ? 0 : 12, marginLeft: isCurrentUser ? 12 : 0 }}
                                />
                              )}
                              
                              <div>
                                {!isCurrentUser && !message.isSystemMessage && (
                                  <div style={{ marginBottom: 4 }}>
                                    <Text strong>{message.senderName}</Text>
                                    <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
                                      {dayjs(message.timestamp).format('HH:mm')}
                                    </Text>
                                  </div>
                                )}
                                
                                <Card 
                                  size="small"
                                  style={{ 
                                    maxWidth: 500,
                                    backgroundColor: isCurrentUser ? '#e6f7ff' : '#fff',
                                    borderRadius: 8
                                  }}
                                >
                                  <div>
                                    <Text>{message.content}</Text>
                                    {isCurrentUser && (
                                      <div style={{ textAlign: 'right', marginTop: 4 }}>
                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                          {dayjs(message.timestamp).format('HH:mm')}
                                        </Text>
                                      </div>
                                    )}
                                  </div>
                                </Card>
                              </div>
                            </div>
                          )}
                        </List.Item>
                      );
                    }}
                  />
                )}
                <div ref={messagesEndRef} />
              </div>
              
              {/* Mesaj gönderme alanı */}
              <div className="p-4 border-t">
                {showEmojis && (
                  <div 
                    style={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      maxHeight: 120, 
                      overflowY: 'auto',
                      padding: '8px',
                      background: '#f5f5f5',
                      borderRadius: 8,
                      marginBottom: 8
                    }}
                  >
                    {emojis.map(emoji => (
                      <Button
                        key={emoji}
                        type="text"
                        style={{ margin: 2, fontSize: 18, height: 36, padding: '0 4px' }}
                        onClick={() => handleEmojiClick(emoji)}
                      >
                        {emoji}
                      </Button>
                    ))}
                  </div>
                )}
                
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ display: 'flex', marginRight: 8 }}>
                    <Tooltip title="Dosya ekle">
                      <Button type="text" icon={<PaperClipOutlined />} />
                    </Tooltip>
                    <Tooltip title="Emoji">
                      <Button 
                        type="text" 
                        icon={<SmileOutlined />} 
                        onClick={() => setShowEmojis(!showEmojis)}
                      />
                    </Tooltip>
                  </div>
                  
                  <Input
                    ref={messageInputRef}
                    placeholder="Mesajınızı yazın..."
                    value={messageInput}
                    onChange={e => setMessageInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    style={{ flex: 1 }}
                    suffix={
                      <Tooltip title="Gönder">
                        <Button 
                          type="primary" 
                          shape="circle" 
                          icon={<SendOutlined />} 
                          size="small"
                          onClick={handleSendMessage}
                          disabled={!messageInput.trim()}
                        />
                      </Tooltip>
                    }
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <Empty 
                description="Sohbet başlatmak için sol taraftan bir oda seçin veya yeni bir sohbet oluşturun"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </div>
          )}
        </Content>
      </Layout>
      
      {/* Yeni oda oluşturma modal'ı */}
      <Modal
        title="Yeni Sohbet Oluştur"
        open={newRoomModalVisible}
        onCancel={() => setNewRoomModalVisible(false)}
        footer={null}
      >
        <Form
          form={newRoomForm}
          layout="vertical"
          onFinish={handleCreateRoom}
          initialValues={{
            roomType: ChatRoomType.DIRECT
          }}
        >
          <Form.Item
            name="roomName"
            label="Sohbet Adı"
            rules={[{ required: true, message: 'Lütfen sohbet adı girin' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="roomType"
            label="Sohbet Tipi"
            rules={[{ required: true }]}
          >
            <Select>
              <Select.Option value={ChatRoomType.DIRECT}>Özel Mesaj</Select.Option>
              <Select.Option value={ChatRoomType.GROUP}>Grup</Select.Option>
              {(session?.user.role === UserRole.ADMIN || session?.user.role === UserRole.MANAGER) && (
                <>
                  <Select.Option value={ChatRoomType.EMERGENCY}>Acil Durum</Select.Option>
                  <Select.Option value={ChatRoomType.ANNOUNCEMENT}>Duyuru</Select.Option>
                </>
              )}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="participants"
            label="Katılımcılar"
            rules={[{ required: true, message: 'En az bir katılımcı seçin' }]}
          >
            <Select mode="multiple" placeholder="Katılımcıları seçin">
              <Select.Option value="1">Admin Kullanıcı</Select.Option>
              <Select.Option value="2">Yönetici Kullanıcı</Select.Option>
              <Select.Option value="3">Personel Kullanıcı</Select.Option>
              <Select.Option value="4">Vatandaş Kullanıcı</Select.Option>
            </Select>
          </Form.Item>
          
          <div style={{ textAlign: 'right' }}>
            <Button 
              style={{ marginRight: 8 }} 
              onClick={() => setNewRoomModalVisible(false)}
            >
              İptal
            </Button>
            <Button type="primary" htmlType="submit">
              Oluştur
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default ChatPage; 