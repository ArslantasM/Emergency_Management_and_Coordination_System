"use client";

import React from "react";
import { Card } from "antd";
import dynamic from "next/dynamic";

const ImprovedMap = dynamic(() => import("../dashboard/components/ImprovedMap"), { 
  ssr: false,
  loading: () => <div style={{ height: "350px", display: "flex", justifyContent: "center", alignItems: "center" }}>Yükleniyor...</div>
});

const TestImprovedMapPage = () => {
  const testMarkers = [
    {
      id: "test_1",
      lat: 39.9334,
      lng: 32.8597,
      type: "earthquake" as const,
      title: "Test Deprem",
      description: "Ankara - Test verisi",
      color: "#ff9900",
      data: { magnitude: 4.2, depth: 10, source: "TEST" }
    },
    {
      id: "test_2", 
      lat: 41.0082,
      lng: 28.9784,
      type: "fire" as const,
      title: "Test Yangın",
      description: "İstanbul - Test verisi",
      color: "#ff0000",
      data: { confidence: 85, frp: 45.2 }
    },
    {
      id: "test_3",
      lat: 38.7437,
      lng: 35.4781,
      type: "tsunami" as const,
      title: "Test Tsunami",
      description: "Kayseri - Test verisi",
      color: "#0066ff",
      data: { waveHeight: 2.5 }
    }
  ];

  return (
    <div style={{ padding: "24px" }}>
      <Card title="🗺️ Geliştirilmiş Harita Testi" style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ marginBottom: "16px" }}>
          <p><strong>Test Özellikleri:</strong></p>
          <ul>
            <li>✅ Retry mekanizması (3 farklı CDN)</li>
            <li>✅ 25 saniye timeout</li>
            <li>✅ Basit harita fallback</li>
            <li>✅ Geliştirilmiş error handling</li>
            <li>✅ {testMarkers.length} test marker</li>
          </ul>
        </div>
        
        <ImprovedMap 
          markers={testMarkers}
          earthquakes={[]}
          tsunamis={[]}
          loading={false}
        />
        
        <div style={{ marginTop: "16px", fontSize: "12px", color: "#666" }}>
          <p><strong>Beklenen Davranış:</strong></p>
          <p>1. Harita 25 saniye içinde yüklenmeli</p>
          <p>2. Eğer yüklenemezse alternatif CDN denenmeli</p>
          <p>3. Tüm CDN'ler başarısız olursa basit harita gösterilmeli</p>
          <p>4. 3 test marker görünmeli (Ankara, İstanbul, Kayseri)</p>
        </div>
      </Card>
    </div>
  );
};

export default TestImprovedMapPage; 