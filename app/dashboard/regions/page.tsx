"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Typography,
  Button,
  Table,
  Tag,
  Space,
  Drawer,
  Form,
  Input,
  Select,
  TreeSelect,
  Row,
  Col,
  Popconfirm,
  message,
  Tooltip,
  Divider,
  Empty,
  Badge,
  ColorPicker,
  Alert,
  App,
  Spin,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  GlobalOutlined,
  SaveOutlined,
  RightCircleOutlined,
} from '@ant-design/icons';
import RegionMap from '../../components/Dashboard/RegionMap';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { SHOW_PARENT } = TreeSelect;

// Renk seçenekleri
const colorOptions = [
  { name: 'Kırmızı', color: '#ff4d4f' },
  { name: 'Turuncu', color: '#ffa940' },
  { name: 'Sarı', color: '#fadb14' },
  { name: 'Yeşil', color: '#52c41a' },
  { name: 'Açık Yeşil', color: '#73d13d' },
  { name: 'Koyu Yeşil', color: '#389e0d' },
  { name: 'Mavi', color: '#1890ff' },
  { name: 'Açık Mavi', color: '#69c0ff' },
  { name: 'Koyu Mavi', color: '#096dd9' },
  { name: 'Mor', color: '#722ed1' },
  { name: 'Açık Mor', color: '#b37feb' },
  { name: 'Koyu Mor', color: '#531dab' },
  { name: 'Pembe', color: '#eb2f96' },
  { name: 'Kahverengi', color: '#8B4513' },
  { name: 'Gri', color: '#8c8c8c' }
];

