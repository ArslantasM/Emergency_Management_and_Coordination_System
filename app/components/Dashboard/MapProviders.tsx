"use client";

import React from 'react';
import { Radio, Tooltip, Space, Divider } from 'antd';
import { GlobalOutlined, CompassOutlined } from '@ant-design/icons';

// Prop tiplerini dışa aktaralım
export interface MapProvidersProps {
  currentProvider: string;
  onProviderChange: (provider: string) => void;
  is3DEnabled: boolean;
  onToggle3D: (enabled: boolean) => void;
  isAdmin: boolean;
}

const MapProviders: React.FC<MapProvidersProps> = ({
  currentProvider,
  onProviderChange,
  is3DEnabled,
  onToggle3D,
  isAdmin
}) => {
  return (
    <div className="bg-white p-2 m-2 rounded-md shadow-md">
      <div className="flex items-center justify-between">
        <Space>
          <Tooltip title="Harita Sağlayıcıları">
            <GlobalOutlined />
          </Tooltip>
          <Radio.Group 
            value={currentProvider} 
            onChange={(e) => onProviderChange(e.target.value)}
            size="small"
          >
            <Radio.Button value="openstreet">OpenStreet</Radio.Button>
            <Radio.Button value="google" disabled={!isAdmin}>Google</Radio.Button>
            <Radio.Button value="hgm" disabled={!isAdmin}>HGM</Radio.Button>
            <Radio.Button value="mapbox" disabled={!isAdmin}>Mapbox</Radio.Button>
          </Radio.Group>
        </Space>
        
        <Divider type="vertical" className="h-6" />
        
        <Space>
          <Tooltip title="3D Modu">
            <CompassOutlined />
          </Tooltip>
          <Radio.Group 
            value={is3DEnabled ? "3d" : "2d"} 
            onChange={(e) => onToggle3D(e.target.value === "3d")}
            size="small"
            disabled={!isAdmin}
          >
            <Radio.Button value="2d">2D</Radio.Button>
            <Radio.Button value="3d">3D</Radio.Button>
          </Radio.Group>
        </Space>
      </div>
    </div>
  );
};

export default MapProviders; 