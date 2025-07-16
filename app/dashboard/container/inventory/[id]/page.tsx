"use client";

import React from 'react';
import { Card, Descriptions, Button, Space, Tag, Progress, Typography, Row, Col, Statistic } from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  SwapOutlined,
  HistoryOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const { Title } = Typography;

const InventoryDetailPage = ({ params }: { params: { id: string } }) => {
  const router = useRouter();

  // Örnek envanter verisi
  const inventory = {
    id: params.id,
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
    description: 'Tek kişilik, yün battaniye',
    supplier: 'ABC Tekstil',
    expiryDate: '2026-05-22',
    batchNumber: 'BT2025001',
    notes: 'Acil durum için ayrılmış stok',
  };

  const getStatusColor = (status: string) => {
    const statusColors = {
      'Normal': 'success',
      'Düşük Stok': 'warning',
      'Kritik Stok': 'error',
      'Fazla Stok': 'processing',
    };
    return statusColors[status as keyof typeof statusColors];
  };

  return (
    <div className="p-6">
      <Card>
        <div className="flex justify-between items-center mb-6">
          <Space>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => router.push('/dashboard/container/inventory')}
            >
              Geri
            </Button>
            <Title level={2} style={{ margin: 0 }}>Envanter Detayı</Title>
          </Space>
          <Space>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => router.push(`/dashboard/container/inventory/${params.id}/edit`)}
              style={{ 
                background: '#1890ff',
                borderColor: '#1890ff',
                color: 'white',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              Düzenle
            </Button>
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              style={{ 
                display: 'flex',
                alignItems: 'center'
              }}
            >
              Sil
            </Button>
            <Button
              icon={<SwapOutlined />}
              onClick={() => router.push(`/dashboard/container/inventory/${params.id}/transfer`)}
            >
              Transfer
            </Button>
            <Button
              icon={<HistoryOutlined />}
              onClick={() => router.push(`/dashboard/container/inventory/${params.id}/history`)}
            >
              Geçmiş
            </Button>
          </Space>
        </div>

        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} md={8}>
            <Card>
              <Statistic
                title="Mevcut Stok"
                value={inventory.quantity}
                suffix={inventory.unit}
                prefix={
                  inventory.quantity <= inventory.minQuantity ? 
                  <WarningOutlined style={{ color: '#ff4d4f' }} /> : 
                  <CheckCircleOutlined style={{ color: '#52c41a' }} />
                }
              />
              <Progress 
                percent={Math.round((inventory.quantity / inventory.maxQuantity) * 100)} 
                status={
                  inventory.quantity <= inventory.minQuantity 
                    ? 'exception' 
                    : inventory.quantity >= inventory.maxQuantity 
                      ? 'success' 
                      : 'active'
                }
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card>
              <Statistic
                title="Toplam Değer"
                value={inventory.value}
                prefix="₺"
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card>
              <Statistic
                title="Son Güncelleme"
                value={inventory.lastUpdate}
              />
            </Card>
          </Col>
        </Row>

        <Descriptions
          bordered
          column={{ xxl: 3, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}
        >
          <Descriptions.Item label="Malzeme Adı">{inventory.name}</Descriptions.Item>
          <Descriptions.Item label="Kategori">
            <Tag color="blue">{inventory.category}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Durum">
            <Tag color={getStatusColor(inventory.status)}>{inventory.status}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Minimum Stok">{inventory.minQuantity} {inventory.unit}</Descriptions.Item>
          <Descriptions.Item label="Maksimum Stok">{inventory.maxQuantity} {inventory.unit}</Descriptions.Item>
          <Descriptions.Item label="Konum">{inventory.location}</Descriptions.Item>
          <Descriptions.Item label="Tedarikçi">{inventory.supplier}</Descriptions.Item>
          <Descriptions.Item label="Son Kullanma Tarihi">{inventory.expiryDate}</Descriptions.Item>
          <Descriptions.Item label="Parti Numarası">{inventory.batchNumber}</Descriptions.Item>
          <Descriptions.Item label="Açıklama" span={3}>{inventory.description}</Descriptions.Item>
          <Descriptions.Item label="Notlar" span={3}>{inventory.notes}</Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

export default InventoryDetailPage; 