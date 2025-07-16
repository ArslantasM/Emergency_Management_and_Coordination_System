"use client";

import React, { useState } from 'react';
import { Card, Row, Col, Button, DatePicker, Select, Typography, Space, Table, Tag, Statistic } from 'antd';
import { 
  BarChartOutlined, 
  FileExcelOutlined, 
  FilePdfOutlined,
  PrinterOutlined,
  TeamOutlined,
  HomeOutlined,
  RiseOutlined,
  SafetyOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const ReportsPage = () => {
  const router = useRouter();
  const [reportType, setReportType] = useState('occupancy');

  // Örnek istatistik verileri
  const stats = {
    totalReports: 250,
    monthlyReports: 45,
    averageOccupancy: 85,
    totalExports: 1250,
  };

  // Örnek rapor verileri
  const reportsData = [
    {
      id: 1,
      name: 'Doluluk Raporu',
      type: 'Doluluk',
      period: 'Mayıs 2025',
      status: 'Hazır',
      createdBy: 'Ahmet Yılmaz',
      createdAt: '2025-05-22',
      format: 'PDF',
      size: '2.5 MB',
    },
    {
      id: 2,
      name: 'Hizmet Performans Raporu',
      type: 'Hizmet',
      period: 'Mayıs 2025',
      status: 'Hazırlanıyor',
      createdBy: 'Ayşe Demir',
      createdAt: '2025-05-22',
      format: 'Excel',
      size: '1.8 MB',
    },
  ];

  const columns = [
    {
      title: 'Rapor Adı',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Tür',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const typeColors = {
          'Doluluk': 'blue',
          'Hizmet': 'green',
          'Envanter': 'orange',
          'Personel': 'purple',
          'Finansal': 'red',
        };
        return <Tag color={typeColors[type as keyof typeof typeColors]}>{type}</Tag>;
      },
    },
    {
      title: 'Dönem',
      dataIndex: 'period',
      key: 'period',
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'Hazır' ? 'success' : 'processing'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Oluşturan',
      dataIndex: 'createdBy',
      key: 'createdBy',
    },
    {
      title: 'Tarih',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: 'Format',
      dataIndex: 'format',
      key: 'format',
      render: (format: string) => (
        <Tag color={format === 'PDF' ? 'red' : 'green'}>
          {format}
        </Tag>
      ),
    },
    {
      title: 'Boyut',
      dataIndex: 'size',
      key: 'size',
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button type="link" onClick={() => router.push(`/dashboard/reports/${record.id}`)}>
            Görüntüle
          </Button>
          <Button type="link" onClick={() => router.push(`/dashboard/reports/${record.id}/download`)}>
            İndir
          </Button>
          <Button type="link" onClick={() => router.push(`/dashboard/reports/${record.id}/print`)}>
            Yazdır
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card>
        <div className="flex justify-between items-center mb-6">
          <Title level={2}>Kent Raporları</Title>
          <Space>
            <Button
              icon={<FileExcelOutlined />}
              style={{ 
                display: 'flex',
                alignItems: 'center'
              }}
            >
              Excel
            </Button>
            <Button
              icon={<FilePdfOutlined />}
              style={{ 
                display: 'flex',
                alignItems: 'center'
              }}
            >
              PDF
            </Button>
            <Button
              icon={<PrinterOutlined />}
              style={{ 
                display: 'flex',
                alignItems: 'center'
              }}
            >
              Yazdır
            </Button>
          </Space>
        </div>

        {/* İstatistik Kartları */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Toplam Rapor"
                value={stats.totalReports}
                prefix={<BarChartOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Aylık Rapor"
                value={stats.monthlyReports}
                prefix={<RiseOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Ortalama Doluluk"
                value={stats.averageOccupancy}
                prefix={<HomeOutlined />}
                suffix="%"
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Toplam İndirme"
                value={stats.totalExports}
                prefix={<SafetyOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Filtreler */}
        <div className="mb-6">
          <Space size="large">
            <Select
              style={{ width: 200 }}
              placeholder="Rapor Türü Seçin"
              onChange={(value) => setReportType(value)}
              value={reportType}
            >
              <Option value="occupancy">Doluluk Raporu</Option>
              <Option value="service">Hizmet Raporu</Option>
              <Option value="inventory">Envanter Raporu</Option>
              <Option value="personnel">Personel Raporu</Option>
              <Option value="financial">Finansal Rapor</Option>
            </Select>
            <RangePicker style={{ width: 300 }} />
            <Button 
              type="primary"
              style={{ 
                background: '#1890ff',
                borderColor: '#1890ff',
                color: 'white',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              Rapor Oluştur
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={reportsData}
          rowKey="id"
          pagination={{
            total: reportsData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
        />
      </Card>
    </div>
  );
};

export default ReportsPage; 