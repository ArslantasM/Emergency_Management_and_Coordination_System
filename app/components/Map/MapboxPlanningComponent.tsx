"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button, Card, Space, Switch, Tooltip, Upload, notification, Drawer, Select, Slider, Menu, Dropdown, ColorPicker, Input, Form, Modal } from 'antd';
import { 
  UploadOutlined, 
  EnvironmentOutlined, 
  ThunderboltOutlined,
  EyeOutlined,
  SettingOutlined,
  FullscreenOutlined,
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  LineOutlined,
  BorderOutlined,
  PushpinOutlined,
  ClearOutlined,
  CompassOutlined,
  MenuOutlined,
  DownOutlined
} from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';

// Mapbox'ı dinamik olarak yükle - sadece gerektiğinde
let mapboxgl: any = null;
let MapboxDraw: any = null;

interface MapboxPlanningComponentProps {
  center?: [number, number];
  zoom?: number;
  onLocationSelect?: (coordinates: [number, number]) => void;
  onGpxLoad?: (data: any) => void;
  onMapDataChange?: (data: any) => void;
  className?: string;
  height?: string;
  enableDrawing?: boolean;
}

// Çizim modu tipi
type DrawMode = 'point' | 'line' | 'polygon' | 'rectangle' | null;

// Not tipi
interface NoteItem {
  id: string;
  text: string;
  position: [number, number];
  color: string;
  geometryId?: string;
}

