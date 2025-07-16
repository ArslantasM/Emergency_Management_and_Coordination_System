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
  Upload,
  Input,
  Form,
  Select,
  Empty,
  Timeline,
  Avatar
} from 'antd';
import type { TabsProps, UploadFile, UploadProps } from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  ProfileOutlined,
  FileAddOutlined,
  UploadOutlined,
  PaperClipOutlined,
  UserOutlined,
  TeamOutlined,
  BarChartOutlined,
  CloudUploadOutlined,
  CameraOutlined,
  CalendarOutlined,
  InfoCircleOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import { UserRole } from '../../types/user';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// Örnek görevler
const assignedTasks = [
  { 
    id: 1, 
    title: 'Deprem Bölgesi Saha Raporu', 
    status: 'in_progress', 
    priority: 'high', 
    dueDate: '1 gün sonra',
    progress: 60,
    description: 'Deprem bölgesindeki hasar durumunu değerlendiren bir saha raporu hazırlayın.',
    assignedBy: 'Ali Yılmaz (Sağlık Müdürlüğü)',
    attachments: 2
  },
  { 
    id: 2, 
    title: 'Acil Durum Malzeme Envanteri', 
    status: 'pending', 
    priority: 'medium', 
    dueDate: '3 gün sonra',
    progress: 0,
    description: 'Mevcut acil durum malzemelerinin sayım ve durumunu kontrol edin.',
    assignedBy: 'Mehmet Demir (AFAD)',
    attachments: 0
  },
  { 
    id: 3, 
    title: 'Personel Eğitimi Koordinasyonu', 
    status: 'completed', 
    priority: 'medium', 
    dueDate: 'Tamamlandı',
    progress: 100,
    description: 'Yeni personel için acil durum müdahale eğitimini organize edin.',
    assignedBy: 'Ayşe Kaya (İl Sağlık Müdürlüğü)',
    attachments: 5
  },
  { 
    id: 4, 
    title: 'Risk Analizi Raporu', 
    status: 'in_progress', 
    priority: 'low', 
    dueDate: '5 gün sonra',
    progress: 30,
    description: 'Bölgenizdeki potansiyel risk faktörlerini analiz eden bir rapor hazırlayın.',
    assignedBy: 'Zeynep Öztürk (İl AFAD Müdürlüğü)',
    attachments: 1
  },
];

// Örnek aktivite geçmişi
const activityHistory = [
  { id: 1, title: 'Deprem Bölgesi Saha Raporu güncellendi', time: '2 saat önce', type: 'task_update' },
  { id: 2, title: 'Yeni görev atandı: Risk Analizi Raporu', time: '1 gün önce', type: 'new_task' },
  { id: 3, title: 'Personel Eğitimi Koordinasyonu tamamlandı', time: '2 gün önce', type: 'task_complete' },
  { id: 4, title: 'Profil bilgileriniz güncellendi', time: '3 gün önce', type: 'profile_update' },
  { id: 5, title: 'Acil durum tatbikatına katıldınız', time: '5 gün önce', type: 'event' },
];

// Örnek takvim etkinlikleri
const upcomingEvents = [
  { id: 1, title: 'Deprem Bölgesi Saha Ziyareti', date: 'Bugün, 14:00', type: 'field' },
  { id: 2, title: 'Acil Durum Koordinasyon Toplantısı', date: 'Yarın, 10:00', type: 'meeting' },
  { id: 3, title: 'Risk Analizi Raporu Teslimi', date: '5 Nisan, 17:00', type: 'deadline' },
  { id: 4, title: 'Afet Yönetimi Eğitimi', date: '8 Nisan, 09:00-17:00', type: 'training' },
];

// Örnek bölge bilgisi
const regionInfo = {
  name: 'Marmara Bölgesi',
  department: 'İl Sağlık Müdürlüğü',
  manager: 'Dr. Ali Yılmaz',
  activeTasks: 15,
  activeEvents: 2
};

const mockFileList: UploadFile[] = [
  {
    uid: '-1',
    name: 'hasardurumu.jpg',
    status: 'done',
    url: 'https://example.com/hasardurumu.jpg',
    thumbUrl: 'https://example.com/hasardurumu_thumb.jpg',
  },
];

