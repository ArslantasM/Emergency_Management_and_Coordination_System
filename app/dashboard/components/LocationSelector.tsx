"use client";

import React, { useRef, useEffect, useState } from "react";
import { Button, Space, Typography, Alert, Card, Tag } from "antd";
import { CheckOutlined, CloseOutlined, ReloadOutlined, DeleteOutlined, UndoOutlined, EditOutlined } from "@ant-design/icons";

const { Text } = Typography;

interface LocationSelectorProps {
  onLocationSelect: (bounds: any) => void;
  onCancel: () => void;
  initialCenter?: [number, number];
  initialZoom?: number;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  onLocationSelect,
  onCancel,
  initialCenter = [39.9334, 32.8597],
  initialZoom = 6
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPoints, setSelectedPoints] = useState<[number, number][]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [markers, setMarkers] = useState<any[]>([]);
  const [polygon, setPolygon] = useState<any>(null);

  // Leaflet yükleme
  useEffect(() => {
    const loadLeaflet = async () => {
      try {
        if ((window as any).L) {
          setIsLoading(false);
          return;
        }

        const css = document.createElement('link');
        css.rel = 'stylesheet';
        css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(css);

        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        
        script.onload = () => {
          const L = (window as any).L;
          if (L) {
            L.Icon.Default.mergeOptions({
              iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
              iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
              shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
            });
          }
          setIsLoading(false);
        };
        
        document.head.appendChild(script);
      } catch (err) {
        setError('Harita yüklenemedi');
        setIsLoading(false);
      }
    };

    loadLeaflet();
  }, []);

  // Harita oluştur
  useEffect(() => {
    if (isLoading || !mapRef.current || mapInstanceRef.current) return;

    const L = (window as any).L;
    if (!L) return;

    try {
      console.log(' Harita oluşturuluyor...');
      const map = L.map(mapRef.current, {
        center: initialCenter,
        zoom: initialZoom,
        zoomControl: true
      });

      L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
        attribution: ' Google',
        maxZoom: 18
      }).addTo(map);

      mapInstanceRef.current = map;
      console.log(' Harita oluşturuldu');
    } catch (err) {
      console.error(' Harita hatası:', err);
      setError('Harita oluşturulamadı');
    }
  }, [isLoading]);

  // Çizim event'leri
  useEffect(() => {
    if (!mapInstanceRef.current || !isDrawing) {
      console.log(' Event handler atlanıyor - Harita:', !!mapInstanceRef.current, 'Çizim:', isDrawing);
      return;
    }

    const map = mapInstanceRef.current;
    const L = (window as any).L;

    console.log(' Click event handler ekleniyor...');
    const handleClick = (e) => {
      console.log(' Harita tıklandı:', e.latlng);
      addPoint([e.latlng.lat, e.latlng.lng]);
    };

    map.on('click', handleClick);

    return () => {
      console.log(' Click event handler temizleniyor');
      map.off('click', handleClick);
    };
  }, [isDrawing, selectedPoints.length]);

  const addPoint = (point: [number, number]) => {
    const L = (window as any).L;
    if (!L || !mapInstanceRef.current) return;

    console.log(' Nokta ekleniyor:', point);
    const newPoints = [...selectedPoints, point];
    setSelectedPoints(newPoints);

    // Marker ekle
    const marker = L.circleMarker(point, {
      radius: 8,
      fillColor: '#1890ff',
      color: 'white',
      weight: 2,
      fillOpacity: 0.8
    }).addTo(mapInstanceRef.current);

    setMarkers(prev => [...prev, marker]);

    // Polygon oluştur
    if (newPoints.length >= 3) {
      if (polygon) {
        mapInstanceRef.current.removeLayer(polygon);
      }
      
      const newPolygon = L.polygon(newPoints, {
        color: '#52c41a',
        weight: 2,
        fillOpacity: 0.2
      }).addTo(mapInstanceRef.current);
      
      setPolygon(newPolygon);
      console.log(' Polygon oluşturuldu, nokta sayısı:', newPoints.length);
    }
  };

  const startDrawing = () => {
    console.log(' Çizim başlatılıyor...');
    clearPoints();
    setIsDrawing(true);
    console.log(' Çizim modu aktif edildi, isDrawing:', true);
  };

  const clearPoints = () => {
    console.log(' Noktalar temizleniyor');
    setSelectedPoints([]);
    
    markers.forEach(marker => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(marker);
      }
    });
    setMarkers([]);
    
    if (polygon && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(polygon);
      setPolygon(null);
    }
  };

  const clearAll = () => {
    console.log(' Tüm çizim temizleniyor');
    clearPoints();
    setIsDrawing(false);
    console.log(' Çizim modu kapatıldı');
  };

  const confirmSelection = () => {
    if (selectedPoints.length < 3) {
      setError('En az 3 nokta seçin');
      return;
    }

    const lats = selectedPoints.map(p => p[0]);
    const lngs = selectedPoints.map(p => p[1]);
    
    onLocationSelect({
      north: Math.max(...lats),
      south: Math.min(...lats),
      east: Math.max(...lngs),
      west: Math.min(...lngs),
      center: [
        (Math.max(...lats) + Math.min(...lats)) / 2,
        (Math.max(...lngs) + Math.min(...lngs)) / 2
      ],
      area: 1.0,
      polygon: selectedPoints
    });
  };

  if (error) {
    return (
      <Alert message="Hata" description={error} type="error" showIcon />
    );
  }

  return (
    <div style={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
      <Card size="small" style={{ marginBottom: '8px' }}>
        <Space>
          <Button
            type={isDrawing ? 'primary' : 'default'}
            icon={<EditOutlined />}
            onClick={() => {
              console.log(' Polygon Çiz butonuna tıklandı, mevcut isDrawing:', isDrawing);
              startDrawing();
            }}
          >
            {isDrawing ? 'Çizim Aktif ' : 'Polygon Çiz '}
          </Button>
          
          {selectedPoints.length > 0 && (
            <>
              <Tag color="blue">{selectedPoints.length} Nokta</Tag>
              <Button icon={<DeleteOutlined />} onClick={clearAll} size="small" danger>
                Temizle
              </Button>
            </>
          )}
          
          {selectedPoints.length >= 3 && (
            <Button 
              type="primary" 
              icon={<CheckOutlined />}
              onClick={confirmSelection}
              style={{ background: '#52c41a' }}
            >
              Onayla
            </Button>
          )}
          
          <Button icon={<CloseOutlined />} onClick={onCancel}>
            İptal
          </Button>
        </Space>
      </Card>

      <div style={{ flex: 1, position: 'relative' }}>
        {isLoading && (
          <div style={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)',
            zIndex: 1000 
          }}>
            <Space>
              <ReloadOutlined spin />
              <Text>Harita yükleniyor...</Text>
            </Space>
          </div>
        )}
        
        <div 
          ref={mapRef} 
          style={{ 
            width: '100%', 
            height: '100%',
            cursor: isDrawing ? 'crosshair' : 'default'
          }} 
        />
      </div>
    </div>
  );
};

export default LocationSelector;
