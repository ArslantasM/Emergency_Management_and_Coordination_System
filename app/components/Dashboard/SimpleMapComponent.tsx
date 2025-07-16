"use client";

import React, { useState } from 'react';
import { Card, Spin, Button, Tag, Tooltip } from 'antd';
import { EnvironmentOutlined, InfoCircleOutlined } from '@ant-design/icons';

// Harita uyarıları tipini tanımlama
interface EmergencyAlert {
  id: number;
  title: string;
  location: number[];
  type: string;
  severity: string;
}

interface MapComponentProps {
  emergencyAlerts: EmergencyAlert[];
  adminMode: boolean;
}

// Type için tag rengi
const getTypeTag = (type: string) => {
  switch(type) {
    case 'earthquake':
      return <Tag color="purple">Deprem</Tag>;
    case 'flood':
      return <Tag color="blue">Sel</Tag>;
    case 'fire':
      return <Tag color="volcano">Yangın</Tag>;
    case 'accident':
      return <Tag color="cyan">Kaza</Tag>;
    default:
      return <Tag>Diğer</Tag>;
  }
};

// Severity için tag rengi
const getSeverityTag = (severity: string) => {
  switch(severity) {
    case 'high':
      return <Tag color="red">Yüksek</Tag>;
    case 'medium':
      return <Tag color="orange">Orta</Tag>;
    case 'low':
      return <Tag color="green">Düşük</Tag>;
    default:
      return <Tag>Belirsiz</Tag>;
  }
};

const SimpleMapComponent: React.FC<MapComponentProps> = ({ emergencyAlerts = [], adminMode = false }) => {
  const [selectedAlert, setSelectedAlert] = useState<EmergencyAlert | null>(null);
  
  return (
    <div className="relative w-full h-full bg-gray-100 rounded-md overflow-hidden">
      {/* Harita başlığı */}
      <div className="p-4 bg-white shadow-sm z-10">
        <h3 className="text-lg font-medium">
          Acil Durum Haritası{" "}
          {adminMode && <Tag color="blue">Yönetici Modu</Tag>}
        </h3>
      </div>
      
      {/* Simüle edilmiş harita alanı */}
      <div className="p-5 bg-blue-50 h-[calc(100%-60px)] flex flex-col">
        <div className="flex items-center justify-center h-full">
          <div className="text-center mb-8">
            <EnvironmentOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
            <h3 className="text-lg font-medium mb-2">Harita Görüntüleyici</h3>
            <p className="text-gray-500 mb-4">
              Şu anda OpenStreetMap ve Google Maps entegrasyonu hazırlanıyor. 
            </p>
            <Button type="primary" icon={<EnvironmentOutlined />}>Harita Sağlayıcısını Değiştir</Button>
          </div>
        </div>
        
        {/* Acil Durum Noktaları Listesi */}
        <div className="bg-white p-4 rounded-md shadow mt-auto">
          <h4 className="font-medium mb-3">Acil Durum Noktaları ({emergencyAlerts.length})</h4>
          <div className="max-h-40 overflow-auto">
            {emergencyAlerts.map((alert) => (
              <div 
                key={alert.id}
                className={`mb-2 p-3 border rounded-md cursor-pointer transition-colors ${
                  selectedAlert?.id === alert.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedAlert(alert)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{alert.title}</div>
                    <div className="text-xs text-gray-500">
                      Konum: {alert.location[0].toFixed(4)}, {alert.location[1].toFixed(4)}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {getTypeTag(alert.type)}
                    {getSeverityTag(alert.severity)}
                  </div>
                </div>
              </div>
            ))}
            
            {emergencyAlerts.length === 0 && (
              <div className="text-center p-4 text-gray-500">
                Acil durum noktası bulunmuyor
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Bilgi notu */}
      <div className="absolute bottom-2 right-2">
        <Tooltip title="Harita servisi şu anda hazırlanıyor. Yakında kullanıma sunulacak.">
          <InfoCircleOutlined className="text-gray-500" />
        </Tooltip>
      </div>
    </div>
  );
};

export default SimpleMapComponent; 