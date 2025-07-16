"use client";

import React, { useState, useEffect } from 'react';
import { Card, Descriptions, Button, Tabs, Table, Tag, Space, Typography, message } from 'antd';
import { EditOutlined, ArrowLeftOutlined, PlusOutlined, BarChartOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const { Title } = Typography;
const { TabPane } = Tabs;

const WarehouseDetailPage = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const warehouseId = parseInt(params.id);
  const [transferData, setTransferData] = useState<any[]>([]);
  const [loadingTransfers, setLoadingTransfers] = useState(false);

  useEffect(() => {
    fetchTransfers();
  }, [warehouseId]);

  const fetchTransfers = async () => {
    setLoadingTransfers(true);
    try {
      const response = await fetch(`/api/warehouse/transfer?warehouseId=${warehouseId}`);
      if (!response.ok) throw new Error('Transfer listesi alınamadı');
      const data = await response.json();
      setTransferData(data);
    } catch (error) {
      message.error('Transfer listesi yüklenirken bir hata oluştu');
      console.error(error);
    } finally {
      setLoadingTransfers(false);
    }
  };

  // Örnek veri - gerçek uygulamada API'den gelecek
  const warehouseData = {
    id: warehouseId,
    name: 'Ana Depo',
    location: 'İstanbul',
    capacity: '10000 m²',
    status: 'Aktif',
    manager: 'Ahmet Yılmaz',
    address: 'Örnek Mahallesi, 123. Sokak No:45, Kadıköy/İstanbul',
    description: 'Ana lojistik merkezi olarak hizmet veren depo.',
    created_at: '2025-01-01',
    updated_at: '2025-05-22',
  };

  // Örnek stok verileri
  const stockData = [
    {
      id: 1,
      item_name: 'Battaniye',
      quantity: 1000,
      unit: 'adet',
      category: 'Barınma',
      status: 'Yeni',
    },
    // Diğer stok kalemleri...
  ];

  // Örnek personel verileri
  const personnelData = [
    {
      id: 1,
      name: 'Mehmet Demir',
      role: 'Depo Görevlisi',
      status: 'Aktif',
      phone: '0555-555-5555',
    },
    // Diğer personel...
  ];

  // Örnek araç verileri
  const vehicleData = [
    {
      id: 1,
      plate_number: '34 ABC 123',
      vehicle_type: 'Forklift',
      status: 'Aktif',
      last_maintenance: '2025-05-01',
    },
    // Diğer araçlar...
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
        <Tag color={status === 'Yeni' ? 'green' : 'orange'}>{status}</Tag>
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

  const vehicleColumns = [
    { title: 'Plaka', dataIndex: 'plate_number', key: 'plate_number' },
    { title: 'Araç Tipi', dataIndex: 'vehicle_type', key: 'vehicle_type' },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'Aktif' ? 'green' : 'red'}>{status}</Tag>
      ),
    },
    { title: 'Son Bakım', dataIndex: 'last_maintenance', key: 'last_maintenance' },
  ];

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
          <Title level={2} style={{ margin: 0 }}>Depo Detayı</Title>
        </Space>
        <Space>
          <Button
            icon={<BarChartOutlined />}
            onClick={() => router.push(`/dashboard/inventory/warehouse/${warehouseId}/reports`)}
          >
            Raporlar
          </Button>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => router.push(`/dashboard/inventory/warehouse/${warehouseId}/edit`)}
          >
            Düzenle
          </Button>
        </Space>
      </div>

      <Card className="mb-6">
        <Descriptions title="Depo Bilgileri" bordered>
          <Descriptions.Item label="Depo Adı">{warehouseData.name}</Descriptions.Item>
          <Descriptions.Item label="Konum">{warehouseData.location}</Descriptions.Item>
          <Descriptions.Item label="Kapasite">{warehouseData.capacity}</Descriptions.Item>
          <Descriptions.Item label="Durum">
            <Tag color={warehouseData.status === 'Aktif' ? 'green' : 'red'}>
              {warehouseData.status}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Depo Sorumlusu">{warehouseData.manager}</Descriptions.Item>
          <Descriptions.Item label="Adres">{warehouseData.address}</Descriptions.Item>
          <Descriptions.Item label="Açıklama" span={3}>
            {warehouseData.description}
          </Descriptions.Item>
          <Descriptions.Item label="Oluşturulma Tarihi">{warehouseData.created_at}</Descriptions.Item>
          <Descriptions.Item label="Son Güncelleme">{warehouseData.updated_at}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card>
        <Tabs defaultActiveKey="stock">
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
          <TabPane tab="Araçlar" key="vehicles">
            <Table
              columns={vehicleColumns}
              dataSource={vehicleData}
              rowKey="id"
              pagination={{ pageSize: 5 }}
            />
          </TabPane>
          <TabPane tab="Transfer İşlemleri" key="transfers">
            <div style={{ marginBottom: 16 }}>
              <Space>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => router.push(`/dashboard/inventory/warehouse/${warehouseId}/transfer`)}
                >
                  Yeni Transfer İşlemi
                </Button>
              </Space>
            </div>
            <Table
              columns={[
                { title: 'İşlem No', dataIndex: 'id', key: 'id' },
                { 
                  title: 'İşlem Tipi', 
                  dataIndex: 'type', 
                  key: 'type',
                  render: (type: string) => (
                    <Tag color={type === 'ENTRY' ? 'green' : 'orange'}>
                      {type === 'ENTRY' ? 'Giriş' : 'Çıkış'}
                    </Tag>
                  )
                },
                { 
                  title: 'Tarih', 
                  dataIndex: 'date', 
                  key: 'date',
                  render: (date: string) => new Date(date).toLocaleString('tr-TR')
                },
                { title: 'Teslim Eden', dataIndex: ['issuedBy', 'name'], key: 'issuedBy' },
                { title: 'Teslim Alan', dataIndex: ['receivedBy', 'name'], key: 'receivedBy' },
                {
                  title: 'Durum',
                  dataIndex: 'status',
                  key: 'status',
                  render: (status: string) => {
                    const statusConfig = {
                      PENDING: { color: 'processing', text: 'Bekliyor' },
                      COMPLETED: { color: 'success', text: 'Tamamlandı' },
                      CANCELLED: { color: 'error', text: 'İptal Edildi' }
                    };
                    const config = statusConfig[status as keyof typeof statusConfig];
                    return <Tag color={config.color}>{config.text}</Tag>;
                  }
                },
                {
                  title: 'İşlemler',
                  key: 'actions',
                  render: (_: any, record: any) => (
                    <Space>
                      <Button 
                        type="link" 
                        onClick={() => router.push(`/dashboard/inventory/warehouse/${warehouseId}/transfer/${record.id}`)}
                      >
                        Detay
                      </Button>
                      <Button 
                        type="link" 
                        onClick={() => router.push(`/dashboard/inventory/warehouse/${warehouseId}/transfer/${record.id}?showTutanak=true`)}
                      >
                        Tutanak
                      </Button>
                    </Space>
                  )
                }
              ]}
              dataSource={transferData}
              rowKey="id"
              pagination={{ pageSize: 5 }}
              loading={loadingTransfers}
            />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default WarehouseDetailPage; 