'use client';

import { useEffect, useState } from 'react';
import { Table, Card, Tag, Space, Button, Input, Select, Modal, Form, DatePicker, InputNumber, App } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, CarOutlined } from '@ant-design/icons';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';

const { Option } = Select;

interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  type: string;
  status: string;
  fuelType: string;
  capacity: number;
  driver?: string;
  lastMaintenance?: string;
  nextMaintenance?: string;
  warehouseId: string;
}

interface Warehouse {
  id: string;
  name: string;
  code: string;
}

export default function WarehouseVehiclesPage() {
  const searchParams = useSearchParams();
  const warehouseId = searchParams.get('id');
  
  const [loading, setLoading] = useState(true);
  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [form] = Form.useForm();
  const { notification } = App.useApp();

  useEffect(() => {
    if (!warehouseId) {
      notification.error({ message: 'Depo ID bulunamadı' });
      return;
    }
    
    fetchWarehouse();
    fetchVehicles();
  }, [warehouseId]);

  const fetchWarehouse = async () => {
    try {
      const response = await axios.get(`/api/warehouse/${warehouseId}`);
      setWarehouse(response.data);
    } catch (error) {
      console.error('Depo bilgileri yüklenirken hata:', error);
      notification.error({ message: 'Depo bilgileri yüklenirken bir hata oluştu.' });
    }
  };

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/warehouse/${warehouseId}/vehicles`);
      setVehicles(response.data);
    } catch (error) {
      console.error('Araç listesi yüklenirken hata:', error);
      notification.error({ message: 'Araç listesi yüklenirken bir hata oluştu.' });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    form.resetFields();
    setEditingVehicle(null);
    setIsModalVisible(true);
  };

  const handleEdit = (vehicle: Vehicle) => {
    form.setFieldsValue({
      ...vehicle,
      lastMaintenance: vehicle.lastMaintenance ? new Date(vehicle.lastMaintenance) : undefined,
      nextMaintenance: vehicle.nextMaintenance ? new Date(vehicle.nextMaintenance) : undefined,
    });
    setEditingVehicle(vehicle);
    setIsModalVisible(true);
  };

  const handleSubmit = async (values: any) => {
    try {
      const vehicleData = {
        ...values,
        warehouseId: warehouseId
      };

      if (editingVehicle) {
        await axios.put(`/api/warehouse/${warehouseId}/vehicles/${editingVehicle.id}`, vehicleData);
        notification.success({ message: 'Araç başarıyla güncellendi' });
      } else {
        await axios.post(`/api/warehouse/${warehouseId}/vehicles`, vehicleData);
        notification.success({ message: 'Araç başarıyla eklendi' });
      }
      
      setIsModalVisible(false);
      fetchVehicles();
    } catch (error: any) {
      if (error.response?.data?.error) {
        notification.error({ message: error.response.data.error });
      } else {
        notification.error({ message: 'Araç eklenirken bir hata oluştu' });
      }
    }
  };

  const handleDelete = async (vehicle: Vehicle) => {
    Modal.confirm({
      title: 'Aracı Sil',
      content: `${vehicle.plate} plakalı aracı silmek istediğinizden emin misiniz?`,
      okText: 'Evet',
      cancelText: 'Hayır',
      onOk: async () => {
        try {
          await axios.delete(`/api/warehouse/${warehouseId}/vehicles/${vehicle.id}`);
          notification.success({ message: 'Araç başarıyla silindi' });
          fetchVehicles();
        } catch (error) {
          notification.error({ message: 'Araç silinirken bir hata oluştu' });
        }
      }
    });
  };

  const columns = [
    {
      title: 'Plaka',
      dataIndex: 'plate',
      key: 'plate',
      sorter: (a: Vehicle, b: Vehicle) => a.plate.localeCompare(b.plate),
    },
    {
      title: 'Tip',
      dataIndex: 'type',
      key: 'type',
      filters: [
        { text: 'Kamyon', value: 'TRUCK' },
        { text: 'Forklift', value: 'FORKLIFT' },
        { text: 'Van', value: 'VAN' },
      ],
      onFilter: (value: string, record: Vehicle) => record.type === value,
    },
    {
      title: 'Marka/Model',
      key: 'brandModel',
      render: (text: string, record: Vehicle) => `${record.brand} ${record.model}`,
    },
    {
      title: 'Yıl',
      dataIndex: 'year',
      key: 'year',
      sorter: (a: Vehicle, b: Vehicle) => a.year - b.year,
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={
          status === 'ACTIVE' ? 'green' :
          status === 'MAINTENANCE' ? 'orange' :
          'red'
        }>
          {
            status === 'ACTIVE' ? 'Aktif' :
            status === 'MAINTENANCE' ? 'Bakımda' :
            'Arızalı'
          }
        </Tag>
      ),
    },
    {
      title: 'Son Bakım',
      dataIndex: 'lastMaintenance',
      key: 'lastMaintenance',
      render: (text: string) => new Date(text).toLocaleDateString('tr-TR'),
    },
    {
      title: 'Sonraki Bakım',
      dataIndex: 'nextMaintenance',
      key: 'nextMaintenance',
      render: (text: string) => new Date(text).toLocaleDateString('tr-TR'),
    },
    {
      title: 'Sürücü',
      dataIndex: 'driver',
      key: 'driver',
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (text: string, record: Vehicle) => (
        <Space>
          <Button type="primary" onClick={() => handleEdit(record)}>
            Düzenle
          </Button>
          <Button onClick={() => handleDelete(record)}>
            Sil
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={2}>Depo Araçları</Title>
          <Title level={4}>{warehouse?.name}</Title>
        </div>
        <Button type="primary" onClick={handleAdd}>
          Yeni Araç Ekle
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={vehicles}
        loading={loading}
        rowKey="id"
        scroll={{ x: true }}
      />

      <Modal
        title="Yeni Araç Ekle"
        open={isModalVisible}
        onOk={form.submit}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="plate"
            label="Plaka"
            rules={[{ required: true, message: 'Lütfen plaka giriniz' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="type"
            label="Tip"
            rules={[{ required: true, message: 'Lütfen araç tipi seçiniz' }]}
          >
            <Select>
              <Option value="TRUCK">Kamyon</Option>
              <Option value="FORKLIFT">Forklift</Option>
              <Option value="VAN">Van</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="brand"
            label="Marka"
            rules={[{ required: true, message: 'Lütfen marka giriniz' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="model"
            label="Model"
            rules={[{ required: true, message: 'Lütfen model giriniz' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="year"
            label="Yıl"
            rules={[{ required: true, message: 'Lütfen yıl giriniz' }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            name="driver"
            label="Sürücü"
            rules={[{ required: true, message: 'Lütfen sürücü giriniz' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="lastMaintenance"
            label="Son Bakım Tarihi"
            rules={[{ required: true, message: 'Lütfen son bakım tarihini giriniz' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="nextMaintenance"
            label="Sonraki Bakım Tarihi"
            rules={[{ required: true, message: 'Lütfen sonraki bakım tarihini giriniz' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="fuelType"
            label="Yakıt Tipi"
            rules={[{ required: true, message: 'Lütfen yakıt tipi giriniz' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="capacity"
            label="Kapasite"
            rules={[{ required: true, message: 'Lütfen kapasite giriniz' }]}
          >
            <InputNumber />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
} 