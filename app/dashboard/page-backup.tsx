"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
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

const DashboardTasks = dynamic(
  () => import('./components/DashboardTasks'),
  { 
    ssr: false,
    loading: () => <div style={{ height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Spin size="large" /></div>
  }
);

const DashboardUsers = dynamic(
  () => import('./components/DashboardUsers'),
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

const Dashboard: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userRole, setUserRole] = useState<string>('');
  const [recentEarthquakes, setRecentEarthquakes] = useState<EarthquakeData[]>([]);
  const [recentTsunamis, setRecentTsunamis] = useState<TsunamiData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  
  useEffect(() => {
    // Kullanıcı oturumu yüklendiğinde rolünü ayarla
    if (session?.user?.role) {
      setUserRole(session.user.role as string);
    }
  }, [session]);
  
  useEffect(() => {
    const fetchRecentData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Son 24 saatteki verileri getir
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);

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

        setRecentEarthquakes(earthquakeData);
        setRecentTsunamis(tsunamiData);
      } catch (error) {
        console.error('Veri alınırken hata:', error);
        setError('Veriler alınırken bir hata oluştu. Lütfen sayfayı yenileyin.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecentData();

    let unsubscribe: (() => void) | undefined;

    try {
      unsubscribe = emergencyApi.subscribeToEmergencyUpdates((data) => {
        setWsConnected(true);
        
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
        } else if ('waveHeight' in data) {
          setRecentTsunamis(prev => {
            const newData = [...prev];
            const index = newData.findIndex(ts => ts.id === data.id);
            if (index !== -1) {
              newData[index] = data as TsunamiData;
            } else {
              newData.unshift(data as TsunamiData);
            }
            return newData.slice(0, 50);
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
  
  // Oturum yükleniyor durumu
  if (status === "loading") {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Spin size="large">
        <div style={{ padding: '20px' }}>Yükleniyor...</div>
      </Spin>
    </div>;
  }
  
  // Kullanıcı bilgisi
  const user = session?.user;
  const userRegion = user?.regions?.[0] || '';
  
  // Hata durumunda uyarı göster
  if (error) {
    return (
      <Content style={{ padding: '24px' }}>
        <Alert
          message="Veri Yükleme Hatası"
          description={error}
          type="error"
          showIcon
          action={
            <button onClick={() => window.location.reload()}>
              Sayfayı Yenile
            </button>
          }
        />
      </Content>
    );
  }

  return (
    <Content style={{ padding: '24px', background: '#f5f5f5' }}>
      <div style={{ display: 'grid', gap: '24px' }}>
        {/* 📊 İstatistikler - Lazy Loaded */}
        <DashboardStats userRole={userRole} />
        
        {/* 🗺️ Harita & Aktif Kullanıcılar - Grid Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          <DashboardMap 
            earthquakes={recentEarthquakes}
            tsunamis={recentTsunamis}
            loading={loading}
            wsConnected={wsConnected}
          />
          <DashboardUsers userRole={userRole} />
        </div>
        
        {/* 📋 Görevler, Bildirimler & Chat - Grid Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
          <DashboardTasks userRole={userRole} />
          <div>
            {/* Bildirimler komponenti gelecekte eklenebilir */}
            <div style={{ padding: '20px', background: 'white', borderRadius: '8px', textAlign: 'center' }}>
              📢 Bildirimler<br />
              <small>Geliştirme aşamasında...</small>
            </div>
          </div>
          <DashboardChat userRole={userRole} />
        </div>
      </div>
    </Content>
  );
};

export default Dashboard; 