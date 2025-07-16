"use client";

import React, { useState, useEffect } from 'react';
import { Card, Descriptions, Button, Table, Tag, Space, Typography, Modal, message } from 'antd';
import { ArrowLeftOutlined, PrinterOutlined, DeleteOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import TeslimTutanagi from '@/app/components/TeslimTutanagi';

const { Title } = Typography;

interface TransferDetailProps {
  params: {
    id: string;
    transferId: string;
  };
}

const TransferDetailPage: React.FC<TransferDetailProps> = ({ params }) => {
  const router = useRouter();
  const [transfer, setTransfer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showTutanak, setShowTutanak] = useState(false);

  useEffect(() => {
    fetchTransferDetail();
  }, []);

  const fetchTransferDetail = async () => {
    try {
      const response = await fetch(`/api/warehouse/transfer/${params.transferId}`);
      if (!response.ok) throw new Error('Transfer detayı alınamadı');
      const data = await response.json();
      setTransfer(data);
    } catch (error) {
      message.error('Transfer detayı yüklenirken bir hata oluştu');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/warehouse/transfer/${params.transferId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error('Durum güncellenemedi');
      
      const updatedTransfer = await response.json();
      setTransfer(updatedTransfer);
      message.success('Transfer durumu güncellendi');
    } catch (error) {
      message.error('Durum güncellenirken bir hata oluştu');
      console.error(error);
    }
  };

  const handleDelete = async () => {
    Modal.confirm({
      title: 'Transfer Silme',
      content: 'Bu transfer kaydını silmek istediğinizden emin misiniz?',
      okText: 'Evet',
      cancelText: 'Hayır',
      onOk: async () => {
        try {
          const response = await fetch(`/api/warehouse/transfer/${params.transferId}`, {
            method: 'DELETE'
          });

          if (!response.ok) throw new Error('Transfer silinemedi');
          
          message.success('Transfer başarıyla silindi');
          router.back();
        } catch (error) {
          message.error('Transfer silinirken bir hata oluştu');
          console.error(error);
        }
      }
    });
  };

  if (loading) return <div>Yükleniyor...</div>;
  if (!transfer) return <div>Transfer bulunamadı</div>;

  const itemColumns = [
    { title: 'Öğe Adı', dataIndex: ['inventory', 'item_name'], key: 'name',
      render: (text: string, record: any) => record.inventory?.item_name || record.equipment?.name },
    { title: 'Tür', dataIndex: 'type', key: 'type',
      render: (_: any, record: any) => record.inventory ? 'Envanter' : 'Ekipman' },
    { title: 'Miktar', dataIndex: 'quantity', key: 'quantity' },
    { title: 'Birim', dataIndex: ['inventory', 'unit'], key: 'unit',
      render: (text: string, record: any) => record.inventory?.unit || 'Adet' },
    { title: 'Notlar', dataIndex: 'notes', key: 'notes' }
  ];

  const statusColors = {
    PENDING: 'processing',
    COMPLETED: 'success',
    CANCELLED: 'error'
  };

  return (
    <div className="p-6">
      {!showTutanak ? (
        <>
          <div className="flex justify-between items-center mb-6">
            <Space>
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => router.back()}
              >
                Geri
              </Button>
              <Title level={2} style={{ margin: 0 }}>Transfer Detayı</Title>
            </Space>
            <Space>
              <Button
                icon={<PrinterOutlined />}
                onClick={() => setShowTutanak(true)}
              >
                Tutanak Görüntüle
              </Button>
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={handleDelete}
              >
                Sil
              </Button>
            </Space>
          </div>

          <Card className="mb-6">
            <Descriptions title="Transfer Bilgileri" bordered>
              <Descriptions.Item label="Transfer Tipi">
                <Tag color={transfer.type === 'ENTRY' ? 'green' : 'orange'}>
                  {transfer.type === 'ENTRY' ? 'Giriş' : 'Çıkış'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Tarih">
                {new Date(transfer.date).toLocaleString('tr-TR')}
              </Descriptions.Item>
              <Descriptions.Item label="Durum">
                <Tag color={statusColors[transfer.status as keyof typeof statusColors]}>
                  {transfer.status === 'PENDING' ? 'Bekliyor' :
                   transfer.status === 'COMPLETED' ? 'Tamamlandı' : 'İptal Edildi'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Depo">{transfer.warehouse.name}</Descriptions.Item>
              <Descriptions.Item label="Teslim Eden">{transfer.issuedBy.name}</Descriptions.Item>
              <Descriptions.Item label="Teslim Alan">{transfer.receivedBy.name}</Descriptions.Item>
              <Descriptions.Item label="Açıklama" span={3}>
                {transfer.description || '-'}
              </Descriptions.Item>
            </Descriptions>

            {transfer.status === 'PENDING' && (
              <div className="mt-4">
                <Space>
                  <Button type="primary" onClick={() => handleStatusChange('COMPLETED')}>
                    Tamamlandı Olarak İşaretle
                  </Button>
                  <Button danger onClick={() => handleStatusChange('CANCELLED')}>
                    İptal Et
                  </Button>
                </Space>
              </div>
            )}
          </Card>

          <Card title="Transfer Öğeleri">
            <Table
              columns={itemColumns}
              dataSource={transfer.items}
              rowKey="id"
              pagination={false}
            />
          </Card>
        </>
      ) : (
        <>
          <Button 
            onClick={() => setShowTutanak(false)} 
            style={{ marginBottom: 16 }}
          >
            Detaylara Geri Dön
          </Button>
          <TeslimTutanagi
            taskName={`${transfer.type === 'ENTRY' ? 'Giriş' : 'Çıkış'} İşlemi`}
            taskId={transfer.id}
            teamLead={{
              id: transfer.receivedBy.id,
              name: transfer.receivedBy.name,
              role: transfer.receivedBy.role,
              department: 'Lojistik'
            }}
            equipment={transfer.items.filter((item: any) => item.equipment).map((item: any) => ({
              id: item.equipment.id,
              name: item.equipment.name,
              type: 'Ekipman',
              quantity: item.quantity,
              serialNumber: item.equipment.serialNumber
            }))}
            inventory={transfer.items.filter((item: any) => item.inventory).map((item: any) => ({
              id: item.inventory.id,
              name: item.inventory.item_name,
              type: 'Envanter',
              quantity: item.quantity,
              unit: item.inventory.unit
            }))}
            issuedBy={transfer.issuedBy.name}
            issuedDate={new Date(transfer.date).toLocaleString('tr-TR')}
          />
        </>
      )}
    </div>
  );
};

export default TransferDetailPage; 