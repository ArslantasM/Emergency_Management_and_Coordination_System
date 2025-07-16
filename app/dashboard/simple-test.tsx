"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Layout, Spin, Alert, notification } from 'antd';
import { emergencyApi, EarthquakeData, TsunamiData } from '@/app/services/emergencyApi';

const { Content } = Layout;

// 🚀 Dynamic Imports - Lazy Loading için Optimize Edilmiş Component'ler
const DashboardStats = dynamic(
  () => import('./components/DashboardStats'),
  { 
    ssr: false,
    loading: () => <div style={{ height: '200px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Spin size="large" /></div>
  }
);

const DashboardMap = dynamic(
  () => import('./components/DashboardMap'),
  { 
    ssr: false,
    loading: () => <div style={{ height: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Spin size="large" /></div>
  }
);

const DashboardChat = dynamic(
  () => import('./components/DashboardChat'),
  { 
    ssr: false,
    loading: () => <div style={{ height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Spin size="large" /></div>
  }
);

const SimpleTestDashboard: React.FC = () => {
  const [userRole] = useState<string>('admin'); // Test için sabit rol
  const [recentEarthquakes, setRecentEarthquakes] = useState<EarthquakeData[]>([]);
  const [recentTsunamis, setRecentTsunamis] = useState<TsunamiData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  
  useEffect(() => {
    const fetchRecentData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Son 24 saatteki verileri getir
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);

        console.log('API çağrıları başlatılıyor...');

        const [earthquakeData, tsunamiData] = await Promise.all([
          emergencyApi.getEarthquakes({
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            minMagnitude: 4.0
          }),
          emergencyApi.getTsunamis({
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
          })
        ]);

        console.log('Deprem verileri:', earthquakeData);
        console.log('Tsunami verileri:', tsunamiData);

        setRecentEarthquakes(earthquakeData);
        setRecentTsunamis(tsunamiData);
      } catch (error) {
        console.error('Veri alınırken hata:', error);
        setError('Veriler alınırken bir hata oluştu. Mock veriler kullanılacak.');
        
        // Hata durumunda mock veriler kullan
        setRecentEarthquakes([]);
        setRecentTsunamis([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentData();

    // WebSocket simülasyonunu başlat
    let unsubscribe: (() => void) | undefined;

    try {
      unsubscribe = emergencyApi.subscribeToEmergencyUpdates((data) => {
        setWsConnected(true);
        console.log('WebSocket data:', data);
        
        if ('magnitude' in data) {
          setRecentEarthquakes(prev => {
            const newData = [...prev];
            const index = newData.findIndex(eq => eq.id === data.id);
            if (index !== -1) {
              newData[index] = data as EarthquakeData;
            } else {
              newData.unshift(data as EarthquakeData);
            }
            return newData.slice(0, 100);
          });
        }
      });
    } catch (error) {
      console.error('WebSocket bağlantısı başlatılırken hata:', error);
      setWsConnected(false);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);
  
  // Hata durumunda uyarı göster (ama devam et)
  if (error) {
    notification.warning({
      message: 'API Bağlantısı',
      description: error,
      duration: 3
    });
  }

  return (
    <Content style={{ padding: '24px', background: '#f5f5f5' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1>🚨 Acil Durum Yönetim Sistemi - Test Dashboard</h1>
        <p>Authentication olmadan harita test sayfası</p>
      </div>
      
      <div style={{ display: 'grid', gap: '24px' }}>
        {/* 📊 İstatistikler */}
        <DashboardStats userRole={userRole} />
        
        {/* 🗺️ Harita */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          <DashboardMap 
            earthquakes={recentEarthquakes}
            tsunamis={recentTsunamis}
            loading={loading}
            wsConnected={wsConnected}
          />
          <div style={{ padding: '20px', background: 'white', borderRadius: '8px' }}>
            <h3>📊 Sistem Bilgileri</h3>
            <p><strong>Deprem Sayısı:</strong> {recentEarthquakes.length}</p>
            <p><strong>Tsunami Uyarısı:</strong> {recentTsunamis.length}</p>
            <p><strong>WebSocket:</strong> {wsConnected ? '🟢 Bağlı' : '🔴 Bağlı Değil'}</p>
            <p><strong>Durum:</strong> {loading ? '🔄 Yükleniyor' : '✅ Hazır'}</p>
            {error && <p><strong>Hata:</strong> {error}</p>}
          </div>
        </div>
        
        {/* 💬 Chat */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
          <DashboardChat userRole={userRole} />
          <div style={{ padding: '20px', background: 'white', borderRadius: '8px', textAlign: 'center' }}>
            📢 Bildirimler<br />
            <small>Test modunda...</small>
          </div>
          <div style={{ padding: '20px', background: 'white', borderRadius: '8px', textAlign: 'center' }}>
            🛠️ Ayarlar<br />
            <small>Geliştirme aşamasında...</small>
          </div>
        </div>
      </div>
    </Content>
  );
};

export default SimpleTestDashboard; 