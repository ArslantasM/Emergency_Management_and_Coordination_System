"use client";

import { useEffect, useState, useRef, useId } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button, Tooltip, Modal, Form, Input, Select, Space, message, Alert, Radio, Divider } from 'antd';
import { 
  DownloadOutlined, 
  CompassOutlined, 
  TeamOutlined, 
  SaveOutlined,
  DeleteOutlined,
  FileOutlined,
  GlobalOutlined
} from '@ant-design/icons';

const { Option } = Select;

// Harita uyarıları tipini tanımlama
interface EmergencyAlert {
  id: number;
  title: string;
  location: number[];
  type: string;
  severity: string;
}

interface MapComponentProps {
  emergencyAlerts: EmergencyAlert[];
  adminMode: boolean;
}

// Harita Sağlayıcı Kontrol Bileşeni
const MapProviderController: React.FC<{
  adminMode: boolean;
}> = ({ adminMode }) => {
  const map = useMap();
  const [currentProvider, setCurrentProvider] = useState('openstreet');

  // Harita sağlayıcısını değiştir
  const handleProviderChange = (provider: string) => {
    setCurrentProvider(provider);
    
    // Burada gerçek bir uygulamada harita katmanlarını değiştirirdik
    console.log(`Harita sağlayıcısı değiştirildi: ${provider}`);
    message.success(`${provider} harita sağlayıcısına geçildi`);
  };

  return (
    <div className="absolute top-0 left-0 right-0 z-[1000]">
      <div className="bg-white p-2 m-2 rounded-md shadow-md">
        <div className="flex items-center justify-between">
          <Space>
            <Tooltip title="Harita Sağlayıcıları">
              <GlobalOutlined />
            </Tooltip>
            <Radio.Group 
              value={currentProvider} 
              onChange={(e) => handleProviderChange(e.target.value)}
              size="small"
            >
              <Radio.Button value="openstreet">OpenStreet</Radio.Button>
              <Radio.Button value="google" disabled={!adminMode}>Google</Radio.Button>
              <Radio.Button value="hgm" disabled={!adminMode}>HGM</Radio.Button>
              <Radio.Button value="mapbox" disabled={!adminMode}>Mapbox</Radio.Button>
            </Radio.Group>
          </Space>
        </div>
      </div>
    </div>
  );
};

