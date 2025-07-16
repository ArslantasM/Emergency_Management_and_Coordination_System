"use client";

import React, { useState } from 'react';
import { Table, Button, Space, Input, Card, Typography, Tag } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const { Title } = Typography;

const ContainerPage = () => {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');

  // Örnek veri
  const containers = [
    {
      id: 1,
      name: 'Çadır Kent 1',
      location: 'Kahramanmaraş',
      capacity: '500 kişi',
      status: 'Aktif',
      type: 'Çadır Kent',
      occupancy: '450',
      manager: 'Mehmet Demir',
    },
    // Diğer konteyner/çadır kentler eklenecek
  ];

  const columns = [
    {
      title: 'Konteyner/Çadır Kent Adı',
      dataIndex: 'name',
      key: 'name',
      filteredValue: [searchText],
      onFilter: (value: string, record: any) =>
        record.name.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: 'Konum',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Kapasite',
      dataIndex: 'capacity',
      key: 'capacity',
    },
    {
      title: 'Doluluk',
      dataIndex: 'occupancy',
      key: 'occupancy',
      render: (occupancy: string) => `${occupancy} kişi`,
    },
    {
      title: 'Tür',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={type === 'Çadır Kent' ? 'blue' : 'green'}>
          {type}
        </Tag>
      ),
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
      title: 'Sorumlu',
      dataIndex: 'manager',
      key: 'manager',
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button type="link" onClick={() => router.push(`/dashboard/inventory/container/${record.id}`)}>
            Detay
          </Button>
          <Button type="link" onClick={() => router.push(`/dashboard/inventory/container/${record.id}/edit`)}>
            Düzenle
          </Button>
          <Button type="link" onClick={() => router.push(`/dashboard/inventory/container/${record.id}/map`)}>
            Harita
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card>
        <div className="flex justify-between items-center mb-4">
          <Title level={2}>Konteyner/Çadır Kent Yönetimi</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => router.push('/dashboard/inventory/container/add')}
          >
            Yeni Konteyner/Çadır Kent Ekle
          </Button>
        </div>

        <div className="mb-4">
          <Input
            placeholder="Konteyner/Çadır Kent Ara..."
            prefix={<SearchOutlined />}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
        </div>

        <Table
          columns={columns}
          dataSource={containers}
          rowKey="id"
          pagination={{
            total: containers.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
        />
      </Card>
    </div>
  );
};

export default ContainerPage; 