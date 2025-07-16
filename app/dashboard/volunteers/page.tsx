"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Typography, 
  Table, 
  Button, 
  Input, 
  Space, 
  Tag, 
  Select, 
  Card,
  Tabs,
  Tooltip,
  Drawer,
  Avatar,
  Badge,
  Spin,
  Statistic,
  Row,
  Col,
  Divider,
  message,
  Alert,
  Switch,
  Empty
} from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  TeamOutlined, 
  UserAddOutlined,
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
  ScheduleOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  SyncOutlined,
  FilterOutlined,
  ShoppingOutlined,
  UploadOutlined,
  DownloadOutlined,
  CopyOutlined,
  LockOutlined,
  UnlockOutlined,
  WifiOutlined,
  DisconnectOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { useSession } from 'next-auth/react';
import { VolunteerStatus, VolunteerSkillCategory, type Volunteer } from '@/types/volunteer';

const { Title, Text } = Typography;
const { Option } = Select;

// Demo verisi - gerçek uygulamada API'den gelecek
const generateDemoVolunteers = (count: number): Volunteer[] => {
  const skillCategories = Object.values(VolunteerSkillCategory);
  const statuses = Object.values(VolunteerStatus);
  
  return Array(count).fill(null).map((_, index) => {
    const skillsCount = Math.floor(Math.random() * 4) + 1;
    const skills = Array(skillsCount).fill(null).map((_, i) => {
      const randomCategory = skillCategories[Math.floor(Math.random() * skillCategories.length)];
      const levels = ['beginner', 'intermediate', 'advanced', 'expert'];
      return {
        id: `skill-${index}-${i}`,
        category: randomCategory,
        name: `${randomCategory.replace('_', ' ')} Yeteneği`,
        level: levels[Math.floor(Math.random() * levels.length)] as 'beginner' | 'intermediate' | 'advanced' | 'expert',
        verified: Math.random() > 0.5,
        verifiedBy: Math.random() > 0.5 ? 'admin-id' : undefined,
        verifiedAt: Math.random() > 0.5 ? new Date() : undefined
      };
    });
    
    const cities = ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    const randomCity = cities[Math.floor(Math.random() * cities.length)];
    
    const now = new Date();
    const randomDate = new Date(now.getTime() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 365));
    
    return {
      id: `vol-${index}`,
      userId: `user-${index}`,
      firstName: `İsim${index}`,
      lastName: `Soyisim${index}`,
      email: `gonullu${index}@example.com`,
      phone: `+90 5${Math.floor(Math.random() * 100)}${Math.floor(Math.random() * 1000)}${Math.floor(Math.random() * 1000)}`,
      profileImageUrl: Math.random() > 0.7 ? `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${index % 100}.jpg` : undefined,
      city: randomCity,
      district: `${randomCity} Merkez`,
      bloodType: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'][Math.floor(Math.random() * 8)] as 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-',
      drivingLicense: {
        has: Math.random() > 0.3,
        type: Math.random() > 0.3 ? ['B'] : []
      },
      vehicleAccess: Math.random() > 0.7,
      languages: Math.random() > 0.5 ? ['Türkçe', 'İngilizce'] : ['Türkçe'],
      skills,
      certifications: [],
      availability: [{
        id: `avail-${index}`,
        days: ['monday', 'wednesday', 'friday'],
        startTime: '09:00',
        endTime: '17:00'
      }],
      deployments: [],
      status: randomStatus,
      registeredAt: randomDate,
      lastActiveAt: new Date(now.getTime() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 30)),
      trainingCompleted: Math.random() > 0.3,
      totalHoursVolunteered: Math.floor(Math.random() * 1000),
      createdAt: randomDate,
      updatedAt: new Date(randomDate.getTime() + Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 30)),
      region: ['Marmara', 'Ege', 'Akdeniz', 'İç Anadolu', 'Karadeniz', 'Doğu Anadolu', 'Güneydoğu Anadolu'][Math.floor(Math.random() * 7)],
      operationalRegions: [['Marmara', 'Ege', 'Akdeniz', 'İç Anadolu', 'Karadeniz', 'Doğu Anadolu', 'Güneydoğu Anadolu'][Math.floor(Math.random() * 7)]]
    };
  });
};