// Farklı uyarı tipleri için özel ikonlar
const getAlertIcon = (type: string, severity: string) => {
  const iconSize: [number, number] = [32, 32];
  const iconAnchor: [number, number] = [16, 32];
  const popupAnchor: [number, number] = [0, -32];
  
  // Severity'ye göre farklı renk kullanacağız
  let iconColor = '#1890ff'; // default mavi
  
  switch (severity) {
    case 'high':
      iconColor = '#f5222d'; // kırmızı
      break;
    case 'medium':
      iconColor = '#faad14'; // turuncu
      break;
    case 'low':
      iconColor = '#52c41a'; // yeşil
      break;
  }
  
  // SVG simge içeriğini hazırlayalım (farklı uyarı tipleri için farklı simgeler)
  let svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${iconColor}" width="32" height="32">
      <path d="M12 2L1 21h22L12 2zm0 3.516L20.297 19h-16.59L12 5.516zM11 10h2v5h-2v-5zm0 6h2v2h-2v-2z"/>
    </svg>
  `;
  
  // Uyarı tipine göre simge değiştirelim
  switch (type) {
    case 'earthquake':
      svgIcon = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${iconColor}" width="32" height="32">
          <path d="M12 2L1 21h22L12 2zm0 3.516L20.297 19h-16.59L12 5.516zM11 10h2v5h-2v-5zm0 6h2v2h-2v-2z"/>
        </svg>
      `;
      break;
    case 'flood':
      svgIcon = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${iconColor}" width="32" height="32">
          <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 2c4.411 0 8 3.589 8 8s-3.589 8-8 8-8-3.589-8-8 3.589-8 8-8z"/>
          <path d="M12 6c-3.309 0-6 2.691-6 6s2.691 6 6 6 6-2.691 6-6-2.691-6-6-6z"/>
        </svg>
      `;
      break;
    case 'fire':
      svgIcon = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${iconColor}" width="32" height="32">
          <path d="M16.5 8c0 1.5-0.5 3.5-2.9 4.3 0.7-1.7 0.8-3.4 0-3.9 -0.4-0.2-0.8-0.1-1.3 0.2 -0.7 0.5-1.2 0.7-1.8 0.7v-2.6c0-0.3-0.2-0.6-0.5-0.6 -0.3 0-0.5 0.3-0.5 0.6v3.9c-0.8-0.5-1.6-1.4-2.6-2.9 -0.3-0.6-0.7-0.6-0.9-0.6 -0.3 0-0.5 0.1-0.7 0.4 -0.2 0.3-0.2 0.6-0.1 0.9C6.1 10.9 8 13 11 13v4c0 0.3 0.2 0.6 0.5 0.6 0.3 0 0.5-0.3 0.5-0.6v-4c3-0.1 4.9-2.2 5.7-4.5 0.1-0.3 0-0.6-0.2-0.9C17.3 8.1 17.1 8 16.9 8H16.5z"/>
        </svg>
      `;
      break;
    case 'accident':
      svgIcon = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${iconColor}" width="32" height="32">
          <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1
          8-8 8 8 0 0 1-8 8zm3.5-9.5-1-1a.71.71 0 0 0-1 0L12
          11 10.5 9.5a.71.71 0 0 0-1 0l-1 1a.71.71 0 0 0 0 1L10
          13l-1.5 1.5a.71.71 0 0 0 0 1l1 1a.71.71 0 0 0 1 0L12
          15l1.5 1.5a.71.71 0 0 0 1 0l1-1a.71.71 0 0 0
          0-1L14 13l1.5-1.5a.71.71 0 0 0 0-1z"/>
        </svg>
      `;
      break;
    default:
      // Varsayılan uyarı simgesi
      break;
  }
  
  // Özel ikon oluşturalım
  return L.divIcon({
    html: svgIcon,
    className: '',
    iconSize,
    iconAnchor,
    popupAnchor,
  });
};

// Ana MapComponent bileşeni
const LeafletMapComponent: React.FC<MapComponentProps> = ({ emergencyAlerts = [], adminMode = false }) => {
  // Benzersiz ID oluştur - her instance için tamamen benzersiz bir ID
  const mapContainerId = useId();
  const mapId = `leaflet-map-${mapContainerId}-${Date.now()}`;
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Harita başlatma durumu
  const [isMapReady, setIsMapReady] = useState(false);
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  const [mapKey, setMapKey] = useState(`map-${Date.now()}`);
  
  // Harita komponentini mount/unmount işlemi
  useEffect(() => {
    console.log(`LeafletMapComponent yükleniyor, ID: ${mapId}`);
    
    // Unmount işlemi için temizleme fonksiyonu
    return () => {
      console.log(`LeafletMapComponent kaldırılıyor, ID: ${mapId}`);
      
      // Harita varsa ve hala DOM'a bağlıysa kaldır
      if (mapInstance && mapInstance.remove) {
        try {
          console.log("Harita remove() çağrılıyor");
          mapInstance.remove();
        } catch (e) {
          console.error("Harita kaldırma hatası:", e);
        }
      }
      
      // DOM elemanını temizle
      if (containerRef.current) {
        console.log("Container DOM temizleniyor");
        containerRef.current.innerHTML = '';
      }
      
      // Global context'te bu haritayla ilgili olabilecek şeyleri temizle
      if (typeof window !== 'undefined') {
        // Leaflet tarafından eklenen global DOM elementlerini temizle
        const leafletContainers = document.querySelectorAll(`.leaflet-container`);
        leafletContainers.forEach(container => {
          if (container.id === mapId) {
            container.remove();
          }
        });
      }
    };
  }, [mapId]);

  // Map ready event handler
  const handleMapReady = (map: L.Map) => {
    console.log("Harita hazır");
    setIsMapReady(true);
    setMapInstance(map);
  };

  const mapRef = useRef<L.Map | null>(null);
  
  useEffect(() => {
    if (mapRef.current) {
      handleMapReady(mapRef.current);
    }
  }, [mapRef.current]);

  return (
    <div id={mapId} ref={containerRef} style={{ height: '100%', width: '100%' }} className="map-container">
      <MapContainer
        key={mapKey}
        center={[39.9334, 32.8597]} // Türkiye merkezi
        zoom={6}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        ref={mapRef}
        whenReady={() => {}}
        attributionControl={true}
      >
        <ZoomControl position="bottomright" />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Harita Sağlayıcı Kontrol Bileşeni */}
        <MapProviderController adminMode={adminMode} />
        
        {/* Acil durum uyarıları için işaretçiler */}
        {emergencyAlerts.map(alert => (
          <Marker 
            key={`marker-${alert.id}-${mapKey}`}
            position={[alert.location[0], alert.location[1]]} 
            icon={getAlertIcon(alert.type, alert.severity)}
          >
            <Popup>
              <div className="p-1">
                <h3 className="font-bold text-lg mb-1">{alert.title}</h3>
                <p className="mb-1">
                  <span className={`px-2 py-1 rounded text-white text-xs ${
                    alert.severity === 'high' ? 'bg-red-500' : 
                    alert.severity === 'medium' ? 'bg-orange-500' : 'bg-green-500'
                  }`}>
                    {alert.severity === 'high' ? 'Yüksek Öncelik' : 
                     alert.severity === 'medium' ? 'Orta Öncelik' : 'Düşük Öncelik'}
                  </span>
                </p>
                <p className="text-sm">
                  <strong>Tip:</strong> {alert.type === 'earthquake' ? 'Deprem' : 
                                          alert.type === 'flood' ? 'Sel' : 
                                          alert.type === 'fire' ? 'Yangın' : 
                                          alert.type === 'accident' ? 'Kaza' : alert.type}
                </p>
                <p className="text-sm">
                  <strong>Konum:</strong> {alert.location[0].toFixed(4)}, {alert.location[1].toFixed(4)}
                </p>
                <div className="mt-2 flex justify-between">
                  <Button size="small" type="primary">Detaylar</Button>
                  <Button size="small">Görevli Ata</Button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default LeafletMapComponent; 