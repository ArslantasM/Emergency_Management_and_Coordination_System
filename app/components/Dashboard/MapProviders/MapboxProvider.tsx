"use client";

import React, { useRef, useEffect, useState, Suspense, lazy } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import * as turf from '@turf/turf';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { Spin, Button, Tag, Select, Tooltip, Card, Modal, Form, Input, Space, Drawer, notification, Radio, ColorPicker, Popover, List, Typography, Checkbox, Switch, Tabs, Upload, message, InputNumber, Menu, Dropdown, Collapse, Alert, Divider } from 'antd';
import { 
  EnvironmentOutlined, CloudOutlined, ThunderboltOutlined, EyeOutlined, BorderOutlined, 
  FullscreenOutlined, FullscreenExitOutlined, EditOutlined, DeleteOutlined, SaveOutlined, 
  LineOutlined, UserOutlined, TeamOutlined, AreaChartOutlined, PushpinOutlined, 
  CommentOutlined, HighlightOutlined, FileTextOutlined, PlusOutlined, RestOutlined, 
  ColumnHeightOutlined, BlockOutlined, HomeOutlined, MedicineBoxOutlined, ShoppingOutlined, 
  ExperimentOutlined, WifiOutlined, SolutionOutlined, CarOutlined, ManOutlined, RocketOutlined, 
  ClockCircleOutlined, AlertOutlined, AimOutlined, NodeIndexOutlined, MenuOutlined, GlobalOutlined,
  FireOutlined, UploadOutlined, MinusOutlined, CompassOutlined,
  PictureOutlined, BorderOuterOutlined, ClearOutlined, DatabaseOutlined, FileExcelOutlined, ApartmentOutlined, 
  ReadOutlined, ToolOutlined } from '@ant-design/icons';
import axios from 'axios';

// Mapbox dinamik yüklemeleri - performans optimizasyonu
let mapboxgl: any = null;
let MapboxDraw: any = null;

// Mapbox token ayarı - environment variable'dan al
const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 'pk.eyJ1IjoibXVzdGFmYTMwMDMxOTc3IiwiYSI6ImNtODA5Y3o2bjByYnoyaXNhYWE5emI5Nm4ifQ.8sgve3SBViAq9Bp8pAdW0Q';

// Token validasyonu fonksiyonu
const validateMapboxToken = (token: string): boolean => {
  if (!token) {
    console.error('Mapbox token bulunamadı!');
    return false;
  }
  
  if (!token.startsWith('pk.')) {
    console.error('Geçersiz Mapbox token formatı!');
    return false;
  }
  
  return true;
};

// Mapbox modüllerini dinamik yükle ve token'ı güvenli şekilde set et
const initializeMapbox = async (): Promise<{ mapboxgl: any; MapboxDraw: any } | null> => {
  try {
    // Token'ı önce validate et
    if (!validateMapboxToken(mapboxToken)) {
      throw new Error('Mapbox token validation failed');
    }

    // Mapbox modüllerini dinamik yükle
    const [mapboxModule, drawModule] = await Promise.all([
      import('mapbox-gl'),
      import('@mapbox/mapbox-gl-draw')
    ]);
    
    const mapboxgl = mapboxModule.default;
    const MapboxDraw = drawModule.default;
    
    // Token'ı güvenli şekilde set et
    mapboxgl.accessToken = mapboxToken;
    
    console.log('✅ Mapbox başarıyla yüklendi ve token set edildi');
    
    return { mapboxgl, MapboxDraw };
  } catch (error) {
    console.error('❌ Mapbox initialization failed:', error);
    
    // Kullanıcıya user-friendly hata mesajı
    notification.error({
      message: 'Harita Yükleme Hatası',
      description: 'Mapbox servisi yüklenemedi. Lütfen internet bağlantınızı kontrol edin veya sayfa yenileyin.',
      duration: 0 // Kapanmasın
    });
    
    return null;
  }
};

// Harita uyarıları tipini tanımlama
interface EmergencyAlert {
  id: number;
  title: string;
  location: number[];
  type: string;
  severity: string;
}

interface MapboxProviderProps {
  emergencyAlerts?: EmergencyAlert[];
  fires?: any[];
  tsunamiAlerts?: any[];
  earthquakes?: any[];
  adminMode?: boolean;
  enable3D?: boolean;
  enableDrawing?: boolean;
  offlineMode?: boolean;
  cachedTiles?: {[key: string]: boolean};
  onMapDataChange?: (data: any) => void;
  onTaskAssign?: (location: [number, number], note: string) => void;
  userRegion?: string; // Kullanıcının bölgesi
  userRole?: string;   // Kullanıcının rolü
}

// Harita katman tipi
type MapLayer = {
  id: string;
  name: string;
  style: string;
  icon?: React.ReactNode;
}

// Harita katmanları
const mapLayers: MapLayer[] = [
  { id: 'streets', name: 'Sokak', style: 'mapbox://styles/mapbox/streets-v12', icon: <EnvironmentOutlined /> },
  { id: 'satellite', name: 'Uydu', style: 'mapbox://styles/mapbox/satellite-v9', icon: <EyeOutlined /> },
  { id: 'topography', name: 'Topografya', style: 'mapbox://styles/mapbox/outdoors-v12', icon: <BorderOutlined /> },
  { id: 'navigation', name: 'Navigasyon', style: 'mapbox://styles/mapbox/navigation-day-v1', icon: <EnvironmentOutlined /> },
  { id: 'dark', name: 'Karanlık', style: 'mapbox://styles/mapbox/dark-v11', icon: <EyeOutlined /> },
  { id: 'turkey-topo', name: 'Türkiye Topo', style: 'mapbox://styles/mapbox/outdoors-v12', icon: <BorderOutlined /> }
];

// Özel katmanlar
const customLayers = [
  { id: 'earthquake-layer', name: 'Deprem Verileri', icon: <ThunderboltOutlined /> },
  { id: 'fault-lines-layer', name: 'Fay Hatları', icon: <BorderOutlined /> },
  { id: 'weather-layer', name: 'Hava Durumu', icon: <CloudOutlined /> },
  { id: 'rain-layer', name: 'Yağış Durumu', icon: <CloudOutlined /> },
  { id: 'shelters-layer', name: 'Barınma Alanları', icon: <HomeOutlined /> },
  { id: 'hospitals-layer', name: 'Sağlık Merkezleri', icon: <MedicineBoxOutlined /> },
  { id: 'logistics-layer', name: 'Lojistik Merkezleri', icon: <ShoppingOutlined /> },
  { id: 'water-layer', name: 'Su Kaynakları', icon: <ExperimentOutlined /> },
  { id: 'electrical-layer', name: 'Elektrik Altyapısı', icon: <ThunderboltOutlined /> },
  { id: 'communication-layer', name: 'İletişim Altyapısı', icon: <WifiOutlined /> },
  { id: 'evacuation-routes-layer', name: 'Tahliye Rotaları', icon: <SolutionOutlined /> }
];

// Fay hatları katmanı
const faultLines = {
  type: 'geojson',
  data: 'https://earthquake.usgs.gov/arcgis/rest/services/haz/hazfaults_2014/MapServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=geojson'
};

// Hava durumu için API anahtarı
const OPENWEATHER_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || 'f5cb0b965ea1564c50c6f1b74534d823';

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

// Görev grupları
const taskGroups = [
  { id: 'search-rescue', name: 'Arama Kurtarma Ekibi' },
  { id: 'medical', name: 'Sağlık Ekibi' },
  { id: 'logistics', name: 'Lojistik Ekibi' },
  { id: 'security', name: 'Güvenlik Ekibi' },
  { id: 'infrastructure', name: 'Altyapı Ekibi' }
];

// Mapbox token ayarı - duplicate tanımı kaldırıldı

// Rota seçeneği tipleri
type RouteMode = 'driving' | 'walking' | 'cycling';

interface RouteOptions {
  startPoint: [number, number];
  endPoint: [number, number];
  mode: RouteMode;
  alternatives: boolean;
}

// Türkiye il koordinatları
const cityCoordinates: { [key: string]: [number, number] } = {
  'adana': [35.321333, 37.000000],
  'adıyaman': [38.276379, 37.764751],
  'afyonkarahisar': [30.545481, 38.757889],
  'ağrı': [43.051376, 39.721857],
  'amasya': [35.831829, 40.655838],
  'ankara': [32.854048, 39.919511],
  'antalya': [30.710699, 36.897339],
  'artvin': [41.818104, 41.184555],
  'aydın': [27.839972, 37.856041],
  'balıkesir': [27.888207, 39.648369],
  'bilecik': [29.979220, 40.142571],
  'bingöl': [40.498390, 38.885349],
  'bitlis': [42.109692, 38.393291],
  'bolu': [31.608187, 40.739479],
  'burdur': [30.289030, 37.726406],
  'bursa': [29.060965, 40.186414],
  'çanakkale': [26.409204, 40.155312],
  'çankırı': [33.613419, 40.600967],
  'çorum': [34.953412, 40.549992],
  'denizli': [29.086435, 37.783256],
  'diyarbakır': [40.231934, 37.910000],
  'edirne': [26.555919, 41.678108],
  'elazığ': [39.223024, 38.674686],
  'erzincan': [39.490102, 39.750367],
  'erzurum': [41.276100, 39.904041],
  'eskişehir': [30.525631, 39.776683],
  'gaziantep': [37.378948, 37.065953],
  'giresun': [38.387139, 40.912806],
  'gümüşhane': [39.484260, 40.460640],
  'hakkari': [43.740936, 37.578506],
  'hatay': [36.152695, 36.200001],
  'ısparta': [30.553415, 37.764771],
  'mersin': [34.641781, 36.812103],
  'istanbul': [28.978359, 41.008240],
  'izmir': [27.142826, 38.423733],
  'kars': [43.098118, 40.601920],
  'kastamonu': [33.777969, 41.388966],
  'kayseri': [35.478729, 38.721918],
  'kırklareli': [27.225942, 41.735138],
  'kırşehir': [34.159729, 39.150211],
  'kocaeli': [29.919087, 40.855257],
  'konya': [32.493423, 37.874641],
  'kütahya': [29.983333, 39.416667],
  'malatya': [38.315316, 38.355274],
  'manisa': [27.428057, 38.619099],
  'kahramanmaraş': [36.922160, 37.585831],
  'mardin': [40.725456, 37.321069],
  'muğla': [28.363676, 37.215347],
  'muş': [41.498219, 38.744175],
  'nevşehir': [34.712370, 38.624874],
  'niğde': [34.679498, 37.969330],
  'ordu': [37.879660, 40.986486],
  'rize': [40.521523, 41.020748],
  'sakarya': [30.394829, 40.756401],
  'samsun': [36.330212, 41.292782],
  'siirt': [41.941898, 37.933124],
  'sinop': [35.155102, 42.029819],
  'sivas': [37.015434, 39.749824],
  'tekirdağ': [27.511689, 40.978497],
  'tokat': [36.551453, 40.317169],
  'trabzon': [39.726909, 41.002377],
  'tunceli': [39.548069, 39.107635],
  'şanlıurfa': [38.794662, 37.161011],
  'uşak': [29.404623, 38.673057],
  'van': [43.380646, 38.501263],
  'yozgat': [34.807970, 39.820000],
  'zonguldak': [31.793322, 41.456610],
  'aksaray': [33.999618, 38.368587],
  'bayburt': [40.228108, 40.255169],
  'karaman': [33.215347, 37.175720],
  'kırıkkale': [33.509838, 39.846779],
  'batman': [41.134644, 37.881168],
  'şırnak': [42.459599, 37.514229],
  'bartın': [32.337638, 41.634102],
  'ardahan': [42.702661, 41.110897],
  'ığdır': [44.045199, 39.920216],
  'yalova': [29.277310, 40.659279],
  'karabük': [32.627419, 41.195679],
  'kilis': [37.115204, 36.718399],
  'osmaniye': [36.246403, 37.068748],
  'düzce': [31.162903, 40.843849]
};

// Türkiye bölgeleri ve illeri
const regionCities: { [key: string]: string[] } = {
  'marmara': ['istanbul', 'edirne', 'kırklareli', 'tekirdağ', 'çanakkale', 'balıkesir', 'bursa', 'yalova', 'kocaeli', 'bilecik', 'sakarya'],
  'ege': ['izmir', 'manisa', 'aydın', 'denizli', 'muğla', 'afyonkarahisar', 'kütahya', 'uşak'],
  'akdeniz': ['antalya', 'isparta', 'burdur', 'adana', 'mersin', 'hatay', 'osmaniye', 'kahramanmaraş'],
  'iç anadolu': ['ankara', 'konya', 'kayseri', 'eskişehir', 'sivas', 'kırşehir', 'nevşehir', 'niğde', 'aksaray', 'karaman', 'kırıkkale', 'çankırı', 'yozgat'],
  'karadeniz': ['samsun', 'sinop', 'çorum', 'amasya', 'tokat', 'ordu', 'giresun', 'trabzon', 'rize', 'artvin', 'gümüşhane', 'bayburt', 'zonguldak', 'karabük', 'bartın', 'kastamonu', 'düzce', 'bolu'],
  'doğu anadolu': ['erzurum', 'erzincan', 'bingöl', 'elazığ', 'tunceli', 'malatya', 'kars', 'ardahan', 'ağrı', 'ığdır', 'van', 'muş', 'bitlis', 'hakkari'],
  'güneydoğu anadolu': ['gaziantep', 'kilis', 'adıyaman', 'şanlıurfa', 'diyarbakır', 'mardin', 'batman', 'siirt', 'şırnak']
};

