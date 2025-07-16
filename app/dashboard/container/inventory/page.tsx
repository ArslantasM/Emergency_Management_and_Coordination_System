"use client";

import React, { useState } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Input, 
  Card, 
  Typography, 
  Tag, 
  Row, 
  Col, 
  Statistic, 
  Progress,
  Drawer,
  Form,
  Select,
  InputNumber,
  App
} from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  DatabaseOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  InboxOutlined,
  SaveOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const { Title } = Typography;
const { Option } = Select;

interface InventoryItem {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minQuantity: number;
  maxQuantity: number;
  status: string;
  location: string;
  lastUpdate: string;
  value: number;
}

const InventoryPage = () => {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [form] = Form.useForm();
  const { notification } = App.useApp();

  // Örnek istatistik verileri
  const stats = {
    totalItems: 1500,
    lowStock: 45,
    criticalStock: 12,
    stockValue: 750000,
  };

  // Örnek envanter verileri
  const inventoryData: InventoryItem[] = [
    {
      id: 1,
      name: 'Battaniye',
      category: 'Barınma',
      quantity: 500,
      unit: 'adet',
      minQuantity: 100,
      maxQuantity: 1000,
      status: 'Normal',
      location: 'A Deposu',
      lastUpdate: '2025-05-22',
      value: 25000,
    },
    {
      id: 2,
      name: 'İçme Suyu',
      category: 'Gıda',
      quantity: 1000,
      unit: 'litre',
      minQuantity: 500,
      maxQuantity: 5000,
      status: 'Düşük Stok',
      location: 'B Deposu',
      lastUpdate: '2025-05-22',
      value: 15000,
    },
  ];

  const categories = ['Barınma', 'Gıda', 'Sağlık', 'Hijyen', 'Giyim', 'Araç-Gereç', 'Elektronik'];
  const units = ['adet', 'kg', 'litre', 'paket', 'kutu', 'metre', 'ton'];
  const locations = ['A Deposu', 'B Deposu', 'C Deposu', 'D Deposu', 'Merkez Depo', 'Acil Durum Deposu'];

  const handleAddItem = () => {
    form.resetFields();
    setEditingItem(null);
    setDrawerVisible(true);
  };

  const handleEditItem = (item: InventoryItem) => {
    form.setFieldsValue(item);
    setEditingItem(item);
    setDrawerVisible(true);
  };

  const handleDeleteItem = (item: InventoryItem) => {
    // Delete confirmation modal would be here
    notification.success({ message: `${item.name} başarıyla silindi` });
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingItem) {
        notification.success({ message: 'Envanter başarıyla güncellendi' });
      } else {
        notification.success({ message: 'Envanter başarıyla eklendi' });
      }
      setDrawerVisible(false);
      // API call would be here
    } catch (error) {
      notification.error({ message: 'Envanter kaydedilirken bir hata oluştu' });
    }
  };

  const columns = [
    {
      title: 'Malzeme Adı',
      dataIndex: 'name',
      key: 'name',
      filteredValue: [searchText],
      onFilter: (value: string, record: InventoryItem) =>
        record.name.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: 'Kategori',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => {
        const categoryColors = {
          'Barınma': 'blue',
          'Gıda': 'green',
          'Sağlık': 'red',
          'Hijyen': 'purple',
          'Giyim': 'orange',
          'Araç-Gereç': 'cyan',
          'Elektronik': 'magenta'
        };
        return <Tag color={categoryColors[category as keyof typeof categoryColors]}>{category}</Tag>;
      },
    },
    {
      title: 'Miktar',
      key: 'quantity',
      render: (text: string, record: InventoryItem) => (
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <span>{record.quantity} {record.unit}</span>
          <Progress 
            percent={Math.round((record.quantity / record.maxQuantity) * 100)} 
            size="small"
            status={
              record.quantity <= record.minQuantity 
                ? 'exception' 
                : record.quantity >= record.maxQuantity 
                  ? 'success' 
                  : 'active'
            }
          />
        </Space>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusColors = {
          'Normal': 'success',
          'Düşük Stok': 'warning',
          'Kritik Stok': 'error',
          'Fazla Stok': 'processing',
        };
        return <Tag color={statusColors[status as keyof typeof statusColors]}>{status}</Tag>;
      },
    },
    {
      title: 'Konum',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Son Güncelleme',
      dataIndex: 'lastUpdate',
      key: 'lastUpdate',
    },
    {
      title: 'Değer',
      dataIndex: 'value',
      key: 'value',
      render: (value: number) => (
        `₺${value.toLocaleString()}`
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (_: any, record: InventoryItem) => (
        <Space size="middle">
          <Button 
            type="link" 
            size="small"
            onClick={() => router.push(`/dashboard/container/inventory/${record.id}`)}
            className="hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
          >
            Detay
          </Button>
          <Button 
            type="link" 
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditItem(record)}
            className="hover:bg-green-50 hover:text-green-600 transition-colors duration-200"
          >
            Düzenle
          </Button>
          <Button 
            type="link" 
            size="small"
            onClick={() => router.push(`/dashboard/container/inventory/${record.id}/transfer`)}
            className="hover:bg-orange-50 hover:text-orange-600 transition-colors duration-200"
          >
            Transfer
          </Button>
          <Button 
            type="link" 
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteItem(record)}
            className="hover:bg-red-50 transition-colors duration-200"
          >
            Sil
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card>
        <div className="flex justify-between items-center mb-4">
          <Title level={2}>Konteyner Envanteri</Title>
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddItem}
              className="hover:bg-blue-600 hover:border-blue-600 transition-colors duration-200 shadow-sm hover:shadow-md"
              style={{ 
                background: '#1890ff',
                borderColor: '#1890ff',
                color: 'white',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              Yeni Envanter Ekle
            </Button>
          </Space>
        </div>

        {/* İstatistik Kartları */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} md={6}>
            <Card className="hover:shadow-md transition-shadow duration-200">
              <Statistic
                title="Toplam Ürün"
                value={stats.totalItems}
                prefix={<DatabaseOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="hover:shadow-md transition-shadow duration-200">
              <Statistic
                title="Düşük Stok"
                value={stats.lowStock}
                prefix={<WarningOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="hover:shadow-md transition-shadow duration-200">
              <Statistic
                title="Kritik Stok"
                value={stats.criticalStock}
                prefix={<WarningOutlined />}
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="hover:shadow-md transition-shadow duration-200">
              <Statistic
                title="Toplam Değer"
                value={stats.stockValue}
                prefix="₺"
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
        </Row>

        <div className="mb-4">
          <Input
            placeholder="Envanter Ara..."
            prefix={<SearchOutlined />}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            className="hover:border-blue-400 focus:border-blue-500 transition-colors duration-200"
          />
        </div>

        <Table
          columns={columns}
          dataSource={inventoryData}
          rowKey="id"
          pagination={{
            total: inventoryData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
          className="hover:shadow-sm transition-shadow duration-200"
        />
      </Card>

      {/* Yeni Envanter Ekleme/Düzenleme Drawer */}
      <Drawer
        title={editingItem ? 'Envanter Düzenle' : 'Yeni Envanter Ekle'}
        width={600}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        styles={{ body: { paddingBottom: 80 } }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          preserve={false}
        >
          <Form.Item
            name="name"
            label="Malzeme Adı"
            rules={[{ required: true, message: 'Lütfen malzeme adını girin' }]}
          >
            <Input placeholder="Malzeme adını girin" />
          </Form.Item>

          <Form.Item
            name="category"
            label="Kategori"
            rules={[{ required: true, message: 'Lütfen kategori seçin' }]}
          >
            <Select placeholder="Kategori seçin">
              {categories.map(category => (
                <Option key={category} value={category}>{category}</Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="quantity"
                label="Miktar"
                rules={[{ required: true, message: 'Lütfen miktar girin' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} placeholder="0" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="unit"
                label="Birim"
                rules={[{ required: true, message: 'Lütfen birim seçin' }]}
              >
                <Select placeholder="Birim seçin">
                  {units.map(unit => (
                    <Option key={unit} value={unit}>{unit}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="minQuantity"
                label="Minimum Stok"
                rules={[{ required: true, message: 'Lütfen minimum stok miktarını girin' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} placeholder="0" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="maxQuantity"
                label="Maksimum Stok"
                rules={[{ required: true, message: 'Lütfen maksimum stok miktarını girin' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} placeholder="0" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="location"
            label="Depo Konumu"
            rules={[{ required: true, message: 'Lütfen konum seçin' }]}
          >
            <Select placeholder="Konum seçin">
              {locations.map(location => (
                <Option key={location} value={location}>{location}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="value"
            label="Birim Değer (₺)"
            rules={[{ required: true, message: 'Lütfen birim değer girin' }]}
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              placeholder="0.00"
              formatter={value => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value!.replace(/₺\s?|(,*)/g, '')}
            />
          </Form.Item>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button onClick={() => setDrawerVisible(false)}>
              İptal
            </Button>
            <Button 
              type="primary" 
              htmlType="submit"
              icon={<SaveOutlined />}
              className="hover:bg-blue-600 hover:border-blue-600 transition-colors duration-200"
            >
              {editingItem ? 'Güncelle' : 'Kaydet'}
            </Button>
          </div>
        </Form>
      </Drawer>
    </div>
  );
};

export default InventoryPage; 