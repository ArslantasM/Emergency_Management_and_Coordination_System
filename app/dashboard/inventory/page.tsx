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
  Progress,
  message,
  List,
  Empty,
  Dropdown,
  Alert,
  Upload,
  Descriptions,
  Radio,
  Switch,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  FilterOutlined,
  HistoryOutlined,
  ExportOutlined,
  ImportOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  CloudUploadOutlined,
  DownOutlined,
  UpOutlined,
  SyncOutlined,
  BellOutlined,
  AppstoreAddOutlined,
  SwapOutlined,
  ProfileOutlined,
  UploadOutlined,
  HomeOutlined,
  DatabaseOutlined,
  InboxOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';
import locale from 'antd/es/date-picker/locale/tr_TR';
import {
  InventoryCategory,
  StorageCondition,
  TransactionType,
  Inventory,
  InventoryTransaction,
  InventoryAdjustment,
  InventoryStats
} from '../../types/inventory';

dayjs.locale('tr');

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

// Demo envanter verileri
const inventoryData: Inventory[] = [
  {
    id: '1',
    name: 'N95 Maske',
    category: InventoryCategory.MEDICAL,
    sku: 'MD-MASK-N95',
    description: 'Yüksek filtrasyon özellikli N95 tipi solunum maskesi',
    unitOfMeasure: 'Adet',
    currentStock: 500,
    minimumStock: 100,
    reorderPoint: 150,
    reorderQuantity: 200,
    unitCost: 15,
    location: 'Merkez Depo A3',
    storageCondition: StorageCondition.DRY,
    expiryDate: '2025-07-15',
    lastStockCheck: '2023-11-20',
    supplierInfo: 'Medikal Sağlık Ltd. Şti.',
    batchNumber: 'BN2023-567',
    notes: 'Acil durum personeli için öncelikli kullanım',
    createdAt: '2023-01-10',
    updatedAt: '2023-11-20'
  },
  {
    id: '2',
    name: 'Su Arıtma Tableti',
    category: InventoryCategory.WATER,
    sku: 'WT-PURI-TAB',
    description: '1 tablet 1 litre suyu arıtmak için yeterlidir',
    unitOfMeasure: 'Tablet',
    currentStock: 2000,
    minimumStock: 500,
    reorderPoint: 750,
    reorderQuantity: 1000,
    unitCost: 2.5,
    location: 'Merkez Depo B2',
    storageCondition: StorageCondition.DRY,
    expiryDate: '2024-12-30',
    lastStockCheck: '2023-10-15',
    supplierInfo: 'Yaşam Destek Ekipmanları A.Ş.',
    batchNumber: 'BN2023-118',
    notes: 'Her kutuda 50 tablet bulunur',
    createdAt: '2023-02-20',
    updatedAt: '2023-10-15'
  },
  {
    id: '3',
    name: 'Acil Durum Battaniyesi',
    category: InventoryCategory.SHELTER,
    sku: 'SH-BLNK-EM',
    description: 'Termal reflektif acil durum battaniyesi',
    unitOfMeasure: 'Adet',
    currentStock: 300,
    minimumStock: 100,
    reorderPoint: 120,
    reorderQuantity: 150,
    unitCost: 8,
    location: 'Merkez Depo C1',
    storageCondition: StorageCondition.AMBIENT,
    lastStockCheck: '2023-09-05',
    supplierInfo: 'Dış Mekan Ekipmanları Ltd.',
    batchNumber: 'BN2023-089',
    notes: 'Tekli paketlenmiş, hafif ve kompakt',
    createdAt: '2023-03-05',
    updatedAt: '2023-09-05'
  },
  {
    id: '4',
    name: 'El Feneri',
    category: InventoryCategory.TOOLS,
    sku: 'TL-LGHT-01',
    description: 'Şarj edilebilir LED el feneri, su geçirmez',
    unitOfMeasure: 'Adet',
    currentStock: 80,
    minimumStock: 30,
    reorderPoint: 40,
    reorderQuantity: 50,
    unitCost: 45,
    location: 'Merkez Depo D2',
    storageCondition: StorageCondition.AMBIENT,
    lastStockCheck: '2023-11-10',
    supplierInfo: 'Teknik Malzeme San. Tic.',
    batchNumber: 'BN2023-045',
    notes: 'Her fener 1 yedek pil ile birlikte gelir',
    createdAt: '2023-04-12',
    updatedAt: '2023-11-10'
  },
  {
    id: '5',
    name: 'Hazır Gıda Paketi',
    category: InventoryCategory.FOOD,
    sku: 'FD-PACK-01',
    description: '3 günlük acil durum hazır gıda paketi',
    unitOfMeasure: 'Paket',
    currentStock: 150,
    minimumStock: 50,
    reorderPoint: 60,
    reorderQuantity: 100,
    unitCost: 120,
    location: 'Merkez Depo A1 (Soğuk)',
    storageCondition: StorageCondition.COOL,
    expiryDate: '2024-06-30',
    lastStockCheck: '2023-10-20',
    supplierInfo: 'Acil Durum Gıda Sistemleri',
    batchNumber: 'BN2023-126',
    notes: 'Alerjenleri içerir: gluten, süt ürünleri, fıstık',
    createdAt: '2023-05-25',
    updatedAt: '2023-10-20'
  }
];

