"use client";

import React, { useState, useEffect } from "react";
import { Card, Spin, Button, Space, Typography, Badge, Alert } from "antd";
import { ReloadOutlined } from "@ant-design/icons";

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

interface DashboardMapProps {
  earthquakes?: EarthquakeData[];
  tsunamis?: any[];
  fires?: any[];
  loading?: boolean;
  wsConnected?: boolean;
}

const DashboardMapFixed: React.FC<DashboardMapProps> = ({ 
  earthquakes = [], 
  loading = false
}) => {
  const [isClient, setIsClient] = useState(false);
  const [liveEarthquakes, setLiveEarthquakes] = useState<EarthquakeData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/earthquakes');
      if (!response.ok) {
        throw new Error('Deprem verileri alınamadı');
      }
      
      const data = await response.json();
      if (data.features && Array.isArray(data.features)) {
        const earthquakeData: EarthquakeData[] = data.features.map((feature: any) => ({
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
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isClient) {
    return (
      <Card title="🗺️ Canlı Acil Durum Haritası" style={{ minHeight: "600px" }}>
        <div style={{ height: "350px", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  const getStatusBadge = () => {
    if (liveEarthquakes.length > 0) {
      return <Badge status="processing" text="Canlı Veri" />;
    } else {
      return <Badge status="default" text="Veri Yok" />;
    }
  };

  return (
    <Card 
      title={
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>🗺️ Canlı Acil Durum Haritası</span>
          <Space>
            {getStatusBadge()}
            <Button 
              type="text" 
              icon={<ReloadOutlined spin={isLoading} />}
              onClick={fetchData}
              loading={isLoading}
              size="small"
            >
              🔄 Yenile
            </Button>
          </Space>
        </div>
      }
      style={{ minHeight: "600px" }}
    >
      {error && (
        <Alert
          message="Veri Hatası"
          description={error}
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          action={
            <Button size="small" onClick={fetchData}>
              Tekrar Dene
            </Button>
          }
        />
      )}
      
      <div style={{ 
        height: "400px", 
        background: "#f0f2f5", 
        display: "flex", 
        flexDirection: "column",
        alignItems: "center", 
        justifyContent: "center",
        borderRadius: "8px",
        border: "2px dashed #d9d9d9"
      }}>
        <div style={{ textAlign: "center", padding: "20px" }}>
          <h3>🗺️ Harita Yükleniyor</h3>
          <p>Deprem verileri: {liveEarthquakes.length} adet</p>
          <p>Prop verileri: {earthquakes.length} adet</p>
          {isLoading && <Spin />}
        </div>
      </div>
    </Card>
  );
};

export default DashboardMapFixed; 