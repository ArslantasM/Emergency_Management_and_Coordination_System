"use client";

import React from "react";
import { Card } from "antd";

const DashboardMapSimple: React.FC = () => {
  return (
    <Card title="🗺️ Basit Harita Testi" style={{ minHeight: "400px" }}>
      <div style={{ 
        height: "300px", 
        background: "#f0f0f0", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        borderRadius: "8px"
      }}>
        <p>Harita bileşeni test ediliyor...</p>
      </div>
    </Card>
  );
};

export default DashboardMapSimple; 