// Demo envanter işlemleri
const transactionData: InventoryTransaction[] = [
  {
    id: 't1',
    inventoryId: '1',
    type: TransactionType.PURCHASE,
    quantity: 200,
    unitCost: 15,
    date: '2023-10-15',
    source: 'Medikal Sağlık Ltd. Şti.',
    performedBy: 'Ali Yılmaz',
    referenceNumber: 'PO-2023-053',
    notes: 'Acil alım',
    createdAt: '2023-10-15',
    updatedAt: '2023-10-15'
  },
  {
    id: 't2',
    inventoryId: '1',
    type: TransactionType.CONSUMPTION,
    quantity: 50,
    date: '2023-11-05',
    destination: 'Saha Ekibi 2',
    performedBy: 'Mehmet Demir',
    notes: 'Deprem bölgesi operasyonu için',
    createdAt: '2023-11-05',
    updatedAt: '2023-11-05'
  },
  {
    id: 't3',
    inventoryId: '2',
    type: TransactionType.PURCHASE,
    quantity: 1000,
    unitCost: 2.5,
    date: '2023-09-20',
    source: 'Yaşam Destek Ekipmanları A.Ş.',
    performedBy: 'Ali Yılmaz',
    referenceNumber: 'PO-2023-047',
    createdAt: '2023-09-20',
    updatedAt: '2023-09-20'
  },
  {
    id: 't4',
    inventoryId: '3',
    type: TransactionType.DONATION,
    quantity: 100,
    date: '2023-10-10',
    source: 'ABC Şirketi Bağışı',
    performedBy: 'Ayşe Demir',
    notes: 'Kurumsal bağış programı',
    createdAt: '2023-10-10',
    updatedAt: '2023-10-10'
  },
  {
    id: 't5',
    inventoryId: '4',
    type: TransactionType.TRANSFER,
    quantity: 20,
    date: '2023-11-15',
    source: 'Merkez Depo',
    destination: 'Saha Ofisi İzmir',
    performedBy: 'Hasan Kaya',
    referenceNumber: 'TR-2023-022',
    createdAt: '2023-11-15',
    updatedAt: '2023-11-15'
  }
];

// Demo envanter düzeltmeleri
const adjustmentData: InventoryAdjustment[] = [
  {
    id: 'a1',
    inventoryId: '1',
    previousStock: 450,
    newStock: 500,
    reason: 'Sayım düzeltmesi',
    date: '2023-11-20',
    performedBy: 'Depo Sorumlusu Ahmet',
    notes: 'Fiziki sayım sonucu stok güncellendi',
    createdAt: '2023-11-20',
    updatedAt: '2023-11-20'
  },
  {
    id: 'a2',
    inventoryId: '3',
    previousStock: 310,
    newStock: 300,
    reason: 'Hasar tespiti',
    date: '2023-09-05',
    performedBy: 'Depo Sorumlusu Ahmet',
    notes: '10 adet battaniye paket hasarı nedeniyle kullanılamaz durumda',
    createdAt: '2023-09-05',
    updatedAt: '2023-09-05'
  }
];

// Task tipi için basitleştirilmiş interface
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
  // Envanter atama özellikleri
  assignedInventory?: {
    id: string;
    name: string;
    category: string;
    quantity: number;
    unit: string;
  }[];
}

