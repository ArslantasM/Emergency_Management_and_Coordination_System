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

interface SimpleMapProps {
  markers?: MarkerData[];
  center?: [number, number];
  zoom?: number;
  height?: string;
}

const SimpleMap: React.FC<SimpleMapProps> = ({ 
  markers = [], 
  center = [39.9334, 32.8597], // Ankara merkez
  zoom = 6,
  height = "350px"
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [mapId] = useState(() => `map-${Date.now()}-${Math.random()}`);

  // Leaflet yükleme
  useEffect(() => {
    const loadLeaflet = async () => {
      try {
        console.log('🗺️ SimpleMap: Leaflet yükleme kontrol ediliyor...');
        
        // CSS'i yükle
        if (!document.getElementById('leaflet-css')) {
          console.log('📄 SimpleMap: CSS yükleniyor...');
          const css = document.createElement('link');
          css.id = 'leaflet-css';
          css.rel = 'stylesheet';
          css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(css);
        }

        // JS'i yükle
        if (!(window as any).L) {
          console.log('📦 SimpleMap: Leaflet JS yükleniyor...');
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.onload = () => {
              console.log('✅ SimpleMap: Leaflet yüklendi!');
              resolve(true);
            };
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }

        setLeafletLoaded(true);
      } catch (err) {
        console.error('💥 SimpleMap: Leaflet yükleme hatası:', err);
        setError('Leaflet kütüphanesi yüklenemedi');
        setIsLoading(false);
      }
    };

    loadLeaflet();
  }, []);

  // Harita initialize
  useEffect(() => {
    if (!leafletLoaded || !mapRef.current) return;

    const initMap = async () => {
      try {
        console.log('🗺️ SimpleMap: Harita initialize ediliyor...');
        setIsLoading(true);
        setError(null);

        const L = (window as any).L;
        
        // Eğer harita zaten varsa, önce temizle
        if (mapInstanceRef.current) {
          console.log('🧹 SimpleMap: Mevcut harita temizleniyor...');
          try {
            mapInstanceRef.current.remove();
          } catch (e) {
            console.warn('Harita remove hatası:', e);
          }
          mapInstanceRef.current = null;
        }

        // Container'ı güvenli şekilde temizle
        if (mapRef.current) {
          // Sadece innerHTML temizle, DOM manipülasyonu yapma
          mapRef.current.innerHTML = '';
          
          // Leaflet'in internal referanslarını temizle
          const container = mapRef.current;
          Object.keys(container).forEach(key => {
            if (key.startsWith('_leaflet')) {
              delete (container as any)[key];
            }
          });
        }

        // Kısa bir gecikme ekle - DOM'un stabilizasyonu için
        await new Promise(resolve => setTimeout(resolve, 100));

        // Container'ın hala mevcut olduğunu kontrol et
        if (!mapRef.current || !mapRef.current.parentNode) {
          throw new Error('Map container not available or detached from DOM');
        }

        // Yeni haritayı oluştur
        console.log('🗺️ SimpleMap: Yeni harita oluşturuluyor...');
        const map = L.map(mapRef.current, {
          center: center,
          zoom: zoom,
          zoomControl: true,
          attributionControl: true
        });
        
        // Tile layer ekle
        console.log('🌍 SimpleMap: Tile layer ekleniyor...');
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 18
        }).addTo(map);

        mapInstanceRef.current = map;
        setIsLoading(false);
        console.log('✅ SimpleMap: Harita başarıyla oluşturuldu!');

      } catch (err) {
        console.error('💥 SimpleMap: Harita oluşturma hatası:', err);
        setError('Harita oluşturulamadı: ' + (err as Error).message);
        setIsLoading(false);
      }
    };

    initMap();

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        console.log('🧹 SimpleMap: Cleanup - harita kaldırılıyor...');
        try {
          mapInstanceRef.current.remove();
        } catch (e) {
          console.warn('Cleanup remove hatası:', e);
        }
        mapInstanceRef.current = null;
      }
    };
  }, [leafletLoaded, center, zoom, mapId]); // mapId dependency eklendi

  // Markerları ekle
  useEffect(() => {
    if (!mapInstanceRef.current || !(window as any).L) return;

    const L = (window as any).L;
    const map = mapInstanceRef.current;
    
    console.log(`🎯 SimpleMap: ${markers.length} marker ekleniyor...`);

    try {
      // Mevcut markerları temizle
      map.eachLayer((layer: any) => {
        if (layer instanceof L.CircleMarker) {
          map.removeLayer(layer);
        }
      });

      // Markerlar yoksa işlemi durdur
      if (markers.length === 0) {
        console.log('📍 SimpleMap: Marker yok, işlem durduruluyor');
        return;
      }

      // Yeni markerları ekle
      markers.forEach((marker, index) => {
        try {
          const { lat, lng, title, description, color, magnitude, type } = marker;
          
          // Marker boyutunu ayarla
          let radius = 8;
          if (magnitude) {
            radius = Math.max(6, Math.min(20, magnitude * 3));
          } else if (type === 'fire') {
            radius = 10;
          }

          // Marker rengini belirle
          let markerColor = color;
          if (type === 'earthquake' && magnitude) {
            if (magnitude >= 6.0) markerColor = '#ff0000';
            else if (magnitude >= 5.0) markerColor = '#ff4500';
            else if (magnitude >= 4.0) markerColor = '#ff8c00';
            else markerColor = '#ffd700';
          }

          // Circle marker oluştur
          const circleMarker = L.circleMarker([lat, lng], {
            radius: radius,
            fillColor: markerColor,
            color: '#ffffff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
          });

          // Popup ekle
          const popupContent = `
            <div style="font-family: Arial, sans-serif; max-width: 200px;">
              <h4 style="margin: 0 0 8px 0; color: #333; font-size: 14px;">${title}</h4>
              <p style="margin: 0; color: #666; font-size: 12px;">${description}</p>
              ${magnitude ? `<p style="margin: 4px 0 0 0; font-weight: bold; color: ${markerColor}; font-size: 12px;">Büyüklük: ${magnitude}</p>` : ''}
              ${type === 'fire' && marker.data?.confidence ? `<p style="margin: 4px 0 0 0; color: #666; font-size: 12px;">Güven: %${marker.data.confidence}</p>` : ''}
            </div>
          `;
          
          circleMarker.bindPopup(popupContent);
          circleMarker.addTo(map);

        } catch (markerError) {
          console.warn(`⚠️ SimpleMap: Marker ${index} eklenemedi:`, markerError);
        }
      });

      console.log('✅ SimpleMap: Markerlar başarıyla eklendi!');

    } catch (err) {
      console.error('💥 SimpleMap: Marker ekleme hatası:', err);
    }

  }, [markers]);

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
        id={mapId}
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

export default SimpleMap;
