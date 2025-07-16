"use client";

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Table, 
  Typography, 
  Button, 
  Badge, 
  Tag, 
  Tabs, 
  List, 
  Space, 
  Progress, 
  Alert,
  Empty,
  Select,
  Divider
} from 'antd';
import {
  TeamOutlined,
  ProfileOutlined,
  BarChartOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  WarningOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { TabsProps } from 'antd';
import { UserRole } from '../../types/user';

const { Title, Text } = Typography;
const { Option } = Select;

// Örnek departman verileri
const departmentTasks = [
  { id: 1, title: 'Deprem Sonrası Durum Değerlendirmesi', status: 'in_progress', priority: 'high', assignedTo: 'Ahmet Yılmaz', dueDate: '2 gün sonra' },
  { id: 2, title: 'Altyapı Hasar Tespiti', status: 'pending', priority: 'high', assignedTo: 'Mehmet Demir', dueDate: '1 gün sonra' },
  { id: 3, title: 'Acil Müdahale Planı Hazırlama', status: 'completed', priority: 'medium', assignedTo: 'Ayşe Kaya', dueDate: 'Tamamlandı' },
  { id: 4, title: 'Kaynak Dağıtımı Koordinasyonu', status: 'in_progress', priority: 'medium', assignedTo: 'Ali Öztürk', dueDate: '3 gün sonra' },
  { id: 5, title: 'Durum Raporu Hazırlama', status: 'pending', priority: 'low', assignedTo: 'Zeynep Aydın', dueDate: '4 gün sonra' },
];

// Örnek personel verileri
const departmentStaff = [
  { id: 1, name: 'Ahmet Yılmaz', position: 'Kıdemli Uzman', status: 'online', activeTasks: 2, lastActive: '5 dakika önce' },
  { id: 2, name: 'Mehmet Demir', position: 'Uzman', status: 'online', activeTasks: 1, lastActive: '15 dakika önce' },
  { id: 3, name: 'Ayşe Kaya', position: 'Analist', status: 'offline', activeTasks: 0, lastActive: '2 saat önce' },
  { id: 4, name: 'Ali Öztürk', position: 'Teknik Personel', status: 'busy', activeTasks: 1, lastActive: '30 dakika önce' },
  { id: 5, name: 'Zeynep Aydın', position: 'Asistan', status: 'away', activeTasks: 1, lastActive: '1 saat önce' },
];

// Örnek metrikler
const departmentMetrics = {
  completedTasks: 12,
  pendingTasks: 5,
  inProgressTasks: 8,
  totalStaff: 15,
  activeStaff: 10,
  readiness: 85
};

// Örnek bölge listesi
const regions = [
  { id: 1, name: 'Marmara Bölgesi' },
  { id: 2, name: 'Ege Bölgesi' },
  { id: 3, name: 'Akdeniz Bölgesi' },
  { id: 4, name: 'İç Anadolu Bölgesi' },
  { id: 5, name: 'Karadeniz Bölgesi' },
  { id: 6, name: 'Doğu Anadolu Bölgesi' },
  { id: 7, name: 'Güneydoğu Anadolu Bölgesi' },
];

const ManagerDashboard: React.FC = () => {
  const { data: session, status } = useSession();
  const [activeTabKey, setActiveTabKey] = useState<string>("1");
  const [selectedRegion, setSelectedRegion] = useState<number>(1);
  
  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-screen">
      <div>Yükleniyor...</div>
    </div>;
  }
  
  if (!session || session.user.role !== UserRole.MANAGER) {
    return <Alert
      message="Yetkisiz Erişim"
      description="Bu sayfayı görüntülemek için Kurum Yöneticisi yetkiniz bulunmamaktadır."
      type="error"
      showIcon
    />;
  }

  // Görev durumu için renk
  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress': return 'blue';
      case 'pending': return 'orange';
      case 'completed': return 'green';
      case 'cancelled': return 'red';
      default: return 'default';
    }
  };
  
  // Görev durumu için metin
  const getTaskStatusText = (status: string) => {
    switch (status) {
      case 'in_progress': return 'Devam Ediyor';
      case 'pending': return 'Beklemede';
      case 'completed': return 'Tamamlandı';
      case 'cancelled': return 'İptal Edildi';
      default: return 'Bilinmiyor';
    }
  };
  
  // Görev önceliği için renk
  const getTaskPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'default';
    }
  };
  
  // Görev önceliği için metin
  const getTaskPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'Yüksek';
      case 'medium': return 'Orta';
      case 'low': return 'Düşük';
      default: return 'Bilinmiyor';
    }
  };
  
  // Personel durumu için renk
  const getStaffStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'green';
      case 'offline': return 'gray';
      case 'away': return 'orange';
      case 'busy': return 'red';
      default: return 'default';
    }
  };
  
  // Personel durumu için text
  const getStaffStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Çevrimiçi';
      case 'offline': return 'Çevrimdışı';
      case 'away': return 'Uzakta';
      case 'busy': return 'Meşgul';
      default: return 'Bilinmiyor';
    }
  };
  
  // Tab içerikleri
  const tabItems: TabsProps['items'] = [
    {
      key: "1",
      label: "Görevler",
      children: (
        <div className="tasks-list">
          <Table 
            dataSource={departmentTasks} 
            rowKey="id"
            pagination={false}
            columns={[
              {
                title: 'Görev',
                dataIndex: 'title',
                key: 'title',
                render: (text) => <Text strong>{text}</Text>
              },
              {
                title: 'Durum',
                dataIndex: 'status',
                key: 'status',
                render: (status) => (
                  <Tag color={getTaskStatusColor(status)}>
                    {getTaskStatusText(status)}
                  </Tag>
                )
              },
              {
                title: 'Öncelik',
                dataIndex: 'priority',
                key: 'priority',
                render: (priority) => (
                  <Tag color={getTaskPriorityColor(priority)}>
                    {getTaskPriorityText(priority)}
                  </Tag>
                )
              },
              {
                title: 'Atanan Kişi',
                dataIndex: 'assignedTo',
                key: 'assignedTo',
              },
              {
                title: 'Teslim Tarihi',
                dataIndex: 'dueDate',
                key: 'dueDate',
              },
              {
                title: 'İşlemler',
                key: 'actions',
                render: (_, record) => (
                  <Space>
                    <Button size="small" type="primary">Detaylar</Button>
                    <Button size="small">Düzenle</Button>
                  </Space>
                )
              }
            ]}
          />
          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="primary">Yeni Görev Oluştur</Button>
          </div>
        </div>
      )
    },
    {
      key: "2",
      label: "Personel",
      children: (
        <div className="staff-list">
          <Table 
            dataSource={departmentStaff} 
            rowKey="id"
            pagination={false}
            columns={[
              {
                title: 'İsim',
                dataIndex: 'name',
                key: 'name',
                render: (text) => (
                  <Space>
                    <UserOutlined />
                    <Text strong>{text}</Text>
                  </Space>
                )
              },
              {
                title: 'Pozisyon',
                dataIndex: 'position',
                key: 'position',
              },
              {
                title: 'Durum',
                dataIndex: 'status',
                key: 'status',
                render: (status) => (
                  <Tag color={getStaffStatusColor(status)}>
                    {getStaffStatusText(status)}
                  </Tag>
                )
              },
              {
                title: 'Aktif Görevler',
                dataIndex: 'activeTasks',
                key: 'activeTasks',
                render: (tasks) => <Badge count={tasks} showZero />
              },
              {
                title: 'Son Aktiflik',
                dataIndex: 'lastActive',
                key: 'lastActive',
              },
              {
                title: 'İşlemler',
                key: 'actions',
                render: (_, record) => (
                  <Space>
                    <Button size="small" type="primary">Görevlendir</Button>
                    <Button size="small">Mesaj Gönder</Button>
                  </Space>
                )
              }
            ]}
          />
          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="primary">Toplu Görevlendirme</Button>
          </div>
        </div>
      )
    },
    {
      key: "3",
      label: "Performans",
      children: (
        <div className="performance-metrics">
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Card title="Görev Tamamlama Oranı">
                <Progress 
                  percent={Math.round((departmentMetrics.completedTasks / (departmentMetrics.completedTasks + departmentMetrics.pendingTasks + departmentMetrics.inProgressTasks)) * 100)} 
                  strokeColor="#52c41a"
                />
              </Card>
            </Col>
            <Col span={12}>
              <Card title="Görev Durumu">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div>
                    <Text>Tamamlanan Görevler</Text>
                    <div>
                      <Tag color="green" icon={<CheckCircleOutlined />}>
                        {departmentMetrics.completedTasks}
                      </Tag>
                    </div>
                  </div>
                  <div>
                    <Text>Devam Eden Görevler</Text>
                    <div>
                      <Tag color="blue" icon={<ClockCircleOutlined />}>
                        {departmentMetrics.inProgressTasks}
                      </Tag>
                    </div>
                  </div>
                  <div>
                    <Text>Bekleyen Görevler</Text>
                    <div>
                      <Tag color="orange" icon={<WarningOutlined />}>
                        {departmentMetrics.pendingTasks}
                      </Tag>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
            <Col span={12}>
              <Card title="Personel Durumu">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Statistic 
                    title="Aktif Personel" 
                    value={departmentMetrics.activeStaff} 
                    suffix={`/ ${departmentMetrics.totalStaff}`}
                    valueStyle={{ color: '#52c41a' }}
                  />
                  <Statistic 
                    title="Hazırlık Durumu" 
                    value={departmentMetrics.readiness} 
                    suffix="%" 
                    valueStyle={{ color: departmentMetrics.readiness >= 80 ? '#52c41a' : '#faad14' }}
                  />
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      )
    }
  ];

  const handleRegionChange = (value: number) => {
    setSelectedRegion(value);
    // Normalde burada seçilen bölgeye göre veriler API'den alınacak
  };

  return (
    <div className="manager-dashboard">
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2}>Kurum Yönetim Paneli</Title>
        <Select 
          value={selectedRegion} 
          onChange={handleRegionChange} 
          style={{ width: 200 }}
          placeholder="Bölge Seçiniz"
        >
          {regions.map(region => (
            <Option key={region.id} value={region.id}>{region.name}</Option>
          ))}
        </Select>
      </div>
      
      <Alert
        message="Bölge Kısıtlaması Aktif"
        description={`Şu anda sadece '${regions.find(r => r.id === selectedRegion)?.name}' bölgesine ait verileri görüntülüyorsunuz.`}
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />
      
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Toplam Görevler"
              value={departmentTasks.length}
              valueStyle={{ color: '#1890ff' }}
              prefix={<ProfileOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Aktif Personel"
              value={departmentStaff.filter(s => s.status === 'online' || s.status === 'busy').length}
              valueStyle={{ color: '#52c41a' }}
              prefix={<TeamOutlined />}
              suffix={`/${departmentStaff.length}`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tamamlanan Görevler"
              value={departmentTasks.filter(t => t.status === 'completed').length}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Bekleyen Görevler"
              value={departmentTasks.filter(t => t.status === 'pending').length}
              valueStyle={{ color: '#faad14' }}
              prefix={<BarChartOutlined />}
            />
          </Card>
        </Col>
      </Row>
      
      <Card style={{ marginTop: 16 }}>
        <Tabs defaultActiveKey="1" items={tabItems} onChange={setActiveTabKey} />
      </Card>
    </div>
  );
};

export default ManagerDashboard; 