// Ana bileşen
const InventoryPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingInventory, setEditingInventory] = useState<Inventory | null>(null);
  const [transactionDrawerVisible, setTransactionDrawerVisible] = useState(false);
  const [currentInventory, setCurrentInventory] = useState<Inventory | null>(null);
  const [transactionMode, setTransactionMode] = useState<'add' | 'history' | 'adjustment'>('add');
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [inventoryDetails, setInventoryDetails] = useState<Inventory | null>(null);
  const [filteredInventory, setFilteredInventory] = useState(inventoryData);
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [lowStockFilter, setLowStockFilter] = useState<boolean>(false);
  const [expiringSoonFilter, setExpiringSoonFilter] = useState<boolean>(false);
  const [bulkUploadModalVisible, setBulkUploadModalVisible] = useState(false);
  const [warehouseModalVisible, setWarehouseModalVisible] = useState(false);
  const [transferModalVisible, setTransferModalVisible] = useState(false);
  const [warehouseList, setWarehouseList] = useState<any[]>([
    { id: '1', name: 'Merkez Depo', location: 'İstanbul', latitude: 41.0082, longitude: 28.9784, area: 1200, hasCooling: true },
    { id: '2', name: 'Doğu Bölge Deposu', location: 'Erzurum', latitude: 39.9101, longitude: 41.2819, area: 850, hasCooling: false },
    { id: '3', name: 'Güney Depo', location: 'Adana', latitude: 37.0001, longitude: 35.3212, area: 750, hasCooling: true },
  ]);
  const [sourceWarehouse, setSourceWarehouse] = useState<string>('');
  const [targetWarehouse, setTargetWarehouse] = useState<string>('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  
  const [form] = Form.useForm();
  const [transactionForm] = Form.useForm();
  const [adjustmentForm] = Form.useForm();
  const [warehouseForm] = Form.useForm();
  const [transferForm] = Form.useForm();

  // Envanter istatistikleri hesaplama
  const calculateStats = (): InventoryStats => {
    const stats: InventoryStats = {
      totalItems: inventoryData.length,
      totalValue: 0,
      lowStockItems: 0,
      expiringItems: 0,
      byCategory: {} as Record<InventoryCategory, number>,
      byLocation: {} as Record<string, number>,
      byStorageCondition: {} as Record<StorageCondition, number>,
      recentTransactions: transactionData.length
    };

    const threeMonthsFromNow = dayjs().add(3, 'month');

    inventoryData.forEach(item => {
      // Toplam değer
      stats.totalValue += item.currentStock * item.unitCost;

      // Düşük stok
      if (item.currentStock <= item.reorderPoint) {
        stats.lowStockItems++;
      }

      // Yakında son kullanma tarihi dolacak olanlar
      if (item.expiryDate && dayjs(item.expiryDate).isBefore(threeMonthsFromNow)) {
        stats.expiringItems++;
      }

      // Kategori istatistikleri
      if (!stats.byCategory[item.category]) {
        stats.byCategory[item.category] = 0;
      }
      stats.byCategory[item.category]++;

      // Konum istatistikleri
      if (!stats.byLocation[item.location]) {
        stats.byLocation[item.location] = 0;
      }
      stats.byLocation[item.location]++;

      // Depolama koşulu istatistikleri
      if (!stats.byStorageCondition[item.storageCondition]) {
        stats.byStorageCondition[item.storageCondition] = 0;
      }
      stats.byStorageCondition[item.storageCondition]++;
    });

    return stats;
  };

  const stats = calculateStats();

  // Filtre ve arama işlemleri
  useEffect(() => {
    let result = inventoryData;
    
    if (searchText) {
      result = result.filter(item =>
        item.name.toLowerCase().includes(searchText.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchText.toLowerCase()) ||
        item.location.toLowerCase().includes(searchText.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchText.toLowerCase()))
      );
    }
    
    if (categoryFilter && categoryFilter !== 'all') {
      result = result.filter(item => item.category === categoryFilter);
    }
    
    if (lowStockFilter) {
      result = result.filter(item => item.currentStock <= item.reorderPoint);
    }
    
    if (expiringSoonFilter) {
      const threeMonthsFromNow = dayjs().add(3, 'month');
      result = result.filter(item => 
        item.expiryDate && dayjs(item.expiryDate).isBefore(threeMonthsFromNow)
      );
    }
    
    setFilteredInventory(result);
  }, [searchText, categoryFilter, lowStockFilter, expiringSoonFilter]);

  // Envanter ekleme/düzenleme
  const handleAddInventory = () => {
    setEditingInventory(null);
    form.resetFields();
    setDrawerVisible(true);
  };

  const handleEditInventory = (record: Inventory) => {
    setEditingInventory(record);
    form.setFieldsValue({
      ...record,
      expiryDate: record.expiryDate ? dayjs(record.expiryDate) : null,
      lastStockCheck: record.lastStockCheck ? dayjs(record.lastStockCheck) : null,
    });
    setDrawerVisible(true);
  };

  const handleSaveInventory = (values: any) => {
    console.log('Envanter kaydedildi:', values);
    message.success(`Envanter ${editingInventory ? 'güncellendi' : 'eklendi'}.`);
    setDrawerVisible(false);
  };

  // İşlem işlemleri
  const handleTransactionClick = (record: Inventory, mode: 'add' | 'history' | 'adjustment') => {
    setCurrentInventory(record);
    setTransactionMode(mode);
    
    if (mode === 'add') {
      transactionForm.resetFields();
      transactionForm.setFieldsValue({
        inventoryId: record.id,
        date: dayjs(),
      });
    } else if (mode === 'adjustment') {
      adjustmentForm.resetFields();
      adjustmentForm.setFieldsValue({
        inventoryId: record.id,
        previousStock: record.currentStock,
        newStock: record.currentStock,
        date: dayjs(),
      });
    }
    
    setTransactionDrawerVisible(true);
  };

  const handleSaveTransaction = (values: any) => {
    console.log('İşlem kaydedildi:', values);
    message.success('İşlem kaydı eklendi.');
    setTransactionDrawerVisible(false);
  };

  const handleSaveAdjustment = (values: any) => {
    console.log('Stok düzeltmesi kaydedildi:', values);
    message.success('Stok düzeltmesi kaydedildi.');
    setTransactionDrawerVisible(false);
  };

  // Envanter detayları görüntüleme
  const handleViewDetails = (record: Inventory) => {
    setInventoryDetails(record);
    setDetailModalVisible(true);
  };

  // Envanter silme
  const handleDeleteInventory = (id: string) => {
    console.log('Envanter silindi:', id);
    message.success('Envanter silindi.');
  };

  // Bildirim için state
  const [notificationDrawerVisible, setNotificationDrawerVisible] = useState(false);

  // Demo envanter uyarıları hesaplama
  const calculateInventoryAlerts = () => {
    const today = dayjs();
    const oneMonthFromNow = today.add(30, 'day');
    
    // Son kullanma tarihi yaklaşan ürünler
    const expiringSoon = inventoryData.filter(inventory => {
      if (!inventory.expiryDate) return false;
      const expiryDate = dayjs(inventory.expiryDate);
      return expiryDate.isAfter(today) && expiryDate.isBefore(oneMonthFromNow);
    });
    
    // Son kullanma tarihi geçmiş ürünler
    const expired = inventoryData.filter(inventory => {
      if (!inventory.expiryDate) return false;
      const expiryDate = dayjs(inventory.expiryDate);
      return expiryDate.isBefore(today);
    });
    
    // Stok seviyesi düşük olan ürünler
    const lowStock = inventoryData.filter(inventory => 
      inventory.currentStock <= inventory.minimumStock
    );
    
    return { expiringSoon, expired, lowStock };
  };

  const inventoryAlerts = calculateInventoryAlerts();
  const totalAlerts = inventoryAlerts.expiringSoon.length + 
                      inventoryAlerts.expired.length + 
                      inventoryAlerts.lowStock.length;

  // Stok durumu hesaplama
  const calculateStockStatus = (current: number, min: number, reorder: number) => {
    if (current <= min) {
      return { status: 'danger', text: 'Kritik', percent: Math.min(100, (current / min) * 100) };
    } else if (current <= reorder) {
      return { status: 'warning', text: 'Düşük', percent: Math.min(100, ((current - min) / (reorder - min)) * 100) };
    } else {
      return { status: 'success', text: 'Normal', percent: 100 };
    }
  };

  // Tablo sütunları
  const columns = [
    {
      title: 'Ürün Adı',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Inventory) => (
        <a onClick={() => handleViewDetails(record)}>{text}</a>
      ),
    },
    {
      title: 'Kategori',
      dataIndex: 'category',
      key: 'category',
      render: (category: InventoryCategory) => <Tag color="blue">{category}</Tag>,
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
    },
    {
      title: 'Stok',
      dataIndex: 'currentStock',
      key: 'currentStock',
      render: (stock: number, record: Inventory) => {
        const status = calculateStockStatus(stock, record.minimumStock, record.reorderPoint);
        return (
          <Space direction="vertical" size={0} style={{ width: '100%' }}>
            <span>{stock} {record.unitOfMeasure}</span>
            <Progress 
              percent={status.percent} 
              size="small" 
              status={status.status as any}
              showInfo={false}
            />
            <Text type={status.status === 'danger' ? 'danger' : status.status === 'warning' ? 'warning' : undefined}>
              {status.text}
            </Text>
          </Space>
        );
      },
    },
    {
      title: 'Konum',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Depolama',
      dataIndex: 'storageCondition',
      key: 'storageCondition',
      render: (condition: StorageCondition) => <Tag>{condition}</Tag>,
    },
    {
      title: 'Son Kullanma',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      render: (text: string) => {
        if (!text) return '-';
        const date = dayjs(text);
        const today = dayjs();
        const months = date.diff(today, 'month');
        
        if (months < 0) {
          return <Tag color="red">{date.format('DD.MM.YYYY')} (Süresi doldu)</Tag>;
        } else if (months < 3) {
          return <Tag color="orange">{date.format('DD.MM.YYYY')} ({months} ay kaldı)</Tag>;
        } else {
          return date.format('DD.MM.YYYY');
        }
      },
    },
    {
      title: 'Değer',
      dataIndex: 'unitCost',
      key: 'unitCost',
      render: (cost: number, record: Inventory) => {
        const totalCost = cost * record.currentStock;
        return `₺${totalCost.toLocaleString('tr-TR')}`;
      },
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (_: any, record: Inventory) => (
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
              onClick={() => handleEditInventory(record)} 
            />
          </Tooltip>
          <Tooltip title="Stok İşlemi Ekle">
            <Button 
              type="text" 
              icon={<PlusOutlined />} 
              onClick={() => handleTransactionClick(record, 'add')} 
            />
          </Tooltip>
          <Tooltip title="Stok Düzeltme">
            <Button 
              type="text" 
              icon={<SyncOutlined />} 
              onClick={() => handleTransactionClick(record, 'adjustment')} 
            />
          </Tooltip>
          <Tooltip title="İşlem Geçmişi">
            <Button 
              type="text" 
              icon={<HistoryOutlined />} 
              onClick={() => handleTransactionClick(record, 'history')} 
            />
          </Tooltip>
          <Popconfirm
            title="Bu ürünü silmek istediğinizden emin misiniz?"
            onConfirm={() => handleDeleteInventory(record.id)}
            okText="Evet"
            cancelText="Hayır"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Bildirim modalı için items tanımlaması
  const getNotificationTabItems = (
    inventoryData: Inventory[],
    transactionData: InventoryTransaction[],
    handleViewDetails: (record: Inventory) => void,
    handleTransactionClick: (record: Inventory, mode: 'add' | 'history' | 'adjustment') => void
  ) => [
    {
      key: 'alerts',
      label: 'Stok Uyarıları',
      children: (
        <Table
          dataSource={inventoryData.filter(item => item.currentStock <= item.reorderPoint)}
          rowKey="id"
          columns={[
            {
              title: 'Ürün',
              dataIndex: 'name',
              key: 'name',
              render: (text, record: any) => <a onClick={() => handleViewDetails(record)}>{text}</a>,
            },
            {
              title: 'Stok',
              dataIndex: 'currentStock',
              key: 'currentStock',
              render: (text, record: any) => (
                <span style={{ color: record.currentStock <= record.minimumStock ? '#f5222d' : '#faad14' }}>
                  {text} / {record.minimumStock} (Min)
                </span>
              )
            },
            {
              title: 'Sipariş Noktası',
              dataIndex: 'reorderPoint',
              key: 'reorderPoint',
            },
            {
              title: 'Önerilen Sipariş',
              dataIndex: 'reorderQuantity',
              key: 'reorderQuantity',
            },
            {
              title: 'İşlem',
              key: 'action',
              render: (_, record: any) => (
                <Button type="primary" size="small" onClick={() => handleTransactionClick(record, 'add')}>
                  Stok Ekle
                </Button>
              ),
            },
          ]}
          pagination={false}
          size="small"
        />
      ),
    },
    {
      key: 'expiry',
      label: 'Son Kullanma Uyarıları',
      children: (
        <Table
          dataSource={inventoryData.filter(item => 
            item.expiryDate && dayjs(item.expiryDate).isBefore(dayjs().add(3, 'month'))
          )}
          rowKey="id"
          columns={[
            {
              title: 'Ürün',
              dataIndex: 'name',
              key: 'name',
              render: (text, record: any) => <a onClick={() => handleViewDetails(record)}>{text}</a>,
            },
            {
              title: 'Son Kullanma',
              dataIndex: 'expiryDate',
              key: 'expiryDate',
              render: (text) => {
                const date = dayjs(text);
                const today = dayjs();
                const months = date.diff(today, 'month');
                
                return (
                  <span style={{ color: months < 1 ? '#f5222d' : '#faad14' }}>
                    {date.format('DD.MM.YYYY')} ({months < 0 ? 'Süresi doldu' : `${months} ay kaldı`})
                  </span>
                );
              }
            },
            {
              title: 'Stok',
              dataIndex: 'currentStock',
              key: 'currentStock',
            },
            {
              title: 'İşlem',
              key: 'action',
              render: (_, record: any) => (
                <Space>
                  <Button type="primary" size="small" danger onClick={() => handleTransactionClick(record, 'adjustment')}>
                    Düzeltme Yap
                  </Button>
                  <Button size="small" onClick={() => handleViewDetails(record)}>
                    Detaylar
                  </Button>
                </Space>
              ),
            },
          ]}
          pagination={false}
          size="small"
        />
      ),
    },
    {
      key: 'transactions',
      label: 'Son İşlemler',
      children: (
        <Table
          dataSource={transactionData.slice(0, 5)}
          rowKey="id"
          columns={[
            {
              title: 'Tarih',
              dataIndex: 'date',
              key: 'date',
              render: (text) => dayjs(text).format('DD.MM.YYYY'),
            },
            {
              title: 'İşlem',
              dataIndex: 'type',
              key: 'type',
              render: (type: TransactionType) => {
                const typeColors: Record<string, string> = {
                  [TransactionType.PURCHASE]: 'green',
                  [TransactionType.CONSUMPTION]: 'red',
                  [TransactionType.TRANSFER_IN]: 'blue',
                  [TransactionType.TRANSFER_OUT]: 'blue',
                  [TransactionType.DONATION]: 'purple',
                  [TransactionType.RETURN]: 'cyan',
                  [TransactionType.ADJUSTMENT]: 'orange',
                  [TransactionType.DISCARD]: 'red',
                  [TransactionType.DISTRIBUTION]: 'geekblue',
                  [TransactionType.OTHER]: 'default',
                };
                return <Tag color={typeColors[type]}>{type}</Tag>;
              }
            },
            {
              title: 'Ürün',
              key: 'product',
              render: (_, record: any) => {
                const item = inventoryData.find(i => i.id === record.inventoryId);
                return item ? item.name : 'Bilinmeyen Ürün';
              }
            },
            {
              title: 'Miktar',
              dataIndex: 'quantity',
              key: 'quantity',
            },
            {
              title: 'İşlemi Yapan',
              dataIndex: 'performedBy',
              key: 'performedBy',
            },
          ]}
          pagination={false}
          size="small"
        />
      ),
    }
  ];

  // Toplu envanter yükleme modalını gösterme
  const showBulkUploadModal = () => {
    setBulkUploadModalVisible(true);
  };
  
  // Depo tanımlama modalını gösterme
  const showWarehouseModal = () => {
    warehouseForm.resetFields();
    setWarehouseModalVisible(true);
  };
  
  // Yeni depo tanımlama
  const handleSaveWarehouse = (values: any) => {
    console.log('Yeni depo tanımlandı:', values);
    message.success('Depo başarıyla tanımlandı');
    setWarehouseModalVisible(false);
    // Depoları güncelle
    const newWarehouse = {
      id: `${warehouseList.length + 1}`,
      name: values.name,
      location: values.location,
      latitude: values.latitude,
      longitude: values.longitude,
      area: values.area,
      hasCooling: values.hasCooling,
    };
    setWarehouseList([...warehouseList, newWarehouse]);
  };
  
  // Depo transferi modalını gösterme
  const showTransferModal = () => {
    transferForm.resetFields();
    setTransferModalVisible(true);
  };
  
  // Depo transferi kaydetme
  const handleSaveTransfer = (values: any) => {
    console.log('Depo transferi kaydedildi:', values);
    
    // Görev Yönetimi sayfasına yeni görev eklenecek
    const newTask = {
      id: `transfer-${Date.now()}`,
      title: `${values.sourceWarehouse} - ${values.targetWarehouse} Depo Transferi`,
      description: `${values.products.join(', ')} ürünlerinin transferi`,
      startDate: values.dateRange[0].format('YYYY-MM-DD'),
      endDate: values.dateRange[1].format('YYYY-MM-DD'),
      priority: 'MEDIUM',
      status: 'PENDING',
      assignees: [
        { id: values.sender, name: 'Gönderen Personel', role: 'Depo Görevlisi' },
        { id: values.receiver, name: 'Alıcı Personel', role: 'Depo Görevlisi' }
      ]
    };
    
    console.log('Oluşturulacak Görev:', newTask);
    message.success('Transfer görevi başarıyla oluşturuldu');
    setTransferModalVisible(false);
  };
  
  // Excel şablonu indirme
  const handleDownloadTemplate = () => {
    message.success('Excel şablonu indiriliyor...');
    // Excel şablonu indirme işlemi
  };

  const tabItems = [
    {
      key: 'basic',
      label: 'Temel Bilgiler',
      children: (
        <Form.Item
          label="Ürün Adı"
          name="name"
          rules={[{ required: true, message: 'Lütfen ürün adını girin' }]}
        >
          <Input />
        </Form.Item>
      )
    },
    {
      key: 'stock',
      label: 'Stok Bilgileri',
      children: (
        <Form.Item
          label="Mevcut Stok"
          name="currentStock"
          rules={[{ required: true, message: 'Lütfen mevcut stok miktarını girin' }]}
        >
          <InputNumber min={0} />
        </Form.Item>
      )
    },
    {
      key: 'storage',
      label: 'Depolama',
      children: (
        <Form.Item
          label="Depolama Konumu"
          name="location"
          rules={[{ required: true, message: 'Lütfen depolama konumunu girin' }]}
        >
          <Input />
        </Form.Item>
      )
    },
    {
      key: 'supplier',
      label: 'Tedarikçi & Notlar',
      children: (
        <Form.Item
          label="Tedarikçi Bilgisi"
          name="supplierInfo"
        >
          <Input />
        </Form.Item>
      )
    }
  ];

  return (
    <div className="inventory-management-page">
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Title level={2}>Envanter Yönetimi</Title>
          <Space>
            <Badge count={totalAlerts} offset={[-5, 5]}>
              <Button 
                icon={<BellOutlined />} 
                onClick={() => setNotificationDrawerVisible(true)}
              >
                Bildirimler
              </Button>
            </Badge>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={handleAddInventory}
              style={{ marginRight: 8 }}
            >
              Yeni Envanter
            </Button>
            <Dropdown 
              menu={{ 
                items: [
                  {
                    key: '1',
                    label: 'Toplu Envanter Ekle',
                    icon: <AppstoreAddOutlined />,
                    onClick: showBulkUploadModal
                  },
                  {
                    key: '2',
                    label: 'Depo Transferi Yap',
                    icon: <SwapOutlined />,
                    onClick: showTransferModal
                  },
                  {
                    key: '3',
                    label: 'Görev için Envanter Ata',
                    icon: <ProfileOutlined />,
                    onClick: () => {
                      handleAddInventory();
                      setTimeout(() => {
                        form.setFieldsValue({ assignToTask: true });
                      }, 100);
                    }
                  },
                  {
                    key: '4',
                    label: 'Depo Tanımla',
                    icon: <HomeOutlined />,
                    onClick: showWarehouseModal
                  }
                ]
              }} 
              placement="bottomLeft"
            >
              <Button icon={<DownOutlined />}>Envanter İşlemleri</Button>
            </Dropdown>
            <Button icon={<ExportOutlined />}>Dışa Aktar</Button>
            <Button icon={<ImportOutlined />}>İçe Aktar</Button>
          </Space>
        </div>

        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8} lg={6} xl={4}>
            <Card>
              <Statistic 
                title="Toplam Ürün" 
                value={stats.totalItems} 
                valueStyle={{ color: '#1890ff' }} 
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6} xl={4}>
            <Card>
              <Statistic 
                title="Toplam Değer" 
                value={stats.totalValue} 
                precision={2}
                valueStyle={{ color: '#52c41a' }}
                prefix="₺" 
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6} xl={4}>
            <Card>
              <Badge count={stats.lowStockItems} offset={[0, 0]} style={{ backgroundColor: '#faad14' }}>
                <Statistic 
                  title="Düşük Stok" 
                  value={stats.lowStockItems} 
                  valueStyle={{ color: '#faad14' }}
                  prefix={<WarningOutlined />} 
                />
              </Badge>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6} xl={4}>
            <Card>
              <Badge count={stats.expiringItems} offset={[0, 0]} style={{ backgroundColor: '#f5222d' }}>
                <Statistic 
                  title="Son Kullanma Yakın" 
                  value={stats.expiringItems} 
                  valueStyle={{ color: '#f5222d' }}
                />
              </Badge>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6} xl={4}>
            <Card>
              <Statistic 
                title="Son İşlemler" 
                value={stats.recentTransactions} 
                valueStyle={{ color: '#1890ff' }} 
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6} xl={4}>
            <Card>
              <Statistic 
                title="Kategori Sayısı" 
                value={Object.keys(stats.byCategory).length} 
                valueStyle={{ color: '#1890ff' }} 
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={24}>
            <Badge 
              count={lowStockFilter || expiringSoonFilter ? filteredInventory.length : 0} 
              offset={[-5, 5]}
              style={{ backgroundColor: (lowStockFilter && expiringSoonFilter) ? '#ff4d4f' : (lowStockFilter ? '#faad14' : '#f5222d') }}
            >
              <Space style={{ marginBottom: 16 }}>
                <Input
                  placeholder="Envanter ara..."
                  prefix={<SearchOutlined />}
                  style={{ width: 250 }}
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                />
                <Select
                  placeholder="Kategori filtrele"
                  style={{ width: 180 }}
                  allowClear
                  onChange={value => setCategoryFilter(value)}
                >
                  <Option value="all">Tüm Kategoriler</Option>
                  {Object.values(InventoryCategory).map(category => (
                    <Option key={category} value={category}>{category}</Option>
                  ))}
                </Select>
                <Button 
                  type={lowStockFilter ? "primary" : "default"}
                  icon={<WarningOutlined />} 
                  onClick={() => setLowStockFilter(!lowStockFilter)}
                  danger={lowStockFilter}
                >
                  Düşük Stok
                </Button>
                <Button 
                  type={expiringSoonFilter ? "primary" : "default"}
                  danger={expiringSoonFilter}
                  onClick={() => setExpiringSoonFilter(!expiringSoonFilter)}
                >
                  Son Kullanma Yakın
                </Button>
                <Button icon={<FilterOutlined />}>
                  Gelişmiş Filtre
                </Button>
              </Space>
            </Badge>
          </Col>
        </Row>

        <Table 
          columns={columns} 
          dataSource={filteredInventory}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Envanter Bildirim Merkezi */}
      <Modal
        title="Bildirim Merkezi"
        width={800}
        footer={null}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
      >
        <Tabs 
          defaultActiveKey="alerts"
          items={getNotificationTabItems(inventoryData, transactionData, handleViewDetails, handleTransactionClick)}
        />
      </Modal>

      {/* Bildirimler Drawer */}
      <Drawer
        title="Envanter Bildirimleri"
        width={600}
        onClose={() => setNotificationDrawerVisible(false)}
        open={notificationDrawerVisible}
        extra={
          <Space>
            <Button onClick={() => setNotificationDrawerVisible(false)}>Kapat</Button>
          </Space>
        }
      >
        <Tabs
          defaultActiveKey="expired"
          items={[
            {
              key: "expired",
              label: <Badge count={inventoryAlerts.expired.length} offset={[15, 0]}>Son Kullanma Tarihi Geçmiş</Badge>,
              children: (
                <>
                  {inventoryAlerts.expired.length > 0 ? (
                    <List
                      itemLayout="horizontal"
                      dataSource={inventoryAlerts.expired}
                      renderItem={item => (
                        <List.Item
                          actions={[
                            <Button type="primary" size="small" danger onClick={() => handleTransactionClick(item, 'adjustment')}>
                              Düzeltme Yap
                            </Button>,
                            <Button type="link" size="small" onClick={() => handleViewDetails(item)}>
                              Detaylar
                            </Button>
                          ]}
                        >
                          <List.Item.Meta
                            avatar={<Badge status="error" />}
                            title={item.name}
                            description={
                              <Space direction="vertical" size={0}>
                                <Text type="danger">Son Kullanma: {dayjs(item.expiryDate).format('DD.MM.YYYY')}</Text>
                                <Text>Mevcut Stok: {item.currentStock} {item.unitOfMeasure}</Text>
                                <Text type="secondary">{item.location}</Text>
                              </Space>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  ) : (
                    <Empty description="Son kullanma tarihi geçmiş ürün bulunmamaktadır" />
                  )}
                </>
              )
            },
            {
              key: "expiring",
              label: <Badge count={inventoryAlerts.expiringSoon.length} offset={[15, 0]}>Yaklaşan Son Kullanma</Badge>,
              children: (
                <>
                  {inventoryAlerts.expiringSoon.length > 0 ? (
                    <List
                      itemLayout="horizontal"
                      dataSource={inventoryAlerts.expiringSoon}
                      renderItem={item => (
                        <List.Item
                          actions={[
                            <Button type="primary" size="small" onClick={() => handleTransactionClick(item, 'history')}>
                              İşlem Geçmişi
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
                                <Text type="warning">Son Kullanma: {dayjs(item.expiryDate).format('DD.MM.YYYY')}</Text>
                                <Text>Mevcut Stok: {item.currentStock} {item.unitOfMeasure}</Text>
                                <Text type="secondary">{item.location}</Text>
                              </Space>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  ) : (
                    <Empty description="Son kullanma tarihi yaklaşan ürün bulunmamaktadır" />
                  )}
                </>
              )
            },
            {
              key: "lowstock",
              label: <Badge count={inventoryAlerts.lowStock.length} offset={[15, 0]}>Düşük Stok</Badge>,
              children: (
                <>
                  {inventoryAlerts.lowStock.length > 0 ? (
                    <List
                      itemLayout="horizontal"
                      dataSource={inventoryAlerts.lowStock}
                      renderItem={item => (
                        <List.Item
                          actions={[
                            <Button type="primary" size="small" onClick={() => handleTransactionClick(item, 'add')}>
                              Stok Ekle
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
                                <Text type="warning">Mevcut Stok: {item.currentStock} {item.unitOfMeasure}</Text>
                                <Text>Minimum Stok: {item.minimumStock} {item.unitOfMeasure}</Text>
                                <Text type="secondary">{item.location}</Text>
                              </Space>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  ) : (
                    <Empty description="Düşük stok miktarına sahip ürün bulunmamaktadır" />
                  )}
                </>
              )
            },
            {
              key: "all",
              label: "Tüm Ürünler",
              children: (
                <List
                  itemLayout="horizontal"
                  dataSource={inventoryData}
                  renderItem={item => (
                    <List.Item>
                      <List.Item.Meta
                        title={
                          <Space>
                            {item.name} {calculateStockStatus(item.currentStock, item.minimumStock, item.reorderPoint).text}
                          </Space>
                        }
                        description={
                          <Space direction="vertical" size={0}>
                            <Text type="secondary">Konum: {item.location}</Text>
                            <Text>Mevcut Stok: {item.currentStock} {item.unitOfMeasure}</Text>
                            {item.expiryDate && (
                              <Text type={
                                dayjs(item.expiryDate).isBefore(dayjs()) ? 'danger' :
                                dayjs(item.expiryDate).isBefore(dayjs().add(30, 'day')) ? 'warning' : 'secondary'
                              }>
                                Son Kullanma: {dayjs(item.expiryDate).format('DD.MM.YYYY')}
                              </Text>
                            )}
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              )
            }
          ]}
        />
      </Drawer>

      {/* Envanter Ekleme/Düzenleme Drawer */}
      <Drawer
        title={`${editingInventory ? 'Envanter Düzenle' : 'Yeni Envanter Ekle'}`}
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
        <Tabs items={tabItems} />
      </Drawer>

      {/* İşlem Drawer */}
      <Drawer
        title={`${currentInventory?.name || ''} - ${
          transactionMode === 'add' 
            ? 'Stok İşlemi Ekle' 
            : transactionMode === 'history' 
              ? 'İşlem Geçmişi' 
              : 'Stok Düzeltme'
        }`}
        width={600}
        onClose={() => setTransactionDrawerVisible(false)}
        open={transactionDrawerVisible}
        styles={{ body: { paddingBottom: 80 } }}
        footer={
          transactionMode !== 'history' ? (
            <div style={{ textAlign: 'right' }}>
              <Button onClick={() => setTransactionDrawerVisible(false)} style={{ marginRight: 8 }}>
                İptal
              </Button>
              <Button 
                onClick={() => 
                  transactionMode === 'add' 
                    ? transactionForm.submit() 
                    : adjustmentForm.submit()
                } 
                type="primary"
              >
                Kaydet
              </Button>
            </div>
          ) : null
        }
      >
        {/* Drawer içeriği burada */}
      </Drawer>

      {/* Detay Modalı */}
      <Modal
        title="Envanter Detayları"
        width={800}
        footer={null}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
      >
        {/* Modal içeriği burada */}
      </Modal>

      {/* Toplu Envanter Yükleme Modalı */}
      <Modal
        title="Toplu Envanter Yükleme"
        open={bulkUploadModalVisible}
        onCancel={() => setBulkUploadModalVisible(false)}
        footer={null}
        width={700}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Alert
              message="Toplu Envanter Yükleme Talimatları"
              description={
                <>
                  <p>1. Excel şablonunu indirin ve doldurun.</p>
                  <p>2. Doldurduğunuz Excel dosyasını yükleyin.</p>
                  <p>3. Verileri kontrol edip onaylayın.</p>
                </>
              }
              type="info"
              showIcon
            />
            
            <Button 
              type="primary" 
              icon={<DownloadOutlined />} 
              onClick={handleDownloadTemplate}
              style={{ marginBottom: 16 }}
            >
              Excel Şablonunu İndir
            </Button>
            
            <Upload.Dragger
              name="file"
              action="/api/upload"
              onChange={(info) => {
                if (info.file.status === 'done') {
                  message.success(`${info.file.name} dosyası başarıyla yüklendi`);
                } else if (info.file.status === 'error') {
                  message.error(`${info.file.name} dosya yükleme hatası`);
                }
              }}
              showUploadList={{ showRemoveIcon: true }}
              accept=".xlsx,.xls"
              multiple={false}
              maxCount={1}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Excel dosyasını buraya sürükleyin veya tıklayın</p>
              <p className="ant-upload-hint">
                Toplu envanter eklemek için doldurduğunuz excel dosyasını yükleyin
              </p>
            </Upload.Dragger>
            
            <div style={{ marginTop: 24, textAlign: 'right' }}>
              <Button onClick={() => setBulkUploadModalVisible(false)} style={{ marginRight: 8 }}>
                İptal
              </Button>
              <Button type="primary" onClick={() => {
                message.success('Envanter başarıyla yüklendi');
                setBulkUploadModalVisible(false);
              }}>
                Yükle ve Onayla
              </Button>
            </div>
          </Space>
        </div>
      </Modal>
      
      {/* Depo Tanımlama Modalı */}
      <Modal
        title="Yeni Depo Tanımla"
        open={warehouseModalVisible}
        onCancel={() => setWarehouseModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={warehouseForm}
          layout="vertical"
          onFinish={handleSaveWarehouse}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Depo Adı"
                rules={[{ required: true, message: 'Lütfen depo adını girin' }]}
              >
                <Input placeholder="Depo adı" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="location"
                label="Lokasyon/Şehir"
                rules={[{ required: true, message: 'Lütfen lokasyon bilgisini girin' }]}
              >
                <Input placeholder="Şehir/İlçe" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="latitude"
                label="Enlem"
                rules={[{ required: true, message: 'Lütfen enlem bilgisini girin' }]}
              >
                <InputNumber style={{ width: '100%' }} placeholder="41.0082" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="longitude"
                label="Boylam"
                rules={[{ required: true, message: 'Lütfen boylam bilgisini girin' }]}
              >
                <InputNumber style={{ width: '100%' }} placeholder="28.9784" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="area"
                label="Depolama Alanı (m²)"
                rules={[{ required: true, message: 'Lütfen depolama alanını girin' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} placeholder="1000" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="hasCooling"
                label="Soğutma Kabiliyeti"
                valuePropName="checked"
              >
                <Switch checkedChildren="Var" unCheckedChildren="Yok" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="description"
            label="Depo Açıklaması"
          >
            <TextArea rows={4} placeholder="Depo özellikleri ve ek bilgiler" />
          </Form.Item>
          
          <Form.Item
            name="storageConditions"
            label="Depolama Koşulları"
          >
            <Select mode="multiple" placeholder="Depolama koşullarını seçin">
              {Object.values(StorageCondition).map((condition) => (
                <Option key={condition} value={condition}>{condition}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="contactInfo"
            label="İletişim Bilgileri"
          >
            <Input placeholder="Depo sorumlusu ve iletişim bilgileri" />
          </Form.Item>
          
          <div style={{ textAlign: 'right' }}>
            <Button onClick={() => setWarehouseModalVisible(false)} style={{ marginRight: 8 }}>
              İptal
            </Button>
            <Button type="primary" htmlType="submit">
              Depo Tanımla
            </Button>
          </div>
        </Form>
      </Modal>
      
      {/* Depo Transferi Modalı */}
      <Modal
        title="Depo Transferi"
        open={transferModalVisible}
        onCancel={() => setTransferModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form
          form={transferForm}
          layout="vertical"
          onFinish={handleSaveTransfer}
        >
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="sourceWarehouse"
                label="Gönderici Depo"
                rules={[{ required: true, message: 'Lütfen gönderici depo seçin' }]}
              >
                <Select
                  placeholder="Gönderici depo seçin"
                  onChange={(value) => setSourceWarehouse(value as string)}
                >
                  {warehouseList.map(warehouse => (
                    <Option key={warehouse.id} value={warehouse.name}>{warehouse.name}</Option>
                  ))}
                </Select>
              </Form.Item>
              
              <Card 
                size="small" 
                title="Gönderici Depo Bilgileri" 
                style={{ marginBottom: 16 }}
                type="inner"
              >
                {sourceWarehouse ? (
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Lokasyon">
                      {warehouseList.find(w => w.name === sourceWarehouse)?.location}
                    </Descriptions.Item>
                    <Descriptions.Item label="Depolama Alanı">
                      {warehouseList.find(w => w.name === sourceWarehouse)?.area} m²
                    </Descriptions.Item>
                    <Descriptions.Item label="Soğutma">
                      {warehouseList.find(w => w.name === sourceWarehouse)?.hasCooling ? 'Var' : 'Yok'}
                    </Descriptions.Item>
                  </Descriptions>
                ) : (
                  <Empty description="Depo seçilmedi" />
                )}
              </Card>
            </Col>
            
            <Col span={12}>
              <Form.Item
                name="targetWarehouse"
                label="Alıcı Depo"
                rules={[{ required: true, message: 'Lütfen alıcı depo seçin' }]}
              >
                <Select
                  placeholder="Alıcı depo seçin"
                  onChange={(value) => setTargetWarehouse(value as string)}
                >
                  {warehouseList.map(warehouse => (
                    <Option 
                      key={warehouse.id} 
                      value={warehouse.name}
                      disabled={warehouse.name === sourceWarehouse}
                    >
                      {warehouse.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              
              <Card 
                size="small" 
                title="Alıcı Depo Bilgileri" 
                style={{ marginBottom: 16 }}
                type="inner"
              >
                {targetWarehouse ? (
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Lokasyon">
                      {warehouseList.find(w => w.name === targetWarehouse)?.location}
                    </Descriptions.Item>
                    <Descriptions.Item label="Depolama Alanı">
                      {warehouseList.find(w => w.name === targetWarehouse)?.area} m²
                    </Descriptions.Item>
                    <Descriptions.Item label="Soğutma">
                      {warehouseList.find(w => w.name === targetWarehouse)?.hasCooling ? 'Var' : 'Yok'}
                    </Descriptions.Item>
                  </Descriptions>
                ) : (
                  <Empty description="Depo seçilmedi" />
                )}
              </Card>
            </Col>
          </Row>
          
          <Divider />
          
          <Form.Item
            name="categories"
            label="Ürün Kategorileri"
            rules={[{ required: true, message: 'Lütfen en az bir kategori seçin' }]}
          >
            <Select 
              mode="multiple" 
              placeholder="Transfer edilecek ürün kategorilerini seçin"
              onChange={(value) => setSelectedCategories(value as string[])}
            >
              {Object.values(InventoryCategory).map(category => (
                <Option key={category} value={category}>{category}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="products"
            label="Transfer Edilecek Ürünler"
            rules={[{ required: true, message: 'Lütfen en az bir ürün seçin' }]}
          >
            <Select 
              mode="multiple" 
              placeholder="Transfer edilecek ürünleri seçin"
              onChange={(value) => setSelectedProducts(value as string[])}
            >
              {inventoryData
                .filter(item => selectedCategories.length === 0 || selectedCategories.includes(item.category))
                .map(item => (
                  <Option key={item.id} value={item.name}>
                    {item.name} - Stok: {item.currentStock} {item.unitOfMeasure}
                  </Option>
                ))
              }
            </Select>
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="quantity"
                label="Transfer Miktarı"
                rules={[{ required: true, message: 'Lütfen transfer miktarını girin' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="dateRange"
                label="Transfer Tarih Aralığı"
                rules={[{ required: true, message: 'Lütfen tarih aralığını seçin' }]}
              >
                <RangePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="sender"
                label="Gönderen Sorumlu"
                rules={[{ required: true, message: 'Lütfen gönderen sorumluyu seçin' }]}
              >
                <Select placeholder="Gönderen sorumlu personeli seçin">
                  <Option value="user1">Ali Yılmaz - Depo Sorumlusu</Option>
                  <Option value="user2">Mehmet Demir - Lojistik Uzmanı</Option>
                  <Option value="user3">Ayşe Kaya - Envanter Yöneticisi</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="receiver"
                label="Alıcı Sorumlu"
                rules={[{ required: true, message: 'Lütfen alıcı sorumluyu seçin' }]}
              >
                <Select placeholder="Alıcı sorumlu personeli seçin">
                  <Option value="user4">Fatma Şahin - Depo Sorumlusu</Option>
                  <Option value="user5">Ahmet Öztürk - Lojistik Uzmanı</Option>
                  <Option value="user6">Zeynep Aydın - Envanter Yöneticisi</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="notes"
            label="Transfer Notları"
          >
            <TextArea rows={4} placeholder="Transfer ile ilgili önemli notlar" />
          </Form.Item>
          
          <Form.Item
            name="priority"
            label="Öncelik"
          >
            <Radio.Group defaultValue="normal">
              <Radio.Button value="low">Düşük</Radio.Button>
              <Radio.Button value="normal">Normal</Radio.Button>
              <Radio.Button value="high">Yüksek</Radio.Button>
              <Radio.Button value="urgent">Acil</Radio.Button>
            </Radio.Group>
          </Form.Item>
          
          <div style={{ textAlign: 'right' }}>
            <Button onClick={() => setTransferModalVisible(false)} style={{ marginRight: 8 }}>
              İptal
            </Button>
            <Button type="primary" htmlType="submit">
              Transfer Görevi Oluştur
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default InventoryPage; 