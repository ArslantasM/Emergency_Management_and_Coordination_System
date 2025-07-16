"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, Spin, Button, message, Space, Switch, Tag } from 'antd';
import {
  EnvironmentOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  ScissorOutlined
} from '@ant-design/icons';
import { EmergencyAlert } from './MapWidget';

// Google Map'in dinamik olarak yüklenmesi için özel bir bileşen
const GoogleMapLoader: React.FC<{
  onLoad: (google: any) => void;
  children: React.ReactNode;
}> = ({ onLoad, children }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.google) {
      // Google Maps API'sini dinamik olarak yükle
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=drawing`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        setLoaded(true);
        if (window.google) {
          onLoad(window.google);
        } else {
          setError('Google Maps API yüklenemedi');
        }
      };
      
      script.onerror = () => {
        setError('Google Maps API yüklenirken hata oluştu');
      };
      
      document.head.appendChild(script);
      
      return () => {
        // Temizlik: script elementini kaldır
        document.head.removeChild(script);
      };
    } else if (window.google) {
      // Google Maps API zaten yüklü
      setLoaded(true);
      onLoad(window.google);
    }
  }, [onLoad]);
  
  if (error) {
    return (
      <div style={{ 
        height: '100%', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        flexDirection: 'column',
        padding: 20 
      }}>
        <h3>Harita Yüklenemedi</h3>
        <p>{error}</p>
        <Button type="primary" onClick={() => window.location.reload()}>
          Yeniden Dene
        </Button>
      </div>
    );
  }
  
  if (!loaded) {
    return (
      <div style={{ 
        height: '100%', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center' 
      }}>
        <Spin tip="Google Harita yükleniyor..." size="large" />
      </div>
    );
  }
  
  return <>{children}</>;
};

// Google Maps bileşeni özellikleri
interface GoogleMapComponentProps {
  emergencyAlerts?: EmergencyAlert[];
  fires?: any[];
  tsunamiAlerts?: any[];
  earthquakes?: any[];
  adminMode?: boolean;
  enable3D?: boolean;
  enableDrawing?: boolean;
  offlineMode?: boolean;
  cachedTiles?: {[key: string]: boolean};
}

// Ölçüm bilgisi için interface
interface MeasurementInfo {
  area?: number;
  distance?: number;
}

// Google Maps bileşeni
const GoogleMapComponent: React.FC<GoogleMapComponentProps> = ({
  emergencyAlerts = [],
  fires = [],
  tsunamiAlerts = [],
  earthquakes = [],
  adminMode = false,
  enable3D = true,
  enableDrawing = true,
  offlineMode = false
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [measurementInfo, setMeasurementInfo] = useState<MeasurementInfo>({});
  const [isEraserMode, setIsEraserMode] = useState(false);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const drawingManagerRef = useRef<google.maps.drawing.DrawingManager | null>(null);
  const shapesRef = useRef<google.maps.MVCObject[]>([]);
  
  // Google Maps API'si yüklendiğinde haritayı başlat
  const handleGoogleLoad = (google: any) => {
    if (mapRef.current && !map) {
      // Harita oluştur
      const mapOptions: google.maps.MapOptions = {
        center: { lat: 39.9334, lng: 32.8597 }, // Türkiye merkezi
        zoom: 6,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        fullscreenControl: false,
        mapTypeControl: true,
        streetViewControl: false
      };
      
      const newMap = new google.maps.Map(mapRef.current, mapOptions);
      setMap(newMap);
      
      // 3D modu etkinleştir
      if (enable3D) {
        newMap.setTilt(45);
      }
      
      // Çizim araçlarını ekle
      if (enableDrawing) {
        const drawingManager = new google.maps.drawing.DrawingManager({
          drawingMode: null,
          drawingControl: true,
          drawingControlOptions: {
            position: google.maps.ControlPosition.TOP_CENTER,
            drawingModes: [
              google.maps.drawing.OverlayType.MARKER,
              google.maps.drawing.OverlayType.CIRCLE,
              google.maps.drawing.OverlayType.POLYGON,
              google.maps.drawing.OverlayType.POLYLINE,
              google.maps.drawing.OverlayType.RECTANGLE,
            ],
          },
          markerOptions: { icon: "https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png" },
          circleOptions: {
            fillColor: "#ffff00",
            fillOpacity: 0.2,
            strokeWeight: 2,
            clickable: true,
            editable: true,
            zIndex: 1,
          },
        });
        
        drawingManager.setMap(newMap);
        drawingManagerRef.current = drawingManager;
        
        // Çizim tamamlandığında
        google.maps.event.addListener(drawingManager, 'overlaycomplete', (event: any) => {
          // Şekli referans listesine ekle
          shapesRef.current.push(event.overlay);
          
          // Çizim modunu kapat
          drawingManager.setDrawingMode(null);
          
          // Silgi modu için olay dinleyicisi ekle
          if (event.overlay) {
            google.maps.event.addListener(event.overlay, 'click', function() {
              if (isEraserMode) {
                event.overlay.setMap(null);
                // Referans listesinden kaldır
                shapesRef.current = shapesRef.current.filter(shape => shape !== event.overlay);
                updateMeasurements();
              }
            });
          }
          
          // Ölçümleri güncelle
          updateMeasurements();
        });
      }
      
      // Acil durum işaretçilerini ekle
      addEmergencyMarkers(newMap);
    }
  };
  
  // Acil durum işaretçilerini haritaya ekle
  const addEmergencyMarkers = (map: google.maps.Map) => {
    // Önce eski işaretçileri temizle
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
    
    // Yangın verilerini ekle
    fires.forEach(fire => {
      const marker = new google.maps.Marker({
        position: { lat: fire.latitude, lng: fire.longitude },
        map: map,
        title: `Yangın - ${fire.location || 'Bilinmeyen'}`,
        icon: {
          url: getFireIconUrl(fire.frp || 0),
          scaledSize: new google.maps.Size(24, 24),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(12, 12)
        }
      });
      
      const infoContent = `
        <div style="padding: 10px; max-width: 300px;">
          <h3 style="margin-top: 0; margin-bottom: 8px; color: #d4380d;">🔥 Yangın Tespit</h3>
          <p><strong>Konum:</strong> ${fire.location || 'Bilinmeyen'}</p>
          <p><strong>Parlaklık:</strong> ${fire.brightness || 'N/A'}K</p>
          <p><strong>Güven:</strong> ${fire.confidence || 'N/A'}%</p>
          <p><strong>FRP:</strong> ${fire.frp || 'N/A'} MW</p>
          <p><strong>Uydu:</strong> ${fire.satellite || 'N/A'}</p>
          <p><strong>Tarih:</strong> ${new Date(fire.date).toLocaleString('tr-TR')}</p>
        </div>
      `;
      
      const infoWindow = new google.maps.InfoWindow({ content: infoContent });
      marker.addListener('click', () => infoWindow.open(map, marker));
      markersRef.current.push(marker);
    });
    
    // Tsunami uyarılarını ekle
    tsunamiAlerts.forEach(tsunami => {
      const marker = new google.maps.Marker({
        position: { lat: tsunami.latitude, lng: tsunami.longitude },
        map: map,
        title: `Tsunami Uyarısı - ${tsunami.location || 'Bilinmeyen'}`,
        icon: {
          url: getTsunamiIconUrl(tsunami.alert_level),
          scaledSize: new google.maps.Size(32, 32),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(16, 16)
        }
      });
      
      const infoContent = `
        <div style="padding: 10px; max-width: 300px;">
          <h3 style="margin-top: 0; margin-bottom: 8px; color: #1890ff;">🌊 Tsunami Uyarısı</h3>
          <p><strong>Seviye:</strong> <span style="color: ${
            tsunami.alert_level === 'Warning' ? '#f5222d' : 
            tsunami.alert_level === 'Watch' ? '#faad14' : '#52c41a'
          }; font-weight: bold;">${tsunami.alert_level}</span></p>
          <p><strong>Durum:</strong> ${tsunami.status}</p>
          <p><strong>Konum:</strong> ${tsunami.location || 'Bilinmeyen'}</p>
          <p><strong>Büyüklük:</strong> ${tsunami.magnitude || 'N/A'}</p>
          <p><strong>Derinlik:</strong> ${tsunami.depth || 'N/A'} km</p>
          <p><strong>Etkilenen Bölgeler:</strong> ${tsunami.affected_regions || 'N/A'}</p>
          <p><strong>Tarih:</strong> ${new Date(tsunami.date).toLocaleString('tr-TR')}</p>
        </div>
      `;
      
      const infoWindow = new google.maps.InfoWindow({ content: infoContent });
      marker.addListener('click', () => infoWindow.open(map, marker));
      markersRef.current.push(marker);
    });
    
    // Deprem verilerini ekle
    earthquakes.forEach(earthquake => {
      const marker = new google.maps.Marker({
        position: { lat: earthquake.latitude, lng: earthquake.longitude },
        map: map,
        title: `Deprem - ${earthquake.location || 'Bilinmeyen'}`,
        icon: {
          url: getEarthquakeIconUrl(earthquake.magnitude || 0),
          scaledSize: new google.maps.Size(28, 28),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(14, 14)
        }
      });
      
      const infoContent = `
        <div style="padding: 10px; max-width: 300px;">
          <h3 style="margin-top: 0; margin-bottom: 8px; color: #722ed1;">⚡ Deprem</h3>
          <p><strong>Büyüklük:</strong> ${earthquake.magnitude || 'N/A'}</p>
          <p><strong>Derinlik:</strong> ${earthquake.depth || 'N/A'} km</p>
          <p><strong>Konum:</strong> ${earthquake.location || 'Bilinmeyen'}</p>
          <p><strong>Kaynak:</strong> ${earthquake.source || 'N/A'}</p>
          <p><strong>Tarih:</strong> ${new Date(earthquake.date).toLocaleString('tr-TR')}</p>
        </div>
      `;
      
      const infoWindow = new google.maps.InfoWindow({ content: infoContent });
      marker.addListener('click', () => infoWindow.open(map, marker));
      markersRef.current.push(marker);
    });
    
    // Her acil durum için bir işaretçi ekle
    emergencyAlerts.forEach(alert => {
      // İşaretçi simgesini belirle
      let icon = {
        url: getAlertIconUrl(alert.type, alert.severity),
        scaledSize: new google.maps.Size(32, 32),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(16, 32)
      };
      
      // İşaretçi oluştur
      const marker = new google.maps.Marker({
        position: { lat: alert.location[0], lng: alert.location[1] },
        map: map,
        title: alert.title,
        icon: icon
      });
      
      // Bilgi penceresi içeriği
      const infoContent = `
        <div style="padding: 10px; max-width: 300px;">
          <h3 style="margin-top: 0; margin-bottom: 8px; color: #1a1a1a;">${alert.title}</h3>
          <p style="margin-bottom: 5px;">
            <span style="
              padding: 2px 6px;
              border-radius: 3px;
              font-size: 12px;
              font-weight: bold;
              background-color: ${
                alert.severity === 'high' ? '#f5222d' : 
                alert.severity === 'medium' ? '#faad14' : '#52c41a'
              };
              color: white;
            ">
              ${
                alert.severity === 'high' ? 'Yüksek Öncelik' : 
                alert.severity === 'medium' ? 'Orta Öncelik' : 'Düşük Öncelik'
              }
            </span>
          </p>
          <p style="margin-bottom: 5px;"><strong>Tip:</strong> ${
            alert.type === 'earthquake' ? 'Deprem' : 
            alert.type === 'flood' ? 'Sel' : 
            alert.type === 'fire' ? 'Yangın' : 
            alert.type === 'accident' ? 'Kaza' : alert.type
          }</p>
          <p style="margin-bottom: 5px;"><strong>Tarih:</strong> ${new Date(alert.createdAt).toLocaleString('tr-TR')}</p>
          <p style="margin-bottom: 8px;"><strong>Bildiren:</strong> ${alert.createdBy}</p>
          <div>
            <button style="
              background-color: #1890ff;
              color: white;
              border: none;
              padding: 4px 8px;
              border-radius: 2px;
              cursor: pointer;
              font-size: 12px;
            ">Detaylar</button>
          </div>
        </div>
      `;
      
      // Bilgi penceresi oluştur
      const infoWindow = new google.maps.InfoWindow({
        content: infoContent
      });
      
      // İşaretçiye tıklandığında bilgi penceresini göster
      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });
      
      // İşaretçiyi listeye ekle
      markersRef.current.push(marker);
    });
  };
  
  // Acil durum tipi ve önceliğine göre icon URL'i
  const getAlertIconUrl = (type: string, severity: string): string => {
    // Gerçek uygulamada firebase storage ya da CDN'den yüklenebilir
    // Şimdilik statik URL'ler kullanacağız
    let iconBaseUrl = '/icons/';
    
    switch (type) {
      case 'earthquake':
        return iconBaseUrl + 'earthquake_' + severity + '.svg';
      case 'flood':
        return iconBaseUrl + 'flood_' + severity + '.svg';
      case 'fire':
        return iconBaseUrl + 'fire_' + severity + '.svg';
      case 'accident':
        return iconBaseUrl + 'accident_' + severity + '.svg';
      default:
        return iconBaseUrl + 'alert_' + severity + '.svg';
    }
  };
  
  // Yangın icon URL'i (FRP değerine göre)
  const getFireIconUrl = (frp: number): string => {
    if (frp > 100) {
      return 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'; // Yüksek yoğunluk
    } else if (frp > 50) {
      return 'https://maps.google.com/mapfiles/ms/icons/orange-dot.png'; // Orta yoğunluk
    } else {
      return 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png'; // Düşük yoğunluk
    }
  };

  // Tsunami icon URL'i (uyarı seviyesine göre)
  const getTsunamiIconUrl = (alertLevel: string): string => {
    switch (alertLevel) {
      case 'Warning':
        return 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png';
      case 'Watch':
        return 'https://maps.google.com/mapfiles/ms/icons/ltblue-dot.png';
      default:
        return 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png';
    }
  };

  // Deprem icon URL'i (büyüklüğe göre)
  const getEarthquakeIconUrl = (magnitude: number): string => {
    if (magnitude >= 7) {
      return 'https://maps.google.com/mapfiles/ms/icons/purple-dot.png'; // Büyük deprem
    } else if (magnitude >= 5) {
      return 'https://maps.google.com/mapfiles/ms/icons/pink-dot.png'; // Orta deprem
    } else {
      return 'https://maps.google.com/mapfiles/ms/icons/purple-dot.png'; // Küçük deprem
    }
  };
  
  // Ölçümleri güncelleme
  const updateMeasurements = () => {
    let totalArea = 0;
    let totalDistance = 0;
    
    shapesRef.current.forEach(shape => {
      if (shape instanceof google.maps.Polygon) {
        // Alan hesaplama
        totalArea += google.maps.geometry.spherical.computeArea(shape.getPath());
      } else if (shape instanceof google.maps.Polyline) {
        // Mesafe hesaplama
        totalDistance += google.maps.geometry.spherical.computeLength(shape.getPath());
      } else if (shape instanceof google.maps.Circle) {
        // Daire alanı
        totalArea += Math.PI * Math.pow(shape.getRadius(), 2);
      } else if (shape instanceof google.maps.Rectangle) {
        // Dikdörtgen alanı - getBounds() kullanılarak
        const bounds = shape.getBounds();
        if (bounds) {
          const ne = bounds.getNorthEast();
          const sw = bounds.getSouthWest();
          // Dikdörtgenin köşeleri arasında hayali bir poligon oluşturma
          const path = [
            { lat: ne.lat(), lng: ne.lng() },
            { lat: ne.lat(), lng: sw.lng() },
            { lat: sw.lat(), lng: sw.lng() },
            { lat: sw.lat(), lng: ne.lng() },
          ];
          totalArea += google.maps.geometry.spherical.computeArea(path);
        }
      }
    });
    
    setMeasurementInfo({
      area: totalArea > 0 ? totalArea : undefined,
      distance: totalDistance > 0 ? totalDistance : undefined
    });
  };
  
  // Tam ekran değişikliklerini izleme
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
      const mapElement = mapRef.current;
      if (mapElement?.requestFullscreen) {
        mapElement.requestFullscreen().catch(err => {
          message.error(`Tam ekran modu açılamadı: ${err.message}`);
        });
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };
  
  // Silgi modunu aç/kapat
  const toggleEraserMode = () => {
    setIsEraserMode(!isEraserMode);
    
    if (!isEraserMode) {
      message.info('Silgi modu aktif. Silmek için çizim öğelerine tıklayın.');
    } else {
      message.info('Silgi modu kapatıldı.');
    }
  };
  
  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      <GoogleMapLoader onLoad={handleGoogleLoad}>
        {/* Harita konteynerı */}
        <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
        
        {/* Kontrol paneli */}
        <div style={{ 
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 10,
          backgroundColor: 'white',
          padding: '8px',
          borderRadius: '4px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
        }}>
          <Space direction="vertical" size="small">
            {/* Tam ekran butonu */}
            <Button 
              icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />} 
              onClick={toggleFullscreen}
              title={isFullscreen ? "Tam ekrandan çık" : "Tam ekran"}
            />
            
            {/* Silgi butonu */}
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
            zIndex: 10,
            backgroundColor: 'rgba(255,255,255,0.8)',
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
      </GoogleMapLoader>
    </div>
  );
};

export default GoogleMapComponent; 