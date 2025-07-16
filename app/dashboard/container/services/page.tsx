"use client";

import React, { useState } from 'react';
import { Table, Button, Space, Input, Card, Typography, Tag, Row, Col, Statistic, Drawer, Form, Select, DatePicker, TimePicker } from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  CustomerServiceOutlined,
  HeartOutlined,
  BookOutlined,
  SafetyOutlined,
  StarOutlined,
  CloseOutlined,
  SaveOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const ServicesPage = () => {
  const router = useRouter();
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [drawerVisible, setDrawerVisible] = useState(false);

  // Örnek istatistik verileri
  const stats = {
    totalServices: 24,
    activeServices: 18,
    satisfaction: 92,
    dailyCapacity: 750,
  };

  // Örnek hizmet verileri
  const servicesData = [
    {
      id: 1,
      name: 'Sağlık Taraması',
      category: 'Sağlık',
      status: 'Aktif',
      schedule: 'Her Gün',
      capacity: 100,
      currentUsage: 85,
      location: 'Sağlık Merkezi',
      responsiblePerson: 'Dr. Ayşe Yılmaz',
      satisfaction: 95,
    },
    {
      id: 2,
      name: 'Eğitim Programı',
      category: 'Eğitim',
      status: 'Aktif',
      schedule: 'Hafta İçi',
      capacity: 50,
      currentUsage: 45,
      location: 'Eğitim Salonu',
      responsiblePerson: 'Mehmet Öğretmen',
      satisfaction: 90,
    },
  ];

  const columns = [
    {
      title: 'Hizmet Adı',
      dataIndex: 'name',
      key: 'name',
      filteredValue: [searchText],
      onFilter: (value: string, record: any) =>
        record.name.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: 'Kategori',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => {
        const categoryColors = {
          'Sağlık': 'red',
          'Eğitim': 'blue',
          'Güvenlik': 'green',
          'Sosyal': 'purple',
          'Spor': 'orange',
        };
        return <Tag color={categoryColors[category as keyof typeof categoryColors]}>{category}</Tag>;
      },
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'Aktif' ? 'success' : 'error'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Program',
      dataIndex: 'schedule',
      key: 'schedule',
    },
    {
      title: 'Kapasite/Kullanım',
      key: 'usage',
      render: (text: string, record: any) => (
        `${record.currentUsage}/${record.capacity}`
      ),
    },
    {
      title: 'Konum',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Sorumlu',
      dataIndex: 'responsiblePerson',
      key: 'responsiblePerson',
    },
    {
      title: 'Memnuniyet',
      dataIndex: 'satisfaction',
      key: 'satisfaction',
      render: (satisfaction: number) => (
        <Tag color={satisfaction >= 90 ? 'success' : satisfaction >= 70 ? 'warning' : 'error'}>
          %{satisfaction}
        </Tag>
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button type="link" onClick={() => router.push(`/dashboard/container/services/${record.id}`)}>
            Detay
          </Button>
          <Button type="link" onClick={() => router.push(`/dashboard/container/services/${record.id}/edit`)}>
            Düzenle
          </Button>
          <Button type="link" onClick={() => router.push(`/dashboard/container/services/${record.id}/schedule`)}>
            Program
          </Button>
        </Space>
      ),
    },
  ];

  const showDrawer = () => {
    setDrawerVisible(true);
  };

  const onClose = () => {
    setDrawerVisible(false);
    form.resetFields();
  };

  const onFinish = (values: any) => {
    console.log('Form values:', values);
    setDrawerVisible(false);
    form.resetFields();
  };

  return (
    <div className="p-6">
      <Card>
        <div className="flex justify-between items-center mb-4">
          <Title level={2}>Hizmet Yönetimi</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={showDrawer}
            style={{ 
              background: '#1890ff',
              borderColor: '#1890ff',
              color: 'white',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            Yeni Hizmet Ekle
          </Button>
        </div>

        {/* İstatistik Kartları */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Toplam Hizmet"
                value={stats.totalServices}
                prefix={<CustomerServiceOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Aktif Hizmet"
                value={stats.activeServices}
                prefix={<HeartOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Memnuniyet Oranı"
                value={stats.satisfaction}
                prefix={<StarOutlined />}
                suffix="%"
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Günlük Kapasite"
                value={stats.dailyCapacity}
                prefix={<SafetyOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
        </Row>

        <div className="mb-4">
          <Input
            placeholder="Hizmet Ara..."
            prefix={<SearchOutlined />}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
        </div>

        <Table
          columns={columns}
          dataSource={servicesData}
          rowKey="id"
          pagination={{
            total: servicesData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
        />
      </Card>

      <Drawer
        title="Yeni Hizmet Ekle"
        width={720}
        onClose={onClose}
        open={drawerVisible}
        bodyStyle={{ paddingBottom: 80 }}
        extra={
          <Space>
            <Button onClick={onClose} icon={<CloseOutlined />}>İptal</Button>
            <Button 
              type="primary" 
              onClick={() => form.submit()}
              icon={<SaveOutlined />}
              style={{ 
                background: '#1890ff',
                borderColor: '#1890ff',
                color: 'white',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              Kaydet
            </Button>
          </Space>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            name="name"
            label="Hizmet Adı"
            rules={[{ required: true, message: 'Lütfen hizmet adını girin' }]}
          >
            <Input placeholder="Hizmet adını girin" />
          </Form.Item>

          <Form.Item
            name="category"
            label="Kategori"
            rules={[{ required: true, message: 'Lütfen kategori seçin' }]}
          >
            <Select placeholder="Kategori seçin">
              <Option value="Sağlık">Sağlık</Option>
              <Option value="Eğitim">Eğitim</Option>
              <Option value="Güvenlik">Güvenlik</Option>
              <Option value="Sosyal">Sosyal</Option>
              <Option value="Spor">Spor</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="schedule"
            label="Program"
            rules={[{ required: true, message: 'Lütfen program seçin' }]}
          >
            <Select placeholder="Program seçin">
              <Option value="Her Gün">Her Gün</Option>
              <Option value="Hafta İçi">Hafta İçi</Option>
              <Option value="Hafta Sonu">Hafta Sonu</Option>
              <Option value="Belirli Günler">Belirli Günler</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="capacity"
            label="Kapasite"
            rules={[{ required: true, message: 'Lütfen kapasite girin' }]}
          >
            <Input type="number" placeholder="Kapasite girin" />
          </Form.Item>

          <Form.Item
            name="location"
            label="Konum"
            rules={[{ required: true, message: 'Lütfen konum seçin' }]}
          >
            <Select placeholder="Konum seçin">
              <Option value="Sağlık Merkezi">Sağlık Merkezi</Option>
              <Option value="Eğitim Salonu">Eğitim Salonu</Option>
              <Option value="Spor Salonu">Spor Salonu</Option>
              <Option value="Sosyal Alan">Sosyal Alan</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="responsiblePerson"
            label="Sorumlu Kişi"
            rules={[{ required: true, message: 'Lütfen sorumlu kişiyi seçin' }]}
          >
            <Select placeholder="Sorumlu kişi seçin">
              <Option value="1">Dr. Ayşe Yılmaz</Option>
              <Option value="2">Mehmet Öğretmen</Option>
              <Option value="3">Ali Antrenör</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="startDate"
            label="Başlangıç Tarihi"
            rules={[{ required: true, message: 'Lütfen başlangıç tarihini seçin' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="workingHours"
            label="Çalışma Saatleri"
            rules={[{ required: true, message: 'Lütfen çalışma saatlerini seçin' }]}
          >
            <Space>
              <TimePicker format="HH:mm" placeholder="Başlangıç" />
              <TimePicker format="HH:mm" placeholder="Bitiş" />
            </Space>
          </Form.Item>

          <Form.Item
            name="description"
            label="Açıklama"
          >
            <TextArea rows={4} placeholder="Hizmet açıklaması girin" />
          </Form.Item>

          <Form.Item
            name="notes"
            label="Notlar"
          >
            <TextArea rows={4} placeholder="Ek notlar girin" />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default ServicesPage; 