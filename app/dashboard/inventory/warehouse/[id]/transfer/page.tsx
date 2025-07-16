"use client";

import React, { useState, useEffect } from 'react';
import { Card, Tabs, Button, Form, Select, InputNumber, DatePicker, Input, Space, Table, Tag } from 'antd';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';
import TeslimTutanagi from '@/app/components/TeslimTutanagi';
import dayjs from 'dayjs';

const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

interface TransferFormData {
  type: 'ENTRY' | 'EXIT';
  date: Date;
  description?: string;
  issuedById: string;
  receivedById: string;
  items: {
    id: string;
    type: 'inventory' | 'equipment';
    quantity: number;
    notes?: string;
  }[];
}

const WarehouseTransferPage = ({ params }: { params: { id: string } }) => {
  const [form] = Form.useForm();
  const [transferType, setTransferType] = useState<'ENTRY' | 'EXIT'>('ENTRY');
  const [showTutanak, setShowTutanak] = useState(false);
  const [tutanakData, setTutanakData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Örnek veri - gerçek uygulamada API'den gelecek
  const inventoryItems = [
    { id: '1', name: 'Battaniye', category: 'Barınma', unit: 'adet' },
    { id: '2', name: 'Su', category: 'Gıda', unit: 'litre' },
  ];

  const equipmentItems = [
    { id: '1', name: 'Jeneratör', type: 'Elektrik', serialNumber: 'GEN-001' },
    { id: '2', name: 'Çadır', type: 'Barınma', serialNumber: 'TENT-001' },
  ];

  const personnel = [
    { id: '1', name: 'Ahmet Yılmaz', role: 'Depo Sorumlusu' },
    { id: '2', name: 'Mehmet Demir', role: 'Saha Görevlisi' },
  ];

  const handleTransferSubmit = async (values: TransferFormData) => {
    setLoading(true);
    try {
      // API çağrısı yapılacak
      console.log('Transfer verileri:', values);

      // Teslim tutanağı verilerini hazırla
      const tutanakItems = values.items.map(item => {
        const itemDetails = item.type === 'inventory' 
          ? inventoryItems.find(i => i.id === item.id)
          : equipmentItems.find(i => i.id === item.id);

        return {
          id: item.id,
          name: itemDetails?.name || '',
          type: item.type === 'inventory' ? 'Envanter' : 'Ekipman',
          quantity: item.quantity,
          serialNumber: item.type === 'equipment' ? (itemDetails as any)?.serialNumber : undefined,
          unit: item.type === 'inventory' ? (itemDetails as any)?.unit : 'adet',
        };
      });

      const receivingPerson = personnel.find(p => p.id === values.receivedById);
      const issuingPerson = personnel.find(p => p.id === values.issuedById);

      setTutanakData({
        taskName: `${transferType === 'ENTRY' ? 'Giriş' : 'Çıkış'} İşlemi`,
        taskId: `TRF-${Date.now()}`,
        teamLead: {
          id: receivingPerson?.id || '',
          name: receivingPerson?.name || '',
          role: receivingPerson?.role || '',
          department: 'Lojistik',
        },
        equipment: tutanakItems.filter(item => item.type === 'Ekipman'),
        inventory: tutanakItems.filter(item => item.type === 'Envanter'),
        issuedBy: issuingPerson?.name || '',
        issuedDate: dayjs(values.date).format('YYYY-MM-DD HH:mm'),
      });

      setShowTutanak(true);
    } catch (error) {
      console.error('Transfer hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      {!showTutanak ? (
        <Card title={`Depo ${transferType === 'ENTRY' ? 'Giriş' : 'Çıkış'} İşlemi`}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleTransferSubmit}
            initialValues={{
              type: transferType,
              date: dayjs(),
            }}
          >
            <Tabs
              activeKey={transferType}
              onChange={(key) => setTransferType(key as 'ENTRY' | 'EXIT')}
            >
              <TabPane tab="Giriş İşlemi" key="ENTRY" />
              <TabPane tab="Çıkış İşlemi" key="EXIT" />
            </Tabs>

            <Form.Item name="date" label="Tarih" rules={[{ required: true }]}>
              <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item name="description" label="Açıklama">
              <TextArea rows={4} />
            </Form.Item>

            <Form.List name="items">
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field, index) => (
                    <Card key={field.key} style={{ marginBottom: 16 }}>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Form.Item
                          {...field}
                          name={[field.name, 'type']}
                          label="Öğe Tipi"
                          rules={[{ required: true }]}
                        >
                          <Select>
                            <Option value="inventory">Envanter</Option>
                            <Option value="equipment">Ekipman</Option>
                          </Select>
                        </Form.Item>

                        <Form.Item
                          {...field}
                          name={[field.name, 'id']}
                          label="Öğe"
                          rules={[{ required: true }]}
                        >
                          <Select>
                            {Form.useWatch([field.name, 'type'], form) === 'inventory'
                              ? inventoryItems.map(item => (
                                  <Option key={item.id} value={item.id}>
                                    {item.name} ({item.category})
                                  </Option>
                                ))
                              : equipmentItems.map(item => (
                                  <Option key={item.id} value={item.id}>
                                    {item.name} - {item.serialNumber}
                                  </Option>
                                ))
                            }
                          </Select>
                        </Form.Item>

                        <Form.Item
                          {...field}
                          name={[field.name, 'quantity']}
                          label="Miktar"
                          rules={[{ required: true }]}
                        >
                          <InputNumber min={1} style={{ width: '100%' }} />
                        </Form.Item>

                        <Form.Item
                          {...field}
                          name={[field.name, 'notes']}
                          label="Notlar"
                        >
                          <Input />
                        </Form.Item>

                        <Button type="link" danger onClick={() => remove(field.name)}>
                          Öğeyi Kaldır
                        </Button>
                      </Space>
                    </Card>
                  ))}

                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                    >
                      Öğe Ekle
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>

            <Form.Item name="issuedById" label="Teslim Eden" rules={[{ required: true }]}>
              <Select>
                {personnel.map(person => (
                  <Option key={person.id} value={person.id}>
                    {person.name} ({person.role})
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="receivedById" label="Teslim Alan" rules={[{ required: true }]}>
              <Select>
                {personnel.map(person => (
                  <Option key={person.id} value={person.id}>
                    {person.name} ({person.role})
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                Teslim Tutanağı Oluştur
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ) : (
        <>
          <Button 
            onClick={() => setShowTutanak(false)} 
            style={{ marginBottom: 16 }}
          >
            Forma Geri Dön
          </Button>
          <TeslimTutanagi {...tutanakData} />
        </>
      )}
    </div>
  );
};

export default WarehouseTransferPage; 