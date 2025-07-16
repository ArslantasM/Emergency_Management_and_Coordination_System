"use client";

import React, { useState, useRef, useEffect } from 'react';
import { 
  Typography, 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Table, 
  Button, 
  DatePicker, 
  Space, 
  Tag, 
  Tabs, 
  Select,
  Divider,
  message,
  Modal,
  Spin,
  Alert
} from 'antd';
import {
  BarChartOutlined,
  PieChartOutlined,
  LineChartOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  CalendarOutlined,
  UserOutlined,
  EnvironmentOutlined,
  ExportOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  PrinterOutlined,
  DownloadOutlined,
  TeamOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';

// Excel için ekleme
import * as XLSX from 'xlsx';

let jsPDF: any = null;
let autoTable: any = null;
let autoTableLoaded = false;

// Client tarafında PDF kütüphanelerini yükle
const loadPdfLibraries = async () => {
  try {
    if (typeof window !== 'undefined') {
      const jspdfModule = await import('jspdf');
      jsPDF = jspdfModule.default || jspdfModule.jsPDF;
      
      // AutoTable'ı doğrudan import et
      const autoTableModule = await import('jspdf-autotable');
      autoTable = autoTableModule.default;
      autoTableLoaded = true;
      
      return true;
    }
  } catch (error) {
    console.error('PDF kütüphaneleri yüklenirken hata:', error);
    return false;
  }
  return false;
};

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

// Arayüz tanımlamaları
interface ChartData {
  date: string;
  newTasks: number;
  completedTasks: number;
  emergencyReports: number;
}

interface TaskData {
  key: string;
  id: string;
  title: string;
  type: string;
  status: string;
  priority: string;
  assignee: string;
  region: string;
  createdAt: string;
  completedAt: string | null;
  duration: number;
}

interface PersonnelData {
  key: string;
  id: string;
  name: string;
  department: string;
  position: string;
  status: string;
  tasks: number;
  completedTasks: number;
  successRate: number;
  avgResponseTime: number;
  hoursWorked: number;
  trainingsCompleted: number;
}

interface RegionData {
  key: string;
  id: string;
  name: string;
  tasks: number;
  completedTasks: number;
  activePersonnel: number;
  incidents: number;
  resolvedIncidents: number;
  avgResponseTime: number;
  riskLevel: string;
  populationCovered: number;
  resourceAllocation: string;
}

// Demo veri oluşturucu fonksiyonlar
const generateTasksData = (): TaskData[] => {
  const statuses = ['tamamlandı', 'devam ediyor', 'beklemede', 'iptal edildi'];
  const priorities = ['yüksek', 'orta', 'düşük'];
  const types = ['acil durum', 'rutin', 'planlı', 'önleyici'];
  const regions = ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya'];
  const assignees = ['Ali Yılmaz', 'Mehmet Kaya', 'Ayşe Demir', 'Fatma Şahin', 'Ahmet Yıldız'];

  return Array.from({ length: 20 }, (_, i) => ({
    key: i.toString(),
    id: `T-${1000 + i}`,
    title: `Görev ${i + 1}`,
    type: types[Math.floor(Math.random() * types.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    priority: priorities[Math.floor(Math.random() * priorities.length)],
    assignee: assignees[Math.floor(Math.random() * assignees.length)],
    region: regions[Math.floor(Math.random() * regions.length)],
    createdAt: dayjs().subtract(Math.floor(Math.random() * 30), 'day').format('YYYY-MM-DD'),
    completedAt: Math.random() > 0.3 ? dayjs().subtract(Math.floor(Math.random() * 15), 'day').format('YYYY-MM-DD') : null,
    duration: Math.floor(Math.random() * 24) + 1,
  }));
};

const generatePersonnelTableData = (): PersonnelData[] => {
  const departments = ['Acil Müdahale', 'Lojistik', 'İletişim', 'Planlama', 'Teknik Destek'];
  const positions = ['Yönetici', 'Uzman', 'Teknisyen', 'Saha Personeli', 'Koordinatör'];
  const statuses = ['aktif', 'izinli', 'görevde', 'eğitimde'];
  const names = ['Ali Yılmaz', 'Mehmet Kaya', 'Ayşe Demir', 'Fatma Şahin', 'Ahmet Yıldız', 'Zeynep Çelik', 'Mustafa Aydın', 'Esra Koç'];

  return Array.from({ length: 15 }, (_, i) => ({
    key: i.toString(),
    id: `P-${2000 + i}`,
    name: names[Math.floor(Math.random() * names.length)],
    department: departments[Math.floor(Math.random() * departments.length)],
    position: positions[Math.floor(Math.random() * positions.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    tasks: Math.floor(Math.random() * 50),
    completedTasks: Math.floor(Math.random() * 40),
    successRate: Math.floor(Math.random() * 40) + 60,
    avgResponseTime: Math.floor(Math.random() * 120) + 30,
    hoursWorked: Math.floor(Math.random() * 200) + 50,
    trainingsCompleted: Math.floor(Math.random() * 10),
  }));
};

const generateRegionTableData = (): RegionData[] => {
  const regions = ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Trabzon', 'Konya'];
  const riskLevels = ['yüksek', 'orta', 'düşük'];

  return Array.from({ length: 10 }, (_, i) => ({
    key: i.toString(),
    id: `R-${3000 + i}`,
    name: regions[i % regions.length],
    tasks: Math.floor(Math.random() * 200) + 50,
    completedTasks: Math.floor(Math.random() * 150) + 30,
    activePersonnel: Math.floor(Math.random() * 50) + 10,
    incidents: Math.floor(Math.random() * 30) + 5,
    resolvedIncidents: Math.floor(Math.random() * 25) + 3,
    avgResponseTime: Math.floor(Math.random() * 60) + 15,
    riskLevel: riskLevels[Math.floor(Math.random() * riskLevels.length)],
    populationCovered: (Math.floor(Math.random() * 10) + 1) * 100000,
    resourceAllocation: `₺${(Math.floor(Math.random() * 100) + 50) * 1000}`,
  }));
};

// Tablo sütunları
const taskColumns: ColumnsType<any> = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 100,
  },
  {
    title: 'Başlık',
    dataIndex: 'title',
    key: 'title',
    width: 200,
  },
  {
    title: 'Tür',
    dataIndex: 'type',
    key: 'type',
    width: 150,
    render: (type) => {
      const color = type === 'acil durum' ? 'red' : 
                    type === 'rutin' ? 'blue' : 
                    type === 'planlı' ? 'green' : 'orange';
      return <Tag color={color}>{type}</Tag>;
    },
  },
  {
    title: 'Durum',
    dataIndex: 'status',
    key: 'status',
    width: 150,
    render: (status) => {
      const color = status === 'tamamlandı' ? 'green' : 
                    status === 'devam ediyor' ? 'blue' : 
                    status === 'beklemede' ? 'orange' : 'red';
      const icon = status === 'tamamlandı' ? <CheckCircleOutlined /> : 
                  status === 'iptal edildi' ? <CloseCircleOutlined /> : 
                  <ClockCircleOutlined />;
      return <Tag icon={icon} color={color}>{status}</Tag>;
    },
  },
  {
    title: 'Öncelik',
    dataIndex: 'priority',
    key: 'priority',
    width: 120,
    render: (priority) => {
      const color = priority === 'yüksek' ? 'red' : 
                    priority === 'orta' ? 'orange' : 'green';
      return <Tag color={color}>{priority}</Tag>;
    },
  },
  {
    title: 'Görevli',
    dataIndex: 'assignee',
    key: 'assignee',
    width: 150,
  },
  {
    title: 'Bölge',
    dataIndex: 'region',
    key: 'region',
    width: 120,
  },
  {
    title: 'Oluşturulma',
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 120,
  },
  {
    title: 'Tamamlanma',
    dataIndex: 'completedAt',
    key: 'completedAt',
    width: 120,
    render: (date) => date || '-',
  },
  {
    title: 'Süre (saat)',
    dataIndex: 'duration',
    key: 'duration',
    width: 120,
  },
];

const personnelColumns: ColumnsType<any> = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 100,
  },
  {
    title: 'Ad Soyad',
    dataIndex: 'name',
    key: 'name',
    width: 180,
  },
  {
    title: 'Departman',
    dataIndex: 'department',
    key: 'department',
    width: 180,
  },
  {
    title: 'Pozisyon',
    dataIndex: 'position',
    key: 'position',
    width: 150,
  },
  {
    title: 'Durum',
    dataIndex: 'status',
    key: 'status',
    width: 120,
    render: (status) => {
      const color = status === 'aktif' ? 'green' : 
                    status === 'izinli' ? 'orange' : 
                    status === 'görevde' ? 'blue' : 'purple';
      return <Tag color={color}>{status}</Tag>;
    },
  },
  {
    title: 'Görevler',
    dataIndex: 'tasks',
    key: 'tasks',
    width: 100,
  },
  {
    title: 'Tamamlanan',
    dataIndex: 'completedTasks',
    key: 'completedTasks',
    width: 120,
  },
  {
    title: 'Başarı Oranı',
    dataIndex: 'successRate',
    key: 'successRate',
    width: 120,
    render: (rate) => `%${rate}`,
  },
  {
    title: 'Ort. Yanıt Süresi (dk)',
    dataIndex: 'avgResponseTime',
    key: 'avgResponseTime',
    width: 180,
  },
  {
    title: 'Çalışma Saati',
    dataIndex: 'hoursWorked',
    key: 'hoursWorked',
    width: 140,
  },
  {
    title: 'Eğitimler',
    dataIndex: 'trainingsCompleted',
    key: 'trainingsCompleted',
    width: 120,
  },
];

const regionColumns: ColumnsType<any> = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 100,
  },
  {
    title: 'Bölge',
    dataIndex: 'name',
    key: 'name',
    width: 150,
  },
  {
    title: 'Görevler',
    dataIndex: 'tasks',
    key: 'tasks',
    width: 120,
  },
  {
    title: 'Tamamlanan',
    dataIndex: 'completedTasks',
    key: 'completedTasks',
    width: 120,
  },
  {
    title: 'Aktif Personel',
    dataIndex: 'activePersonnel',
    key: 'activePersonnel',
    width: 140,
  },
  {
    title: 'Olaylar',
    dataIndex: 'incidents',
    key: 'incidents',
    width: 100,
  },
  {
    title: 'Çözülen Olaylar',
    dataIndex: 'resolvedIncidents',
    key: 'resolvedIncidents',
    width: 150,
  },
  {
    title: 'Ort. Yanıt Süresi (dk)',
    dataIndex: 'avgResponseTime',
    key: 'avgResponseTime',
    width: 180,
  },
  {
    title: 'Risk Seviyesi',
    dataIndex: 'riskLevel',
    key: 'riskLevel',
    width: 130,
    render: (level) => {
      const color = level === 'yüksek' ? 'red' : 
                    level === 'orta' ? 'orange' : 'green';
      return <Tag color={color}>{level}</Tag>;
    },
  },
  {
    title: 'Kapsanan Nüfus',
    dataIndex: 'populationCovered',
    key: 'populationCovered',
    width: 150,
    render: (pop) => pop.toLocaleString('tr-TR'),
  },
  {
    title: 'Kaynak Tahsisi',
    dataIndex: 'resourceAllocation',
    key: 'resourceAllocation',
    width: 150,
  },
];

