"use client";

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Tag, 
  Typography, 
  Space, 
  Form, 
  Input, 
  DatePicker, 
  Select, 
  Button, 
  Row, 
  Col, 
  Statistic, 
  Divider, 
  Badge, 
  Tabs,
  Tooltip,
  Alert,
  Progress,
  Radio,
  Dropdown,
  List,
  Avatar,
  Descriptions,
  notification as antNotification,
  Modal
} from 'antd';
import type { TableProps } from 'antd';
import {
  BarChartOutlined,
  FilterOutlined,
  SearchOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  BugOutlined,
  ThunderboltOutlined,
  UserOutlined,
  TeamOutlined,
  GlobalOutlined,
  ApiOutlined,
  MessageOutlined,
  ExclamationCircleOutlined,
  EnvironmentOutlined,
  CarryOutOutlined,
  LockOutlined,
  SafetyOutlined,
  DatabaseOutlined,
  ClockCircleOutlined,
  AlertOutlined,
  AppstoreOutlined,
  UserOutlined as UserOutlinedIcon,
  DownloadOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  PrinterOutlined,
  AreaChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  CalendarOutlined,
  HistoryOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { filterLogs, getLogStats, generateDemoLogs } from '../../lib/logger';
import { LogCategory, LogLevel } from '../../types/log';
import { useSession } from 'next-auth/react';
import { UserRole } from '../../types/user';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// Tab tipi
type TabKey = 'activity' | 'logs' | 'reports';

// Genişletilmiş LogEntry arayüzü
interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  message: string;
  userId?: string;
  userName?: string;
  category: LogCategory;
  module: string;
  userRole?: string;
  ipAddress?: string;
  details?: string | Record<string, any>;
}

