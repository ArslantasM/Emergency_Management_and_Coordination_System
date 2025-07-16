"use client";

import { useState, useEffect } from 'react';
import { LayersControl, TileLayer, useMap } from 'react-leaflet';
import { useSession } from 'next-auth/react';
import { Button, Drawer, Radio, Space, Typography, Card, message, Input } from 'antd';
import { EnvironmentOutlined, SettingOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

// Harita sağlayıcıları için yapılandırma
interface MapProviderConfig {
  id: string;
  name: string;
  attribution: string;
  url: string;
  maxZoom: number;
  subdomains?: string;
  isDefault?: boolean;
  group: string;
  apiKeyRequired?: boolean;
}

// Kullanılabilir harita sağlayıcıları
const mapProviders: MapProviderConfig[] = [
  {
    id: "osm",
    name: "OpenStreetMap",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    maxZoom: 19,
    subdomains: "abc",
    isDefault: true,
    group: "Standart"
  },
  {
    id: "esri-satellite",
    name: "ESRI Uydu Görüntüsü",
    attribution: '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    maxZoom: 19,
    group: "Uydu"
  },
  {
    id: "google-satellite",
    name: "Google Uydu",
    attribution: '&copy; Google',
    url: "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
    maxZoom: 20,
    group: "Uydu",
    apiKeyRequired: true
  },
  {
    id: "google-hybrid",
    name: "Google Hibrit",
    attribution: '&copy; Google',
    url: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
    maxZoom: 20,
    group: "Hibrit",
    apiKeyRequired: true
  },
  {
    id: "opentopomap",
    name: "Topografik Harita",
    attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    maxZoom: 17,
    subdomains: "abc",
    group: "Topografik"
  },
  {
    id: "stamen-terrain",
    name: "Stamen Terrain",
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    url: "https://stamen-tiles.a.ssl.fastly.net/terrain/{z}/{x}/{y}.png",
    maxZoom: 18,
    group: "Topografik"
  },
  {
    id: "hgm-kure",
    name: "HGM Küre",
    attribution: '&copy; <a href="https://www.harita.gov.tr">Harita Genel Müdürlüğü</a>',
    url: "https://cbsservices.tkgm.gov.tr/kure/wmts/1.0.0/kure/default/GoogleMapsCompatible/{z}/{y}/{x}.png",
    maxZoom: 18,
    group: "Türkiye",
    apiKeyRequired: true
  },
  {
    id: "hgm-atlas",
    name: "HGM Atlas",
    attribution: '&copy; <a href="https://www.harita.gov.tr">Harita Genel Müdürlüğü</a>',
    url: "https://cbsservices.tkgm.gov.tr/atlas/wmts/1.0.0/atlas/default/GoogleMapsCompatible/{z}/{y}/{x}.png",
    maxZoom: 18,
    group: "Türkiye",
    apiKeyRequired: true
  },
  {
    id: "mapbox-streets",
    name: "Mapbox Sokak",
    attribution: '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    url: "https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token={accessToken}",
    maxZoom: 19,
    group: "Mapbox",
    apiKeyRequired: true
  },
  {
    id: "mapbox-satellite",
    name: "Mapbox Uydu",
    attribution: '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    url: "https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/tiles/{z}/{x}/{y}?access_token={accessToken}",
    maxZoom: 19,
    group: "Mapbox",
    apiKeyRequired: true
  }
];

interface MapProvidersProps {
  adminOnly?: boolean;
}

export const MapProviders: React.FC<MapProvidersProps> = ({ adminOnly = false }) => {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'admin';
  const map = useMap();
  
  // Admin harita yapılandırma durumları
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [activeProviderId, setActiveProviderId] = useState<string>(
    typeof window !== 'undefined' ? localStorage.getItem('preferredMapProvider') || 'osm' : 'osm'
  );
  
  // API Key'ler
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({
    mapbox: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '',
    google: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    hgm: process.env.NEXT_PUBLIC_HGM_API_KEY || ''
  });
  
  // Aktif olacak harita sağlayıcısını başlangıçta ayarla
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // API key'leri localStorage'dan yükle (eğer varsa)
    const savedKeys = localStorage.getItem('mapApiKeys');
    if (savedKeys) {
      try {
        setApiKeys({...apiKeys, ...JSON.parse(savedKeys)});
      } catch (e) {
        console.error('API anahtarları yüklenemedi:', e);
      }
    }
    
    // Tercih edilen harita sağlayıcısını kontrol et
    const savedProvider = localStorage.getItem('preferredMapProvider');
    if (savedProvider) {
      setActiveProviderId(savedProvider);
    }
  }, []);
  
  // Tercih edilen harita sağlayıcısını kaydet
  const setPreferredProvider = (providerId: string) => {
    setActiveProviderId(providerId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferredMapProvider', providerId);
    }
    message.success('Harita sağlayıcısı değiştirildi');
  };
  
  // API anahtarını güncelle ve kaydet
  const updateApiKey = (provider: string, key: string) => {
    const newApiKeys = {...apiKeys, [provider]: key};
    setApiKeys(newApiKeys);
    if (typeof window !== 'undefined') {
      localStorage.setItem('mapApiKeys', JSON.stringify(newApiKeys));
    }
    message.success('API anahtarı güncellendi');
  };
  
  // Admin olmayan kullanıcılar için yalnızca varsayılan haritayı göster
  const availableProviders = mapProviders.filter(provider => {
    // API key gerektiren haritalar için, key varsa göster
    if (provider.apiKeyRequired) {
      if (provider.id.includes('mapbox') && !apiKeys.mapbox) return false;
      if (provider.id.includes('google') && !apiKeys.google) return false;
      if (provider.id.includes('hgm') && !apiKeys.hgm) return false;
    }
    
    // Admin değilse ve admin-only modundaysa sadece aktif haritayı göster
    if (adminOnly && !isAdmin) {
      return provider.id === activeProviderId;
    }
    
    return true;
  });
  
  // Harita sağlayıcılarını gruplara ayır
  const groupedProviders = availableProviders.reduce((groups, provider) => {
    if (!groups[provider.group]) {
      groups[provider.group] = [];
    }
    groups[provider.group].push(provider);
    return groups;
  }, {} as Record<string, MapProviderConfig[]>);
  
  return (
    <>
      <LayersControl position="topright">
        {availableProviders.map((provider) => {
          // Mapbox için özel URL'yi hazırla
          let providerUrl = provider.url;
          if (provider.id.includes('mapbox')) {
            providerUrl = provider.url.replace('{accessToken}', apiKeys.mapbox);
          }
          
          return (
            <LayersControl.BaseLayer 
              key={provider.id} 
              name={provider.name} 
              checked={provider.id === activeProviderId}
            >
              <TileLayer
                attribution={provider.attribution}
                url={providerUrl}
                maxZoom={provider.maxZoom}
                subdomains={provider.subdomains || ''}
              />
            </LayersControl.BaseLayer>
          );
        })}
      </LayersControl>
      
      {isAdmin && adminOnly && (
        <div className="leaflet-top leaflet-right" style={{ marginTop: '40px', marginRight: '10px' }}>
          <div className="leaflet-control leaflet-bar">
            <Button 
              type="default"
              icon={<SettingOutlined />}
              onClick={() => setDrawerVisible(true)}
              style={{ background: '#fff' }}
            />
          </div>
        </div>
      )}
      
      <Drawer
        title="Harita Sağlayıcı Ayarları"
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={400}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <Title level={5}>Aktif Harita Sağlayıcısı</Title>
            <Text type="secondary">Kullanılacak harita sağlayıcısını seçin. API anahtarı gerektiren sağlayıcılar için anahtarınızı girmeniz gerekir.</Text>
            
            <Radio.Group 
              onChange={(e) => setPreferredProvider(e.target.value)} 
              value={activeProviderId}
              style={{ marginTop: 16, width: '100%' }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                {Object.entries(groupedProviders).map(([group, providers]) => (
                  <Card 
                    title={group} 
                    size="small" 
                    key={group}
                    styles={{ body: { marginBottom: 8 } }}
                  >
                    <Space direction="vertical" style={{ width: '100%' }}>
                      {providers.map(provider => (
                        <Radio key={provider.id} value={provider.id}>
                          {provider.name}
                          {provider.apiKeyRequired && (
                            <Text type="secondary" style={{ marginLeft: 4 }}>
                              (API Key gerekli)
                            </Text>
                          )}
                        </Radio>
                      ))}
                    </Space>
                  </Card>
                ))}
              </Space>
            </Radio.Group>
          </div>
          
          <div>
            <Title level={5}>API Anahtarları</Title>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text>Mapbox API Anahtarı</Text>
                <Input.Password
                  value={apiKeys.mapbox}
                  onChange={(e) => updateApiKey('mapbox', e.target.value)}
                  placeholder="Mapbox API Anahtarı"
                  style={{ marginTop: 4 }}
                />
              </div>
              
              <div>
                <Text>Google Maps API Anahtarı</Text>
                <Input.Password
                  value={apiKeys.google}
                  onChange={(e) => updateApiKey('google', e.target.value)}
                  placeholder="Google Maps API Anahtarı"
                  style={{ marginTop: 4 }}
                />
              </div>
              
              <div>
                <Text>HGM API Anahtarı</Text>
                <Input.Password
                  value={apiKeys.hgm}
                  onChange={(e) => updateApiKey('hgm', e.target.value)}
                  placeholder="HGM API Anahtarı"
                  style={{ marginTop: 4 }}
                />
              </div>
            </Space>
          </div>
        </Space>
      </Drawer>
    </>
  );
};

export default MapProviders; 