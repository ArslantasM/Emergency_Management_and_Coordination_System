"use client";

import React, { useState } from 'react';
import { Table, Button, Space, Input, Card, Typography } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const { Title } = Typography;

const WarehousePage = () => {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');

  // Örnek veri
  const warehouses = [
    {
      id: 1,
      name: 'Ana Depo',
      location: 'İstanbul',
      capacity: '10000 m²',
      status: 'Aktif',
      manager: 'Ahmet Yılmaz',
    },
    // Diğer depolar eklenecek
  ];

  const columns = [
    {
      title: 'Depo Adı',
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
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Depo Sorumlusu',
      dataIndex: 'manager',
      key: 'manager',
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button type="link" onClick={() => router.push(`/dashboard/inventory/warehouse/${record.id}`)}>
            Detay
          </Button>
          <Button type="link" onClick={() => router.push(`/dashboard/inventory/warehouse/${record.id}/edit`)}>
            Düzenle
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card>
        <div className="flex justify-between items-center mb-4">
          <Title level={2}>Depo Yönetimi</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => router.push('/dashboard/inventory/warehouse/add')}
          >
            Yeni Depo Ekle
          </Button>
        </div>

        <div className="mb-4">
          <Input
            placeholder="Depo Ara..."
            prefix={<SearchOutlined />}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
        </div>

        <Table
          columns={columns}
          dataSource={warehouses}
          rowKey="id"
          pagination={{
            total: warehouses.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
        />
      </Card>
    </div>
  );
};

export default WarehousePage; 