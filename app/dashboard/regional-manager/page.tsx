"use client";

import React, { useState, useEffect } from 'react';
import { Card, Typography, Row, Col, Statistic, Table, Tag, Button, Avatar, Space, Spin } from 'antd';
import { 
  GlobalOutlined, 
  TeamOutlined, 
  AlertOutlined, 
  CheckCircleOutlined,
  EnvironmentOutlined,
  UserOutlined,
  PhoneOutlined
} from '@ant-design/icons';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const { Title, Text } = Typography;

// Demo veri
const regions = [
  { id: '1', name: 'İstanbul', staffCount: 24, volunteersCount: 145, activeAlerts: 2, lastUpdate: '10 dakika önce' },
  { id: '2', name: 'Ankara', staffCount: 18, volunteersCount: 98, activeAlerts: 1, lastUpdate: '25 dakika önce' },
  { id: '3', name: 'İzmir', staffCount: 15, volunteersCount: 87, activeAlerts: 0, lastUpdate: '45 dakika önce' },
  { id: '4', name: 'Antalya', staffCount: 12, volunteersCount: 76, activeAlerts: 1, lastUpdate: '1 saat önce' },
  { id: '5', name: 'Bursa', staffCount: 10, volunteersCount: 62, activeAlerts: 0, lastUpdate: '2 saat önce' },
];

const staffMembers = [
  { id: '1', name: 'Ahmet Yılmaz', role: 'Bölge Koordinatörü', region: 'İstanbul', phone: '+90 555 123 4567', email: 'ahmet@example.com', avatar: 'https://i.pravatar.cc/150?img=1' },
  { id: '2', name: 'Ayşe Demir', role: 'Operasyon Sorumlusu', region: 'İstanbul', phone: '+90 555 234 5678', email: 'ayse@example.com', avatar: 'https://i.pravatar.cc/150?img=5' },
  { id: '3', name: 'Mehmet Kaya', role: 'Lojistik Sorumlusu', region: 'Ankara', phone: '+90 555 345 6789', email: 'mehmet@example.com', avatar: 'https://i.pravatar.cc/150?img=3' },
  { id: '4', name: 'Fatma Şahin', role: 'İletişim Sorumlusu', region: 'İzmir', phone: '+90 555 456 7890', email: 'fatma@example.com', avatar: 'https://i.pravatar.cc/150?img=4' },
];

const activeAlerts = [
  { id: '1', title: 'Sel Uyarısı', region: 'İstanbul', severity: 'high', createdAt: '2023-05-21T10:30:00' },
  { id: '2', title: 'Deprem Hazırlık', region: 'İzmir', severity: 'medium', createdAt: '2023-05-21T09:45:00' },
  { id: '3', title: 'Yangın Riski', region: 'Antalya', severity: 'high', createdAt: '2023-05-21T11:15:00' },
];

// Fonksiyonlar
const getSeverityColor = (severity: string) => {
  switch(severity) {
    case 'high':
      return 'red';
    case 'medium':
      return 'orange';
    case 'low':
    default:
      return 'green';
  }
};

const getSeverityText = (severity: string) => {
  switch(severity) {
    case 'high':
      return 'Yüksek';
    case 'medium':
      return 'Orta';
    case 'low':
    default:
      return 'Düşük';
  }
};

