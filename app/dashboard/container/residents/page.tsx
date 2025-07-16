"use client";

import React, { useState } from 'react';
import { Table, Button, Space, Input, Card, Typography, Tag, Row, Col, Statistic, Drawer, Form, Select, DatePicker } from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  TeamOutlined,
  UserOutlined,
  HomeOutlined,
  SafetyOutlined,
  CloseOutlined,
  SaveOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const ResidentsPage = () => {
  const router = useRouter();
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [drawerVisible, setDrawerVisible] = useState(false);

  // Örnek istatistik verileri
  const stats = {
    totalResidents: 750,
    totalFamilies: 180,
    specialNeeds: 45,
    occupancyRate: 85,
  };

  // Örnek sakin verileri
  const residentsData = [
    {
      id: 1,
      name: 'Ahmet Yılmaz',
      familyId: 'F001',
      age: 35,
      gender: 'Erkek',
      status: 'Aktif',
      specialNeeds: 'Yok',
      block: 'A',
      unit: '101',
      entryDate: '2025-01-15',
      phone: '0555-111-2233',
    },
    {
      id: 2,
      name: 'Ayşe Demir',
      familyId: 'F002',
      age: 28,
      gender: 'Kadın',
      status: 'Aktif',
      specialNeeds: 'Var',
      block: 'B',
      unit: '205',
      entryDate: '2025-01-16',
      phone: '0555-222-3344',
    },
  ];

  const columns = [
    {
      title: 'Ad Soyad',
      dataIndex: 'name',
      key: 'name',
      filteredValue: [searchText],
      onFilter: (value: string, record: any) =>
        record.name.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: 'Aile No',
      dataIndex: 'familyId',
      key: 'familyId',
    },
    {
      title: 'Yaş',
      dataIndex: 'age',
      key: 'age',
    },
    {
      title: 'Cinsiyet',
      dataIndex: 'gender',
      key: 'gender',
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
      title: 'Özel İhtiyaç',
      dataIndex: 'specialNeeds',
      key: 'specialNeeds',
      render: (specialNeeds: string) => (
        <Tag color={specialNeeds === 'Var' ? 'warning' : 'default'}>
          {specialNeeds}
        </Tag>
      ),
    },
    {
      title: 'Blok/Daire',
      key: 'location',
      render: (text: string, record: any) => (
        `${record.block}-${record.unit}`
      ),
    },
    {
      title: 'Giriş Tarihi',
      dataIndex: 'entryDate',
      key: 'entryDate',
    },
    {
      title: 'İletişim',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button type="link" onClick={() => router.push(`/dashboard/container/residents/${record.id}`)}>
            Detay
          </Button>
          <Button type="link" onClick={() => router.push(`/dashboard/container/residents/${record.id}/edit`)}>
            Düzenle
          </Button>
          <Button type="link" onClick={() => router.push(`/dashboard/container/residents/${record.id}/family`)}>
            Aile
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
          <Title level={2}>Kent Sakinleri</Title>
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
            Yeni Sakin Ekle
          </Button>
        </div>

        {/* İstatistik Kartları */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Toplam Sakin"
                value={stats.totalResidents}
                prefix={<TeamOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Toplam Aile"
                value={stats.totalFamilies}
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Özel İhtiyaç"
                value={stats.specialNeeds}
                prefix={<SafetyOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Doluluk Oranı"
                value={stats.occupancyRate}
                prefix={<HomeOutlined />}
                suffix="%"
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
        </Row>

        <div className="mb-4">
          <Input
            placeholder="Sakin Ara..."
            prefix={<SearchOutlined />}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
        </div>

        <Table
          columns={columns}
          dataSource={residentsData}
          rowKey="id"
          pagination={{
            total: residentsData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
        />
      </Card>

      <Drawer
        title="Yeni Sakin Ekle"
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
            label="Ad Soyad"
            rules={[{ required: true, message: 'Lütfen ad soyad girin' }]}
          >
            <Input placeholder="Ad soyad girin" />
          </Form.Item>

          <Form.Item
            name="familyId"
            label="Aile No"
            rules={[{ required: true, message: 'Lütfen aile no girin' }]}
          >
            <Input placeholder="Aile no girin" />
          </Form.Item>

          <Form.Item
            name="age"
            label="Yaş"
            rules={[{ required: true, message: 'Lütfen yaş girin' }]}
          >
            <Input type="number" placeholder="Yaş girin" />
          </Form.Item>

          <Form.Item
            name="gender"
            label="Cinsiyet"
            rules={[{ required: true, message: 'Lütfen cinsiyet seçin' }]}
          >
            <Select placeholder="Cinsiyet seçin">
              <Option value="Erkek">Erkek</Option>
              <Option value="Kadın">Kadın</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="specialNeeds"
            label="Özel İhtiyaç"
            rules={[{ required: true, message: 'Lütfen özel ihtiyaç durumunu seçin' }]}
          >
            <Select placeholder="Özel ihtiyaç durumunu seçin">
              <Option value="Var">Var</Option>
              <Option value="Yok">Yok</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="block"
            label="Blok"
            rules={[{ required: true, message: 'Lütfen blok seçin' }]}
          >
            <Select placeholder="Blok seçin">
              <Option value="A">A Blok</Option>
              <Option value="B">B Blok</Option>
              <Option value="C">C Blok</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="unit"
            label="Daire"
            rules={[{ required: true, message: 'Lütfen daire no girin' }]}
          >
            <Input placeholder="Daire no girin" />
          </Form.Item>

          <Form.Item
            name="entryDate"
            label="Giriş Tarihi"
            rules={[{ required: true, message: 'Lütfen giriş tarihini seçin' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="phone"
            label="İletişim"
            rules={[{ required: true, message: 'Lütfen telefon numarası girin' }]}
          >
            <Input placeholder="Telefon numarası girin" />
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

export default ResidentsPage; 