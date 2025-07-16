"use client";

import React from 'react';
import { Radio, Space, Typography, Tooltip } from 'antd';
import {
  EnvironmentOutlined,
  AimOutlined,
  PushpinOutlined,
  FireOutlined,
  AlertOutlined,
  MedicineBoxOutlined,
  HomeOutlined,
  ShopOutlined,
  CarOutlined,
  TeamOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

// Marker tipi ve veri yapısı
export interface MarkerIconType {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
}

// Tüm kullanılabilir marker simgelerini tanımla
export const markerIcons: MarkerIconType[] = [
  // Genel markörler
  { id: 'default', name: 'Varsayılan', icon: <EnvironmentOutlined />, color: '#1890ff' },
  { id: 'target', name: 'Hedef', icon: <AimOutlined />, color: '#722ed1' },
  { id: 'pushpin', name: 'İğne', icon: <PushpinOutlined />, color: '#eb2f96' },
  
  // Acil durum markörler
  { id: 'fire', name: 'Yangın', icon: <FireOutlined />, color: '#f5222d' },
  { id: 'alert', name: 'Alarm', icon: <AlertOutlined />, color: '#fa8c16' },
  { id: 'medical', name: 'Sağlık', icon: <MedicineBoxOutlined />, color: '#13c2c2' },
  { id: 'evacuation', name: 'Tahliye', icon: <WarningOutlined />, color: '#faad14' },
  
  // Bina ve tesis markörler
  { id: 'building', name: 'Bina', icon: <HomeOutlined />, color: '#52c41a' },
  { id: 'facility', name: 'Tesis', icon: <ShopOutlined />, color: '#1890ff' },
  
  // Lojistik markörler
  { id: 'vehicle', name: 'Araç', icon: <CarOutlined />, color: '#2f54eb' },
  { id: 'team', name: 'Ekip', icon: <TeamOutlined />, color: '#faad14' },
  
  // Durum markörler
  { id: 'warning', name: 'Uyarı', icon: <ExclamationCircleOutlined />, color: '#faad14' },
  { id: 'info', name: 'Bilgi', icon: <InfoCircleOutlined />, color: '#1890ff' },
  { id: 'success', name: 'Başarılı', icon: <CheckCircleOutlined />, color: '#52c41a' },
  { id: 'error', name: 'Hata', icon: <CloseCircleOutlined />, color: '#f5222d' },
];

// Marker gruplarını tanımla
export const markerGroups = [
  { id: 'general', name: 'Genel', icons: ['default', 'target', 'pushpin'] },
  { id: 'emergency', name: 'Acil Durum', icons: ['fire', 'alert', 'medical', 'evacuation'] },
  { id: 'buildings', name: 'Binalar', icons: ['building', 'facility'] },
  { id: 'logistics', name: 'Lojistik', icons: ['vehicle', 'team'] },
  { id: 'status', name: 'Durum', icons: ['warning', 'info', 'success', 'error'] },
];

// İcon seçici bileşeni
interface LocationMarkerIconProps {
  value?: string;
  onChange?: (value: string) => void;
}

const LocationMarkerIcon: React.FC<LocationMarkerIconProps> = ({ value = 'default', onChange }) => {
  const handleChange = (e: any) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  // Belirli bir id'ye sahip marker'ı bul
  const getMarkerById = (id: string) => {
    return markerIcons.find(marker => marker.id === id) || markerIcons[0];
  };

  // Seçili marker'ı bul
  const selectedMarker = getMarkerById(value);

  return (
    <div className="location-marker-selector">
      <div className="mb-2">
        <Text strong>Konum İşaretleyici:</Text>{' '}
        <Text style={{ color: selectedMarker.color }}>
          {selectedMarker.icon} {selectedMarker.name}
        </Text>
      </div>
      
      <Radio.Group value={value} onChange={handleChange} className="marker-radio-group">
        {markerGroups.map(group => (
          <div key={group.id} className="mb-3">
            <Text strong className="text-gray-500 text-sm mb-1 block">{group.name}</Text>
            <Space wrap>
              {group.icons.map(iconId => {
                const marker = getMarkerById(iconId);
                return (
                  <Tooltip key={marker.id} title={marker.name}>
                    <Radio.Button 
                      value={marker.id} 
                      style={{ 
                        color: marker.id === value ? marker.color : undefined,
                        borderColor: marker.id === value ? marker.color : undefined,
                      }}
                    >
                      {marker.icon}
                    </Radio.Button>
                  </Tooltip>
                );
              })}
            </Space>
          </div>
        ))}
      </Radio.Group>
    </div>
  );
};

export default LocationMarkerIcon; 