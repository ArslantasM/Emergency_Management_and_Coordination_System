"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Örnek işaretleyiciler için veri
const markers = [
  {
    id: 1,
    position: [39.9334, 32.8597], // Ankara
    title: 'Toplanma Alanı - Ankara',
    description: 'Kızılay Meydanı toplanma alanı',
    type: 'gathering'
  },
  {
    id: 2,
    position: [41.0082, 28.9784], // İstanbul
    title: 'Çadır Kent - İstanbul',
    description: 'Ümraniye çadır kent alanı',
    type: 'tent'
  },
  {
    id: 3,
    position: [38.4237, 27.1428], // İzmir
    title: 'Gıda Dağıtım - İzmir',
    description: 'Konak meydanı gıda dağıtım merkezi',
    type: 'food'
  },
  {
    id: 4,
    position: [40.1885, 29.0610], // Bursa
    title: 'İlk Yardım - Bursa',
    description: 'Bursa merkez ilk yardım istasyonu',
    type: 'medical'
  },
];

// Haritayı Türkiye odaklı ayarlama
function SetMapView() {
  const map = useMap();
  useEffect(() => {
    map.setView([39.1, 35.6], 6); // Türkiye merkezli görünüm
  }, [map]);
  return null;
}

// Farklı işaretleyici tipleri için özel ikonlar
const getMarkerIcon = (type: string) => {
  const iconSize: [number, number] = [25, 41];
  const iconAnchor: [number, number] = [12, 41];
  const popupAnchor: [number, number] = [1, -34];
  
  let iconUrl;
  
  switch (type) {
    case 'gathering':
      iconUrl = '/images/markers/gathering.png';
      break;
    case 'tent':
      iconUrl = '/images/markers/tent.png';
      break;
    case 'food':
      iconUrl = '/images/markers/food.png';
      break;
    case 'medical':
      iconUrl = '/images/markers/medical.png';
      break;
    default:
      iconUrl = '/images/marker-icon.png';
  }
  
  return L.icon({
    iconUrl,
    iconSize,
    iconAnchor,
    popupAnchor,
  });
};

export default function MapComponent() {
  const [mapReady, setMapReady] = useState(false);

  // Harita komponentini client tarafında render et
  useEffect(() => {
    setMapReady(true);
    
    // Leaflet'in varsayılan ikonları için düzeltme (Next.js ile çalışması için)
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: '/images/marker-icon-2x.png',
      iconUrl: '/images/marker-icon.png',
      shadowUrl: '/images/marker-shadow.png',
    });
  }, []);

  if (!mapReady) return <div>Harita yükleniyor...</div>;

  return (
    <div style={{ height: "calc(100vh - 200px)", width: "100%" }}>
      <MapContainer 
        center={[39.1, 35.6]} 
        zoom={6} 
        style={{ height: "100%", width: "100%" }}
      >
        <SetMapView />
        
        <LayersControl position="topright">
          <LayersControl.BaseLayer name="OpenStreetMap" checked>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
          
          <LayersControl.BaseLayer name="Uydu Görüntüsü">
            <TileLayer
              attribution='&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>
          
          <LayersControl.BaseLayer name="Topografik Harita">
            <TileLayer
              attribution='Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
              url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
        </LayersControl>
        
        {markers.map(marker => (
          <Marker 
            key={marker.id} 
            position={marker.position as [number, number]} 
            icon={getMarkerIcon(marker.type)}
          >
            <Popup>
              <div>
                <h3 className="font-bold">{marker.title}</h3>
                <p>{marker.description}</p>
                <p className="text-xs mt-1 text-gray-500">Koordinatlar: {marker.position[0]}, {marker.position[1]}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
} 