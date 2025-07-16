"use client";

import React, { useCallback, useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { Spin, Button, Tag } from 'antd';

// Harita uyarıları tipini tanımlama
interface EmergencyAlert {
  id: number;
  title: string;
  location: number[];
  type: string;
  severity: string;
}

interface GoogleMapProviderProps {
  emergencyAlerts: EmergencyAlert[];
  adminMode: boolean;
  apiKey?: string;
}

// Google Maps API için stil
const containerStyle = {
  width: '100%',
  height: '100%',
  position: 'absolute' as const,
  top: 0,
  left: 0,
  zIndex: 100
};

// Türkiye merkezi
const center = {
  lat: 39.9334,
  lng: 32.8597
};

// Marker ikonları için yardımcı fonksiyon
const getMarkerIcon = (type: string, severity: string) => {
  // Severity'ye göre farklı renk kullanacağız
  let iconColor = 'blue'; // default mavi
  
  switch (severity) {
    case 'high':
      iconColor = 'red';
      break;
    case 'medium':
      iconColor = 'orange';
      break;
    case 'low':
      iconColor = 'green';
      break;
  }
  
  // Basit bir daire simgesi
  return {
    path: 0, // SymbolPath.CIRCLE
    fillColor: iconColor,
    fillOpacity: 0.8,
    strokeWeight: 2,
    strokeColor: 'white',
    scale: 10,
  };
};

// Severity için tag rengi
const getSeverityTag = (severity: string) => {
  switch(severity) {
    case 'high':
      return <Tag color="red">Yüksek</Tag>;
    case 'medium':
      return <Tag color="orange">Orta</Tag>;
    case 'low':
      return <Tag color="green">Düşük</Tag>;
    default:
      return <Tag>Belirsiz</Tag>;
  }
};

// Type için tag rengi
const getTypeTag = (type: string) => {
  switch(type) {
    case 'earthquake':
      return <Tag color="purple">Deprem</Tag>;
    case 'flood':
      return <Tag color="blue">Sel</Tag>;
    case 'fire':
      return <Tag color="volcano">Yangın</Tag>;
    case 'accident':
      return <Tag color="cyan">Kaza</Tag>;
    default:
      return <Tag>Diğer</Tag>;
  }
};

const GoogleMapProvider: React.FC<GoogleMapProviderProps> = ({ 
  emergencyAlerts = [], 
  adminMode = false,
  apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
}) => {
  // Google Maps API yükleme
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey
  });
  
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<EmergencyAlert | null>(null);
  
  // Harita referansını sakla
  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);
  
  // Harita unmount olduğunda temizle
  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);
  
  // Marker'a tıklanınca
  const handleMarkerClick = (alert: EmergencyAlert) => {
    setSelectedMarker(alert);
  };
  
  // InfoWindow'ı kapat
  const handleInfoWindowClose = () => {
    setSelectedMarker(null);
  };
  
  if (!isLoaded) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', zIndex: 100 }}>
        <div style={{ textAlign: 'center' }}>
          <Spin size="large" />
          <div style={{ marginTop: '10px' }}>Google Maps yükleniyor...</div>
        </div>
      </div>
    );
  }
  
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', zIndex: 100 }}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={6}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          disableDefaultUI: !adminMode,
          zoomControl: true,
          streetViewControl: adminMode,
          mapTypeControl: adminMode,
        }}
      >
        {emergencyAlerts.map(alert => (
          <Marker
            key={`marker-google-${alert.id}`}
            position={{ 
              lat: alert.location[0], 
              lng: alert.location[1] 
            }}
            onClick={() => handleMarkerClick(alert)}
          />
        ))}
        
        {selectedMarker && (
          <InfoWindow
            position={{ 
              lat: selectedMarker.location[0], 
              lng: selectedMarker.location[1] 
            }}
            onCloseClick={handleInfoWindowClose}
          >
            <div style={{ padding: '5px', maxWidth: '250px' }}>
              <h3 style={{ fontSize: '16px', margin: '0 0 8px 0' }}>{selectedMarker.title}</h3>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                {getTypeTag(selectedMarker.type)}
                {getSeverityTag(selectedMarker.severity)}
              </div>
              <p style={{ fontSize: '12px', margin: '0' }}>
                <strong>Konum:</strong> {selectedMarker.location[0].toFixed(4)}, {selectedMarker.location[1].toFixed(4)}
              </p>
              <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <Button size="small" type="primary">Detaylar</Button>
                <Button size="small">Görevli Ata</Button>
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
};

export default GoogleMapProvider; 