export default function RegionsPage() {
  const { message } = App.useApp();
  const [regions, setRegions] = useState([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingRegion, setEditingRegion] = useState<any>(null);
  const [form] = Form.useForm();
  const [treeData, setTreeData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filteredRegions, setFilteredRegions] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [sorter, setSorter] = useState<any>(null);
  const [selectedRegion, setSelectedRegion] = useState<any>(null);
  const [boundary, setBoundary] = useState<any>(null);

  // TreeSelect verilerini önbelleğe alma
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('🔍 Regions verileri getiriliyor...');
        setLoading(true);
        
        // Ana regions API'sini kullan (authentication ile)
        const response = await fetch('/api/regions');
        console.log('📡 API yanıtı alındı:', response.status);
        
        if (!response.ok) {
          throw new Error(`Veri yüklenemedi: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📊 API verisi:', data);
        
        // TreeData'yı ayarla
        if (data.treeData && data.treeData.length > 0) {
          console.log('🌳 TreeData bulundu:', data.treeData.length);
          setTreeData(data.treeData);
        } else {
          console.log('⚠️ TreeData boş, alternatif veri kullanılıyor');
          // Alternatif olarak countries verilerini TreeSelect formatında kullan
          if (data.countries && data.countries.length > 0) {
            const alternativeTreeData = data.countries.map((country: any) => ({
              title: `${country.name} (${country.code})`,
              value: `country-${country.id}`,
              key: `country-${country.id}`,
              type: 'country'
            }));
            setTreeData(alternativeTreeData);
          }
        }
        
        // Acil durum bölgelerini al
        if (data.regions) {
          setRegions(data.regions);
          setFilteredRegions(data.regions);
          setPagination(prev => ({ ...prev, total: data.regions.length }));
        }
        
        console.log('✅ Veriler state\'e atandı');
      } catch (error) {
        console.error('❌ Veri yükleme hatası:', error);
        message.error(`Bölge verileri yüklenirken bir hata oluştu: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Arama ve filtreleme
  useEffect(() => {
    const filtered = regions.filter((region: any) =>
      region.name.toLowerCase().includes(searchText.toLowerCase()) ||
      region.description?.toLowerCase().includes(searchText.toLowerCase())
    );

    setFilteredRegions(filtered);
    setPagination(prev => ({ ...prev, current: 1, total: filtered.length }));
  }, [searchText, regions]);

  // Bölge ekleme/düzenleme
  const handleAddRegion = () => {
    setEditingRegion(null);
    form.resetFields();
    setDrawerVisible(true);
  };

  const handleEditRegion = (record: any) => {
    setEditingRegion(record);
    form.setFieldsValue({
      name: record.name,
      description: record.description,
      region_type: record.region_type,
      emergency_level: record.emergency_level,
      locations: record.locations,
    });
    setDrawerVisible(true);
  };

  // Bölge seçimi
  const handleRegionSelect = (region: any) => {
    setSelectedRegion(region);
    setEditingRegion(region);
    form.setFieldsValue({
      name: region.name,
      description: region.description,
      region_type: region.region_type,
      emergency_level: region.emergency_level,
      locations: region.locations
    });
    setDrawerVisible(true);
  };

  // Bölge sınırı değişikliği
  const handleBoundaryChange = (newBoundary: any) => {
    setBoundary(newBoundary);
  };

  // Bölge kaydetme
  const handleSaveRegion = async (values: any) => {
    try {
      console.log('💾 Bölge kaydediliyor:', values);
      
      const endpoint = editingRegion ? `/api/regions/${editingRegion.id}` : '/api/regions';
      const method = editingRegion ? 'PUT' : 'POST';

      const data = {
        ...values,
        boundary: boundary
      };

      console.log('📡 API isteği:', { endpoint, method, data });

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log('📨 API yanıtı:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ API hata detayı:', errorData);
        throw new Error(`Bölge kaydedilemedi: ${response.status} - ${errorData}`);
      }

      const result = await response.json();
      console.log('✅ Kayıt başarılı:', result);

      message.success(`Bölge başarıyla ${editingRegion ? 'güncellendi' : 'eklendi'}`);
      setDrawerVisible(false);
      setBoundary(null);
      setSelectedRegion(null);

      // Bölgeleri yeniden yükle
      const regionsResponse = await fetch('/api/regions');
      const regionsData = await regionsResponse.json();
      if (regionsData.treeData) {
        setTreeData(regionsData.treeData);
      }
      if (regionsData.regions) {
        setRegions(regionsData.regions);
        setFilteredRegions(regionsData.regions);
      }
    } catch (error) {
      console.error('❌ Bölge kaydetme hatası:', error);
      message.error(`Bölge kaydedilirken bir hata oluştu: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleDeleteRegion = async (id: string) => {
    try {
      const response = await fetch(`/api/regions/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Bölge silinemedi');
      }

      message.success('Bölge başarıyla silindi');
      // Bölgeleri yeniden yükle
      const regionsResponse = await fetch('/api/regions');
      const data = await regionsResponse.json();
      if (data.treeData) {
        setTreeData(data.treeData || []);
      }
      if (data.regions) {
        setRegions(data.regions || []);
        setFilteredRegions(data.regions || []);
      }
      setPagination(prev => ({ ...prev, total: (data.regions || []).length }));
    } catch (error) {
      console.error('Bölge silinirken hata:', error);
      message.error('Bölge silinirken bir hata oluştu');
    }
  };

  // Lokasyon değerini anlamlı isme dönüştür
  const getLocationDisplayName = (locationValue: string) => {
    if (!locationValue) return '';
    
    // TreeData'dan ara
    if (treeData && treeData.length > 0) {
      const findInTree = (nodes: any[], value: string): string | null => {
        for (const node of nodes) {
          if (node.value === value) {
            // Emoji'leri temizle ve sadece ismi al
            return node.title.replace(/[🌍🏙️🏘️🏠]/g, '').trim();
          }
          if (node.children) {
            const found = findInTree(node.children, value);
            if (found) return found;
          }
        }
        return null;
      };
      
      const found = findInTree(treeData, locationValue);
      if (found) return found;
    }
    
    // TreeData'da bulunamazsa, değeri parse et
    const [type, id] = locationValue.split('-');
    const typeNames = {
      'country': 'Ülke',
      'city': 'Şehir', 
      'district': 'İlçe',
      'town': 'Kasaba'
    };
    
    return `${typeNames[type as keyof typeof typeNames] || type}: ${id}`;
  };

  // Tablo sütunları
  const columns = [
    {
      title: 'Bölge Adı',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: any, b: any) => a.name.localeCompare(b.name),
      render: (text: string, record: any) => (
        <Space>
          <Badge color={record.color} />
          <Text>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'Açıklama',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      sorter: (a: any, b: any) => (a.description || '').localeCompare(b.description || ''),
      render: (text: string) => text || '-',
    },
    {
      title: 'Acil Durum Seviyesi',
      dataIndex: 'emergency_level',
      key: 'emergency_level',
      render: (level: string) => {
        const levelConfig = {
          'CRITICAL': { color: 'red', text: 'Kritik' },
          'HIGH': { color: 'orange', text: 'Yüksek' },
          'MEDIUM': { color: 'yellow', text: 'Orta' },
          'LOW': { color: 'green', text: 'Düşük' }
        };
        const config = levelConfig[level as keyof typeof levelConfig] || { color: 'default', text: level };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: 'Lokasyonlar',
      dataIndex: 'locations',
      key: 'locations',
      render: (_: any, record: any) => {
        console.log(`🏷️ Tablo lokasyon render: ${record.name}`, record.locations);
        
        if (!record.locations || record.locations.length === 0) {
          return <Tag color="default">Lokasyon yok</Tag>;
        }
        
        return (
          <Space wrap>
            {record.locations.slice(0, 3).map((location: string) => {
              const displayName = getLocationDisplayName(location);
              console.log(`🏷️ ${location} -> ${displayName}`);
              return (
                <Tag key={location} color="blue">
                  {displayName}
                </Tag>
              );
            })}
            {record.locations.length > 3 && (
              <Tag color="default">+{record.locations.length - 3} daha</Tag>
            )}
          </Space>
        );
      },
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Tooltip title="Düzenle">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditRegion(record)}
            />
          </Tooltip>
          <Tooltip title="Sil">
            <Popconfirm
              title="Bu bölgeyi silmek istediğinizden emin misiniz?"
              onConfirm={() => handleDeleteRegion(record.id)}
              okText="Evet"
              cancelText="Hayır"
            >
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Tablo değişiklik işleyicisi
  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    setPagination(pagination);
    setSorter(sorter);
  };

  return (
    <div className="p-6">
      <Card className="mb-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Title level={2} className="!mb-2">
              <Space>
                <GlobalOutlined />
                Bölge Yönetimi
              </Space>
            </Title>
            <Text type="secondary">
              Afet ve acil durum yönetimi için bölgesel koordinasyon sistemi
            </Text>
          </div>
          <Space>
            <Input.Search
              placeholder="Bölge ara..."
              allowClear
              onChange={e => setSearchText(e.target.value)}
              style={{ width: 250 }}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddRegion} style={{ backgroundColor: '#1890ff' }}>
              Yeni Bölge Ekle
            </Button>
          </Space>
        </div>

        <Card className="mb-6 bg-gray-50">
          <Paragraph>
            <Text strong>Küresel Bölge Yönetimi</Text>{' '}
            Afet ve acil durum yönetimi kapsamında dünya geneli coğrafi alanların gruplandırılması ve yönetilmesi sistemi.
            Herhangi bir ülkeden şehir ve ilçe seçerek özel bölgeler tanımlayabilir, bu bölgelere özel görevler atayabilir,
            küresel çapta bölgesel koordinasyon sağlayabilirsiniz.
          </Paragraph>
          <Divider />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Space>
                <RightCircleOutlined className="text-blue-500" />
                <Text>Dünya genelinde herhangi bir ülke, şehir veya ilçeyi kapsayan özel bölgeler oluşturabilirsiniz</Text>
              </Space>
            </div>
            <div>
              <Space>
                <RightCircleOutlined className="text-blue-500" />
                <Text>Her bölgeye özel renk tanımlayarak küresel haritada ayırt edilmesini sağlayabilirsiniz</Text>
              </Space>
            </div>
            <div>
              <Space>
                <RightCircleOutlined className="text-blue-500" />
                <Text>Uluslararası afet koordinasyonu için bölgesel görev ve personel ataması yapabilirsiniz</Text>
              </Space>
            </div>
          </div>
        </Card>

        <Card className="mb-6">
          <Title level={4} className="!mb-4">Bölge Haritası</Title>
          {!drawerVisible && (
            <RegionMap
              regions={regions}
              selectedRegion={selectedRegion}
              onRegionSelect={handleRegionSelect}
              onBoundaryChange={handleBoundaryChange}
              readOnly={false}
            />
          )}
        </Card>

        <Table
          dataSource={filteredRegions.slice(
            (pagination.current - 1) * pagination.pageSize,
            pagination.current * pagination.pageSize
          )}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
        />

        <Drawer
          title={editingRegion ? 'Bölge Düzenle' : 'Yeni Bölge Ekle'}
          width={720}
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
          styles={{ body: { paddingBottom: 80 } }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSaveRegion}
            initialValues={{ color: colorOptions[0].color }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label="Bölge Adı"
                  rules={[{ required: true, message: 'Lütfen bölge adını girin' }]}
                >
                  <Input placeholder="Bölge adını girin" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Acil Durum Seviyesi"
                  name="emergency_level"
                  rules={[{ required: true, message: 'Acil durum seviyesi seçin' }]}
                >
                  <Select placeholder="Acil durum seviyesi seçin">
                    <Option value="LOW">Düşük</Option>
                    <Option value="MEDIUM">Orta</Option>
                    <Option value="HIGH">Yüksek</Option>
                    <Option value="CRITICAL">Kritik</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="description"
                  label="Açıklama"
                  tooltip="Bu bölge hakkında detaylı açıklama yazın"
                >
                  <Input.TextArea 
                    rows={3} 
                    placeholder="Bölge açıklamasını girin..." 
                    showCount 
                    maxLength={500}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>

                <Form.Item
                  label="Bölge Rengi"
                  name="color"
                  tooltip="Haritada gösterilecek bölge rengi"
                >
                  <Select placeholder="Bölge rengi seçin">
                    {colorOptions.map((option) => (
                      <Option key={option.color} value={option.color}>
                        <Space>
                          <div
                            style={{
                              width: 16,
                              height: 16,
                              backgroundColor: option.color,
                              borderRadius: '50%',
                              border: '1px solid #d9d9d9'
                            }}
                          />
                          {option.name}
                        </Space>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  label="Lokasyonlar"
                  name="locations"
                  rules={[{ required: true, message: 'En az bir lokasyon seçin' }]}
                  tooltip="Bu bölgeye dahil edilecek ülke, şehir, ilçe veya kasabaları seçin"
                >
                  <TreeSelect
                    treeData={treeData}
                    placeholder="Lokasyon seçin..."
                    multiple
                    allowClear
                    showSearch
                    treeCheckable
                    showCheckedStrategy={SHOW_PARENT}
                    style={{ width: '100%' }}
                    styles={{ 
                      popup: { 
                        root: { maxHeight: 400, overflow: 'auto' }
                      }
                    }}
                    treeNodeFilterProp="title"
                    loading={loading}
                    notFoundContent={loading ? <Spin size="small" /> : <Empty description="Veri bulunamadı" />}
                    onChange={(value) => {
                      console.log('🌳 TreeSelect seçim değişti:', value);
                    }}
                  />
                </Form.Item>
                
                {/* Seçilen lokasyonları göster */}
                <Form.Item shouldUpdate noStyle>
                  {({ getFieldValue }) => {
                    const selectedLocations = getFieldValue('locations') || [];
                    if (selectedLocations.length === 0) return null;
                    
                    return (
                      <Card 
                        size="small" 
                        title="Seçilen Lokasyonlar" 
                        className="mt-2"
                        styles={{ body: { padding: '8px 12px' } }}
                      >
                        <Space wrap>
                          {selectedLocations.map((location: string) => (
                            <Tag key={location} color="blue" closable={false}>
                              {getLocationDisplayName(location)}
                            </Tag>
                          ))}
                        </Space>
                        <div className="mt-2 text-xs text-gray-500">
                          Toplam {selectedLocations.length} lokasyon seçildi
                        </div>
                      </Card>
                    );
                  }}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Alert
                  message="Bölge Sınırları"
                  description="Haritada bölge sınırlarını çizmek için polygon aracını kullanın. Çizilen sınırlar otomatik olarak kaydedilecektir."
                  type="info"
                  showIcon
                  className="mb-4"
                />
                <RegionMap
                  regions={selectedRegion ? [selectedRegion] : []}
                  selectedRegion={selectedRegion}
                  onBoundaryChange={handleBoundaryChange}
                  readOnly={false}
                />
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <div className="flex justify-end">
                  <Button onClick={() => setDrawerVisible(false)} style={{ marginRight: 8 }}>
                    İptal
                  </Button>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    icon={<SaveOutlined />}
                    style={{ backgroundColor: '#1890ff' }}
                  >
                    Kaydet
                  </Button>
                </div>
              </Col>
            </Row>
          </Form>
        </Drawer>
      </Card>
    </div>
  );
} 