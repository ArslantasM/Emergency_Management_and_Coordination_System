"use client";

import React from 'react';
import { 
  Button, 
  Card, 
  Divider, 
  Typography, 
  Row, 
  Col, 
  Table, 
  Tag, 
  Space,
  Input,
  Form,
  Image,
  Flex
} from 'antd';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import dayjs from 'dayjs';
import { PrinterOutlined, DownloadOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

type TeslimTutanagiProps = {
  taskName: string;
  taskId: string;
  teamLead: {
    id: string;
    name: string;
    role: string;
    department: string;
  };
  equipment?: {
    id: string;
    name: string;
    type: string;
    quantity: number;
    serialNumber?: string;
  }[];
  inventory?: {
    id: string;
    name: string;
    category: string;
    quantity: number;
    unit: string;
  }[];
  issuedBy: string;
  issuedDate: string;
};

const TeslimTutanagi: React.FC<TeslimTutanagiProps> = ({
  taskName,
  taskId,
  teamLead,
  equipment = [],
  inventory = [],
  issuedBy,
  issuedDate
}) => {
  const printRef = React.useRef<HTMLDivElement>(null);

  // Yazdırma işlemi
  const handlePrint = () => {
    if (printRef.current) {
      const printContents = printRef.current.innerHTML;
      const originalContents = document.body.innerHTML;
      
      document.body.innerHTML = printContents;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload();
    }
  };

  // PDF indirme işlemi
  const handleDownloadPdf = async () => {
    try {
      // PDF oluştur
      const doc = new jsPDF();
      
      // Başlık ve genel bilgiler
      doc.setFontSize(16);
      doc.text('EKİPMAN VE ENVANTER TESLİM TUTANAĞI', 105, 20, { align: 'center' });
      
      doc.setFontSize(11);
      doc.text(`Görev: ${taskName}`, 15, 35);
      doc.text(`Görev ID: ${taskId}`, 15, 42);
      doc.text(`Tarih: ${issuedDate}`, 15, 49);
      
      doc.text('Teslim Alan:', 15, 60);
      doc.text(`Ad Soyad: ${teamLead.name}`, 25, 67);
      doc.text(`Pozisyon: ${teamLead.role}`, 25, 74);
      doc.text(`Birim: ${teamLead.department}`, 25, 81);
      
      // Ekipman tablosu
      if (equipment.length > 0) {
        doc.text('TESLİM EDİLEN EKİPMANLAR', 15, 95);
        
        const equipmentHeaders = [['Ekipman Adı', 'Tür', 'Seri No', 'Miktar']];
        const equipmentRows = equipment.map(item => [
          item.name,
          item.type,
          item.serialNumber || '-',
          `${item.quantity} adet`
        ]);
        
        const autoTable = (await import('jspdf-autotable')).default;
        autoTable(doc, {
          startY: 100,
          head: equipmentHeaders,
          body: equipmentRows,
          theme: 'grid',
          styles: { fontSize: 9 },
          headStyles: { fillColor: [41, 128, 185], textColor: 255 }
        });
      }
      
      // Envanter tablosu
      if (inventory.length > 0) {
        const lastAutoTable = doc.lastAutoTable;
        const inventoryStartY = lastAutoTable ? lastAutoTable.finalY + 15 : 100;
        
        doc.text('TESLİM EDİLEN ENVANTER ÖĞELERİ', 15, inventoryStartY);
        
        const inventoryHeaders = [['Ürün Adı', 'Kategori', 'Miktar']];
        const inventoryRows = inventory.map(item => [
          item.name,
          item.category,
          `${item.quantity} ${item.unit}`
        ]);
        
        const autoTable = (await import('jspdf-autotable')).default;
        autoTable(doc, {
          startY: inventoryStartY + 5,
          head: inventoryHeaders,
          body: inventoryRows,
          theme: 'grid',
          styles: { fontSize: 9 },
          headStyles: { fillColor: [41, 128, 185], textColor: 255 }
        });
      }
      
      // İmza alanları
      const lastAutoTable = doc.lastAutoTable;
      const signatureY = lastAutoTable ? lastAutoTable.finalY + 30 : 160;
      
      doc.text('Teslim Eden:', 40, signatureY);
      doc.text('Teslim Alan:', 160, signatureY);
      
      doc.text(`Ad Soyad: ${issuedBy}`, 40, signatureY + 10);
      doc.text(`Ad Soyad: ${teamLead.name}`, 160, signatureY + 10);
      
      doc.text('İmza: ________________', 40, signatureY + 25);
      doc.text('İmza: ________________', 160, signatureY + 25);
      
      // Alt bilgi
      const pageCount = doc.internal.getNumberOfPages();
      doc.setFontSize(8);
      
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        const footerText = "Bu rapor Acil Durum Yönetim ve Koordinasyon Sistemi tarafından otomatik olarak oluşturulmuştur.";
        const copyrightText = "© 2025 Acil Durum Yönetim ve Koordinasyon Sistemi / DEPAR";
        const pageWidth = doc.internal.pageSize.width;
        
        doc.text(footerText, pageWidth / 2, doc.internal.pageSize.height - 10, { align: 'center' });
        doc.text(copyrightText, pageWidth / 2, doc.internal.pageSize.height - 5, { align: 'center' });
      }
      
      // PDF'i kaydet
      doc.save(`Teslim_Tutanagi_${taskId}_${dayjs().format('YYYYMMDD')}.pdf`);
    } catch (error) {
      console.error('PDF oluşturma hatası:', error);
    }
  };

  return (
    <div>
      <Card 
        title="Ekipman ve Envanter Teslim Tutanağı" 
        extra={
          <Space>
            <Button icon={<PrinterOutlined />} onClick={handlePrint}>Yazdır</Button>
            <Button icon={<DownloadOutlined />} type="primary" onClick={handleDownloadPdf}>PDF İndir</Button>
          </Space>
        }
      >
        <div ref={printRef}>
          <div style={{ padding: '20px' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <Title level={3}>EKİPMAN VE ENVANTER TESLİM TUTANAĞI</Title>
            </div>
            
            <Row gutter={16}>
              <Col span={12}>
                <Paragraph>
                  <Text strong>Görev: </Text>{taskName}
                </Paragraph>
                <Paragraph>
                  <Text strong>Görev ID: </Text>{taskId}
                </Paragraph>
                <Paragraph>
                  <Text strong>Tarih: </Text>{issuedDate}
                </Paragraph>
              </Col>
            </Row>
            
            <Divider />
            
            <Row gutter={16}>
              <Col span={24}>
                <Title level={4}>Teslim Alan</Title>
                <Paragraph>
                  <Text strong>Ad Soyad: </Text>{teamLead.name}
                </Paragraph>
                <Paragraph>
                  <Text strong>Pozisyon: </Text>{teamLead.role}
                </Paragraph>
                <Paragraph>
                  <Text strong>Birim: </Text>{teamLead.department}
                </Paragraph>
              </Col>
            </Row>
            
            <Divider />
            
            {equipment.length > 0 && (
              <>
                <Title level={4}>Teslim Edilen Ekipmanlar</Title>
                <Table 
                  dataSource={equipment}
                  rowKey="id"
                  pagination={false}
                  columns={[
                    { title: 'Ekipman Adı', dataIndex: 'name', key: 'name' },
                    { 
                      title: 'Tür', 
                      dataIndex: 'type', 
                      key: 'type',
                      render: (type) => <Tag color="blue">{type}</Tag>
                    },
                    { 
                      title: 'Seri No', 
                      dataIndex: 'serialNumber', 
                      key: 'serialNumber',
                      render: (serialNo) => serialNo || '-'
                    },
                    { 
                      title: 'Miktar', 
                      dataIndex: 'quantity', 
                      key: 'quantity',
                      render: (quantity) => `${quantity} adet`
                    }
                  ]}
                />
              </>
            )}
            
            {inventory.length > 0 && (
              <>
                <Divider />
                <Title level={4}>Teslim Edilen Envanter Öğeleri</Title>
                <Table 
                  dataSource={inventory}
                  rowKey="id"
                  pagination={false}
                  columns={[
                    { title: 'Ürün Adı', dataIndex: 'name', key: 'name' },
                    { 
                      title: 'Kategori', 
                      dataIndex: 'category', 
                      key: 'category',
                      render: (category) => <Tag color="green">{category}</Tag>
                    },
                    { 
                      title: 'Miktar', 
                      dataIndex: 'quantity', 
                      key: 'quantity',
                      render: (quantity, record) => `${quantity} ${record.unit}`
                    }
                  ]}
                />
              </>
            )}
            
            <div style={{ marginTop: '40px' }}>
              <Paragraph>
                Yukarıda belirtilen ekipman ve envanter öğelerini eksiksiz teslim aldım. Görev sonunda bu malzemeleri 
                eksiksiz olarak iade etmeyi, hasarlanması veya kaybolması durumunda ilgili prosedürlere uygun olarak 
                bildirimde bulunacağımı beyan ve taahhüt ederim.
              </Paragraph>
            </div>
            
            <div style={{ marginTop: '40px' }}>
              <Flex justify="space-between">
                <div style={{ width: '40%' }}>
                  <Title level={5}>Teslim Eden:</Title>
                  <Paragraph>
                    <Text strong>Ad Soyad: </Text>{issuedBy}
                  </Paragraph>
                  <div style={{ marginTop: '20px', borderTop: '1px solid #000' }}>
                    <Text>İmza</Text>
                  </div>
                </div>
                
                <div style={{ width: '40%' }}>
                  <Title level={5}>Teslim Alan:</Title>
                  <Paragraph>
                    <Text strong>Ad Soyad: </Text>{teamLead.name}
                  </Paragraph>
                  <div style={{ marginTop: '20px', borderTop: '1px solid #000' }}>
                    <Text>İmza</Text>
                  </div>
                </div>
              </Flex>
            </div>
            
            <Divider />
            
            <div style={{ textAlign: 'center', marginTop: '30px', fontSize: '10px' }}>
              <p>Bu rapor Acil Durum Yönetim ve Koordinasyon Sistemi tarafından otomatik olarak oluşturulmuştur.</p>
              <p>© 2025 Acil Durum Yönetim ve Koordinasyon Sistemi / DEPAR</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TeslimTutanagi; 