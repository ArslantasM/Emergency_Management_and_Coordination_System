"use client";

import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Table, 
  Button, 
  Input, 
  Space, 
  Tag, 
  Select, 
  Card,
  Modal,
  Form,
  Tooltip,
  Avatar,
  Badge,
  Spin,
  Statistic,
  Row,
  Col,
  Divider,
  message,
  Progress,
  Empty
} from 'antd';
import { 
  TeamOutlined, 
  SearchOutlined, 
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  CheckCircleOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined, 
  RocketOutlined,
  SafetyOutlined,
  SyncOutlined
} from '@ant-design/icons';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { VolunteerSkillCategory, VolunteerStatus, type VolunteerGroup } from '@/types/volunteer';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

// Demo gönüllü grupları
const generateDemoGroups = (count: number): VolunteerGroup[] => {
  const skillCategories = Object.values(VolunteerSkillCategory);
  const statuses: ('active' | 'inactive' | 'deployed')[] = ['active', 'inactive', 'deployed'];
  
  return Array(count).fill(null).map((_, index) => {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const skillCategory = skillCategories[Math.floor(Math.random() * skillCategories.length)];
    const volunteerCount = Math.floor(Math.random() * 15) + 5; // 5-20 arası gönüllü
    const volunteers = Array(volunteerCount).fill(null).map((_, i) => `vol-${i}-${index}`);
    
    const locations = ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya'];
    const location = locations[Math.floor(Math.random() * locations.length)];
    
    const now = new Date();
    const randomDate = new Date(now.getTime() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 365));
    
    return {
      id: `group-${index}`,
      name: `${getSkillCategoryText(skillCategory)} Ekibi ${index + 1}`,
      description: `${getSkillCategoryText(skillCategory)} alanında uzmanlaşmış gönüllülerden oluşan bir grup.`,
      skillCategory,
      volunteers,
      leader: Math.random() > 0.3 ? volunteers[0] : undefined,
      status,
      deployments: status === 'deployed' ? ['deploy-1', 'deploy-2'] : [],
      location: status === 'deployed' ? location : undefined,
      createdBy: 'admin-id',
      createdAt: randomDate,
      updatedAt: new Date(randomDate.getTime() + Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 30))
    };
  });
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

// Durum renk ve metinleri
const getStatusColor = (status: 'active' | 'inactive' | 'deployed') => {
  const colors: Record<string, string> = {
    'active': 'green',
    'inactive': 'default',
    'deployed': 'blue'
  };
  return colors[status];
};

// Durum metni
const getStatusText = (status: 'active' | 'inactive' | 'deployed') => {
  const texts: Record<string, string> = {
    'active': 'Aktif',
    'inactive': 'Pasif',
    'deployed': 'Görevde'
  };
  return texts[status];
};

