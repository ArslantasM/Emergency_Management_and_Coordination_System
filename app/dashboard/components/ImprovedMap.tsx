"use client";

import React, { useRef, useEffect, useState } from "react";
import { Spin } from "antd";

interface MarkerData {
  id: string;
  lat: number;
  lng: number;
  type: "earthquake" | "fire" | "tsunami" | "incident";
  title: string;
  description: string;
  color: string;
  icon?: string;
  data?: any;
}

interface ImprovedMapProps {
  markers?: MarkerData[];
  earthquakes?: any[];
  tsunamis?: any[];
  loading?: boolean;
}

const ImprovedMap: React.FC<ImprovedMapProps> = ({ 
  markers = [], 
  earthquakes = [], 
  tsunamis = [], 
  loading 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>("Başlangıç...");
  const [retryCount, setRetryCount] = useState(0);

  const allMarkers = [
    ...markers,
    ...earthquakes.map(eq => ({
      id: eq.id,
      lat: eq.latitude,
      lng: eq.longitude,
      type: "earthquake" as const,
      title: `${eq.magnitude} büyüklüğünde deprem`,
      description: `${eq.location} - ${new Date(eq.date).toLocaleDateString("tr-TR")}`,
      color: eq.magnitude >= 6.0 ? "#ff0000" : eq.magnitude >= 5.0 ? "#ff4d00" : eq.magnitude >= 4.0 ? "#ff9900" : "#ffcc00",
      data: eq
    })),
    ...tsunamis.map(ts => ({
      id: ts.id,
      lat: ts.latitude,
      lng: ts.longitude,
      type: "tsunami" as const,
      title: "Tsunami Uyarısı",
      description: `${ts.status} - ${ts.severity}`,
      color: "#ff0000",
      data: ts
    }))
  ];

  // Leaflet kütüphanesini yükle - geliştirilmiş retry mekanizması
  useEffect(() => {
    if (typeof window === "undefined") return;

    const leafletSources = [
      {
        css: "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
        js: "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js",
        name: "unpkg"
      },
      {
        css: "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css",
        js: "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js", 
        name: "jsdelivr"
      },
      {
        css: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css",
        js: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js",
        name: "cloudflare"
      }
    ];

    const loadLeaflet = async (sourceIndex = 0) => {
      try {
        const source = leafletSources[sourceIndex];
        console.log(`🗺️ Leaflet yükleme başladı (${source.name}, deneme ${retryCount + 1})...`);
        setDebugInfo(`CSS yükleniyor (${source.name})...`);
        
        // CSS'i yükle
        if (!document.getElementById("leaflet-css")) {
          console.log(`📄 CSS dosyası yükleniyor (${source.name})...`);
          const css = document.createElement("link");
          css.id = "leaflet-css";
          css.rel = "stylesheet";
          css.href = source.css;
          css.crossOrigin = "";
          css.integrity = "";
          document.head.appendChild(css);
          
          // CSS yüklenmesini bekle
          await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              console.warn("⚠️ CSS yükleme timeout, devam ediliyor...");
              resolve(true);
            }, 8000);
            
            css.onload = () => {
              clearTimeout(timeout);
              console.log("✅ CSS yüklendi");
              resolve(true);
            };
            
            css.onerror = () => {
              clearTimeout(timeout);
              console.warn("⚠️ CSS yüklenemedi, devam ediliyor...");
              resolve(true); // CSS hatası fatal değil
            };
          });
        }

        setDebugInfo(`JavaScript kütüphanesi yükleniyor (${source.name})...`);
        
        // JS'i yükle
        if (!(window as any).L) {
          console.log(`📦 JavaScript dosyası yükleniyor (${source.name})...`);
          const script = document.createElement("script");
          script.src = source.js;
          script.crossOrigin = "";
          document.head.appendChild(script);
          
          await new Promise((resolve, reject) => {
            let timeoutId: NodeJS.Timeout;
            
            script.onload = () => {
              clearTimeout(timeoutId);
              console.log(`✅ Leaflet başarıyla yüklendi (${source.name})!`);
              setDebugInfo("Leaflet yüklendi!");
              setLeafletLoaded(true);
              setRetryCount(0);
              resolve(true);
            };
            
            script.onerror = () => {
              clearTimeout(timeoutId);
              console.error(`❌ Leaflet yüklenemedi (${source.name})!`);
              reject(new Error(`Script yüklenemedi (${source.name})`));
            };
            
            // 25 saniye timeout
            timeoutId = setTimeout(() => {
              console.error(`⏰ Leaflet yükleme timeout (25s) - ${source.name}!`);
              reject(new Error(`Timeout - ${source.name}`));
            }, 25000);
          });
        } else {
          console.log("✅ Leaflet zaten mevcut!");
          setDebugInfo("Leaflet zaten mevcut!");
          setLeafletLoaded(true);
        }
        
      } catch (error: any) {
        console.error(`💥 Leaflet yükleme hatası (${leafletSources[sourceIndex].name}):`, error);
        
        // Alternatif CDN dene
        if (sourceIndex < leafletSources.length - 1) {
          console.log(`🔄 Alternatif CDN deneniyor (${leafletSources[sourceIndex + 1].name})...`);
          setDebugInfo(`Alternatif CDN deneniyor (${leafletSources[sourceIndex + 1].name})...`);
          
          // Önceki CSS'i temizle
          const oldCss = document.getElementById("leaflet-css");
          if (oldCss) {
            oldCss.remove();
          }
          
          // Önceki script'i temizle
          const oldScripts = document.querySelectorAll('script[src*="leaflet"]');
          oldScripts.forEach(script => script.remove());
          
          setRetryCount(prev => prev + 1);
          return loadLeaflet(sourceIndex + 1);
        } else {
          // Tüm CDN'ler denendi, basit harita göster
          console.log("🎯 Basit harita moduna geçiliyor...");
          setMapError("Harita kütüphanesi yüklenemedi - Basit görünüm aktif");
          setDebugInfo("Basit harita modu aktif");
        }
      }
    };

    loadLeaflet();
  }, []);

  // Haritayı oluştur
  useEffect(() => {
    if (!leafletLoaded || !mapRef.current || typeof window === "undefined") return;

    let map: any;
    let isDestroyed = false;

    const createMap = async () => {
      try {
        const L = (window as any).L;
        
        if (!L) {
          throw new Error("Leaflet mevcut değil");
        }

        // Eski haritayı temizle
        if (map) {
          try {
            map.remove();
          } catch (e) {
            console.log("Eski harita temizleme:", e);
          }
        }

        console.log("🗺️ Harita oluşturuluyor...");
        setDebugInfo("Harita oluşturuluyor...");

        // Yeni harita oluştur
        map = L.map(mapRef.current, {
          zoomControl: true,
          attributionControl: true,
          preferCanvas: true
        }).setView([39.9334, 32.8597], 6);

        // Tile layer ekle
        const tileLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap",
          maxZoom: 18,
          detectRetina: true
        });
        
        tileLayer.addTo(map);
        console.log("🗺️ Tile layer eklendi");

        // Markerları ekle
        let markerCount = 0;
        allMarkers.forEach((marker) => {
          if (isDestroyed) return;
          
          try {
            const markerOptions = {
              color: marker.color,
              weight: 2,
              opacity: 0.8,
              fillOpacity: 0.6,
              fillColor: marker.color
            };

            let radius = 8;
            switch (marker.type) {
              case "earthquake":
                radius = Math.max((marker.data?.magnitude || 4.0) * 2, 6);
                break;
              case "fire":
                radius = 8;
                break;
              case "tsunami":
                radius = 15;
                break;
              default:
                radius = 10;
            }

            const markerElement = L.circleMarker([marker.lat, marker.lng], {
              ...markerOptions,
              radius: radius
            });

            if (markerElement && !isDestroyed) {
              markerElement.addTo(map);
              markerCount++;
              
              const popupContent = `
                <div style="min-width: 200px; font-family: Arial, sans-serif;">
                  <strong style="color: ${marker.color};">${marker.title}</strong><br>
                  <div style="margin: 8px 0;">${marker.description}</div>
                  ${marker.type === "earthquake" && marker.data ? `
                    <div style="font-size: 12px; color: #666;">
                      Büyüklük: ${marker.data.magnitude}<br>
                      Derinlik: ${marker.data.depth} km<br>
                      Kaynak: ${marker.data.source}
                    </div>
                  ` : ""}
                </div>
              `;
              
              markerElement.bindPopup(popupContent);
            }
          } catch (markerError) {
            console.warn("Marker ekleme hatası:", markerError);
          }
        });

        console.log(`✅ ${markerCount} marker eklendi`);

        if (!isDestroyed) {
          setMapReady(true);
          setMapError(null);
          setDebugInfo(`Harita hazır (${markerCount} marker)`);
        }

      } catch (error) {
        console.error("Harita oluşturma hatası:", error);
        if (!isDestroyed) {
          setMapError("Harita oluşturulamadı");
        }
      }
    };

    const timer = setTimeout(createMap, 200);

    return () => {
      isDestroyed = true;
      clearTimeout(timer);
      if (map) {
        try {
          map.remove();
        } catch (e) {
          console.log("Harita temizleme hatası:", e);
        }
      }
    };
  }, [leafletLoaded, allMarkers.length]);

  // Basit harita fallback
  const renderSimpleMap = () => (
    <div style={{ 
      height: "350px", 
      width: "100%",
      background: "linear-gradient(180deg, #87CEEB 0%, #98FB98 100%)",
      borderRadius: "8px",
      border: "1px solid #d9d9d9",
      position: "relative",
      overflow: "hidden"
    }}>
      <div style={{
        position: "absolute",
        top: "10px",
        left: "10px",
        background: "rgba(255,255,255,0.9)",
        padding: "8px 12px",
        borderRadius: "4px",
        fontSize: "12px",
        color: "#666"
      }}>
        📍 {allMarkers.length} konum
      </div>
      
      <div style={{
        position: "absolute",
        bottom: "10px",
        right: "10px",
        background: "rgba(255,255,255,0.9)",
        padding: "4px 8px",
        borderRadius: "4px",
        fontSize: "10px",
        color: "#999"
      }}>
        Basit Harita Modu
      </div>

      {allMarkers.slice(0, 10).map((marker, index) => (
        <div
          key={marker.id}
          style={{
            position: "absolute",
            left: `${20 + (index % 5) * 60}px`,
            top: `${50 + Math.floor(index / 5) * 80}px`,
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            backgroundColor: marker.color,
            border: "2px solid white",
            boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
            cursor: "pointer"
          }}
          title={marker.title}
        />
      ))}
    </div>
  );

  if (loading) {
    return (
      <div style={{ 
        height: "350px", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        background: "#f5f5f5",
        borderRadius: "8px"
      }}>
        <div style={{ textAlign: "center" }}>
          <Spin size="large" />
          <p style={{ marginTop: "16px", color: "#666" }}>Harita Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (mapError && !leafletLoaded) {
    return renderSimpleMap();
  }

  if (!leafletLoaded || !mapReady) {
    return (
      <div style={{ 
        height: "350px", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        background: "#f5f5f5",
        borderRadius: "8px"
      }}>
        <div style={{ textAlign: "center" }}>
          <Spin size="large" />
          <p style={{ marginTop: "16px", color: "#666" }}>
            {debugInfo}
          </p>
          <p style={{ fontSize: "12px", color: "#999" }}>
            Markerlar: {allMarkers.length} adet
          </p>
          {retryCount > 0 && (
            <p style={{ fontSize: "10px", color: "#ff4d4f" }}>
              Deneme: {retryCount + 1}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={mapRef} 
      style={{ 
        height: "350px", 
        width: "100%", 
        borderRadius: "8px",
        border: "1px solid #d9d9d9"
      }} 
    />
  );
};

export default ImprovedMap; 