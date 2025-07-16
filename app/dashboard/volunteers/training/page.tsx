"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Card, Typography, Tabs, Button, Upload, Table, Tag, Input, 
  Form, Modal, Select, Divider, List, Space, Tooltip, App,
  Progress, Row, Col, Badge, Statistic, Avatar
} from 'antd';
import { 
  FileTextOutlined, VideoCameraOutlined, FileExcelOutlined,
  UploadOutlined, DeleteOutlined, EditOutlined, SearchOutlined,
  BookOutlined, MedicineBoxOutlined, ToolOutlined, CarOutlined, 
  ExperimentOutlined, FireOutlined, SafetyOutlined, PlayCircleOutlined,
  CheckCircleOutlined, ClockCircleOutlined, TrophyOutlined,
  UserOutlined, DownloadOutlined
} from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

// Eğitim kategorileri
const trainingCategories = [
  { key: 'medical', name: 'Acil Tıp', icon: <MedicineBoxOutlined /> },
  { key: 'surgical', name: 'Cerrahi İşlemler', icon: <MedicineBoxOutlined /> },
  { key: 'vehicles', name: 'Araç Kullanımı', icon: <CarOutlined /> },
  { key: 'equipment', name: 'Ekipman Kullanımı', icon: <ToolOutlined /> },
  { key: 'rescue', name: 'Arama Kurtarma', icon: <SafetyOutlined /> },
  { key: 'firefighting', name: 'Yangınla Mücadele', icon: <FireOutlined /> },
  { key: 'firstaid', name: 'İlk Yardım', icon: <MedicineBoxOutlined /> },
  { key: 'communication', name: 'İletişim Teknikleri', icon: <BookOutlined /> },
  { key: 'survival', name: 'Hayatta Kalma', icon: <ExperimentOutlined /> },
];

// Eğitim seviyesi için sabit değerler
const trainingLevels = [
  { value: 'basic', label: 'Temel' },
  { value: 'intermediate', label: 'Orta' },
  { value: 'advanced', label: 'İleri' },
  { value: 'expert', label: 'Uzman' },
];

// Eğitim formatı için sabit değerler
const trainingFormats = [
  { value: 'document', label: 'Doküman', icon: <FileTextOutlined /> },
  { value: 'video', label: 'Video', icon: <VideoCameraOutlined /> },
  { value: 'interactive', label: 'Etkileşimli', icon: <ExperimentOutlined /> },
];

// Eğitim verisi arayüzü
interface TrainingMaterial {
  id: string;
  title: string;
  description: string;
  category: string;
  format: string;
  level: string;
  url: string;
  createdAt: string;
  duration?: number; // Dakika cinsinden
  fileSize?: number; // KB cinsinden
  author?: string;
  tags?: string[];
}

// Kullanıcı eğitim verisi
interface UserTraining {
  id: string;
  trainingId: string;
  userId: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'certified';
  progress: number; // 0-100
  startedAt?: string;
  completedAt?: string;
  certificateUrl?: string;
  score?: number;
}

