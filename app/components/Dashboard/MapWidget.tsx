"use client";

import React, { useState, useEffect } from 'react';
import { Card, Spin, Switch, Tag, message } from 'antd';
import dynamic from 'next/dynamic';

// Mapbox sağlayıcısını dinamik olarak içe aktaralım
const MapboxProvider = dynamic(
  () => import('./MapProviders/MapboxProvider'),
  { ssr: false, loading: () => <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Spin size="large" /></div> }
);

// Leaflet Map bileşenini dinamik olarak içe aktaralım (OpenStreetMap için)
const LeafletMapComponent = dynamic(
  () => import('./LeafletMapComponent'),
  { ssr: false, loading: () => <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Spin size="large" /></div> }
);

// Google Maps sağlayıcısını dinamik olarak içe aktaralım
const GoogleMapComponent = dynamic(
  () => import('./GoogleMapComponent'),
  { ssr: false, loading: () => <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Spin size="large" /></div> }
);

// Harita uyarıları tipini tanımlama
export interface EmergencyAlert {
  id: number;
  title: string;
  location: number[];
  type: string;
  severity: string;
  createdAt: string;
  createdBy: string;
}

export interface MapWidgetProps {
  emergencyAlerts?: EmergencyAlert[];
  adminMode?: boolean;
  activeMapType?: 'mapbox' | 'osm' | 'google';
  enable3D?: boolean;
  enableDrawing?: boolean;
  offlineMode?: boolean;
  onMapDataChange?: (data: any) => void;
  userRegion?: string; // Kullanıcının bölgesi
  userRole?: string;   // Kullanıcının rolü
}

const MapWidget: React.FC<MapWidgetProps> = ({ 
  emergencyAlerts = [], 
  adminMode = false, 
  activeMapType = 'mapbox',
  enable3D = true,
  enableDrawing = true,
  offlineMode = false,
  onMapDataChange,
  userRegion = '',
  userRole = ''
}) => {
  const [loading, setLoading] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(offlineMode);
  const [cachedTiles, setCachedTiles] = useState<{[key: string]: boolean}>({});
  const [fires, setFires] = useState<any[]>([]);
  const [tsunamiAlerts, setTsunamiAlerts] = useState<any[]>([]);
  const [earthquakes, setEarthquakes] = useState<any[]>([]);
  
  // Yangın verilerini çekme
  const fetchFires = async () => {
    try {
      const response = await fetch('/api/fires');
      if (response.ok) {
        const data = await response.json();
        setFires(data.features || []);
      } else {
        console.error('Yangın verileri çekilemedi:', response.statusText);
      }
    } catch (error) {
      console.error('Yangın verileri çekme hatası:', error);
    }
  };

  // Tsunami uyarılarını çekme
  const fetchTsunamiAlerts = async () => {
    try {
      const response = await fetch('/api/tsunami-alerts');
      if (response.ok) {
        const data = await response.json();
        setTsunamiAlerts(data.features || []);
      } else {
        console.error('Tsunami verileri çekilemedi:', response.statusText);
      }
    } catch (error) {
      console.error('Tsunami verileri çekme hatası:', error);
    }
  };

  // Deprem verilerini çekme
  const fetchEarthquakes = async () => {
    try {
      const response = await fetch('/api/earthquakes');
      if (response.ok) {
        const data = await response.json();
        setEarthquakes(data.features || []);
      } else {
        console.error('Deprem verileri çekilemedi:', response.statusText);
      }
    } catch (error) {
      console.error('Deprem verileri çekme hatası:', error);
    }
  };
  
  // Harita yüklendikten sonra loading durumunu güncelleme
  useEffect(() => {
    // Haritanın yüklenmesi için bir gecikme ekleyelim (opsiyonel)
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    // LocalStorage'dan cache durumunu yükle
    if (typeof window !== 'undefined') {
      const savedCache = localStorage.getItem('mapTileCache');
      if (savedCache) {
        try {
          setCachedTiles(JSON.parse(savedCache));
        } catch (e) {
          console.error('Cache durumu yüklenemedi:', e);
        }
      }
      
      // Offline mod tercihi
      const savedOfflineMode = localStorage.getItem('mapOfflineMode');
      if (savedOfflineMode) {
        setIsOfflineMode(savedOfflineMode === 'true');
      }
    }

    // Verileri çek
    fetchFires();
    fetchTsunamiAlerts();
    fetchEarthquakes();

    // 5 dakikada bir verileri güncelle
    const interval = setInterval(() => {
      fetchFires();
      fetchTsunamiAlerts();
      fetchEarthquakes();
    }, 5 * 60 * 1000);
    
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);
  
  // Offline modu değiştirme
  const toggleOfflineMode = (checked: boolean) => {
    setIsOfflineMode(checked);
    if (typeof window !== 'undefined') {
      localStorage.setItem('mapOfflineMode', checked.toString());
    }
    message.info(checked ? 'Çevrimdışı mod etkinleştirildi' : 'Çevrimdışı mod devre dışı bırakıldı');
  };
  
  const renderMapProvider = () => {
    const commonProps = { 
      emergencyAlerts, 
      fires,
      tsunamiAlerts,
      earthquakes,
      adminMode,
      enable3D,
      enableDrawing,
      offlineMode: isOfflineMode,
      cachedTiles,
      onMapDataChange,
      userRegion,
      userRole
    };
    
    switch (activeMapType) {
      case 'osm':
        return <LeafletMapComponent {...commonProps} />;
      case 'google':
        return <GoogleMapComponent {...commonProps} />;
      case 'mapbox':
      default:
        return <MapboxProvider {...commonProps} />;
    }
  };
  
  return (
    <Card 
      style={{ height: '100%', padding: 0, position: 'relative', overflow: 'visible' }} 
      styles={{ 
        body: { 
          height: '100%', 
          padding: 0, 
          overflow: 'visible',
          position: 'relative',
          zIndex: 50
        } 
      }}
      extra={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Tag color={isOfflineMode ? 'green' : 'blue'}>
            {isOfflineMode ? 'Çevrimdışı Mod' : 'Çevrimiçi Mod'}
          </Tag>
          <Switch 
            checked={isOfflineMode} 
            onChange={toggleOfflineMode} 
            checkedChildren="Çevrimdışı" 
            unCheckedChildren="Çevrimiçi"
          />
        </div>
      }
    >
      <div style={{ height: '100%', position: 'relative', zIndex: 60 }}>
        {renderMapProvider()}
      </div>
    </Card>
  );
};

export default MapWidget; 