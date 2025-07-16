"use client";

import React, { useState } from 'react';
import { Card, Descriptions, Button, Tabs, Table, Tag, Space, Typography, Progress } from 'antd';
import { EditOutlined, ArrowLeftOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const { Title } = Typography;
const { TabPane } = Tabs;

const ContainerDetailPage = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const containerId = parseInt(params.id);

  // Örnek veri - gerçek uygulamada API'den gelecek
  const containerData = {
    id: containerId,
    name: 'Çadır Kent 1',
    location: 'Kahramanmaraş',
    type: 'Çadır Kent',
    capacity: 500,
    occupancy: 450,
    status: 'Aktif',
    manager: 'Mehmet Demir',
    address: 'Örnek Mahallesi, 456. Sokak, Onikişubat/Kahramanmaraş',
    description: 'Deprem bölgesi için kurulan çadır kent.',
    latitude: 37.5855,
    longitude: 36.9375,
    created_at: '2025-02-06',
    updated_at: '2025-05-22',
  };

  // Örnek stok verileri
  const stockData = [
    {
      id: 1,
      item_name: 'Çadır',
      quantity: 100,
      unit: 'adet',
      category: 'Barınma',
      status: 'Kullanımda',
    },
    // Diğer stok kalemleri...
  ];

  // Örnek personel verileri
  const personnelData = [
    {
      id: 1,
      name: 'Ayşe Yılmaz',
      role: 'Sağlık Görevlisi',
      status: 'Aktif',
      phone: '0555-555-5555',
    },
    // Diğer personel...
  ];

  // Örnek sakin verileri
  const residentData = [
    {
      id: 1,
      name: 'Ali Kaya',
      age: 35,
      gender: 'Erkek',
      special_needs: false,
      entry_date: '2025-02-06',
    },
    // Diğer sakinler...
  ];

  const stockColumns = [
    { title: 'Malzeme Adı', dataIndex: 'item_name', key: 'item_name' },
    { title: 'Miktar', dataIndex: 'quantity', key: 'quantity' },
    { title: 'Birim', dataIndex: 'unit', key: 'unit' },
    { title: 'Kategori', dataIndex: 'category', key: 'category' },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'Kullanımda' ? 'blue' : 'orange'}>{status}</Tag>
      ),
    },
  ];

  const personnelColumns = [
    { title: 'Ad Soyad', dataIndex: 'name', key: 'name' },
    { title: 'Görev', dataIndex: 'role', key: 'role' },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'Aktif' ? 'green' : 'red'}>{status}</Tag>
      ),
    },
    { title: 'Telefon', dataIndex: 'phone', key: 'phone' },
  ];

  const residentColumns = [
    { title: 'Ad Soyad', dataIndex: 'name', key: 'name' },
    { title: 'Yaş', dataIndex: 'age', key: 'age' },
    { title: 'Cinsiyet', dataIndex: 'gender', key: 'gender' },
    {
      title: 'Özel İhtiyaç',
      dataIndex: 'special_needs',
      key: 'special_needs',
      render: (special_needs: boolean) => (
        <Tag color={special_needs ? 'red' : 'green'}>
          {special_needs ? 'Var' : 'Yok'}
        </Tag>
      ),
    },
    { title: 'Giriş Tarihi', dataIndex: 'entry_date', key: 'entry_date' },
  ];

  const occupancyRate = (containerData.occupancy / containerData.capacity) * 100;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Space>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => router.back()}
          >
            Geri
          </Button>
          <Title level={2} style={{ margin: 0 }}>Konteyner/Çadır Kent Detayı</Title>
        </Space>
        <Space>
          <Button
            icon={<EnvironmentOutlined />}
            onClick={() => router.push(`/dashboard/inventory/container/${containerId}/map`)}
          >
            Haritada Göster
          </Button>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => router.push(`/dashboard/inventory/container/${containerId}/edit`)}
          >
            Düzenle
          </Button>
        </Space>
      </div>

      <Card className="mb-6">
        <Descriptions title="Konteyner/Çadır Kent Bilgileri" bordered>
          <Descriptions.Item label="Ad">{containerData.name}</Descriptions.Item>
          <Descriptions.Item label="Konum">{containerData.location}</Descriptions.Item>
          <Descriptions.Item label="Tür">
            <Tag color="blue">{containerData.type}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Durum">
            <Tag color={containerData.status === 'Aktif' ? 'green' : 'red'}>
              {containerData.status}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Sorumlu">{containerData.manager}</Descriptions.Item>
          <Descriptions.Item label="Doluluk Oranı">
            <Progress 
              percent={Math.round(occupancyRate)} 
              size="small" 
              status={occupancyRate > 90 ? 'exception' : 'normal'}
            />
          </Descriptions.Item>
          <Descriptions.Item label="Kapasite">{containerData.capacity} kişi</Descriptions.Item>
          <Descriptions.Item label="Mevcut Sakin">{containerData.occupancy} kişi</Descriptions.Item>
          <Descriptions.Item label="Koordinatlar">
            {containerData.latitude}, {containerData.longitude}
          </Descriptions.Item>
          <Descriptions.Item label="Adres" span={3}>
            {containerData.address}
          </Descriptions.Item>
          <Descriptions.Item label="Açıklama" span={3}>
            {containerData.description}
          </Descriptions.Item>
          <Descriptions.Item label="Oluşturulma Tarihi">{containerData.created_at}</Descriptions.Item>
          <Descriptions.Item label="Son Güncelleme">{containerData.updated_at}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card>
        <Tabs defaultActiveKey="residents">
          <TabPane tab="Sakinler" key="residents">
            <Table
              columns={residentColumns}
              dataSource={residentData}
              rowKey="id"
              pagination={{ pageSize: 5 }}
            />
          </TabPane>
          <TabPane tab="Stok Durumu" key="stock">
            <Table
              columns={stockColumns}
              dataSource={stockData}
              rowKey="id"
              pagination={{ pageSize: 5 }}
            />
          </TabPane>
          <TabPane tab="Personel" key="personnel">
            <Table
              columns={personnelColumns}
              dataSource={personnelData}
              rowKey="id"
              pagination={{ pageSize: 5 }}
            />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default ContainerDetailPage; 