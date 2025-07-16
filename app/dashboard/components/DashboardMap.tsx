"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, Spin, Alert, Button, Space, Typography, Badge, List, Tag } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import StableMap from "./StableMap";

const { Text } = Typography;

interface EarthquakeData {
  id: string;
  eventId: string;
  source: string;
  date: string;
  latitude: number;
  longitude: number;
  depth: number;
  magnitude: number;
  type: string;
  location: string;
  tsunamiAlert: boolean;
}

interface FireData {
  id: string;
  source: string;
  date: string;
  latitude: number;
  longitude: number;
  brightness?: number;
  confidence?: number;
  frp?: number;
  satellite?: string;
  instrument?: string;
  location?: string;
}

interface EventData {
  id: string;
  type: 'earthquake' | 'fire' | 'tsunami';
  title: string;
  location: string;
  date: string;
  source: string;
  data: any;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

interface DashboardMapProps {
  earthquakes?: EarthquakeData[];
  tsunamis?: any[];
  fires?: FireData[];
  loading?: boolean;
  wsConnected?: boolean;
}

const DashboardMap: React.FC<DashboardMapProps> = (props) => {
  const { 
    earthquakes = [], 
    tsunamis = [], 
    fires = [],
    loading = false,
    wsConnected = false 
  } = props;

  const [isClient, setIsClient] = useState(false);
  const [liveEarthquakes, setLiveEarthquakes] = useState<EarthquakeData[]>([]);
  const [liveFires, setLiveFires] = useState<FireData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchLiveData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🌍 Canlı deprem verileri alınıyor...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      try {
        const earthquakeResponse = await fetch('/api/earthquakes', {
          signal: controller.signal,
          headers: { 'Cache-Control': 'no-cache' }
        });
        
        clearTimeout(timeoutId);
        
        if (!earthquakeResponse.ok) {
          throw new Error(`HTTP ${earthquakeResponse.status}: Deprem verileri alınamadı`);
        }
        
        const earthquakeGeoJSON = await earthquakeResponse.json();
        
        if (!earthquakeGeoJSON.features || !Array.isArray(earthquakeGeoJSON.features)) {
          throw new Error('Geçersiz GeoJSON formatı');
        }
        
        const earthquakeData: EarthquakeData[] = earthquakeGeoJSON.features.map((feature: any) => ({
          id: feature.properties.id,
          eventId: feature.properties.eventId,
          source: feature.properties.source,
          date: feature.properties.date,
          latitude: feature.geometry.coordinates[1],
          longitude: feature.geometry.coordinates[0],
          depth: feature.properties.depth,
          magnitude: feature.properties.magnitude,
          type: feature.properties.type,
          location: feature.properties.location,
          tsunamiAlert: feature.properties.tsunamiAlert
        }));
        
        setLiveEarthquakes(earthquakeData);
        setLastUpdate(new Date());
        
        console.log(`✅ ${earthquakeData.length} deprem verisi yüklendi`);
        
      } catch (fetchError: any) {
        if (fetchError.name === 'AbortError') {
          throw new Error('API çağrısı zaman aşımına uğradı (10 saniye)');
        }
        throw fetchError;
      }
      
      try {
        const fireController = new AbortController();
        const fireTimeoutId = setTimeout(() => fireController.abort(), 8000);
        
        const fireResponse = await fetch('/api/fires', {
          signal: fireController.signal,
          headers: { 'Cache-Control': 'no-cache' }
        });
        
        clearTimeout(fireTimeoutId);
        
        if (fireResponse.ok) {
          const fireGeoJSON = await fireResponse.json();
          
          if (fireGeoJSON.features && Array.isArray(fireGeoJSON.features)) {
            const fireData: FireData[] = fireGeoJSON.features.map((feature: any) => ({
              id: feature.properties.id,
              source: feature.properties.source,
              date: feature.properties.date,
              latitude: feature.geometry.coordinates[1],
              longitude: feature.geometry.coordinates[0],
              brightness: feature.properties.brightness,
              confidence: feature.properties.confidence,
              frp: feature.properties.frp,
              satellite: feature.properties.satellite,
              instrument: feature.properties.instrument,
              location: feature.properties.location
            }));
            
            setLiveFires(fireData);
            console.log(`🔥 ${fireData.length} yangın verisi yüklendi`);
          }
        }
      } catch (fireError: any) {
        console.log('Yangın verileri alınamadı:', fireError.message);
      }
      
    } catch (err: any) {
      console.error('Canlı veri alma hatası:', err);
      setError(err.message || 'Canlı veriler alınırken bilinmeyen bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setIsClient(true);
    fetchLiveData();
    
    const interval = setInterval(fetchLiveData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchLiveData]);

  const allMarkers = [
    ...liveEarthquakes.map(eq => ({
      id: eq.id,
      lat: eq.latitude,
      lng: eq.longitude,
      type: "earthquake" as const,
      title: `${eq.magnitude} büyüklüğünde deprem`,
      description: `${eq.location} - ${new Date(eq.date).toLocaleDateString("tr-TR")}`,
      color: eq.magnitude >= 6.0 ? "#ff0000" : eq.magnitude >= 5.0 ? "#ff4500" : eq.magnitude >= 4.0 ? "#ff8c00" : "#ffd700",
      magnitude: eq.magnitude,
      data: eq
    })),
    ...earthquakes.map(eq => ({
      id: eq.id,
      lat: eq.latitude,
      lng: eq.longitude,
      type: "earthquake" as const,
      title: `${eq.magnitude} büyüklüğünde deprem`,
      description: `${eq.location} - ${new Date(eq.date).toLocaleDateString("tr-TR")}`,
      color: eq.magnitude >= 6.0 ? "#ff0000" : eq.magnitude >= 5.0 ? "#ff4500" : eq.magnitude >= 4.0 ? "#ff8c00" : "#ffd700",
      magnitude: eq.magnitude,
      data: eq
    })),
    ...tsunamis.map(ts => ({
      id: ts.id,
      lat: ts.latitude,
      lng: ts.longitude,
      type: "tsunami" as const,
      title: "Tsunami Uyarısı",
      description: `${ts.location || 'Bilinmeyen konum'} - ${ts.status || 'Aktif'}`,
      color: "#ff0000",
      data: ts
    })),
    ...liveFires.map(fire => ({
      id: fire.id,
      lat: fire.latitude,
      lng: fire.longitude,
      type: "fire" as const,
      title: "Yangın Tespiti",
      description: `${fire.location || 'Bilinmeyen konum'} - ${new Date(fire.date).toLocaleDateString("tr-TR")}`,
      color: "#ff6600",
      data: fire
    })),
    ...fires.map(fire => ({
      id: fire.id,
      lat: fire.latitude,
      lng: fire.longitude,
      type: "fire" as const,
      title: "Yangın Tespiti",
      description: `${fire.location || 'Bilinmeyen konum'} - ${new Date(fire.date).toLocaleDateString("tr-TR")}`,
      color: "#ff6600",
      data: fire
    }))
  ];

  const allEvents: EventData[] = [
    ...liveEarthquakes.map(eq => ({
      id: eq.id,
      type: 'earthquake' as const,
      title: `${eq.magnitude} büyüklüğünde deprem`,
      location: eq.location,
      date: eq.date,
      source: eq.source,
      data: eq,
      severity: eq.magnitude >= 6.0 ? 'critical' as const : eq.magnitude >= 5.0 ? 'high' as const : eq.magnitude >= 4.0 ? 'medium' as const : 'low' as const
    })),
    ...earthquakes.map(eq => ({
      id: eq.id,
      type: 'earthquake' as const,
      title: `${eq.magnitude} büyüklüğünde deprem`,
      location: eq.location,
      date: eq.date,
      source: eq.source,
      data: eq,
      severity: eq.magnitude >= 6.0 ? 'critical' as const : eq.magnitude >= 5.0 ? 'high' as const : eq.magnitude >= 4.0 ? 'medium' as const : 'low' as const
    })),
    ...liveFires.map(fire => ({
      id: fire.id,
      type: 'fire' as const,
      title: 'Yangın Tespiti',
      location: fire.location || 'Bilinmeyen konum',
      date: fire.date,
      source: fire.source,
      data: fire,
      severity: fire.confidence && fire.confidence >= 90 ? 'high' as const : fire.confidence && fire.confidence >= 70 ? 'medium' as const : 'low' as const
    })),
    ...fires.map(fire => ({
      id: fire.id,
      type: 'fire' as const,
      title: 'Yangın Tespiti',
      location: fire.location || 'Bilinmeyen konum',
      date: fire.date,
      source: fire.source,
      data: fire,
      severity: 'medium' as const
    })),
    ...tsunamis.map(ts => ({
      id: ts.id,
      type: 'tsunami' as const,
      title: 'Tsunami Uyarısı',
      location: ts.location || 'Bilinmeyen konum',
      date: ts.date,
      source: ts.source || 'AFAD',
      data: ts,
      severity: 'critical' as const
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (!isClient) {
    return React.createElement(Card, {
      title: "🗺️ Canlı Acil Durum Haritası",
      style: { minHeight: "600px" }
    }, React.createElement("div", {
      style: { height: "350px", display: "flex", justifyContent: "center", alignItems: "center" }
    }, React.createElement(Spin, { size: "large" })));
  }

  const getStatusBadge = () => {
    if (liveEarthquakes.length > 0) {
      return React.createElement(Badge, { status: "processing", text: "Canlı Veri" });
    } else if (allMarkers.length > 0) {
      return React.createElement(Badge, { status: "warning", text: "Demo Veri" });
    } else {
      return React.createElement(Badge, { status: "default", text: "Veri Yok" });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#e74c3c';
      case 'high': return '#e67e22';
      case 'medium': return '#f39c12';
      case 'low': return '#27ae60';
      default: return '#95a5a6';
    }
  };

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case 'critical': return 'KRİTİK';
      case 'high': return 'YÜKSEK';
      case 'medium': return 'ORTA';
      case 'low': return 'DÜŞÜK';
      default: return 'BELİRSİZ';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'earthquake': return React.createElement("span", { style: { fontSize: '16px' } }, "🏔️");
      case 'fire': return React.createElement("span", { style: { fontSize: '16px' } }, "🔥");
      case 'tsunami': return React.createElement("span", { style: { fontSize: '16px' } }, "🌊");
      default: return React.createElement("span", { style: { fontSize: '16px' } }, "ℹ️");
    }
  };

  return React.createElement(Card, {
    title: React.createElement("div", {
      style: { display: "flex", justifyContent: "space-between", alignItems: "center" }
    }, [
      React.createElement("span", { key: "title" }, "🗺️ Canlı Acil Durum Haritası"),
      React.createElement(Space, { key: "actions" }, [
        getStatusBadge(),
        React.createElement(Button, {
          key: "refresh",
          type: "text",
          icon: React.createElement(ReloadOutlined, { spin: isLoading }),
          onClick: fetchLiveData,
          loading: isLoading,
          size: "small"
        }, "🔄 Yenile")
      ])
    ]),
    style: { minHeight: "600px" }
  }, [
    error && React.createElement(Alert, {
      key: "error",
      message: "Veri Hatası",
      description: error,
      type: "warning",
      showIcon: true,
      style: { marginBottom: 16 },
      action: React.createElement(Button, {
        size: "small",
        onClick: fetchLiveData
      }, "Tekrar Dene")
    }),
    
    React.createElement("div", {
      key: "map-container",
      style: { position: 'relative', marginBottom: 16 }
    }, [
      React.createElement("div", {
        key: "legend",
        style: {
          position: 'absolute',
          top: 10,
          right: 10,
          zIndex: 1000,
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '12px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          minWidth: '220px',
          backdropFilter: 'blur(10px)'
        }
      }, [
        React.createElement("div", {
          key: "legend-title",
          style: { marginBottom: 8 }
        }, React.createElement(Text, {
          strong: true,
          style: { fontSize: '13px', color: '#1890ff' }
        }, "📊 Harita Göstergesi")),
        
        React.createElement(Space, {
          key: "legend-items",
          direction: "vertical",
          size: "small",
          style: { width: '100%' }
        }, [
          React.createElement("div", {
            key: "big-eq",
            style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }
          }, [
            React.createElement(Space, { key: "label", size: "small" }, [
              React.createElement("span", { key: "icon", style: { fontSize: '14px' } }, "🌍"),
              React.createElement(Text, {
                key: "text",
                style: { fontSize: '11px', fontWeight: '500' }
              }, "Büyük Deprem (≥6.0)")
            ]),
            React.createElement(Text, {
              key: "count",
              style: { fontSize: '11px', color: '#666', fontWeight: 'bold' }
            }, allMarkers.filter(m => m.type === 'earthquake' && m.magnitude && m.magnitude >= 6.0).length)
          ]),
          
          React.createElement("div", {
            key: "med-eq",
            style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }
          }, [
            React.createElement(Space, { key: "label", size: "small" }, [
              React.createElement("span", { key: "icon", style: { fontSize: '14px' } }, "🌍"),
              React.createElement(Text, {
                key: "text",
                style: { fontSize: '11px', fontWeight: '500' }
              }, "Orta Deprem (4.0-5.9)")
            ]),
            React.createElement(Text, {
              key: "count",
              style: { fontSize: '11px', color: '#666', fontWeight: 'bold' }
            }, allMarkers.filter(m => m.type === 'earthquake' && m.magnitude && m.magnitude >= 4.0 && m.magnitude < 6.0).length)
          ]),
          
          React.createElement("div", {
            key: "small-eq",
            style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }
          }, [
            React.createElement(Space, { key: "label", size: "small" }, [
              React.createElement("span", { key: "icon", style: { fontSize: '14px' } }, "🌍"),
              React.createElement(Text, {
                key: "text",
                style: { fontSize: '11px', fontWeight: '500' }
              }, "Küçük Deprem (<4.0)")
            ]),
            React.createElement(Text, {
              key: "count",
              style: { fontSize: '11px', color: '#666', fontWeight: 'bold' }
            }, allMarkers.filter(m => m.type === 'earthquake' && m.magnitude && m.magnitude < 4.0).length)
          ]),
          
          React.createElement("div", {
            key: "fires",
            style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }
          }, [
            React.createElement(Space, { key: "label", size: "small" }, [
              React.createElement("span", { key: "icon", style: { fontSize: '14px' } }, "🔥"),
              React.createElement(Text, {
                key: "text",
                style: { fontSize: '11px', fontWeight: '500' }
              }, "Yangın Tespiti")
            ]),
            React.createElement(Text, {
              key: "count",
              style: { fontSize: '11px', color: '#666', fontWeight: 'bold' }
            }, allMarkers.filter(m => m.type === 'fire').length)
          ]),
          
          React.createElement("div", {
            key: "tsunamis",
            style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }
          }, [
            React.createElement(Space, { key: "label", size: "small" }, [
              React.createElement("span", { key: "icon", style: { fontSize: '14px' } }, "🌊"),
              React.createElement(Text, {
                key: "text",
                style: { fontSize: '11px', fontWeight: '500' }
              }, "Tsunami Uyarısı")
            ]),
            React.createElement(Text, {
              key: "count",
              style: { fontSize: '11px', color: '#666', fontWeight: 'bold' }
            }, allMarkers.filter(m => m.type === 'tsunami').length)
          ])
        ]),
        
        lastUpdate && React.createElement("div", {
          key: "last-update",
          style: { marginTop: 10, paddingTop: 8, borderTop: '1px solid #e8e8e8' }
        }, React.createElement("div", {
          style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }
        }, [
          React.createElement(Text, {
            key: "label",
            style: { fontSize: '10px', color: '#666' }
          }, "🕒 Son güncelleme"),
          React.createElement(Text, {
            key: "time",
            style: { fontSize: '10px', color: '#1890ff', fontWeight: 'bold' }
          }, lastUpdate.toLocaleTimeString('tr-TR'))
        ]))
      ]),
      
      React.createElement(StableMap, {
        key: `dashboard-map-${lastUpdate?.getTime() || Date.now()}`,
        markers: allMarkers,
        center: [39.9334, 32.8597],
        zoom: 6,
        height: "400px"
      })
    ]),
    
    React.createElement("div", {
      key: "events-section",
      style: { marginTop: 16 }
    }, [
      React.createElement("div", {
        key: "events-header",
        style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }
      }, [
        React.createElement(Text, { key: "title", strong: true }, "📋 Son Olaylar"),
        React.createElement(Text, {
          key: "count",
          type: "secondary",
          style: { fontSize: '12px' }
        }, `📊 Toplam ${allEvents.length} olay`)
      ]),
      
      React.createElement("div", {
        key: "events-list",
        style: { 
          maxHeight: '200px', 
          overflowY: 'auto',
          border: '1px solid #f0f0f0',
          borderRadius: '6px',
          backgroundColor: '#fafafa'
        }
      }, React.createElement(List<EventData>, {
        size: "small",
        dataSource: allEvents,
        renderItem: (item: unknown) => {
          const event = item as EventData;
          return React.createElement(List.Item, {
            style: { 
              padding: '8px 12px',
              borderBottom: '1px solid #f0f0f0',
              backgroundColor: '#fff',
              margin: '2px',
              borderRadius: '4px'
            }
          }, React.createElement("div", {
            style: { width: '100%' }
          }, React.createElement("div", {
            style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }
          }, React.createElement("div", {
            style: { flex: 1 }
          }, [
            React.createElement(Space, {
              key: "event-header",
              size: "small"
            }, [
              getEventIcon(event.type),
              React.createElement(Text, {
                key: "title",
                strong: true,
                style: { fontSize: '13px' }
              }, event.title),
              React.createElement(Tag, {
                key: "severity",
                color: getSeverityColor(event.severity),
                style: { fontSize: '10px', padding: '0 4px', margin: 0 }
              }, getSeverityText(event.severity))
            ]),
            React.createElement("div", {
              key: "location",
              style: { marginTop: 4 }
            }, React.createElement(Text, {
              style: { fontSize: '11px', color: '#666' }
            }, `📍 ${event.location}`)),
            React.createElement("div", {
              key: "details",
              style: { marginTop: 2 }
            }, React.createElement(Space, {
              size: "small"
            }, [
              React.createElement(Text, {
                key: "date",
                style: { fontSize: '10px', color: '#999' }
              }, `🕐 ${new Date(event.date).toLocaleString('tr-TR')}`),
              React.createElement(Text, {
                key: "source",
                style: { fontSize: '10px', color: '#999' }
              }, `📡 ${event.source}`),
              event.type === 'earthquake' && event.data.magnitude && React.createElement(Text, {
                key: "magnitude",
                style: { fontSize: '10px', color: '#999' }
              }, `📊 M${event.data.magnitude} - 🏔️ ${event.data.depth}km`),
              event.type === 'fire' && event.data.confidence && React.createElement(Text, {
                key: "confidence",
                style: { fontSize: '10px', color: '#999' }
              }, `🎯 %${event.data.confidence} güven`)
            ]))
          ]))))
        }
      }))
    ]),
    
    allMarkers.length === 0 && !isLoading && React.createElement("div", {
      key: "no-data",
      style: { textAlign: 'center', padding: '40px', color: '#999' }
    }, React.createElement(Text, { type: "secondary" }, "Gösterilecek acil durum verisi bulunmuyor"))
  ]);
};

export default DashboardMap; 