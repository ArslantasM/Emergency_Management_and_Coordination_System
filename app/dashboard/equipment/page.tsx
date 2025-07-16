"use client";

import { useState, useEffect } from 'react';
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
  DatePicker,
  Row,
  Col,
  Tabs,
  Badge,
  InputNumber,
  Tooltip,
  Popconfirm,
  Modal,
  Statistic,
  Divider,
  message,
  List,
  Empty
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  FilterOutlined,
  ToolOutlined,
  HistoryOutlined,
  ExportOutlined,
  ImportOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  BellOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';
import locale from 'antd/es/date-picker/locale/tr_TR';
import { EquipmentType, EquipmentStatus, Equipment, MaintenanceRecord, EquipmentStats, MaintenanceType } from '../../types/equipment';

dayjs.locale('tr');

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

interface Task {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  region: string;
  status: string;
  // Ekip atama özellikleri
  team?: {
    id: string;
    name: string;
    leader?: { id: string; name: string; role: string; department?: string };
    members: { id: string; name: string; role: string }[];
  };
  // Ekipman ve envanter atama özellikleri
  assignedEquipment?: {
    id: string;
    name: string;
    type: string;
    quantity: number;
    serialNumber?: string;
  }[];
}

// Demo ekipman verileri
const equipmentData: Equipment[] = [
  {
    id: '1',
    name: 'Jeneratör X5000',
    type: EquipmentType.POWER,
    status: EquipmentStatus.AVAILABLE,
    serialNumber: 'GEN-2023-001',
    model: 'X5000',
    manufacturer: 'PowerTech',
    purchaseDate: '2023-01-15',
    purchasePrice: 15000,
    currentValue: 13500,
    location: 'İstanbul Depo',
    lastMaintenance: '2023-10-20',
    nextMaintenance: '2024-04-20',
    notes: '5kW kapasiteli dizel jeneratör',
    createdAt: '2023-01-15',
    updatedAt: '2023-10-20'
  },
  {
    id: '2',
    name: 'Portatif Su Filtresi',
    type: EquipmentType.WATER_PURIFICATION,
    status: EquipmentStatus.IN_USE,
    serialNumber: 'WF-2022-052',
    model: 'CleanFlow 100',
    manufacturer: 'WaterTech',
    purchaseDate: '2022-08-10',
    purchasePrice: 3000,
    currentValue: 2700,
    location: 'Saha Ekibi 3',
    assignedTo: 'Ahmet Yılmaz',
    lastMaintenance: '2023-07-15',
    nextMaintenance: '2024-01-15',
    notes: 'Saatte 100 litre su arıtma kapasitesi',
    createdAt: '2022-08-10',
    updatedAt: '2023-07-15'
  },
  {
    id: '3',
    name: 'Enkaz Kesme Ekipmanı',
    type: EquipmentType.SEARCH_RESCUE,
    status: EquipmentStatus.MAINTENANCE,
    serialNumber: 'RC-2021-118',
    model: 'CutMaster Pro',
    manufacturer: 'RescueTech',
    purchaseDate: '2021-05-22',
    purchasePrice: 8500,
    currentValue: 6800,
    location: 'Teknik Servis',
    lastMaintenance: '2023-11-05',
    nextMaintenance: '2024-02-05',
    notes: 'Bıçak değişimi yapıldı, hidrolik sızdırmazlık kontrol edilecek',
    createdAt: '2021-05-22',
    updatedAt: '2023-11-05'
  },
  {
    id: '4',
    name: 'Taktik Telsiz Seti',
    type: EquipmentType.COMMUNICATION,
    status: EquipmentStatus.AVAILABLE,
    serialNumber: 'COM-2023-078',
    model: 'TacComm X10',
    manufacturer: 'SecureComm',
    purchaseDate: '2023-03-10',
    purchasePrice: 4500,
    currentValue: 4200,
    location: 'İstanbul Merkez',
    lastMaintenance: '2023-09-15',
    nextMaintenance: '2024-03-15',
    notes: '10 km menzilli, şifreli iletişim',
    createdAt: '2023-03-10',
    updatedAt: '2023-09-15'
  },
  {
    id: '5',
    name: 'İlk Yardım Çantası Pro',
    type: EquipmentType.MEDICAL,
    status: EquipmentStatus.IN_USE,
    serialNumber: 'MED-2022-234',
    model: 'Responder Pro',
    manufacturer: 'MedTech',
    purchaseDate: '2022-11-18',
    purchasePrice: 1200,
    currentValue: 1000,
    location: 'Saha Ekibi 2',
    assignedTo: 'Ayşe Demir',
    lastMaintenance: '2023-08-30',
    nextMaintenance: '2024-02-28',
    notes: 'Standart üstü tıbbi malzeme içerir',
    createdAt: '2022-11-18',
    updatedAt: '2023-08-30'
  }
];

