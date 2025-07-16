"use client";

import React from "react";
import { Alert, Button } from "antd";
import { ReloadOutlined } from "@ant-design/icons";

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

interface MapboxMapProps {
  markers?: MarkerData[];
  earthquakes?: any[];
  tsunamis?: any[];
  loading?: boolean;
  onFallbackToLeaflet?: () => void;
}

const MapboxMap: React.FC<MapboxMapProps> = ({ 
  onFallbackToLeaflet
}) => {
  const handleFallbackToLeaflet = () => {
    if (onFallbackToLeaflet) {
      onFallbackToLeaflet();
    }
  };

  return (
    <div style={{ 
      height: "350px", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      background: "#f5f5f5",
      borderRadius: "8px"
    }}>
      <Alert
        message="Mapbox Yuklenemedi"
        description="Mapbox GL JS kutuphanesi yuklenemedi. Leaflet haritasini kullanin."
        type="warning"
        action={
          <div style={{ marginTop: "8px" }}>
            <Button size="small" type="primary" onClick={handleFallbackToLeaflet}>
              Leaflet Kullan
            </Button>
          </div>
        }
      />
    </div>
  );
};

export default MapboxMap;
