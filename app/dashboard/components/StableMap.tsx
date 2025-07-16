"use client";

import React, { useRef, useEffect, useState } from "react";
import { Spin, Alert } from "antd";

interface MarkerData {
  id: string;
  lat: number;
  lng: number;
  type: "earthquake" | "fire" | "tsunami" | "incident";
  title: string;
  description: string;
  color: string;
  magnitude?: number;
  data?: any;
}

interface StableMapProps {
  markers?: MarkerData[];
  center?: [number, number];
  zoom?: number;
  height?: string;
}

const StableMap: React.FC<StableMapProps> = ({ 
  markers = [], 
  center = [39.9334, 32.8597],
  zoom = 6,
  height = "350px"
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  // Leaflet yükleme - sadece bir kez
  useEffect(() => {
    let mounted = true;

    const loadLeaflet = async () => {
      try {
        if (!(window as any).L) {
          // CSS yükle
          if (!document.getElementById('leaflet-css')) {
            const css = document.createElement('link');
            css.id = 'leaflet-css';
            css.rel = 'stylesheet';
            css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(css);
          }

          // JS yükle
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          
          await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }

        if (mounted) {
          setLeafletLoaded(true);
        }
      } catch (err) {
        console.error('Leaflet yükleme hatası:', err);
        if (mounted) {
          setError('Harita kütüphanesi yüklenemedi');
          setIsLoading(false);
        }
      }
    };

    loadLeaflet();

    return () => {
      mounted = false;
    };
  }, []);

  // Harita initialize - sadece bir kez
  useEffect(() => {
    if (!leafletLoaded || !mapRef.current || mapInstanceRef.current) return;

    const L = (window as any).L;

    try {
      console.log('StableMap: Harita oluşturuluyor...');
      
      const map = L.map(mapRef.current).setView(center, zoom);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      mapInstanceRef.current = map;
      setIsLoading(false);
      
      console.log('StableMap: Harita başarıyla oluşturuldu');
    } catch (err) {
      console.error('StableMap: Harita oluşturma hatası:', err);
      setError('Harita oluşturulamadı');
      setIsLoading(false);
    }
  }, [leafletLoaded, center, zoom]);

  // Markerları güncelle
  useEffect(() => {
    if (!mapInstanceRef.current || !(window as any).L) return;

    const L = (window as any).L;
    const map = mapInstanceRef.current;

    // Eski markerları temizle
    markersRef.current.forEach(marker => {
      try {
        map.removeLayer(marker);
      } catch (e) {
        // Marker zaten kaldırılmış olabilir
      }
    });
    markersRef.current = [];

    // Yeni markerları ekle
    markers.forEach(markerData => {
      try {
        const { lat, lng, title, description, magnitude, type } = markerData;
        
        // Emoji belirleme
        let emoji = '📍';
        if (type === 'earthquake') {
          emoji = '🌍';
        } else if (type === 'fire') {
          emoji = '🔥';
        } else if (type === 'tsunami') {
          emoji = '🌊';
        }

        // Boyut belirleme
        let size = 24;
        if (magnitude) {
          size = Math.max(20, Math.min(40, magnitude * 6));
        } else if (type === 'fire') {
          size = 28;
        } else if (type === 'tsunami') {
          size = 32;
        }

        // Emoji marker oluştur
        const emojiIcon = L.divIcon({
          html: `<div style="
            font-size: ${size}px;
            text-align: center;
            line-height: 1;
            filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.5));
            animation: ${type === 'earthquake' ? 'pulse 2s infinite' : 'none'};
          ">${emoji}</div>`,
          className: 'emoji-marker',
          iconSize: [size, size],
          iconAnchor: [size/2, size/2],
          popupAnchor: [0, -size/2]
        });

        const marker = L.marker([lat, lng], {
          icon: emojiIcon
        });

        const popupContent = `
          <div style="font-family: Arial, sans-serif; max-width: 200px;">
            <h4 style="margin: 0 0 8px 0; color: #333; font-size: 14px;">${emoji} ${title}</h4>
            <p style="margin: 0; color: #666; font-size: 12px;">${description}</p>
            ${magnitude ? `<p style="margin: 4px 0 0 0; font-weight: bold; color: #ff4d4f; font-size: 12px;">Büyüklük: ${magnitude}</p>` : ''}
            ${type === 'fire' && markerData.data?.confidence ? `<p style="margin: 4px 0 0 0; color: #666; font-size: 12px;">Güven: %${markerData.data.confidence}</p>` : ''}
          </div>
        `;
        
        marker.bindPopup(popupContent);
        marker.addTo(map);
        markersRef.current.push(marker);
      } catch (err) {
        console.warn('Marker eklenirken hata:', err);
      }
    });

    console.log(`StableMap: ${markers.length} marker eklendi`);
  }, [markers]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        } catch (e) {
          console.warn('Harita cleanup hatası:', e);
        }
      }
    };
  }, []);

  if (error) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Alert
          message="Harita Hatası"
          description={error}
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', height }}>
      {isLoading && (
        <div style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          zIndex: 1000 
        }}>
          <Spin size="large" />
        </div>
      )}
      <div 
        ref={mapRef} 
        style={{ 
          width: '100%', 
          height: '100%',
          borderRadius: '8px',
          overflow: 'hidden'
        }} 
      />
    </div>
  );
};

export default StableMap; 