// Veri yüklemesi
const tasks = generateTasksData();

// İhraç fonksiyonları
const exportToExcel = (data: any[], fileName: string) => {
  // Veriyi Excel formatına uygun hale getirme
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Veri");
  
  // Excel dosyasını indirme
  XLSX.writeFile(workbook, `${fileName}_${dayjs().format('YYYY-MM-DD')}.xlsx`);
  message.success('Rapor Excel formatında indirildi');
};

const exportToPdf = async (tableData: any[], columns: any[], fileName: string) => {
  try {
    // PDF kütüphanelerini yükle (ilk kullanımda)
    if (!jsPDF) {
      const loaded = await loadPdfLibraries();
      if (!loaded) {
        message.error('PDF kütüphaneleri yüklenemedi');
        return;
      }
    }
    
    // Yeni PDF dökümanı oluşturma
    const doc = new jsPDF('landscape', 'mm', 'a4');
    
    // Başlık ekleme
    doc.setFontSize(16);
    doc.text(`${fileName} - ${dayjs().format('DD/MM/YYYY')}`, 14, 20);
    doc.setFontSize(12);
    doc.text(`Rapor oluşturulma tarihi: ${dayjs().format('DD/MM/YYYY HH:mm')}`, 14, 30);
    
    // Tablo verilerini hazırlama
    const tableRows = tableData.map(item => {
      const row: any[] = [];
      columns.forEach(col => {
        if (col.key !== 'actions') { // Aksiyon sütunlarını hariç tut
          row.push(item[col.dataIndex]);
        }
      });
      return row;
    });
    
    // Tablo başlıklarını hazırlama
    const tableHeaders = columns
      .filter(col => col.key !== 'actions') // Aksiyon sütunlarını hariç tut
      .map(col => col.title);
    
    // PDF'e tablo ekle
    if (typeof autoTable === 'function') {
      autoTable(doc, {
        head: [tableHeaders],
        body: tableRows,
        startY: 40,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255 }
      });
    } else if (doc.autoTable) {
      doc.autoTable({
        head: [tableHeaders],
        body: tableRows,
        startY: 40,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255 }
      });
    } else {
      throw new Error('jsPDF-AutoTable kütüphanesi düzgün yüklenemedi');
    }
    
    // PDF'i kaydet
    doc.save(`${fileName}_${dayjs().format('YYYY-MM-DD')}.pdf`);
    message.success('Rapor PDF formatında indirildi');
  } catch (error) {
    console.error('PDF oluşturulurken hata:', error);
    message.error('PDF oluşturulurken bir hata oluştu');
  }
};

