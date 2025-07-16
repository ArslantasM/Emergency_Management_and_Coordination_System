"use client";

import React, { memo } from 'react';
import { Card, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;

interface EarthquakeData {
  id: string;
  date: string;
  magnitude: number;
  depth: number;
  location: string;
  source: string;
  latitude: number;
  longitude: number;
}

interface Props {
  data: EarthquakeData[];
  loading: boolean;
}

const getMagnitudeColor = (magnitude: number): string => {
  if (magnitude >= 6) return 'red';
  if (magnitude >= 5) return 'orange';
  if (magnitude >= 4) return 'gold';
  return 'green';
};

const columns: ColumnsType<EarthquakeData> = [
  {
    title: 'Tarih',
    dataIndex: 'date',
    key: 'date',
    render: (date: string) => new Date(date).toLocaleString('tr-TR'),
    sorter: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  },
  {
    title: 'Büyüklük',
    dataIndex: 'magnitude',
    key: 'magnitude',
    render: (magnitude: number) => (
      <Tag color={getMagnitudeColor(magnitude)}>
        {magnitude.toFixed(1)}
      </Tag>
    ),
    sorter: (a, b) => a.magnitude - b.magnitude,
  },
  {
    title: 'Derinlik',
    dataIndex: 'depth',
    key: 'depth',
    render: (depth: number) => `${depth.toFixed(1)} km`,
    sorter: (a, b) => a.depth - b.depth,
  },
  {
    title: 'Konum',
    dataIndex: 'location',
    key: 'location',
    ellipsis: true,
  },
  {
    title: 'Kaynak',
    dataIndex: 'source',
    key: 'source',
    filters: [
      { text: 'AFAD', value: 'AFAD' },
      { text: 'Kandilli', value: 'Kandilli' },
      { text: 'USGS', value: 'USGS' },
      { text: 'EMSC', value: 'EMSC' },
    ],
    onFilter: (value, record) => record.source === value,
  },
];

const EarthquakeTable: React.FC<Props> = memo(({ data, loading }) => {
  return (
    <Card 
      title={<Title level={4}>Son Depremler</Title>}
      className="h-full"
    >
      <Table<EarthquakeData>
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey="id"
        size="small"
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `Toplam ${total} kayıt`,
          pageSizeOptions: ['10', '20', '50'],
        }}
        scroll={{ y: 'calc(100vh - 450px)' }}
      />
    </Card>
  );
});

EarthquakeTable.displayName = 'EarthquakeTable';

export default EarthquakeTable; 