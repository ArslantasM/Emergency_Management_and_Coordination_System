"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  Spin, 
  Alert, 
  Button, 
  Space, 
  Typography, 
  Statistic,
  Row,
  Col,
  Tag,
  Select,
  DatePicker,
  InputNumber
} from 'antd';
import { 
  EnvironmentOutlined, 
  ReloadOutlined,
  WarningOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { emergencyApi, type EarthquakeData, type TsunamiData } from '../../services/emergencyApi';
import EarthquakeTable from '../../components/Dashboard/EarthquakeTable';
import dynamic from 'next/dynamic';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// Dynamic import for SimpleMap to avoid SSR issues
const SimpleMap = dynamic(() => import('../../components/Dashboard/SimpleMap'), {
  ssr: false, 
  loading: () => (
    <div style={{
      height: '500px',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: '#f5f5f5',
      borderRadius: '8px'
    }}>
      <Spin size="large" />
    </div>
  )
});

interface MapPageProps {}

const MapPage: React.FC<MapPageProps> = () => {
  const { data: session, status } = useSession();
  const [dateRange, setDateRange] = useState<[Date, Date]>([
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    new Date()
  ]);
  const [minMagnitude, setMinMagnitude] = useState(4.0);
  const [refreshKey, setRefreshKey] = useState(0);

  // Auth check
  if (status === "loading") {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large">
          <div style={{ padding: '20px' }}>Yükleniyor...</div>
        </Spin>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <Alert
        message="Erişim Reddedildi"
        description="Bu sayfayı görüntülemek için oturum açmanız gerekiyor."
        type="warning"
        showIcon
        action={
          <Button size="small" type="primary">
            Giriş Yap
          </Button>
        }
      />
    );
  }

  // Earthquake data query
  const { 
    data: earthquakes, 
    isLoading: isLoadingEarthquakes, 
    error: earthquakeError,
    refetch: refetchEarthquakes
  } = useQuery({
    queryKey: ['earthquakes', refreshKey, minMagnitude],
    queryFn: async () => {
      try {
        return await emergencyApi.getEarthquakes({
          minMagnitude,
          days: 7
        });
      } catch (error) {
        console.error('Deprem verileri alınamadı:', error);
        return [];
      }
    },
    gcTime: 5 * 60 * 1000,
    staleTime: 2 * 60 * 1000,
    refetchInterval: 60000,
  });

  // Tsunami data query
  const { 
    data: tsunamis, 
    isLoading: isLoadingTsunamis,
    error: tsunamiError,
    refetch: refetchTsunamis
  } = useQuery({
    queryKey: ['tsunamis', refreshKey],
    queryFn: async () => {
      try {
        return await emergencyApi.getTsunamis();
      } catch (error) {
        console.error('Tsunami verileri alınamadı:', error);
        return [];
      }
    },
    gcTime: 5 * 60 * 1000,
    staleTime: 2 * 60 * 1000,
    refetchInterval: 120000,
  });

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    refetchEarthquakes();
    refetchTsunamis();
  };

  const earthquakeData = earthquakes || [];
  const tsunamiData = tsunamis || [];
  
  return (
    <div className="h-full p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <Title level={2} className="mb-2">
            <EnvironmentOutlined className="mr-2" />
            Afet Haritası
          </Title>
          <Text type="secondary">
            Gerçek zamanlı deprem ve tsunami verilerini harita üzerinde görüntüleyin
          </Text>
        </div>
        <Space>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={handleRefresh}
            loading={isLoadingEarthquakes || isLoadingTsunamis}
          >
            Yenile
          </Button>
        </Space>
      </div>
      
      {/* Statistics */}
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Toplam Deprem"
              value={earthquakeData.length}
              prefix={<EnvironmentOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
      </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tsunami Uyarısı"
              value={tsunamiData.length}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Yüksek Büyüklük"
              value={earthquakeData.filter(eq => eq.magnitude >= 5.0).length}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#fa541c' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Son 24 Saat"
              value={earthquakeData.filter(eq => 
                new Date(eq.date) > new Date(Date.now() - 24 * 60 * 60 * 1000)
              ).length}
              prefix={<InfoCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card title="Filtreleme Seçenekleri" size="small">
        <Row gutter={16} align="middle">
          <Col span={8}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong>Minimum Büyüklük:</Text>
              <InputNumber
                min={1}
                max={10}
                step={0.1}
                value={minMagnitude}
                onChange={value => setMinMagnitude(value || 4.0)}
                style={{ width: '100%' }}
              />
            </Space>
          </Col>
          <Col span={8}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong>Zaman Aralığı:</Text>
              <Select defaultValue="7days" style={{ width: '100%' }}>
                <Select.Option value="1day">Son 24 Saat</Select.Option>
                <Select.Option value="7days">Son 7 Gün</Select.Option>
                <Select.Option value="30days">Son 30 Gün</Select.Option>
              </Select>
            </Space>
          </Col>
          <Col span={8}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong>Kaynak:</Text>
              <Select defaultValue="all" style={{ width: '100%' }}>
                <Select.Option value="all">Tümü</Select.Option>
                <Select.Option value="AFAD">AFAD</Select.Option>
                <Select.Option value="USGS">USGS</Select.Option>
              </Select>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Error Alerts */}
      {earthquakeError && (
        <Alert
          message="Deprem Verisi Hatası"
          description="Deprem verileri alınamadı. Varsayılan veriler gösteriliyor."
          type="warning"
          showIcon
          closable
        />
      )}

      {tsunamiError && (
        <Alert
          message="Tsunami Verisi Hatası" 
          description="Tsunami verileri alınamadı."
          type="warning"
          showIcon
          closable
        />
      )}

      {/* Main Content */}
      <Row gutter={16}>
        {/* Map */}
        <Col span={16}>
          <Card
            title="Afet Haritası"
            extra={
              <Space>
                <Tag color="red">Deprem</Tag>
                <Tag color="blue">Tsunami</Tag>
              </Space>
            }
            style={{ height: '600px' }}
          >
            <Suspense fallback={
              <div style={{ 
                height: '500px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <Spin size="large" />
              </div>
            }>
              <SimpleMap 
                earthquakes={earthquakeData}
                tsunamis={tsunamiData}
                loading={isLoadingEarthquakes || isLoadingTsunamis}
              />
            </Suspense>
          </Card>
        </Col>

        {/* Data Table */}
        <Col span={8}>
          <Card
            title="Son Depremler"
            style={{ height: '600px', overflow: 'auto' }}
          >
            <Suspense fallback={<Spin />}>
              <EarthquakeTable 
                data={earthquakeData} 
                loading={isLoadingEarthquakes}
              />
            </Suspense>
          </Card>
        </Col>
      </Row>

      {/* Legend */}
      <Card title="Harita Açıklamaları" size="small">
        <Row gutter={16}>
          <Col span={12}>
            <Title level={5}>Deprem Büyüklüğü</Title>
            <Space wrap>
              <Tag color="red">6.0+ Büyük</Tag>
              <Tag color="orange">5.0-5.9 Orta</Tag>
              <Tag color="gold">4.0-4.9 Küçük</Tag>
              <Tag color="green">4.0 altı Çok Küçük</Tag>
            </Space>
          </Col>
          <Col span={12}>
            <Title level={5}>Tsunami Durumu</Title>
            <Space wrap>
              <Tag color="red">Aktif</Tag>
              <Tag color="orange">İzleme</Tag>
              <Tag color="blue">Tavsiye</Tag>
            </Space>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default MapPage; 