"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Layout, Menu, Button, theme, Dropdown, Avatar, Spin, Badge } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  TeamOutlined,
  DashboardOutlined,
  AreaChartOutlined,
  EnvironmentOutlined,
  BellOutlined,
  MessageOutlined,
  LogoutOutlined,
  SettingOutlined,
  FileTextOutlined,
  GlobalOutlined,
  ProfileOutlined,
  AppstoreOutlined,
  CalendarOutlined,
  BarChartOutlined,
  CustomerServiceOutlined,
  HomeOutlined,
  CarryOutOutlined,
  UserSwitchOutlined,
  InfoCircleOutlined,
  ApartmentOutlined,
  HeartOutlined,
  ShopOutlined,
  ToolOutlined,
  PieChartOutlined,
  DatabaseOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { UserRole } from '../types/user';
import Image from 'next/image';

const { Header, Sider, Content } = Layout;

// Menü öğesi tipi tanımı
interface MenuItemType {
  key: string;
  icon?: React.ReactNode;
  label: string;
  path: string;
  roles?: UserRole[];
  children?: { 
    key: string;
    label: string;
    path: string;
    roles?: UserRole[];
  }[];
}

// Layout bileşenini optimize ediyoruz
function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [notificationCount, setNotificationCount] = useState(7);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'earthquake',
      title: 'Acil Durum: Deprem Uyarısı',
      description: 'İzmir bölgesinde 4.5 büyüklüğünde deprem kaydedildi.',
      time: '15 dakika önce',
      icon: <BellOutlined />,
      color: '#f5222d'
    },
    {
      id: 2,
      type: 'tsunami',
      title: 'Tsunami Uyarısı',
      description: 'Akdeniz kıyılarında tsunami riski tespit edildi.',
      time: '30 dakika önce',
      icon: <InfoCircleOutlined />,
      color: '#1890ff'
    }
  ]);

  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { token } = theme.useToken();

  // Rol kontrolü
  const isAdmin = session?.user.role === UserRole.ADMIN;
  const isManager = session?.user.role === UserRole.MANAGER;
  const isPersonnel = session?.user.role === UserRole.STAFF;
  const isRegionalManager = session?.user.role === UserRole.REGIONAL_MANAGER;

  // Menü öğelerini bileşen içinde tanımlıyoruz
  const menuItems: MenuItemType[] = useMemo(() => [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Kontrol Paneli',
      path: '/dashboard',
      roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF, UserRole.REGIONAL_MANAGER]
    },
    {
      key: 'notifications',
      icon: <Badge count={notificationCount} size="small"><BellOutlined /></Badge>,
      label: 'Bildirimler',
      path: '/dashboard/notifications',
    },
    {
      key: 'regions',
      icon: <ApartmentOutlined />,
      label: 'Bölge Yönetimi',
      path: '/dashboard/regions',
    },
    {
      key: 'tasks',
      icon: <FileTextOutlined />,
      label: 'Görev Yönetimi',
      path: '/dashboard/tasks',
    },
    {
      key: 'map',
      icon: <EnvironmentOutlined />,
      label: 'Harita',
      path: '/dashboard/map',
    },
    {
      key: 'planning',
      icon: <CalendarOutlined />,
      label: 'Planlama',
      path: '/dashboard/planning',
    },
    {
      key: 'personnel',
      icon: <TeamOutlined />,
      label: 'Personel Yönetimi',
      path: '/dashboard/personnel',
    },
    {
      key: 'volunteers',
      icon: <HeartOutlined />,
      label: 'Gönüllü Yönetimi',
      path: '/dashboard/volunteers',
      children: [
        {
          key: 'volunteer-list',
          label: 'Gönüllüler',
          path: '/dashboard/volunteers',
        },
        {
          key: 'volunteer-training',
          label: 'Eğitim Modülü',
          path: '/dashboard/volunteers/training',
        },
        {
          key: 'volunteer-store',
          label: 'Gönüllü Mağazası',
          path: '/dashboard/volunteers/store',
        },
      ],
    },
    {
      key: 'equipment',
      icon: <ToolOutlined />,
      label: 'Ekipman Yönetimi',
      path: '/dashboard/equipment',
    },
    {
      key: 'inventory',
      icon: <DatabaseOutlined />,
      label: 'Envanter Yönetimi',
      path: '/dashboard/inventory',
    },
    {
      key: 'warehouse',
      icon: <HomeOutlined />,
      label: 'Depo Yönetimi',
      path: '/dashboard/warehouse',
      children: [
        {
          key: 'warehouse-list',
          label: 'Depo Listesi',
          path: '/dashboard/warehouse',
        },
        {
          key: 'warehouse-stock',
          label: 'Depo Stok',
          path: '/dashboard/warehouse/stock',
        },
        {
          key: 'warehouse-personnel',
          label: 'Depo Personel',
          path: '/dashboard/warehouse/personnel',
        },
        {
          key: 'warehouse-vehicles',
          label: 'Depo Araçlar',
          path: '/dashboard/warehouse/vehicles',
        },
        {
          key: 'warehouse-transfers',
          label: 'Depo Transfer',
          path: '/dashboard/warehouse/transfers',
        },
        {
          key: 'warehouse-reports',
          label: 'Depo Raporları',
          path: '/dashboard/warehouse/reports',
        }
      ]
    },
    {
      key: 'container',
      icon: <AppstoreOutlined />,
      label: 'Konteyner/Çadır Kent',
      path: '/dashboard/container',
      children: [
        {
          key: 'container-list',
          label: 'Kent Listesi',
          path: '/dashboard/container',
        },
        {
          key: 'container-infrastructure',
          label: 'Altyapı Yönetimi',
          path: '/dashboard/container/infrastructure',
        },
        {
          key: 'container-personnel',
          label: 'Kent Personeli',
          path: '/dashboard/container/personnel',
        },
        {
          key: 'container-residents',
          label: 'Kent Sakinleri',
          path: '/dashboard/container/residents',
        },
        {
          key: 'container-services',
          label: 'Hizmet Yönetimi',
          path: '/dashboard/container/services',
        },
        {
          key: 'container-inventory',
          label: 'Kent Envanteri',
          path: '/dashboard/container/inventory',
        },
        {
          key: 'container-reports',
          label: 'Kent Raporları',
          path: '/dashboard/container/reports',
        }
      ]
    },
    {
      key: 'logs',
      icon: <FileTextOutlined />,
      label: 'Log Yönetimi',
      path: '/dashboard/logging',
    },
    {
      key: 'reports',
      icon: <PieChartOutlined />,
      label: 'Raporlar',
      path: '/dashboard/reports',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Ayarlar',
      path: '/dashboard/settings',
    },
  ], [notificationCount]);

  // Bildirimleri temizleme
  const handleClearNotifications = () => {
    setNotifications([]);
    setNotificationCount(0);
  };

  // Tüm bildirimleri görüntüleme
  const handleViewAllNotifications = () => {
    router.push('/dashboard/notifications');
  };

  // Rol bazlı menü öğelerini filtreleme
  const filteredMenuItems = useMemo(() => 
    menuItems
    .filter(item => {
      if (item.roles) {
          if (isAdmin) return true;
          if (isManager && item.roles.includes(UserRole.MANAGER)) return true;
          if (isPersonnel && item.roles.includes(UserRole.STAFF)) return true;
          if (isRegionalManager && item.roles.includes(UserRole.REGIONAL_MANAGER)) return true;
          return false;
        }
      return true;
    })
    .map(item => ({
      key: item.key,
      icon: item.icon,
      label: (
        <span onClick={() => !item.children && router.push(item.path)}>
          {item.label}
        </span>
      ),
      children: item.children 
        ? item.children.map(child => ({
            key: child.key,
            label: (
              <span onClick={() => router.push(child.path)}>
                {child.label}
              </span>
            ),
          }))
        : undefined,
      })), [menuItems, isAdmin, isManager, isPersonnel, isRegionalManager, router]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large">
          <div className="p-5">Yükleniyor...</div>
        </Spin>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  const items = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profil',
      onClick: () => router.push('/dashboard/profile')
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Ayarlar',
      onClick: () => router.push('/dashboard/settings')
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Çıkış Yap',
      danger: true,
      onClick: () => signOut({ callbackUrl: '/' }),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        theme="light"
        style={{
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          zIndex: 10
        }}
      >
        <div className="demo-logo-vertical p-4 text-center">
          <h2 className={`text-lg font-bold ${collapsed ? 'hidden' : 'block'}`}>
            Acil Durum Yönetimi
          </h2>
          <h2 className={`text-xl font-bold ${collapsed ? 'block' : 'hidden'}`}>
            A
          </h2>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[pathname === '/dashboard' ? 'dashboard' : pathname.split('/').pop() || '']}
          style={{
            borderRight: 0,
          }}
          items={filteredMenuItems}
        />
      </Sider>
      <Layout>
        <Header 
          style={{ 
            padding: 0, 
            background: token.colorBgContainer,
            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />
          
          <div style={{ marginRight: '24px', display: 'flex', alignItems: 'center' }}>
            {/* Bildirim Dropdown */}
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'notification-header',
                    label: (
                      <div style={{ padding: '4px 0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 'bold' }}>Bildirimler</span>
                          <Button size="small" type="link" onClick={handleClearNotifications}>
                            Tümünü Temizle
                          </Button>
                        </div>
                      </div>
                    ),
                  },
                  {
                    key: 'notifications-list',
                    label: (
                      <div style={{ maxHeight: '300px', overflow: 'auto', width: '320px' }}>
                        {notifications.map(notification => (
                          <div key={notification.id} style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                              <div style={{ margin: '0 10px 0 0', padding: '4px', background: notification.color, borderRadius: '50%', color: 'white' }}>
                                {notification.icon}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{notification.title}</div>
                                <div style={{ fontSize: '12px', color: 'rgba(0, 0, 0, 0.65)' }}>{notification.description}</div>
                                <div style={{ fontSize: '12px', color: 'rgba(0, 0, 0, 0.45)', marginTop: '4px' }}>{notification.time}</div>
                            </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ),
                  },
                  {
                    key: 'notification-footer',
                    label: (
                      <div style={{ textAlign: 'center', padding: '8px 0', borderTop: '1px solid #f0f0f0' }}>
                        <Button type="link" block onClick={handleViewAllNotifications}>
                          Tüm Bildirimleri Görüntüle
                        </Button>
                      </div>
                    ),
                  },
                ],
              }}
              placement="bottomRight"
              arrow={{ pointAtCenter: true }}
              trigger={['click']}
            >
              <Badge count={notificationCount} size="small">
            <Button 
              type="text" 
              icon={<BellOutlined />}
                  style={{ fontSize: '18px', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                />
              </Badge>
            </Dropdown>
            
            <span style={{ width: '12px' }} />
            
            {/* Kullanıcı Profil Dropdown */}
            <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
              <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <Avatar size="small" icon={<UserOutlined />} src={session?.user.image} style={{ marginRight: '8px' }} />
                <span>{session?.user.name}</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: token.colorBgContainer,
            borderRadius: token.borderRadiusLG,
            overflow: 'auto',
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
} 

export default DashboardLayout; 