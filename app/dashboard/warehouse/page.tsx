'use client';

import { useEffect, useState } from 'react';
import { Table, Button, Space, Typography, notification, Drawer, Form, Input, Select, InputNumber, Switch, App } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const { Title } = Typography;
const { Option } = Select;

interface Warehouse {
  id: string;
  name: string;
  code: string;
  description: string;
  address: string;
  size: number;
  capacity: number;
  status: string;
  type?: string;
  manager?: string;
  phone?: string;
  email?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  isActive?: boolean;
}

const WarehouseList = () => {
  const router = useRouter();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [form] = Form.useForm();
  const { notification: notificationApi } = App.useApp();

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    try {
      const response = await axios.get('/api/warehouse');
      // API returns { warehouses: [...] } format
      setWarehouses(response.data.warehouses || []);
      setLoading(false);
    } catch (error) {
      notificationApi.error({ message: 'Depo listesi yüklenirken bir hata oluştu.' });
      setWarehouses([]); // Ensure it's always an array
      setLoading(false);
    }
  };

  const handleAddWarehouse = () => {
    form.resetFields();
    setEditingWarehouse(null);
    setDrawerVisible(true);
  };

  const handleEditWarehouse = (warehouse: Warehouse) => {
    form.setFieldsValue(warehouse);
    setEditingWarehouse(warehouse);
    setDrawerVisible(true);
  };

  const handleDeleteWarehouse = async (warehouse: Warehouse) => {
    try {
      await axios.delete(`/api/warehouse/${warehouse.id}`);
      notificationApi.success({ message: 'Depo başarıyla silindi' });
      fetchWarehouses();
    } catch (error) {
      notificationApi.error({ message: 'Depo silinirken bir hata oluştu' });
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingWarehouse) {
        await axios.put(`/api/warehouse/${editingWarehouse.id}`, values);
        notificationApi.success({ message: 'Depo başarıyla güncellendi' });
      } else {
        await axios.post('/api/warehouse', values);
        notificationApi.success({ message: 'Depo başarıyla eklendi' });
      }
      setDrawerVisible(false);
      fetchWarehouses();
    } catch (error) {
      notificationApi.error({ message: 'Depo kaydedilirken bir hata oluştu' });
    }
  };

  const columns = [
    {
      title: 'Depo Adı',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Kod',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: 'Tür',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const typeMap: { [key: string]: string } = {
          'general': 'Genel',
          'cold': 'Soğuk Hava',
          'hazardous': 'Tehlikeli Madde',
          'medical': 'Tıbbi Malzeme',
          'food': 'Gıda'
        };
        return typeMap[type] || type;
      }
    },
    {
      title: 'Açıklama',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Adres',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'Boyut (m²)',
      dataIndex: 'size',
      key: 'size',
    },
    {
      title: 'Kapasite',
      dataIndex: 'capacity',
      key: 'capacity',
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (text: string, record: Warehouse) => (
        <Space>
          <Button 
            type="link" 
            size="small"
            onClick={() => router.push(`/dashboard/warehouse/stock?id=${record.id}`)}
            className="hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
          >
            Stok
          </Button>
          <Button 
            type="link" 
            size="small"
            onClick={() => router.push(`/dashboard/warehouse/personnel?id=${record.id}`)}
            className="hover:bg-green-50 hover:text-green-600 transition-colors duration-200"
          >
            Personel
          </Button>
          <Button 
            type="link" 
            size="small"
            onClick={() => router.push(`/dashboard/warehouse/vehicles?id=${record.id}`)}
            className="hover:bg-purple-50 hover:text-purple-600 transition-colors duration-200"
          >
            Araçlar
          </Button>
          <Button 
            type="link" 
            size="small"
            onClick={() => router.push(`/dashboard/warehouse/reports?id=${record.id}`)}
            className="hover:bg-orange-50 hover:text-orange-600 transition-colors duration-200"
          >
            Raporlar
          </Button>
          <Button 
            type="link" 
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditWarehouse(record)}
            className="hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
          >
            Düzenle
          </Button>
          <Button 
            type="link" 
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteWarehouse(record)}
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
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>Depo Listesi</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={handleAddWarehouse}
          className="hover:bg-blue-600 hover:border-blue-600 transition-colors duration-200 shadow-sm hover:shadow-md"
          style={{ 
            background: '#1890ff',
            borderColor: '#1890ff',
            color: 'white',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          Yeni Depo Ekle
        </Button>
      </div>
      
      <Table
        columns={columns}
        dataSource={warehouses}
        loading={loading}
        rowKey="id"
        scroll={{ x: true }}
        className="bg-white rounded-lg shadow"
      />

      {/* Yeni Depo Ekleme/Düzenleme Drawer */}
      <Drawer
        title={editingWarehouse ? 'Depo Düzenle' : 'Yeni Depo Ekle'}
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
          initialValues={{
            isActive: true,
            type: 'general'
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="name"
              label="Depo Adı"
              rules={[{ required: true, message: 'Depo adı gerekli!' }]}
            >
              <Input placeholder="Depo adını girin" />
            </Form.Item>

            <Form.Item
              name="code"
              label="Depo Kodu"
              rules={[{ required: true, message: 'Depo kodu gerekli!' }]}
            >
              <Input placeholder="Depo kodunu girin" />
            </Form.Item>

            <Form.Item
              name="type"
              label="Depo Türü"
              rules={[{ required: true, message: 'Depo türü gerekli!' }]}
            >
              <Select placeholder="Depo türünü seçin">
                <Option value="general">Genel Depo</Option>
                <Option value="cold">Soğuk Hava Deposu</Option>
                <Option value="hazardous">Tehlikeli Madde Deposu</Option>
                <Option value="medical">Tıbbi Malzeme Deposu</Option>
                <Option value="food">Gıda Deposu</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="status"
              label="Durum"
              rules={[{ required: true, message: 'Durum gerekli!' }]}
            >
              <Select placeholder="Durumu seçin">
                <Option value="active">Aktif</Option>
                <Option value="inactive">Pasif</Option>
                <Option value="maintenance">Bakımda</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="size"
              label="Boyut (m²)"
              rules={[{ required: true, message: 'Boyut gerekli!' }]}
            >
              <InputNumber 
                min={1} 
                placeholder="Depo boyutunu girin"
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item
              name="capacity"
              label="Kapasite"
              rules={[{ required: true, message: 'Kapasite gerekli!' }]}
            >
              <InputNumber 
                min={1} 
                placeholder="Depo kapasitesini girin"
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item
              name="manager"
              label="Sorumlu Kişi"
            >
              <Input placeholder="Sorumlu kişi adını girin" />
            </Form.Item>

            <Form.Item
              name="phone"
              label="Telefon"
            >
              <Input placeholder="Telefon numarasını girin" />
            </Form.Item>
          </div>

          <Form.Item
            name="address"
            label="Adres"
            rules={[{ required: true, message: 'Adres gerekli!' }]}
          >
            <Input.TextArea 
              rows={3} 
              placeholder="Depo adresini girin"
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Açıklama"
          >
            <Input.TextArea 
              rows={3} 
              placeholder="Depo açıklamasını girin"
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="E-posta"
          >
            <Input placeholder="E-posta adresini girin" />
          </Form.Item>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name={['coordinates', 'lat']}
              label="Enlem (Latitude)"
            >
              <InputNumber 
                placeholder="Enlem koordinatı"
                style={{ width: '100%' }}
                step={0.000001}
              />
            </Form.Item>

            <Form.Item
              name={['coordinates', 'lng']}
              label="Boylam (Longitude)"
            >
              <InputNumber 
                placeholder="Boylam koordinatı"
                style={{ width: '100%' }}
                step={0.000001}
              />
            </Form.Item>
          </div>

          <Form.Item
            name="isActive"
            label="Aktif Durum"
            valuePropName="checked"
          >
            <Switch checkedChildren="Aktif" unCheckedChildren="Pasif" />
          </Form.Item>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button onClick={() => setDrawerVisible(false)}>
              İptal
            </Button>
            <Button 
              type="primary" 
              htmlType="submit"
              className="hover:bg-blue-600 hover:border-blue-600 transition-colors duration-200"
            >
              {editingWarehouse ? 'Güncelle' : 'Kaydet'}
            </Button>
          </div>
        </Form>
      </Drawer>
    </div>
  );
};

export default WarehouseList; 