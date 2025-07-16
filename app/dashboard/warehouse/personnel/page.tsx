'use client';

import { useEffect, useState } from 'react';
import { Table, Card, Tag, Space, Button, Input, Select, Modal, Form, DatePicker, App } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import { PersonnelService } from '@/lib/services';
import { CreatePersonnelDTO, Personnel, PersonnelPosition, PersonnelStatus, UpdatePersonnelDTO } from '@/types/personnel';
import axios from 'axios';

const { Option } = Select;

export default function WarehousePersonnelPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Personnel[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<string>();
  const [selectedStatus, setSelectedStatus] = useState<string>();
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<Personnel | null>(null);
  const [form] = Form.useForm();
  const { notification } = App.useApp();

  const service = new PersonnelService();

  useEffect(() => {
    fetchData();
    fetchUsers();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await service.findAllByWarehouse('current-warehouse-id'); // TODO: Get from context
      setData(response);
    } catch (error) {
      console.error('Veri yüklenirken hata:', error);
      notification.error({ message: 'Personel listesi yüklenirken bir hata oluştu' });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await service.getUsers();
      setUsers(response);
    } catch (error) {
      console.error('Kullanıcılar yüklenirken hata:', error);
      notification.error({ message: 'Kullanıcı listesi yüklenirken bir hata oluştu' });
    }
  };

  const handleAdd = () => {
    form.resetFields();
    setEditingItem(null);
    setIsModalVisible(true);
  };

  const handleEdit = (record: Personnel) => {
    form.setFieldsValue({
      ...record,
      startDate: record.startDate ? new Date(record.startDate) : undefined,
      endDate: record.endDate ? new Date(record.endDate) : undefined,
    });
    setEditingItem(record);
    setIsModalVisible(true);
  };

  const handleDelete = async (record: Personnel) => {
    Modal.confirm({
      title: 'Personeli Sil',
      content: `${record.user.name} adlı personeli silmek istediğinizden emin misiniz?`,
      okText: 'Evet',
      cancelText: 'Hayır',
      onOk: async () => {
        try {
          await service.delete('current-warehouse-id', record.id);
          notification.success({ message: 'Personel başarıyla silindi' });
          fetchData();
        } catch (error) {
          console.error('Personel silme hatası:', error);
          notification.error({ message: 'Personel silinirken bir hata oluştu' });
        }
      }
    });
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingItem) {
        await service.update('current-warehouse-id', editingItem.id, values as UpdatePersonnelDTO);
        notification.success({ message: 'Personel başarıyla güncellendi' });
      } else {
        await service.create('current-warehouse-id', values as CreatePersonnelDTO);
        notification.success({ message: 'Personel başarıyla eklendi' });
      }
      setIsModalVisible(false);
      fetchData();
    } catch (error) {
      console.error('Personel kaydetme hatası:', error);
      notification.error({ message: 'Personel kaydedilirken bir hata oluştu' });
    }
  };

  const getStatusColor = (status: PersonnelStatus) => {
    switch (status) {
      case PersonnelStatus.ACTIVE:
        return 'green';
      case PersonnelStatus.ON_LEAVE:
        return 'orange';
      case PersonnelStatus.SICK_LEAVE:
        return 'red';
      case PersonnelStatus.INACTIVE:
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: PersonnelStatus) => {
    switch (status) {
      case PersonnelStatus.ACTIVE:
        return 'Aktif';
      case PersonnelStatus.ON_LEAVE:
        return 'İzinli';
      case PersonnelStatus.SICK_LEAVE:
        return 'Hastalık İzni';
      case PersonnelStatus.INACTIVE:
        return 'Pasif';
      default:
        return status;
    }
  };

  const getPositionText = (position: PersonnelPosition) => {
    switch (position) {
      case PersonnelPosition.MANAGER:
        return 'Depo Müdürü';
      case PersonnelPosition.SUPERVISOR:
        return 'Depo Amiri';
      case PersonnelPosition.STAFF:
        return 'Depo Görevlisi';
      case PersonnelPosition.OPERATOR:
        return 'Forklift Operatörü';
      case PersonnelPosition.DRIVER:
        return 'Şoför';
      case PersonnelPosition.SECURITY:
        return 'Güvenlik Görevlisi';
      case PersonnelPosition.MAINTENANCE:
        return 'Bakım Görevlisi';
      default:
        return position;
    }
  };

  const filteredData = data.filter(item => {
    const matchesSearch = searchText
      ? item.user.name.toLowerCase().includes(searchText.toLowerCase()) ||
        item.department.toLowerCase().includes(searchText.toLowerCase())
      : true;
    const matchesPosition = selectedPosition
      ? item.position === selectedPosition
      : true;
    const matchesStatus = selectedStatus
      ? item.status === selectedStatus
      : true;
    return matchesSearch && matchesPosition && matchesStatus;
  });

  const columns = [
    {
      title: 'Personel',
      key: 'user',
      render: (text: string, record: Personnel) => (
        <Space>
          {record.user.image_url && (
            <img
              src={record.user.image_url}
              alt={record.user.name}
              style={{ width: 32, height: 32, borderRadius: '50%' }}
            />
          )}
          <div>
            <div>{record.user.name}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{record.user.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Pozisyon',
      dataIndex: 'position',
      key: 'position',
      render: (position: PersonnelPosition) => getPositionText(position),
    },
    {
      title: 'Departman',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: 'Durum',
      key: 'status',
      render: (text: string, record: Personnel) => (
        <Tag color={getStatusColor(record.status)}>
          {getStatusText(record.status)}
        </Tag>
      ),
    },
    {
      title: 'Başlangıç Tarihi',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date: string) => new Date(date).toLocaleDateString('tr-TR'),
    },
    {
      title: 'İşlemler',
      key: 'action',
      render: (_: any, record: Personnel) => (
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
      <Card title="Depo Personel Listesi" className="shadow-md">
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
              placeholder="Pozisyon Seç"
              allowClear
              style={{ width: 200 }}
              value={selectedPosition}
              onChange={setSelectedPosition}
            >
              {Object.values(PersonnelPosition).map(position => (
                <Option key={position} value={position}>
                  {getPositionText(position)}
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
              {Object.values(PersonnelStatus).map(status => (
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
            Yeni Personel Ekle
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
        title={editingItem ? 'Personel Düzenle' : 'Yeni Personel Ekle'}
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
          {!editingItem && (
            <Form.Item
              name="userId"
              label="Kullanıcı"
              rules={[{ required: true, message: 'Kullanıcı seçimi gerekli' }]}
            >
              <Select
                showSearch
                placeholder="Kullanıcı Seç"
                optionFilterProp="children"
              >
                {users.map(user => (
                  <Option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}

          <Form.Item
            name="position"
            label="Pozisyon"
            rules={[{ required: true, message: 'Pozisyon seçimi gerekli' }]}
          >
            <Select>
              {Object.values(PersonnelPosition).map(position => (
                <Option key={position} value={position}>
                  {getPositionText(position)}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="department"
            label="Departman"
            rules={[{ required: true, message: 'Departman gerekli' }]}
          >
            <Input />
          </Form.Item>

          {editingItem && (
            <Form.Item
              name="status"
              label="Durum"
              rules={[{ required: true, message: 'Durum seçimi gerekli' }]}
            >
              <Select>
                {Object.values(PersonnelStatus).map(status => (
                  <Option key={status} value={status}>
                    {getStatusText(status)}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}

          <Form.Item
            name="startDate"
            label="Başlangıç Tarihi"
            rules={[{ required: true, message: 'Başlangıç tarihi gerekli' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          {editingItem && (
            <Form.Item
              name="endDate"
              label="Bitiş Tarihi"
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          )}

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