const VolunteerTraining: React.FC = () => {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchText, setSearchText] = useState<string>('');
  const [trainingMaterials, setTrainingMaterials] = useState<TrainingMaterial[]>([]);
  const [userTrainings, setUserTrainings] = useState<UserTraining[]>([]);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [editingMaterial, setEditingMaterial] = useState<TrainingMaterial | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [trainingDetailModal, setTrainingDetailModal] = useState<TrainingMaterial | null>(null);
  const [form] = Form.useForm();
  const { notification } = App.useApp();

  // Kullanıcı rolü
  const userRole = session?.user?.role || 'user';
  const isAdmin = userRole === 'admin' || userRole === 'manager';

  // Sahte veri yükleme
  useEffect(() => {
    // Gerçek uygulamada API'den veri çekilecek
    const dummyData: TrainingMaterial[] = [
      {
        id: '1',
        title: 'Temel İlk Yardım Eğitimi',
        description: 'Acil durumlarda temel ilk yardım teknikleri ve uygulamaları',
        category: 'firstaid',
        format: 'document',
        level: 'basic',
        url: '/documents/firstaid-basics.pdf',
        createdAt: '2023-01-15',
        duration: 45,
        fileSize: 2500,
        author: 'Dr. Ahmet Yılmaz',
        tags: ['CPR', 'Kanama', 'Kırık']
      },
      {
        id: '2',
        title: 'Arama Kurtarma Operasyonları',
        description: 'Enkaz altında arama kurtarma teknikleri ve ekip koordinasyonu',
        category: 'rescue',
        format: 'video',
        level: 'intermediate',
        url: '/videos/sar-operations.mp4',
        createdAt: '2023-02-20',
        duration: 120,
        author: 'Mehmet Kaya',
        tags: ['Enkaz', 'Koordinasyon', 'Güvenlik']
      },
      {
        id: '3',
        title: 'Cerrahi Teknikler - Temel Sütür',
        description: 'Acil durumlarda uygulanabilecek basit sütür teknikleri',
        category: 'surgical',
        format: 'video',
        level: 'advanced',
        url: '/videos/basic-suturing.mp4',
        createdAt: '2023-03-10',
        duration: 75,
        author: 'Dr. Ayşe Demir',
        tags: ['Sütür', 'Sterilizasyon', 'Yara Bakımı']
      },
      {
        id: '4',
        title: 'Acil Durum İletişim Protokolleri',
        description: 'Afet anında iletişim kurma ve bilgi aktarımı teknikleri',
        category: 'communication',
        format: 'document',
        level: 'basic',
        url: '/documents/emergency-comms.pdf',
        createdAt: '2023-04-05',
        fileSize: 1800,
        author: 'Ali Yıldız',
        tags: ['Telsiz', 'Kod', 'Rapor']
      },
      {
        id: '5',
        title: 'Ağır Vasıta Kullanımı',
        description: 'Enkaz kaldırma araçları ve ağır vasıtaların kullanım eğitimi',
        category: 'vehicles',
        format: 'interactive',
        level: 'expert',
        url: '/interactive/heavy-vehicles.html',
        createdAt: '2023-05-15',
        duration: 180,
        author: 'Kemal Öztürk',
        tags: ['Vinç', 'Kepçe', 'Kamyon']
      },
    ];
    
    setTrainingMaterials(dummyData);

    // Kullanıcı eğitim verileri (demo)
    if (!isAdmin) {
      const dummyUserTrainings: UserTraining[] = [
        {
          id: 'ut1',
          trainingId: '1',
          userId: session?.user?.id || 'user1',
          status: 'completed',
          progress: 100,
          startedAt: '2023-06-01',
          completedAt: '2023-06-01',
          certificateUrl: '/certificates/firstaid-cert.pdf',
          score: 95
        },
        {
          id: 'ut2',
          trainingId: '2',
          userId: session?.user?.id || 'user1',
          status: 'in_progress',
          progress: 60,
          startedAt: '2023-06-15'
        },
        {
          id: 'ut3',
          trainingId: '4',
          userId: session?.user?.id || 'user1',
          status: 'not_started',
          progress: 0
        }
      ];
      setUserTrainings(dummyUserTrainings);
    }
  }, [session, isAdmin]);

  // Kategori filtreleme
  const filteredMaterials = trainingMaterials.filter(material => {
    const categoryMatch = activeTab === 'all' || material.category === activeTab;
    const searchMatch = 
      material.title.toLowerCase().includes(searchText.toLowerCase()) || 
      material.description.toLowerCase().includes(searchText.toLowerCase()) ||
      (material.tags && material.tags.some(tag => tag.toLowerCase().includes(searchText.toLowerCase())));
    
    return categoryMatch && searchMatch;
  });

  // Kullanıcı eğitim durumunu al
  const getUserTrainingStatus = (trainingId: string): UserTraining | null => {
    return userTrainings.find(ut => ut.trainingId === trainingId) || null;
  };

  // Eğitim başlat
  const startTraining = (training: TrainingMaterial) => {
    const existingTraining = getUserTrainingStatus(training.id);
    if (!existingTraining) {
      const newUserTraining: UserTraining = {
        id: `ut_${Date.now()}`,
        trainingId: training.id,
        userId: session?.user?.id || 'user1',
        status: 'in_progress',
        progress: 0,
        startedAt: new Date().toISOString()
      };
      setUserTrainings(prev => [...prev, newUserTraining]);
    }
    setTrainingDetailModal(training);
  };

  // Eğitim tamamla
  const completeTraining = (trainingId: string) => {
    setUserTrainings(prev => prev.map(ut => 
      ut.trainingId === trainingId 
        ? { 
            ...ut, 
            status: 'completed' as const, 
            progress: 100, 
            completedAt: new Date().toISOString(),
            score: Math.floor(Math.random() * 20) + 80 // 80-100 arası rastgele skor
          }
        : ut
    ));
    notification.success({ message: 'Eğitim başarıyla tamamlandı!' });
  };

  // Modal işlemleri
  const showModal = (material?: TrainingMaterial) => {
    if (material) {
      setEditingMaterial(material);
      form.setFieldsValue(material);
    } else {
      setEditingMaterial(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setFileList([]);
  };

  const handleFormSubmit = (values: any) => {
    const newMaterial: TrainingMaterial = {
      id: editingMaterial ? editingMaterial.id : Date.now().toString(),
      ...values,
      createdAt: editingMaterial ? editingMaterial.createdAt : new Date().toISOString().split('T')[0],
      url: fileList.length > 0 ? `/uploaded/${fileList[0].name}` : (editingMaterial ? editingMaterial.url : ''),
    };

    if (editingMaterial) {
      // Güncelleme mantığı
      setTrainingMaterials(prev => prev.map(item => item.id === editingMaterial.id ? newMaterial : item));
      notification.success({ message: 'Eğitim materyali güncellendi' });
    } else {
      // Yeni ekleme mantığı
      setTrainingMaterials(prev => [...prev, newMaterial]);
      notification.success({ message: 'Yeni eğitim materyali eklendi' });
    }

    setIsModalVisible(false);
    setFileList([]);
  };

  const deleteMaterial = (id: string) => {
    setTrainingMaterials(prev => prev.filter(item => item.id !== id));
    notification.success({ message: 'Eğitim materyali silindi' });
  };

  // Upload özellikleri
  const uploadProps: UploadProps = {
    onRemove: file => {
      setFileList([]);
    },
    beforeUpload: file => {
      setFileList([file]);
      return false;
    },
    fileList,
  };

  // Kullanıcı istatistikleri
  const userStats = {
    totalTrainings: trainingMaterials.length,
    completedTrainings: userTrainings.filter(ut => ut.status === 'completed').length,
    inProgressTrainings: userTrainings.filter(ut => ut.status === 'in_progress').length,
    certificates: userTrainings.filter(ut => ut.certificateUrl).length
  };

  // Admin görünümü için tablar
  const adminTabItems = [
    {
      key: 'all',
      label: 'Tüm Eğitimler',
      children: (
        <Table
          columns={[
            {
              title: 'Başlık',
              dataIndex: 'title',
              key: 'title',
              render: (text, record) => (
                <Space direction="vertical">
                  <Text strong>{text}</Text>
                  <Text type="secondary">{record.description}</Text>
                </Space>
              )
            },
            {
              title: 'Kategori',
              dataIndex: 'category',
              key: 'category',
              render: (category) => {
                const cat = trainingCategories.find(c => c.key === category);
                return (
                  <Tag icon={cat?.icon} color="blue">
                    {cat?.name}
                  </Tag>
                );
              }
            },
            {
              title: 'Seviye',
              dataIndex: 'level',
              key: 'level',
              render: (level) => {
                const levelInfo = trainingLevels.find(l => l.value === level);
                return <Tag color="green">{levelInfo?.label}</Tag>;
              }
            },
            {
              title: 'Format',
              dataIndex: 'format',
              key: 'format',
              render: (format) => {
                const formatInfo = trainingFormats.find(f => f.value === format);
                return (
                  <Space>
                    {formatInfo?.icon}
                    <Text>{formatInfo?.label}</Text>
                  </Space>
                );
              }
            },
            {
              title: 'İşlemler',
              key: 'actions',
              render: (_, record) => (
                <Space>
                  <Button
                    type="text"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => showModal(record)}
                    className="hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                  />
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => deleteMaterial(record.id)}
                    className="hover:bg-red-50 transition-colors duration-200"
                  />
                </Space>
              )
            }
          ]}
          dataSource={filteredMaterials}
          rowKey="id"
          className="hover:shadow-sm transition-shadow duration-200"
        />
      )
    },
    ...trainingCategories.map(category => ({
      key: category.key,
      label: (
        <Space>
          {category.icon}
          {category.name}
        </Space>
      ),
      children: (
        <Table
          columns={[
            {
              title: 'Başlık',
              dataIndex: 'title',
              key: 'title',
              render: (text, record) => (
                <Space direction="vertical">
                  <Text strong>{text}</Text>
                  <Text type="secondary">{record.description}</Text>
                </Space>
              )
            },
            {
              title: 'Seviye',
              dataIndex: 'level',
              key: 'level',
              render: (level) => {
                const levelInfo = trainingLevels.find(l => l.value === level);
                return <Tag color="green">{levelInfo?.label}</Tag>;
              }
            },
            {
              title: 'Format',
              dataIndex: 'format',
              key: 'format',
              render: (format) => {
                const formatInfo = trainingFormats.find(f => f.value === format);
                return (
                  <Space>
                    {formatInfo?.icon}
                    <Text>{formatInfo?.label}</Text>
                  </Space>
                );
              }
            },
            {
              title: 'İşlemler',
              key: 'actions',
              render: (_, record) => (
                <Space>
                  <Button
                    type="text"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => showModal(record)}
                    className="hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                  />
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => deleteMaterial(record.id)}
                    className="hover:bg-red-50 transition-colors duration-200"
                  />
                </Space>
              )
            }
          ]}
          dataSource={filteredMaterials.filter(m => m.category === category.key)}
          rowKey="id"
          className="hover:shadow-sm transition-shadow duration-200"
        />
      )
    }))
  ];

  // Kullanıcı görünümü için eğitim kartları
  const renderTrainingCard = (training: TrainingMaterial) => {
    const userTraining = getUserTrainingStatus(training.id);
    const category = trainingCategories.find(c => c.key === training.category);
    const level = trainingLevels.find(l => l.value === training.level);
    const format = trainingFormats.find(f => f.value === training.format);

    return (
      <Card
        key={training.id}
        className="hover:shadow-md transition-shadow duration-200"
        actions={[
          userTraining?.status === 'completed' ? (
            <Button 
              type="text" 
              icon={<DownloadOutlined />}
              className="hover:bg-green-50 hover:text-green-600 transition-colors duration-200"
            >
              Sertifika İndir
            </Button>
          ) : (
            <Button 
              type="primary" 
              icon={<PlayCircleOutlined />}
              onClick={() => startTraining(training)}
              className="hover:bg-blue-600 hover:border-blue-600 transition-colors duration-200"
            >
              {userTraining?.status === 'in_progress' ? 'Devam Et' : 'Başlat'}
            </Button>
          )
        ]}
      >
        <Card.Meta
          avatar={
            <Badge 
              status={
                userTraining?.status === 'completed' ? 'success' :
                userTraining?.status === 'in_progress' ? 'processing' : 'default'
              }
            >
              <Avatar icon={category?.icon} />
            </Badge>
          }
          title={
            <Space direction="vertical" size={0}>
              <Text strong>{training.title}</Text>
              <Space>
                <Tag color="blue">{category?.name}</Tag>
                <Tag color="green">{level?.label}</Tag>
              </Space>
            </Space>
          }
          description={
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text type="secondary">{training.description}</Text>
              <Space>
                {format?.icon}
                <Text type="secondary">{format?.label}</Text>
                {training.duration && (
                  <>
                    <ClockCircleOutlined />
                    <Text type="secondary">{training.duration} dk</Text>
                  </>
                )}
              </Space>
              {userTraining && userTraining.progress > 0 && (
                <Progress percent={userTraining.progress} size="small" />
              )}
            </Space>
          }
        />
      </Card>
    );
  };

  // Kullanıcı görünümü
  if (!isAdmin) {
    return (
      <div style={{ padding: '24px' }}>
        {/* Kullanıcı İstatistikleri */}
        <Card className="mb-6">
          <Title level={2}>Eğitim Dashboard'u</Title>
          <Row gutter={16}>
            <Col span={6}>
              <Statistic
                title="Toplam Eğitim"
                value={userStats.totalTrainings}
                prefix={<BookOutlined />}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Tamamlanan"
                value={userStats.completedTrainings}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Devam Eden"
                value={userStats.inProgressTrainings}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Sertifikalar"
                value={userStats.certificates}
                prefix={<TrophyOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Col>
          </Row>
        </Card>

        {/* Arama ve Filtreler */}
        <Card className="mb-6">
          <Space>
            <Input
              placeholder="Eğitim ara..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: 300 }}
              className="hover:border-blue-400 focus:border-blue-500 transition-colors duration-200"
            />
          </Space>
        </Card>

        {/* Eğitim Kartları */}
        <Row gutter={[16, 16]}>
          {filteredMaterials.map(training => (
            <Col xs={24} sm={12} md={8} lg={6} key={training.id}>
              {renderTrainingCard(training)}
            </Col>
          ))}
        </Row>

        {/* Eğitim Detay Modal */}
        <Modal
          title="Eğitim Detayı"
          open={!!trainingDetailModal}
          onCancel={() => setTrainingDetailModal(null)}
          footer={[
            <Button key="close" onClick={() => setTrainingDetailModal(null)}>
              Kapat
            </Button>,
            <Button 
              key="complete" 
              type="primary"
              onClick={() => {
                if (trainingDetailModal) {
                  completeTraining(trainingDetailModal.id);
                  setTrainingDetailModal(null);
                }
              }}
              className="hover:bg-green-600 hover:border-green-600 transition-colors duration-200"
            >
              Eğitimi Tamamla
            </Button>
          ]}
          width={800}
        >
          {trainingDetailModal && (
            <div>
              <Title level={4}>{trainingDetailModal.title}</Title>
              <Text>{trainingDetailModal.description}</Text>
              <Divider />
              <Text>Burada eğitim içeriği gösterilecek (video/doküman viewer)</Text>
              <div style={{ height: '300px', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '16px' }}>
                <Text type="secondary">Eğitim İçeriği Placeholder</Text>
              </div>
            </div>
          )}
        </Modal>
      </div>
    );
  }

  // Admin görünümü
  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Title level={2}>Gönüllü Eğitim Yönetimi</Title>
          <Space>
            <Input
              placeholder="Eğitim ara..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: 300 }}
              className="hover:border-blue-400 focus:border-blue-500 transition-colors duration-200"
            />
            <Button
              type="primary"
              icon={<UploadOutlined />}
              onClick={() => showModal()}
              className="hover:bg-blue-600 hover:border-blue-600 transition-colors duration-200 shadow-sm hover:shadow-md"
              style={{ 
                background: '#1890ff',
                borderColor: '#1890ff',
                color: 'white',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              Yeni Eğitim Ekle
            </Button>
          </Space>
        </Space>
      </Card>
      <Card style={{ marginTop: 16 }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={adminTabItems}
        />
      </Card>

      {/* Eğitim Ekleme/Düzenleme Modalı */}
      <Modal
        title={editingMaterial ? "Eğitim Materyali Düzenle" : "Yeni Eğitim Materyali Ekle"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
          preserve={false}
          initialValues={{ level: 'basic', format: 'document' }}
        >
          <Form.Item
            name="title"
            label="Başlık"
            rules={[{ required: true, message: 'Lütfen başlık girin' }]}
          >
            <Input placeholder="Eğitim materyali başlığı" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Açıklama"
            rules={[{ required: true, message: 'Lütfen açıklama girin' }]}
          >
            <Input.TextArea rows={3} placeholder="Eğitim materyalinin içeriği hakkında kısa açıklama" />
          </Form.Item>

          <Space style={{ display: 'flex', marginBottom: 8 }} align="start">
            <Form.Item
              name="category"
              label="Kategori"
              rules={[{ required: true, message: 'Lütfen kategori seçin' }]}
              style={{ width: 200 }}
            >
              <Select placeholder="Kategori seçin">
                {trainingCategories.map(category => (
                  <Select.Option key={category.key} value={category.key}>
                    <Space>
                      {category.icon}
                      {category.name}
                    </Space>
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="level"
              label="Seviye"
              rules={[{ required: true, message: 'Lütfen seviye seçin' }]}
              style={{ width: 150 }}
            >
              <Select placeholder="Seviye seçin">
                {trainingLevels.map(level => (
                  <Select.Option key={level.value} value={level.value}>
                    {level.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="format"
              label="Format"
              rules={[{ required: true, message: 'Lütfen format seçin' }]}
              style={{ width: 150 }}
            >
              <Select placeholder="Format seçin">
                {trainingFormats.map(format => (
                  <Select.Option key={format.value} value={format.value}>
                    <Space>
                      {format.icon}
                      {format.label}
                    </Space>
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Space>

          <Space style={{ display: 'flex', marginBottom: 8 }} align="start">
            <Form.Item
              name="author"
              label="Yazar/Kaynak"
              style={{ width: 250 }}
            >
              <Input placeholder="Eğitim materyalinin yazarı veya kaynağı" />
            </Form.Item>

            <Form.Item
              name="duration"
              label="Süre (dakika)"
              style={{ width: 150 }}
            >
              <Input type="number" placeholder="Dakika" min={1} />
            </Form.Item>

            <Form.Item
              name="tags"
              label="Etiketler"
              style={{ width: 250 }}
            >
              <Select mode="tags" placeholder="Etiketler ekleyin">
                <Select.Option value="CPR">CPR</Select.Option>
                <Select.Option value="Kanama">Kanama</Select.Option>
                <Select.Option value="Kırık">Kırık</Select.Option>
                <Select.Option value="Enkaz">Enkaz</Select.Option>
                <Select.Option value="Telsiz">Telsiz</Select.Option>
                <Select.Option value="Yangın">Yangın</Select.Option>
              </Select>
            </Form.Item>
          </Space>

          <Form.Item
            label="Materyal Dosyası"
            name="fileUpload"
          >
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>Dosya Seç</Button>
            </Upload>
            <Text type="secondary" style={{ marginTop: 8, display: 'block' }}>
              Desteklenen dosya formatları: PDF, DOCX, MP4, MOV, ZIP (max: 100MB)
            </Text>
          </Form.Item>

          <Divider />

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit"
                className="hover:bg-blue-600 hover:border-blue-600 transition-colors duration-200"
              >
                {editingMaterial ? 'Güncelle' : 'Ekle'}
              </Button>
              <Button onClick={handleCancel}>İptal</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default VolunteerTraining; 