"use client";

import React, { useState } from 'react';
import { Table, Button, Space, Input, Card, Typography, Tag, Row, Col, Statistic, Drawer, Form, Select, DatePicker } from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  ToolOutlined,
  AlertOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SettingOutlined,
  CloseOutlined,
  SaveOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const InfrastructurePage = () => {
  const router = useRouter();
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [drawerVisible, setDrawerVisible] = useState(false);

  // Örnek istatistik verileri
  const stats = {
    totalSystems: 45,
    activeSystems: 42,
    maintenanceNeeded: 3,
    uptime: 99.5,
  };

  // Örnek altyapı verileri
  const infrastructureData = [
    {
      id: 1,
      name: 'Elektrik Sistemi',
      type: 'Elektrik',
      status: 'Aktif',
      lastMaintenance: '2025-04-15',
      nextMaintenance: '2025-07-15',
      location: 'A Blok',
      responsiblePerson: 'Mehmet Tekniker',
      condition: 95,
      notes: 'Rutin kontrol yapıldı',
    },
    {
      id: 2,
      name: 'Su Arıtma Sistemi',
      type: 'Su',
      status: 'Bakımda',
      lastMaintenance: '2025-05-10',
      nextMaintenance: '2025-06-10',
      location: 'Teknik Alan',
      responsiblePerson: 'Ali Mühendis',
      condition: 75,
      notes: 'Filtre değişimi gerekiyor',
    },
  ];

  const columns = [
    {
      title: 'Sistem Adı',
      dataIndex: 'name',
      key: 'name',
      filteredValue: [searchText],
      onFilter: (value: string, record: any) =>
        record.name.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: 'Tür',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const typeColors = {
          'Elektrik': 'yellow',
          'Su': 'blue',
          'Isıtma': 'orange',
          'Güvenlik': 'red',
          'İletişim': 'purple',
        };
        return <Tag color={typeColors[type as keyof typeof typeColors]}>{type}</Tag>;
      },
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'Aktif' ? 'success' : status === 'Bakımda' ? 'processing' : 'error'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Son/Sonraki Bakım',
      key: 'maintenance',
      render: (text: string, record: any) => (
        <>
          {record.lastMaintenance}<br />
          {record.nextMaintenance}
        </>
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
      title: 'Durum (%)',
      dataIndex: 'condition',
      key: 'condition',
      render: (condition: number) => (
        <Tag color={condition >= 90 ? 'success' : condition >= 70 ? 'warning' : 'error'}>
          %{condition}
        </Tag>
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button type="link" onClick={() => router.push(`/dashboard/container/infrastructure/${record.id}`)}>
            Detay
          </Button>
          <Button type="link" onClick={() => router.push(`/dashboard/container/infrastructure/${record.id}/edit`)}>
            Düzenle
          </Button>
          <Button type="link" onClick={() => router.push(`/dashboard/container/infrastructure/${record.id}/maintenance`)}>
            Bakım
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
          <Title level={2}>Altyapı Yönetimi</Title>
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
            Yeni Sistem Ekle
          </Button>
        </div>

        {/* İstatistik Kartları */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Toplam Sistem"
                value={stats.totalSystems}
                prefix={<ToolOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Aktif Sistem"
                value={stats.activeSystems}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Bakım Gereken"
                value={stats.maintenanceNeeded}
                prefix={<AlertOutlined />}
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Çalışma Süresi"
                value={stats.uptime}
                prefix={<ClockCircleOutlined />}
                suffix="%"
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
        </Row>

        <div className="mb-4">
          <Input
            placeholder="Sistem Ara..."
            prefix={<SearchOutlined />}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
        </div>

        <Table
          columns={columns}
          dataSource={infrastructureData}
          rowKey="id"
          pagination={{
            total: infrastructureData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
        />
      </Card>

      <Drawer
        title="Yeni Sistem Ekle"
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
            label="Sistem Adı"
            rules={[{ required: true, message: 'Lütfen sistem adını girin' }]}
          >
            <Input placeholder="Sistem adını girin" />
          </Form.Item>

          <Form.Item
            name="type"
            label="Sistem Tipi"
            rules={[{ required: true, message: 'Lütfen sistem tipini seçin' }]}
          >
            <Select placeholder="Sistem tipi seçin">
              <Option value="Elektrik">Elektrik</Option>
              <Option value="Su">Su</Option>
              <Option value="Isıtma">Isıtma</Option>
              <Option value="Güvenlik">Güvenlik</Option>
              <Option value="İletişim">İletişim</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="location"
            label="Konum"
            rules={[{ required: true, message: 'Lütfen konum bilgisini girin' }]}
          >
            <Input placeholder="Konum bilgisini girin" />
          </Form.Item>

          <Form.Item
            name="responsiblePerson"
            label="Sorumlu Kişi"
            rules={[{ required: true, message: 'Lütfen sorumlu kişiyi seçin' }]}
          >
            <Select placeholder="Sorumlu kişi seçin">
              <Option value="1">Mehmet Tekniker</Option>
              <Option value="2">Ali Mühendis</Option>
              <Option value="3">Ayşe Teknisyen</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="installationDate"
            label="Kurulum Tarihi"
            rules={[{ required: true, message: 'Lütfen kurulum tarihini seçin' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="maintenancePeriod"
            label="Bakım Periyodu (Gün)"
            rules={[{ required: true, message: 'Lütfen bakım periyodunu girin' }]}
          >
            <Input type="number" placeholder="Bakım periyodunu girin" />
          </Form.Item>

          <Form.Item
            name="specifications"
            label="Teknik Özellikler"
          >
            <TextArea rows={4} placeholder="Sistemin teknik özelliklerini girin" />
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

export default InfrastructurePage; 