const VolunteerGroupsPage = () => {
  const { data: session, status: sessionStatus } = useSession();
  const [groups, setGroups] = useState<VolunteerGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<VolunteerSkillCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | 'deployed' | 'all'>('all');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [isOffline, setIsOffline] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Çevrimdışı mod kontrolü
  useEffect(() => {
    const handleOnlineStatusChange = () => {
      setIsOffline(!navigator.onLine);
      if (!navigator.onLine) {
        message.warning('Çevrimdışı moddasınız. Veriler yerel olarak saklanır ve bağlantı kurulduğunda senkronize edilecektir.');
      } else {
        message.success('Çevrimiçi moda geçildi. Veriler senkronize ediliyor...');
        // Çevrimiçi olduğumuzda senkronizasyon simülasyonu
        setSyncing(true);
        setTimeout(() => {
          setSyncing(false);
          message.success('Veriler başarıyla senkronize edildi.');
        }, 2000);
      }
    };

    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', handleOnlineStatusChange);
    setIsOffline(!navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', handleOnlineStatusChange);
    };
  }, []);

  // Verileri yükle
  useEffect(() => {
    if (sessionStatus === 'authenticated') {
      setLoading(true);
      setTimeout(() => {
        const demoData = generateDemoGroups(15);
        setGroups(demoData);
        setLoading(false);
      }, 1000);
    }
  }, [sessionStatus]);

  // Modal fonksiyonları
  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleSubmit = () => {
    form.validateFields()
      .then(values => {
        console.log('Form values:', values);
        message.success('Grup oluşturma fonksiyonu demo modunda çalışmaz');
        setIsModalVisible(false);
        form.resetFields();
      })
      .catch(info => {
        console.log('Validate Failed:', info);
      });
  };

  // Filtreleme
  const filteredGroups = groups.filter(group => {
    const matchesSearch = 
      searchText === '' || 
      group.name.toLowerCase().includes(searchText.toLowerCase()) ||
      (group.description && group.description.toLowerCase().includes(searchText.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'all' || group.skillCategory === categoryFilter;
    const matchesStatus = statusFilter === 'all' || group.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Tablo kolonları
  const columns = [
    {
      title: 'Grup Adı',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: VolunteerGroup) => (
        <Space>
          <Avatar 
            style={{ 
              backgroundColor: record.skillCategory === VolunteerSkillCategory.MEDICAL ? '#f56a00' : 
                record.skillCategory === VolunteerSkillCategory.SEARCH_RESCUE ? '#7265e6' : 
                record.skillCategory === VolunteerSkillCategory.LOGISTICS ? '#00a2ae' : 
                '#87d068' 
            }}
            icon={<TeamOutlined />}
          />
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: 'Kategori',
      dataIndex: 'skillCategory',
      key: 'category',
      render: (category: VolunteerSkillCategory) => (
        <Tag color="blue">{getSkillCategoryText(category)}</Tag>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: 'active' | 'inactive' | 'deployed') => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Gönüllü Sayısı',
      dataIndex: 'volunteers',
      key: 'volunteerCount',
      render: (volunteers: string[]) => volunteers.length,
    },
    {
      title: 'Konum',
      dataIndex: 'location',
      key: 'location',
      render: (location: string | undefined, record: VolunteerGroup) => (
        location ? (
          <Text>
            <EnvironmentOutlined style={{ marginRight: 4 }} />
            {location}
          </Text>
        ) : (
          <Text type="secondary">Belirlenmedi</Text>
        )
      ),
    },
    {
      title: 'Oluşturulma Tarihi',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: Date) => (
        <Text type="secondary">
          <ClockCircleOutlined style={{ marginRight: 4 }} />
          {new Date(date).toLocaleDateString('tr-TR')}
        </Text>
      ),
    },
    {
      title: 'İşlemler',
      key: 'action',
      render: (_: any, record: VolunteerGroup) => (
        <Space size="small">
          <Tooltip title="Düzenle">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => message.info('Grup düzenleme fonksiyonu demo modunda çalışmaz')}
            />
          </Tooltip>
          <Tooltip title="Sil">
            <Button 
              type="text" 
              icon={<DeleteOutlined />} 
              danger
              onClick={() => message.info('Grup silme fonksiyonu demo modunda çalışmaz')}
            />
          </Tooltip>
          {record.status !== 'deployed' && (
            <Tooltip title="Göreve Gönder">
              <Button 
                type="text" 
                icon={<RocketOutlined />} 
                style={{ color: '#1890ff' }}
                onClick={() => message.info('Grup görevlendirme fonksiyonu demo modunda çalışmaz')}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  // İstatistik verileri
  const stats = {
    totalGroups: groups.length,
    activeGroups: groups.filter(g => g.status === 'active').length,
    deployedGroups: groups.filter(g => g.status === 'deployed').length,
    totalVolunteers: groups.reduce((sum, group) => sum + group.volunteers.length, 0)
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={2}>Gönüllü Grupları</Title>
        
        <Space>
          {isOffline && (
            <Badge status="warning" text="Çevrimdışı Mod" />
          )}
          {syncing && (
            <span>
              <SyncOutlined spin /> Senkronize ediliyor...
            </span>
          )}
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={showModal}
          >
            Yeni Grup Oluştur
          </Button>
        </Space>
      </div>

      {isOffline && (
        <Card size="small" style={{ marginBottom: 16, backgroundColor: '#fffbe6', borderColor: '#ffe58f' }}>
          <Space>
            <SafetyOutlined style={{ color: '#faad14' }} />
            <Text>Çevrimdışı modda gönüllü gruplarının sınırlı bir görünümünü görebilirsiniz. Tam işlevsellik için internete bağlanın.</Text>
          </Space>
        </Card>
      )}

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Toplam Grup"
              value={stats.totalGroups}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Aktif Grup"
              value={stats.activeGroups}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Görevdeki Grup"
              value={stats.deployedGroups}
              prefix={<RocketOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Toplam Gönüllü"
              value={stats.totalVolunteers}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Space size="large" wrap>
            <Input
              placeholder="Grup adı veya açıklama ara"
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: 300 }}
              prefix={<SearchOutlined />}
              allowClear
            />
            <Space>
              <Text>Kategori:</Text>
              <Select
                value={categoryFilter}
                onChange={setCategoryFilter}
                style={{ width: 180 }}
              >
                <Option value="all">Tümü</Option>
                {Object.values(VolunteerSkillCategory).map(category => (
                  <Option key={category} value={category}>
                    {getSkillCategoryText(category)}
                  </Option>
                ))}
              </Select>
            </Space>
            <Space>
              <Text>Durum:</Text>
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: 150 }}
              >
                <Option value="all">Tümü</Option>
                <Option value="active">Aktif</Option>
                <Option value="inactive">Pasif</Option>
                <Option value="deployed">Görevde</Option>
              </Select>
            </Space>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={filteredGroups}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          expandable={{
            expandedRowRender: (record) => (
              <div style={{ padding: '0 20px' }}>
                <Paragraph>
                  <Text strong>Açıklama: </Text> 
                  {record.description || 'Açıklama bulunamadı.'}
                </Paragraph>
                {record.leader && (
                  <Paragraph>
                    <Text strong>Grup Lideri: </Text>
                    <Tag color="gold">
                      <UserOutlined /> Gönüllü ID: {record.leader}
                    </Tag>
                  </Paragraph>
                )}
                {record.status === 'deployed' && record.deployments && record.deployments.length > 0 && (
                  <Paragraph>
                    <Text strong>Aktif Görevlendirmeler: </Text>
                    {record.deployments.map((deployment, index) => (
                      <Tag color="blue" key={index}>{deployment}</Tag>
                    ))}
                  </Paragraph>
                )}
                <Paragraph>
                  <Text strong>Gönüllü Listesi: </Text>
                  <br />
                  <Space wrap style={{ marginTop: 8 }}>
                    {record.volunteers.slice(0, 10).map((vol, index) => (
                      <Tag key={index}>
                        <UserOutlined /> {vol}
                      </Tag>
                    ))}
                    {record.volunteers.length > 10 && (
                      <Tag>+{record.volunteers.length - 10} daha</Tag>
                    )}
                  </Space>
                </Paragraph>
                <div style={{ marginTop: 16 }}>
                  <Link href={`/dashboard/volunteers?group=${record.id}`} passHref>
                    <Button type="link" icon={<TeamOutlined />}>
                      Bu Grubun Gönüllülerini Görüntüle
                    </Button>
                  </Link>
                </div>
              </div>
            ),
          }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Kriterlere uygun grup bulunamadı"
              />
            ),
          }}
        />
      </Card>

      <Modal
        title="Yeni Gönüllü Grubu Oluştur"
        visible={isModalVisible}
        onCancel={handleCancel}
        onOk={handleSubmit}
        okText="Oluştur"
        cancelText="İptal"
      >
        <Form
          form={form}
          layout="vertical"
          name="groupForm"
        >
          <Form.Item
            name="name"
            label="Grup Adı"
            rules={[{ required: true, message: 'Lütfen grup adını girin!' }]}
          >
            <Input placeholder="Grup adını girin" />
          </Form.Item>
          <Form.Item
            name="skillCategory"
            label="Uzmanlık Kategorisi"
            rules={[{ required: true, message: 'Lütfen bir kategori seçin!' }]}
          >
            <Select placeholder="Kategori seçin">
              {Object.values(VolunteerSkillCategory).map(category => (
                <Option key={category} value={category}>
                  {getSkillCategoryText(category)}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="description"
            label="Açıklama"
          >
            <Input.TextArea rows={4} placeholder="Grup açıklaması girin" />
          </Form.Item>
          <Form.Item
            name="status"
            label="Durum"
            initialValue="active"
          >
            <Select>
              <Option value="active">Aktif</Option>
              <Option value="inactive">Pasif</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="location"
            label="Konum (Opsiyonel)"
          >
            <Input placeholder="Grubun konumu" />
          </Form.Item>
          <Divider />
          <Paragraph type="secondary">
            <Text strong>Not:</Text> Oluşturulduktan sonra gruba gönüllü ekleyebilirsiniz.
          </Paragraph>
        </Form>
      </Modal>
    </div>
  );
};

export default VolunteerGroupsPage; 