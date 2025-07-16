'use client';

import { useEffect, useState } from 'react';
import { Card, Col, Row, Typography, Statistic, Table, Button, DatePicker, Space, Select } from 'antd';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { WarehouseService } from '@/lib/services';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

interface WarehouseReport {
  id: string;
  name: string;
  totalStock: number;
  totalValue: number;
  lowStockItems: number;
  expiredItems: number;
  utilizationRate: number;
}

interface StockMovement {
  id: string;
  date: string;
  type: string;
  itemName: string;
  quantity: number;
  unit: string;
  source: string;
  destination: string;
}

const WarehouseReports = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<WarehouseReport[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [dateRange, setDateRange] = useState<[Date, Date] | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('');
  const [warehouses, setWarehouses] = useState<{ id: string; name: string }[]>([]);
  const [summary, setSummary] = useState({
    totalWarehouses: 0,
    totalStock: 0,
    totalValue: 0,
    utilizationRate: 0,
  });

  useEffect(() => {
    fetchWarehouses();
    fetchReports();
    fetchMovements();
  }, [dateRange, selectedWarehouse]);

  const fetchWarehouses = async () => {
    try {
      const response = await axios.get('/api/warehouse');
      setWarehouses(response.data);
    } catch (error) {
      console.error('Depolar yüklenirken hata:', error);
    }
  };

  const fetchReports = async () => {
    try {
      const service = new WarehouseService();
      const reports = await service.getReports({});
      setReports(reports);

      // Özet istatistikleri hesapla
      const totalWarehouses = reports.length;
      const totalStock = reports.reduce((sum, report) => sum + report.totalStock, 0);
      const totalValue = reports.reduce((sum, report) => sum + report.totalValue, 0);
      const utilizationRate = reports.reduce((sum, report) => sum + report.utilizationRate, 0) / totalWarehouses;

      setSummary({
        totalWarehouses,
        totalStock,
        totalValue,
        utilizationRate,
      });
    } catch (error) {
      console.error('Raporlar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMovements = async () => {
    try {
      const params = new URLSearchParams();
      if (dateRange) {
        params.append('startDate', dateRange[0].toISOString());
        params.append('endDate', dateRange[1].toISOString());
      }
      if (selectedWarehouse) {
        params.append('warehouseId', selectedWarehouse);
      }

      const response = await axios.get(`/api/warehouse/reports/movements?${params}`);
      setMovements(response.data);
    } catch (error) {
      console.error('Hareketler yüklenirken hata:', error);
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (dateRange) {
        params.append('startDate', dateRange[0].toISOString());
        params.append('endDate', dateRange[1].toISOString());
      }
      if (selectedWarehouse) {
        params.append('warehouseId', selectedWarehouse);
      }

      const response = await axios.get(`/api/warehouse/reports/export?${params}`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'depo-raporu.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Rapor dışa aktarılırken hata:', error);
    }
  };

  const movementColumns = [
    {
      title: 'Tarih',
      dataIndex: 'date',
      key: 'date',
      render: (text: string) => new Date(text).toLocaleString('tr-TR'),
    },
    {
      title: 'İşlem Tipi',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        switch (type) {
          case 'IN':
            return 'Giriş';
          case 'OUT':
            return 'Çıkış';
          case 'TRANSFER':
            return 'Transfer';
          default:
            return type;
        }
      },
    },
    {
      title: 'Ürün',
      dataIndex: 'itemName',
      key: 'itemName',
    },
    {
      title: 'Miktar',
      key: 'quantity',
      render: (text: string, record: StockMovement) => `${record.quantity} ${record.unit}`,
    },
    {
      title: 'Kaynak',
      dataIndex: 'source',
      key: 'source',
    },
    {
      title: 'Hedef',
      dataIndex: 'destination',
      key: 'destination',
    },
  ];

  const columns = [
    {
      title: 'Depo Adı',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Toplam Stok',
      dataIndex: 'totalStock',
      key: 'totalStock',
      sorter: (a: any, b: any) => a.totalStock - b.totalStock,
    },
    {
      title: 'Toplam Değer',
      dataIndex: 'totalValue',
      key: 'totalValue',
      sorter: (a: any, b: any) => a.totalValue - b.totalValue,
      render: (value: number) => value.toLocaleString('tr-TR'),
    },
    {
      title: 'Doluluk Oranı',
      dataIndex: 'utilizationRate',
      key: 'utilizationRate',
      sorter: (a: any, b: any) => a.utilizationRate - b.utilizationRate,
      render: (rate: number) => `%${(rate * 100).toFixed(2)}`,
    },
    {
      title: 'Kritik Stok',
      dataIndex: 'lowStockItems',
      key: 'lowStockItems',
      render: (value: number) => (
        <Tag color={value > 0 ? 'red' : 'green'}>
          {value}
        </Tag>
      ),
    },
    {
      title: 'Son Kullanma',
      dataIndex: 'expiredItems',
      key: 'expiredItems',
      render: (value: number) => (
        <Tag color={value > 0 ? 'red' : 'green'}>
          {value}
        </Tag>
      ),
    },
    {
      title: 'İşlemler',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button type="link">Detay</Button>
          <Button type="link">Excel</Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Toplam Depo"
              value={summary.totalWarehouses}
              precision={0}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Toplam Stok"
              value={summary.totalStock}
              precision={0}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Toplam Değer"
              value={summary.totalValue}
              precision={2}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Ortalama Doluluk"
              value={summary.utilizationRate * 100}
              precision={2}
              suffix="%"
            />
          </Card>
        </Col>
      </Row>

      <Card title="Depo Raporları" className="shadow-md">
        <Table
          loading={loading}
          columns={columns}
          dataSource={reports}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Title level={3} className="mb-4">Stok Hareketleri</Title>
      <Table
        columns={movementColumns}
        dataSource={movements}
        loading={loading}
        rowKey="id"
        scroll={{ x: true }}
      />
    </div>
  );
};

export default WarehouseReports; 