const LoggingPage = () => {
  const [form] = Form.useForm();
  const { data: session } = useSession();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState<any>({
    totalLogs: 0,
    errorCount: 0,
    warningCount: 0,
    criticalCount: 0,
    infoCount: 0,
    debugCount: 0,
    categoryCounts: {},
    recentActivity: [],
    total: 0,
    today: 0,
    errors: 0,
    userActions: 0,
    systemEvents: 0,
    security: 0
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<TabKey>('activity');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(7, 'day'),
    dayjs()
  ]);
  const [reportType, setReportType] = useState<string>('daily');
  const [showExportOptions, setShowExportOptions] = useState<boolean>(false);
  
  // İlk yükleme ve demo verileri
  useEffect(() => {
    const initializeLogs = async () => {
      setLoading(true);
      
      // Demo logları oluştur (eğer sunucu yoksa)
      generateDemoLogs(100);
      
      // Log istatistiklerini al
      const logStats = getLogStats();
      setStats(logStats);
      
      // Varsayılan olarak tüm logları al
      const allLogs = filterLogs({});
      // Log verilerini bizim formatımıza dönüştür
      const convertedLogs = allLogs.map(log => ({
        ...log,
        timestamp: new Date(log.timestamp),
        userRole: log.userRole || '',
        ipAddress: log.ipAddress || '',
        module: log.module || 'system'
      }));
      setLogs(convertedLogs);
      
      setLoading(false);
    };
    
    initializeLogs();
  }, []);
  
  // Log seviyesine göre tag rengi
  const getLogLevelTag = (level: LogLevel) => {
    switch(level) {
      case LogLevel.INFO:
        return <Tag color="success" icon={<InfoCircleOutlined />}>BİLGİ</Tag>;
      case LogLevel.WARNING:
        return <Tag color="warning" icon={<WarningOutlined />}>UYARI</Tag>;
      case LogLevel.ERROR:
        return <Tag color="error" icon={<CloseCircleOutlined />}>HATA</Tag>;
      case LogLevel.DEBUG:
        return <Tag color="processing" icon={<BugOutlined />}>HATA AYIKLAMA</Tag>;
      case LogLevel.CRITICAL:
        return <Tag color="magenta" icon={<ThunderboltOutlined />}>KRİTİK</Tag>;
      default:
        return <Tag>BİLİNMİYOR</Tag>;
    }
  };
  
  // Kategori renk ve ikonları
  const getCategoryTag = (category: LogCategory) => {
    const categoryConfig = {
      [LogCategory.AUTHENTICATION]: { color: 'blue', icon: <LockOutlined /> },
      [LogCategory.USER_ACTIVITY]: { color: 'cyan', icon: <UserOutlinedIcon /> },
      [LogCategory.SYSTEM]: { color: 'geekblue', icon: <SafetyOutlined /> },
      [LogCategory.API]: { color: 'purple', icon: <ApiOutlined /> },
      [LogCategory.MAP]: { color: 'green', icon: <EnvironmentOutlined /> },
      [LogCategory.TASK]: { color: 'orange', icon: <CarryOutOutlined /> },
      [LogCategory.PERSONNEL]: { color: 'gold', icon: <TeamOutlined /> },
      [LogCategory.CHAT]: { color: 'lime', icon: <MessageOutlined /> },
      [LogCategory.SECURITY]: { color: 'red', icon: <ExclamationCircleOutlined /> },
    };
    
    const config = categoryConfig[category] || { color: 'default', icon: <GlobalOutlined /> };
    
    return (
      <Tag color={config.color} icon={config.icon}>
        {getCategoryName(category)}
      </Tag>
    );
  };
  
  // Kategorinin Türkçe adı
  const getCategoryName = (category: LogCategory): string => {
    const categoryNames = {
      [LogCategory.AUTHENTICATION]: 'Kimlik Doğrulama',
      [LogCategory.USER_ACTIVITY]: 'Kullanıcı Aktivitesi',
      [LogCategory.SYSTEM]: 'Sistem',
      [LogCategory.API]: 'API',
      [LogCategory.MAP]: 'Harita',
      [LogCategory.TASK]: 'Görev',
      [LogCategory.PERSONNEL]: 'Personel',
      [LogCategory.CHAT]: 'Mesajlaşma',
      [LogCategory.SECURITY]: 'Güvenlik',
    };
    
    return categoryNames[category] || 'Diğer';
  };
  
  // Tablo sütunları
  const columns: TableProps<LogEntry>['columns'] = [
    {
      title: 'Tarih ve Saat',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp: Date) => (
        <Tooltip title={timestamp.toLocaleString('tr-TR')}>
          {dayjs(timestamp).format('DD.MM.YYYY HH:mm:ss')}
        </Tooltip>
      ),
      sorter: (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Seviye',
      dataIndex: 'level',
      key: 'level',
      render: (level: LogLevel) => getLogLevelTag(level),
      filters: Object.values(LogLevel).map(level => ({ text: level.toUpperCase(), value: level })),
      onFilter: (value, record) => record.level === value,
    },
    {
      title: 'Kategori',
      dataIndex: 'category',
      key: 'category',
      render: (category: LogCategory) => getCategoryTag(category),
      filters: Object.values(LogCategory).map(category => ({ 
        text: getCategoryName(category), 
        value: category 
      })),
      onFilter: (value, record) => record.category === value,
    },
    {
      title: 'Mesaj',
      dataIndex: 'message',
      key: 'message',
      render: (text: string) => <Text ellipsis={{ tooltip: text }}>{text}</Text>,
    },
    {
      title: 'Kullanıcı',
      dataIndex: 'userName',
      key: 'userName',
      render: (userName: string, record: LogEntry) => (
        userName ? (
          <Space>
            <UserOutlined />
            <Text>{userName}</Text>
            {record.userRole && (
              <Tag color="blue">{record.userRole}</Tag>
            )}
          </Space>
        ) : <Text type="secondary">-</Text>
      ),
    },
    {
      title: 'IP Adresi',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      responsive: ['lg'],
    },
    {
      title: 'Detaylar',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="link" 
          onClick={() => console.log('Log detayları:', record)}
        >
          Detaylar
        </Button>
      ),
    },
  ];
  
  // Arama formunu gönderme
  const handleSearch = (values: any) => {
    setLoading(true);
    
    const filter: any = {};
    
    if (values.dateRange && values.dateRange.length === 2) {
      filter.startDate = values.dateRange[0].toDate();
      filter.endDate = values.dateRange[1].toDate();
    }
    
    if (values.levels && values.levels.length > 0) {
      filter.levels = values.levels;
    }
    
    if (values.categories && values.categories.length > 0) {
      filter.categories = values.categories;
    }
    
    if (values.searchTerm) {
      filter.searchTerm = values.searchTerm;
    }
    
    if (values.userId) {
      filter.userId = values.userId;
    }
    
    if (values.userRole) {
      filter.userRole = values.userRole;
    }
    
    const filteredLogs = filterLogs(filter);
    // Log verilerini bizim formatımıza dönüştür
    const convertedLogs = filteredLogs.map(log => ({
      ...log,
      timestamp: new Date(log.timestamp),
      userRole: log.userRole || '',
      ipAddress: log.ipAddress || '',
      module: log.module || 'system'
    }));
    setLogs(convertedLogs);
    setLoading(false);
  };
  
  // Formları sıfırla
  const handleReset = () => {
    form.resetFields();
    const allLogs = filterLogs({});
    // Log verilerini bizim formatımıza dönüştür
    const convertedLogs = allLogs.map(log => ({
      ...log,
      timestamp: new Date(log.timestamp),
      userRole: log.userRole || '',
      ipAddress: log.ipAddress || '',
      module: log.module || 'system'
    }));
    setLogs(convertedLogs);
  };
  
  // Tab değişimi
  const handleTabChange = (key: string) => {
    setActiveTab(key as TabKey);
  };
  
  // Rapor tipi değişimi
  const handleReportTypeChange = (type: string) => {
    setReportType(type);
    // Burada gerçek uygulamada rapor verilerini yeniden yüklemek gerekir
    console.log(`Rapor tipi değiştirildi: ${type}`);
  };
  
  // Rapor dışa aktarma işlemleri
  const handleExport = (format: string) => {
    antNotification.success({
      message: 'Dışa Aktarma Başarılı',
      description: `Log kayıtları ${format.toUpperCase()} formatında indirildi.`,
      duration: 3
    });
  };
  
  // PDF olarak yazdırma
  const handlePrint = () => {
    console.log('Rapor yazdırılıyor...');
    // Burada gerçek uygulamada yazdırma işlemi yapılır
    window.print();
  };
  
  // Tarih aralığı değişimi
  const handleDateRangeChange = (dates: any) => {
    if (dates && dates.length === 2) {
      setDateRange(dates);
      // Burada gerçek uygulamada verileri yeniden yüklemek gerekir
      console.log(`Tarih aralığı değiştirildi: ${dates[0].format('YYYY-MM-DD')} - ${dates[1].format('YYYY-MM-DD')}`);
    }
  };
  
  // İstatistik kartları
  const StatisticCards = () => (
    <Row gutter={[16, 16]}>
      <Col xs={24} md={8}>
        <Card>
          <Statistic
            title="Toplam Log Kaydı"
            value={stats.total}
            prefix={<DatabaseOutlined />}
            valueStyle={{ color: '#3f8600' }}
          />
        </Card>
      </Col>
      <Col xs={24} md={8}>
        <Card>
          <Statistic
            title="Bugünkü Kayıtlar"
            value={stats.today}
            prefix={<ClockCircleOutlined />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
      </Col>
      <Col xs={24} md={8}>
        <Card>
          <Statistic
            title="Hata Kayıtları"
            value={stats.errors}
            prefix={<AlertOutlined />}
            valueStyle={{ color: stats.errors > 0 ? '#cf1322' : '#3f8600' }}
          />
        </Card>
      </Col>
      <Col xs={24} md={8}>
        <Card>
          <Statistic
            title="Kullanıcı İşlemleri"
            value={stats.userActions}
            prefix={<UserOutlined />}
            valueStyle={{ color: '#722ed1' }}
          />
        </Card>
      </Col>
      <Col xs={24} md={8}>
        <Card>
          <Statistic
            title="Sistem Olayları"
            value={stats.systemEvents}
            prefix={<AppstoreOutlined />}
            valueStyle={{ color: '#13c2c2' }}
          />
        </Card>
      </Col>
      <Col xs={24} md={8}>
        <Card>
          <Statistic
            title="Güvenlik Kayıtları"
            value={stats.security}
            prefix={<SafetyOutlined />}
            valueStyle={{ color: '#eb2f96' }}
          />
        </Card>
      </Col>
    </Row>
  );
  
  // Aktivite grafiği
  const ActivityChart = () => {
    return (
      <Card title="Son 7 Günlük Aktivite" 
        extra={
          <Space>
            <Radio.Group 
              value={reportType} 
              onChange={(e) => handleReportTypeChange(e.target.value)}
              buttonStyle="solid"
              size="small"
            >
              <Radio.Button value="daily">Günlük</Radio.Button>
              <Radio.Button value="weekly">Haftalık</Radio.Button>
              <Radio.Button value="monthly">Aylık</Radio.Button>
            </Radio.Group>
            <Dropdown 
              open={showExportOptions}
              onOpenChange={setShowExportOptions}
              menu={{
                items: [
                  {
                    key: '1',
                    icon: <FileExcelOutlined />,
                    label: 'Excel olarak dışa aktar',
                    onClick: () => handleExport('excel')
                  },
                  {
                    key: '2',
                    icon: <FilePdfOutlined />,
                    label: 'PDF olarak dışa aktar',
                    onClick: () => handleExport('pdf')
                  },
                  {
                    key: '3',
                    icon: <PrinterOutlined />,
                    label: 'Yazdır',
                    onClick: handlePrint
                  }
                ]
              }}
              trigger={['click']}
            >
              <Button size="small" icon={<DownloadOutlined />}>Dışa Aktar</Button>
            </Dropdown>
          </Space>
        }
      >
        <div style={{ height: 300, textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Row gutter={[16, 24]}>
            <Col span={24}>
              <Space align="center">
                <CalendarOutlined />
                <Text type="secondary">
                  {dateRange[0].format('DD.MM.YYYY')} - {dateRange[1].format('DD.MM.YYYY')} tarihleri arası log aktivitesi
                </Text>
                <Button 
                  type="text" 
                  icon={<ReloadOutlined />} 
                  onClick={() => setDateRange([dayjs().subtract(7, 'day'), dayjs()])}
                >
                  Sıfırla
                </Button>
              </Space>
              <RangePicker 
                value={dateRange}
                onChange={handleDateRangeChange}
                style={{ marginTop: 16, marginBottom: 16 }}
                allowClear={false}
              />
            </Col>
            <Col span={8}>
              <Statistic title="Kullanıcı İşlemleri" value={155} />
              <Progress percent={65} status="active" strokeColor="#1890ff" />
            </Col>
            <Col span={8}>
              <Statistic title="Sistem Olayları" value={203} />
              <Progress percent={85} status="active" strokeColor="#52c41a" />
            </Col>
            <Col span={8}>
              <Statistic title="Güvenlik" value={87} />
              <Progress percent={36} status="active" strokeColor="#fa8c16" />
            </Col>
          </Row>
        </div>
      </Card>
    );
  };
  
  // Kategori dağılım grafiği
  const CategoryDistribution = () => {
    const categories = [
      { type: 'Kullanıcı İşlemleri', value: 40, color: '#1890ff' },
      { type: 'Sistem Olayları', value: 30, color: '#52c41a' },
      { type: 'Güvenlik', value: 15, color: '#fa8c16' },
      { type: 'API Çağrıları', value: 10, color: '#722ed1' },
      { type: 'Diğer', value: 5, color: '#faad14' },
    ];
    
    return (
      <Card title="Kategori Dağılımı" extra={<PieChartOutlined />}>
        <div style={{ padding: '20px 0' }}>
          {categories.map((category, index) => (
            <div key={index} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>{category.type}</Text>
                <Text>{category.value}%</Text>
              </div>
              <Progress percent={category.value} showInfo={false} strokeColor={category.color} />
            </div>
          ))}
        </div>
      </Card>
    );
  };
  
  // Seviye dağılım grafiği
  const LogLevelDistribution = () => {
    return (
      <Card title="Log Seviyesi Dağılımı" extra={<AreaChartOutlined />}>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Statistic 
              title="Kritik Hatalar" 
              value={15} 
              valueStyle={{ color: '#f5222d' }}
              prefix={<ThunderboltOutlined />}
            />
            <Progress percent={15} status="exception" showInfo={false} />
          </Col>
          <Col span={12}>
            <Statistic 
              title="Hatalar" 
              value={45} 
              valueStyle={{ color: '#fa541c' }}
              prefix={<CloseCircleOutlined />}
            />
            <Progress percent={45} status="exception" showInfo={false} strokeColor="#fa541c" />
          </Col>
          <Col span={12}>
            <Statistic 
              title="Uyarılar" 
              value={65} 
              valueStyle={{ color: '#faad14' }}
              prefix={<WarningOutlined />}
            />
            <Progress percent={65} status="active" showInfo={false} strokeColor="#faad14" />
          </Col>
          <Col span={12}>
            <Statistic 
              title="Bilgi" 
              value={120} 
              valueStyle={{ color: '#1890ff' }}
              prefix={<InfoCircleOutlined />}
            />
            <Progress percent={85} status="active" showInfo={false} strokeColor="#1890ff" />
          </Col>
        </Row>
      </Card>
    );
  };
  
  // Zaman içindeki log sayısı grafiği
  const LogsOverTimeChart = () => {
    return (
      <Card title="Zaman İçindeki Log Sayısı" extra={<LineChartOutlined />}>
        <div style={{ padding: '20px 0', height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Space direction="vertical" align="center">
            <HistoryOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
            <Text type="secondary">Zaman içindeki log değişimleri burada gösterilecek</Text>
          </Space>
        </div>
      </Card>
    );
  };
  
  // Tabs için öğeleri yapılandır
  const tabsItems = [
    {
      key: 'activity',
      label: <span><BarChartOutlined />İstatistikler</span>,
      children: (
        <>
          <StatisticCards />
          
          <Divider />
          
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={16}>
              <ActivityChart />
            </Col>
            <Col xs={24} lg={8}>
              <CategoryDistribution />
            </Col>
          </Row>
          
          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col xs={24} md={12}>
              <LogLevelDistribution />
            </Col>
            <Col xs={24} md={12}>
              <LogsOverTimeChart />
            </Col>
          </Row>
        </>
      )
    },
    {
      key: 'logs',
      label: <span><FilterOutlined />Log Kayıtları</span>,
      children: (
        <>
          <Card title="Filtreleme" style={{ marginBottom: 16 }}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSearch}
            >
              <Row gutter={[16, 0]}>
                <Col xs={24} md={6}>
                  <Form.Item name="searchTerm" label="Arama">
                    <Input
                      placeholder="Arama terimi girin"
                      prefix={<SearchOutlined />}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={6}>
                  <Form.Item name="dateRange" label="Tarih Aralığı">
                    <RangePicker 
                      format="DD.MM.YYYY"
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={6}>
                  <Form.Item name="levels" label="Log Seviyeleri">
                    <Select
                      mode="multiple"
                      placeholder="Seviye seçin"
                      style={{ width: '100%' }}
                      options={Object.values(LogLevel).map(level => ({
                        label: level.toUpperCase(),
                        value: level,
                      }))}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={6}>
                  <Form.Item name="categories" label="Kategoriler">
                    <Select
                      mode="multiple"
                      placeholder="Kategori seçin"
                      style={{ width: '100%' }}
                      options={Object.values(LogCategory).map(category => ({
                        label: getCategoryName(category),
                        value: category,
                      }))}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={6}>
                  <Form.Item name="userId" label="Kullanıcı">
                    <Input
                      placeholder="Kullanıcı adı"
                      prefix={<UserOutlined />}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={6}>
                  <Form.Item name="ipAddress" label="IP Adresi">
                    <Input
                      placeholder="IP adresi"
                      prefix={<GlobalOutlined />}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={6}>
                  <Form.Item name="userRole" label="Kullanıcı Rolü">
                    <Select
                      placeholder="Rol seçin"
                      style={{ width: '100%' }}
                      options={Object.values(UserRole).map(role => ({
                        label: role,
                        value: role,
                      }))}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={6}>
                  <Form.Item label="Dışa Aktar">
                    <Space>
                      <Button 
                        icon={<FileExcelOutlined />} 
                        onClick={() => handleExport('excel')}
                      >
                        Excel
                      </Button>
                      <Button 
                        icon={<FilePdfOutlined />} 
                        onClick={() => handleExport('pdf')}
                      >
                        PDF
                      </Button>
                    </Space>
                  </Form.Item>
                </Col>
              </Row>
              
              <Row justify="end">
                <Space>
                  <Button onClick={handleReset}>
                    Sıfırla
                  </Button>
                  <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                    Ara
                  </Button>
                </Space>
              </Row>
            </Form>
          </Card>
          
          <Card>
            <Table
              columns={columns}
              dataSource={logs}
              rowKey="id"
              loading={loading}
              pagination={{ 
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} kayıt` 
              }}
              scroll={{ x: 'max-content' }}
              expandable={{
                expandedRowRender: (record) => (
                  <div style={{ margin: 0 }}>
                    <Row gutter={[16, 16]}>
                      <Col span={24}>
                        <Card size="small" title="Log Detayları">
                          <Descriptions bordered size="small" column={{ xxl: 4, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}>
                            <Descriptions.Item label="ID">{record.id}</Descriptions.Item>
                            <Descriptions.Item label="Tarih">{record.timestamp.toLocaleString()}</Descriptions.Item>
                            <Descriptions.Item label="Seviye">{record.level}</Descriptions.Item>
                            <Descriptions.Item label="Kategori">{getCategoryName(record.category)}</Descriptions.Item>
                            {record.userName && <Descriptions.Item label="Kullanıcı">{record.userName}</Descriptions.Item>}
                            {record.ipAddress && <Descriptions.Item label="IP Adresi">{record.ipAddress}</Descriptions.Item>}
                          </Descriptions>
                          
                          {record.details && (
                            <div style={{ marginTop: 16 }}>
                              <Title level={5}>Ek Detaylar</Title>
                              <pre style={{ 
                                backgroundColor: '#f5f5f5', 
                                padding: 16, 
                                borderRadius: 4, 
                                overflowX: 'auto' 
                              }}>
                                {typeof record.details === 'object' 
                                  ? JSON.stringify(record.details, null, 2) 
                                  : record.details}
                              </pre>
                            </div>
                          )}
                        </Card>
                      </Col>
                    </Row>
                  </div>
                ),
              }}
            />
          </Card>
        </>
      )
    },
    {
      key: 'reports',
      label: <span><FileTextOutlined />Raporlar</span>,
      children: (
        <>
          <Card title="Özel Rapor Oluştur" style={{ marginBottom: 16 }}>
            <Form layout="vertical">
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item label="Rapor Tipi" name="reportType">
                    <Select
                      placeholder="Rapor tipi seçin"
                      style={{ width: '100%' }}
                      options={[
                        { label: 'Günlük Log Özeti', value: 'daily' },
                        { label: 'Haftalık Log Özeti', value: 'weekly' },
                        { label: 'Aylık Log Özeti', value: 'monthly' },
                        { label: 'Log Seviye Dağılımı', value: 'levels' },
                        { label: 'Kategori Dağılımı', value: 'categories' },
                        { label: 'Kullanıcı Aktiviteleri', value: 'users' },
                        { label: 'Güvenlik Raporu', value: 'security' },
                      ]}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Tarih Aralığı" name="dateRange">
                    <RangePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Kategoriler" name="categories">
                    <Select
                      mode="multiple"
                      placeholder="Kategorileri seçin"
                      style={{ width: '100%' }}
                      options={Object.values(LogCategory).map(category => ({
                        label: getCategoryName(category),
                        value: category,
                      }))}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Seviyeler" name="levels">
                    <Select
                      mode="multiple"
                      placeholder="Seviyeleri seçin"
                      style={{ width: '100%' }}
                      options={Object.values(LogLevel).map(level => ({
                        label: level.toUpperCase(),
                        value: level,
                      }))}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item label="Rapor Başlığı" name="title">
                    <Input placeholder="Rapor başlığı girin" />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item>
                    <Space>
                      <Button type="primary" icon={<BarChartOutlined />}>
                        Raporu Oluştur
                      </Button>
                      <Button icon={<FileExcelOutlined />}>
                        Excel Olarak İndir
                      </Button>
                      <Button icon={<FilePdfOutlined />}>
                        PDF Olarak İndir
                      </Button>
                      <Button icon={<PrinterOutlined />}>
                        Yazdır
                      </Button>
                    </Space>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>
          
          <Card title="Kaydedilmiş Raporlar">
            <List
              itemLayout="horizontal"
              dataSource={[
                {
                  id: '1',
                  title: 'Aylık Güvenlik Raporu - Mayıs 2023',
                  type: 'security',
                  createdAt: '2023-05-31',
                  createdBy: 'Admin',
                },
                {
                  id: '2',
                  title: 'Haftalık Log Özeti - 22-28 Mayıs 2023',
                  type: 'weekly',
                  createdAt: '2023-05-28',
                  createdBy: 'Sistem',
                },
                {
                  id: '3',
                  title: 'Kullanıcı Aktiviteleri - Nisan 2023',
                  type: 'users',
                  createdAt: '2023-04-30',
                  createdBy: 'Admin',
                },
              ]}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button key="view" type="link">
                      Görüntüle
                    </Button>,
                    <Button key="download" type="link" icon={<DownloadOutlined />}>
                      İndir
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={<FileTextOutlined />} style={{ backgroundColor: '#1890ff' }} />}
                    title={item.title}
                    description={`Oluşturulma Tarihi: ${item.createdAt} | Oluşturan: ${item.createdBy}`}
                  />
                </List.Item>
              )}
            />
          </Card>
        </>
      )
    }
  ];
  
  // Kullanıcı yetki kontrolü
  if (session?.user.role !== UserRole.ADMIN && session?.user.role !== UserRole.MANAGER) {
    return (
      <Alert
        message="Erişim Reddedildi"
        description="Bu sayfayı görüntülemek için yetkiniz bulunmamaktadır. Lütfen sistem yöneticinize başvurun."
        type="error"
        showIcon
      />
    );
  }
  
  // Silme onayını göster
  const showDeleteConfirm = (id: string) => {
    Modal.confirm({
      title: 'Bu log kaydını silmek istediğinize emin misiniz?',
      content: 'Bu işlem geri alınamaz.',
      okText: 'Evet',
      okType: 'danger',
      cancelText: 'Hayır',
      onOk() {
        console.log('Log silindi', id);
        // Burada gerçek uygulamada silme işlemi yapılır
        antNotification.success({
          message: 'Başarılı',
          description: 'Log kaydı başarıyla silindi.',
          duration: 3
        });
      }
    });
  };
  
  return (
    <div>
      <Title level={2}>Sistem Logları</Title>
      <Divider />
      
      <Tabs activeKey={activeTab} onChange={handleTabChange} items={tabsItems} />
    </div>
  );
};

export default LoggingPage; 