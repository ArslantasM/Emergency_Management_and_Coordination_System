"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { 
  Layout, 
  Spin, 
  Alert, 
  notification, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  Switch,
  Card,
  Space,
  Typography,
  Row,
  Col
} from 'antd';
import { 
  PlusOutlined, 
  BellOutlined, 
  WarningOutlined,
  FireOutlined,
  ThunderboltOutlined,
  ExperimentOutlined
} from '@ant-design/icons';
import { emergencyApi, EarthquakeData } from '@/app/services/emergencyApi';

// Tsunami verileri için interface
export interface TsunamiData {
  id: string;
  eventId: string;
  source: string;
  date: string;
  latitude: number;
  longitude: number;
  waveHeight: number;
  location: string;
  alert: boolean;
}
import dayjs from 'dayjs';

const { Content } = Layout;
const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// 🚀 Dynamic Imports - Lazy Loading için Optimize Edilmiş Component'ler
const DashboardStats = dynamic(
  () => import('./components/DashboardStats'),
  { 
    ssr: false,
    loading: () => <div style={{ height: '200px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Spin size="large" /></div>
  }
);

const DashboardMap = dynamic(
  () => import('./components/DashboardMap'),
  { 
    ssr: false,
    loading: () => <div style={{ height: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Spin size="large" /></div>
  }
);

const DashboardTasks = dynamic(
  () => import('./components/DashboardTasks'),
  { 
    ssr: false,
    loading: () => <div style={{ height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Spin size="large" /></div>
  }
);

const DashboardUsers = dynamic(
  () => import('./components/DashboardUsers'),
  { 
    ssr: false,
    loading: () => <div style={{ height: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Spin size="large" /></div>
  }
);

const DashboardChat = dynamic(
  () => import('./components/DashboardChat'),
  { 
    ssr: false,
    loading: () => <div style={{ height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Spin size="large" /></div>
  }
);

const DashboardNotifications = dynamic(
  () => import('./components/DashboardNotifications'),
  { 
    ssr: false,
    loading: () => <div style={{ height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Spin size="large" /></div>
  }
);

// Acil durum türleri
const emergencyTypes = [
  { value: 'earthquake', label: 'Deprem', icon: <ThunderboltOutlined />, color: '#ff4d4f' },
  { value: 'fire', label: 'Yangın', icon: <FireOutlined />, color: '#fa541c' },
  { value: 'flood', label: 'Sel', icon: <WarningOutlined />, color: '#1890ff' },
  { value: 'storm', label: 'Fırtına', icon: <WarningOutlined />, color: '#722ed1' },
  { value: 'exercise', label: 'Tatbikat', icon: <ExperimentOutlined />, color: '#52c41a' },
  { value: 'other', label: 'Diğer', icon: <BellOutlined />, color: '#faad14' }
];

// Kullanıcı hedef grupları
const targetGroups = [
  { value: 'all', label: 'Tüm Kullanıcılar' },
  { value: 'staff', label: 'Sadece Personel' },
  { value: 'volunteers', label: 'Sadece Gönüllüler' },
  { value: 'managers', label: 'Sadece Yöneticiler' },
  { value: 'regional', label: 'Bölge Kullanıcıları' },
  { value: 'emergency_teams', label: 'Acil Durum Ekipleri' }
];

const Dashboard: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userRole, setUserRole] = useState<string>('');
  const [recentEarthquakes, setRecentEarthquakes] = useState<EarthquakeData[]>([]);
  const [recentTsunamis, setRecentTsunamis] = useState<TsunamiData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  
  // Bildirim modal state'leri
  const [isNotificationModalVisible, setIsNotificationModalVisible] = useState(false);
  const [notificationForm] = Form.useForm();
  const [submittingNotification, setSubmittingNotification] = useState(false);
  
  useEffect(() => {
    // Kullanıcı oturumu yüklendiğinde rolünü ayarla
    if (session?.user?.role) {
      setUserRole(session.user.role as string);
    }
  }, [session]);
  
  useEffect(() => {
    const fetchRecentData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Cache'den deprem verilerini getir
        const earthquakeData = await emergencyApi.getEarthquakesFromCache();
        
        // Son 24 saatteki depremleri filtrele
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
        
        const recentEarthquakes = earthquakeData.filter(eq => {
          const eqDate = new Date(eq.date);
          return eqDate >= startDate && eqDate <= endDate && eq.magnitude >= 4.0;
        });

        setRecentEarthquakes(recentEarthquakes);
        
        // Tsunami verileri için demo data (henüz cache'de yok)
        setRecentTsunamis([]);
        
        console.log(`Dashboard: ${recentEarthquakes.length} son deprem verisi yüklendi`);
      } catch (error) {
        console.error('Veri alınırken hata:', error);
        setError('Veriler alınırken bir hata oluştu. Lütfen sayfayı yenileyin.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecentData();

    // WebSocket bağlantısı yerine periyodik güncelleme
    const interval = setInterval(() => {
      fetchRecentData();
    }, 5 * 60 * 1000); // 5 dakikada bir güncelle

    return () => {
      clearInterval(interval);
    };
  }, []);

  // Bildirim gönderme fonksiyonu
  const handleNotificationSubmit = async (values: any) => {
    try {
      setSubmittingNotification(true);
      
      const notificationData = {
        title: values.title,
        description: values.description,
        type: values.severity,
        source: 'SYSTEM',
        emergencyType: values.emergencyType,
        targetGroup: values.targetGroup,
        location: values.location,
        coordinates: values.coordinates,
        urgent: values.urgent || false,
        scheduledAt: values.scheduledAt ? values.scheduledAt.toISOString() : null,
        expiresAt: values.expiresAt ? values.expiresAt.toISOString() : null,
        createdBy: session?.user?.id,
        createdAt: new Date().toISOString()
      };

      // API'ye bildirim gönder
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationData)
      });

      if (response.ok) {
        notification.success({
          message: 'Bildirim Gönderildi',
          description: 'Acil durum bildirimi başarıyla oluşturuldu ve hedef kullanıcılara gönderildi.',
          placement: 'topRight'
        });
        
        setIsNotificationModalVisible(false);
        notificationForm.resetFields();
      } else {
        throw new Error('Bildirim gönderilemedi');
      }
    } catch (error) {
      console.error('Bildirim gönderme hatası:', error);
      notification.error({
        message: 'Hata',
        description: 'Bildirim gönderilirken bir hata oluştu. Lütfen tekrar deneyin.',
        placement: 'topRight'
      });
    } finally {
      setSubmittingNotification(false);
    }
  };
  
  // Oturum yükleniyor durumu
  if (status === "loading") {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Spin size="large">
        <div style={{ padding: '20px' }}>Yükleniyor...</div>
      </Spin>
    </div>;
  }
  
  // Kullanıcı oturumu kontrol et
  if (status === "unauthenticated") {
    router.push('/auth/login');
    return null;
  }
  
  // Kullanıcı bilgisi
  const user = session?.user;
  const userRegion = user?.regions?.[0] || '';
  
  // Hata durumunda uyarı göster
  if (error) {
    return (
      <Content style={{ padding: '24px' }}>
        <Alert
          message="Veri Yükleme Hatası"
          description={error}
          type="error"
          showIcon
          action={
            <button onClick={() => window.location.reload()}>
              Sayfayı Yenile
            </button>
          }
        />
      </Content>
    );
  }

  return (
    <Content style={{ padding: '24px', background: '#f5f5f5' }}>
      <div style={{ display: 'grid', gap: '24px' }}>
        {/* Başlık ve Bildirim Ekle Butonu */}
        <Card>
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={2} style={{ margin: 0 }}>
                Kontrol Paneli
              </Title>
              <p style={{ margin: 0, color: '#666' }}>
                Hoş geldiniz, {user?.name} • {userRole === 'admin' ? 'Sistem Yöneticisi' : 
                              userRole === 'regional_manager' ? 'Bölge Yöneticisi' :
                              userRole === 'manager' ? 'Kurum Yöneticisi' :
                              userRole === 'staff' ? 'Personel' :
                              userRole === 'volunteer' ? 'Gönüllü' : 'Kullanıcı'}
              </p>
            </Col>
            <Col>
              <Space>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => setIsNotificationModalVisible(true)}
                  size="large"
                >
                  Bildirim Ekle
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* 📊 İstatistikler - Lazy Loaded */}
        <DashboardStats userRole={userRole} />
        
        {/* 🗺️ Harita & Aktif Kullanıcılar - Grid Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          <DashboardMap 
            earthquakes={recentEarthquakes}
            tsunamis={recentTsunamis}
            loading={loading}
            wsConnected={wsConnected}
          />
          <DashboardUsers userRole={userRole} />
        </div>
        
        {/* 📋 Görevler, Bildirimler & Chat - Grid Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
          <DashboardTasks userRole={userRole} />
          <DashboardNotifications limit={5} />
          <DashboardChat userRole={userRole} />
        </div>
      </div>

      {/* Bildirim Ekleme Modal'ı */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BellOutlined />
            Yeni Acil Durum Bildirimi
          </div>
        }
        open={isNotificationModalVisible}
        onCancel={() => {
          setIsNotificationModalVisible(false);
          notificationForm.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form
          form={notificationForm}
          layout="vertical"
          onFinish={handleNotificationSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="emergencyType"
                label="Acil Durum Türü"
                rules={[{ required: true, message: 'Acil durum türü seçin' }]}
              >
                <Select placeholder="Acil durum türü seçin">
                  {emergencyTypes.map(type => (
                    <Option key={type.value} value={type.value}>
                      <Space>
                        {type.icon}
                        {type.label}
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="severity"
                label="Önem Derecesi"
                rules={[{ required: true, message: 'Önem derecesi seçin' }]}
              >
                <Select placeholder="Önem derecesi seçin">
                  <Option value="error">🔴 Kritik</Option>
                  <Option value="warning">🟡 Uyarı</Option>
                  <Option value="info">🔵 Bilgi</Option>
                  <Option value="success">🟢 Başarılı</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="title"
            label="Bildirim Başlığı"
            rules={[{ required: true, message: 'Bildirim başlığı girin' }]}
          >
            <Input placeholder="Örn: Kayseri'de 4.2 büyüklüğünde deprem" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Bildirim Açıklaması"
            rules={[{ required: true, message: 'Bildirim açıklaması girin' }]}
          >
            <TextArea 
              rows={4} 
              placeholder="Detaylı bildirim açıklaması..."
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="location"
                label="Konum"
                rules={[{ required: true, message: 'Konum bilgisi girin' }]}
              >
                <Input placeholder="Örn: Kayseri, Türkiye" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="coordinates"
                label="Koordinatlar (Opsiyonel)"
              >
                <Input placeholder="Örn: 38.7437, 35.4781" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="targetGroup"
            label="Hedef Kullanıcı Grubu"
            rules={[{ required: true, message: 'Hedef grup seçin' }]}
          >
            <Select placeholder="Bildirim gönderilecek kullanıcı grubu">
              {targetGroups.map(group => (
                <Option key={group.value} value={group.value}>
                  {group.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="scheduledAt"
                label="Zamanlanmış Gönderim (Opsiyonel)"
              >
                <DatePicker 
                  showTime 
                  placeholder="Gönderim zamanı seçin"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="expiresAt"
                label="Son Geçerlilik Tarihi (Opsiyonel)"
              >
                <DatePicker 
                  showTime 
                  placeholder="Geçerlilik sonu"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="urgent"
            label="Acil Bildirim"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsNotificationModalVisible(false)}>
                İptal
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={submittingNotification}
              >
                Bildirim Gönder
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Content>
  );
};

export default Dashboard; 