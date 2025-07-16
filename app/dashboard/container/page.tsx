"use client";

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Typography, 
  Button
} from 'antd';
import {
  HomeOutlined,
  TeamOutlined,
  ToolOutlined,
  UsergroupAddOutlined,
  CustomerServiceOutlined,
  DatabaseOutlined,
  BarChartOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const { Title } = Typography;

interface CampData {
  id: string;
  name: string;
  type: string;
  capacity: number;
  currentOccupancy: number;
  status: string;
}

interface StatsData {
  container: { count: number; capacity: number; occupancy: number };
  tent: { count: number; capacity: number; occupancy: number };
  mixed: { count: number; capacity: number; occupancy: number };
  total: { count: number; capacity: number; occupancy: number };
}

const ContainerPage = () => {
  const router = useRouter();
  const [stats, setStats] = useState<StatsData>({
    container: { count: 0, capacity: 0, occupancy: 0 },
    tent: { count: 0, capacity: 0, occupancy: 0 },
    mixed: { count: 0, capacity: 0, occupancy: 0 },
    total: { count: 0, capacity: 0, occupancy: 0 }
  });
  const [loading, setLoading] = useState(false);

  // İstatistikleri yükle
  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/containers');
      const result = await response.json();
      
      if (result.success) {
        calculateStats(result.data);
      }
    } catch (error) {
      console.error('İstatistik yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  // İstatistikleri hesapla
  const calculateStats = (campsData: CampData[]) => {
    const newStats: StatsData = {
      container: { count: 0, capacity: 0, occupancy: 0 },
      tent: { count: 0, capacity: 0, occupancy: 0 },
      mixed: { count: 0, capacity: 0, occupancy: 0 },
      total: { count: 0, capacity: 0, occupancy: 0 }
    };

    campsData.forEach((camp: CampData) => {
      const type = camp.type.toLowerCase() as keyof typeof newStats;
      if (newStats[type] && type !== 'total') {
        newStats[type].count++;
        newStats[type].capacity += camp.capacity;
        newStats[type].occupancy += camp.currentOccupancy;
      }
      
      newStats.total.count++;
      newStats.total.capacity += camp.capacity;
      newStats.total.occupancy += camp.currentOccupancy;
    });

    setStats(newStats);
  };

  useEffect(() => {
    loadStats();
  }, []);

  // Kontrol paneli kartları
  const managementCards = [
    {
      title: 'Kent Listesi',
      icon: <HomeOutlined />,
      color: '#1890ff',
      stat: stats.total.count,
      statTitle: 'Toplam Kent',
      description: 'Aktif konteyner ve çadır kentleri',
      path: '/dashboard/container/list'
    },
    {
      title: 'Kent Personeli',
      icon: <TeamOutlined />,
      color: '#52c41a',
      stat: 156,
      statTitle: 'Aktif Personel',
      description: 'Kent yönetimi ve hizmet personeli',
      path: '/dashboard/container/personnel'
    },
    {
      title: 'Altyapı Yönetimi',
      icon: <ToolOutlined />,
      color: '#fa8c16',
      stat: 89,
      statTitle: 'Altyapı Sistemi',
      description: 'Su, elektrik, kanalizasyon sistemleri',
      path: '/dashboard/container/infrastructure'
    },
    {
      title: 'Sakinler',
      icon: <UsergroupAddOutlined />,
      color: '#722ed1',
      stat: stats.total.occupancy,
      statTitle: 'Toplam Sakin',
      description: 'Kentlerde yaşayan kişi sayısı',
      path: '/dashboard/container/residents'
    },
    {
      title: 'Hizmetler',
      icon: <CustomerServiceOutlined />,
      color: '#eb2f96',
      stat: 18,
      statTitle: 'Aktif Hizmet',
      description: 'Sağlık, eğitim, sosyal hizmetler',
      path: '/dashboard/container/services'
    },
    {
      title: 'Envanter',
      icon: <DatabaseOutlined />,
      color: '#13c2c2',
      stat: 342,
      statTitle: 'Malzeme Türü',
      description: 'Depo ve envanter yönetimi',
      path: '/dashboard/container/inventory'
    },
    {
      title: 'Raporlar',
      icon: <BarChartOutlined />,
      color: '#f5222d',
      stat: 12,
      statTitle: 'Aylık Rapor',
      description: 'Faaliyet ve durum raporları',
      path: '/dashboard/container/reports'
    }
  ];

  // İstatistik kartları
  const statsCards = [
    {
      title: 'Konteyner Kentler',
      icon: '🏠',
      color: '#1890ff',
      stat: stats.container.count,
      statTitle: 'Konteyner Kent',
      description: `${stats.container.capacity} kişi kapasiteli`,
    },
    {
      title: 'Çadır Kentler',
      icon: '⛺',
      color: '#52c41a',
      stat: stats.tent.count,
      statTitle: 'Çadır Kent',
      description: `${stats.tent.capacity} kişi kapasiteli`,
    },
    {
      title: 'Karma Kentler',
      icon: '🏘️',
      color: '#fa8c16',
      stat: stats.mixed.count,
      statTitle: 'Karma Kent',
      description: `${stats.mixed.capacity} kişi kapasiteli`,
    },
    {
      title: 'Toplam Kapasite',
      icon: '🏕️',
      color: '#722ed1',
      stat: stats.total.capacity,
      statTitle: 'Kişi Kapasitesi',
      description: `${stats.total.occupancy} kişi mevcut`,
    }
  ];

  const handleCardClick = (path: string) => {
    router.push(path);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>Kent Yönetimi Kontrol Paneli</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => router.push('/dashboard/container/list')}
          size="large"
        >
          Kent Listesine Git
        </Button>
      </div>

      {/* İstatistik Kartları */}
      <Card title="📊 Kent İstatistikleri" className="mb-6" loading={loading}>
        <Row gutter={[16, 16]}>
          {statsCards.map((item, index) => (
            <Col xs={24} sm={12} md={6} key={index}>
              <Card hoverable>
                <div className="flex items-center mb-4">
                  <div
                    className="flex items-center justify-center rounded-lg p-3 mr-4"
                    style={{ backgroundColor: item.color + '15' }}
                  >
                    <span style={{ color: item.color, fontSize: '24px' }}>
                      {item.icon}
                    </span>
                  </div>
                  <div>
                    <Title level={4} style={{ margin: 0 }}>{item.title}</Title>
                    <p className="text-gray-500 m-0">{item.description}</p>
                  </div>
                </div>
                <Statistic
                  title={item.statTitle}
                  value={item.stat}
                  valueStyle={{ color: item.color }}
                />
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Yönetim Kartları */}
      <Card title="🎛️ Yönetim Modülleri">
        <Row gutter={[16, 16]}>
          {managementCards.map((item, index) => (
            <Col xs={24} sm={12} md={8} lg={6} key={index}>
              <Card 
                hoverable 
                onClick={() => handleCardClick(item.path)}
                className="cursor-pointer transition-all duration-200 hover:shadow-lg"
              >
                <div className="flex items-center mb-4">
                  <div
                    className="flex items-center justify-center rounded-lg p-3 mr-4"
                    style={{ backgroundColor: item.color + '15' }}
                  >
                    <span style={{ color: item.color, fontSize: '24px' }}>
                      {item.icon}
                    </span>
                  </div>
                  <div>
                    <Title level={4} style={{ margin: 0 }}>{item.title}</Title>
                    <p className="text-gray-500 m-0 text-sm">{item.description}</p>
                  </div>
                </div>
                <Statistic
                  title={item.statTitle}
                  value={item.stat}
                  valueStyle={{ color: item.color }}
                />
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  );
};

export default ContainerPage; 