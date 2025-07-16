'use client';

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Tag, 
  Button, 
  Space, 
  Typography, 
  Tabs, 
  Drawer, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  Divider, 
  Alert
} from 'antd';
import {
  EyeOutlined,
  PlusOutlined,
  ArrowLeftOutlined,
  EnvironmentOutlined,
  EditOutlined,
  CloseOutlined,
  SaveOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import LocationSelector from '../../components/LocationSelector';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface CampData {
  id: string;
  name: string;
  type: string;
  location: string;
  capacity: number;
  currentOccupancy: number;
  status: string;
  description?: string;
  region?: {
    id: string;
    name: string;
    type: string;
  };
}

const ContainerListPage = () => {
  const router = useRouter();
  const [camps, setCamps] = useState<CampData[]>([]);
  const [loading, setLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [form] = Form.useForm();

  // Kampları yükle
  const loadCamps = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/containers');
      const result = await response.json();
      
      if (result.success) {
        setCamps(result.data);
      } else {
        console.error('Kamp listesi yüklenemedi:', result.error);
      }
    } catch (error) {
      console.error('API hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCamps();
  }, []);

  // Detay sayfasına git
  const handleViewDetail = (campId: string) => {
    router.push(`/dashboard/container/${campId}`);
  };

  // Yeni kent ekleme
  const showDrawer = () => {
    setDrawerVisible(true);
  };

  const onClose = () => {
    setDrawerVisible(false);
    setShowLocationSelector(false);
    setSelectedLocation(null);
    form.resetFields();
  };

  const onFinish = async (values: any) => {
    try {
      console.log(' Form gönderiliyor:', values);
      
      const formData = {
        ...values,
        locationData: selectedLocation
      };

      const response = await fetch('/api/containers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        console.log(' Kamp başarıyla oluşturuldu:', result.data);
        
        // Form'u kapat ve temizle
        setDrawerVisible(false);
        setShowLocationSelector(false);
        setSelectedLocation(null);
        form.resetFields();
        
        // Kampları yeniden yükle
        loadCamps();
      } else {
        console.error(' Kamp oluşturma hatası:', result.error);
      }
    } catch (error) {
      console.error(' API çağrısı hatası:', error);
    }
  };

  const handleLocationSelect = (bounds: any) => {
    setSelectedLocation(bounds);
    setShowLocationSelector(false);
    
    // Form alanlarını güncelle
    form.setFieldsValue({
      location: `Lat: ${bounds.center[0].toFixed(4)}, Lng: ${bounds.center[1].toFixed(4)}`,
      coordinates: `${bounds.north.toFixed(4)},${bounds.south.toFixed(4)},${bounds.east.toFixed(4)},${bounds.west.toFixed(4)}`
    });
  };

  const handleShowLocationSelector = () => {
    setShowLocationSelector(true);
  };

  // Tablo kolonları
  const columns = [
    {
      title: 'Kent Adı',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: CampData) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.region?.name}
          </Text>
        </div>
      ),
    },
    {
      title: 'Tip',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const typeConfig = {
          CONTAINER: { color: 'blue', icon: '', text: 'Konteyner' },
          TENT: { color: 'green', icon: '', text: 'Çadır' },
          MIXED: { color: 'orange', icon: '', text: 'Karma' },
          OTHER: { color: 'gray', icon: '', text: 'Diğer' }
        };
        const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.OTHER;
        return (
          <Tag color={config.color}>
            {config.icon} {config.text}
          </Tag>
        );
      },
    },
    {
      title: 'Kapasite',
      dataIndex: 'capacity',
      key: 'capacity',
      render: (capacity: number, record: CampData) => (
        <div>
          <Text>{record.currentOccupancy} / {capacity}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            %{Math.round((record.currentOccupancy / capacity) * 100)} dolu
          </Text>
        </div>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusConfig = {
          ACTIVE: { color: 'green', text: 'Aktif' },
          INACTIVE: { color: 'red', text: 'Pasif' },
          MAINTENANCE: { color: 'orange', text: 'Bakımda' },
          CLOSED: { color: 'gray', text: 'Kapalı' }
        };
        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.ACTIVE;
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: 'Konum',
      dataIndex: 'location',
      key: 'location',
      render: (location: string) => (
        <Text ellipsis style={{ maxWidth: 200 }}>{location}</Text>
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (_: any, record: CampData) => (
        <Space>
          <Button 
            type="primary" 
            size="small" 
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record.id)}
          >
            Detay
          </Button>
        </Space>
      ),
    },
  ];

  // Kamp tipine göre filtreleme
  const filterCampsByType = (type: string) => {
    return camps.filter(camp => camp.type === type);
  };

  // İstatistikler
  const stats = {
    total: camps.length,
    container: camps.filter(c => c.type === 'CONTAINER').length,
    tent: camps.filter(c => c.type === 'TENT').length,
    mixed: camps.filter(c => c.type === 'MIXED').length
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => router.push('/dashboard/container')}
          >
            Geri
          </Button>
          <Title level={2} style={{ margin: 0 }}>Kent Listesi</Title>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={showDrawer}
          size="large"
        >
          Yeni Kent Ekle
        </Button>
      </div>

      {/* Kent Listesi */}
      <Card title=" Mevcut Kentler" loading={loading}>
        <Tabs 
          defaultActiveKey="all"
          items={[
            {
              key: 'all',
              label: `Tümü (${stats.total})`,
              children: (
                <Table 
                  columns={columns} 
                  dataSource={camps}
                  rowKey="id"
                  loading={loading}
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: 800 }}
                />
              )
            },
            {
              key: 'container',
              label: ` Konteyner (${stats.container})`,
              children: (
                <Table 
                  columns={columns} 
                  dataSource={filterCampsByType('CONTAINER')}
                  rowKey="id"
                  loading={loading}
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: 800 }}
                />
              )
            },
            {
              key: 'tent',
              label: ` Çadır (${stats.tent})`,
              children: (
                <Table 
                  columns={columns} 
                  dataSource={filterCampsByType('TENT')}
                  rowKey="id"
                  loading={loading}
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: 800 }}
                />
              )
            },
            {
              key: 'mixed',
              label: ` Karma (${stats.mixed})`,
              children: (
                <Table 
                  columns={columns} 
                  dataSource={filterCampsByType('MIXED')}
                  rowKey="id"
                  loading={loading}
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: 800 }}
                />
              )
            }
          ]}
        />
      </Card>

      {/* Yeni Kent Ekleme Drawer */}
      <Drawer
        title="Yeni Kent Ekle"
        width={showLocationSelector ? 1200 : 720}
        onClose={onClose}
        open={drawerVisible}
        styles={{
          body: { paddingBottom: 80 }
        }}
        extra={
          <Space>
            <Button onClick={onClose} icon={<CloseOutlined />}>İptal</Button>
            <Button 
              type="primary" 
              onClick={() => form.submit()}
              icon={<SaveOutlined />}
            >
              Kaydet
            </Button>
          </Space>
        }
      >
        {showLocationSelector ? (
          <LocationSelector
            onLocationSelect={handleLocationSelect}
            onCancel={() => setShowLocationSelector(false)}
            initialCenter={[39.9334, 32.8597]}
            initialZoom={6}
          />
        ) : (
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
          >
            <Form.Item
              name="name"
              label="Kent Adı"
              rules={[{ required: true, message: 'Lütfen kent adını girin' }]}
            >
              <Input placeholder="Kent adını girin" />
            </Form.Item>

            <Form.Item
              name="type"
              label="Kent Tipi"
              rules={[{ required: true, message: 'Lütfen kent tipini seçin' }]}
            >
              <Select placeholder="Kent tipi seçin">
                <Option value="container"> Konteyner Kent</Option>
                <Option value="tent"> Çadır Kent</Option>
                <Option value="mixed"> Karma Kent</Option>
                <Option value="other"> Diğer Kent</Option>
              </Select>
            </Form.Item>

            <Divider orientation="left">
              <Space>
                <EnvironmentOutlined />
                <Text strong>Konum Bilgileri</Text>
              </Space>
            </Divider>

            <Form.Item
              name="location"
              label="Konum"
              rules={[{ required: true, message: 'Lütfen konum bilgisini girin veya haritadan seçin' }]}
            >
              <Space.Compact style={{ width: '100%' }}>
                <Input
                  style={{ width: 'calc(100% - 140px)' }}
                  placeholder="Konum bilgisini girin veya haritadan seçin"
                />
                <Button
                  type="primary"
                  icon={<EnvironmentOutlined />}
                  onClick={handleShowLocationSelector}
                  style={{ width: '140px' }}
                >
                  Haritadan Seç
                </Button>
              </Space.Compact>
            </Form.Item>

            <Form.Item
              name="coordinates"
              label="Koordinatlar (Otomatik)"
              help="Harita seçimi yapıldığında otomatik olarak doldurulur"
            >
              <Input 
                placeholder="Kuzey,Güney,Doğu,Batı koordinatları"
                disabled
                style={{ backgroundColor: '#f5f5f5' }}
              />
            </Form.Item>

            {selectedLocation && (
              <Alert
                message="Konum Seçildi"
                description={
                  <div>
                    <Text> Merkez: {selectedLocation.center[0].toFixed(4)}, {selectedLocation.center[1].toFixed(4)}</Text><br/>
                    <Text> Alan: {selectedLocation.area} km</Text><br/>
                    <Text> Sınırlar: K:{selectedLocation.north.toFixed(4)} G:{selectedLocation.south.toFixed(4)} D:{selectedLocation.east.toFixed(4)} B:{selectedLocation.west.toFixed(4)}</Text>
                  </div>
                }
                type="success"
                showIcon
                style={{ marginBottom: 16 }}
                action={
                  <Button
                    size="small"
                    icon={<EditOutlined />}
                    onClick={handleShowLocationSelector}
                  >
                    Düzenle
                  </Button>
                }
              />
            )}

            <Form.Item
              name="capacity"
              label="Kapasite"
              rules={[{ required: true, message: 'Lütfen kapasite bilgisini girin' }]}
            >
              <Input type="number" placeholder="Kapasite bilgisini girin" />
            </Form.Item>

            <Form.Item
              name="startDate"
              label="Kuruluş Tarihi"
              rules={[{ required: true, message: 'Lütfen kuruluş tarihini seçin' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="description"
              label="Açıklama"
            >
              <TextArea rows={4} placeholder="Kent hakkında açıklama girin" />
            </Form.Item>
          </Form>
        )}
      </Drawer>
    </div>
  );
};

export default ContainerListPage;
