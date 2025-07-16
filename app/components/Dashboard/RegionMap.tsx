"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Card, Select, Button, Space, message, Spin, Tag } from 'antd';
import { ReloadOutlined, FullscreenOutlined } from '@ant-design/icons';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const { Option } = Select;

// Leaflet marker ikonlarını düzelt
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/images/marker-icon-2x.png',
  iconUrl: '/images/marker-icon.png',
  shadowUrl: '/images/marker-shadow.png',
});

interface RegionMapProps {
  regions?: any[];
  selectedRegion?: any;
  onRegionSelect?: (region: any) => void;
  onBoundaryChange?: (boundary: any) => void;
  height?: string;
}

export default function RegionMap({ 
  regions = [], 
  selectedRegion,
  onRegionSelect,
  onBoundaryChange,
  height = "500px" 
}: RegionMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [mapStyle, setMapStyle] = useState('osm');
  const [regionLayers, setRegionLayers] = useState<L.LayerGroup | null>(null);
  const [boundaryLayer, setBoundaryLayer] = useState<L.Layer | null>(null);
  const [locationCache, setLocationCache] = useState<Map<string, [number, number]>>(new Map());

  // Lokasyon cache'ini başlat
  useEffect(() => {
    const loadLocationCache = async () => {
      try {
        console.log('🗂️ Lokasyon cache\'i yükleniyor...');
        
        // Paralel olarak tüm lokasyon verilerini çek
        const [countriesRes, citiesRes, districtsRes] = await Promise.all([
          fetch('/api/countries?limit=1000'),
          fetch('/api/cities?limit=1000'),
          fetch('/api/districts?limit=1000')
        ]);

        const [countriesData, citiesData, districtsData] = await Promise.all([
          countriesRes.json(),
          citiesRes.json(),
          districtsRes.json()
        ]);

        const cache = new Map<string, [number, number]>();

        // Ülkeleri cache'le
        if (countriesData.success && countriesData.data) {
          countriesData.data.forEach((country: any) => {
            if (country.latitude && country.longitude) {
              cache.set(`country-${country.id}`, [country.latitude, country.longitude]);
            }
          });
        }

        // Şehirleri cache'le
        if (citiesData.success && citiesData.data) {
          citiesData.data.forEach((city: any) => {
            if (city.latitude && city.longitude) {
              cache.set(`city-${city.id}`, [city.latitude, city.longitude]);
            }
          });
        }

        // İlçeleri cache'le
        if (districtsData.success && districtsData.data) {
          districtsData.data.forEach((district: any) => {
            if (district.latitude && district.longitude) {
              cache.set(`district-${district.id}`, [district.latitude, district.longitude]);
            }
          });
        }

        setLocationCache(cache);
        console.log(`✅ ${cache.size} lokasyon cache'lendi`);
        
      } catch (error) {
        console.error('❌ Lokasyon cache yüklenirken hata:', error);
      }
    };

    loadLocationCache();
  }, []);

  // Harita başlatma
  useEffect(() => {
    if (!mapContainerRef.current) return;

    try {
      // Harita oluştur
      const map = L.map(mapContainerRef.current, {
        center: [39.0, 35.0], // Türkiye merkezi
        zoom: 6,
        zoomControl: true,
        attributionControl: true,
      });

      // Temel harita katmanı
      const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      });

      const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '© Esri, DigitalGlobe, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community'
      });

      // Varsayılan katmanı ekle
      osmLayer.addTo(map);

      // Harita stilleri kontrolü
      const baseLayers = {
        'Standart': osmLayer,
        'Uydu': satelliteLayer
      };

      L.control.layers(baseLayers).addTo(map);

      mapRef.current = map;
      setLoading(false);

      console.log('✅ Harita başlatıldı');
    } catch (error) {
      console.error('❌ Harita başlatılırken hata:', error);
      message.error('Harita yüklenirken bir hata oluştu');
      setLoading(false);
    }

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Bölge katmanlarını güncelle
  useEffect(() => {
    if (!mapRef.current || !regions || regions.length === 0) return;

    console.log('🗺️ Bölge katmanları güncelleniyor:', regions.length);

    // Eski katmanları temizle
    if (regionLayers) {
      mapRef.current.removeLayer(regionLayers);
    }

    const newRegionLayers = L.layerGroup();

    // Her bölge için işlem yap
    const processRegions = async () => {
      for (const region of regions) {
        console.log(`🎨 Bölge işleniyor: ${region.name}`, region);
        console.log(`📍 Bölge lokasyonları:`, region.locations);
        
        // Bölge rengi - önce region.color'ı kontrol et, yoksa emergency_level'a göre belirle
        const color = region.color || getRegionColor(region.emergency_level);
        console.log(`🎨 ${region.name} rengi: ${color}`);

        if (region.locations && region.locations.length > 0) {
          console.log(`✅ ${region.name} için ${region.locations.length} lokasyon bulundu`);
          
          // Her lokasyon için koordinat al ve haritaya ekle
          for (const location of region.locations) {
            const [type, id] = location.split('-');
            console.log(`📍 Lokasyon işleniyor: ${type}-${id}`);
            
            try {
              const coordinates = await getLocationCoordinates(type, id);
              
              if (coordinates) {
                console.log(`✅ Koordinat bulundu: ${coordinates[0]}, ${coordinates[1]} için ${location}`);
                
                // Bölge sınırlarını çiz (yarı transparan daire)
                const circle = L.circle(coordinates, {
                  color: color,
                  fillColor: color,
                  fillOpacity: 0.3, // Yarı transparan
                  radius: getRegionRadius(type),
                  weight: 2
                });

                // Türkçe popup ekle
                circle.bindPopup(`
                  <div style="font-family: 'Segoe UI', sans-serif;">
                    <h4 style="margin: 0 0 8px 0; color: #1890ff;">${region.name}</h4>
                    <p style="margin: 4px 0;"><strong>Tip:</strong> ${region.region_type === 'emergency' ? 'Acil Durum' : region.region_type}</p>
                    <p style="margin: 4px 0;"><strong>Acil Durum Seviyesi:</strong> ${getEmergencyLevelText(region.emergency_level)}</p>
                    <p style="margin: 4px 0;"><strong>Durum:</strong> ${region.status === 'ACTIVE' ? 'Aktif' : region.status}</p>
                    <p style="margin: 4px 0;"><strong>Lokasyon:</strong> ${getLocationTypeText(type)}</p>
                    ${region.description ? `<p style="margin: 4px 0;"><strong>Açıklama:</strong> ${region.description}</p>` : ''}
                  </div>
                `);

                // Tıklama olayı
                circle.on('click', () => {
                  if (onRegionSelect) {
                    onRegionSelect(region);
                  }
                });

                newRegionLayers.addLayer(circle);
              } else {
                console.warn(`⚠️ ${location} için koordinat bulunamadı`);
              }
            } catch (error) {
              console.error(`❌ ${location} koordinat alınırken hata:`, error);
            }
          }

          // Bölge merkez marker'ı - ilk lokasyonun koordinatlarını kullan
          if (region.locations.length > 0) {
            const firstLocation = region.locations[0];
            const [type, id] = firstLocation.split('-');
            
            try {
              const coordinates = await getLocationCoordinates(type, id);
              if (coordinates) {
                const centerMarker = L.marker(coordinates, {
                  icon: L.divIcon({
                    className: 'region-marker',
                    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; font-size: 12px; color: white; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${region.name.charAt(0)}</div>`,
                    iconSize: [24, 24],
                    iconAnchor: [12, 12]
                  })
                });

                centerMarker.bindPopup(`
                  <div style="font-family: 'Segoe UI', sans-serif;">
                    <h4 style="margin: 0 0 8px 0; color: #1890ff;">${region.name}</h4>
                    <p style="margin: 4px 0;"><strong>Tip:</strong> ${region.region_type === 'emergency' ? 'Acil Durum' : region.region_type}</p>
                    <p style="margin: 4px 0;"><strong>Acil Durum Seviyesi:</strong> ${getEmergencyLevelText(region.emergency_level)}</p>
                    <p style="margin: 4px 0;"><strong>Durum:</strong> ${region.status === 'ACTIVE' ? 'Aktif' : region.status}</p>
                    ${region.total_population ? `<p style="margin: 4px 0;"><strong>Nüfus:</strong> ${Number(region.total_population).toLocaleString()}</p>` : ''}
                    ${region.total_area_sqkm ? `<p style="margin: 4px 0;"><strong>Alan:</strong> ${region.total_area_sqkm.toFixed(2)} km²</p>` : ''}
                    ${region.description ? `<p style="margin: 4px 0;"><strong>Açıklama:</strong> ${region.description}</p>` : ''}
                  </div>
                `);

                centerMarker.on('click', () => {
                  if (onRegionSelect) {
                    onRegionSelect(region);
                  }
                });

                newRegionLayers.addLayer(centerMarker);
              }
            } catch (error) {
              console.error(`❌ Merkez marker koordinat alınırken hata:`, error);
            }
          }
        } else {
          console.warn(`⚠️ ${region.name} için lokasyon bulunamadı veya boş`);
          
          // Eğer lokasyon yoksa, fallback olarak Hatay koordinatlarını kullan
          if (region.name.toLowerCase().includes('hatay')) {
            const hatayCoords: [number, number] = [36.2012, 36.1611];
            console.log(`🎯 ${region.name} için Hatay fallback koordinatı kullanılıyor`);
            
            const circle = L.circle(hatayCoords, {
              color: color,
              fillColor: color,
              fillOpacity: 0.3,
              radius: 50000, // 50km
              weight: 2
            });

            circle.bindPopup(`
              <div style="font-family: 'Segoe UI', sans-serif;">
                <h4 style="margin: 0 0 8px 0; color: #1890ff;">${region.name}</h4>
                <p style="margin: 4px 0;"><strong>Tip:</strong> ${region.region_type === 'emergency' ? 'Acil Durum' : region.region_type}</p>
                <p style="margin: 4px 0;"><strong>Acil Durum Seviyesi:</strong> ${getEmergencyLevelText(region.emergency_level)}</p>
                <p style="margin: 4px 0;"><strong>Durum:</strong> ${region.status === 'ACTIVE' ? 'Aktif' : region.status}</p>
                <p style="margin: 4px 0;"><strong>Lokasyon:</strong> Hatay (Fallback)</p>
                ${region.description ? `<p style="margin: 4px 0;"><strong>Açıklama:</strong> ${region.description}</p>` : ''}
              </div>
            `);

            circle.on('click', () => {
              if (onRegionSelect) {
                onRegionSelect(region);
              }
            });

            newRegionLayers.addLayer(circle);

            // Merkez marker da ekle
            const centerMarker = L.marker(hatayCoords, {
              icon: L.divIcon({
                className: 'region-marker',
                html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; font-size: 12px; color: white; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${region.name.charAt(0)}</div>`,
                iconSize: [24, 24],
                iconAnchor: [12, 12]
              })
            });

            centerMarker.bindPopup(`
              <div style="font-family: 'Segoe UI', sans-serif;">
                <h4 style="margin: 0 0 8px 0; color: #1890ff;">${region.name}</h4>
                <p style="margin: 4px 0;"><strong>Tip:</strong> ${region.region_type === 'emergency' ? 'Acil Durum' : region.region_type}</p>
                <p style="margin: 4px 0;"><strong>Acil Durum Seviyesi:</strong> ${getEmergencyLevelText(region.emergency_level)}</p>
                <p style="margin: 4px 0;"><strong>Durum:</strong> ${region.status === 'ACTIVE' ? 'Aktif' : region.status}</p>
                ${region.total_population ? `<p style="margin: 4px 0;"><strong>Nüfus:</strong> ${Number(region.total_population).toLocaleString()}</p>` : ''}
                ${region.total_area_sqkm ? `<p style="margin: 4px 0;"><strong>Alan:</strong> ${region.total_area_sqkm.toFixed(2)} km²</p>` : ''}
                ${region.description ? `<p style="margin: 4px 0;"><strong>Açıklama:</strong> ${region.description}</p>` : ''}
              </div>
            `);

            centerMarker.on('click', () => {
              if (onRegionSelect) {
                onRegionSelect(region);
              }
            });

            newRegionLayers.addLayer(centerMarker);
          }
        }
      }

      // Katmanları haritaya ekle
      if (mapRef.current) {
        newRegionLayers.addTo(mapRef.current);
        setRegionLayers(newRegionLayers);
        console.log('✅ Bölge katmanları haritaya eklendi');
      }
    };

    processRegions().catch(error => {
      console.error('❌ Bölge işleme hatası:', error);
    });

  }, [regions, onRegionSelect, locationCache]);

  // Seçili bölgeyi vurgula
  useEffect(() => {
    if (!mapRef.current || !selectedRegion) return;

    console.log('🎯 Seçili bölge vurgulanıyor:', selectedRegion.name);

    // Eski vurgulama katmanını temizle
    if (boundaryLayer) {
      mapRef.current.removeLayer(boundaryLayer);
    }

    // Yeni vurgulama katmanı oluştur
    const highlightLayer = L.layerGroup();

    if (selectedRegion.locations && selectedRegion.locations.length > 0) {
      selectedRegion.locations.forEach(async (location: string) => {
        const [type, id] = location.split('-');
        const coordinates = await getLocationCoordinates(type, id);
        
        if (coordinates) {
          const highlight = L.circle(coordinates, {
            color: '#ff0000',
            fillColor: '#ff0000',
            fillOpacity: 0.1,
            radius: getRegionRadius(type) * 1.2, // Biraz daha büyük
            weight: 3,
            dashArray: '5, 5' // Kesikli çizgi
          });

          highlightLayer.addLayer(highlight);
        }
      });
    }

    highlightLayer.addTo(mapRef.current);
    setBoundaryLayer(highlightLayer);

  }, [selectedRegion]);

  // Yardımcı fonksiyonlar
  const getRegionColor = (emergencyLevel: string) => {
    switch (emergencyLevel) {
      case 'CRITICAL': return '#ff4d4f';
      case 'HIGH': return '#ffa940';
      case 'MEDIUM': return '#fadb14';
      case 'LOW': return '#52c41a';
      default: return '#1890ff';
    }
  };

  const getEmergencyLevelText = (level: string) => {
    const levels: Record<string, string> = {
      'CRITICAL': 'Kritik',
      'HIGH': 'Yüksek', 
      'MEDIUM': 'Orta',
      'LOW': 'Düşük'
    };
    return levels[level] || level;
  };

  const getLocationTypeText = (type: string) => {
    const types: Record<string, string> = {
      'country': 'Ülke',
      'city': 'Şehir',
      'district': 'İlçe', 
      'town': 'Kasaba'
    };
    return types[type] || type;
  };

  const getRegionRadius = (type: string) => {
    switch (type) {
      case 'country': return 100000; // 100km
      case 'city': return 50000;     // 50km
      case 'district': return 20000;  // 20km
      case 'town': return 10000;     // 10km
      default: return 30000;
    }
  };

  const getLocationCoordinates = async (type: string, id: string): Promise<[number, number] | null> => {
    const cacheKey = `${type}-${id}`;
    
    // Önce cache'den kontrol et
    if (locationCache.has(cacheKey)) {
      const coords = locationCache.get(cacheKey)!;
      console.log(`📍 Cache'den koordinat bulundu: ${coords[0]}, ${coords[1]} (${cacheKey})`);
      return coords;
    }

    console.log(`⚠️ ${cacheKey} için koordinat cache'de bulunamadı`);
    
    // API'den koordinat almaya çalış
    try {
      let apiUrl = '';
      switch (type) {
        case 'country':
          apiUrl = `/api/countries?limit=1000`;
          break;
        case 'city':
          apiUrl = `/api/cities?limit=1000`;
          break;
        case 'district':
          apiUrl = `/api/districts?limit=1000`;
          break;
        default:
          console.warn(`⚠️ Bilinmeyen lokasyon tipi: ${type}`);
          break;
      }

      if (apiUrl) {
        const response = await fetch(apiUrl);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            const location = data.data.find((item: any) => item.id === id);
            if (location && location.latitude && location.longitude) {
              const coords: [number, number] = [location.latitude, location.longitude];
              console.log(`✅ API'den koordinat bulundu: ${coords[0]}, ${coords[1]} (${location.name})`);
              // Cache'e ekle
              locationCache.set(cacheKey, coords);
              setLocationCache(new Map(locationCache));
              return coords;
            }
          }
        }
      }
    } catch (error) {
      console.error(`❌ API'den koordinat alınırken hata (${cacheKey}):`, error);
    }
    
    // Türkiye'nin önemli şehirleri için sabit koordinatlar
    const turkeyCoordinates: Record<string, [number, number]> = {
      'hatay': [36.2012, 36.1611], // Hatay (Antakya)
      'antakya': [36.2012, 36.1611], // Antakya
      'istanbul': [41.0082, 28.9784],
      'ankara': [39.9334, 32.8597],
      'izmir': [38.4192, 27.1287],
      'antalya': [36.8969, 30.7133],
      'adana': [37.0000, 35.3213],
      'bursa': [40.1826, 29.0665],
      'gaziantep': [37.0662, 37.3833],
      'konya': [37.8667, 32.4833],
      'kayseri': [38.7312, 35.4787]
    };

    // İsim bazlı arama yap
    for (const [cityName, coords] of Object.entries(turkeyCoordinates)) {
      if (cacheKey.toLowerCase().includes(cityName)) {
        console.log(`🎯 ${cityName} için sabit koordinat kullanılıyor: ${coords[0]}, ${coords[1]}`);
        locationCache.set(cacheKey, coords);
        setLocationCache(new Map(locationCache));
        return coords;
      }
    }

    // Fallback koordinatlar
    const fallbackCoords: [number, number] = [39.0 + (Math.random() - 0.5) * 2, 35.0 + (Math.random() - 0.5) * 2];
    console.log(`🔄 Fallback koordinat oluşturuldu: ${fallbackCoords[0]}, ${fallbackCoords[1]} (${cacheKey})`);
    return fallbackCoords;
  };

  const handleRefresh = () => {
    if (mapRef.current) {
      mapRef.current.invalidateSize();
      message.success('Harita yenilendi');
    }
  };

  const handleFullscreen = () => {
    if (mapContainerRef.current) {
      if (mapContainerRef.current.requestFullscreen) {
        mapContainerRef.current.requestFullscreen();
      }
    }
  };

  return (
    <Card
      title="Bölge Haritası"
      extra={
        <Space>
          <Select
            value={mapStyle}
            onChange={setMapStyle}
            style={{ width: 120 }}
          >
            <Option value="osm">Standart</Option>
            <Option value="satellite">Uydu</Option>
          </Select>
          <Button icon={<ReloadOutlined />} onClick={handleRefresh} />
          <Button icon={<FullscreenOutlined />} onClick={handleFullscreen} />
        </Space>
      }
    >
      <div style={{ position: 'relative', height }}>
        {loading && (
          <div style={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)',
            zIndex: 1000
          }}>
            <Spin size="large" />
          </div>
        )}
        <div 
          ref={mapContainerRef} 
      style={{
            height: '100%', 
        width: '100%',
            borderRadius: '6px'
          }} 
        />
      </div>
      
      {regions.length > 0 && (
        <div style={{ marginTop: '12px' }}>
          <Space wrap>
            {regions.map((region) => (
              <Tag 
                key={region.id}
                color={getRegionColor(region.emergency_level)}
                style={{ cursor: 'pointer' }}
                onClick={() => onRegionSelect && onRegionSelect(region)}
              >
                {region.name} ({region.emergency_level})
              </Tag>
            ))}
          </Space>
        </div>
      )}
    </Card>
  );
} 