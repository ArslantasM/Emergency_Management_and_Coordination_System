"use client";

import React from 'react';
import { Card } from 'antd';
import MapWidget from '../components/Dashboard/MapWidget';

export default function TestMapPage() {
  return (
    <div style={{ padding: '20px', height: '100vh' }}>
      <h1>Harita Test Sayfası</h1>
      <Card style={{ height: '80vh' }}>
        <MapWidget 
          adminMode={true}
          activeMapType="mapbox"
          enable3D={false}
          enableDrawing={true}
        />
      </Card>
    </div>
  );
} 