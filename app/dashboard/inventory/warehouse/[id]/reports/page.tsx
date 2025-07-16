"use client";

import React, { useState, useEffect } from 'react';
import { Card, DatePicker, Select, Space, Button, Spin, Empty, message } from 'antd';
import { ArrowLeftOutlined, DownloadOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { Line, Pie, Column } from '@ant-design/charts';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

interface ReportPageProps {
  params: {
    id: string;
  };
}

const ReportPage: React.FC<ReportPageProps> = ({ params }) => {
  const router = useRouter();
  const warehouseId = params.id;
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(30, 'days'),
    dayjs()
  ]);
  const [stockData, setStockData] = useState<any[]>([]);
  const [transferData, setTransferData] = useState<any[]>([]);
  const [summaryData, setSummaryData] = useState<any>(null);

  useEffect(() => {
    fetchReportData();
  }, [warehouseId, dateRange]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      // Stok durumu raporu
      const stockResponse = await fetch(`/api/warehouse/reports?type=stock&warehouseId=${warehouseId}`);
      if (!stockResponse.ok) throw new Error('Stok raporu alınamadı');
      const stockResult = await stockResponse.json();
      setStockData(stockResult);

      // Transfer işlemleri raporu
      const transferResponse = await fetch(
        `/api/warehouse/reports?type=transfer&warehouseId=${warehouseId}&startDate=${dateRange[0].format('YYYY-MM-DD')}&endDate=${dateRange[1].format('YYYY-MM-DD')}`
      );
      if (!transferResponse.ok) throw new Error('Transfer raporu alınamadı');
      const transferResult = await transferResponse.json();
      setTransferData(transferResult);

      // Özet rapor
      const summaryResponse = await fetch(
        `/api/warehouse/reports?type=summary&warehouseId=${warehouseId}&startDate=${dateRange[0].format('YYYY-MM-DD')}&endDate=${dateRange[1].format('YYYY-MM-DD')}`
      );
      if (!summaryResponse.ok) throw new Error('Özet rapor alınamadı');
      const summaryResult = await summaryResponse.json();
      setSummaryData(summaryResult);
    } catch (error) {
      message.error('Raporlar yüklenirken bir hata oluştu');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Excel indirme fonksiyonunu ekleyelim
  const handleExcelDownload = async () => {
    try {
      const response = await fetch(
        `/api/warehouse/reports/excel?type=summary&warehouseId=${warehouseId}&startDate=${dateRange[0].format('YYYY-MM-DD')}&endDate=${dateRange[1].format('YYYY-MM-DD')}`,
        { method: 'GET' }
      );

      if (!response.ok) throw new Error('Excel raporu alınamadı');

      // Blob olarak al ve indir
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `depo_raporu_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      message.success('Excel raporu başarıyla indirildi');
    } catch (error) {
      message.error('Excel raporu indirilirken bir hata oluştu');
      console.error(error);
    }
  };

  // Stok seviyesi grafiği konfigürasyonu
  const stockLevelConfig = {
    data: stockData,
    xField: 'item_name',
    yField: 'quantity',
    seriesField: 'category',
    isGroup: true,
    columnStyle: {
      radius: [20, 20, 0, 0],
    },
  };

  // Kategori dağılımı pasta grafiği konfigürasyonu
  const categoryDistributionConfig = {
    data: summaryData?.stockByCategory || [],
    angleField: '_sum.quantity',
    colorField: 'category',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name}: {percentage}',
    },
  };

  // Transfer trendi çizgi grafiği konfigürasyonu
  const transferTrendConfig = {
    data: transferData,
    xField: 'date',
    yField: 'items.length',
    seriesField: 'type',
    point: {
      size: 5,
      shape: 'diamond',
    },
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Space>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => router.back()}
          >
            Geri
          </Button>
          <h1 className="text-2xl font-bold m-0">Depo Raporları</h1>
        </Space>
        <Space>
          <RangePicker
            value={dateRange}
            onChange={(dates) => dates && setDateRange(dates)}
          />
          <Button
            icon={<DownloadOutlined />}
            onClick={handleExcelDownload}
          >
            Excel Raporu İndir
          </Button>
        </Space>
      </div>

      <Spin spinning={loading}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="Stok Seviyeleri">
            {stockData.length > 0 ? (
              <Column {...stockLevelConfig} />
            ) : (
              <Empty description="Stok verisi bulunamadı" />
            )}
          </Card>

          <Card title="Kategori Dağılımı">
            {summaryData?.stockByCategory?.length > 0 ? (
              <Pie {...categoryDistributionConfig} />
            ) : (
              <Empty description="Kategori verisi bulunamadı" />
            )}
          </Card>

          <Card title="Transfer Trendi" className="col-span-2">
            {transferData.length > 0 ? (
              <Line {...transferTrendConfig} />
            ) : (
              <Empty description="Transfer verisi bulunamadı" />
            )}
          </Card>
        </div>
      </Spin>
    </div>
  );
};

export default ReportPage; 