const StaffDashboard: React.FC = () => {
  const { data: session, status } = useSession();
  const [activeTabKey, setActiveTabKey] = useState<string>("1");
  const [currentTask, setCurrentTask] = useState<typeof assignedTasks[0] | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [progressValue, setProgressValue] = useState<number>(0);
  
  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-screen">
      <div>Yükleniyor...</div>
    </div>;
  }
  
  if (!session || session.user.role !== UserRole.STAFF) {
    return <Alert
      message="Yetkisiz Erişim"
      description="Bu sayfayı görüntülemek için Personel yetkiniz bulunmamaktadır."
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

  // Aktivite tipi için ikon
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'task_update': return <ClockCircleOutlined style={{ color: '#1890ff' }} />;
      case 'new_task': return <FileAddOutlined style={{ color: '#52c41a' }} />;
      case 'task_complete': return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'profile_update': return <UserOutlined style={{ color: '#722ed1' }} />;
      case 'event': return <CalendarOutlined style={{ color: '#faad14' }} />;
      default: return <InfoCircleOutlined />;
    }
  };

  // Etkinlik tipi için ikon
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'field': return <EnvironmentOutlined style={{ color: '#1890ff' }} />;
      case 'meeting': return <TeamOutlined style={{ color: '#722ed1' }} />;
      case 'deadline': return <ClockCircleOutlined style={{ color: '#f5222d' }} />;
      case 'training': return <ProfileOutlined style={{ color: '#52c41a' }} />;
      default: return <CalendarOutlined style={{ color: '#faad14' }} />;
    }
  };
  
  // Dosya yükleme özellikleri
  const uploadProps: UploadProps = {
    onRemove: file => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: file => {
      setFileList([...fileList, file]);
      return false;
    },
    fileList,
  };
  
  // Görev seçme handler'ı
  const handleTaskSelect = (task: typeof assignedTasks[0]) => {
    setCurrentTask(task);
    setProgressValue(task.progress);
  };
  
  // Tab içerikleri
  const tabItems: TabsProps['items'] = [
    {
      key: "1",
      label: "Görevlerim",
      children: (
        <div className="tasks-list">
          {currentTask ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <Button onClick={() => setCurrentTask(null)}>Geri Dön</Button>
                <Space>
                  <Button>Mesaj Gönder</Button>
                  <Button type="primary">Kaydet</Button>
                </Space>
              </div>
              
              <Card title={currentTask.title} bordered={false} style={{ marginBottom: 16 }}>
                <div style={{ marginBottom: 16 }}>
                  <Space size="large">
                    <div>
                      <Text type="secondary">Durum:</Text>
                      <Tag color={getTaskStatusColor(currentTask.status)} style={{ marginLeft: 8 }}>
                        {getTaskStatusText(currentTask.status)}
                      </Tag>
                    </div>
                    <div>
                      <Text type="secondary">Öncelik:</Text>
                      <Tag color={getTaskPriorityColor(currentTask.priority)} style={{ marginLeft: 8 }}>
                        {getTaskPriorityText(currentTask.priority)}
                      </Tag>
                    </div>
                    <div>
                      <Text type="secondary">Teslim Tarihi:</Text>
                      <Text style={{ marginLeft: 8 }}>{currentTask.dueDate}</Text>
                    </div>
                    <div>
                      <Text type="secondary">Atayan:</Text>
                      <Text style={{ marginLeft: 8 }}>{currentTask.assignedBy}</Text>
                    </div>
                  </Space>
                </div>
                
                <Paragraph>{currentTask.description}</Paragraph>
                
                <div style={{ marginTop: 16, marginBottom: 16 }}>
                  <Text strong>İlerleme Durumu:</Text>
                  <div style={{ display: 'flex', alignItems: 'center', marginTop: 8 }}>
                    <Progress percent={progressValue} style={{ flex: 1, marginRight: 16 }} />
                    <Select
                      value={progressValue}
                      onChange={setProgressValue}
                      style={{ width: 100 }}
                    >
                      <Option value={0}>%0</Option>
                      <Option value={25}>%25</Option>
                      <Option value={50}>%50</Option>
                      <Option value={75}>%75</Option>
                      <Option value={100}>%100</Option>
                    </Select>
                  </div>
                </div>
                
                <Divider />
                
                <div>
                  <Text strong>Durum Güncellemesi:</Text>
                  <TextArea 
                    rows={4} 
                    placeholder="Görev ile ilgili güncel durumu buraya yazınız..."
                    style={{ marginTop: 8, marginBottom: 16 }}
                  />
                </div>
                
                <div>
                  <Text strong>Dosya Ekle:</Text>
                  <Upload {...uploadProps} style={{ marginTop: 8 }}>
                    <Button icon={<UploadOutlined />}>Dosya Seç</Button>
                  </Upload>
                </div>
                
                {currentTask.attachments > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <Text strong>Mevcut Ekler ({currentTask.attachments}):</Text>
                    <List
                      size="small"
                      dataSource={mockFileList}
                      renderItem={item => (
                        <List.Item
                          actions={[
                            <a key="download">İndir</a>,
                            <a key="view">Görüntüle</a>
                          ]}
                        >
                          <List.Item.Meta
                            avatar={<PaperClipOutlined />}
                            title={item.name}
                            description={`Yükleme Tarihi: 28.03.2025`}
                          />
                        </List.Item>
                      )}
                    />
                  </div>
                )}
              </Card>
            </div>
          ) : (
            <Table 
              dataSource={assignedTasks} 
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
                  title: 'İlerleme',
                  dataIndex: 'progress',
                  key: 'progress',
                  render: (progress) => (
                    <Progress percent={progress} size="small" />
                  )
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
                      <Button 
                        size="small" 
                        type="primary"
                        onClick={() => handleTaskSelect(record)}
                      >
                        Detaylar
                      </Button>
                    </Space>
                  )
                }
              ]}
            />
          )}
        </div>
      )
    },
    {
      key: "2",
      label: "Aktivite Geçmişi",
      children: (
        <div className="activity-history">
          <Timeline
            items={activityHistory.map(activity => ({
              children: (
                <div>
                  <Text strong>{activity.title}</Text>
                  <div>
                    <Text type="secondary">{activity.time}</Text>
                  </div>
                </div>
              ),
              dot: getActivityIcon(activity.type)
            }))}
          />
        </div>
      )
    },
    {
      key: "3",
      label: "Takvim",
      children: (
        <div className="calendar-events">
          <List
            itemLayout="horizontal"
            dataSource={upcomingEvents}
            renderItem={event => (
              <List.Item>
                <List.Item.Meta
                  avatar={getEventIcon(event.type)}
                  title={event.title}
                  description={event.date}
                />
                <Button size="small">Detaylar</Button>
              </List.Item>
            )}
          />
        </div>
      )
    }
  ];

  return (
    <div className="staff-dashboard">
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Personel Görev Paneli</Title>
      </div>
      
      <Alert
        message="Bölge Bilgisi"
        description={
          <Space direction="vertical">
            <Text><strong>Görev Bölgesi:</strong> {regionInfo.name}</Text>
            <Text><strong>Departman:</strong> {regionInfo.department}</Text>
            <Text><strong>Yönetici:</strong> {regionInfo.manager}</Text>
          </Space>
        }
        type="info"
        showIcon
        icon={<EnvironmentOutlined />}
        style={{ marginBottom: 16 }}
      />
      
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Görevlerim"
              value={assignedTasks.length}
              valueStyle={{ color: '#1890ff' }}
              prefix={<ProfileOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tamamlanan"
              value={assignedTasks.filter(task => task.status === 'completed').length}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
              suffix={`/${assignedTasks.length}`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Devam Eden"
              value={assignedTasks.filter(task => task.status === 'in_progress').length}
              valueStyle={{ color: '#1890ff' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Bekleyen"
              value={assignedTasks.filter(task => task.status === 'pending').length}
              valueStyle={{ color: '#faad14' }}
              prefix={<WarningOutlined />}
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

export default StaffDashboard; 