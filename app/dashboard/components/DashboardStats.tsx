"use client";

import React, { useState, useEffect } from "react";
import { Card, Statistic, Row, Col, Typography, Space, Spin, Alert } from "antd";
import { 
  TeamOutlined, 
  BellOutlined, 
  CheckCircleOutlined, 
  ExclamationCircleOutlined,
  UserOutlined,
  DatabaseOutlined,
  ToolOutlined,
  HomeOutlined,
  ReloadOutlined
} from "@ant-design/icons";

const { Text } = Typography;

interface DashboardStatsProps {
  userRole: string;
}

interface StatsData {
  totalPersonnel: number;
  activeAlerts: number;
  completedTasks: number;
  pendingTasks: number;
  onlineUsers: number;
  warehouses: number;
  equipment: number;
  inventory: number;
  responseTime: number;
  successRate: number;
  activeIncidents: number;
  resolvedToday: number;
  totalUsers: number;
  activeVolunteers: number;
  totalNotifications: number;
  urgentNotifications: number;
}

const DashboardStats = ({ userRole }: DashboardStatsProps) => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Demo veriler (API bağlantısı olmadığında)
  const demoStats: StatsData = {
    totalPersonnel: 156,
    activeAlerts: 3,
    completedTasks: 24,
    pendingTasks: 8,
    onlineUsers: 45,
    warehouses: 12,
    equipment: 1247,
    inventory: 3450,
    responseTime: 8.5,
    successRate: 94.2,
    activeIncidents: 2,
    resolvedToday: 7,
    totalUsers: 89,
    activeVolunteers: 23,
    totalNotifications: 156,
    urgentNotifications: 5
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Paralel API çağrıları
      const [
        usersResponse,
        notificationsResponse,
        tasksResponse,
        equipmentResponse,
        warehouseResponse
      ] = await Promise.allSettled([
        fetch('/api/users/stats'),
        fetch('/api/notifications/stats'),
        fetch('/api/tasks/stats'),
        fetch('/api/equipment/stats'),
        fetch('/api/warehouse/stats')
      ]);

      // API yanıtlarını işle
      let statsData: StatsData = { ...demoStats };

      // Kullanıcı istatistikleri
      if (usersResponse.status === 'fulfilled' && usersResponse.value.ok) {
        const userData = await usersResponse.value.json();
        const userStats = userData.stats || {};
        statsData.totalPersonnel = userStats.total || demoStats.totalPersonnel;
        statsData.onlineUsers = userStats.active || demoStats.onlineUsers;
        statsData.totalUsers = userStats.total || demoStats.totalUsers;
        statsData.activeVolunteers = userStats.volunteer || demoStats.activeVolunteers;
      }

      // Bildirim istatistikleri
      if (notificationsResponse.status === 'fulfilled' && notificationsResponse.value.ok) {
        const notificationData = await notificationsResponse.value.json();
        const notificationStats = notificationData.stats || {};
        statsData.activeAlerts = notificationStats.unread || demoStats.activeAlerts;
        statsData.totalNotifications = notificationStats.all || demoStats.totalNotifications;
        statsData.urgentNotifications = notificationStats.error || demoStats.urgentNotifications;
      }

      // Görev istatistikleri
      if (tasksResponse.status === 'fulfilled' && tasksResponse.value.ok) {
        const taskData = await tasksResponse.value.json();
        const taskStats = taskData.stats || {};
        statsData.completedTasks = taskStats.completed || demoStats.completedTasks;
        statsData.pendingTasks = taskStats.pending || demoStats.pendingTasks;
        statsData.activeIncidents = taskStats.in_progress || demoStats.activeIncidents;
        statsData.resolvedToday = taskStats.completed || demoStats.resolvedToday;
      }

      // Ekipman istatistikleri
      if (equipmentResponse.status === 'fulfilled' && equipmentResponse.value.ok) {
        const equipmentData = await equipmentResponse.value.json();
        const equipmentStats = equipmentData.stats || {};
        statsData.equipment = equipmentStats.total || demoStats.equipment;
      }

      // Depo istatistikleri
      if (warehouseResponse.status === 'fulfilled' && warehouseResponse.value.ok) {
        const warehouseData = await warehouseResponse.value.json();
        const warehouseStats = warehouseData.stats || {};
        statsData.warehouses = warehouseStats.total_warehouses || demoStats.warehouses;
        statsData.inventory = warehouseStats.total_inventory || demoStats.inventory;
      }

      setStats(statsData);
      setLastUpdated(new Date());

    } catch (error) {
      console.error('İstatistik verileri alınamadı:', error);
      setError('Veriler yüklenirken hata oluştu');
      // Hata durumunda demo verileri kullan
      setStats(demoStats);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Her 2 dakikada bir güncelle
    const interval = setInterval(fetchStats, 120000);

    return () => clearInterval(interval);
  }, [userRole]);

  const cardStyle = {
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
  };

  if (loading && !stats) {
    return (
      <Card style={{ ...cardStyle, textAlign: 'center', padding: '40px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>
          <Text>İstatistikler yükleniyor...</Text>
        </div>
      </Card>
    );
  }

  if (error && !stats) {
    return (
      <Card style={cardStyle}>
        <Alert
          message="Veri Yükleme Hatası"
          description={error}
          type="error"
          showIcon
          action={
            <button onClick={fetchStats}>
              Tekrar Dene
            </button>
          }
        />
      </Card>
    );
  }

  const currentStats = stats || demoStats;

  return (
    <div>
      {/* Başlık ve Son Güncelleme */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '16px' 
      }}>
        <Text strong style={{ fontSize: '18px' }}>
          Sistem İstatistikleri
        </Text>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Son güncelleme: {lastUpdated.toLocaleTimeString('tr-TR')}
          </Text>
          <ReloadOutlined 
            style={{ cursor: 'pointer', color: '#1890ff' }}
            onClick={fetchStats}
            spin={loading}
          />
        </div>
      </div>

      {/* Ana İstatistikler */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} lg={6}>
          <Card style={cardStyle}>
            <Statistic
              title={
                <Space>
                  <TeamOutlined style={{ color: "#1890ff" }} />
                  <Text>Toplam Personel</Text>
                </Space>
              }
              value={currentStats.totalPersonnel}
              valueStyle={{ 
                color: "#3f8600", 
                fontSize: "28px", 
                fontWeight: "bold" 
              }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card style={cardStyle}>
            <Statistic
              title={
                <Space>
                  <BellOutlined style={{ color: "#ff4d4f" }} />
                  <Text>Aktif Uyarılar</Text>
                </Space>
              }
              value={currentStats.activeAlerts}
              valueStyle={{ 
                color: "#cf1322", 
                fontSize: "28px", 
                fontWeight: "bold" 
              }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card style={cardStyle}>
            <Statistic
              title={
                <Space>
                  <CheckCircleOutlined style={{ color: "#52c41a" }} />
                  <Text>Tamamlanan Görevler</Text>
                </Space>
              }
              value={currentStats.completedTasks}
              valueStyle={{ 
                color: "#3f8600", 
                fontSize: "28px", 
                fontWeight: "bold" 
              }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card style={cardStyle}>
            <Statistic
              title={
                <Space>
                  <ExclamationCircleOutlined style={{ color: "#fa8c16" }} />
                  <Text>Bekleyen Görevler</Text>
                </Space>
              }
              value={currentStats.pendingTasks}
              valueStyle={{ 
                color: "#fa8c16", 
                fontSize: "28px", 
                fontWeight: "bold" 
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Admin/Yönetici İstatistikleri */}
      {(userRole === "admin" || userRole === "manager" || userRole === "regional_manager") && (
        <>
          <Text 
            strong 
            style={{ 
              fontSize: "16px", 
              marginBottom: "16px", 
              display: "block" 
            }}
          >
            Detaylı Performans Metrikleri
          </Text>
          
          <Row gutter={[16, 16]} style={{ marginBottom: "16px" }}>
            <Col xs={24} sm={12} lg={6}>
              <Card style={cardStyle}>
                <Statistic
                  title={
                    <Space>
                      <UserOutlined style={{ color: "#722ed1" }} />
                      <Text>Çevrimiçi Kullanıcılar</Text>
                    </Space>
                  }
                  value={currentStats.onlineUsers}
                  suffix={`/ ${currentStats.totalUsers}`}
                  valueStyle={{ 
                    color: "#722ed1", 
                    fontSize: "24px", 
                    fontWeight: "bold" 
                  }}
                />
              </Card>
            </Col>
            
            <Col xs={24} sm={12} lg={6}>
              <Card style={cardStyle}>
                <Statistic
                  title={
                    <Space>
                      <HomeOutlined style={{ color: "#13c2c2" }} />
                      <Text>Aktif Depolar</Text>
                    </Space>
                  }
                  value={currentStats.warehouses}
                  valueStyle={{ 
                    color: "#13c2c2", 
                    fontSize: "24px", 
                    fontWeight: "bold" 
                  }}
                />
              </Card>
            </Col>
            
            <Col xs={24} sm={12} lg={6}>
              <Card style={cardStyle}>
                <Statistic
                  title={
                    <Space>
                      <ToolOutlined style={{ color: "#eb2f96" }} />
                      <Text>Toplam Ekipman</Text>
                    </Space>
                  }
                  value={currentStats.equipment}
                  valueStyle={{ 
                    color: "#eb2f96", 
                    fontSize: "24px", 
                    fontWeight: "bold" 
                  }}
                />
              </Card>
            </Col>
            
            <Col xs={24} sm={12} lg={6}>
              <Card style={cardStyle}>
                <Statistic
                  title={
                    <Space>
                      <DatabaseOutlined style={{ color: "#52c41a" }} />
                      <Text>Envanter Kalemleri</Text>
                    </Space>
                  }
                  value={currentStats.inventory}
                  valueStyle={{ 
                    color: "#52c41a", 
                    fontSize: "24px", 
                    fontWeight: "bold" 
                  }}
                />
              </Card>
            </Col>
          </Row>

          {/* Ek Performans Metrikleri */}
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <Card style={cardStyle}>
                <Statistic
                  title="Ortalama Müdahale Süresi"
                  value={currentStats.responseTime}
                  suffix="dk"
                  precision={1}
                  valueStyle={{ 
                    color: currentStats.responseTime <= 10 ? "#52c41a" : "#fa8c16", 
                    fontSize: "20px", 
                    fontWeight: "bold" 
                  }}
                />
              </Card>
            </Col>
            
            <Col xs={24} sm={12} lg={6}>
              <Card style={cardStyle}>
                <Statistic
                  title="Başarı Oranı"
                  value={currentStats.successRate}
                  suffix="%"
                  precision={1}
                  valueStyle={{ 
                    color: currentStats.successRate >= 90 ? "#52c41a" : "#fa8c16", 
                    fontSize: "20px", 
                    fontWeight: "bold" 
                  }}
                />
              </Card>
            </Col>
            
            <Col xs={24} sm={12} lg={6}>
              <Card style={cardStyle}>
                <Statistic
                  title="Aktif Olaylar"
                  value={currentStats.activeIncidents}
                  valueStyle={{ 
                    color: currentStats.activeIncidents > 0 ? "#ff4d4f" : "#52c41a", 
                    fontSize: "20px", 
                    fontWeight: "bold" 
                  }}
                />
              </Card>
            </Col>
            
            <Col xs={24} sm={12} lg={6}>
              <Card style={cardStyle}>
                <Statistic
                  title="Bugün Çözülen"
                  value={currentStats.resolvedToday}
                  valueStyle={{ 
                    color: "#1890ff", 
                    fontSize: "20px", 
                    fontWeight: "bold" 
                  }}
                />
              </Card>
            </Col>
          </Row>
        </>
      )}

      {/* Gönüllü/Personel için Basit İstatistikler */}
      {(userRole === "volunteer" || userRole === "staff") && (
        <>
          <Text 
            strong 
            style={{ 
              fontSize: "16px", 
              marginBottom: "16px", 
              display: "block" 
            }}
          >
            Günlük Özet
          </Text>
          
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={8}>
              <Card style={cardStyle}>
                <Statistic
                  title="Aktif Gönüllüler"
                  value={currentStats.activeVolunteers}
                  valueStyle={{ 
                    color: "#52c41a", 
                    fontSize: "24px", 
                    fontWeight: "bold" 
                  }}
                />
              </Card>
            </Col>
            
            <Col xs={24} sm={12} lg={8}>
              <Card style={cardStyle}>
                <Statistic
                  title="Toplam Bildirimler"
                  value={currentStats.totalNotifications}
                  valueStyle={{ 
                    color: "#1890ff", 
                    fontSize: "24px", 
                    fontWeight: "bold" 
                  }}
                />
              </Card>
            </Col>
            
            <Col xs={24} sm={12} lg={8}>
              <Card style={cardStyle}>
                <Statistic
                  title="Acil Bildirimler"
                  value={currentStats.urgentNotifications}
                  valueStyle={{ 
                    color: "#ff4d4f", 
                    fontSize: "24px", 
                    fontWeight: "bold" 
                  }}
                />
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};

export default DashboardStats;
