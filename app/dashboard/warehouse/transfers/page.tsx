'use client';

import { useEffect, useState } from 'react';
import { Table, Card, Tag, Space, Button, Input, Select, Modal, Form, DatePicker, InputNumber, App } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, SwapOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { TransferService, WarehouseService, InventoryService, EquipmentService } from '@/lib/services';
import { CreateTransferDTO, Transfer, TransferStatus, TransferType, UpdateTransferDTO } from '@/types/transfer';
import { InventoryItem } from '@/types/inventory';
import { Equipment } from '@/types/equipment';

const { Option } = Select;

export default function WarehouseTransfersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Transfer[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [selectedType, setSelectedType] = useState<string>();
  const [selectedStatus, setSelectedStatus] = useState<string>();
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<Transfer | null>(null);
  const [form] = Form.useForm();
  const { notification } = App.useApp();

  const service = new TransferService();
  const warehouseService = new WarehouseService();
  const inventoryService = new InventoryService();
  const equipmentService = new EquipmentService();

  useEffect(() => {
    fetchData();
    fetchWarehouses();
    fetchInventory();
    fetchEquipment();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await service.findAllByWarehouse('current-warehouse-id'); // TODO: Get from context
      setData(response);
    } catch (error) {
      console.error('Veri yüklenirken hata:', error);
      notification.error({ message: 'Transfer listesi yüklenirken bir hata oluştu' });
    } finally {
      setLoading(false);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const response = await warehouseService.findAll();
      setWarehouses(response);
    } catch (error) {
      console.error('Depolar yüklenirken hata:', error);
      notification.error({ message: 'Depo listesi yüklenirken bir hata oluştu' });
    }
  };

  const fetchInventory = async () => {
    try {
      const response = await inventoryService.findAllByWarehouse('current-warehouse-id');
      setInventory(response);
    } catch (error) {
      console.error('Stok yüklenirken hata:', error);
      notification.error({ message: 'Stok listesi yüklenirken bir hata oluştu' });
    }
  };

  const fetchEquipment = async () => {
    try {
      const response = await equipmentService.findByWarehouse('current-warehouse-id');
      setEquipment(response);
    } catch (error) {
      console.error('Ekipmanlar yüklenirken hata:', error);
      notification.error({ message: 'Ekipman listesi yüklenirken bir hata oluştu' });
    }
  };

  const handleAdd = () => {
    form.resetFields();
    setEditingItem(null);
    setIsModalVisible(true);
  };

  const handleEdit = (record: Transfer) => {
    form.setFieldsValue({
      ...record,
      date: record.date ? new Date(record.date) : undefined,
    });
    setEditingItem(record);
    setIsModalVisible(true);
  };

  const handleDelete = async (record: Transfer) => {
    Modal.confirm({
      title: 'Transferi Sil',
      content: 'Bu transferi silmek istediğinizden emin misiniz?',
      okText: 'Evet',
      cancelText: 'Hayır',
      onOk: async () => {
        try {
          await service.delete('current-warehouse-id', record.id);
          notification.success({ message: 'Transfer başarıyla silindi' });
          fetchData();
        } catch (error) {
          console.error('Transfer silme hatası:', error);
          notification.error({ message: 'Transfer silinirken bir hata oluştu' });
        }
      }
    });
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingItem) {
        await service.update('current-warehouse-id', editingItem.id, values as UpdateTransferDTO);
        notification.success({ message: 'Transfer başarıyla güncellendi' });
      } else {
        await service.create('current-warehouse-id', values as CreateTransferDTO);
        notification.success({ message: 'Transfer başarıyla oluşturuldu' });
      }
      setIsModalVisible(false);
      fetchData();
    } catch (error) {
      console.error('Transfer kaydetme hatası:', error);
      notification.error({ message: 'Transfer kaydedilirken bir hata oluştu' });
    }
  };

  const handleStatusChange = async (record: Transfer, status: TransferStatus) => {
    try {
      await service.updateStatus('current-warehouse-id', record.id, status);
      notification.success({ message: 'Transfer durumu başarıyla güncellendi' });
      fetchData();
    } catch (error) {
      console.error('Transfer durumu güncelleme hatası:', error);
      notification.error({ message: 'Transfer durumu güncellenirken bir hata oluştu' });
    }
  };

  const getStatusColor = (status: TransferStatus) => {
    switch (status) {
      case TransferStatus.PENDING:
        return 'orange';
      case TransferStatus.APPROVED:
        return 'blue';
      case TransferStatus.REJECTED:
        return 'red';
      case TransferStatus.COMPLETED:
        return 'green';
      case TransferStatus.CANCELLED:
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: TransferStatus) => {
    switch (status) {
      case TransferStatus.PENDING:
        return 'Beklemede';
      case TransferStatus.APPROVED:
        return 'Onaylandı';
      case TransferStatus.REJECTED:
        return 'Reddedildi';
      case TransferStatus.COMPLETED:
        return 'Tamamlandı';
      case TransferStatus.CANCELLED:
        return 'İptal Edildi';
      default:
        return status;
    }
  };

  const getTypeText = (type: TransferType) => {
    switch (type) {
      case TransferType.IN:
        return 'Giriş';
      case TransferType.OUT:
        return 'Çıkış';
      case TransferType.TRANSFER:
        return 'Transfer';
      default:
        return type;
    }
  };

  const filteredData = data.filter(item => {
    const matchesSearch = searchText
      ? (item.source?.name.toLowerCase().includes(searchText.toLowerCase()) ||
         item.target.name.toLowerCase().includes(searchText.toLowerCase()))
      : true;
    const matchesType = selectedType
      ? item.type === selectedType
      : true;
    const matchesStatus = selectedStatus
      ? item.status === selectedStatus
      : true;
    return matchesSearch && matchesType && matchesStatus;
  });

  const columns = [
    {
      title: 'Tarih',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => new Date(date).toLocaleDateString('tr-TR'),
    },
    {
      title: 'Tür',
      dataIndex: 'type',
      key: 'type',
      render: (type: TransferType) => getTypeText(type),
    },
    {
      title: 'Kaynak Depo',
      key: 'source',
      render: (text: string, record: Transfer) => record.source?.name || '-',
    },
    {
      title: 'Hedef Depo',
      key: 'target',
      render: (text: string, record: Transfer) => record.target.name,
    },
    {
      title: 'Stok',
      key: 'inventory',
      render: (text: string, record: Transfer) => record.inventory.length,
    },
    {
      title: 'Ekipman',
      key: 'equipment',
      render: (text: string, record: Transfer) => record.equipment.length,
    },
    {
      title: 'Durum',
      key: 'status',
      render: (text: string, record: Transfer) => (
        <Tag color={getStatusColor(record.status)}>
          {getStatusText(record.status)}
        </Tag>
      ),
    },
    {
      title: 'İşlemler',
      key: 'action',
      render: (_: any, record: Transfer) => (
        <Space size="middle">
          {record.status === TransferStatus.PENDING && (
            <>
              <Button
                type="link"
                onClick={() => handleStatusChange(record, TransferStatus.APPROVED)}
              >
                Onayla
              </Button>
              <Button
                type="link"
                danger
                onClick={() => handleStatusChange(record, TransferStatus.REJECTED)}
              >
                Reddet
              </Button>
            </>
          )}
          {record.status === TransferStatus.APPROVED && (
            <Button
              type="link"
              onClick={() => handleStatusChange(record, TransferStatus.COMPLETED)}
            >
              Tamamla
            </Button>
          )}
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            disabled={record.status !== TransferStatus.PENDING}
          >
            Düzenle
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
            disabled={record.status !== TransferStatus.PENDING}
          >
            Sil
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Card title="Depo Transfer Listesi" className="shadow-md">
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
              placeholder="Tür Seç"
              allowClear
              style={{ width: 200 }}
              value={selectedType}
              onChange={setSelectedType}
            >
              {Object.values(TransferType).map(type => (
                <Option key={type} value={type}>
                  {getTypeText(type)}
                </Option>
              ))}
            </Select>
            <Select
              placeholder="Durum Seç"
              allowClear
              style={{ width: 200 }}
              value={selectedStatus}
              onChange={setSelectedStatus}
            >
              {Object.values(TransferStatus).map(status => (
                <Option key={status} value={status}>
                  {getStatusText(status)}
                </Option>
              ))}
            </Select>
          </Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            Yeni Transfer
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
        title={editingItem ? 'Transfer Düzenle' : 'Yeni Transfer'}
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
            name="type"
            label="Transfer Türü"
            rules={[{ required: true, message: 'Transfer türü seçimi gerekli' }]}
          >
            <Select>
              {Object.values(TransferType).map(type => (
                <Option key={type} value={type}>
                  {getTypeText(type)}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="date"
            label="Transfer Tarihi"
            rules={[{ required: true, message: 'Transfer tarihi gerekli' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="sourceId"
            label="Kaynak Depo"
          >
            <Select>
              {warehouses.map(warehouse => (
                <Option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="targetId"
            label="Hedef Depo"
            rules={[{ required: true, message: 'Hedef depo seçimi gerekli' }]}
          >
            <Select>
              {warehouses.map(warehouse => (
                <Option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.List name="inventory">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, 'inventoryId']}
                      rules={[{ required: true, message: 'Stok seçimi gerekli' }]}
                    >
                      <Select style={{ width: 300 }}>
                        {inventory.map(item => (
                          <Option key={item.id} value={item.id}>
                            {item.name} ({item.code})
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'quantity']}
                      rules={[{ required: true, message: 'Miktar gerekli' }]}
                    >
                      <InputNumber min={1} style={{ width: 100 }} />
                    </Form.Item>
                    <Button onClick={() => remove(name)} danger>Sil</Button>
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block>
                    Stok Ekle
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.List name="equipment">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, 'equipmentId']}
                      rules={[{ required: true, message: 'Ekipman seçimi gerekli' }]}
                    >
                      <Select style={{ width: 400 }}>
                        {equipment.map(item => (
                          <Option key={item.id} value={item.id}>
                            {item.name} ({item.serialNumber})
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Button onClick={() => remove(name)} danger>Sil</Button>
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block>
                    Ekipman Ekle
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.Item
            name="notes"
            label="Notlar"
          >
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
} 