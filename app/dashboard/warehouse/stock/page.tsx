'use client';

import { useEffect, useState } from 'react';
import { Table, Card, Tag, Space, Button, Input, Select, Modal, Form, DatePicker, InputNumber, App } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { InventoryService } from '@/lib/services';
import { CreateInventoryDTO, InventoryItem, InventoryStatus, UpdateInventoryDTO, InventoryCategory } from '@/types/inventory';

const { Option } = Select;

export default function WarehouseStockPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>();
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [form] = Form.useForm();
  const { notification } = App.useApp();

  const service = new InventoryService();

  useEffect(() => {
    fetchData();
    fetchCategories();
  }, []);

  const fetchData = async () => {
    try {
      const response = await service.findAllByWarehouse('current-warehouse-id'); // TODO: Get from context
      setData(response);
    } catch (error) {
      console.error('Veri yüklenirken hata:', error);
      notification.error({ message: 'Stok listesi alınamadı' });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await service.getCategories();
      setCategories(response);
    } catch (error) {
      console.error('Kategoriler yüklenirken hata:', error);
      notification.error({ message: 'Kategoriler alınamadı' });
    }
  };

  const handleAdd = () => {
    form.resetFields();
    setEditingItem(null);
    setIsModalVisible(true);
  };

  const handleEdit = (record: InventoryItem) => {
    form.setFieldsValue({
      ...record,
      expiryDate: record.expiryDate ? new Date(record.expiryDate) : undefined,
    });
    setEditingItem(record);
    setIsModalVisible(true);
  };

  const handleDelete = async (record: InventoryItem) => {
    try {
      await service.deleteByWarehouse('current-warehouse-id', record.id);
      notification.success({ message: 'Stok başarıyla silindi' });
      fetchData();
    } catch (error) {
      console.error('Silme işlemi sırasında hata:', error);
      notification.error({ message: 'Stok silinirken bir hata oluştu' });
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingItem) {
        await service.updateByWarehouse('current-warehouse-id', editingItem.id, values as UpdateInventoryDTO);
        notification.success({ message: 'Stok başarıyla güncellendi' });
      } else {
        await service.createByWarehouse('current-warehouse-id', values as CreateInventoryDTO);
        notification.success({ message: 'Stok başarıyla eklendi' });
      }
      setIsModalVisible(false);
      fetchData();
    } catch (error) {
      console.error('Kaydetme işlemi sırasında hata:', error);
      notification.error({ message: 'Stok kaydedilirken bir hata oluştu' });
    }
  };

  const getStatusColor = (status: InventoryStatus) => {
    switch (status) {
      case InventoryStatus.AVAILABLE:
        return 'green';
      case InventoryStatus.LOW_STOCK:
        return 'orange';
      case InventoryStatus.OUT_OF_STOCK:
        return 'red';
      case InventoryStatus.EXPIRED:
        return 'red';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: InventoryStatus) => {
    switch (status) {
      case InventoryStatus.AVAILABLE:
        return 'Mevcut';
      case InventoryStatus.LOW_STOCK:
        return 'Az Stok';
      case InventoryStatus.OUT_OF_STOCK:
        return 'Stok Yok';
      case InventoryStatus.EXPIRED:
        return 'Süresi Dolmuş';
      default:
        return status;
    }
  };

  const filteredData = data.filter(item => {
    const matchesSearch = searchText
      ? item.name.toLowerCase().includes(searchText.toLowerCase()) ||
        item.code.toLowerCase().includes(searchText.toLowerCase())
      : true;
    const matchesCategory = selectedCategory
      ? item.categoryId === selectedCategory
      : true;
    return matchesSearch && matchesCategory;
  });

  const columns = [
    {
      title: 'Kod',
      dataIndex: 'code',
      key: 'code',
      width: 120,
    },
    {
      title: 'Ürün Adı',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Kategori',
      dataIndex: ['category', 'name'],
      key: 'category',
    },
    {
      title: 'Miktar',
      key: 'quantity',
      render: (text: string, record: InventoryItem) => `${record.quantity} ${record.unit}`,
    },
    {
      title: 'Min. Miktar',
      key: 'minQuantity',
      render: (text: string, record: InventoryItem) => `${record.minQuantity} ${record.unit}`,
    },
    {
      title: 'Durum',
      key: 'status',
      render: (text: string, record: InventoryItem) => (
        <Tag color={getStatusColor(record.status)}>
          {getStatusText(record.status)}
        </Tag>
      ),
    },
    {
      title: 'Son Kullanma',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      render: (date: string) => date ? new Date(date).toLocaleDateString('tr-TR') : '-',
    },
    {
      title: 'İşlemler',
      key: 'action',
      render: (_: any, record: InventoryItem) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Düzenle
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            Sil
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Card title="Depo Stok Durumu" className="shadow-md">
        <div className="flex justify-between mb-4">
          <Space>
            <Input
              placeholder="Ara..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: 200 }}
            />
            <Select
              placeholder="Kategori Seç"
              allowClear
              style={{ width: 200 }}
              value={selectedCategory}
              onChange={setSelectedCategory}
            >
              {categories.map(category => (
                <Option key={category.id} value={category.id}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            Yeni Stok Ekle
          </Button>
        </div>

        <Table
          loading={loading}
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingItem ? 'Stok Düzenle' : 'Yeni Stok Ekle'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={form.submit}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="code"
            label="Stok Kodu"
            rules={[{ required: true, message: 'Stok kodu gerekli' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="name"
            label="Ürün Adı"
            rules={[{ required: true, message: 'Ürün adı gerekli' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="Açıklama"
          >
            <Input.TextArea />
          </Form.Item>

          <Form.Item
            name="categoryId"
            label="Kategori"
            rules={[{ required: true, message: 'Kategori seçimi gerekli' }]}
          >
            <Select>
              {categories.map(category => (
                <Option key={category.id} value={category.id}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="quantity"
              label="Miktar"
              rules={[{ required: true, message: 'Miktar gerekli' }]}
            >
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="unit"
              label="Birim"
              rules={[{ required: true, message: 'Birim gerekli' }]}
            >
              <Select>
                <Option value="ADET">Adet</Option>
                <Option value="KG">Kilogram</Option>
                <Option value="LT">Litre</Option>
                <Option value="MT">Metre</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="minQuantity"
              label="Minimum Miktar"
              rules={[{ required: true, message: 'Minimum miktar gerekli' }]}
            >
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="maxQuantity"
              label="Maksimum Miktar"
            >
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
          </div>

          <Form.Item
            name="expiryDate"
            label="Son Kullanma Tarihi"
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
} 