const RegionalManagerPage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simüle edilen API çağrısı
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Oturum yükleniyor durumu
  if (status === "loading" || loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Spin size="large">
        <div style={{ padding: '20px' }}>Yükleniyor...</div>
      </Spin>
    </div>;
  }

  const isRegionalManager = session?.user?.role === 'regional_manager';
  
  if (!isRegionalManager) {
    return (
      <Card>
        <Title level={4}>Erişim Reddedildi</Title>
        <Text>Bu sayfayı görüntülemek için Bölge Yöneticisi yetkilerine sahip olmanız gerekiyor.</Text>
        <div style={{ marginTop: 16 }}>
          <Button type="primary" onClick={() => router.push('/dashboard')}>Kontrol Paneline Dön</Button>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <Title level={2}>Bölge Yönetimi</Title>
      
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <Row gutter={16}>
              <Col span={8}>
                <Statistic 
                  title="Toplam Bölge" 
                  value={regions.length} 
                  prefix={<GlobalOutlined />} 
                />
              </Col>
              <Col span={8}>
                <Statistic 
                  title="Toplam Personel" 
                  value={staffMembers.length} 
                  prefix={<TeamOutlined />} 
                />
              </Col>
              <Col span={8}>
                <Statistic 
                  title="Aktif Uyarılar" 
                  value={activeAlerts.length} 
                  prefix={<AlertOutlined style={{ color: activeAlerts.length > 0 ? '#ff4d4f' : '' }} />} 
                />
              </Col>
            </Row>
          </Card>
        </Col>
        
        <Col span={14}>
          <Card title="Bölgeler" extra={<Button type="link">Tümünü Görüntüle</Button>}>
            <Table 
              dataSource={regions} 
              rowKey="id"
              pagination={false}
              columns={[
                { 
                  title: 'Bölge', 
                  dataIndex: 'name',
                  key: 'name',
                  render: (text) => <Text strong><EnvironmentOutlined style={{ marginRight: 8 }} />{text}</Text>
                },
                { 
                  title: 'Personel', 
                  dataIndex: 'staffCount',
                  key: 'staffCount' 
                },
                { 
                  title: 'Gönüllüler', 
                  dataIndex: 'volunteersCount',
                  key: 'volunteersCount' 
                },
                { 
                  title: 'Uyarılar', 
                  dataIndex: 'activeAlerts',
                  key: 'activeAlerts',
                  render: (count) => (
                    count > 0 ? 
                      <Tag color="error">{count} Aktif Uyarı</Tag> : 
                      <Tag color="success">Uyarı Yok</Tag>
                  )
                },
                { 
                  title: 'Son Güncelleme', 
                  dataIndex: 'lastUpdate',
                  key: 'lastUpdate' 
                },
                {
                  title: 'İşlem',
                  key: 'action',
                  render: (_, record) => (
                    <Button type="link" onClick={() => router.push(`/dashboard/regions/${record.id}`)}>
                      Detaylar
                    </Button>
                  )
                }
              ]}
            />
          </Card>
        </Col>
        
        <Col span={10}>
          <Card title="Aktif Uyarılar" extra={<Button type="link">Tümünü Görüntüle</Button>}>
            {activeAlerts.length > 0 ? (
              <Table 
                dataSource={activeAlerts} 
                rowKey="id"
                pagination={false}
                columns={[
                  { 
                    title: 'Uyarı', 
                    dataIndex: 'title',
                    key: 'title' 
                  },
                  { 
                    title: 'Bölge', 
                    dataIndex: 'region',
                    key: 'region' 
                  },
                  { 
                    title: 'Önem', 
                    dataIndex: 'severity',
                    key: 'severity',
                    render: (severity) => (
                      <Tag color={getSeverityColor(severity)}>
                        {getSeverityText(severity)}
                      </Tag>
                    )
                  },
                  {
                    title: 'İşlem',
                    key: 'action',
                    render: (_, record) => (
                      <Button type="link" onClick={() => router.push(`/dashboard/alerts/${record.id}`)}>
                        Detaylar
                      </Button>
                    )
                  }
                ]}
              />
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
                <Text type="secondary"><CheckCircleOutlined style={{ marginRight: 8 }} />Aktif uyarı bulunmuyor</Text>
              </div>
            )}
          </Card>
        </Col>
        
        <Col span={24}>
          <Card title="Bölge Personeli" extra={<Button type="link">Tümünü Görüntüle</Button>}>
            <Table 
              dataSource={staffMembers} 
              rowKey="id"
              pagination={false}
              columns={[
                { 
                  title: 'İsim', 
                  dataIndex: 'name',
                  key: 'name',
                  render: (_, record) => (
                    <Space>
                      <Avatar src={record.avatar} icon={<UserOutlined />} />
                      <Text>{record.name}</Text>
                    </Space>
                  )
                },
                { 
                  title: 'Pozisyon', 
                  dataIndex: 'role',
                  key: 'role' 
                },
                { 
                  title: 'Bölge', 
                  dataIndex: 'region',
                  key: 'region' 
                },
                { 
                  title: 'İletişim', 
                  key: 'contact',
                  render: (_, record) => (
                    <Space direction="vertical" size="small">
                      <Text><PhoneOutlined style={{ marginRight: 8 }} />{record.phone}</Text>
                      <Text>{record.email}</Text>
                    </Space>
                  )
                },
                {
                  title: 'İşlem',
                  key: 'action',
                  render: (_, record) => (
                    <Space>
                      <Button type="link" onClick={() => router.push(`/dashboard/personnel/${record.id}`)}>
                        Profil
                      </Button>
                      <Button type="link" onClick={() => router.push(`/dashboard/chat?userId=${record.id}`)}>
                        Mesaj
                      </Button>
                    </Space>
                  )
                }
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default RegionalManagerPage; 