// Yazdırma fonksiyonu için referans
const printableRef = React.createRef<HTMLDivElement>();

// Demo grafikler için bileşenler
const BarChart: React.FC = () => {
  return (
    <Card title="Bölgelere Göre Görev Dağılımı" style={{ marginBottom: 16 }}>
      <div style={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Text type="secondary">Bar Grafik Gösterimi</Text>
      </div>
    </Card>
  );
};

const PieChart: React.FC = () => {
  return (
    <Card title="Görev Durumu Dağılımı" style={{ marginBottom: 16 }}>
      <div style={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Text type="secondary">Pasta Grafik Gösterimi</Text>
      </div>
    </Card>
  );
};

const LineChart: React.FC = () => {
  return (
    <Card title="Aylık Görev Tamamlama Oranları" style={{ marginBottom: 16 }}>
      <div style={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Text type="secondary">Çizgi Grafik Gösterimi</Text>
      </div>
    </Card>
  );
};

const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [pdfLibrariesLoaded, setPdfLibrariesLoaded] = useState(false);
  const [printModalVisible, setPrintModalVisible] = useState(false);
  const [printData, setPrintData] = useState<any[]>([]);
  const [printColumns, setPrintColumns] = useState<any[]>([]);

  useEffect(() => {
    loadPdfLibraries().then(loaded => {
      setPdfLibrariesLoaded(loaded);
    });
  }, []);

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  const handleDateChange = (dates: any) => {
    setDateRange(dates);
  };

  const handleDepartmentChange = (value: string) => {
    setSelectedDepartment(value);
  };

  const handlePrint = () => {
    showPrintModal();
  };

  const getTableData = () => {
    switch (activeTab) {
      case 'tasks':
        return generateTasksData();
      case 'personnel':
        return generatePersonnelTableData();
      case 'regions':
        return generateRegionTableData();
      default:
        return [];
    }
  };

  const getTableColumns = () => {
    switch (activeTab) {
      case 'tasks':
        return taskColumns;
      case 'personnel':
        return personnelColumns;
      case 'regions':
        return regionColumns;
      default:
        return [];
    }
  };

  const handleCreatePdf = () => {
    if (!pdfLibrariesLoaded) {
      message.error('PDF kütüphaneleri yüklenemedi');
      return;
    }

    const data = getTableData();
    const columns = getTableColumns();
    const fileName = `${activeTab}-rapor-${dayjs().format('YYYY-MM-DD')}.pdf`;
    exportToPdf(data, columns, fileName);
  };

  const handleCreateExcel = () => {
    const data = getTableData();
    const fileName = `${activeTab}-rapor-${dayjs().format('YYYY-MM-DD')}.xlsx`;
    exportToExcel(data, fileName);
  };

  const showPrintModal = () => {
    setPrintData(getTableData());
    setPrintColumns(getTableColumns());
    setPrintModalVisible(true);
  };

  const tabItems = [
    {
      key: 'overview',
      label: (
        <span>
          <BarChartOutlined />
          Genel Bakış
        </span>
      ),
      children: (
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Title level={4}>Rapor Filtreleri</Title>
                <Space>
                  <RangePicker
                    onChange={handleDateChange}
                    value={dateRange}
                    style={{ width: 300 }}
                  />
                  <Select
                    value={selectedDepartment}
                    onChange={handleDepartmentChange}
                    style={{ width: 200 }}
                  >
                    <Option value="all">Tüm Departmanlar</Option>
                    <Option value="emergency">Acil Müdahale</Option>
                    <Option value="logistics">Lojistik</Option>
                    <Option value="communication">İletişim</Option>
                    <Option value="planning">Planlama</Option>
                    <Option value="technical">Teknik Destek</Option>
                  </Select>
                </Space>
              </Space>
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Toplam Görev"
                value={1128}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Tamamlanan Görev"
                value={856}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Devam Eden Görev"
                value={272}
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card title="Görev Dağılımı">
              <BarChart />
            </Card>
          </Col>
          <Col span={12}>
            <Card title="Bölgesel Dağılım">
              <PieChart />
            </Card>
          </Col>
          <Col span={24}>
            <Card title="Görev Trendi">
              <LineChart />
            </Card>
          </Col>
        </Row>
      )
    },
    {
      key: 'tasks',
      label: (
        <span>
          <CheckCircleOutlined />
          Görev Raporları
        </span>
      ),
      children: (
        <Card>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Space>
              <Button
                type="primary"
                icon={<FilePdfOutlined />}
                onClick={handleCreatePdf}
                disabled={!pdfLibrariesLoaded}
              >
                PDF Olarak İndir
              </Button>
              <Button
                type="primary"
                icon={<FileExcelOutlined />}
                onClick={handleCreateExcel}
              >
                Excel Olarak İndir
              </Button>
              <Button
                icon={<PrinterOutlined />}
                onClick={handlePrint}
              >
                Yazdır
              </Button>
            </Space>
            <Table
              columns={taskColumns}
              dataSource={generateTasksData()}
              scroll={{ x: 1500 }}
            />
          </Space>
        </Card>
      )
    },
    {
      key: 'personnel',
      label: (
        <span>
          <TeamOutlined />
          Personel Raporları
        </span>
      ),
      children: (
        <Card>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Space>
              <Button
                type="primary"
                icon={<FilePdfOutlined />}
                onClick={handleCreatePdf}
                disabled={!pdfLibrariesLoaded}
              >
                PDF Olarak İndir
              </Button>
              <Button
                type="primary"
                icon={<FileExcelOutlined />}
                onClick={handleCreateExcel}
              >
                Excel Olarak İndir
              </Button>
              <Button
                icon={<PrinterOutlined />}
                onClick={handlePrint}
              >
                Yazdır
              </Button>
            </Space>
            <Table
              columns={personnelColumns}
              dataSource={generatePersonnelTableData()}
              scroll={{ x: 1500 }}
            />
          </Space>
        </Card>
      )
    },
    {
      key: 'regions',
      label: (
        <span>
          <EnvironmentOutlined />
          Bölgesel Raporlar
        </span>
      ),
      children: (
        <Card>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Space>
              <Button
                type="primary"
                icon={<FilePdfOutlined />}
                onClick={handleCreatePdf}
                disabled={!pdfLibrariesLoaded}
              >
                PDF Olarak İndir
              </Button>
              <Button
                type="primary"
                icon={<FileExcelOutlined />}
                onClick={handleCreateExcel}
              >
                Excel Olarak İndir
              </Button>
              <Button
                icon={<PrinterOutlined />}
                onClick={handlePrint}
              >
                Yazdır
              </Button>
            </Space>
            <Table
              columns={regionColumns}
              dataSource={generateRegionTableData()}
              scroll={{ x: 1500 }}
            />
          </Space>
        </Card>
      )
    }
  ];

  return (
    <div>
      <Title level={2}>Raporlar</Title>
      <Divider />
      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        items={tabItems}
      />
      <Modal
        title="Yazdırma Önizleme"
        open={printModalVisible}
        onCancel={() => setPrintModalVisible(false)}
        width={1000}
        footer={[
          <Button key="cancel" onClick={() => setPrintModalVisible(false)}>
            İptal
          </Button>,
          <Button
            key="print"
            type="primary"
            icon={<PrinterOutlined />}
            onClick={() => window.print()}
          >
            Yazdır
          </Button>
        ]}
      >
        <div id="print-content">
          <Table
            columns={printColumns}
            dataSource={printData}
            pagination={false}
          />
        </div>
      </Modal>
    </div>
  );
};

export default ReportsPage; 