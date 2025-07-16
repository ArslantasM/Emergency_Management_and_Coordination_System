'use client';

import React, { useEffect, useRef } from 'react';
import { Card, Spin, Alert } from 'antd';
import { type EarthquakeData, type TsunamiData } from '../../services/emergencyApi';

interface SimpleMapProps {
  earthquakes?: EarthquakeData[];
  tsunamis?: TsunamiData[];
  loading?: boolean;
}

const SimpleMap: React.FC<SimpleMapProps> = ({ 
  earthquakes = [], 
  tsunamis = [], 
  loading = false 
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const loadMap = async () => {
      try {
        // Leaflet'i dinamik olarak yükle
        const L = await import('leaflet');
        
        // CSS'i de yükle
        if (typeof window !== 'undefined') {
          require('leaflet/dist/leaflet.css');
        }

        // Mevcut haritayı temizle
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }

        // Kontainer'ı temizle
        if (mapContainerRef.current) {
          mapContainerRef.current.innerHTML = '';
        }

        // Yeni harita oluştur
        mapRef.current = L.map(mapContainerRef.current).setView([39.9334, 32.8597], 6);

        // Tile layer ekle
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(mapRef.current);

        // Default marker iconları düzelt
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        // Deprem işaretlerini ekle
        earthquakes.forEach((earthquake) => {
          const color = getEarthquakeColor(earthquake.magnitude);
          
          L.circleMarker([earthquake.latitude, earthquake.longitude], {
            radius: Math.max(earthquake.magnitude * 2, 4),
            fillColor: color,
            color: color,
            weight: 2,
            opacity: 0.8,
            fillOpacity: 0.6
          })
          .bindPopup(`
            <div style="min-width: 200px;">
              <h4 style="margin: 0 0 8px 0; color: #1890ff;">🌍 Deprem Bilgisi</h4>
              <p style="margin: 4px 0;"><strong>Büyüklük:</strong> ${earthquake.magnitude}</p>
              <p style="margin: 4px 0;"><strong>Derinlik:</strong> ${earthquake.depth} km</p>
              <p style="margin: 4px 0;"><strong>Konum:</strong> ${earthquake.location}</p>
              <p style="margin: 4px 0;"><strong>Tarih:</strong> ${new Date(earthquake.date).toLocaleString('tr-TR')}</p>
              <p style="margin: 4px 0;"><strong>Kaynak:</strong> ${earthquake.source}</p>
              ${earthquake.tsunamiAlert ? '<p style="color: red; font-weight: bold;">⚠️ Tsunami Riski</p>' : ''}
            </div>
          `)
          .addTo(mapRef.current);
        });

        // Tsunami işaretlerini ekle
        tsunamis.forEach((tsunami) => {
          const color = getTsunamiColor(tsunami.status);
          
          L.circleMarker([tsunami.latitude, tsunami.longitude], {
            radius: 12,
            fillColor: color,
            color: color,
            weight: 3,
            opacity: 0.9,
            fillOpacity: 0.7
          })
          .bindPopup(`
            <div style="min-width: 200px;">
              <h4 style="margin: 0 0 8px 0; color: #1890ff;">🌊 Tsunami Uyarısı</h4>
              <p style="margin: 4px 0;"><strong>Durum:</strong> ${tsunami.status.toUpperCase()}</p>
              <p style="margin: 4px 0;"><strong>Şiddet:</strong> ${tsunami.severity}</p>
              <p style="margin: 4px 0;"><strong>Açıklama:</strong> ${tsunami.description}</p>
              <p style="margin: 4px 0;"><strong>Etkilenen Bölgeler:</strong> ${tsunami.affectedAreas.join(', ')}</p>
              <p style="margin: 4px 0;"><strong>Tarih:</strong> ${new Date(tsunami.date).toLocaleString('tr-TR')}</p>
              <p style="margin: 4px 0;"><strong>Kaynak:</strong> ${tsunami.source}</p>
              ${tsunami.expiryDate ? `<p style="margin: 4px 0;"><strong>Bitiş:</strong> ${new Date(tsunami.expiryDate).toLocaleString('tr-TR')}</p>` : ''}
            </div>
          `)
          .addTo(mapRef.current);
        });

      } catch (error) {
        console.error('Harita yüklenirken hata:', error);
      }
    };

    loadMap();

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [earthquakes, tsunamis]);

  // Deprem büyüklüğüne göre renk
  const getEarthquakeColor = (magnitude: number): string => {
    if (magnitude >= 6.0) return '#ff0000'; // Kırmızı
    if (magnitude >= 5.0) return '#ff4500'; // Turuncu
    if (magnitude >= 4.0) return '#ffa500'; // Açık turuncu
    return '#ffff00'; // Sarı
  };

  // Tsunami durumuna göre renk
  const getTsunamiColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'warning':
        return '#ff0000'; // Kırmızı
      case 'watch':
        return '#ff8c00'; // Turuncu
      case 'advisory':
        return '#1890ff'; // Mavi
      default:
        return '#666666'; // Gri
    }
  };

  if (loading) {
    return (
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
    );
  }

  return (
    <div
      ref={mapContainerRef}
      style={{
        height: '500px',
        width: '100%',
        borderRadius: '8px',
        overflow: 'hidden'
      }}
    />
  );
};

export default SimpleMap; 