// Durum etiket renkleri
const getStatusColor = (status: VolunteerStatus) => {
  const colors: Record<VolunteerStatus, string> = {
    [VolunteerStatus.ACTIVE]: 'green',
    [VolunteerStatus.INACTIVE]: 'default',
    [VolunteerStatus.PENDING]: 'orange',
    [VolunteerStatus.DEPLOYED]: 'blue',
    [VolunteerStatus.ON_LEAVE]: 'purple',
    [VolunteerStatus.SUSPENDED]: 'red'
  };
  return colors[status];
};

// Durum etiket metni
const getStatusText = (status: VolunteerStatus) => {
  const texts: Record<VolunteerStatus, string> = {
    [VolunteerStatus.ACTIVE]: 'Aktif',
    [VolunteerStatus.INACTIVE]: 'Pasif',
    [VolunteerStatus.PENDING]: 'Onay Bekliyor',
    [VolunteerStatus.DEPLOYED]: 'Görevde',
    [VolunteerStatus.ON_LEAVE]: 'İzinde',
    [VolunteerStatus.SUSPENDED]: 'Askıya Alındı'
  };
  return texts[status];
};

// Yetenek kategorisi metni
const getSkillCategoryText = (category: VolunteerSkillCategory) => {
  const texts: Record<VolunteerSkillCategory, string> = {
    [VolunteerSkillCategory.MEDICAL]: 'Tıbbi',
    [VolunteerSkillCategory.SEARCH_RESCUE]: 'Arama Kurtarma',
    [VolunteerSkillCategory.LOGISTICS]: 'Lojistik',
    [VolunteerSkillCategory.COMMUNICATION]: 'İletişim',
    [VolunteerSkillCategory.SHELTER]: 'Barınma',
    [VolunteerSkillCategory.TECHNICAL]: 'Teknik',
    [VolunteerSkillCategory.TRANSPORT]: 'Ulaşım',
    [VolunteerSkillCategory.FOOD_SUPPLY]: 'Gıda Tedariki',
    [VolunteerSkillCategory.LANGUAGE]: 'Dil',
    [VolunteerSkillCategory.OTHER]: 'Diğer'
  };
  return texts[category];
};