const MapboxPlanningComponent: React.FC<MapboxPlanningComponentProps> = ({
  center = [35.2433, 38.9637], // Türkiye merkezi
  zoom = 6,
  onLocationSelect,
  onGpxLoad,
  onMapDataChange,
  className = "",
  height = "600px",
  enableDrawing = true
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const drawRef = useRef<any>(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [is3DMode, setIs3DMode] = useState(false);
  const [isPitchMode, setIsPitchMode] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [pitch, setPitch] = useState(0);
  const [bearing, setBearing] = useState(0);
  const [drawMode, setDrawMode] = useState<DrawMode>(null);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<any[]>([]);
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [noteForm] = Form.useForm();
  const [currentGeometryId, setCurrentGeometryId] = useState<string>('');

  // Mapbox'ı dinamik olarak yükle
  const loadMapbox = useCallback(async () => {
    if (!mapboxgl) {
      try {
        // Mapbox GL JS'i dinamik olarak import et
        const mapboxModule = await import('mapbox-gl');
        mapboxgl = mapboxModule.default;
        
        // MapboxDraw'ı da dinamik olarak yükle
        const drawModule = await import('@mapbox/mapbox-gl-draw');
        MapboxDraw = drawModule.default;
        
        return true;
      } catch (error) {
        console.error('Mapbox yüklenirken hata:', error);
        notification.error({ message: 'Harita kütüphanesi yüklenemedi' });
        return false;
      }
    }
    return true;
  }, []);

  // Haritayı başlat
  const initializeMap = useCallback(async () => {
    if (!mapContainerRef.current || mapRef.current) return;

    const mapboxLoaded = await loadMapbox();
    if (!mapboxLoaded) return;

    // Mapbox access token 
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoibXVzdGFmYTMwMDMxOTc3IiwiYSI6ImNtODA5Y3o2bjByYnoyaXNhYWE5emI5Nm4ifQ.8sgve3SBViAq9Bp8pAdW0Q';

    // Haritayı oluştur
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12', // 3D için uygun stil
      center: center,
      zoom: zoom,
      pitch: 0,
      bearing: 0,
      antialias: true // 3D için anti-aliasing
    });

    // 3D terrain ekle
    map.on('style.load', () => {
      // Terrain kaynağını ekle
      map.addSource('mapbox-dem', {
        'type': 'raster-dem',
        'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
        'tileSize': 512,
        'maxzoom': 14
      });

      // Terrain layer'ı ekle
      map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });

      // Sky layer ekle (3D atmosfer efekti)
      map.addLayer({
        'id': 'sky',
        'type': 'sky',
        'paint': {
          'sky-type': 'atmosphere',
          'sky-atmosphere-sun': [0.0, 0.0],
          'sky-atmosphere-sun-intensity': 15
        }
      });

      setMapLoaded(true);
    });

    // Navigation kontrollerini ekle
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.addControl(new mapboxgl.FullscreenControl(), 'top-right');

    // Çizim kontrollerini ekle
    if (enableDrawing) {
      const draw = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
          polygon: true,
          trash: true,
          line_string: true,
          point: true
        },
        defaultMode: 'simple_select'
      });
      
      map.addControl(draw, 'top-left');
      drawRef.current = draw;

      // Çizim eventleri
      map.on('draw.create', onDrawCreate);
      map.on('draw.update', onDrawUpdate);
      map.on('draw.delete', onDrawDelete);
      map.on('draw.selectionchange', onSelectionChange);
    }

    // Harita tıklama eventi
    map.on('click', (e) => {
      if (onLocationSelect) {
        onLocationSelect([e.lngLat.lng, e.lngLat.lat]);
      }
    });

    mapRef.current = map;
  }, [center, zoom, loadMapbox, onLocationSelect, enableDrawing]);

  // Çizim eventi handlers
  const onDrawCreate = useCallback((e: any) => {
    console.log('Çizim oluşturuldu:', e.features);
    if (onMapDataChange) {
      onMapDataChange({
        type: 'create',
        features: e.features
      });
    }
    notification.success({ message: 'Çizim başarıyla oluşturuldu' });
  }, [onMapDataChange]);

  const onDrawUpdate = useCallback((e: any) => {
    console.log('Çizim güncellendi:', e.features);
    if (onMapDataChange) {
      onMapDataChange({
        type: 'update',
        features: e.features
      });
    }
  }, [onMapDataChange]);

  const onDrawDelete = useCallback((e: any) => {
    console.log('Çizim silindi:', e.features);
    if (onMapDataChange) {
      onMapDataChange({
        type: 'delete',
        features: e.features
      });
    }
    notification.success({ message: 'Çizim başarıyla silindi' });
  }, [onMapDataChange]);

  const onSelectionChange = useCallback((e: any) => {
    setSelectedFeatures(e.features);
  }, []);

  // Component mount edildiğinde haritayı başlat
  useEffect(() => {
    initializeMap();

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [initializeMap]);

  // 3D modunu aç/kapat
  const toggle3DMode = useCallback(() => {
    if (!mapRef.current) return;

    const newMode = !is3DMode;
    setIs3DMode(newMode);

    if (newMode) {
      // 3D görünüm
      mapRef.current.easeTo({
        pitch: 60,
        bearing: -17.6,
        duration: 1000
      });
    } else {
      // 2D görünüm
      mapRef.current.easeTo({
        pitch: 0,
        bearing: 0,
        duration: 1000
      });
    }
  }, [is3DMode]);

  // Pitch modunu aç/kapat
  const togglePitchMode = useCallback(() => {
    setIsPitchMode(!isPitchMode);
  }, [isPitchMode]);

  // Pitch değiştir
  const handlePitchChange = useCallback((value: number) => {
    setPitch(value);
    if (mapRef.current) {
      mapRef.current.setPitch(value);
    }
  }, []);

  // Bearing değiştir
  const handleBearingChange = useCallback((value: number) => {
    setBearing(value);
    if (mapRef.current) {
      mapRef.current.setBearing(value);
    }
  }, []);

  // Çizim modunu değiştir
  const changeDrawMode = useCallback((mode: DrawMode) => {
    if (!drawRef.current) return;

    setDrawMode(mode);
    
    switch (mode) {
      case 'point':
        drawRef.current.changeMode('draw_point');
        break;
      case 'line':
        drawRef.current.changeMode('draw_line_string');
        break;
      case 'polygon':
        drawRef.current.changeMode('draw_polygon');
        break;
      case 'rectangle':
        drawRef.current.changeMode('draw_polygon');
        break;
      default:
        drawRef.current.changeMode('simple_select');
    }
  }, []);

  // Tüm çizimleri temizle
  const clearDrawings = useCallback(() => {
    if (!drawRef.current) return;
    
    drawRef.current.deleteAll();
    setNotes([]);
    notification.success({ message: 'Tüm çizimler temizlendi' });
  }, []);

  // GPX dosyası yükle
  const handleGpxUpload = useCallback((file: any) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const gpxData = e.target?.result as string;
        
        // GPX'i GeoJSON'a çevir (basit parser)
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(gpxData, 'text/xml');
        
        // Track noktalarını al
        const trackPoints = xmlDoc.querySelectorAll('trkpt');
        const coordinates: [number, number][] = [];
        
        trackPoints.forEach(point => {
          const lat = parseFloat(point.getAttribute('lat') || '0');
          const lon = parseFloat(point.getAttribute('lon') || '0');
          coordinates.push([lon, lat]);
        });

        if (coordinates.length > 0) {
          // Çizgiyi haritaya ekle
          const lineFeature = {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: coordinates
            },
            properties: {
              name: file.name
            }
          };

          if (drawRef.current) {
            drawRef.current.add(lineFeature);
          }

          // Haritayı GPX rotasına odakla
          if (mapRef.current) {
            const bounds = new mapboxgl.LngLatBounds();
            coordinates.forEach(coord => bounds.extend(coord));
            mapRef.current.fitBounds(bounds, { padding: 50 });
          }

          if (onGpxLoad) {
            onGpxLoad(lineFeature);
          }

          notification.success({ message: `GPX dosyası başarıyla yüklendi (${coordinates.length} nokta)` });
        } else {
          notification.error({ message: 'GPX dosyasında geçerli track noktaları bulunamadı' });
        }
      } catch (error) {
        console.error('GPX yükleme hatası:', error);
        notification.error({ message: 'GPX dosyası yüklenirken hata oluştu' });
      }
    };
    
    reader.readAsText(file);
    return false; // Upload'ı engelle
  }, [onGpxLoad]);

  // Not ekleme
  const addNoteToGeometry = useCallback((values: any) => {
    const noteId = Date.now().toString();
    const newNote: NoteItem = {
      id: noteId,
      text: values.noteText,
      color: values.color || '#ff0000',
      position: [0, 0], // Geometrinin merkezi hesaplanacak
      geometryId: currentGeometryId
    };

    setNotes(prev => [...prev, newNote]);
    setNoteModalVisible(false);
    noteForm.resetFields();
    notification.success({ message: 'Not başarıyla eklendi' });
  }, [currentGeometryId, noteForm]);

  // Çizim araçları menüsü
  const drawingToolsMenu = {
    items: [
      {
        key: 'point',
        icon: <PushpinOutlined />,
        label: 'Nokta Çiz',
        onClick: () => changeDrawMode('point')
      },
      {
        key: 'line',
        icon: <LineOutlined />,
        label: 'Çizgi Çiz',
        onClick: () => changeDrawMode('line')
      },
      {
        key: 'polygon',
        icon: <BorderOutlined />,
        label: 'Alan Çiz',
        onClick: () => changeDrawMode('polygon')
      },
      {
        type: 'divider'
      },
      {
        key: 'clear',
        icon: <ClearOutlined />,
        label: 'Temizle',
        onClick: clearDrawings
      }
    ]
  };

  return (
    <div className={`relative ${className}`} style={{ height }}>
      {/* Harita konteyner */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-full rounded-lg overflow-hidden"
        style={{ height: '100%' }}
      />
      
      {/* Yükleme göstergesi */}
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Harita yükleniyor...</p>
          </div>
        </div>
      )}

      {/* Kontrol paneli */}
      <Card 
        className="absolute top-4 left-4 z-10 shadow-lg"
        bodyStyle={{ padding: '12px' }}
      >
        <Space direction="vertical" size="small">
          {/* 3D kontrolleri */}
          <Space>
            <Tooltip title="3D Görünüm">
              <Switch 
                checked={is3DMode}
                onChange={toggle3DMode}
                checkedChildren="3D"
                unCheckedChildren="2D"
              />
            </Tooltip>
            <Tooltip title="Ayarlar">
              <Button 
                icon={<SettingOutlined />}
                onClick={() => setSettingsVisible(true)}
                size="small"
              />
            </Tooltip>
          </Space>

          {/* Çizim araçları */}
          {enableDrawing && (
            <Space>
              <Dropdown menu={drawingToolsMenu} trigger={['click']}>
                <Button size="small">
                  <EditOutlined /> Çizim Araçları <DownOutlined />
                </Button>
              </Dropdown>
              
              <Upload
                accept=".gpx"
                beforeUpload={handleGpxUpload}
                showUploadList={false}
              >
                <Tooltip title="GPX Dosyası Yükle">
                  <Button icon={<UploadOutlined />} size="small">
                    GPX
                  </Button>
                </Tooltip>
              </Upload>
            </Space>
          )}
        </Space>
      </Card>

      {/* Ayarlar drawer */}
      <Drawer
        title="Harita Ayarları"
        placement="right"
        onClose={() => setSettingsVisible(false)}
        open={settingsVisible}
        width={300}
      >
        <Space direction="vertical" className="w-full">
          <div>
            <label className="block text-sm font-medium mb-2">Pitch (Eğim)</label>
            <Slider
              min={0}
              max={60}
              value={pitch}
              onChange={handlePitchChange}
              marks={{ 0: '0°', 30: '30°', 60: '60°' }}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Bearing (Dönüş)</label>
            <Slider
              min={0}
              max={360}
              value={bearing}
              onChange={handleBearingChange}
              marks={{ 0: 'K', 90: 'D', 180: 'G', 270: 'B' }}
            />
          </div>

          <Button 
            block 
            onClick={() => {
              setPitch(0);
              setBearing(0);
              handlePitchChange(0);
              handleBearingChange(0);
            }}
          >
            Sıfırla
          </Button>
        </Space>
      </Drawer>

      {/* Not ekleme modal */}
      <Modal
        title="Geometriye Not Ekle"
        open={noteModalVisible}
        onCancel={() => setNoteModalVisible(false)}
        footer={null}
      >
        <Form form={noteForm} onFinish={addNoteToGeometry} layout="vertical">
          <Form.Item
            name="noteText"
            label="Not Metni"
            rules={[{ required: true, message: 'Not metni gerekli!' }]}
          >
            <Input.TextArea rows={3} placeholder="Not metnini girin..." />
          </Form.Item>
          
          <Form.Item name="color" label="Renk" initialValue="#ff0000">
            <ColorPicker />
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Kaydet
              </Button>
              <Button onClick={() => setNoteModalVisible(false)}>
                İptal
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MapboxPlanningComponent; 