const MapboxProvider: React.FC<MapboxProviderProps> = ({ 
  emergencyAlerts = [], 
  fires = [],
  tsunamiAlerts = [],
  earthquakes = [],
  adminMode = false,
  enable3D = false,
  enableDrawing = true,
  offlineMode = false,
  cachedTiles = {},
  onMapDataChange,
  onTaskAssign = () => {},
  userRegion = '',
  userRole = ''
}) => {
  console.log('🗺️ MapboxProvider başlatılıyor...', { fires, tsunamiAlerts, earthquakes });

  const mapContainerRef = useRef(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const draw = useRef<MapboxDraw | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedMapLayer, setSelectedMapLayer] = useState<string>('streets-v11');
  const [activeNote, setActiveNote] = useState<string | null>(null);
  
  // Kullanıcıya göre varsayılan konum ve zoom belirleme
  let defaultLng = 35.243322; // Türkiye'nin ortası
  let defaultLat = 38.963745; // Türkiye'nin ortası
  let defaultZoom = 4.7;      // Türkiye'yi gösterecek zoom seviyesi
  
  // Kullanıcı rolü admin değilse ve bölge bilgisi varsa haritayı o bölgeye odakla
  useEffect(() => {
    if (userRole !== 'admin' && userRegion) {
      // Bölge adını küçük harfe çevirme
      const regionLower = userRegion.toLowerCase();
      
      // Doğrudan il ismi olabilir
      if (cityCoordinates[regionLower]) {
        defaultLng = cityCoordinates[regionLower][0];
        defaultLat = cityCoordinates[regionLower][1];
        defaultZoom = 8; // İl için uygun zoom seviyesi
      } 
      // Bölge ismi olabilir (Marmara Bölgesi, Ege Bölgesi, vb.)
      else {
        // Bölge ismini temizle ("Bölgesi" kelimesini çıkar)
        let cleanRegion = regionLower.replace("bölgesi", "").trim();
        cleanRegion = cleanRegion.replace(" bölge", "").trim();
        
        // Bölgedeki illere göre ortalama konum bul
        if (regionCities[cleanRegion]) {
          const cities = regionCities[cleanRegion];
          let totalLng = 0;
          let totalLat = 0;
          let count = 0;
          
          cities.forEach(city => {
            if (cityCoordinates[city]) {
              totalLng += cityCoordinates[city][0];
              totalLat += cityCoordinates[city][1];
              count++;
            }
          });
          
          if (count > 0) {
            defaultLng = totalLng / count;
            defaultLat = totalLat / count;
            defaultZoom = 6; // Bölge için uygun zoom seviyesi
          }
        }
      }
      
      // Eğer harita zaten yüklendiyse, haritayı belirtilen konuma taşı
      if (map.current && isMapLoaded) {
        map.current.flyTo({
          center: [defaultLng, defaultLat],
          zoom: defaultZoom,
          essential: true
        });
      }
    }
  }, [userRole, userRegion, isMapLoaded]);
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState<string>('shelters');
  const [activeLayers, setActiveLayers] = useState<string[]>([]);
  const [lng, setLng] = useState(35.243322); // Türkiye'nin ortası
  const [lat, setLat] = useState(38.963745); // Türkiye'nin ortası
  const [zoom, setZoom] = useState(3); // Türkiye'yi daha geniş gösterecek zoom seviyesi
  const [drawMode, setDrawMode] = useState<DrawMode>(null);
  const [is3DActive, setIs3DActive] = useState<boolean>(false);
  const [selectedAlert, setSelectedAlert] = useState<EmergencyAlert | null>(null);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [showDrawingTools, setShowDrawingTools] = useState(false);
  const [taskDrawerVisible, setTaskDrawerVisible] = useState(false);
  const [selectedGeometry, setSelectedGeometry] = useState<any>(null);
  const [taskForm] = Form.useForm();
  const [currentColor, setCurrentColor] = useState<string>('#3388FF');
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [noteForm] = Form.useForm();
  const [editingNote, setEditingNote] = useState<NoteItem | null>(null);
  const [measurementInfo, setMeasurementInfo] = useState<{area: number, distance: number | null}>({area: 0, distance: null});
  const [eraserMode, setEraserMode] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [routeStart, setRouteStart] = useState<[number, number] | null>(null);
  const [routeEnd, setRouteEnd] = useState<[number, number] | null>(null);
  const [routeMode, setRouteMode] = useState<RouteMode>('driving');
  const [showAlternatives, setShowAlternatives] = useState<boolean>(true);
  const [routeDistance, setRouteDistance] = useState<number | null>(null);
  const [routeDuration, setRouteDuration] = useState<number | null>(null);
  const [isRoutingActive, setIsRoutingActive] = useState<boolean>(false);
  const [routes, setRoutes] = useState<any[]>([]);
  const [isOffline, setIsOffline] = useState(offlineMode);
  
  useEffect(() => {
    setIsOffline(offlineMode);
  }, [offlineMode]);
  
  useEffect(() => {
    if (map.current) return; // harita zaten yüklendi
    
    // Mapbox'ı güvenli şekilde initialize et
    const initializeMap = async () => {
      try {
        // Offline önbellek yönetimi için yapılandırma
        if (typeof window !== 'undefined') {
          const checkCacheStorage = async () => {
            if ('caches' in window) {
              try {
                const cacheName = 'mapbox-tiles-cache';
                const cache = await caches.open(cacheName);
                
                if (navigator.storage && navigator.storage.estimate) {
                  const storageEstimate = await navigator.storage.estimate();
                  console.log('✅ Önbellek kullanımı:', storageEstimate?.usage || 'Bilinmiyor');
                  console.log('✅ Önbellek kapasitesi:', storageEstimate?.quota || 'Bilinmiyor');
                }
              } catch (error) {
                console.error('❌ Önbellek kontrolü yapılamadı:', error);
              }
            }
          };
          
          await checkCacheStorage();
        }

        // Mapbox modüllerini güvenli şekilde yükle
        const mapboxModules = await initializeMapbox();
        
        if (!mapboxModules) {
          throw new Error('Mapbox yüklenemedi');
        }

        const { mapboxgl: mapboxGl, MapboxDraw: MapboxDrawClass } = mapboxModules;

        // Harita konfigürasyonu - güvenli token ile
        map.current = new mapboxGl.Map({
          container: mapContainerRef.current!,
          style: 'mapbox://styles/mapbox/streets-v11',
          center: [defaultLng, defaultLat],
          zoom: defaultZoom,
          maxZoom: 18,
          minZoom: 2
        });
        
        console.log('✅ Mapbox harita başarıyla oluşturuldu!');
        
        // Harita kontrollerini ekle
        map.current.addControl(new mapboxGl.NavigationControl({ showCompass: true, visualizePitch: true }), 'top-right');
        map.current.addControl(new mapboxGl.FullscreenControl(), 'top-right');
        
        // Admin olmayan kullanıcılar için harita sınırlaması ekle
        if (userRole !== 'admin' && userRegion) {
          const regionLower = userRegion.toLowerCase();
          
          const restrictMapBoundsByRegion = async () => {
            try {
              if (cityCoordinates[regionLower]) {
                const center = cityCoordinates[regionLower];
                const bufferDistance = 0.8;
                
                const bounds = new mapboxGl.LngLatBounds(
                  [center[0] - bufferDistance, center[1] - bufferDistance],
                  [center[0] + bufferDistance, center[1] + bufferDistance]
                );
                
                if (map.current) {
                  map.current.setMaxBounds(bounds);
                  
                  console.log(`🗺️ Harita "${regionLower}" ili ile sınırlandırıldı`);
                  
                  notification.info({
                    message: 'Harita Kısıtlaması',
                    description: `Harita görünümü ${regionLower.toUpperCase()} ili ile sınırlandırılmıştır.`,
                    duration: 5
                  });
                }
              } else {
                let cleanRegion = regionLower.replace("bölgesi", "").trim();
                cleanRegion = cleanRegion.replace(" bölge", "").trim();
                
                if (regionCities[cleanRegion]) {
                  const cities = regionCities[cleanRegion];
                  let minLng = 180, minLat = 90, maxLng = -180, maxLat = -90;
                  
                  cities.forEach(city => {
                    if (cityCoordinates[city]) {
                      const [cityLng, cityLat] = cityCoordinates[city];
                      minLng = Math.min(minLng, cityLng - 0.5);
                      minLat = Math.min(minLat, cityLat - 0.5);
                      maxLng = Math.max(maxLng, cityLng + 0.5);
                      maxLat = Math.max(maxLat, cityLat + 0.5);
                    }
                  });
                  
                  if (minLng < maxLng && minLat < maxLat) {
                    const bounds = new mapboxGl.LngLatBounds([minLng, minLat], [maxLng, maxLat]);
                    
                    if (map.current) {
                      map.current.setMaxBounds(bounds);
                      console.log(`🗺️ Harita "${cleanRegion}" bölgesi ile sınırlandırıldı`);
                      
                      notification.info({
                        message: 'Harita Kısıtlaması',
                        description: `Harita görünümü ${cleanRegion.toUpperCase()} bölgesi ile sınırlandırılmıştır.`,
                        duration: 5
                      });
                    }
                  }
                }
              }
            } catch (error) {
              console.error('❌ Harita sınırları ayarlanırken hata:', error);
            }
          };
          
          map.current.once('load', restrictMapBoundsByRegion);
        }
        
        // Harita yüklendiğinde olayları dinle
        map.current.on('load', () => {
          try {
            setIsMapLoaded(true);
            console.log('✅ Harita yüklendi ve hazır');
            
            // Fonksiyon kontrolü ile güvenli çağrılar
            if (typeof addEmergencyAlerts === 'function') addEmergencyAlerts();
            if (typeof addFaultLines === 'function') addFaultLines();
            if (typeof addEarthquakeData === 'function') addEarthquakeData();
            if (typeof fetchWeatherData === 'function') fetchWeatherData();
            if (typeof addEmergencyLayers === 'function') addEmergencyLayers();
            
            // 3D binalar için optimize edilmiş yükleme
            if (enable3D && map.current) {
              if (map.current.getStyle() && map.current.isStyleLoaded()) {
                try {
                  map.current.addLayer({
                    'id': '3d-buildings',
                    'source': 'composite',
                    'source-layer': 'building',
                    'filter': ['==', 'extrude', 'true'],
                    'type': 'fill-extrusion',
                    'minzoom': 15,
                    'paint': {
                      'fill-extrusion-color': '#aaa',
                      'fill-extrusion-height': [
                        'interpolate', ['linear'], ['zoom'],
                        15, 0,
                        15.05, ['get', 'height']
                      ],
                      'fill-extrusion-base': [
                        'interpolate', ['linear'], ['zoom'],
                        15, 0,
                        15.05, ['get', 'min_height']
                      ],
                      'fill-extrusion-opacity': 0.6
                    }
                  });
                  console.log('✅ 3D binalar eklendi');
                } catch (layerError) {
                  console.warn('⚠️ 3D binaları eklerken hata:', layerError);
                }
              }
            }
            
            if (isOffline) {
              notification.info({
                message: 'Çevrimdışı Mod Aktif',
                description: 'Harita çevrimdışı modda çalışıyor.',
                duration: 5
              });
            }
          } catch (error) {
            console.error('❌ Harita yüklenirken hata:', error);
          }
        });
        
        // Çizim aracını güvenli şekilde ekle
        if (enableDrawing) {
          const mapboxDraw = new MapboxDrawClass({
            displayControlsDefault: false,
            controls: {
              polygon: false,
              trash: false,
              line_string: false,
              point: false
            },
            defaultMode: 'simple_select',
            styles: [
              {
                'id': 'gl-draw-point',
                'type': 'circle',
                'filter': ['all', ['==', '$type', 'Point']],
                'paint': {
                  'circle-radius': 6,
                  'circle-color': '#FF5733'
                }
              },
              {
                'id': 'gl-draw-line',
                'type': 'line',
                'filter': ['all', ['==', '$type', 'LineString']],
                'layout': {
                  'line-cap': 'round',
                  'line-join': 'round'
                },
                'paint': {
                  'line-color': '#3388FF',
                  'line-width': 4
                }
              },
              {
                'id': 'gl-draw-polygon-fill',
                'type': 'fill',
                'filter': ['all', ['==', '$type', 'Polygon']],
                'paint': {
                  'fill-color': '#3388FF',
                  'fill-outline-color': '#3388FF',
                  'fill-opacity': 0.3
                }
              },
              {
                'id': 'gl-draw-polygon-stroke',
                'type': 'line',
                'filter': ['all', ['==', '$type', 'Polygon']],
                'layout': {
                  'line-cap': 'round',
                  'line-join': 'round'
                },
                'paint': {
                  'line-color': '#3388FF',
                  'line-width': 2
                }
              }
            ]
          });
          
          map.current.addControl(mapboxDraw, 'top-left');
          draw.current = mapboxDraw;
          
          map.current.on('draw.create', onDrawCreate);
          map.current.on('draw.delete', updateArea);
          map.current.on('draw.update', updateArea);
          map.current.on('draw.selectionchange', onSelectionChange);
          
          console.log('✅ Çizim araçları eklendi');
        }
        
        // Konum aracını ekle
        map.current.addControl(new mapboxGl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true
          },
          trackUserLocation: true
        }), 'top-right');
        
        console.log('✅ Harita tamamen başlatıldı');
        
      } catch (error) {
        console.error('❌ Harita başlatma hatası:', error);
        
        // Kullanıcıya hata bildir
        notification.error({
          message: 'Harita Yükleme Hatası',
          description: 'Harita servisi başlatılamadı. Lütfen sayfayı yenileyin.',
          duration: 0
        });
      }
    };
    
    // Map'i async olarak başlat
    initializeMap();
  }, [userRole, userRegion, enable3D, enableDrawing, isOffline]);
  
  useEffect(() => {
    if (!map.current || !isMapLoaded) return;
    
    try {
      // Acil durum uyarılarını ekle
      addEmergencyAlerts();
      
      // Fay hatlarını ve deprem verilerini ekle
      addFaultLines();
      addEarthquakeData();
      
      // Yangın, tsunami ve deprem verilerini ekle
      addFiresLayer();
      addTsunamiLayer();
      addEarthquakesLayer();
      
      // Diğer harita katmanlarını ekle
      addTurkeyBoundaries();
      
      // Burada enable3D'yi kontrolden kaldırıyoruz, manuel olarak 3D moduna geçilecek
      // 3D modu, yalnızca kullanıcı butona tıkladığında etkinleşecek
      
      // Haritayı her yeniden yüklediğimizde layerleri kontrol et
      updateVisibleLayers();
    } catch (e) {
      console.error('Harita bileşenleri yüklenirken hata:', e);
    }
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMapLoaded, fires, tsunamiAlerts, earthquakes]);
  
  useEffect(() => {
    if (!map.current || !isMapLoaded) return;
    
    map.current.setStyle(mapLayers.find(layer => layer.id === selectedMapLayer)?.style || 'mapbox://styles/mapbox/streets-v12');
    
    // Stil değiştiğinde katmanları yeniden ekleyin
    map.current.once('styledata', () => {
      addTurkeyBoundaries();
      
      if (activeLayers.includes('fault-lines-layer')) {
        addFaultLines();
      }
      
      if (activeLayers.includes('earthquake-layer')) {
        addEarthquakeData();
      }
      
      if (activeLayers.includes('rain-layer')) {
        addRainLayer();
      }
      
      // 3D modu etkinleştir
      if (is3DActive) {
        toggle3DMode(true);
      }
      
      // Not işaretlerini yeniden ekle
      notes.forEach(note => {
        addNoteMarker(note);
      });
    });
  }, [selectedMapLayer, isMapLoaded]);
  
  const toggleLayerVisibility = (layerId: string, isVisible: boolean) => {
    if (!map.current || !map.current.getLayer(layerId)) return;
    
    if (isVisible) {
      map.current.setLayoutProperty(layerId, 'visibility', 'visible');
    } else {
      map.current.setLayoutProperty(layerId, 'visibility', 'none');
    }
  };
  
  const handleLayerToggle = (layerId: string) => {
    setActiveLayers(prev => {
      if (prev.includes(layerId)) {
        return prev.filter(id => id !== layerId);
      } else {
        return [...prev, layerId];
      }
    });
  };
  
  const addFaultLines = () => {
    if (!map.current) return;
    
    try {
      // Harita stilinin yüklenip yüklenmediğini kontrol et
      if (!map.current.isStyleLoaded()) {
        console.log('Harita stili henüz yüklenmedi, fay hatları ekleme erteleniyor...');
        
        // Stil yüklenene kadar bekle ve sonra tekrar dene
        map.current.once('styledata', () => {
          setTimeout(() => {
            addFaultLines(); // Stil yüklendikten sonra tekrar çağır
          }, 200); // Kısa bir gecikme ekle
        });
        return;
      }
      
      // Önce katmanları kaldır, sonra kaynağı kaldır (sıralama önemli)
      if (map.current.getLayer('fault-lines-labels')) {
        map.current.removeLayer('fault-lines-labels');
      }
      
      if (map.current.getLayer('fault-lines-layer')) {
        map.current.removeLayer('fault-lines-layer');
      }
      
      // Kaynak zaten mevcutsa kaldır
      if (map.current.getSource('fault-lines')) {
        map.current.removeSource('fault-lines');
      }
      
      // Türkiye fay hatları GeoJSON (Alternatif statik veri)
      const turkeyFaultLinesData: GeoJSON.FeatureCollection = {
        "type": "FeatureCollection",
        "features": [
          {
            "type": "Feature",
            "properties": {
              "name": "Kuzey Anadolu Fay Hattı"
            },
            "geometry": {
              "type": "LineString",
              "coordinates": [
                [26.2, 40.5], [27.5, 40.7], [29.0, 40.7], [30.5, 40.8], 
                [32.0, 41.0], [33.5, 41.1], [35.0, 41.0], [36.5, 40.5], 
                [38.0, 40.2], [39.5, 39.8], [41.0, 39.6]
              ]
            }
          },
          {
            "type": "Feature",
            "properties": {
              "name": "Doğu Anadolu Fay Hattı"
            },
            "geometry": {
              "type": "LineString",
              "coordinates": [
                [36.1, 38.2], [37.3, 37.8], [38.5, 37.5], [39.7, 37.2], 
                [40.5, 37.0], [41.3, 36.7], [42.0, 36.5]
              ]
            }
          },
          {
            "type": "Feature",
            "properties": {
              "name": "Batı Anadolu Fay Zonları"
            },
            "geometry": {
              "type": "LineString",
              "coordinates": [
                [27.0, 38.5], [28.0, 38.2], [29.0, 38.0], [30.0, 37.5], [31.0, 37.0]
              ]
            }
          }
        ]
      };
      
      // Fay hatları kaynağını ekle (USGS yerine lokal veri)
      map.current.addSource('fault-lines', {
        type: 'geojson',
        data: turkeyFaultLinesData
      });
      
      // Fay hatları katmanını ekle
      map.current.addLayer({
        'id': 'fault-lines-layer',
        'type': 'line',
        'source': 'fault-lines',
        'layout': {
          'visibility': activeLayers.includes('fault-lines-layer') ? 'visible' : 'none',
          'line-join': 'round',
          'line-cap': 'round'
        },
        'paint': {
          'line-color': '#ff0000',
          'line-width': 3,
          'line-opacity': 0.7
        }
      });
      
      // Fay hatları isimleri için katman
      map.current.addLayer({
        'id': 'fault-lines-labels',
        'type': 'symbol',
        'source': 'fault-lines',
        'layout': {
          'visibility': activeLayers.includes('fault-lines-layer') ? 'visible' : 'none',
          'text-field': ['get', 'name'],
          'text-font': ['Open Sans Bold'],
          'text-size': 12,
          'text-offset': [0, 1],
          'text-anchor': 'top'
        },
        'paint': {
          'text-color': '#b30000',
          'text-halo-color': 'rgba(255, 255, 255, 0.8)',
          'text-halo-width': 1.5
        }
      });
      
    } catch (error) {
      console.error('Fay hatları eklenirken hata oluştu:', error);
      notification.warning({
        message: 'Fay Hatları Verisi',
        description: 'Fay hatları verisi yüklenemedi. Harita yine de kullanılabilir.',
        duration: 5
      });
    }
  };
  
  const addEarthquakeData = async () => {
    if (!map.current) return;
    
    try {
      // Harita stilinin yüklenip yüklenmediğini kontrol et
      if (!map.current.isStyleLoaded()) {
        console.log('Harita stili henüz yüklenmedi, deprem verileri ekleme erteleniyor...');
        
        // Stil yüklenene kadar bekle ve sonra tekrar dene
        map.current.once('styledata', () => {
          setTimeout(() => {
            addEarthquakeData(); // Stil yüklendikten sonra tekrar çağır
          }, 200); // Kısa bir gecikme ekle
        });
        return;
      }
      
      let earthquakeData;
      
      try {
        // Önce Kandilli/AFAD API'sinden veri almayı dene (proxy üzerinden)
        const response = await axios.get('https://api.orhanaydogdu.com.tr/deprem/kandilli/live', {
          timeout: 5000 // 5 saniye timeout
        });
        
        if (response.data && response.data.result) {
          // Kandilli verisini bizim formatımıza dönüştür
          earthquakeData = response.data.result.map((eq: any) => ({
            id: eq.earthquake_id || `eq-${Math.random().toString(36).substring(2, 9)}`,
            magnitude: eq.mag,
            location: eq.title || eq.lokasyon,
            depth: eq.depth,
            date: eq.date_time ? new Date(eq.date_time).toLocaleDateString('tr-TR') : eq.date,
            time: eq.date_time ? new Date(eq.date_time).toLocaleTimeString('tr-TR') : eq.time,
            longitude: eq.lng,
            latitude: eq.lat,
          }));
        } else {
          throw new Error('Kandilli veri formatı uyumsuz');
        }
      } catch (kandilliError) {
        console.warn('Kandilli API erişim hatası, USGS denenecek:', kandilliError);
        
        try {
          // Kandilli olmadıysa USGS'den almayı dene
          const response = await axios.get('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson', {
            timeout: 5000 // 5 saniye timeout
          });
          
          // USGS verisini bizim formatımıza dönüştür
          earthquakeData = response.data.features.map((feature: any) => ({
            id: feature.id,
            magnitude: feature.properties.mag,
            location: feature.properties.place,
            depth: feature.geometry.coordinates[2],
            date: new Date(feature.properties.time).toLocaleDateString('tr-TR'),
            time: new Date(feature.properties.time).toLocaleTimeString('tr-TR'),
            longitude: feature.geometry.coordinates[0],
            latitude: feature.geometry.coordinates[1],
          }));
        } catch (usgsError) {
          console.warn('USGS API erişim hatası, demo veri kullanılıyor:', usgsError);
          
          // Her iki API'ye de erişilemezse örnek Türkiye verileri kullan
          earthquakeData = [
            {
              id: 'demo1',
              magnitude: 4.5,
              location: 'İzmir, Türkiye',
              depth: 10,
              date: new Date().toLocaleDateString('tr-TR'),
              time: new Date().toLocaleTimeString('tr-TR'),
              longitude: 27.142826,
              latitude: 38.423733
            },
            {
              id: 'demo2',
              magnitude: 3.8,
              location: 'Van, Türkiye',
              depth: 7,
              date: new Date().toLocaleDateString('tr-TR'),
              time: new Date().toLocaleTimeString('tr-TR'),
              longitude: 43.380657,
              latitude: 38.501022
            },
            {
              id: 'demo3',
              magnitude: 5.2,
              location: 'Hatay, Türkiye',
              depth: 12,
              date: new Date().toLocaleDateString('tr-TR'),
              time: new Date().toLocaleTimeString('tr-TR'),
              longitude: 36.166668,
              latitude: 36.216667
            }
          ];
        }
      }
      
      if (!map.current) return;
      
      // GeoJSON formatına dönüştür
      const geoJsonData: GeoJSON.FeatureCollection<GeoJSON.Point> = {
        type: 'FeatureCollection',
        features: earthquakeData.map((eq: any) => ({
          type: 'Feature',
          properties: {
            id: eq.id,
            magnitude: eq.magnitude,
            location: eq.location,
            depth: eq.depth,
            date: eq.date,
            time: eq.time
          },
          geometry: {
            type: 'Point',
            coordinates: [eq.longitude, eq.latitude]
          }
        }))
      };
      
      // Mevcut katmanları güvenli bir şekilde kaldır
      const removeLayer = (id: string) => {
        if (map.current && map.current.getLayer(id)) {
          map.current.removeLayer(id);
        }
      };
      
      const removeSource = (id: string) => {
        if (map.current && map.current.getSource(id)) {
          removeLayer(`${id}-points`);
          removeLayer(`${id}-clusters`);
          removeLayer(`${id}-cluster-count`);
          removeLayer(`${id}-unclustered-point`);
          map.current.removeSource(id);
        }
      };
      
      // Katmanları kaldır (varsa)
      removeLayer('earthquake-points');
      removeLayer('earthquake-clusters');
      removeLayer('earthquake-count');
      
      // Kaynağı kaldır (varsa)
      if (map.current.getSource('earthquakes')) {
        map.current.removeSource('earthquakes');
      }
      
      // Kaynak zaten eklenmişse, yeniden eklemeye çalışmadan önce veriyi güncelle
      if (map.current.getSource('earthquakes')) {
        try {
          (map.current.getSource('earthquakes') as mapboxgl.GeoJSONSource).setData(geoJsonData);
        } catch (e) {
          console.error('Deprem kaynağı güncellenirken hata oluştu:', e);
        }
      } else {
        // Veri kaynağını ekle
        map.current.addSource('earthquakes', {
          type: 'geojson',
          data: geoJsonData,
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 50
        });
      }
      
      // Deprem kümeleri
      map.current.addLayer({
        id: 'earthquake-clusters',
        type: 'circle',
        source: 'earthquakes',
        filter: ['has', 'point_count'],
        layout: {
          'visibility': activeLayers.includes('earthquake-layer') ? 'visible' : 'none'
        },
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#51bbd6',
            10,
            '#f1f075',
            30,
            '#f28cb1'
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            20,
            10,
            30,
            30,
            40
          ]
        }
      });
      
      // Cluster sayıları
      map.current.addLayer({
        id: 'earthquake-count',
        type: 'symbol',
        source: 'earthquakes',
        filter: ['has', 'point_count'],
        layout: {
          'visibility': activeLayers.includes('earthquake-layer') ? 'visible' : 'none',
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12
        }
      });
      
      // Deprem noktaları
      map.current.addLayer({
        id: 'earthquake-points',
        type: 'circle',
        source: 'earthquakes',
        filter: ['!', ['has', 'point_count']],
        layout: {
          'visibility': activeLayers.includes('earthquake-layer') ? 'visible' : 'none'
        },
        paint: {
          'circle-color': [
            'interpolate',
            ['linear'],
            ['get', 'magnitude'],
            2, '#a3f600',
            3, '#dcf400',
            4, '#f7db11',
            5, '#fdb72a',
            6, '#fca35d',
            7, '#ff5f65'
          ],
          'circle-opacity': 0.8,
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['get', 'magnitude'],
            2, 8,
            8, 25
          ]
        }
      });
      
      // Deprem noktalarına popup ekle
      map.current.on('click', 'earthquake-points', (e) => {
        if (!e.features || e.features.length === 0 || !e.features[0].properties) return;
        
        const feature = e.features[0];
        const props = feature.properties || {};
        const coordinates = (feature.geometry as GeoJSON.Point).coordinates.slice();
        
        // Popup içeriği
        const html = `
          <h3>Deprem Bilgisi</h3>
          <p><strong>Büyüklük:</strong> ${props.magnitude || 'Bilinmiyor'}</p>
          <p><strong>Yer:</strong> ${props.location || 'Bilinmiyor'}</p>
          <p><strong>Derinlik:</strong> ${props.depth || 'Bilinmiyor'} km</p>
          <p><strong>Tarih:</strong> ${props.date || 'Bilinmiyor'} ${props.time || ''}</p>
        `;
        
        new mapboxgl.Popup()
          .setLngLat(coordinates as [number, number])
          .setHTML(html)
          .addTo(map.current!);
      });
      
      // Pointer stil değişikliği
      map.current.on('mouseenter', 'earthquake-points', () => {
        if (!map.current) return;
        map.current.getCanvas().style.cursor = 'pointer';
      });
      
      map.current.on('mouseleave', 'earthquake-points', () => {
        if (!map.current) return;
        map.current.getCanvas().style.cursor = '';
      });
      
    } catch (error) {
      console.error('Deprem verileri yüklenirken hata oluştu:', error);
    }
  };
  
  const fetchWeatherData = async () => {
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=tr`;
      
      const response = await axios.get(url);
      setWeatherData(response.data);
    } catch (error) {
      console.error('Hava durumu verileri alınırken hata oluştu:', error);
    }
  };
  
  function updateArea(e: any) {
    if (!map.current || !draw.current) return;
    
    const data = draw.current.getAll();
    let totalArea = 0;
    let totalDistance = null;
    
    if (data.features.length > 0) {
      // Tüm çizimlerin toplam alanını hesapla
      totalArea = Math.round(turf.area(data) * 100) / 100;
      
      // Son eklenen veya seçilen özelliği bul
      let targetFeature = null;
      
      if (e && e.features && e.features.length > 0) {
        // Yeni çizilmiş özellik
        targetFeature = e.features[0];
      } else if (selectedGeometry) {
        // Seçili özellik
        targetFeature = selectedGeometry;
      } else if (data.features.length > 0) {
        // Son eklenen özellik
        targetFeature = data.features[data.features.length - 1];
      }
      
      // Çizgi ise uzunluğunu hesapla
      if (targetFeature && targetFeature.geometry.type === 'LineString') {
        const length = turf.length(targetFeature, {units: 'kilometers'});
        totalDistance = Math.round(length * 100) / 100;
      }
    }
    
    setMeasurementInfo({
      area: totalArea,
      distance: totalDistance
    });
  }
  
  const toggle3DMode = (force?: boolean) => {
    if (!map.current) return;
    
    try {
      const targetMode = force !== undefined ? force : !is3DActive;
      
      // Eğer 3D modu zaten istediğimiz durumda ise, işlemi geç
      if (targetMode === is3DActive) return;
      
      setIs3DActive(targetMode);
      
      if (targetMode) {
        // 3D moduna geç
        map.current.setPitch(60);
        
        try {
          // 'mapbox-dem' kaynağının var olup olmadığını kontrol et
          let demSourceExists = false;
          try {
            demSourceExists = !!map.current.getSource('mapbox-dem');
          } catch (e) {
            console.warn('mapbox-dem kaynağı kontrol edilirken hata:', e);
            demSourceExists = false;
          }
          
          if (!demSourceExists) {
            try {
              // Kaynak yoksa ekle
              map.current.addSource('mapbox-dem', {
                'type': 'raster-dem',
                'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
                'tileSize': 512,
                'maxzoom': 14
              });
              console.log('mapbox-dem kaynağı başarıyla eklendi');
            } catch (addSourceError) {
              console.error('DEM kaynağı eklenirken hata:', addSourceError);
              notification.error({
                message: '3D Harita Hatası',
                description: 'Yükselti verisi yüklenirken bir sorun oluştu. Lütfen daha sonra tekrar deneyin.',
                duration: 5
              });
              // Hata olursa state'i geri al
              setIs3DActive(false);
              return;
            }
          }
          
          // Arazi ayarlarını uygula 
          try {
            map.current.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });
            console.log('3D arazi başarıyla ayarlandı');
          } catch (terrainError) {
            console.error('3D arazi ayarlanırken hata:', terrainError);
            notification.error({
              message: '3D Görünüm Hatası',
              description: 'Arazi yükselti modeli ayarlanırken bir sorun oluştu.',
              duration: 5
            });
            // Hata olursa state'i geri al
            setIs3DActive(false);
          }
        } catch (error) {
          console.error('3D modu etkinleştirilirken hata:', error);
          notification.error({
            message: '3D Modu Hatası',
            description: 'Harita 3D moduna geçirilemedi. Lütfen daha sonra tekrar deneyin.',
            duration: 5
          });
          // Hata olursa state'i geri al
          setIs3DActive(false);
        }
      } else {
        // 2D moda dön
        try {
          map.current.setPitch(0);
          map.current.setTerrain(null); // Yükselti modelini kaldır
        } catch (resetError) {
          console.error('2D moda dönüşte hata:', resetError);
          // Hata olursa state'i doğru değere ayarla
          setIs3DActive(true);
        }
      }
    } catch (mainError) {
      console.error('3D/2D geçişinde ana hata:', mainError);
      notification.error({
        message: 'Harita Modu Değiştirilemedi',
        description: 'Harita görünümü değiştirilirken bir sorun oluştu.',
        duration: 5
      });
      // Hata durumunda en son geçerli duruma geri dön
      setIs3DActive(!is3DActive);
    }
  };
  
  const addEmergencyAlerts = () => {
    if (!map.current || !isMapLoaded) return;
    
    // Daha önce eklenmiş işaretçileri temizle
    document.querySelectorAll('.emergency-marker').forEach(marker => marker.remove());
    
    // Acil durum uyarıları için işaretçi ekle
    emergencyAlerts.forEach(alert => {
      if (!map.current) return;
      
      // Uyarı tipine göre renk belirle
      const color = alert.severity === 'high' ? '#ff4d4f' : 
                   alert.severity === 'medium' ? '#faad14' : '#52c41a';
      
      // İşaretçi oluştur
      const marker = document.createElement('div');
      marker.className = 'emergency-marker';
      marker.style.width = '20px';
      marker.style.height = '20px';
      marker.style.borderRadius = '50%';
      marker.style.backgroundColor = color;
      marker.style.border = '2px solid white';
      marker.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.3)';
      
      // İşaretçiyi haritaya ekle
      new mapboxgl.Marker({element: marker})
        .setLngLat(alert.location as [number, number])
        .setPopup(new mapboxgl.Popup().setHTML(`
          <h3>${alert.title}</h3>
          <p>Tür: ${getTypeTag(alert.type)}</p>
          <p>Şiddet: ${getSeverityTag(alert.severity)}</p>
        `))
        .addTo(map.current);
    });
  };
  
  const getAlertTypeName = (type: string) => {
    switch(type) {
      case 'earthquake': return 'Deprem';
      case 'flood': return 'Sel';
      case 'fire': return 'Yangın';
      case 'landslide': return 'Toprak Kayması';
      case 'avalanche': return 'Çığ';
      case 'volcano': return 'Volkan Faaliyeti';
      case 'tsunami': return 'Tsunami';
      case 'accident': return 'Kaza';
      default: return 'Diğer';
    }
  };
  
  const getSeverityName = (severity: string) => {
    switch(severity) {
      case 'high': return 'Yüksek';
      case 'medium': return 'Orta';
      case 'low': return 'Düşük';
      default: return 'Bilinmiyor';
    }
  };
  
  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'high': return '#ff4d4f'; // kırmızı
      case 'medium': return '#faad14'; // turuncu
      case 'low': return '#52c41a'; // yeşil
      default: return '#1890ff'; // mavi
    }
  };
  
  const addTurkeyBoundaries = () => {
    if (!map.current || !isMapLoaded) return;
    
    try {
      // Daha önce eklenen katmanları temizle
      if (map.current.getLayer('turkey-boundary-layer')) {
        map.current.removeLayer('turkey-boundary-layer');
      }
      if (map.current.getSource('turkey-boundary')) {
        map.current.removeSource('turkey-boundary');
      }
      
      // Türkiye sınır katmanı ekle (GeoJSON ile)
      map.current.addSource('turkey-boundary', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [26.0433, 42.0865], // Kuzeybatı köşesi
              [44.8349, 42.0865], // Kuzeydoğu köşesi
              [44.8349, 35.8074], // Güneydoğu köşesi
              [26.0433, 35.8074], // Güneybatı köşesi
              [26.0433, 42.0865]  // Kapama noktası
            ]]
          },
          properties: {
            name: 'Türkiye'
          }
        }
      });
      
      map.current.addLayer({
        id: 'turkey-boundary-layer',
        type: 'line',
        source: 'turkey-boundary',
        layout: {
          'visibility': 'visible'
        },
        paint: {
          'line-color': '#1890ff',
          'line-width': 2,
          'line-opacity': 0.6
        }
      });
    } catch (error) {
      console.error('Türkiye sınırları eklenirken hata:', error);
    }
  };
  
  const addRainLayer = async () => {
    if (!map.current || !isMapLoaded) return;
    
    try {
      // Daha önce eklenen katmanları temizle
      if (map.current.getLayer('rain-layer')) {
        map.current.removeLayer('rain-layer');
      }
      if (map.current.getSource('rain-data')) {
        map.current.removeSource('rain-data');
      }
      
      // Örnek yağış verisi
      const rainData = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {
              intensity: 0.8
            },
            geometry: {
              type: 'Point',
              coordinates: [29.0, 41.0]
            }
          },
          {
            type: 'Feature',
            properties: {
              intensity: 0.5
            },
            geometry: {
              type: 'Point',
              coordinates: [30.0, 39.0]
            }
          },
          {
            type: 'Feature',
            properties: {
              intensity: 0.3
            },
            geometry: {
              type: 'Point',
              coordinates: [32.0, 38.0]
            }
          }
        ]
      };
      
      map.current.addSource('rain-data', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: rainData.features.map((feature: any) => ({
            type: 'Feature',
            properties: feature.properties,
            geometry: feature.geometry
          }))
        }
      });
      
      map.current.addLayer({
        id: 'rain-layer',
        type: 'heatmap',
        source: 'rain-data',
        paint: {
          'heatmap-weight': ['get', 'intensity'],
          'heatmap-intensity': 0.5,
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(0, 0, 255, 0)',
            0.2, 'rgba(0, 0, 255, 0.5)',
            0.4, 'rgba(0, 255, 255, 0.5)',
            0.6, 'rgba(0, 255, 0, 0.5)',
            0.8, 'rgba(255, 255, 0, 0.5)',
            1, 'rgba(255, 0, 0, 0.5)'
          ],
          'heatmap-radius': 20,
          'heatmap-opacity': 0.8
        }
      });
    } catch (error) {
      console.error('Yağış katmanı eklenirken hata:', error);
    }
  };
  
  const changeDrawMode = (mode: DrawMode) => {
    if (!map.current || !draw.current) return;
    
    // Önceki modu temizle
    if (drawMode) {
      draw.current.changeMode('simple_select');
    }
    
    setDrawMode(mode);
    
    // Yeni modu ayarla
    switch(mode) {
      case 'point':
        draw.current.changeMode('draw_point');
        break;
      case 'line':
        draw.current.changeMode('draw_line_string');
        break;
      case 'polygon':
        draw.current.changeMode('draw_polygon');
        break;
      case 'rectangle':
        draw.current.changeMode('draw_rectangle');
        break;
      default:
        draw.current.changeMode('simple_select');
        break;
    }
    
    // Silgi modunu kapat
    setEraserMode(false);
  };
  
  const clearDrawing = () => {
    if (!map.current || !draw.current) return;
    draw.current.deleteAll();
    setSelectedGeometry(null);
  };
  
  const onDrawCreate = (e: any) => {
    if (!e.features || e.features.length === 0) return;
    updateArea(e);
    
    // Son çizilen geometriyi seç
    const feature = e.features[0];
    
    // Özel özellikleri ekle
    const updatedFeature = {
      ...feature,
      properties: {
        ...feature.properties,
        color: currentColor, // Seçilen rengi kaydet
        notes: [] // Notlar için boş dizi
      }
    };
    
    setSelectedGeometry(updatedFeature);
    
    // Çizim tamamlandığında not ekleme modalını aç
    setNoteModalVisible(true);
    
    // Çizim tamamlandığında görev atama alanını aç
    if (typeof onTaskAssign === 'function') {
      onTaskAssign(updatedFeature.geometry.coordinates, updatedFeature.properties.notes.join('\n'));
    }
  };
  
  const onSelectionChange = (e: any) => {
    if (!e.features || e.features.length === 0) {
      setSelectedGeometry(null);
      return;
    }
    
    // Seçilen geometriyi kaydet
    const feature = e.features[0];
    setSelectedGeometry(feature);
  };
  
  const addNoteToGeometry = (values: any) => {
    if (!selectedGeometry || !map.current) return;
    
    // Geometri merkezini hesapla
    let center: [number, number];
    
    if (selectedGeometry.geometry.type === 'Point') {
      center = selectedGeometry.geometry.coordinates;
    } else if (selectedGeometry.geometry.type === 'LineString') {
      // LineString için orta noktayı hesapla
      const line = turf.lineString(selectedGeometry.geometry.coordinates);
      const length = turf.length(line);
      const along = turf.along(line, length / 2);
      center = along.geometry.coordinates as [number, number];
    } else {
      // Polygon için merkezi hesapla
      const poly = turf.polygon([selectedGeometry.geometry.coordinates[0]]);
      const centroid = turf.centroid(poly);
      center = centroid.geometry.coordinates as [number, number];
    }
    
    // Not oluştur
    const noteId = `note-${Date.now()}`;
    const newNote: NoteItem = {
      id: noteId,
      text: values.text,
      position: center,
      color: values.color || currentColor,
      geometryId: selectedGeometry.id
    };
    
    // Notu kaydet
    setNotes(prev => [...prev, newNote]);
    
    // Not için marker ekle
    addNoteMarker(newNote);
    
    // Modal kapat
    setNoteModalVisible(false);
    noteForm.resetFields();
    
    // Bildirim göster
    notification.success({
      message: 'Not Eklendi',
      description: 'Not başarıyla eklendi.'
    });
    
    // Görevi atama modalını göster
    if (typeof onTaskAssign === 'function') {
      onTaskAssign(selectedGeometry.geometry.coordinates, newNote.text);
    }
  };
  
  const updateNote = (values: any) => {
    if (!editingNote || !map.current) return;
    
    // Notu güncelle
    const updatedNotes = notes.map(note => 
      note.id === editingNote.id 
        ? { ...note, text: values.text, color: values.color || note.color } 
        : note
    );
    
    setNotes(updatedNotes);
    
    // Marker'ı güncelle (mevcut marker'ı sil ve yeniden ekle)
    const existingMarker = document.getElementById(`marker-${editingNote.id}`);
    if (existingMarker) {
      existingMarker.remove();
    }
    
    const updatedNote = updatedNotes.find(n => n.id === editingNote.id);
    if (updatedNote) {
      addNoteMarker(updatedNote);
    }
    
    // Modal kapat
    setNoteModalVisible(false);
    setEditingNote(null);
    noteForm.resetFields();
    
    // Bildirim göster
    notification.success({
      message: 'Not Güncellendi',
      description: 'Not başarıyla güncellendi.'
    });
  };
  
  const deleteNote = (noteId: string) => {
    // Notlar listesinden sil
    setNotes(prev => prev.filter(note => note.id !== noteId));
    
    // Marker'ı sil
    const existingMarker = document.getElementById(`marker-${noteId}`);
    if (existingMarker) {
      existingMarker.remove();
    }
    
    // Bildirim göster
    notification.info({
      message: 'Not Silindi',
      description: 'Not başarıyla silindi.'
    });
  };
  
  // Tam ekran moduna geçme fonksiyonu
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      const mapContainer = mapContainerRef.current as HTMLDivElement | null;
      if (mapContainer && document.fullscreenEnabled) {
        if (mapContainer.requestFullscreen) {
          mapContainer.requestFullscreen();
        } else if ((mapContainer as any).mozRequestFullScreen) {
          (mapContainer as any).mozRequestFullScreen();
        } else if ((mapContainer as any).webkitRequestFullscreen) {
          (mapContainer as any).webkitRequestFullscreen();
        } else if ((mapContainer as any).msRequestFullscreen) {
          (mapContainer as any).msRequestFullscreen();
        }
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        (document as any).mozCancelFullScreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
    }
  };
  
  const saveAndAssignTask = (values: any) => {
    if (!selectedGeometry || !onTaskAssign) return;
    
    // Görev nesnesini oluştur
    const task = {
      id: Date.now(),
      title: values.title,
      description: values.description,
      priority: values.priority,
      assignedTo: values.assignedTo,
      geometry: selectedGeometry,
      createdAt: new Date().toISOString(),
      status: 'assigned'
    };
    
    // Görevi ata
    onTaskAssign(selectedGeometry.geometry.coordinates, values.description || 'Görev atandı');
    
    // Görevi kaydetme başarılı bildirimi
    notification.success({
      message: 'Görev Oluşturuldu',
      description: `"${values.title}" görevi ${taskGroups.find(g => g.id === values.assignedTo)?.name} ekibine atandı.`
    });
    
    // Çekmece panelini kapat ve formu temizle
    setTaskDrawerVisible(false);
    taskForm.resetFields();
  };
  
  const addNoteMarker = (note: NoteItem) => {
    if (!map.current || !isMapLoaded) return;
    
    // Mevcut işaretçiyi kontrol et
    const existingMarkerEl = document.getElementById(`note-${note.id}`);
    if (existingMarkerEl) existingMarkerEl.remove();
    
    // İşaretçi element oluştur
    const element = document.createElement('div');
    element.id = `note-${note.id}`;
    element.className = 'note-marker';
    element.style.width = '24px';
    element.style.height = '24px';
    element.style.borderRadius = '50%';
    element.style.backgroundColor = note.color;
    element.style.border = '2px solid white';
    element.style.boxShadow = '0 0 5px rgba(0, 0, 0, 0.3)';
    element.style.cursor = 'pointer';
    element.style.display = 'flex';
    element.style.justifyContent = 'center';
    element.style.alignItems = 'center';
    element.style.fontSize = '14px';
    element.style.color = 'white';
    element.style.fontWeight = 'bold';
    element.innerHTML = '<span>N</span>';
    
    // Popup içeriği
    const popupContent = `
      <div>
        <h3>Not</h3>
        <p>${note.text}</p>
      </div>
    `;
    
    // İşaretçiyi ekle
    new mapboxgl.Marker(element)
      .setLngLat(note.position)
      .setPopup(new mapboxgl.Popup().setHTML(popupContent))
      .addTo(map.current);
    
    // Tıklama olayı ekle
    element.addEventListener('click', () => {
      setActiveNote(note.id);
    });
  };
  
  useEffect(() => {
    // Harita yüklenmiş mi kontrolü
    if (!map.current || !isMapLoaded) return;
    
    // Haritadaki tüm not marker'larını temizle
    notes.forEach(note => {
      const marker = document.getElementById(`marker-${note.id}`);
      if (marker) marker.remove();
    });
    
    // Tüm notları yeniden ekle
    notes.forEach(note => {
      addNoteMarker(note);
    });
  }, [isMapLoaded]);
  
  useEffect(() => {
    if (!draw.current) return;
    
    // Çizim rengini güncelle için custom fonksiyon eklenebilir
    // Bu basit bir örnek, tam işlevsellik için draw nesnesinin
    // özelleştirilmesi veya başka bir yaklaşım gerekebilir
    
  }, [currentColor, draw.current]);
  
  useEffect(() => {
    if (!isFullscreen) return;
    
    // Tam ekrana geçilince çizim araçlarını göster
    if (enableDrawing && !showDrawingTools) {
      setShowDrawingTools(true);
    }
  }, [isFullscreen, enableDrawing]);
  
  const eraseFeature = (e: any) => {
    if (!map.current || !draw.current || !eraserMode) return;
    
    // Tıklama noktasını al
    const point = e.point;
    
    // Tıklama noktasında çizim öğesi var mı kontrol et
    const features = draw.current.getFeatureIdsAt(point);
    
    if (features.length > 0) {
      // Bulunan ilk öğeyi sil
      draw.current.delete(features[0]);
      
      // Ölçümleri güncelle
      const data = draw.current.getAll();
      let totalArea = 0;
      let totalDistance = null;
      
      if (data.features.length > 0) {
        totalArea = Math.round(turf.area(data) * 100) / 100;
      }
      
      setMeasurementInfo({
        area: totalArea,
        distance: totalDistance
      });
      
      // Silinen öğe seçili öğe ise seçimi temizle
      if (selectedGeometry && features.includes(selectedGeometry.id)) {
        setSelectedGeometry(null);
      }
      
      // Notları kontrol et ve bu öğeye bağlı bir not varsa kaldır
      notes.forEach(note => {
        if (note.geometryId && features.includes(note.geometryId)) {
          deleteNote(note.id);
        }
      });
      
      // Bildirim göster
      notification.info({
        message: 'Öğe Silindi',
        description: 'Seçili çizim öğesi silindi.'
      });
    }
  };
  
  const toggleEraserMode = () => {
    if (!map.current || !draw.current) return;
    
    // Silgi modunu değiştir
    const newEraserMode = !eraserMode;
    setEraserMode(newEraserMode);
    
    // Silgi modu açılırsa çizim modunu iptal et
    if (newEraserMode) {
      setDrawMode(null);
      draw.current.changeMode('simple_select');
      
      // Silgi modu açıkken tıklama olayını ekle
      map.current.on('click', eraseFeature);
    } else {
      // Silgi modu kapatılırsa tıklama olayını kaldır
      map.current.off('click', eraseFeature);
    }
  };
  
  const searchLocation = async () => {
    if (!searchText.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchText)}.json?access_token=${mapboxToken}&country=tr&language=tr`);
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        setSearchResults(data.features);
        
        // İlk sonuca git
        const firstResult = data.features[0];
        map.current?.flyTo({
          center: firstResult.center,
          zoom: 12,
          essential: true
        });
        
        // İşaretçi ekle
        const el = document.createElement('div');
        el.className = 'search-marker';
        el.style.width = '20px';
        el.style.height = '20px';
        el.style.borderRadius = '50%';
        el.style.backgroundColor = '#1890ff';
        el.style.border = '2px solid white';
        el.style.boxShadow = '0 0 5px rgba(0,0,0,0.3)';
        
        const popup = new mapboxgl.Popup({ offset: 25 })
          .setHTML(`<h3>${firstResult.place_name}</h3>`);
        
        new mapboxgl.Marker(el)
          .setLngLat(firstResult.center)
          .setPopup(popup)
          .addTo(map.current!);
      } else {
        notification.warning({
          message: 'Sonuç Bulunamadı',
          description: 'Arama kriterlerinize uygun bir konum bulunamadı.'
        });
      }
    } catch (error) {
      console.error('Konum arama hatası:', error);
      notification.error({
        message: 'Arama Hatası',
        description: 'Konum aranırken bir hata oluştu. Lütfen tekrar deneyin.'
      });
    } finally {
      setIsSearching(false);
    }
  };
  
  const updateVisibleLayers = () => {
    if (!map.current || !isMapLoaded) return;
    
    try {
      // Fay hatları katmanını güncelle
      if (map.current.getLayer('fault-lines-layer')) {
        map.current.setLayoutProperty(
          'fault-lines-layer',
          'visibility',
          activeLayers.includes('fault-lines-layer') ? 'visible' : 'none'
        );
      }
      
      if (map.current.getLayer('fault-lines-labels')) {
        map.current.setLayoutProperty(
          'fault-lines-labels',
          'visibility',
          activeLayers.includes('fault-lines-layer') ? 'visible' : 'none'
        );
      }
      
      // Deprem katmanlarını güncelle
      ['earthquake-points', 'earthquake-clusters', 'earthquake-cluster-count', 'earthquake-unclustered-point'].forEach(layerId => {
        if (map.current && map.current.getLayer(layerId)) {
          map.current.setLayoutProperty(
            layerId,
            'visibility',
            activeLayers.includes('earthquake-layer') ? 'visible' : 'none'
          );
        }
      });
      
      // Hava durumu katmanını güncelle
      if (map.current.getLayer('weather-layer')) {
        map.current.setLayoutProperty(
          'weather-layer',
          'visibility',
          activeLayers.includes('weather-layer') ? 'visible' : 'none'
        );
      }
      
      // Acil durum katmanlarını güncelle
      emergencyLayers.forEach((layer) => {
        if (map.current && map.current.getLayer(layer.id)) {
          map.current.setLayoutProperty(
            layer.id,
            'visibility',
            activeLayers.includes(layer.id) ? 'visible' : 'none'
          );
        }
      });
    } catch (error) {
      console.error('Katman görünürlüğü güncellenirken hata:', error);
    }
  };
  
  const emergencyLayers = [
    { id: 'shelters-layer', name: 'Barınma Alanları', icon: <HomeOutlined /> },
    { id: 'hospitals-layer', name: 'Sağlık Merkezleri', icon: <MedicineBoxOutlined /> },
    { id: 'logistics-layer', name: 'Lojistik Merkezleri', icon: <ShoppingOutlined /> },
    { id: 'water-layer', name: 'Su Kaynakları', icon: <ExperimentOutlined /> },
    { id: 'electrical-layer', name: 'Elektrik Altyapısı', icon: <ThunderboltOutlined /> },
    { id: 'communication-layer', name: 'İletişim Altyapısı', icon: <WifiOutlined /> },
    { id: 'evacuation-routes-layer', name: 'Tahliye Rotaları', icon: <SolutionOutlined /> }
  ];
  
  const addEmergencyLayer = (layerId: string, sourceId: string, source: any, color: string) => {
    if (!map.current || !isMapLoaded) return;
    
    try {
      // Daha önce eklenen katmanları temizle
      if (map.current.getLayer(layerId)) {
        map.current.removeLayer(layerId);
      }
      if (map.current.getSource(sourceId)) {
        map.current.removeSource(sourceId);
      }
      
      // Kaynak ekle
      map.current.addSource(sourceId, {
        type: 'geojson',
        data: source
      });
      
      // Katman ekle
      map.current.addLayer({
        id: layerId,
        type: 'circle',
        source: sourceId,
        layout: {
          'visibility': activeLayers.includes(layerId) ? 'visible' : 'none'
        },
        paint: {
          'circle-radius': 10,
          'circle-color': color,
          'circle-opacity': 0.8,
          'circle-stroke-width': 2,
          'circle-stroke-color': 'white'
        }
      });
      
      // Popup ekle
      map.current.on('click', layerId, (e) => {
        if (!e.features || e.features.length === 0) return;
        
        const feature = e.features[0];
        const props = feature.properties;
        const coordinates = (feature.geometry as any).coordinates.slice();
        
        // Popup içeriği
        const html = `
          <h3>${props?.name || 'İsimsiz'}</h3>
          <p>Kapasite: ${props?.capacity || 'Belirtilmemiş'}</p>
        `;
        
        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(html)
          .addTo(map.current!);
      });
      
      // Pointer stil değişikliği
      map.current.on('mouseenter', layerId, () => {
        if (map.current) map.current.getCanvas().style.cursor = 'pointer';
      });
      
      map.current.on('mouseleave', layerId, () => {
        if (map.current) map.current.getCanvas().style.cursor = '';
      });
    } catch (error) {
      console.error(`${layerId} katmanı eklenirken hata:`, error);
    }
  };
  
  const calculateRoute = async () => {
    if (!map.current || !routeStart || !routeEnd) return;
    
    try {
      // Önceki rotaları temizle
      clearRoutes();
      
      // Rota hesaplama
      const profile = routeMode === 'driving' ? 'mapbox/driving' : 'mapbox/walking';
      const url = `https://api.mapbox.com/directions/v5/${profile}/${routeStart[0]},${routeStart[1]};${routeEnd[0]},${routeEnd[1]}?alternatives=${showAlternatives}&geometries=geojson&steps=true&access_token=${mapboxToken}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        setRoutes(data.routes);
        
        // Rotaları göster
        data.routes.forEach((route: any, i: number) => {
          // Ana rota - mavi, alternatifler - gri
          const routeColor = i === 0 ? '#3887be' : '#aaa';
          const routeWidth = i === 0 ? 5 : 3;
          const routeOpacity = i === 0 ? 0.75 : 0.5;
          
          const sourceId = `route-source-${i}`;
          const layerId = `route-layer-${i}`;
          
          // Kaynak ekle
          map.current!.addSource(sourceId, {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: route.geometry
            }
          });
          
          // Katman ekle
          map.current!.addLayer({
            id: layerId,
            type: 'line',
            source: sourceId,
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': routeColor,
              'line-width': routeWidth,
              'line-opacity': routeOpacity
            }
          });
        });
        
        // Rota bilgilerini ayarla
        if (data.routes.length > 0) {
          const mainRoute = data.routes[0];
          setRouteDistance(mainRoute.distance);
          setRouteDuration(mainRoute.duration);
        }
        
        // Rotanın tamamını görecek şekilde haritayı ayarla
        const bounds = new mapboxgl.LngLatBounds()
          .extend(routeStart as mapboxgl.LngLatLike)
          .extend(routeEnd as mapboxgl.LngLatLike);
        
        map.current.fitBounds(bounds, {
          padding: 100
        });
      } else {
        notification.warning({
          message: 'Rota Bulunamadı',
          description: 'Belirtilen noktalar arasında rota hesaplanamadı.',
        });
      }
    } catch (error) {
      console.error('Rota hesaplama hatası:', error);
      notification.error({
        message: 'Rota Hesaplama Hatası',
        description: 'Rota hesaplanırken bir hata oluştu. Lütfen tekrar deneyin.',
      });
    }
  };
  
  // Rotaları temizleme fonksiyonu
  const clearRoutes = () => {
    if (!map.current) return;
    
    // Önceki rota katmanlarını temizle
    routes.forEach((_, i) => {
      const sourceId = `route-source-${i}`;
      const layerId = `route-layer-${i}`;
      
      if (map.current!.getLayer(layerId)) {
        map.current!.removeLayer(layerId);
      }
      
      if (map.current!.getSource(sourceId)) {
        map.current!.removeSource(sourceId);
      }
    });
    
    // Rota bilgilerini sıfırla
    setRoutes([]);
    setRouteDistance(null);
    setRouteDuration(null);
  };
  
  // Rota modunu değiştirme fonksiyonu
  const changeRouteMode = (mode: RouteMode) => {
    setRouteMode(mode);
    
    // Eğer başlangıç ve bitiş noktaları seçiliyse, rotayı yeniden hesapla
    if (routeStart && routeEnd) {
      calculateRoute();
    }
  };
  
  // Başlangıç noktası seçme işlevi
  const setStartPoint = (lngLat: [number, number]) => {
    setRouteStart(lngLat);
    
    // Başlangıç noktasını haritada göster
    addMarker(lngLat, 'start-marker', '#33cc33', 'Başlangıç Noktası');
    
    // Eğer bitiş noktası da seçiliyse, rotayı hesapla
    if (routeEnd) {
      calculateRoute();
    }
  };
  
  // Bitiş noktası seçme işlevi
  const setEndPoint = (lngLat: [number, number]) => {
    setRouteEnd(lngLat);
    
    // Bitiş noktasını haritada göster
    addMarker(lngLat, 'end-marker', '#cc3333', 'Bitiş Noktası');
    
    // Eğer başlangıç noktası da seçiliyse, rotayı hesapla
    if (routeStart) {
      calculateRoute();
    }
  };
  
  // Marker ekleme yardımcı fonksiyonu
  const addMarker = (lngLat: [number, number], id: string, color: string, title: string) => {
    if (!map.current) return;
    
    // Önceki işaretçiyi kaldır
    const existingMarker = document.getElementById(id);
    if (existingMarker && existingMarker.parentNode) {
      existingMarker.parentNode.removeChild(existingMarker);
    }
    
    // Özel işaretçi element
    const el = document.createElement('div');
    el.id = id;
    el.className = 'custom-marker';
    el.style.backgroundColor = color;
    el.style.width = '20px';
    el.style.height = '20px';
    el.style.borderRadius = '50%';
    el.style.border = '2px solid white';
    el.style.boxShadow = '0 0 5px rgba(0,0,0,0.3)';
    
    // Popup içeriği
    const popup = new mapboxgl.Popup({ offset: 25 })
      .setHTML(`<h3>${title}</h3><p>Koordinatlar: ${lngLat[0].toFixed(4)}, ${lngLat[1].toFixed(4)}</p>`);
    
    // İşaretçiyi ekle
    new mapboxgl.Marker(el)
      .setLngLat(lngLat)
      .setPopup(popup)
      .addTo(map.current);
  };
  
  // Rota modu aktifleştirme fonksiyonu
  const toggleRoutingMode = () => {
    const newMode = !isRoutingActive;
    setIsRoutingActive(newMode);
    
    if (newMode) {
      // Rota modu aktifleştirildiğinde çizim modunu kapat
      if (drawMode) {
        setDrawMode(null);
        draw.current?.changeMode('simple_select');
      }
      
      // Önceki rotaları temizle
      clearRoutes();
      setRouteStart(null);
      setRouteEnd(null);
      
      // Fare tıklaması ile nokta seçme işlevini ekle
      map.current?.on('click', handleRoutingClick);
      
      notification.info({
        message: 'Rota Modu Aktif',
        description: 'Haritada ilk tıkladığınız yer başlangıç noktası, ikinci tıkladığınız yer bitiş noktası olacaktır.',
      });
    } else {
      // Rota modunu kapattığında, olay dinleyicilerini kaldır
      map.current?.off('click', handleRoutingClick);
      
      // Rotaları temizle
      clearRoutes();
      setRouteStart(null);
      setRouteEnd(null);
    }
  };
  
  // Rota modu tıklama olayı
  const handleRoutingClick = (e: mapboxgl.MapMouseEvent) => {
    if (!isRoutingActive) return;
    
    const lngLat: [number, number] = [e.lngLat.lng, e.lngLat.lat];
    
    if (!routeStart) {
      // Başlangıç noktası seçilmemişse, ilk tıklamada başlangıç noktasını ayarla
      setStartPoint(lngLat);
    } else if (!routeEnd) {
      // Başlangıç seçilmiş ama bitiş seçilmemişse, bitiş noktasını ayarla
      setEndPoint(lngLat);
    } else {
      // Her ikisi de seçilmişse, yeni bir rota hesaplamaya başla
      clearRoutes();
      setStartPoint(lngLat);
      setRouteEnd(null);
    }
  };
  
  // Acil durum katmanlarını ekle
  const addEmergencyLayers = () => {
    if (!map.current || !isMapLoaded) return;
    
    try {
      // Sığınak katmanı
      addEmergencyLayer(
        'shelters-layer',
        'shelters-data',
        {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {
                name: 'Ana Sığınak',
                capacity: 1000
              },
              geometry: {
                type: 'Point',
                coordinates: [32.866287, 39.925533] // Ankara
              }
            },
            {
              type: 'Feature',
              properties: {
                name: 'İkincil Sığınak',
                capacity: 500
              },
              geometry: {
                type: 'Point',
                coordinates: [29.0335, 41.0053] // İstanbul
              }
            }
          ]
        },
        '#2a81cb'
      );
      
      // Sağlık merkezleri
      addEmergencyLayer(
        'hospitals-layer',
        'hospitals-data',
        {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {
                name: 'Merkez Hastanesi',
                capacity: 500
              },
              geometry: {
                type: 'Point',
                coordinates: [32.8135, 39.9735]
              }
            },
            {
              type: 'Feature',
              properties: {
                name: 'Üniversite Hastanesi',
                capacity: 800
              },
              geometry: {
                type: 'Point',
                coordinates: [28.9506, 41.0151]
              }
            }
          ]
        },
        '#e41e25'
      );
      
      // Lojistik merkezleri
      addEmergencyLayer(
        'logistics-layer',
        'logistics-data',
        {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {
                name: 'AFAD Lojistik Deposu',
                capacity: 1000
              },
              geometry: {
                type: 'Point',
                coordinates: [32.8235, 39.9155]
              }
            }
          ]
        },
        '#ff9900'
      );
      
      // Su kaynakları
      addEmergencyLayer(
        'water-layer',
        'water-data',
        {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {
                name: 'Acil Su Dağıtım Noktası',
                capacity: 500
              },
              geometry: {
                type: 'Point',
                coordinates: [32.8535, 39.9355]
              }
            }
          ]
        },
        '#00aaff'
      );
    } catch (error) {
      console.error('Acil durum katmanları eklenirken hata:', error);
    }
  };
  
  // Yangın verilerini haritaya ekle
  const addFiresLayer = () => {
    if (!map.current || !isMapLoaded || !fires.length) return;

    try {
      const fireFeatures = fires.map(fire => ({
        type: 'Feature',
        properties: {
          id: fire.id,
          brightness: fire.brightness,
          confidence: fire.confidence,
          frp: fire.frp,
          satellite: fire.satellite,
          location: fire.location,
          date: fire.date
        },
        geometry: {
          type: 'Point',
          coordinates: [fire.longitude, fire.latitude]
        }
      }));

      const fireData = {
        type: 'FeatureCollection',
        features: fireFeatures
      };

      // Yangın katmanını ekle
      if (map.current.getSource('fires-data')) {
        (map.current.getSource('fires-data') as mapboxgl.GeoJSONSource).setData(fireData);
      } else {
        map.current.addSource('fires-data', {
          type: 'geojson',
          data: fireData
        });

        // Yangın noktaları katmanı
        map.current.addLayer({
          id: 'fires-layer',
          type: 'circle',
          source: 'fires-data',
          paint: {
            'circle-radius': [
              'interpolate',
              ['linear'],
              ['get', 'frp'],
              0, 4,
              50, 8,
              100, 12,
              200, 16
            ],
            'circle-color': [
              'interpolate',
              ['linear'],
              ['get', 'frp'],
              0, '#ffeb3b',
              50, '#ff9800',
              100, '#f44336',
              200, '#d32f2f'
            ],
            'circle-opacity': 0.8,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff'
          }
        });

        // Popup ekle
        map.current.on('click', 'fires-layer', (e) => {
          const fire = e.features?.[0]?.properties;
          if (fire) {
            new mapboxgl.Popup()
              .setLngLat(e.lngLat)
              .setHTML(`
                <div style="padding: 10px;">
                  <h3 style="margin: 0 0 8px 0; color: #d4380d;">🔥 Yangın Tespit</h3>
                  <p><strong>Konum:</strong> ${fire.location || 'Bilinmeyen'}</p>
                  <p><strong>Parlaklık:</strong> ${fire.brightness || 'N/A'}K</p>
                  <p><strong>Güven:</strong> ${fire.confidence || 'N/A'}%</p>
                  <p><strong>FRP:</strong> ${fire.frp || 'N/A'} MW</p>
                  <p><strong>Uydu:</strong> ${fire.satellite || 'N/A'}</p>
                  <p><strong>Tarih:</strong> ${new Date(fire.date).toLocaleString('tr-TR')}</p>
                </div>
              `)
              .addTo(map.current!);
          }
        });

        map.current.on('mouseenter', 'fires-layer', () => {
          map.current!.getCanvas().style.cursor = 'pointer';
        });

        map.current.on('mouseleave', 'fires-layer', () => {
          map.current!.getCanvas().style.cursor = '';
        });
      }
    } catch (error) {
      console.error('Yangın katmanı eklenirken hata:', error);
    }
  };

  // Tsunami uyarılarını haritaya ekle
  const addTsunamiLayer = () => {
    if (!map.current || !isMapLoaded || !tsunamiAlerts.length) return;

    try {
      const tsunamiFeatures = tsunamiAlerts.map(tsunami => ({
        type: 'Feature',
        properties: {
          id: tsunami.id,
          alert_level: tsunami.alert_level,
          status: tsunami.status,
          magnitude: tsunami.magnitude,
          depth: tsunami.depth,
          affected_regions: tsunami.affected_regions,
          location: tsunami.location,
          date: tsunami.date
        },
        geometry: {
          type: 'Point',
          coordinates: [tsunami.longitude, tsunami.latitude]
        }
      }));

      const tsunamiData = {
        type: 'FeatureCollection',
        features: tsunamiFeatures
      };

      // Tsunami katmanını ekle
      if (map.current.getSource('tsunami-data')) {
        (map.current.getSource('tsunami-data') as mapboxgl.GeoJSONSource).setData(tsunamiData);
      } else {
        map.current.addSource('tsunami-data', {
          type: 'geojson',
          data: tsunamiData
        });

        // Tsunami uyarıları katmanı
        map.current.addLayer({
          id: 'tsunami-layer',
          type: 'circle',
          source: 'tsunami-data',
          paint: {
            'circle-radius': [
              'case',
              ['==', ['get', 'alert_level'], 'Warning'], 16,
              ['==', ['get', 'alert_level'], 'Watch'], 12,
              8
            ],
            'circle-color': [
              'case',
              ['==', ['get', 'alert_level'], 'Warning'], '#f5222d',
              ['==', ['get', 'alert_level'], 'Watch'], '#faad14',
              '#52c41a'
            ],
            'circle-opacity': 0.8,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#fff'
          }
        });

        // Popup ekle
        map.current.on('click', 'tsunami-layer', (e) => {
          const tsunami = e.features?.[0]?.properties;
          if (tsunami) {
            new mapboxgl.Popup()
              .setLngLat(e.lngLat)
              .setHTML(`
                <div style="padding: 10px;">
                  <h3 style="margin: 0 0 8px 0; color: #1890ff;">🌊 Tsunami Uyarısı</h3>
                  <p><strong>Seviye:</strong> <span style="color: ${
                    tsunami.alert_level === 'Warning' ? '#f5222d' : 
                    tsunami.alert_level === 'Watch' ? '#faad14' : '#52c41a'
                  }; font-weight: bold;">${tsunami.alert_level}</span></p>
                  <p><strong>Durum:</strong> ${tsunami.status}</p>
                  <p><strong>Konum:</strong> ${tsunami.location || 'Bilinmeyen'}</p>
                  <p><strong>Büyüklük:</strong> ${tsunami.magnitude || 'N/A'}</p>
                  <p><strong>Derinlik:</strong> ${tsunami.depth || 'N/A'} km</p>
                  <p><strong>Etkilenen Bölgeler:</strong> ${tsunami.affected_regions || 'N/A'}</p>
                  <p><strong>Tarih:</strong> ${new Date(tsunami.date).toLocaleString('tr-TR')}</p>
                </div>
              `)
              .addTo(map.current!);
          }
        });

        map.current.on('mouseenter', 'tsunami-layer', () => {
          map.current!.getCanvas().style.cursor = 'pointer';
        });

        map.current.on('mouseleave', 'tsunami-layer', () => {
          map.current!.getCanvas().style.cursor = '';
        });
      }
    } catch (error) {
      console.error('Tsunami katmanı eklenirken hata:', error);
    }
  };

  // Deprem verilerini haritaya ekle
  const addEarthquakesLayer = () => {
    if (!map.current || !isMapLoaded || !earthquakes.length) return;

    try {
      const earthquakeFeatures = earthquakes.map(earthquake => ({
        type: 'Feature',
        properties: {
          id: earthquake.id,
          magnitude: earthquake.magnitude,
          depth: earthquake.depth,
          source: earthquake.source,
          location: earthquake.location,
          date: earthquake.date
        },
        geometry: {
          type: 'Point',
          coordinates: [earthquake.longitude, earthquake.latitude]
        }
      }));

      const earthquakeData = {
        type: 'FeatureCollection',
        features: earthquakeFeatures
      };

      // Deprem katmanını ekle
      if (map.current.getSource('earthquakes-data')) {
        (map.current.getSource('earthquakes-data') as mapboxgl.GeoJSONSource).setData(earthquakeData);
      } else {
        map.current.addSource('earthquakes-data', {
          type: 'geojson',
          data: earthquakeData
        });

        // Deprem noktaları katmanı
        map.current.addLayer({
          id: 'earthquakes-layer',
          type: 'circle',
          source: 'earthquakes-data',
          paint: {
            'circle-radius': [
              'interpolate',
              ['linear'],
              ['get', 'magnitude'],
              0, 4,
              3, 6,
              5, 10,
              7, 16,
              9, 24
            ],
            'circle-color': [
              'interpolate',
              ['linear'],
              ['get', 'magnitude'],
              0, '#722ed1',
              3, '#9254de',
              5, '#b37feb',
              7, '#d3adf7',
              9, '#efdbff'
            ],
            'circle-opacity': 0.8,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff'
          }
        });

        // Popup ekle
        map.current.on('click', 'earthquakes-layer', (e) => {
          const earthquake = e.features?.[0]?.properties;
          if (earthquake) {
            new mapboxgl.Popup()
              .setLngLat(e.lngLat)
              .setHTML(`
                <div style="padding: 10px;">
                  <h3 style="margin: 0 0 8px 0; color: #722ed1;">⚡ Deprem</h3>
                  <p><strong>Büyüklük:</strong> ${earthquake.magnitude || 'N/A'}</p>
                  <p><strong>Derinlik:</strong> ${earthquake.depth || 'N/A'} km</p>
                  <p><strong>Konum:</strong> ${earthquake.location || 'Bilinmeyen'}</p>
                  <p><strong>Kaynak:</strong> ${earthquake.source || 'N/A'}</p>
                  <p><strong>Tarih:</strong> ${new Date(earthquake.date).toLocaleString('tr-TR')}</p>
                </div>
              `)
              .addTo(map.current!);
          }
        });

        map.current.on('mouseenter', 'earthquakes-layer', () => {
          map.current!.getCanvas().style.cursor = 'pointer';
        });

        map.current.on('mouseleave', 'earthquakes-layer', () => {
          map.current!.getCanvas().style.cursor = '';
        });
      }
    } catch (error) {
      console.error('Deprem katmanı eklenirken hata:', error);
    }
  };
  
  // Konum işaretçisi ekleme modunu aktif/pasif yapma
  const [isMarkerMode, setIsMarkerMode] = useState<boolean>(false);

  // Haritaya manuel konum işaretçisi ekleme
  const toggleMarkerMode = () => {
    const newMarkerMode = !isMarkerMode;
    setIsMarkerMode(newMarkerMode);
    
    if (newMarkerMode) {
      // Rota modunu ve diğer modları kapat
      setIsRoutingActive(false);
      setEraserMode(false);
      if (draw.current) {
        setDrawMode(null);
        draw.current.changeMode('simple_select');
      }
      
      notification.info({
        message: 'İşaretçi Ekleme Modu',
        description: 'Haritaya tıklayarak konum işaretçisi ekleyebilirsiniz.',
      });
      
      // Haritaya tıklama olayını ekle
      map.current?.on('click', handleMarkerAdd);
    } else {
      // Tıklama olayını kaldır
      map.current?.off('click', handleMarkerAdd);
    }
  };

  // Haritaya tıklandığında işaretçi ekleme
  const handleMarkerAdd = (e: mapboxgl.MapMouseEvent) => {
    if (!isMarkerMode || !map.current) return;
    
    const lngLat: [number, number] = [e.lngLat.lng, e.lngLat.lat];
    
    // Popover açılacak form içeriği
    const marker = new mapboxgl.Marker({
      draggable: true,
      color: '#1890ff'
    }).setLngLat(lngLat).addTo(map.current);
    
    // Popup içeriği
    const popupContent = document.createElement('div');
    popupContent.className = 'custom-popup';
    popupContent.innerHTML = `
      <h4>Konum İşaretçisi</h4>
      <p>Konum: ${lngLat[1].toFixed(5)}° K, ${lngLat[0].toFixed(5)}° D</p>
      <div style="display: flex; justify-content: space-between; margin-top: 8px;">
        <button class="marker-use-btn">Başlangıç Noktası Yap</button>
        <button class="marker-delete-btn">Sil</button>
      </div>
      <div style="margin-top: 8px;">
        <button class="marker-use-as-end-btn">Bitiş Noktası Yap</button>
      </div>
    `;
    
    const popup = new mapboxgl.Popup({ offset: 25 })
      .setDOMContent(popupContent)
      .setLngLat(lngLat);
    
    marker.setPopup(popup);
    
    // Sürükleyince konumu güncelle
    marker.on('dragend', () => {
      const newLngLat = marker.getLngLat();
      popup.setLngLat(newLngLat);
      
      // Popup içeriğini güncelle
      if (popupContent.querySelector('p')) {
        popupContent.querySelector('p')!.innerHTML = `Konum: ${newLngLat.lat.toFixed(5)}° K, ${newLngLat.lng.toFixed(5)}° D`;
      }
    });
    
    // Click eventlerini ekle
    setTimeout(() => {
      const useAsStartBtn = popupContent.querySelector('.marker-use-btn');
      const useAsEndBtn = popupContent.querySelector('.marker-use-as-end-btn');
      const deleteBtn = popupContent.querySelector('.marker-delete-btn');
      
      if (useAsStartBtn) {
        useAsStartBtn.addEventListener('click', () => {
          const newLngLat = marker.getLngLat();
          setStartPoint([newLngLat.lng, newLngLat.lat]);
          setIsRoutingActive(true);
          popup.remove();
        });
      }
      
      if (useAsEndBtn) {
        useAsEndBtn.addEventListener('click', () => {
          const newLngLat = marker.getLngLat();
          setEndPoint([newLngLat.lng, newLngLat.lat]);
          setIsRoutingActive(true);
          popup.remove();
        });
      }
      
      if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
          marker.remove();
        });
      }
    }, 100);
    
    // Popup'ı göster
    popup.addTo(map.current);
  };
  
  // Excel verilerini işleme fonksiyonu
  const processExcelData = async () => {
    if (!uploadedFile) {
      notification.error({
        message: 'Dosya Seçilmedi',
        description: 'Lütfen bir Excel dosyası yükleyin.',
      });
      return;
    }
    
    try {
      // Burada gerçek bir uygulamada Excel dosyasını okuyup verileri işleyebilirsiniz
      // Örnek olarak başarılı olduğunu varsayalım
      
      // Dosya işleme başarılı mesajı
      notification.success({
        message: 'Veri Yükleme Başarılı',
        description: `${uploadType} verileri başarıyla yüklendi.`,
      });
      
      // Modal'ı kapat
      setIsUploadModalVisible(false);
      setUploadedFile(null);
      
    } catch (error) {
      console.error('Excel veri işleme hatası:', error);
      notification.error({
        message: 'Veri Yükleme Hatası',
        description: 'Veriler işlenirken bir hata oluştu. Lütfen dosya formatını kontrol edin.',
      });
    }
  };
  
  // Acil durum konumu ekleme fonksiyonu
  const addEmergencyLocation = (values: any) => {
    const { title, type, severity, description, longitude, latitude } = values;
    
    try {
      // Burada gerçek bir uygulamada veritabanına kaydetme işlemi yapılabilir
      // Örnek olarak başarılı olduğunu varsayalım
      
      notification.success({
        message: 'Konum Başarıyla Eklendi',
        description: `${title} başarıyla eklendi.`,
      });
      
      // İlgili katmanı görünür yap
      if (!activeLayers.includes(`${type}-layer`)) {
        setActiveLayers([...activeLayers, `${type}-layer`]);
      }
      
    } catch (error) {
      console.error('Konum ekleme hatası:', error);
      notification.error({
        message: 'Konum Ekleme Hatası',
        description: 'Konum eklenirken bir hata oluştu.',
      });
    }
  };
  
  if (!mapboxToken) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', position: 'relative', zIndex: 100 }}>
        <div style={{ textAlign: 'center' }}>
          <Spin size="large" />
          <div style={{ marginTop: '10px' }}>Mapbox API anahtarı bulunamadı...</div>
        </div>
      </div>
    );
  }
  
  // Rota mesafesini biçimlendirme (km veya m cinsinden)
  const formatDistance = (distance: number): string => {
    if (!distance) return '0 m';
    if (distance < 1000) {
      return `${Math.round(distance)} m`;
    } else {
      return `${(distance / 1000).toFixed(1)} km`;
    }
  };

  // Rota süresini biçimlendirme (saat, dakika cinsinden)
  const formatDuration = (duration: number): string => {
    if (!duration) return '0 dk';
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    
    if (hours > 0) {
      return `${hours} sa ${minutes} dk`;
    } else {
      return `${minutes} dk`;
    }
  };

  // Rota modu için ikon belirleme
  const getRouteIcon = (mode: RouteMode) => {
    switch (mode) {
      case 'driving':
        return <CarOutlined />;
      case 'walking':
        return <UserOutlined />;
      case 'cycling':
        return <EnvironmentOutlined />;
      default:
        return <EnvironmentOutlined />;
    }
  };

  // Rota modu ismi belirleme
  const getRouteModeName = (mode: RouteMode): string => {
    switch (mode) {
      case 'driving':
        return 'Araç';
      case 'walking':
        return 'Yürüyüş';
      case 'cycling':
        return 'Bisiklet';
      default:
        return 'Araç';
    }
  };
  
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', zIndex: 100 }}>
      <div 
        ref={mapContainerRef} 
        style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 100 }}
      ></div>
      
      {!isMapLoaded && (
        <div 
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            background: 'rgba(255, 255, 255, 0.8)',
            flexDirection: 'column',
            zIndex: 200
          }}
        >
          <Spin size="large" />
          <div style={{ marginTop: '10px', fontWeight: 'bold' }}>Harita yükleniyor...</div>
        </div>
      )}
      
      {/* Harita katman seçimi */}
      {isMapLoaded && (
        <Button
          type="primary"
          icon={<MenuOutlined />}
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            zIndex: 210,
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
          }}
          onClick={() => setIsMenuOpen(true)}
        />
      )}
      
      {/* Yan menü çekmecesi */}
      <Drawer
        title="Harita Kontrol Paneli"
        placement="left"
        closable={true}
        onClose={() => setIsMenuOpen(false)}
        open={isMenuOpen}
        width={300}
      >
        <Tabs defaultActiveKey="layers" items={[
          {
            key: "layers",
            label: "Harita",
            children: (
              <>
                {/* Harita Tipi */}
                <div style={{ marginBottom: '16px' }}>
                  <Typography.Text strong style={{ display: 'block', marginBottom: '8px' }}>
                    <GlobalOutlined style={{ marginRight: '5px' }} />
                    Harita Tipi
                  </Typography.Text>
                  <Select
                    style={{ width: '100%' }}
                    value={selectedMapLayer}
                    onChange={setSelectedMapLayer}
                    popupMatchSelectWidth={false}
                    placeholder="Harita Tipi"
                  >
                    {mapLayers.map(layer => (
                      <Select.Option key={layer.id} value={layer.id}>
                        {layer.icon ? <span style={{ marginRight: 8 }}>{layer.icon}</span> : null}
                        {layer.name}
                      </Select.Option>
                    ))}
                  </Select>
                </div>
                
                {/* 3D/2D Görünüm Geçişi */}
                <div style={{ marginBottom: '16px' }}>
                  <Typography.Text strong style={{ display: 'block', marginBottom: '8px' }}>
                    <ColumnHeightOutlined rotate={90} style={{ marginRight: '5px' }} />
                    Görünüm Modu
                  </Typography.Text>
                  <Button
                    type={is3DActive ? "primary" : "default"}
                    onClick={() => toggle3DMode(!is3DActive)}
                    icon={is3DActive ? <BlockOutlined /> : <ColumnHeightOutlined rotate={90} />}
                    style={{ marginRight: '8px' }}
                  >
                    {is3DActive ? "3D Modu Kapat" : "3D Modu Aç"}
                  </Button>
                </div>
                
                {/* Tüm Katmanlar (tek bir yerde birleştirildi) */}
                <div style={{ marginBottom: '16px' }}>
                  <Typography.Text strong style={{ display: 'block', marginBottom: '8px' }}>
                    <AlertOutlined style={{ marginRight: '5px' }} />
                    Katmanlar
                  </Typography.Text>
                  <Select
                    mode="multiple"
                    style={{ width: '100%' }}
                    placeholder="Katmanları seçin"
                    value={activeLayers}
                    onChange={setActiveLayers}
                    optionLabelProp="label"
                    maxTagCount="responsive"
                  >
                    {/* Özel Katmanlar */}
                    <Select.OptGroup label="Genel Katmanlar">
                      {customLayers.map((layer) => (
                        <Select.Option key={layer.id} value={layer.id} label={layer.name}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span style={{ marginRight: '8px' }}>{layer.icon}</span>
                            {layer.name}
                          </div>
                        </Select.Option>
                      ))}
                    </Select.OptGroup>
                    
                    {/* Acil Durum Katmanları */}
                    <Select.OptGroup label="Acil Durum Altyapısı">
                      {emergencyLayers.map((layer) => (
                        <Select.Option key={layer.id} value={layer.id} label={layer.name}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span style={{ marginRight: '8px' }}>{layer.icon}</span>
                            {layer.name}
                          </div>
                        </Select.Option>
                      ))}
                    </Select.OptGroup>
                  </Select>
                </div>
              </>
            )
          },
          {
            key: "route",
            label: "Rota",
            children: (
              <>
                {/* Rota Planlama */}
                <div style={{ marginBottom: '16px' }}>
                  <Typography.Text strong style={{ display: 'block', marginBottom: '8px' }}>
                    <EnvironmentOutlined style={{ marginRight: '5px' }} />
                    Rota Planlama
                  </Typography.Text>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <Button 
                      type={isRoutingActive ? "primary" : "default"}
                      onClick={toggleRoutingMode}
                      icon={<AimOutlined />}
                      style={{ marginRight: '8px', flex: 1 }}
                    >
                      {isRoutingActive ? "Kapat" : "Rota Modu"}
                    </Button>
                    
                    <Button
                      type={isMarkerMode ? "primary" : "default"}
                      onClick={toggleMarkerMode}
                      icon={<PushpinOutlined />}
                      style={{ marginRight: '8px', flex: 1 }}
                    >
                      {isMarkerMode ? "Kapat" : "İşaretçi"}
                    </Button>
                  </div>
                  
                  {/* Rota bölümü içeriği - isRoutingActive true olduğunda göster */}
                  {isRoutingActive && (
                    <>
                      <Radio.Group 
                        value={routeMode}
                        onChange={(e) => setRouteMode(e.target.value)}
                        style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}
                      >
                        <Radio.Button value="driving"><CarOutlined /> Araç</Radio.Button>
                        <Radio.Button value="walking"><SolutionOutlined /> Yaya</Radio.Button>
                        <Radio.Button value="cycling"><ToolOutlined /> Bisiklet</Radio.Button>
                      </Radio.Group>
                      
                      <Alert 
                        message="Başlangıç ve bitiş noktalarını işaretlemek için haritaya tıklayın"
                        type="info" 
                        showIcon 
                        style={{ marginBottom: '8px' }}
                      />
                      
                      <Checkbox 
                        checked={showAlternatives} 
                        onChange={(e) => setShowAlternatives(e.target.checked)}
                        style={{ marginBottom: '8px' }}
                      >
                        Alternatif rotaları göster
                      </Checkbox>
                    </>
                  )}
                
                  {routes.length > 0 && (
                    <>
                      <Divider plain>Rotalar</Divider>
                      <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '8px' }}>
                        {routes.map((route, index) => (
                          <div key={index} style={{ padding: '8px', border: '1px solid #f0f0f0', marginBottom: '8px', borderRadius: '4px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Tag color="blue">Rota {index + 1}</Tag>
                              <Typography.Text type="secondary">{formatDistance(route.distance)}</Typography.Text>
                            </div>
                            <div style={{ marginTop: '4px' }}>
                              <Tag color="green">{formatDuration(route.duration)}</Tag>
                              <Tag icon={getRouteIcon(route.routeMode)}>{getRouteModeName(route.routeMode)}</Tag>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Button 
                        danger
                        onClick={clearRoutes} 
                        style={{ width: '100%' }}
                        icon={<DeleteOutlined />}
                      >
                        Rotaları Temizle
                      </Button>
                    </>
                  )}
                </div>
              </>
            )
          },
          {
            key: "data",
            label: "Veri Yönetimi",
            children: (
              <>
                {/* Acil Durum Verisi Ekleme */}
                <div style={{ marginBottom: '16px' }}>
                  <Typography.Text strong style={{ display: 'block', marginBottom: '8px' }}>
                    <FireOutlined style={{ marginRight: '5px' }} />
                    Acil Durum Verisi Ekle
                  </Typography.Text>
                  
                  <Form layout="vertical" onFinish={addEmergencyLocation}>
                    <Form.Item label="Başlık" name="title" rules={[{ required: true }]}>
                      <Input placeholder="Acil durum başlığı" />
                    </Form.Item>
                    
                    <Form.Item label="Tür" name="type" rules={[{ required: true }]}>
                      <Select placeholder="Acil durum türü">
                        <Select.Option value="shelters">Barınma Alanı</Select.Option>
                        <Select.Option value="hospitals">Sağlık Merkezi</Select.Option>
                        <Select.Option value="logistics">Lojistik Merkezi</Select.Option>
                        <Select.Option value="water">Su Kaynağı</Select.Option>
                        <Select.Option value="electrical">Elektrik Altyapısı</Select.Option>
                        <Select.Option value="communication">İletişim Altyapısı</Select.Option>
                        <Select.Option value="evacuation-routes">Tahliye Rotası</Select.Option>
                      </Select>
                    </Form.Item>
                    
                    <Form.Item label="Açıklama" name="description">
                      <Input.TextArea placeholder="Detaylı açıklama..." rows={3} />
                    </Form.Item>
                    
                    <Form.Item>
                      <Button type="primary" htmlType="submit" icon={<PlusOutlined />} block>
                        Ekle
                      </Button>
                    </Form.Item>
                  </Form>
                </div>
              </>
            )
          }
        ]} />
      </Drawer>
      
      {/* Excel yükleme modalı */}
      <Modal
        title="Excel ile Veri Yükleme"
        open={isUploadModalVisible}
        onCancel={() => setIsUploadModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsUploadModalVisible(false)}>
            İptal
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            onClick={processExcelData}
            disabled={!uploadedFile}
          >
            Yükle
          </Button>
        ]}
      >
        <div style={{ marginBottom: '16px' }}>
          <Typography.Text>Veri Türü</Typography.Text>
          <Select 
            style={{ width: '100%', marginTop: '8px' }}
            value={uploadType}
            onChange={setUploadType}
          >
            <Select.Option value="shelters">Barınma Alanları</Select.Option>
            <Select.Option value="hospitals">Sağlık Merkezleri</Select.Option>
            <Select.Option value="logistics">Lojistik Merkezleri</Select.Option>
            <Select.Option value="water">Su Kaynakları</Select.Option>
            <Select.Option value="electrical">Elektrik Altyapısı</Select.Option>
            <Select.Option value="communication">İletişim Altyapısı</Select.Option>
            <Select.Option value="evacuation-routes">Tahliye Rotaları</Select.Option>
          </Select>
        </div>
        
        <Upload
          beforeUpload={(file) => {
            const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                          file.type === 'application/vnd.ms-excel';
            if (!isExcel) {
              message.error('Sadece Excel dosyası yükleyebilirsiniz!');
              return Upload.LIST_IGNORE;
            }
            setUploadedFile(file);
            return false;
          }}
          maxCount={1}
          onRemove={() => setUploadedFile(null)}
        >
          <Button icon={<UploadOutlined />}>Excel Dosyası Seçin</Button>
        </Upload>
        
        <div style={{ marginTop: '16px', fontSize: '12px', color: '#999' }}>
          Not: Excel dosyanız her veri türü için belirlenen zorunlu alanları içermelidir. Örnek şablonu <a href="#">buradan</a> indirebilirsiniz.
        </div>
      </Modal>
      
      {/* Çizim araçları butonu */}
      {isMapLoaded && enableDrawing && (
        <Tooltip title={showDrawingTools ? "Çizim Araçlarını Gizle" : "Çizim Araçlarını Göster"}>
          <Button
            icon={<EditOutlined />}
            onClick={() => setShowDrawingTools(!showDrawingTools)}
            type={showDrawingTools ? "primary" : "default"}
            style={{ 
              position: 'absolute', 
              top: '160px', 
              right: '10px', 
              zIndex: 200
            }}
          />
        </Tooltip>
      )}
      
      {/* Çizim araçları panel */}
      {isMapLoaded && enableDrawing && (isFullscreen ? true : showDrawingTools) && (
        <div
          style={{ 
            position: 'absolute', 
            top: isFullscreen ? '80px' : '200px', 
            right: '10px', 
            zIndex: 200,
            backgroundColor: 'white',
            padding: '10px',
            borderRadius: '4px',
            boxShadow: '0 0 10px rgba(0,0,0,0.2)',
            width: '50px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <Tooltip title="Nokta Ekle">
            <Button
              icon={<PushpinOutlined />}
              type={drawMode === 'point' ? 'primary' : 'default'}
              onClick={() => changeDrawMode('point')}
              shape="circle"
            />
          </Tooltip>
          
          <Tooltip title="Çizgi Çiz">
            <Button
              icon={<LineOutlined />}
              type={drawMode === 'line' ? 'primary' : 'default'}
              onClick={() => changeDrawMode('line')}
              shape="circle"
            />
          </Tooltip>
          
          <Tooltip title="Çokgen Çiz">
            <Button
              icon={<AreaChartOutlined />}
              type={drawMode === 'polygon' ? 'primary' : 'default'}
              onClick={() => changeDrawMode('polygon')}
              shape="circle"
            />
          </Tooltip>
          
          <Tooltip title="Dikdörtgen Çiz">
            <Button
              icon={<BorderOutlined />}
              type={drawMode === 'rectangle' ? 'primary' : 'default'}
              onClick={() => changeDrawMode('rectangle')}
              shape="circle"
            />
          </Tooltip>
          
          <Tooltip title="Silgi (Seçili Öğeyi Sil)">
            <Button
              icon={<RestOutlined />}
              type={eraserMode ? 'primary' : 'default'}
              onClick={toggleEraserMode}
              shape="circle"
            />
          </Tooltip>
          
          <Tooltip title="Çizim Rengi">
            <ColorPicker
              value={currentColor}
              onChange={(color) => setCurrentColor(color.toHexString())}
              size="small"
              showText={false}
              presets={[
                {
                  label: 'Önerilen Renkler',
                  colors: [
                    '#f5222d', // Kırmızı
                    '#fa8c16', // Turuncu
                    '#fadb14', // Sarı
                    '#52c41a', // Yeşil
                    '#1890ff', // Mavi
                    '#722ed1', // Mor
                    '#eb2f96', // Pembe
                    '#000000', // Siyah
                    '#ffffff', // Beyaz
                  ],
                },
              ]}
            >
              <Button 
                icon={<HighlightOutlined />} 
                style={{ backgroundColor: currentColor, borderColor: currentColor === '#ffffff' ? '#d9d9d9' : currentColor }}
                shape="circle"
              />
            </ColorPicker>
          </Tooltip>

          <Tooltip title="Not Ekle">
            <Button
              icon={<CommentOutlined />}
              onClick={() => {
                if (selectedGeometry) {
                  setNoteModalVisible(true);
                } else {
                  notification.warning({
                    message: 'Seçim Yapılmadı',
                    description: 'Not eklemek için önce bir çizim öğesi seçin.'
                  });
                }
              }}
              shape="circle"
              type={noteModalVisible ? 'primary' : 'default'}
            />
          </Tooltip>
          
          <Tooltip title="Tümünü Temizle">
            <Button
              icon={<DeleteOutlined />}
              onClick={clearDrawing}
              shape="circle"
              danger
            />
          </Tooltip>
          
          {selectedGeometry && typeof onTaskAssign === 'function' && (
            <Tooltip title="Görev Ata">
              <Button
                icon={<TeamOutlined />}
                type="primary"
                onClick={() => setTaskDrawerVisible(true)}
                shape="circle"
              />
            </Tooltip>
          )}
        </div>
      )}
      
      {/* Ölçüm bilgileri göstergesi */}
      {isMapLoaded && enableDrawing && (
        <div
          style={{ 
            position: 'absolute', 
            bottom: '20px', 
            left: '20px', 
            zIndex: 200,
            backgroundColor: 'white',
            padding: '10px',
            borderRadius: '4px',
            boxShadow: '0 0 10px rgba(0,0,0,0.2)',
            minWidth: '200px'
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Ölçüm Bilgileri</div>
          <div>
            <div>Alan: {measurementInfo.area > 0 ? `${measurementInfo.area} m²` : 'Ölçüm yok'}</div>
            {measurementInfo.distance !== null && (
              <div>Mesafe: {measurementInfo.distance} km</div>
            )}
          </div>
        </div>
      )}
      
      {/* Hava durumu bilgisi */}
      {isMapLoaded && weatherData && activeLayers.includes('weather-layer') && (
        <div 
          style={{ 
            position: 'absolute', 
            top: '10px', 
            right: '10px', 
            zIndex: 200 
          }}
        >
          <Card 
            style={{ width: 240, opacity: 0.9 }}
            title={
              <div style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                <CloudOutlined style={{ marginRight: 8 }} />
                {weatherData.name || 'Türkiye'} Hava Durumu
              </div>
            }
            size="small"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '24px' }}>
                  {Math.round(weatherData.main.temp)}°C
                </div>
                <div style={{ textTransform: 'capitalize', fontSize: '12px' }}>
                  {weatherData.weather[0].description}
                </div>
                <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>
                  Min: {Math.round(weatherData.main.temp_min)}° • Maks: {Math.round(weatherData.main.temp_max)}°
                </div>
              </div>
              <div>
                <img 
                  src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`} 
                  alt={weatherData.weather[0].description}
                  style={{ width: 70, height: 70, marginRight: '-10px' }}
                />
              </div>
            </div>
            
            <div style={{ marginTop: '5px', display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ flex: 1, textAlign: 'center', borderRight: '1px solid #eee', padding: '0 5px' }}>
                <div style={{ fontSize: '11px', color: '#888' }}>Nem</div>
                <div style={{ fontWeight: 'bold' }}>{weatherData.main.humidity}%</div>
              </div>
              <div style={{ flex: 1, textAlign: 'center', borderRight: '1px solid #eee', padding: '0 5px' }}>
                <div style={{ fontSize: '11px', color: '#888' }}>Rüzgar</div>
                <div style={{ fontWeight: 'bold' }}>{Math.round(weatherData.wind.speed * 3.6)} km/s</div>
              </div>
              <div style={{ flex: 1, textAlign: 'center', padding: '0 5px' }}>
                <div style={{ fontSize: '11px', color: '#888' }}>Basınç</div>
                <div style={{ fontWeight: 'bold' }}>{weatherData.main.pressure}</div>
              </div>
            </div>
          </Card>
        </div>
      )}
      
      {/* Görev atama çekmece paneli */}
      <Drawer
        title="Çizilen Alana Görev Ata"
        placement="right"
        onClose={() => setTaskDrawerVisible(false)}
        open={taskDrawerVisible}
        width={400}
      >
        <Form
          layout="vertical"
          form={taskForm}
          onFinish={saveAndAssignTask}
        >
          <Form.Item
            name="title"
            label="Görev Başlığı"
            rules={[{ required: true, message: 'Lütfen görev başlığını girin' }]}
          >
            <Input placeholder="Görev başlığını girin" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Görev Açıklaması"
          >
            <Input.TextArea 
              placeholder="Görev detaylarını girin" 
              rows={4}
            />
          </Form.Item>
          
          <Form.Item
            name="priority"
            label="Öncelik"
            initialValue="medium"
          >
            <Radio.Group>
              <Radio.Button value="low">Düşük</Radio.Button>
              <Radio.Button value="medium">Orta</Radio.Button>
              <Radio.Button value="high">Yüksek</Radio.Button>
            </Radio.Group>
          </Form.Item>
          
          <Form.Item
            name="assignedTo"
            label="Atanacak Ekip"
            rules={[{ required: true, message: 'Lütfen bir ekip seçin' }]}
          >
            <Select placeholder="Ekip seçin">
              {taskGroups.map(group => (
                <Select.Option key={group.id} value={group.id}>
                  {group.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                Görevi Oluştur ve Ata
              </Button>
              <Button onClick={() => setTaskDrawerVisible(false)}>
                İptal
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Drawer>
      
      {/* Not ekleme/düzenleme modal */}
      <Modal
        title={editingNote ? "Notu Düzenle" : "Not Ekle"}
        open={noteModalVisible}
        onCancel={() => {
          setNoteModalVisible(false);
          setEditingNote(null);
          noteForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={noteForm}
          layout="vertical"
          onFinish={editingNote ? updateNote : addNoteToGeometry}
          initialValues={editingNote ? { text: editingNote.text, color: editingNote.color } : { color: currentColor }}
        >
          <Form.Item
            name="text"
            label="Not"
            rules={[{ required: true, message: 'Lütfen bir not girin' }]}
          >
            <Input.TextArea 
              rows={4} 
              placeholder="Not içeriğini girin..."
              maxLength={250}
              showCount
            />
          </Form.Item>
          
          <Form.Item
            name="color"
            label="Renk"
          >
            <ColorPicker
              value={editingNote ? editingNote.color : currentColor}
              onChange={(color) => noteForm.setFieldsValue({ color: color.toHexString() })}
              presets={[
                {
                  label: 'Önerilen Renkler',
                  colors: [
                    '#f5222d', // Kırmızı
                    '#fa8c16', // Turuncu
                    '#fadb14', // Sarı
                    '#52c41a', // Yeşil
                    '#1890ff', // Mavi
                    '#722ed1', // Mor
                    '#eb2f96', // Pembe
                    '#000000', // Siyah
                    '#ffffff', // Beyaz
                  ],
                },
              ]}
            />
          </Form.Item>
          
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button 
                onClick={() => {
                  setNoteModalVisible(false);
                  setEditingNote(null);
                  noteForm.resetFields();
                }}
              >
                İptal
              </Button>
              <Button type="primary" htmlType="submit">
                {editingNote ? "Güncelle" : "Ekle"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
      
      {/* Çevrimdışı modda bilgi göster */}
      {isOffline && (
        <div style={{ 
          position: 'absolute', 
          bottom: 40, 
          right: 10, 
          backgroundColor: 'rgba(0,0,0,0.6)', 
          color: 'white', 
          padding: '5px 10px', 
          borderRadius: 4,
          zIndex: 999 
        }}>
          <Tag color="orange">Çevrimdışı Mod</Tag>
        </div>
      )}
      
      {/* Konum arama kutusu */}
      {isMapLoaded && (
        <div 
          style={{ 
            position: 'absolute', 
            top: '10px', 
            left: '50%', 
            transform: 'translateX(-50%)',
            zIndex: 200,
            width: '300px'
          }}
        >
          <Input.Search
            placeholder="Konum ara..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onSearch={searchLocation}
            loading={isSearching}
            enterButton
            allowClear
            style={{ width: '100%' }}
          />
          {searchResults.length > 0 && (
            <div style={{ 
              marginTop: '5px',
              backgroundColor: 'white', 
              borderRadius: '4px', 
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              maxHeight: '200px',
              overflowY: 'auto'
            }}>
              <List
                size="small"
                dataSource={searchResults}
                renderItem={item => (
                  <List.Item 
                    style={{ cursor: 'pointer', padding: '8px 12px' }}
                    onClick={() => {
                      map.current?.flyTo({
                        center: item.center,
                        zoom: 12,
                        essential: true
                      });
                      setSearchResults([]);
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{item.text}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>{item.place_name}</div>
                    </div>
                  </List.Item>
                )}
              />
            </div>
          )}
        </div>
      )}
      
      {/* Harita kontrolleri - sağ üst köşede */}
      {isMapLoaded && (
        <div 
          style={{ 
            position: 'absolute', 
            right: '10px', 
            top: '10px', 
            zIndex: 200,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '6px',
              borderRadius: '4px',
              boxShadow: '0 0 10px rgba(0,0,0,0.2)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
          >
            <Tooltip title="Yakınlaştır">
              <Button
                icon={<PlusOutlined />}
                onClick={() => map.current?.zoomIn()}
                size="small"
              />
            </Tooltip>
            <Tooltip title="Uzaklaştır">
              <Button
                icon={<MinusOutlined />}
                onClick={() => map.current?.zoomOut()}
                size="small"
              />
            </Tooltip>
            <Tooltip title="Kuzeye Hizala">
              <Button
                icon={<CompassOutlined />}
                onClick={() => {
                  if (map.current) {
                    map.current.easeTo({
                      bearing: 0,
                      pitch: 0
                    });
                  }
                }}
                size="small"
              />
            </Tooltip>
            <Tooltip title="Tam Ekran">
              <Button
                icon={<FullscreenOutlined />}
                onClick={toggleFullscreen}
                size="small"
              />
            </Tooltip>
            <Tooltip title="İşaretçi Ekle">
              <Button
                icon={<PushpinOutlined />}
                onClick={toggleMarkerMode}
                type={isMarkerMode ? "primary" : "default"}
                size="small"
              />
            </Tooltip>
            <Tooltip title="Çizim Araçları">
              <Button
                icon={<EditOutlined />}
                onClick={() => setShowDrawingTools(!showDrawingTools)}
                type={showDrawingTools ? "primary" : "default"}
                size="small"
              />
            </Tooltip>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapboxProvider; 