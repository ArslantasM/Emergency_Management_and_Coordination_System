import MapWidget from './MapWidget';
import { 
  UserOutlined, 
  FileTextOutlined, 
  BellOutlined, 
  FileDoneOutlined, 
  TeamOutlined, 
  CommentOutlined,
  PhoneOutlined,
  FullscreenOutlined
} from '@ant-design/icons';
import { useSession } from 'next-auth/react';
import { Card, Button } from 'antd';
import { useState, useRef } from 'react';

export function Dashboard({ showWelcome = true, adminStats = false }) {
  const { data: session } = useSession();
  const { user } = (session as any) || { user: null };
  const userRole = user?.role || 'citizen';
  const userRegion = user?.region || '';  // Kullanıcının bölge bilgisini al
  
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const mapRef = useRef(null);
  
  const toggleMapFullscreen = () => {
    setIsMapFullscreen(!isMapFullscreen);
  };

  return (
    <div className="dashboard-grid">
      {/* Map */}
      <div className={`col-span-12 lg:col-span-${adminStats ? 8 : 12} mb-6`}>
        <Card
          title="Harita"
          style={{ height: "100%" }}
          bodyStyle={{ padding: 0, height: "calc(100% - 58px)" }}
          extra={
            <Button type="text" icon={<FullscreenOutlined />} onClick={toggleMapFullscreen}>
              {isMapFullscreen ? "Küçült" : "Tam Ekran"}
            </Button>
          }
        >
          <div ref={mapRef} style={{ height: isMapFullscreen ? "90vh" : "60vh" }}>
            <MapWidget 
              adminMode={userRole === 'admin' || userRole === 'regional_manager'} 
              enableDrawing={userRole === 'admin' || userRole === 'regional_manager' || userRole === 'manager'} 
              enable3D={false}
              userRole={userRole}   // Kullanıcı rolünü ilet
              userRegion={userRegion} // Kullanıcı bölgesini ilet
            />
          </div>
        </Card>
      </div>
    </div>
  );
} 