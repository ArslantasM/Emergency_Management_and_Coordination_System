"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button, message, Space, Switch, Tooltip, Drawer, Divider, Form, Input, Select, Radio } from 'antd';
import { 
  EnvironmentOutlined, 
  AimOutlined, 
  ScissorOutlined,
  DeleteOutlined, 
  SaveOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined
} from '@ant-design/icons';
import { EmergencyAlert } from '../MapWidget';

// Leaflet icon için varsayılan yolu ayarlama
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// OpenStreetMapProvider bileşeni özellikleri
interface OpenStreetMapProviderProps {
  emergencyAlerts?: EmergencyAlert[];
  adminMode?: boolean;
  enable3D?: boolean;
  enableDrawing?: boolean;
  offlineMode?: boolean;
  cachedTiles?: {[key: string]: boolean};
}

// Çizim modu seçenekleri
type DrawingMode = 'none' | 'marker' | 'polyline' | 'polygon' | 'rectangle' | 'circle' | 'eraser';

// Farklı acil durum tipleri için simge oluşturma
const getAlertIcon = (type: string, severity: string) => {
  // Varsayılan simge boyutları
  const iconSize: [number, number] = [32, 32];
  const iconAnchor: [number, number] = [16, 32];
  const popupAnchor: [number, number] = [0, -32];
  
  // Önem derecesine göre renk
  let iconColor = '#1890ff'; // varsayılan mavi
  
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
  
  // Tip için SVG oluşturma
  let svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${iconColor}" width="32" height="32">
      <path d="M12 2L1 21h22L12 2zm0 3.516L20.297 19h-16.59L12 5.516zM11 10h2v5h-2v-5zm0 6h2v2h-2v-2z"/>
    </svg>
  `;
  
  // Farklı olay tipleri için farklı simgeler
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
    default:
      svgIcon = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${iconColor}" width="32" height="32">
          <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8zm4-9h-3V8a1 1 0 0 0-2 0v3H8a1 1 0 0 0 0 2h3v3a1 1 0 0 0 2 0v-3h3a1 1 0 0 0 0-2z"/>
        </svg>
      `;
      break;
  }
  
  // L.divIcon ile özel bir simge oluşturma
  return L.divIcon({
    html: svgIcon,
    className: '',
    iconSize,
    iconAnchor,
    popupAnchor,
  });
};