const VolunteersPage = () => {
  const { data: session, status: sessionStatus } = useSession();
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [filteredVolunteers, setFilteredVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<VolunteerStatus | 'all'>('all');
  const [skillFilter, setSkillFilter] = useState<VolunteerSkillCategory | 'all'>('all');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Çevrimdışı mod simülasyonu için fonksiyon
  const handleOnlineStatusChange = useCallback(() => {
    setIsOffline(!navigator.onLine);
    if (!navigator.onLine) {
      message.warning('Çevrimdışı moddasınız. Veriler yerel olarak saklanır ve bağlantı kurulduğunda senkronize edilecektir.');
    } else {
      message.success('Çevrimiçi moda geçildi. Veriler senkronize ediliyor...');
    }
  }, []);

  // Çevrimdışı mod simülasyonu
  useEffect(() => {
    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', handleOnlineStatusChange);
    setIsOffline(!navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', handleOnlineStatusChange);
    };
  }, [handleOnlineStatusChange]);

  // Rolü kontrol ederek tüm bölgeleri görüntüleme yeteneği
  const canViewAllRegions = () => {
    return session?.user.role === 'admin';
  };
  
  // Kullanıcının bölgesi, API'den alınacak, şimdilik ilk bölgeyi varsayalım
  const userRegion = "Marmara Bölgesi";

  // Verileri yükle
  useEffect(() => {
    // Simüle API çağrısı
    const loadData = () => {
      setLoading(true);
      // Gerçek API çağrısı olacak
      setTimeout(() => {
        const demoData = generateDemoVolunteers(30);
        
        // Demo verilere bölge bilgisi ekle
        const regions = ['Marmara Bölgesi', 'Ege Bölgesi', 'Akdeniz Bölgesi', 'İç Anadolu Bölgesi', 
                        'Karadeniz Bölgesi', 'Doğu Anadolu Bölgesi', 'Güneydoğu Anadolu Bölgesi'];
        
        const demoDataWithRegions = demoData.map(volunteer => {
          const region = regions[Math.floor(Math.random() * regions.length)];
          const operRegionsCount = Math.floor(Math.random() * 3);
          const operRegions = operRegionsCount > 0 
            ? Array(operRegionsCount).fill(null).map(() => 
                regions[Math.floor(Math.random() * regions.length)]
              ).filter(r => r !== region)
            : [];
          
          return {
            ...volunteer,
            region,
            operationalRegions: [...new Set(operRegions)] // Duplicate'leri kaldır
          };
        });
        
        setVolunteers(demoDataWithRegions);
        setFilteredVolunteers(demoDataWithRegions);
        setLoading(false);
      }, 1000);
    };

    if (sessionStatus === 'authenticated') {
      loadData();
    }
  }, [sessionStatus]);
  
  // Admin dışındaki roller için bölge kısıtlaması uygula
  useEffect(() => {
    if (!canViewAllRegions() && sessionStatus !== "loading") {
      setSelectedRegion(userRegion);
      // Bölgeye göre gönüllüleri filtrele
      const filteredVols = volunteers.filter(volunteer => 
        volunteer.region === userRegion || volunteer.operationalRegions?.includes(userRegion)
      );
      setFilteredVolunteers(filteredVols);
    } else {
      setFilteredVolunteers(volunteers);
    }
  }, [sessionStatus, volunteers, userRegion]);
  
  // Bölge seçimi değiştiğinde filtrele
  const handleRegionChange = (regionName: string) => {
    setSelectedRegion(regionName);
    
    if (regionName === 'all') {
      setFilteredVolunteers(volunteers);
    } else {
      // Seçilen bölgedeki veya operasyonel bölgelerinde bulunan gönüllüleri filtrele
      const filtered = volunteers.filter(volunteer => 
        volunteer.region === regionName || volunteer.operationalRegions?.includes(regionName)
      );
      setFilteredVolunteers(filtered);
    }
  };
  
  // Arama ve filtreleme işlemi
  const handleSearch = (searchText: string) => {
    setSearchText(searchText);
    
    if (!searchText || searchText === '') {
      // Bölge filtresi varsa sadece o bölgeyi uygula
      if (selectedRegion && selectedRegion !== 'all') {
        handleRegionChange(selectedRegion);
      } else {
        setFilteredVolunteers(volunteers);
      }
      return;
    }
    
    const searchLower = searchText.toLowerCase();
    // Önce bölge filtresini uygula, sonra metin araması yap
    const baseList = selectedRegion && selectedRegion !== 'all' 
      ? volunteers.filter(v => v.region === selectedRegion || v.operationalRegions?.includes(selectedRegion)) 
      : volunteers;
    
    const filtered = baseList.filter(volunteer => 
      volunteer.firstName.toLowerCase().includes(searchLower) ||
      volunteer.lastName.toLowerCase().includes(searchLower) ||
      volunteer.email.toLowerCase().includes(searchLower) ||
      volunteer.phone.toLowerCase().includes(searchLower) ||
      volunteer.skills.some(skill => skill.category.toLowerCase().includes(searchLower)) ||
      (volunteer.region && volunteer.region.toLowerCase().includes(searchLower))
    );
    
    setFilteredVolunteers(filtered);
  };

  // Gönüllü detayını göster
  const showVolunteerDetail = (volunteer: Volunteer) => {
    setSelectedVolunteer(volunteer);
    setDrawerVisible(true);
  };

  // İstatistik verileri
  const stats = {
    totalVolunteers: volunteers.length,
    activeVolunteers: volunteers.filter(v => v.status === VolunteerStatus.ACTIVE).length,
    deployedVolunteers: volunteers.filter(v => v.status === VolunteerStatus.DEPLOYED).length,
    pendingVolunteers: volunteers.filter(v => v.status === VolunteerStatus.PENDING).length
  };

  // 2FA durumu simülasyonu
  const has2FA = Math.random() > 0.5;

  const tabItems = [
    {
      key: 'all',
      label: (
        <span>
          <TeamOutlined />
          Tüm Gönüllüler
        </span>
      ),
      children: (
        <Table
          columns={[
            {
              title: 'Gönüllü',
              dataIndex: 'firstName',
              key: 'name',
              render: (_, record) => (
                <Space>
                  <Avatar
                    src={record.profileImageUrl}
                    icon={<UserOutlined />}
                  />
                  <Space direction="vertical">
                    <Text strong>{`${record.firstName} ${record.lastName}`}</Text>
                    <Text type="secondary">{record.email}</Text>
                  </Space>
                </Space>
              )
            },
            {
              title: 'Durum',
              dataIndex: 'status',
              key: 'status',
              render: (status) => (
                <Tag color={getStatusColor(status)}>
                  {getStatusText(status)}
                </Tag>
              )
            },
            {
              title: 'Bölge',
              dataIndex: 'region',
              key: 'region',
              render: (region) => (
                <Space>
                  <EnvironmentOutlined />
                  <Text>{region}</Text>
                </Space>
              )
            },
            {
              title: 'Yetenekler',
              dataIndex: 'skills',
              key: 'skills',
              render: (skills) => (
                <Space wrap>
                  {skills.slice(0, 3).map((skill: any) => (
                    <Tag key={skill.id} color="blue">
                      {getSkillCategoryText(skill.category)}
                    </Tag>
                  ))}
                  {skills.length > 3 && (
                    <Tag>+{skills.length - 3}</Tag>
                  )}
                </Space>
              )
            },
            {
              title: 'İşlemler',
              key: 'actions',
              render: (_, record) => (
                <Space>
                  <Button
                    type="text"
                    icon={<EyeOutlined />}
                    onClick={() => showVolunteerDetail(record)}
                  />
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => handleEditVolunteer(record)}
                  />
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeleteVolunteer(record.id)}
                  />
                </Space>
              )
            }
          ]}
          dataSource={filteredVolunteers}
          rowKey="id"
        />
      )
    },
    {
      key: 'active',
      label: (
        <span>
          <CheckCircleOutlined />
          Aktif Gönüllüler
        </span>
      ),
      children: (
        <Table
          columns={[
            {
              title: 'Gönüllü',
              dataIndex: 'firstName',
              key: 'name',
              render: (_, record) => (
                <Space>
                  <Avatar
                    src={record.profileImageUrl}
                    icon={<UserOutlined />}
                  />
                  <Space direction="vertical">
                    <Text strong>{`${record.firstName} ${record.lastName}`}</Text>
                    <Text type="secondary">{record.email}</Text>
                  </Space>
                </Space>
              )
            },
            {
              title: 'Bölge',
              dataIndex: 'region',
              key: 'region',
              render: (region) => (
                <Space>
                  <EnvironmentOutlined />
                  <Text>{region}</Text>
                </Space>
              )
            },
            {
              title: 'Yetenekler',
              dataIndex: 'skills',
              key: 'skills',
              render: (skills) => (
                <Space wrap>
                  {skills.slice(0, 3).map((skill: any) => (
                    <Tag key={skill.id} color="blue">
                      {getSkillCategoryText(skill.category)}
                    </Tag>
                  ))}
                  {skills.length > 3 && (
                    <Tag>+{skills.length - 3}</Tag>
                  )}
                </Space>
              )
            },
            {
              title: 'İşlemler',
              key: 'actions',
              render: (_, record) => (
                <Space>
                  <Button
                    type="text"
                    icon={<EyeOutlined />}
                    onClick={() => showVolunteerDetail(record)}
                  />
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => handleEditVolunteer(record)}
                  />
                </Space>
              )
            }
          ]}
          dataSource={filteredVolunteers.filter(v => v.status === VolunteerStatus.ACTIVE)}
          rowKey="id"
        />
      )
    },
    {
      key: 'pending',
      label: (
        <span>
          <ClockCircleOutlined />
          Onay Bekleyenler
        </span>
      ),
      children: (
        <Table
          columns={[
            {
              title: 'Gönüllü',
              dataIndex: 'firstName',
              key: 'name',
              render: (_, record) => (
                <Space>
                  <Avatar
                    src={record.profileImageUrl}
                    icon={<UserOutlined />}
                  />
                  <Space direction="vertical">
                    <Text strong>{`${record.firstName} ${record.lastName}`}</Text>
                    <Text type="secondary">{record.email}</Text>
                  </Space>
                </Space>
              )
            },
            {
              title: 'Bölge',
              dataIndex: 'region',
              key: 'region',
              render: (region) => (
                <Space>
                  <EnvironmentOutlined />
                  <Text>{region}</Text>
                </Space>
              )
            },
            {
              title: 'Yetenekler',
              dataIndex: 'skills',
              key: 'skills',
              render: (skills) => (
                <Space wrap>
                  {skills.slice(0, 3).map((skill: any) => (
                    <Tag key={skill.id} color="blue">
                      {getSkillCategoryText(skill.category)}
                    </Tag>
                  ))}
                  {skills.length > 3 && (
                    <Tag>+{skills.length - 3}</Tag>
                  )}
                </Space>
              )
            },
            {
              title: 'İşlemler',
              key: 'actions',
              render: (_, record) => (
                <Space>
                  <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    onClick={() => handleApproveVolunteer(record.id)}
                  >
                    Onayla
                  </Button>
                  <Button
                    type="text"
                    icon={<EyeOutlined />}
                    onClick={() => showVolunteerDetail(record)}
                  />
                  <Button
                    type="text"
                    danger
                    icon={<CloseCircleOutlined />}
                    onClick={() => handleRejectVolunteer(record.id)}
                  />
                </Space>
              )
            }
          ]}
          dataSource={filteredVolunteers.filter(v => v.status === VolunteerStatus.PENDING)}
          rowKey="id"
        />
      )
    }
  ];

  return (
    <div className="volunteers-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2}>Gönüllü Yönetimi</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => message.info('Gönüllü ekleme sayfası demo modunda çalışmaz')}
        >
          Yeni Gönüllü
        </Button>
      </div>

      {!canViewAllRegions() && (
        <Alert
          message="Bölge Kısıtlaması Aktif"
          description={`Şu anda ${selectedRegion || userRegion} için yetkilendirilmiş gönüllüleri görüntülüyorsunuz. Diğer bölgelerdeki gönüllüler için bölge yöneticinizle iletişime geçin.`}
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Card 
        variant="outlined"
        style={{ marginBottom: 16 }}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Space direction="horizontal" style={{ marginBottom: 16, flexWrap: 'wrap' }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => message.info('Yeni gönüllü ekleme demo modunda çalışmıyor')}
            >
              Yeni Gönüllü Ekle
            </Button>
            
            <Button
              icon={<EditOutlined />}
              onClick={() => message.info('Toplu düzenleme demo modunda çalışmıyor')}
            >
              Toplu Düzenle
            </Button>
            
            <Button
              icon={<UploadOutlined />}
              onClick={() => message.info('İçe aktarma demo modunda çalışmıyor')}
            >
              İçe Aktar
            </Button>
            
            <Button
              icon={<DownloadOutlined />}
              onClick={() => message.info('Dışa aktarma demo modunda çalışmıyor')}
            >
              Dışa Aktar
            </Button>

            <Button
              icon={<CopyOutlined />}
              onClick={() => {
                const text = filteredVolunteers.map(v => 
                  `${v.firstName} ${v.lastName}, ${v.email}, ${v.phone}`
                ).join('\n');
                copyToClipboard(text);
              }}
            >
              Kişileri Kopyala
            </Button>

            <Tooltip title="İki Faktörlü Kimlik Doğrulama">
              <Switch
                checkedChildren={<LockOutlined />}
                unCheckedChildren={<UnlockOutlined />}
                checked={twoFactorEnabled}
                onChange={(checked) => setTwoFactorEnabled(checked)}
              />
            </Tooltip>
            
            <Tooltip title="Çevrimdışı Mod">
              <Switch
                checkedChildren={<WifiOutlined />}
                unCheckedChildren={<DisconnectOutlined />}
                checked={!isOffline}
                onChange={() => {
                  setIsOffline(!isOffline);
                  if (isOffline) {
                    message.success('Çevrimiçi moda geçildi. Veriler senkronize ediliyor...');
                  } else {
                    message.warning('Çevrimdışı moddasınız. Veriler yerel olarak saklanır ve bağlantı kurulduğunda senkronize edilecektir.');
                  }
                }}
              />
            </Tooltip>
          </Space>

          <Space direction="horizontal" style={{ marginBottom: 16, flexWrap: 'wrap' }}>
            <Input
              placeholder="Ad, soyad veya e-posta ile ara"
              allowClear
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              prefix={<SearchOutlined />}
              style={{ width: 300 }}
            />
            
            <Select
              placeholder="Bölge seç"
              style={{ width: 200 }}
              value={selectedRegion || (canViewAllRegions() ? 'all' : userRegion)}
              onChange={handleRegionChange}
              disabled={!canViewAllRegions()}
            >
              {canViewAllRegions() && <Option value="all">Tüm Bölgeler</Option>}
              <Option value="Marmara Bölgesi">Marmara Bölgesi</Option>
              <Option value="Ege Bölgesi">Ege Bölgesi</Option>
              <Option value="Akdeniz Bölgesi">Akdeniz Bölgesi</Option>
              <Option value="İç Anadolu Bölgesi">İç Anadolu Bölgesi</Option>
              <Option value="Karadeniz Bölgesi">Karadeniz Bölgesi</Option>
              <Option value="Doğu Anadolu Bölgesi">Doğu Anadolu Bölgesi</Option>
              <Option value="Güneydoğu Anadolu Bölgesi">Güneydoğu Anadolu Bölgesi</Option>
            </Select>
            
              <Select
              placeholder="Durum filtrele"
              style={{ width: 150 }}
                value={statusFilter}
              onChange={(value) => setStatusFilter(value)}
              >
              <Option value="all">Tüm Durumlar</Option>
              {Object.values(VolunteerStatus).map((status) => (
                  <Option key={status} value={status}>
                    {getStatusText(status)}
                  </Option>
                ))}
              </Select>
            
              <Select
              placeholder="Yetenek filtrele"
              style={{ width: 150 }}
                value={skillFilter}
              onChange={(value) => setSkillFilter(value)}
              >
              <Option value="all">Tüm Yetenekler</Option>
              {Object.values(VolunteerSkillCategory).map((category) => (
                  <Option key={category} value={category}>
                    {getSkillCategoryText(category)}
                  </Option>
                ))}
              </Select>
            </Space>

          {isOffline && (
            <Badge.Ribbon text="Çevrimdışı Mod" color="orange">
              <div style={{ height: 8 }} />
            </Badge.Ribbon>
          )}
          </Space>
      </Card>

      <Tabs 
        defaultActiveKey="1" 
        items={tabItems}
      />

      {/* Gönüllü Detay Çekmecesi */}
      <Drawer
        title={
          selectedVolunteer && 
          <div>
            <Space>
              <Avatar 
                size="large" 
                src={selectedVolunteer.profileImageUrl}
                icon={!selectedVolunteer.profileImageUrl && <UserOutlined />}
              />
              <div>
                <div>{`${selectedVolunteer.firstName} ${selectedVolunteer.lastName}`}</div>
                <Tag color={getStatusColor(selectedVolunteer.status)}>
                  {getStatusText(selectedVolunteer.status)}
                </Tag>
              </div>
            </Space>
          </div>
        }
        width={600}
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
      >
        {selectedVolunteer && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Avatar 
                size={100} 
                src={selectedVolunteer.profileImageUrl}
                icon={!selectedVolunteer.profileImageUrl && <UserOutlined />}
              />
              <Title level={3} style={{ marginTop: 16, marginBottom: 4 }}>
                {`${selectedVolunteer.firstName} ${selectedVolunteer.lastName}`}
              </Title>
              <Tag color={getStatusColor(selectedVolunteer.status)} style={{ margin: '8px 0' }}>
                {getStatusText(selectedVolunteer.status)}
              </Tag>
              <div>
                <Text type="secondary">{selectedVolunteer.email}</Text>
              </div>
              <div>
                <Text type="secondary">{selectedVolunteer.phone}</Text>
              </div>
            </div>

            <Divider orientation="left">Genel Bilgiler</Divider>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text strong>Şehir:</Text> <Text>{selectedVolunteer.city}</Text>
              </Col>
              <Col span={12}>
                <Text strong>İlçe:</Text> <Text>{selectedVolunteer.district || '-'}</Text>
              </Col>
              <Col span={12}>
                <Text strong>Kan Grubu:</Text> <Text>{selectedVolunteer.bloodType || '-'}</Text>
              </Col>
              <Col span={12}>
                <Text strong>Ehliyet:</Text> <Text>{selectedVolunteer.drivingLicense?.has ? 'Var' : 'Yok'}</Text>
              </Col>
              <Col span={12}>
                <Text strong>Araç Erişimi:</Text> <Text>{selectedVolunteer.vehicleAccess ? 'Var' : 'Yok'}</Text>
              </Col>
              <Col span={12}>
                <Text strong>Diller:</Text> <Text>{selectedVolunteer.languages?.join(', ') || '-'}</Text>
              </Col>
              <Col span={12}>
                <Text strong>Eğitim Tamamlandı:</Text> <Text>{selectedVolunteer.trainingCompleted ? 'Evet' : 'Hayır'}</Text>
              </Col>
              <Col span={12}>
                <Text strong>Toplam Gönüllülük Saati:</Text> <Text>{selectedVolunteer.totalHoursVolunteered}</Text>
              </Col>
            </Row>

            <Divider orientation="left">Yetenekler</Divider>
            <div style={{ marginBottom: 16 }}>
              {selectedVolunteer.skills.length > 0 ? (
                selectedVolunteer.skills.map((skill, index) => (
                  <div key={index} style={{ marginBottom: 8 }}>
                    <Tag color="blue">{getSkillCategoryText(skill.category)}</Tag>
                    <Text style={{ marginLeft: 8 }}>{skill.name}</Text>
                    <Text type="secondary" style={{ marginLeft: 8 }}>
                      ({skill.level === 'beginner' ? 'Başlangıç' :
                        skill.level === 'intermediate' ? 'Orta' :
                        skill.level === 'advanced' ? 'İleri' : 'Uzman'})
                    </Text>
                    {skill.verified && (
                      <Tag color="green" style={{ marginLeft: 8 }}>Doğrulanmış</Tag>
                    )}
                  </div>
                ))
              ) : (
                <Text type="secondary">Yetenek bilgisi bulunamadı</Text>
              )}
            </div>

            <Divider orientation="left">Erişilebilirlik</Divider>
            <div style={{ marginBottom: 16 }}>
              {selectedVolunteer.availability.length > 0 ? (
                selectedVolunteer.availability.map((avail, index) => (
                  <div key={index} style={{ marginBottom: 8 }}>
                    <Text strong>Günler: </Text>
                    <Text>
                      {avail.days.map(day => {
                        const dayMap: Record<string, string> = {
                          'monday': 'Pazartesi',
                          'tuesday': 'Salı',
                          'wednesday': 'Çarşamba',
                          'thursday': 'Perşembe',
                          'friday': 'Cuma',
                          'saturday': 'Cumartesi',
                          'sunday': 'Pazar'
                        };
                        return dayMap[day];
                      }).join(', ')}
                    </Text>
                    <br />
                    <Text strong>Saat: </Text>
                    <Text>{avail.startTime} - {avail.endTime}</Text>
                  </div>
                ))
              ) : (
                <Text type="secondary">Erişilebilirlik bilgisi bulunamadı</Text>
              )}
            </div>

            <Divider />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button 
                type="primary" 
                icon={<EditOutlined />}
                onClick={() => message.info('Gönüllü düzenleme fonksiyonu demo modunda çalışmaz')}
              >
                Düzenle
              </Button>
              <Button 
                danger 
                icon={<DeleteOutlined />}
                onClick={() => message.info('Gönüllü silme fonksiyonu demo modunda çalışmaz')}
              >
                Sil
              </Button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default VolunteersPage;