// Demo bakım kaydı verileri
const maintenanceData: MaintenanceRecord[] = [
  {
    id: 'm1',
    equipmentId: '1',
    type: MaintenanceType.ROUTINE,
    date: '2023-10-20',
    performedBy: 'Teknisyen Ali',
    description: 'Rutin yağ ve filtre değişimi',
    cost: 500,
    notes: 'Normal çalışma durumu',
    createdAt: '2023-10-20',
    updatedAt: '2023-10-20'
  },
  {
    id: 'm2',
    equipmentId: '2',
    type: MaintenanceType.PREVENTIVE,
    date: '2023-07-15',
    performedBy: 'Teknisyen Mehmet',
    description: 'Filtrelerin temizlenmesi ve değişimi',
    cost: 250,
    notes: 'Filtreler değiştirildi, performans normal',
    createdAt: '2023-07-15',
    updatedAt: '2023-07-15'
  },
  {
    id: 'm3',
    equipmentId: '3',
    type: MaintenanceType.CORRECTIVE,
    date: '2023-11-05',
    performedBy: 'Servis Mühendisi Can',
    description: 'Kesici bıçak değişimi ve hidrolik sistem kontrolü',
    cost: 1200,
    notes: 'Hidrolik sistem sızdırmazlık sorunu var, takip gerekiyor',
    createdAt: '2023-11-05',
    updatedAt: '2023-11-05'
  }
];