// Tam ekran durumunu izleyen bileşen
const FullscreenControl = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Tam ekran değişimlerini izleme
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  // Tam ekran modunu açma/kapama
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        message.error(`Tam ekran modu açılamadı: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };
  
  return (
    <Button 
      icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
      onClick={toggleFullscreen}
      title={isFullscreen ? "Tam ekrandan çık" : "Tam ekran"}
    />
  );
};

// Konum kontrolü
const LocationControl = () => {
  const map = useMap();
  
  const handleLocationClick = () => {
    map.locate({
      setView: true,
      maxZoom: 16
    });
    
    message.info('Konum belirleniyor...');
  };
  
  return (
    <Button 
      icon={<AimOutlined />} 
      onClick={handleLocationClick}
      title="Konumumu bul"
    />
  );
};

// Ölçüm bilgisi için interface
interface MeasurementInfo {
  area?: number;
  distance?: number;
}

// OpenStreetMapProvider bileşeni
const OpenStreetMapProvider: React.FC<OpenStreetMapProviderProps> = ({
  emergencyAlerts = [],
  adminMode = false,
  enable3D = true,
  enableDrawing = true,
  offlineMode = false,
  cachedTiles = {}
}) => {
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  const [drawingMode, setDrawingMode] = useState<DrawingMode>('none');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [measurementInfo, setMeasurementInfo] = useState<MeasurementInfo>({});
  const [isEraserMode, setIsEraserMode] = useState(false);
  
  // Drawn items grubu
  const drawnItemsRef = useRef<L.FeatureGroup | null>(null);
  
  // Harita yüklendiğinde
  const handleMapReady = useCallback((map: L.Map) => {
    setMapInstance(map);
    
    // Çizim alanlarını tutacağımız katman
    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);
    drawnItemsRef.current = drawnItems;
    
    // Çizim araçları ekleme
    if (enableDrawing && (L as any).Control.Draw) {
      const drawControl = new (L as any).Control.Draw({
        edit: {
          featureGroup: drawnItems
        },
        draw: {
          circle: true,
          rectangle: true,
          polygon: true,
          polyline: true,
          marker: true
        }
      });
      map.addControl(drawControl);
      
      // Çizim olaylarını dinleme
      map.on((L as any).Draw.Event.CREATED, function (e: any) {
        drawnItems.addLayer(e.layer);
        updateMeasurements();
      });
      
      map.on((L as any).Draw.Event.EDITED, function () {
        updateMeasurements();
      });
      
      map.on((L as any).Draw.Event.DELETED, function () {
        updateMeasurements();
      });
    }
    
  }, [enableDrawing]);
  
  // Ölçümleri güncelleme
  const updateMeasurements = () => {
    if (!drawnItemsRef.current) return;
    
    let totalArea = 0;
    let totalDistance = 0;
    
    drawnItemsRef.current.eachLayer((layer: any) => {
      if (layer instanceof L.Polygon) {
        const latlngs = layer.getLatLngs();
        try {
          // Alan hesaplama - latlngs[0]'ı LatLngLiteral[] olarak dönüştür
          const latLngsArray = Array.isArray(latlngs[0]) ? 
            (latlngs[0] as L.LatLng[]).map(ll => ({ lat: ll.lat, lng: ll.lng })) : 
            [{ lat: (latlngs[0] as L.LatLng).lat, lng: (latlngs[0] as L.LatLng).lng }];
          
          const area = L.GeometryUtil.geodesicArea(latLngsArray);
          totalArea += area;
        } catch (e) {
          console.error('Alan hesaplanamadı:', e);
        }
      } else if (layer instanceof L.Polyline && !(layer instanceof L.Polygon)) {
        try {
          // Mesafe hesaplama
          const distance = layer.getLatLngs().reduce((total: number, latlng: any, i: number, latlngs: any[]) => {
            if (i === 0) return 0;
            return total + latlngs[i - 1].distanceTo(latlng);
          }, 0);
          totalDistance += distance;
        } catch (e) {
          console.error('Mesafe hesaplanamadı:', e);
        }
      }
    });
    
    setMeasurementInfo({
      area: totalArea > 0 ? totalArea : undefined,
      distance: totalDistance > 0 ? totalDistance : undefined
    });
  };
  
  // Silgili moduna geçme
  const toggleEraserMode = () => {
    setIsEraserMode(!isEraserMode);
    
    if (mapInstance && drawnItemsRef.current) {
      if (!isEraserMode) {
        // Silgi modu aktif
        drawnItemsRef.current.eachLayer((layer: any) => {
          layer.on('click', (e: L.LeafletMouseEvent) => {
            if (isEraserMode) {
              drawnItemsRef.current?.removeLayer(layer);
              updateMeasurements();
              e.originalEvent.stopPropagation();
            }
          });
        });
        message.info('Silgi modu aktif. Silmek için çizim öğelerine tıklayın.');
      } else {
        // Silgi modunu kapat
        drawnItemsRef.current.eachLayer((layer: any) => {
          layer.off('click');
        });
        message.info('Silgi modu kapatıldı.');
      }
    }
  };
  
  // Sayfa yüklendiğinde
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Çizim araçlarını ekleme
      if (enableDrawing && !window.L.Control.Draw) {
        import('leaflet-draw').then(() => {
          console.log('Leaflet Draw eklentisi yüklendi');
          // Harita yüklendiğinde çizim kontrolünü eklemek için haritayı yeniden ayarlayacağız
          if (mapInstance) {
            handleMapReady(mapInstance);
          }
        });
      }
    }
    
    return () => {
      // Temizlik işlemleri
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, [enableDrawing, mapInstance, handleMapReady]);
  
  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      <MapContainer
        center={[39.9334, 32.8597]} // Türkiye merkezi
        zoom={6}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        whenReady={() => {
          if (mapInstance) {
            handleMapReady(mapInstance);
          }
        }}
      >
        <ZoomControl position="bottomright" />
        
        {/* OpenStreetMap katmanı */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={offlineMode ? 
            // Çevrimdışı kullanım için yerel cache
            `${window.location.origin}/api/map-tiles/osm/{z}/{x}/{y}` :
            // Çevrimiçi kullanım için OSM
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          }
        />
        
        {/* Acil durum işaretçileri */}
        {emergencyAlerts.map(alert => (
          <Marker 
            key={`marker-${alert.id}`}
            position={[alert.location[0], alert.location[1]]} 
            icon={getAlertIcon(alert.type, alert.severity)}
          >
            <Popup>
              <div>
                <h3 style={{ fontWeight: 'bold', marginBottom: '8px' }}>{alert.title}</h3>
                <p>
                  <span style={{ 
                    padding: '2px 6px', 
                    borderRadius: '4px', 
                    backgroundColor: 
                      alert.severity === 'high' ? '#f5222d' : 
                      alert.severity === 'medium' ? '#faad14' : '#52c41a',
                    color: 'white',
                    fontSize: '12px',
                    marginRight: '4px'
                  }}>
                    {alert.severity === 'high' ? 'Yüksek Öncelik' : 
                     alert.severity === 'medium' ? 'Orta Öncelik' : 'Düşük Öncelik'}
                  </span>
                </p>
                <p>
                  <strong>Tip:</strong> {alert.type === 'earthquake' ? 'Deprem' : 
                                      alert.type === 'flood' ? 'Sel' : 
                                      alert.type === 'fire' ? 'Yangın' : 
                                      alert.type === 'accident' ? 'Kaza' : alert.type}
                </p>
                <p><strong>Tarih:</strong> {new Date(alert.createdAt).toLocaleString('tr-TR')}</p>
                <p><strong>Bildiren:</strong> {alert.createdBy}</p>
                <div style={{ marginTop: '8px' }}>
                  <Button type="primary" size="small">Detaylar</Button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* Çizim araçları paneli - Tam ekran modunda da görünür kalacak şekilde sağ üst köşede */}
        <div className="leaflet-control leaflet-bar" style={{ 
          position: 'absolute', 
          top: '10px', 
          right: '10px', 
          zIndex: 1000,
          background: 'white',
          padding: '8px',
          borderRadius: '4px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
        }}>
          <Space direction="vertical" size="small">
            <FullscreenControl />
            <LocationControl />
            
            {/* Çizim silme */}
            <Button 
              type={isEraserMode ? "primary" : "default"}
              danger={isEraserMode}
              icon={<ScissorOutlined />} 
              onClick={toggleEraserMode}
              title="Çizimi sil"
            />
          </Space>
        </div>
        
        {/* Ölçüm bilgileri */}
        {(measurementInfo.area !== undefined || measurementInfo.distance !== undefined) && (
          <div style={{ 
            position: 'absolute', 
            bottom: '10px', 
            left: '10px', 
            zIndex: 1000,
            background: 'rgba(255,255,255,0.8)',
            padding: '8px',
            borderRadius: '4px',
            fontSize: '12px'
          }}>
            {measurementInfo.area !== undefined && (
              <div>
                <strong>Alan:</strong> {(measurementInfo.area / 1000000).toFixed(2)} km²
              </div>
            )}
            {measurementInfo.distance !== undefined && (
              <div>
                <strong>Mesafe:</strong> {(measurementInfo.distance / 1000).toFixed(2)} km
              </div>
            )}
          </div>
        )}
      </MapContainer>
    </div>
  );
};

export default OpenStreetMapProvider; 