"use client";

import React, { useState, useEffect } from "react";
import { Card, Badge, List, Avatar, Input, Button, Space, Typography, Spin } from "antd";
import { MessageOutlined, SendOutlined, UserOutlined } from "@ant-design/icons";
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

const { Text } = Typography;

interface ChatMessage {
  id: string;
  sender: string;
  role: string;
  message: string;
  timestamp: string;
  urgent?: boolean;
}

interface DashboardChatProps {
  userRole?: string;
}

const DashboardChat: React.FC<DashboardChatProps> = ({ userRole }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // Demo mesajlar
  const demoMessages: ChatMessage[] = [
    {
      id: '1',
      sender: 'Komutan Yılmaz',
      role: 'Acil Durum Komutanı',
      message: 'Tüm birimler durum raporu versin',
      timestamp: dayjs().subtract(5, 'minute').toISOString(),
      urgent: true
    },
    {
      id: '2',
      sender: 'Birim-1',
      role: 'Saha Ekibi',
      message: 'A sektörü temizlendi, güvenli',
      timestamp: dayjs().subtract(4, 'minute').toISOString()
    },
    {
      id: '3',
      sender: 'Dr. Demir',
      role: 'Sağlık Ekibi',
      message: 'Tıbbi ekip yolda, 5 dakikada orada olacağız',
      timestamp: dayjs().subtract(3, 'minute').toISOString()
    },
    {
      id: '4',
      sender: 'Birim-2',
      role: 'Arama Kurtarma',
      message: 'B sektöründe 2 kişi kurtarıldı, hastaneye sevk edildi',
      timestamp: dayjs().subtract(2, 'minute').toISOString()
    },
    {
      id: '5',
      sender: 'Lojistik Ekibi',
      role: 'Lojistik',
      message: 'Ek malzeme ve su kaynakları hazır',
      timestamp: dayjs().subtract(1, 'minute').toISOString()
    }
  ];

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        
        // API'den mesajları getir
        const response = await fetch('/api/chat/messages?limit=10');
        
        if (response.ok) {
          const data = await response.json();
          setMessages(data.messages || []);
          setUnreadCount(data.unreadCount || 0);
        } else {
          // API bağlantısı yoksa demo verileri kullan
          setMessages(demoMessages);
          setUnreadCount(2);
        }
      } catch (error) {
        console.error('Chat mesajları alınamadı:', error);
        // Hata durumunda demo verileri kullan
        setMessages(demoMessages);
        setUnreadCount(2);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Her 10 saniyede bir güncelle
    const interval = setInterval(fetchMessages, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const messageData = {
        message: newMessage,
        urgent: false,
        timestamp: new Date().toISOString()
      };

      // API'ye mesaj gönder
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData)
      });

      if (response.ok) {
        // Mesaj gönderildi, listeyi güncelle
        const newMsg: ChatMessage = {
          id: Date.now().toString(),
          sender: 'Ben',
          role: userRole === 'admin' ? 'Sistem Yöneticisi' : 
                userRole === 'staff' ? 'Personel' : 'Kullanıcı',
          message: newMessage,
          timestamp: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, newMsg]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Mesaj gönderilemedi:', error);
    }
  };

  const formatTime = (timestamp: string) => {
    return dayjs(timestamp).format('HH:mm');
  };

  const getRoleColor = (role: string) => {
    if (!role || typeof role !== 'string') return '#1890ff';
    
    if (role.includes('Komutan') || role.includes('Yönetici')) return '#ff4d4f';
    if (role.includes('Sağlık') || role.includes('Doktor')) return '#52c41a';
    if (role.includes('Arama') || role.includes('Kurtarma')) return '#fa8c16';
    if (role.includes('Lojistik')) return '#722ed1';
    return '#1890ff';
  };

  if (loading) {
    return (
      <Card
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <MessageOutlined />
            İletişim Sistemi
          </div>
        }
        size="small"
        style={{ minHeight: "300px" }}
      >
        <div style={{ 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center", 
          height: "200px" 
        }}>
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  return (
    <Card
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <MessageOutlined />
          İletişim Sistemi
          {unreadCount > 0 && <Badge count={unreadCount} size="small" />}
        </div>
      }
      size="small"
      style={{ minHeight: "300px" }}
      extra={
        <Text type="secondary" style={{ fontSize: "12px" }}>
          {messages.length} mesaj
        </Text>
      }
    >
      <div style={{ height: "200px", overflowY: "auto", marginBottom: "12px" }}>
        <List
          dataSource={messages}
          renderItem={(message) => (
            <List.Item 
              key={message.id}
              style={{ 
                padding: "4px 0", 
                borderBottom: "none",
                background: message.urgent ? '#fff2f0' : 'transparent',
                borderRadius: message.urgent ? '4px' : '0',
                marginBottom: "4px"
              }}
            >
              <List.Item.Meta
                avatar={
                  <Avatar 
                    size="small" 
                    style={{ 
                      backgroundColor: getRoleColor(message.role),
                      fontSize: "10px"
                    }}
                  >
                    {message.sender.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </Avatar>
                }
                title={
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center" 
                  }}>
                    <Text strong style={{ fontSize: "12px" }}>
                      {message.sender}
                      {message.urgent && <span style={{ color: '#ff4d4f' }}> 🚨</span>}
                    </Text>
                    <Text type="secondary" style={{ fontSize: "10px" }}>
                      {formatTime(message.timestamp)}
                    </Text>
                  </div>
                }
                description={
                  <div>
                    <Text type="secondary" style={{ fontSize: "10px" }}>
                      {message.role}
                    </Text>
                    <div style={{ fontSize: "12px", marginTop: "2px" }}>
                      {message.message}
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </div>

      <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: "8px" }}>
        <Space.Compact style={{ width: "100%" }}>
          <Input
            id="chat-message-input"
            name="chatMessage"
            placeholder="Mesaj yazın..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onPressEnter={handleSendMessage}
            size="small"
          />
          <Button 
            type="primary" 
            icon={<SendOutlined />} 
            onClick={handleSendMessage}
            size="small"
            disabled={!newMessage.trim()}
          />
        </Space.Compact>
      </div>
    </Card>
  );
};

export default DashboardChat;