// Ana bileşen
const EquipmentPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [maintenanceDrawerVisible, setMaintenanceDrawerVisible] = useState(false);
  const [currentEquipment, setCurrentEquipment] = useState<Equipment | null>(null);
  const [maintenanceMode, setMaintenanceMode] = useState<'add' | 'history'>('add');
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [equipmentDetails, setEquipmentDetails] = useState<Equipment | null>(null);
  const [filteredEquipment, setFilteredEquipment] = useState(equipmentData);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [maintenanceForm] = Form.useForm();

  // Ekipman istatistikleri hesaplama
  const calculateStats = (): EquipmentStats => {
    const stats: EquipmentStats = {
      total: equipmentData.length,
      available: 0,
      inUse: 0,
      maintenance: 0,
      broken: 0,
      reserved: 0,
      retired: 0,
      byType: {} as Record<EquipmentType, number>,
      byLocation: {} as Record<string, number>
    };

    equipmentData.forEach(equipment => {
      // Durum istatistikleri
      switch (equipment.status) {
        case EquipmentStatus.AVAILABLE:
          stats.available++;
          break;
        case EquipmentStatus.IN_USE:
          stats.inUse++;
          break;
        case EquipmentStatus.MAINTENANCE:
          stats.maintenance++;
          break;
        case EquipmentStatus.BROKEN:
          stats.broken++;
          break;
        case EquipmentStatus.RESERVED:
          stats.reserved++;
          break;
        case EquipmentStatus.RETIRED:
          stats.retired++;
          break;
      }

      // Tip ve konum istatistikleri
      if (!stats.byType[equipment.type]) {
        stats.byType[equipment.type] = 0;
      }
      stats.byType[equipment.type]++;

      if (!stats.byLocation[equipment.location]) {
        stats.byLocation[equipment.location] = 0;
      }
      stats.byLocation[equipment.location]++;
    });

    return stats;
  };

  const stats = calculateStats();

  // Filtre ve arama işlemleri
  useEffect(() => {
    let result = equipmentData;
    
    if (searchText) {
      result = result.filter(item =>
        item.name.toLowerCase().includes(searchText.toLowerCase()) ||
        item.serialNumber.toLowerCase().includes(searchText.toLowerCase()) ||
        item.location.toLowerCase().includes(searchText.toLowerCase()) ||
        (item.assignedTo && item.assignedTo.toLowerCase().includes(searchText.toLowerCase()))
      );
    }
    
    if (statusFilter && statusFilter !== 'all') {
      result = result.filter(item => item.status === statusFilter);
    }
    
    if (typeFilter && typeFilter !== 'all') {
      result = result.filter(item => item.type === typeFilter);
    }
    
    setFilteredEquipment(result);
  }, [searchText, statusFilter, typeFilter]);

  // Ekipman ekleme/düzenleme
  const handleAddEquipment = () => {
    setEditingEquipment(null);
    form.resetFields();
    setDrawerVisible(true);
  };

  const handleEditEquipment = (record: Equipment) => {
    setEditingEquipment(record);
    form.setFieldsValue({
      ...record,
      purchaseDate: record.purchaseDate ? dayjs(record.purchaseDate) : null,
      lastMaintenance: record.lastMaintenance ? dayjs(record.lastMaintenance) : null,
      nextMaintenance: record.nextMaintenance ? dayjs(record.nextMaintenance) : null,
    });
    setDrawerVisible(true);
  };

  const handleSaveEquipment = (values: any) => {
    console.log('Ekipman kaydedildi:', values);
    message.success(`Ekipman ${editingEquipment ? 'güncellendi' : 'eklendi'}.`);
    setDrawerVisible(false);
  };

  // Bakım işlemleri
  const handleMaintenanceClick = (record: Equipment, mode: 'add' | 'history') => {
    setCurrentEquipment(record);
    setMaintenanceMode(mode);
    if (mode === 'add') {
      maintenanceForm.resetFields();
      maintenanceForm.setFieldsValue({
        equipmentId: record.id,
        date: dayjs(),
      });
    }
    setMaintenanceDrawerVisible(true);
  };

  const handleSaveMaintenance = (values: any) => {
    console.log('Bakım kaydedildi:', values);
    message.success('Bakım kaydı eklendi.');
    setMaintenanceDrawerVisible(false);
  };

  // Ekipman detayları görüntüleme
  const handleViewDetails = (record: Equipment) => {
    setEquipmentDetails(record);
    setDetailModalVisible(true);
  };

  // Ekipman silme
  const handleDeleteEquipment = (id: string) => {
    console.log('Ekipman silindi:', id);
    message.success('Ekipman silindi.');
  };

  // Bildirim için state
  const [notificationDrawerVisible, setNotificationDrawerVisible] = useState(false);

  // Demo bakım uyarıları hesaplama
  const calculateMaintenanceAlerts = () => {
    const today = dayjs();
    const oneWeekFromNow = today.add(7, 'day');
    
    const upcoming = equipmentData.filter(equipment => {
      if (!equipment.nextMaintenance) return false;
      const maintenanceDate = dayjs(equipment.nextMaintenance);
      return maintenanceDate.isAfter(today) && maintenanceDate.isBefore(oneWeekFromNow);
    });
    
    const overdue = equipmentData.filter(equipment => {
      if (!equipment.nextMaintenance) return false;
      const maintenanceDate = dayjs(equipment.nextMaintenance);
      return maintenanceDate.isBefore(today);
    });
    
    return { upcoming, overdue };
  };

  const maintenanceAlerts = calculateMaintenanceAlerts();
  const totalAlerts = maintenanceAlerts.upcoming.length + maintenanceAlerts.overdue.length;

  // Durum etiketi render fonksiyonu
  const renderStatusTag = (status: EquipmentStatus) => {
    switch (status) {
      case EquipmentStatus.AVAILABLE:
        return <Tag color="success">{status}</Tag>;
      case EquipmentStatus.IN_USE:
        return <Tag color="processing">{status}</Tag>;
      case EquipmentStatus.MAINTENANCE:
        return <Tag color="warning">{status}</Tag>;
      case EquipmentStatus.BROKEN:
        return <Tag color="error">{status}</Tag>;
      case EquipmentStatus.RESERVED:
        return <Tag color="blue">{status}</Tag>;
      case EquipmentStatus.RETIRED:
        return <Tag color="default">{status}</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  // Tablo sütunları
  const columns = [
    {
      title: 'Ad',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Equipment) => (
        <a onClick={() => handleViewDetails(record)}>{text}</a>
      ),
    },
    {
      title: 'Tür',
      dataIndex: 'type',
      key: 'type',
      render: (type: EquipmentType) => <Tag color="blue">{type}</Tag>,
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: renderStatusTag,
    },
    {
      title: 'Seri No',
      dataIndex: 'serialNumber',
      key: 'serialNumber',
    },
    {
      title: 'Konum',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Atanan',
      dataIndex: 'assignedTo',
      key: 'assignedTo',
      render: (text: string) => text || '-',
    },
    {
      title: 'Sonraki Bakım',
      dataIndex: 'nextMaintenance',
      key: 'nextMaintenance',
      render: (text: string) => (text ? dayjs(text).format('DD.MM.YYYY') : '-'),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (_: any, record: Equipment) => (
        <Space size="small">
          <Tooltip title="Detaylar">
            <Button 
              type="text" 
              icon={<InfoCircleOutlined />} 
              onClick={() => handleViewDetails(record)} 
            />
          </Tooltip>
          <Tooltip title="Düzenle">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => handleEditEquipment(record)} 
            />
          </Tooltip>
          <Tooltip title="Bakım Ekle">
            <Button 
              type="text" 
              icon={<ToolOutlined />} 
              onClick={() => handleMaintenanceClick(record, 'add')} 
            />
          </Tooltip>
          <Tooltip title="Bakım Geçmişi">
            <Button 
              type="text" 
              icon={<HistoryOutlined />} 
              onClick={() => handleMaintenanceClick(record, 'history')} 
            />
          </Tooltip>
          <Popconfirm
            title="Bu ekipmanı silmek istediğinizden emin misiniz?"
            onConfirm={() => handleDeleteEquipment(record.id)}
            okText="Evet"
            cancelText="Hayır"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="equipment-management-page">
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Title level={2}>Ekipman Yönetimi</Title>
          <Space>
            <Badge count={totalAlerts} offset={[-5, 5]}>
              <Button 
                icon={<BellOutlined />} 
                onClick={() => setNotificationDrawerVisible(true)}
              >
                Bakım Bildirimleri
              </Button>
            </Badge>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={handleAddEquipment}
            >
              Yeni Ekipman
            </Button>
            <Button icon={<ExportOutlined />}>Dışa Aktar</Button>
            <Button icon={<ImportOutlined />}>İçe Aktar</Button>
          </Space>
        </div>

        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8} lg={6} xl={4}>
            <Card>
              <Statistic 
                title="Toplam Ekipman" 
                value={stats.total} 
                valueStyle={{ color: '#1890ff' }} 
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6} xl={4}>
            <Card>
              <Statistic 
                title="Kullanılabilir" 
                value={stats.available} 
                valueStyle={{ color: '#52c41a' }}
                prefix={<CheckCircleOutlined />} 
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6} xl={4}>
            <Card>
              <Statistic 
                title="Kullanımda" 
                value={stats.inUse} 
                valueStyle={{ color: '#722ed1' }} 
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6} xl={4}>
            <Card>
              <Badge count={maintenanceAlerts.upcoming.length} offset={[0, 0]} style={{ backgroundColor: '#faad14' }}>
                <Statistic 
                  title="Bakımda" 
                  value={stats.maintenance} 
                  valueStyle={{ color: '#faad14' }} 
                />
              </Badge>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6} xl={4}>
            <Card>
              <Badge count={maintenanceAlerts.overdue.length} offset={[0, 0]} style={{ backgroundColor: '#f5222d' }}>
                <Statistic 
                  title="Arızalı" 
                  value={stats.broken} 
                  valueStyle={{ color: '#f5222d' }}
                  prefix={<CloseCircleOutlined />} 
                />
              </Badge>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6} xl={4}>
            <Card>
              <Statistic 
                title="Rezerve" 
                value={stats.reserved} 
                valueStyle={{ color: '#1890ff' }} 
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={24}>
            <Space style={{ marginBottom: 16 }}>
              <Input
                placeholder="Ekipman ara..."
                prefix={<SearchOutlined />}
                style={{ width: 250 }}
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
              />
              <Select
                placeholder="Durum filtrele"
                style={{ width: 160 }}
                allowClear
                onChange={value => setStatusFilter(value)}
              >
                <Option value="all">Tüm Durumlar</Option>
                {(Object.values(EquipmentStatus) as string[]).map(status => (
                  <Option key={status} value={status}>{status}</Option>
                ))}
              </Select>
              <Select
                placeholder="Tip filtrele"
                style={{ width: 180 }}
                allowClear
                onChange={value => setTypeFilter(value)}
              >
                <Option value="all">Tüm Tipler</Option>
                {(Object.values(EquipmentType) as string[]).map(type => (
                  <Option key={type} value={type}>{type}</Option>
                ))}
              </Select>
              <Button icon={<FilterOutlined />}>
                Gelişmiş Filtre
              </Button>
            </Space>
          </Col>
        </Row>

        <Table 
          columns={columns} 
          dataSource={filteredEquipment}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Ekipman Ekleme/Düzenleme Drawer */}
      <Drawer
        title={`${editingEquipment ? 'Ekipman Düzenle' : 'Yeni Ekipman Ekle'}`}
        width={600}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        styles={{ body: { paddingBottom: 80 } }}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Button onClick={() => setDrawerVisible(false)} style={{ marginRight: 8 }}>
              İptal
            </Button>
            <Button onClick={() => form.submit()} type="primary">
              Kaydet
            </Button>
          </div>
        }
      >
        <Form 
          form={form} 
          layout="vertical" 
          onFinish={handleSaveEquipment}
          initialValues={{ status: EquipmentStatus.AVAILABLE }}
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="name"
                label="Ekipman Adı"
                rules={[{ required: true, message: 'Lütfen ekipman adını girin' }]}
              >
                <Input placeholder="Ekipman adını girin" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="type"
                label="Ekipman Tipi"
                rules={[{ required: true, message: 'Lütfen ekipman tipini seçin' }]}
              >
                <Select placeholder="Tip seçin">
                  {(Object.values(EquipmentType) as string[]).map(type => (
                    <Option key={type} value={type}>{type}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Durum"
                rules={[{ required: true, message: 'Lütfen durum seçin' }]}
              >
                <Select placeholder="Durum seçin">
                  {(Object.values(EquipmentStatus) as string[]).map(status => (
                    <Option key={status} value={status}>{status}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="serialNumber"
                label="Seri Numarası"
                rules={[{ required: true, message: 'Lütfen seri numarasını girin' }]}
              >
                <Input placeholder="Seri numarası girin" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="model"
                label="Model"
              >
                <Input placeholder="Model girin" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="manufacturer"
                label="Üretici"
              >
                <Input placeholder="Üretici firma girin" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="purchaseDate"
                label="Satın Alma Tarihi"
              >
                <DatePicker style={{ width: '100%' }} locale={locale} format="DD.MM.YYYY" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="purchasePrice"
                label="Satın Alma Fiyatı"
              >
                <InputNumber 
                  style={{ width: '100%' }} 
                  placeholder="Fiyat girin" 
                  formatter={value => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value!.replace(/₺\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="currentValue"
                label="Güncel Değer"
              >
                <InputNumber 
                  style={{ width: '100%' }} 
                  placeholder="Değer girin" 
                  formatter={value => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value!.replace(/₺\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="location"
                label="Konum"
                rules={[{ required: true, message: 'Lütfen konum bilgisi girin' }]}
              >
                <Input placeholder="Konum girin" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="assignedTo"
                label="Atanan Kişi"
              >
                <Input placeholder="Atanan kişi girin (varsa)" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="lastMaintenance"
                label="Son Bakım Tarihi"
              >
                <DatePicker style={{ width: '100%' }} locale={locale} format="DD.MM.YYYY" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="nextMaintenance"
                label="Sonraki Bakım Tarihi"
              >
                <DatePicker style={{ width: '100%' }} locale={locale} format="DD.MM.YYYY" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="notes"
                label="Notlar"
              >
                <TextArea rows={4} placeholder="Ekipman hakkında notlar" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Drawer>

      {/* Bakım İşlemleri Drawer */}
      <Drawer
        title={maintenanceMode === 'add' ? 'Bakım Kaydı Ekle' : 'Bakım Geçmişi'}
        width={600}
        onClose={() => setMaintenanceDrawerVisible(false)}
        open={maintenanceDrawerVisible}
        styles={{ body: { paddingBottom: 80 } }}
        footer={
          maintenanceMode === 'add' ? (
            <div style={{ textAlign: 'right' }}>
              <Button onClick={() => setMaintenanceDrawerVisible(false)} style={{ marginRight: 8 }}>
                İptal
              </Button>
              <Button onClick={() => maintenanceForm.submit()} type="primary">
                Kaydet
              </Button>
            </div>
          ) : null
        }
      >
        {currentEquipment && (
          <div style={{ marginBottom: 16 }}>
            <Title level={5}>{currentEquipment.name}</Title>
            <Paragraph>
              <Text strong>Seri No: </Text>{currentEquipment.serialNumber}
            </Paragraph>
            <Paragraph>
              <Text strong>Konum: </Text>{currentEquipment.location}
            </Paragraph>
            <Divider />
          </div>
        )}

        {maintenanceMode === 'add' ? (
          <Form 
            form={maintenanceForm} 
            layout="vertical" 
            onFinish={handleSaveMaintenance}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="equipmentId"
                  label="Ekipman ID"
                  hidden
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name="type"
                  label="Bakım Tipi"
                  rules={[{ required: true, message: 'Lütfen bakım tipini seçin' }]}
                >
                  <Select placeholder="Tip seçin">
                    {(Object.values(MaintenanceType) as string[]).map(type => (
                      <Option key={type} value={type}>{type}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="date"
                  label="Bakım Tarihi"
                  rules={[{ required: true, message: 'Lütfen bakım tarihini seçin' }]}
                >
                  <DatePicker style={{ width: '100%' }} locale={locale} format="DD.MM.YYYY" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="performedBy"
                  label="Bakım Yapan"
                  rules={[{ required: true, message: 'Lütfen bakım yapan kişiyi girin' }]}
                >
                  <Input placeholder="Teknisyen/Yetkili adı girin" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="cost"
                  label="Maliyet"
                >
                  <InputNumber 
                    style={{ width: '100%' }} 
                    placeholder="Maliyet girin" 
                    formatter={value => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value!.replace(/₺\s?|(,*)/g, '')}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="description"
                  label="Bakım Açıklaması"
                  rules={[{ required: true, message: 'Lütfen bakım açıklaması girin' }]}
                >
                  <TextArea rows={4} placeholder="Yapılan işlemler, değiştirilen parçalar vb." />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="notes"
                  label="Ek Notlar"
                >
                  <TextArea rows={3} placeholder="Ek notlar veya öneriler" />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        ) : (
          <Table 
            columns={[
              {
                title: 'Tarih',
                dataIndex: 'date',
                key: 'date',
                render: (text: string) => dayjs(text).format('DD.MM.YYYY'),
              },
              {
                title: 'Tip',
                dataIndex: 'type',
                key: 'type',
                render: (type: MaintenanceType) => <Tag color="blue">{type}</Tag>,
              },
              {
                title: 'Yapan',
                dataIndex: 'performedBy',
                key: 'performedBy',
              },
              {
                title: 'Maliyet',
                dataIndex: 'cost',
                key: 'cost',
                render: (cost: number) => `₺${cost.toLocaleString('tr-TR')}`,
              },
              {
                title: 'Açıklama',
                dataIndex: 'description',
                key: 'description',
                ellipsis: true,
              },
            ]} 
            dataSource={maintenanceData.filter(m => m.equipmentId === currentEquipment?.id)}
            rowKey="id"
            pagination={false}
            expandable={{
              expandedRowRender: (record) => (
                <div style={{ padding: 16 }}>
                  <Paragraph>
                    <Text strong>Ayrıntılı Açıklama: </Text>
                    {record.description}
                  </Paragraph>
                  {record.notes && (
                    <Paragraph>
                      <Text strong>Notlar: </Text>
                      {record.notes}
                    </Paragraph>
                  )}
                </div>
              ),
            }}
          />
        )}
      </Drawer>

      {/* Ekipman Bakım Bildirimleri */}
      <Drawer
        title="Bakım Bildirimleri"
        width={600}
        onClose={() => setNotificationDrawerVisible(false)}
        open={notificationDrawerVisible}
        extra={
          <Space>
            <Button onClick={() => setNotificationDrawerVisible(false)}>Kapat</Button>
          </Space>
        }
      >
        <Tabs defaultActiveKey="overdue">
          <TabPane tab={<Badge count={maintenanceAlerts.overdue.length} offset={[15, 0]}>Gecikmiş Bakımlar</Badge>} key="overdue">
            {maintenanceAlerts.overdue.length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={maintenanceAlerts.overdue}
                renderItem={item => (
                  <List.Item
                    actions={[
                      <Button type="primary" size="small" danger onClick={() => handleMaintenanceClick(item, 'add')}>
                        Bakım Planla
                      </Button>,
                      <Button type="link" size="small" onClick={() => handleViewDetails(item)}>
                        Detaylar
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<Badge status="error" />}
                      title={<Text strong>{item.name}</Text>}
                      description={
                        <Space direction="vertical" size={0}>
                          <Text>Son Bakım: {item.lastMaintenance ? dayjs(item.lastMaintenance).format('DD.MM.YYYY') : 'Yok'}</Text>
                          <Text type="danger">Planlanan Bakım: {dayjs(item.nextMaintenance).format('DD.MM.YYYY')}</Text>
                          <Text type="secondary">{item.location}</Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="Gecikmiş bakım bulunmamaktadır" />
            )}
          </TabPane>
          <TabPane tab={<Badge count={maintenanceAlerts.upcoming.length} offset={[15, 0]}>Yaklaşan Bakımlar</Badge>} key="upcoming">
            {maintenanceAlerts.upcoming.length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={maintenanceAlerts.upcoming}
                renderItem={item => (
                  <List.Item
                    actions={[
                      <Button type="primary" size="small" onClick={() => handleMaintenanceClick(item, 'add')}>
                        Bakım Planla
                      </Button>,
                      <Button type="link" size="small" onClick={() => handleViewDetails(item)}>
                        Detaylar
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<Badge status="warning" />}
                      title={item.name}
                      description={
                        <Space direction="vertical" size={0}>
                          <Text>Son Bakım: {item.lastMaintenance ? dayjs(item.lastMaintenance).format('DD.MM.YYYY') : 'Yok'}</Text>
                          <Text type="warning">Planlanan Bakım: {dayjs(item.nextMaintenance).format('DD.MM.YYYY')}</Text>
                          <Text type="secondary">{item.location}</Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="Yaklaşan bakım bulunmamaktadır" />
            )}
          </TabPane>
          <TabPane tab="Tüm Ekipmanlar" key="all">
            <List
              itemLayout="horizontal"
              dataSource={equipmentData}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <Space>
                        {item.name} {renderStatusTag(item.status)}
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size={0}>
                        <Text type="secondary">Konum: {item.location}</Text>
                        {item.nextMaintenance && (
                          <Text type={
                            dayjs(item.nextMaintenance).isBefore(dayjs()) ? 'danger' :
                            dayjs(item.nextMaintenance).isBefore(dayjs().add(7, 'day')) ? 'warning' : 'secondary'
                          }>
                            Sonraki Bakım: {dayjs(item.nextMaintenance).format('DD.MM.YYYY')}
                          </Text>
                        )}
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </TabPane>
        </Tabs>
        <Divider />
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleAddEquipment}
            className="hover:bg-blue-600 hover:border-blue-600 transition-colors duration-200 shadow-sm hover:shadow-md"
            style={{ 
              background: '#1890ff',
              borderColor: '#1890ff',
              color: 'white',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            Yeni Ekipman Ekle
          </Button>
        </div>
      </Drawer>

      {/* Ekipman Detay Modal */}
      <Modal
        title="Ekipman Detayları"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setDetailModalVisible(false)}>
            Kapat
          </Button>,
          <Button 
            key="edit" 
            type="primary" 
            className="hover:bg-blue-600 hover:border-blue-600 transition-colors duration-200"
            onClick={() => {
              setDetailModalVisible(false);
              if (equipmentDetails) {
                handleEditEquipment(equipmentDetails);
              }
            }}
          >
            Düzenle
          </Button>,
        ]}
        width={800}
      >
        {equipmentDetails && (
          <>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Title level={3}>{equipmentDetails.name}</Title>
                <Space>
                  <Tag color="blue">{equipmentDetails.type}</Tag>
                  {renderStatusTag(equipmentDetails.status)}
                </Space>
              </Col>
            </Row>
            <Divider />
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Paragraph>
                  <Text strong>Seri No: </Text>{equipmentDetails.serialNumber}
                </Paragraph>
                <Paragraph>
                  <Text strong>Model: </Text>{equipmentDetails.model}
                </Paragraph>
                <Paragraph>
                  <Text strong>Üretici: </Text>{equipmentDetails.manufacturer}
                </Paragraph>
                <Paragraph>
                  <Text strong>Satın Alma Tarihi: </Text>
                  {equipmentDetails.purchaseDate ? dayjs(equipmentDetails.purchaseDate).format('DD.MM.YYYY') : '-'}
                </Paragraph>
              </Col>
              <Col span={12}>
                <Paragraph>
                  <Text strong>Konum: </Text>{equipmentDetails.location}
                </Paragraph>
                <Paragraph>
                  <Text strong>Atanan: </Text>{equipmentDetails.assignedTo || '-'}
                </Paragraph>
                <Paragraph>
                  <Text strong>Son Bakım: </Text>
                  {equipmentDetails.lastMaintenance ? dayjs(equipmentDetails.lastMaintenance).format('DD.MM.YYYY') : '-'}
                </Paragraph>
                <Paragraph>
                  <Text strong>Sonraki Bakım: </Text>
                  {equipmentDetails.nextMaintenance ? dayjs(equipmentDetails.nextMaintenance).format('DD.MM.YYYY') : '-'}
                </Paragraph>
              </Col>
            </Row>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic 
                  title="Satın Alma Fiyatı" 
                  value={equipmentDetails.purchasePrice} 
                  precision={2}
                  prefix="₺" 
                />
              </Col>
              <Col span={12}>
                <Statistic 
                  title="Güncel Değer" 
                  value={equipmentDetails.currentValue} 
                  precision={2}
                  prefix="₺" 
                />
              </Col>
            </Row>
            <Divider />
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Title level={5}>Notlar</Title>
                <Paragraph>{equipmentDetails.notes || 'Bu ekipman için not bulunmamaktadır.'}</Paragraph>
              </Col>
            </Row>
            <Divider />
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Title level={5}>Son Bakım Kayıtları</Title>
                <Table 
                  columns={[
                    {
                      title: 'Tarih',
                      dataIndex: 'date',
                      key: 'date',
                      render: (text: string) => dayjs(text).format('DD.MM.YYYY'),
                    },
                    {
                      title: 'Tip',
                      dataIndex: 'type',
                      key: 'type',
                      render: (type: MaintenanceType) => <Tag color="blue">{type}</Tag>,
                    },
                    {
                      title: 'Yapan',
                      dataIndex: 'performedBy',
                      key: 'performedBy',
                    },
                    {
                      title: 'Açıklama',
                      dataIndex: 'description',
                      key: 'description',
                      ellipsis: true,
                    },
                  ]} 
                  dataSource={maintenanceData.filter(m => m.equipmentId === equipmentDetails.id)}
                  rowKey="id"
                  pagination={false}
                  size="small"
                />
              </Col>
            </Row>
          </>
        )}
      </Modal>
    </div>
  );
};

export default EquipmentPage; 