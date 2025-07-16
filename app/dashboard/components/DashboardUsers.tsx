"use client";

import React, { useState, useEffect } from "react";
import { Card, Avatar, List, Badge, Spin, Alert } from "antd";
import { UserOutlined, CheckCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";

interface User {
  id: string;
  name: string;
  role: string;
  status: "online" | "offline" | "busy" | "away";
  lastSeen: string;
  avatar?: string;
  department?: string;
}

interface DashboardUsersProps {
  userRole?: string;
}

const DashboardUsers: React.FC<DashboardUsersProps> = ({ userRole }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Demo kullanıcılar (API bağlantısı olmadığında)
  const demoUsers: User[] = [
    {
      id: "1",
      name: "Ahmet Yılmaz",
      role: "Acil Durum Komutanı",
      status: "online",
      lastSeen: "Şu anda aktif",
      department: "Kriz Yönetimi"
    },
    {
      id: "2",
      name: "Dr. Ayşe Demir",
      role: "Sağlık Ekibi Lideri",
      status: "busy",
      lastSeen: "2 dakika önce",
      department: "Sağlık Hizmetleri"
    },
    {
      id: "3",
      name: "Mehmet Kaya",
      role: "Arama Kurtarma",
      status: "online",
      lastSeen: "Şu anda aktif",
      department: "Saha Operasyonları"
    },
    {
      id: "4",
      name: "Fatma Özkan",
      role: "İletişim Koordinatörü",
      status: "away",
      lastSeen: "5 dakika önce",
      department: "İletişim"
    },
    {
      id: "5",
      name: "Ali Şahin",
      role: "Lojistik Uzmanı",
      status: "online",
      lastSeen: "Şu anda aktif",
      department: "Lojistik"
    },
    {
      id: "6",
      name: "Zeynep Çelik",
      role: "Gönüllü Koordinatörü",
      status: "offline",
      lastSeen: "15 dakika önce",
      department: "Gönüllü Hizmetleri"
    }
  ];

  useEffect(() => {
    const fetchActiveUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        // API'den aktif kullanıcıları getir
        const response = await fetch('/api/users?status=active&limit=10');
        
        if (response.ok) {
          const data = await response.json();
          setUsers(data.users || []);
        } else {
          // API bağlantısı yoksa demo verileri kullan
          console.log('API bağlantısı yok, demo veriler kullanılıyor');
          setUsers(demoUsers);
        }
      } catch (error) {
        console.error('Kullanıcı verileri alınamadı:', error);
        // Hata durumunda demo verileri kullan
        setUsers(demoUsers);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveUsers();

    // Her 30 saniyede bir güncelle
    const interval = setInterval(fetchActiveUsers, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": return "#52c41a";
      case "busy": return "#faad14";
      case "away": return "#fa8c16";
      case "offline": return "#d9d9d9";
      default: return "#d9d9d9";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online": return <CheckCircleOutlined style={{ color: "#52c41a" }} />;
      case "busy": return <ClockCircleOutlined style={{ color: "#faad14" }} />;
      case "away": return <ClockCircleOutlined style={{ color: "#fa8c16" }} />;
      case "offline": return <CheckCircleOutlined style={{ color: "#d9d9d9" }} />;
      default: return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "online": return "Çevrimiçi";
      case "busy": return "Meşgul";
      case "away": return "Uzakta";
      case "offline": return "Çevrimdışı";
      default: return "Bilinmiyor";
    }
  };

  const onlineUsersCount = users.filter(u => u.status === "online").length;

  if (loading) {
    return (
      <Card
        title="Aktif Kullanıcılar"
        size="small"
        style={{ minHeight: "400px" }}
      >
        <div style={{ 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center", 
          height: "300px" 
        }}>
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card
        title="Aktif Kullanıcılar"
        size="small"
        style={{ minHeight: "400px" }}
      >
        <Alert
          message="Veri Yükleme Hatası"
          description={error}
          type="error"
          showIcon
        />
      </Card>
    );
  }

  return (
    <Card
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <UserOutlined />
          Aktif Kullanıcılar
          <Badge count={onlineUsersCount} size="small" />
        </div>
      }
      size="small"
      style={{ minHeight: "400px" }}
      extra={
        <span style={{ fontSize: "12px", color: "#666" }}>
          {users.length} toplam kullanıcı
        </span>
      }
    >
      <List
        dataSource={users}
        renderItem={(user) => (
          <List.Item key={user.id} style={{ padding: "8px 0" }}>
            <List.Item.Meta
              avatar={
                <Badge
                  color={getStatusColor(user.status)}
                  dot
                  offset={[-8, 8]}
                >
                  <Avatar 
                    size="large" 
                    icon={<UserOutlined />}
                    style={{ backgroundColor: "#1890ff" }}
                  >
                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </Avatar>
                </Badge>
              }
              title={
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontWeight: 500 }}>{user.name}</span>
                  {getStatusIcon(user.status)}
                </div>
              }
              description={
                <div>
                  <div style={{ color: "#666", fontSize: "12px", marginBottom: "2px" }}>
                    {user.role}
                  </div>
                  {user.department && (
                    <div style={{ color: "#999", fontSize: "11px", marginBottom: "2px" }}>
                      {user.department}
                    </div>
                  )}
                  <div style={{ color: "#999", fontSize: "11px" }}>
                    <span style={{ color: getStatusColor(user.status) }}>
                      {getStatusText(user.status)}
                    </span>
                    {" • "}{user.lastSeen}
                  </div>
                </div>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  );
};

export default DashboardUsers;
